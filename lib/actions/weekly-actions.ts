'use server'

import { revalidatePath } from 'next/cache'
import { createClient, getUser } from '@/lib/supabase/server'
import {
  toggleActionCompleteSchema,
  type ToggleActionCompleteInput,
} from '@/lib/validations/schemas'
import type { ActionResult } from './onboarding'

/**
 * Toggles the completion status of a weekly action.
 *
 * @param input - Contains actionId and isCompleted boolean
 * @returns ActionResult with success/error status
 *
 * Security: Verifies the action belongs to the authenticated user via RLS.
 *
 * Usage:
 * ```tsx
 * const result = await toggleActionComplete({
 *   actionId: '...',
 *   isCompleted: true
 * })
 * if (result.success) {
 *   // Action marked as complete
 * }
 * ```
 */
export async function toggleActionComplete(
  input: ToggleActionCompleteInput
): Promise<ActionResult> {
  try {
    // Validate input
    const validated = toggleActionCompleteSchema.parse(input)

    // Get authenticated user
    const user = await getUser()
    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    // Get Supabase client
    const supabase = await createClient()

    // Update action (RLS ensures user can only update their own actions)
    const { error, count } = await supabase
      .from('weekly_actions')
      .update({ is_completed: validated.isCompleted })
      .eq('id', validated.actionId)
      .eq('user_id', user.id) // Extra safety check

    if (error) {
      console.error('Error toggling action:', error)
      return { success: false, error: 'Failed to update action' }
    }

    if (count === 0) {
      return { success: false, error: 'Action not found or not authorized' }
    }

    // Revalidate the client home page to reflect changes
    revalidatePath('/client/home')

    return { success: true }
  } catch (err) {
    if (err instanceof Error) {
      return { success: false, error: err.message }
    }
    return { success: false, error: 'An unexpected error occurred' }
  }
}

/**
 * Adds a new weekly action for the authenticated user.
 *
 * @param actionText - The action text
 * @returns ActionResult with the new action ID
 *
 * Usage:
 * ```tsx
 * const result = await addWeeklyAction('Complete the report')
 * if (result.success) {
 *   console.log('Added action:', result.data.id)
 * }
 * ```
 */
export async function addWeeklyAction(
  actionText: string
): Promise<ActionResult<{ id: string }>> {
  try {
    // Validate
    if (!actionText || actionText.trim().length === 0) {
      return { success: false, error: 'Action text is required' }
    }
    if (actionText.length > 500) {
      return { success: false, error: 'Action must be less than 500 characters' }
    }

    // Get authenticated user
    const user = await getUser()
    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    // Get Supabase client
    const supabase = await createClient()

    // Insert new action
    const { data, error } = await supabase
      .from('weekly_actions')
      .insert({
        user_id: user.id,
        action_text: actionText.trim(),
        is_completed: false,
      })
      .select('id')
      .single()

    if (error) {
      console.error('Error adding action:', error)
      return { success: false, error: 'Failed to add action' }
    }

    // Revalidate the client home page
    revalidatePath('/client/home')

    return { success: true, data: { id: data.id } }
  } catch (err) {
    if (err instanceof Error) {
      return { success: false, error: err.message }
    }
    return { success: false, error: 'An unexpected error occurred' }
  }
}

/**
 * Deletes a weekly action for the authenticated user.
 *
 * @param actionId - The action ID to delete
 * @returns ActionResult with success/error status
 *
 * Usage:
 * ```tsx
 * const result = await deleteWeeklyAction('...')
 * ```
 */
export async function deleteWeeklyAction(
  actionId: string
): Promise<ActionResult> {
  try {
    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(actionId)) {
      return { success: false, error: 'Invalid action ID' }
    }

    // Get authenticated user
    const user = await getUser()
    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    // Get Supabase client
    const supabase = await createClient()

    // Delete action (RLS ensures user can only delete their own)
    const { error, count } = await supabase
      .from('weekly_actions')
      .delete()
      .eq('id', actionId)
      .eq('user_id', user.id) // Extra safety check

    if (error) {
      console.error('Error deleting action:', error)
      return { success: false, error: 'Failed to delete action' }
    }

    if (count === 0) {
      return { success: false, error: 'Action not found or not authorized' }
    }

    // Revalidate the client home page
    revalidatePath('/client/home')

    return { success: true }
  } catch (err) {
    if (err instanceof Error) {
      return { success: false, error: err.message }
    }
    return { success: false, error: 'An unexpected error occurred' }
  }
}

/**
 * Updates the text of a weekly action.
 *
 * @param actionId - The action ID to update
 * @param newText - The new action text
 * @returns ActionResult with success/error status
 */
export async function updateWeeklyActionText(
  actionId: string,
  newText: string
): Promise<ActionResult> {
  try {
    // Validate
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(actionId)) {
      return { success: false, error: 'Invalid action ID' }
    }
    if (!newText || newText.trim().length === 0) {
      return { success: false, error: 'Action text is required' }
    }
    if (newText.length > 500) {
      return { success: false, error: 'Action must be less than 500 characters' }
    }

    // Get authenticated user
    const user = await getUser()
    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    // Get Supabase client
    const supabase = await createClient()

    // Update action
    const { error, count } = await supabase
      .from('weekly_actions')
      .update({ action_text: newText.trim() })
      .eq('id', actionId)
      .eq('user_id', user.id)

    if (error) {
      console.error('Error updating action:', error)
      return { success: false, error: 'Failed to update action' }
    }

    if (count === 0) {
      return { success: false, error: 'Action not found or not authorized' }
    }

    // Revalidate
    revalidatePath('/client/home')

    return { success: true }
  } catch (err) {
    if (err instanceof Error) {
      return { success: false, error: err.message }
    }
    return { success: false, error: 'An unexpected error occurred' }
  }
}
