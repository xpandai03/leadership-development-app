'use server'

import { revalidatePath } from 'next/cache'
import { createClient, getUser } from '@/lib/supabase/server'
import type { ActionResult } from './onboarding'

/**
 * Canvas actions for the Leadership Development Canvas model.
 * These actions handle leadership purpose, themes, and hypotheses.
 */

/**
 * Updates the user's leadership purpose.
 *
 * @param purpose - The new leadership purpose text (optional, can be empty)
 * @returns ActionResult with success/error status
 */
export async function updateLeadershipPurpose(
  purpose: string
): Promise<ActionResult> {
  try {
    // Validate - purpose is optional but has max length
    if (purpose.length > 500) {
      return { success: false, error: 'Purpose must be less than 500 characters' }
    }

    // Get authenticated user
    const user = await getUser()
    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    // Get Supabase client
    const supabase = await createClient()

    // Update user's leadership purpose
    const { error } = await supabase
      .from('users')
      .update({ leadership_purpose: purpose.trim() || null })
      .eq('id', user.id)

    if (error) {
      console.error('Error updating leadership purpose:', error)
      return { success: false, error: 'Failed to update leadership purpose' }
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
 * Creates a new development theme.
 *
 * @param themeText - The theme name (1-4 words)
 * @param successDescription - Optional success description
 * @returns ActionResult with the new theme ID
 */
export async function createTheme(
  themeText: string,
  successDescription?: string
): Promise<ActionResult<{ id: string }>> {
  try {
    // Validate
    if (!themeText || themeText.trim().length === 0) {
      return { success: false, error: 'Theme name is required' }
    }
    if (themeText.length > 100) {
      return { success: false, error: 'Theme name must be less than 100 characters' }
    }
    if (successDescription && successDescription.length > 2000) {
      return { success: false, error: 'Success description must be less than 2000 characters' }
    }

    // Get authenticated user
    const user = await getUser()
    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    const supabase = await createClient()

    // Check how many themes the user already has
    const { data: existingThemes, error: countError } = await supabase
      .from('development_themes')
      .select('id')
      .eq('user_id', user.id)

    if (countError) {
      console.error('Error counting themes:', countError)
      return { success: false, error: 'Failed to check existing themes' }
    }

    if (existingThemes && existingThemes.length >= 3) {
      return { success: false, error: 'Maximum of 3 themes allowed' }
    }

    // Determine next theme order
    const nextOrder = (existingThemes?.length || 0) + 1

    // Insert new theme
    const { data, error } = await supabase
      .from('development_themes')
      .insert({
        user_id: user.id,
        theme_text: themeText.trim(),
        success_description: successDescription?.trim() || null,
        theme_order: nextOrder,
      })
      .select('id')
      .single()

    if (error) {
      console.error('Error creating theme:', error)
      return { success: false, error: 'Failed to create theme' }
    }

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
 * Updates a development theme's name.
 *
 * @param themeId - The theme ID
 * @param themeText - The new theme name
 * @returns ActionResult with success/error status
 */
export async function updateThemeName(
  themeId: string,
  themeText: string
): Promise<ActionResult> {
  try {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(themeId)) {
      return { success: false, error: 'Invalid theme ID' }
    }
    if (!themeText || themeText.trim().length === 0) {
      return { success: false, error: 'Theme name is required' }
    }
    if (themeText.length > 100) {
      return { success: false, error: 'Theme name must be less than 100 characters' }
    }

    const user = await getUser()
    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    const supabase = await createClient()

    const { error, count } = await supabase
      .from('development_themes')
      .update({ theme_text: themeText.trim() })
      .eq('id', themeId)
      .eq('user_id', user.id)

    if (error) {
      console.error('Error updating theme name:', error)
      return { success: false, error: 'Failed to update theme' }
    }

    if (count === 0) {
      return { success: false, error: 'Theme not found or not authorized' }
    }

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
 * Updates a theme's success description.
 *
 * @param themeId - The theme ID
 * @param description - The new success description
 * @returns ActionResult with success/error status
 */
export async function updateSuccessDescription(
  themeId: string,
  description: string
): Promise<ActionResult> {
  try {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(themeId)) {
      return { success: false, error: 'Invalid theme ID' }
    }
    if (description.length > 2000) {
      return { success: false, error: 'Description must be less than 2000 characters' }
    }

    const user = await getUser()
    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    const supabase = await createClient()

    const { error, count } = await supabase
      .from('development_themes')
      .update({ success_description: description.trim() || null })
      .eq('id', themeId)
      .eq('user_id', user.id)

    if (error) {
      console.error('Error updating success description:', error)
      return { success: false, error: 'Failed to update description' }
    }

    if (count === 0) {
      return { success: false, error: 'Theme not found or not authorized' }
    }

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
 * Deletes a development theme and all its associated hypotheses.
 *
 * @param themeId - The theme ID to delete
 * @returns ActionResult with success/error status
 */
export async function deleteTheme(themeId: string): Promise<ActionResult> {
  try {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(themeId)) {
      return { success: false, error: 'Invalid theme ID' }
    }

    const user = await getUser()
    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    const supabase = await createClient()

    // Delete theme (cascades to hypotheses due to FK)
    const { error, count } = await supabase
      .from('development_themes')
      .delete()
      .eq('id', themeId)
      .eq('user_id', user.id)

    if (error) {
      console.error('Error deleting theme:', error)
      return { success: false, error: 'Failed to delete theme' }
    }

    if (count === 0) {
      return { success: false, error: 'Theme not found or not authorized' }
    }

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
 * Adds a hypothesis to a theme.
 *
 * @param themeId - The theme ID to add the hypothesis to
 * @param hypothesisText - The hypothesis text
 * @returns ActionResult with the new hypothesis ID
 */
export async function addHypothesis(
  themeId: string,
  hypothesisText: string
): Promise<ActionResult<{ id: string }>> {
  try {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(themeId)) {
      return { success: false, error: 'Invalid theme ID' }
    }
    if (!hypothesisText || hypothesisText.trim().length === 0) {
      return { success: false, error: 'Hypothesis text is required' }
    }
    if (hypothesisText.length > 500) {
      return { success: false, error: 'Hypothesis must be less than 500 characters' }
    }

    const user = await getUser()
    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    const supabase = await createClient()

    // Verify theme belongs to user
    const { data: theme, error: themeError } = await supabase
      .from('development_themes')
      .select('id')
      .eq('id', themeId)
      .eq('user_id', user.id)
      .single()

    if (themeError || !theme) {
      return { success: false, error: 'Theme not found or not authorized' }
    }

    // Insert hypothesis (using weekly_actions table with theme_id)
    const { data, error } = await supabase
      .from('weekly_actions')
      .insert({
        user_id: user.id,
        theme_id: themeId,
        action_text: hypothesisText.trim(),
        is_completed: false, // Kept for backward compatibility, not used in canvas
      })
      .select('id')
      .single()

    if (error) {
      console.error('Error adding hypothesis:', error)
      return { success: false, error: 'Failed to add hypothesis' }
    }

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
 * Updates a hypothesis text.
 *
 * @param hypothesisId - The hypothesis ID
 * @param newText - The new hypothesis text
 * @returns ActionResult with success/error status
 */
export async function updateHypothesis(
  hypothesisId: string,
  newText: string
): Promise<ActionResult> {
  try {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(hypothesisId)) {
      return { success: false, error: 'Invalid hypothesis ID' }
    }
    if (!newText || newText.trim().length === 0) {
      return { success: false, error: 'Hypothesis text is required' }
    }
    if (newText.length > 500) {
      return { success: false, error: 'Hypothesis must be less than 500 characters' }
    }

    const user = await getUser()
    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    const supabase = await createClient()

    const { error, count } = await supabase
      .from('weekly_actions')
      .update({ action_text: newText.trim() })
      .eq('id', hypothesisId)
      .eq('user_id', user.id)

    if (error) {
      console.error('Error updating hypothesis:', error)
      return { success: false, error: 'Failed to update hypothesis' }
    }

    if (count === 0) {
      return { success: false, error: 'Hypothesis not found or not authorized' }
    }

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
 * Deletes a hypothesis.
 *
 * @param hypothesisId - The hypothesis ID to delete
 * @returns ActionResult with success/error status
 */
export async function deleteHypothesis(
  hypothesisId: string
): Promise<ActionResult> {
  try {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(hypothesisId)) {
      return { success: false, error: 'Invalid hypothesis ID' }
    }

    const user = await getUser()
    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    const supabase = await createClient()

    const { error, count } = await supabase
      .from('weekly_actions')
      .delete()
      .eq('id', hypothesisId)
      .eq('user_id', user.id)

    if (error) {
      console.error('Error deleting hypothesis:', error)
      return { success: false, error: 'Failed to delete hypothesis' }
    }

    if (count === 0) {
      return { success: false, error: 'Hypothesis not found or not authorized' }
    }

    revalidatePath('/client/home')

    return { success: true }
  } catch (err) {
    if (err instanceof Error) {
      return { success: false, error: err.message }
    }
    return { success: false, error: 'An unexpected error occurred' }
  }
}
