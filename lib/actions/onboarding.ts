'use server'

import { redirect } from 'next/navigation'
import { createClient, getUser } from '@/lib/supabase/server'
import {
  saveThemeSchema,
  saveProgressSchema,
  saveWeeklyActionsSchema,
  updateNudgePreferenceSchema,
  type SaveThemeInput,
  type SaveProgressInput,
  type SaveWeeklyActionsInput,
  type UpdateNudgePreferenceInput,
} from '@/lib/validations/schemas'

/**
 * Result type for server actions.
 */
export type ActionResult<T = void> =
  | { success: true; data?: T }
  | { success: false; error: string }

/**
 * Verifies that the authenticated user matches the userId parameter.
 * Throws an error if not authenticated or if userId doesn't match.
 */
async function verifyUserOwnership(userId: string): Promise<void> {
  const user = await getUser()

  if (!user) {
    throw new Error('Not authenticated')
  }

  if (user.id !== userId) {
    throw new Error('Unauthorized: Cannot modify another user\'s data')
  }
}

/**
 * Saves a development theme for the user.
 *
 * @param input - Contains userId and themeText
 * @returns ActionResult with success/error status
 *
 * Usage:
 * ```tsx
 * const result = await saveTheme({ userId: '...', themeText: 'Improve delegation' })
 * if (!result.success) console.error(result.error)
 * ```
 */
export async function saveTheme(input: SaveThemeInput): Promise<ActionResult> {
  try {
    // Validate input
    const validated = saveThemeSchema.parse(input)

    // Verify ownership
    await verifyUserOwnership(validated.userId)

    // Get Supabase client
    const supabase = await createClient()

    // Insert theme
    const { error } = await supabase.from('development_themes').insert({
      user_id: validated.userId,
      theme_text: validated.themeText,
    })

    if (error) {
      console.error('Error saving theme:', error)
      return { success: false, error: 'Failed to save theme' }
    }

    return { success: true }
  } catch (err) {
    if (err instanceof Error) {
      return { success: false, error: err.message }
    }
    return { success: false, error: 'An unexpected error occurred' }
  }
}

/**
 * Saves a progress entry for the user.
 *
 * @param input - Contains userId and text
 * @returns ActionResult with success/error status
 *
 * Usage:
 * ```tsx
 * const result = await saveProgress({ userId: '...', text: 'Made great progress today...' })
 * ```
 */
export async function saveProgress(input: SaveProgressInput): Promise<ActionResult> {
  try {
    // Validate input
    const validated = saveProgressSchema.parse(input)

    // Verify ownership
    await verifyUserOwnership(validated.userId)

    // Get Supabase client
    const supabase = await createClient()

    // Insert progress entry
    const { error } = await supabase.from('progress_entries').insert({
      user_id: validated.userId,
      text: validated.text,
    })

    if (error) {
      console.error('Error saving progress:', error)
      return { success: false, error: 'Failed to save progress entry' }
    }

    return { success: true }
  } catch (err) {
    if (err instanceof Error) {
      return { success: false, error: err.message }
    }
    return { success: false, error: 'An unexpected error occurred' }
  }
}

/**
 * Saves multiple weekly actions for the user (batch insert).
 *
 * @param input - Contains userId and array of action strings
 * @returns ActionResult with success/error status
 *
 * Usage:
 * ```tsx
 * const result = await saveWeeklyActions({
 *   userId: '...',
 *   actions: ['Action 1', 'Action 2', 'Action 3']
 * })
 * ```
 */
export async function saveWeeklyActions(
  input: SaveWeeklyActionsInput
): Promise<ActionResult> {
  try {
    // Validate input
    const validated = saveWeeklyActionsSchema.parse(input)

    // Verify ownership
    await verifyUserOwnership(validated.userId)

    // Get Supabase client
    const supabase = await createClient()

    // Prepare batch insert
    const actionsToInsert = validated.actions.map((actionText) => ({
      user_id: validated.userId,
      action_text: actionText,
      is_completed: false,
    }))

    // Insert all actions
    const { error } = await supabase.from('weekly_actions').insert(actionsToInsert)

    if (error) {
      console.error('Error saving weekly actions:', error)
      return { success: false, error: 'Failed to save weekly actions' }
    }

    return { success: true }
  } catch (err) {
    if (err instanceof Error) {
      return { success: false, error: err.message }
    }
    return { success: false, error: 'An unexpected error occurred' }
  }
}

