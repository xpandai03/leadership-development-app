import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

/**
 * GET /api/weekly-nudges
 *
 * Returns a list of clients who should receive weekly nudges.
 * This endpoint is called by n8n on a schedule.
 *
 * Security: Requires Authorization header with N8N_API_SECRET
 *
 * Response format:
 * {
 *   "clients": [
 *     {
 *       "client_id": "uuid",
 *       "name": "John Doe",
 *       "phone": "+1234567890",
 *       "current_theme": "Improve delegation skills",
 *       "open_actions_count": 3,
 *       "open_actions": ["Action 1", "Action 2", "Action 3"]
 *     }
 *   ],
 *   "generated_at": "2025-12-11T10:00:00Z",
 *   "total_count": 1
 * }
 */
export async function GET(request: NextRequest) {
  try {
    // Verify API secret
    const authHeader = request.headers.get('authorization')
    const expectedSecret = process.env.N8N_API_SECRET

    if (!expectedSecret) {
      console.error('N8N_API_SECRET environment variable not configured')
      return NextResponse.json(
        { error: 'Server Configuration Error', message: 'API not configured' },
        { status: 500 }
      )
    }

    // Check Bearer token
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Missing authorization header' },
        { status: 401 }
      )
    }

    const providedSecret = authHeader.substring(7) // Remove 'Bearer ' prefix

    if (providedSecret !== expectedSecret) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Invalid API secret' },
        { status: 401 }
      )
    }

    // Use admin client to bypass RLS
    const supabase = createAdminClient()

    // Get all clients who want weekly nudges
    // Join users with settings to filter by receive_weekly_nudge
    const { data: clients, error: clientsError } = await supabase
      .from('users')
      .select(`
        id,
        name,
        phone,
        settings!inner (
          receive_weekly_nudge
        )
      `)
      .eq('role', 'client')
      .eq('settings.receive_weekly_nudge', true)
      .not('phone', 'is', null)

    if (clientsError) {
      console.error('Error fetching clients for weekly nudges:', clientsError)
      return NextResponse.json(
        { error: 'Database Error', message: 'Failed to fetch clients' },
        { status: 500 }
      )
    }

    // For each client, fetch their current theme and open actions
    const clientsWithData = await Promise.all(
      (clients || []).map(async (client) => {
        // Get current theme
        const { data: theme } = await supabase
          .from('development_themes')
          .select('theme_text')
          .eq('user_id', client.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single()

        // Get open (incomplete) actions
        const { data: actions } = await supabase
          .from('weekly_actions')
          .select('action_text')
          .eq('user_id', client.id)
          .eq('is_completed', false)
          .order('created_at', { ascending: false })

        return {
          client_id: client.id,
          name: client.name,
          phone: client.phone,
          current_theme: theme?.theme_text || null,
          open_actions_count: actions?.length || 0,
          open_actions: actions?.map((a) => a.action_text) || [],
        }
      })
    )

    // Return the response
    return NextResponse.json({
      clients: clientsWithData,
      generated_at: new Date().toISOString(),
      total_count: clientsWithData.length,
    })
  } catch (error) {
    console.error('Unexpected error in weekly-nudges:', error)
    return NextResponse.json(
      { error: 'Internal Server Error', message: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/weekly-nudges/log
 *
 * Optional: Log that a weekly nudge was sent (for audit trail).
 * Can be called by n8n after sending each SMS.
 *
 * Request body:
 * {
 *   "client_id": "uuid",
 *   "message_text": "string"
 * }
 */
export async function POST(request: NextRequest) {
  try {
    // Verify API secret
    const authHeader = request.headers.get('authorization')
    const expectedSecret = process.env.N8N_API_SECRET

    if (!expectedSecret) {
      return NextResponse.json(
        { error: 'Server Configuration Error', message: 'API not configured' },
        { status: 500 }
      )
    }

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Missing authorization header' },
        { status: 401 }
      )
    }

    const providedSecret = authHeader.substring(7)

    if (providedSecret !== expectedSecret) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Invalid API secret' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { client_id, message_text } = body

    if (!client_id || !message_text) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'client_id and message_text are required' },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    // For automated nudges, we use a system coach ID or null
    // Since we need a coach_id, we'll fetch the first coach
    const { data: coach } = await supabase
      .from('users')
      .select('id')
      .eq('role', 'coach')
      .limit(1)
      .single()

    if (!coach) {
      return NextResponse.json(
        { error: 'Configuration Error', message: 'No coach found in system' },
        { status: 500 }
      )
    }

    // Insert the nudge record
    const { data: nudge, error: nudgeError } = await supabase
      .from('nudges_sent')
      .insert({
        coach_id: coach.id,
        client_id: client_id,
        message_text: `[Automated Weekly] ${message_text}`,
      })
      .select('id, sent_at')
      .single()

    if (nudgeError) {
      console.error('Error logging weekly nudge:', nudgeError)
      return NextResponse.json(
        { error: 'Database Error', message: 'Failed to log nudge' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Nudge logged successfully',
      data: {
        nudge_id: nudge.id,
        sent_at: nudge.sent_at,
      },
    })
  } catch (error) {
    console.error('Unexpected error in weekly-nudges POST:', error)
    return NextResponse.json(
      { error: 'Internal Server Error', message: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
