'use server'

import { revalidatePath } from 'next/cache'
import { createClient, getUser } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import type { ActionResult } from './onboarding'

/**
 * Coach actions for the Leadership Development app.
 * These actions are restricted to users with the coach role.
 */

/**
 * Validates a URL format.
 * @param url - The URL to validate
 * @returns true if valid HTTPS URL, false otherwise
 */
function isValidHttpsUrl(url: string): boolean {
  try {
    const parsed = new URL(url)
    return parsed.protocol === 'https:'
  } catch {
    return false
  }
}

/**
 * Updates a client's Padlet URL.
 * Only coaches can update this field for any client.
 *
 * @param clientId - The client's user ID
 * @param padletUrl - The Padlet URL (or null/empty to remove)
 * @returns ActionResult with success/error status
 */
export async function updateClientPadletUrl(
  clientId: string,
  padletUrl: string | null
): Promise<ActionResult> {
  try {
    // Validate client ID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(clientId)) {
      return { success: false, error: 'Invalid client ID' }
    }

    // Normalize empty string to null
    const normalizedUrl = padletUrl?.trim() || null

    // Validate URL format if provided
    if (normalizedUrl) {
      if (normalizedUrl.length > 2048) {
        return { success: false, error: 'URL is too long (max 2048 characters)' }
      }
      if (!isValidHttpsUrl(normalizedUrl)) {
        return { success: false, error: 'Please enter a valid HTTPS URL' }
      }
    }

    // Get authenticated user
    const user = await getUser()
    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    const supabase = await createClient()

    // Verify user is a coach
    const { data: coachUser, error: coachError } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (coachError || !coachUser) {
      return { success: false, error: 'Failed to verify permissions' }
    }

    if (coachUser.role !== 'coach') {
      return { success: false, error: 'Only coaches can update client Padlet links' }
    }

    // Verify the target is a client (not a coach)
    const { data: clientUser, error: clientError } = await supabase
      .from('users')
      .select('role')
      .eq('id', clientId)
      .single()

    if (clientError || !clientUser) {
      return { success: false, error: 'Client not found' }
    }

    if (clientUser.role !== 'client') {
      return { success: false, error: 'Can only update Padlet links for clients' }
    }

    // Update the client's padlet_url using admin client (bypasses RLS)
    // This is necessary because RLS only allows users to update their own row
    const adminClient = createAdminClient()
    console.log('[PADLET_DEBUG] Attempting update:', { clientId, normalizedUrl })

    const { data: updateData, error: updateError } = await adminClient
      .from('users')
      .update({ padlet_url: normalizedUrl })
      .eq('id', clientId)
      .select('padlet_url')

    console.log('[PADLET_DEBUG] Update result:', { updateData, updateError })

    if (updateError) {
      console.error('[PADLET_DEBUG] Error updating padlet_url:', updateError)
      return { success: false, error: 'Failed to update Padlet link' }
    }

    // Revalidate the coach client detail page
    revalidatePath(`/coach/client/${clientId}`)

    return { success: true }
  } catch (err) {
    if (err instanceof Error) {
      return { success: false, error: err.message }
    }
    return { success: false, error: 'An unexpected error occurred' }
  }
}
