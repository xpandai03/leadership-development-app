import { NextRequest, NextResponse } from 'next/server'
import { getUser } from '@/lib/supabase/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient, isCoach } from '@/lib/supabase/admin'
import { sendNudgeSchema } from '@/lib/validations/schemas'

/**
 * POST /api/send-nudge
 *
 * Sends a manual nudge from coach to client.
 *
 * Request body:
 * {
 *   "clientId": "uuid",
 *   "messageText": "string"
 * }
 *
 * Flow:
 * 1. Verify authenticated user
 * 2. Verify user is a coach
 * 3. Fetch client's phone number
 * 4. Insert record into nudges_sent
 * 5. POST to n8n webhook (if configured)
 * 6. Return success/error
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Get authenticated user
    const user = await getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'You must be logged in' },
        { status: 401 }
      )
    }

    // 2. Verify user is a coach (using admin client to bypass RLS for role check)
    const userIsCoach = await isCoach(user.id)

    if (!userIsCoach) {
      return NextResponse.json(
        { error: 'Forbidden', message: 'Only coaches can send nudges' },
        { status: 403 }
      )
    }

    // Parse and validate request body
    const body = await request.json()
    const validationResult = sendNudgeSchema.safeParse({
      clientId: body.clientId,
      messageText: body.messageText,
    })

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Validation Error',
          message: validationResult.error.errors[0]?.message || 'Invalid input',
        },
        { status: 400 }
      )
    }

    const { clientId, messageText } = validationResult.data

    // 3. Fetch client's phone number using admin client
    const adminClient = createAdminClient()
    const { data: client, error: clientError } = await adminClient
      .from('users')
      .select('id, name, phone, role')
      .eq('id', clientId)
      .single()

    if (clientError || !client) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Client not found' },
        { status: 404 }
      )
    }

    if (client.role !== 'client') {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Can only send nudges to clients' },
        { status: 400 }
      )
    }

    if (!client.phone) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Client does not have a phone number' },
        { status: 400 }
      )
    }

    // 4. Insert record into nudges_sent
    const supabase = await createClient()
    const { data: nudge, error: nudgeError } = await supabase
      .from('nudges_sent')
      .insert({
        coach_id: user.id,
        client_id: clientId,
        message_text: messageText,
      })
      .select('id, sent_at')
      .single()

    if (nudgeError) {
      console.error('Error inserting nudge record:', nudgeError)
      return NextResponse.json(
        { error: 'Database Error', message: 'Failed to record nudge' },
        { status: 500 }
      )
    }

    // 5. POST to n8n webhook (if configured)
    const webhookUrl = process.env.N8N_SEND_NUDGE_WEBHOOK
    let webhookSuccess = false
    let webhookError: string | null = null

    if (webhookUrl) {
      try {
        const webhookPayload = {
          client_id: clientId,
          client_name: client.name,
          phone: client.phone,
          message_text: messageText,
          nudge_id: nudge.id,
          sent_at: nudge.sent_at,
        }

        const webhookResponse = await fetch(webhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(webhookPayload),
        })

        if (webhookResponse.ok) {
          webhookSuccess = true
        } else {
          webhookError = `Webhook returned status ${webhookResponse.status}`
          console.error('Webhook error:', webhookError)
        }
      } catch (err) {
        webhookError = err instanceof Error ? err.message : 'Unknown webhook error'
        console.error('Webhook error:', webhookError)
      }
    } else {
      // No webhook configured - log for debugging
      console.log('N8N_SEND_NUDGE_WEBHOOK not configured. Nudge recorded but not sent.')
    }

    // 6. Return success response
    return NextResponse.json({
      success: true,
      message: 'Nudge recorded successfully',
      data: {
        nudge_id: nudge.id,
        sent_at: nudge.sent_at,
        webhook_sent: webhookSuccess,
        webhook_error: webhookError,
      },
    })
  } catch (error) {
    console.error('Unexpected error in send-nudge:', error)
    return NextResponse.json(
      { error: 'Internal Server Error', message: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