/**
 * Updates the user's nudge preference setting.
 *
 * @param input - Contains userId and receiveWeeklyNudge boolean
 * @returns ActionResult with success/error status
 *
 * Usage:
 * ```tsx
 * const result = await updateNudgePreference({ userId: '...', receiveWeeklyNudge: true })
 * ```
 */
export async function updateNudgePreference(
  input: UpdateNudgePreferenceInput
): Promise<ActionResult> {
  try {
    // Validate input
    const validated = updateNudgePreferenceSchema.parse(input)

    // Verify ownership
    await verifyUserOwnership(validated.userId)

    // Get Supabase client
    const supabase = await createClient()

    // Update settings
    const { error } = await supabase
      .from('settings')
      .update({ receive_weekly_nudge: validated.receiveWeeklyNudge })
      .eq('user_id', validated.userId)

    if (error) {
      console.error('Error updating nudge preference:', error)
      return { success: false, error: 'Failed to update nudge preference' }
    }

    return { success: true }
  } catch (err) {
    if (err instanceof Error) {
      return { success: false, error: err.message }
    }
    return { success: false, error: 'An unexpected error occurred' }
  }
}

/**
 * Completes the onboarding flow and redirects to client home.
 * Call this after all onboarding steps are complete.
 *
 * Usage:
 * ```tsx
 * // After final onboarding step
 * await completeOnboarding()
 * // User is redirected to /client/home
 * ```
 */
export async function completeOnboarding(): Promise<never> {
  redirect('/client/home')
}

/**
 * Combined onboarding action that saves all data at once.
 * Use this if you want to save everything in a single step.
 *
 * @param input - All onboarding data
 * @returns ActionResult, then redirects on success
 */
export async function submitOnboarding(input: {
  userId: string
  themeText: string
  progressText?: string
  actions: string[]
  receiveWeeklyNudge?: boolean
}): Promise<ActionResult> {
  try {
    const user = await getUser()
    if (!user || user.id !== input.userId) {
      return { success: false, error: 'Unauthorized' }
    }

    const supabase = await createClient()

    // Save theme
    const { error: themeError } = await supabase.from('development_themes').insert({
      user_id: input.userId,
      theme_text: input.themeText,
    })
    if (themeError) {
      console.error('Error saving theme:', themeError)
      return { success: false, error: 'Failed to save theme' }
    }

    // Save progress (if provided)
    if (input.progressText) {
      const { error: progressError } = await supabase.from('progress_entries').insert({
        user_id: input.userId,
        text: input.progressText,
      })
      if (progressError) {
        console.error('Error saving progress:', progressError)
        return { success: false, error: 'Failed to save progress entry' }
      }
    }

    // Save weekly actions
    if (input.actions.length > 0) {
      const actionsToInsert = input.actions.map((actionText) => ({
        user_id: input.userId,
        action_text: actionText,
        is_completed: false,
      }))
      const { error: actionsError } = await supabase
        .from('weekly_actions')
        .insert(actionsToInsert)
      if (actionsError) {
        console.error('Error saving actions:', actionsError)
        return { success: false, error: 'Failed to save weekly actions' }
      }
    }

    // Update nudge preference (if specified)
    if (typeof input.receiveWeeklyNudge === 'boolean') {
      const { error: settingsError } = await supabase
        .from('settings')
        .update({ receive_weekly_nudge: input.receiveWeeklyNudge })
        .eq('user_id', input.userId)
      if (settingsError) {
        console.error('Error updating settings:', settingsError)
        return { success: false, error: 'Failed to update settings' }
      }
    }

    return { success: true }
  } catch (err) {
    if (err instanceof Error) {
      return { success: false, error: err.message }
    }
    return { success: false, error: 'An unexpected error occurred' }
  }
}
