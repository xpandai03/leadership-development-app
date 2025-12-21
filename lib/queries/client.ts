import { createClient } from '@/lib/supabase/server'
import type {
  DevelopmentTheme,
  ProgressEntry,
  WeeklyAction,
  Settings,
  User,
} from '@/lib/supabase/types'

/**
 * Query functions for client data.
 * All queries use the server client with RLS - users can only see their own data.
 */

/**
 * Gets the current user's profile from the users table.
 *
 * @param userId - The user's ID
 * @returns User profile or null if not found
 */
export async function getUserProfile(userId: string): Promise<User | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) {
    console.error('Error fetching user profile:', error)
    return null
  }

  return data
}

/**
 * Gets the user's current (most recent) development theme.
 *
 * @param userId - The user's ID
 * @returns The most recent theme or null if none exists
 */
export async function getCurrentTheme(
  userId: string
): Promise<DevelopmentTheme | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('development_themes')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (error) {
    // PGRST116 means no rows returned - not an error for our purposes
    if (error.code !== 'PGRST116') {
      console.error('Error fetching current theme:', error)
    }
    return null
  }

  return data
}

/**
 * Gets all development themes for a user, ordered by theme_order.
 * Used for the canvas view where themes are displayed in user-defined order.
 *
 * @param userId - The user's ID
 * @returns Array of themes, ordered by theme_order (1-3)
 */
export async function getAllThemes(userId: string): Promise<DevelopmentTheme[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('development_themes')
    .select('*')
    .eq('user_id', userId)
    .order('theme_order', { ascending: true })

  if (error) {
    console.error('Error fetching themes:', error)
    return []
  }

  return data || []
}

/**
 * Gets hypotheses (formerly weekly_actions) for a specific theme.
 *
 * @param themeId - The theme's ID
 * @returns Array of hypotheses for the theme
 */
export async function getHypothesesByTheme(themeId: string): Promise<WeeklyAction[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('weekly_actions')
    .select('*')
    .eq('theme_id', themeId)
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Error fetching hypotheses for theme:', error)
    return []
  }

  return data || []
}

/**
 * Gets all hypotheses for a user, optionally filtered by theme.
 * Hypotheses without a theme_id are legacy data from before the canvas redesign.
 *
 * @param userId - The user's ID
 * @returns Array of all hypotheses for the user
 */
export async function getAllHypotheses(userId: string): Promise<WeeklyAction[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('weekly_actions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Error fetching hypotheses:', error)
    return []
  }

  return data || []
}

/**
 * Gets all progress entries for a user.
 *
 * @param userId - The user's ID
 * @param limit - Optional limit on number of entries (default: all)
 * @returns Array of progress entries, newest first
 */
export async function getProgressEntries(
  userId: string,
  limit?: number
): Promise<ProgressEntry[]> {
  const supabase = await createClient()

  let query = supabase
    .from('progress_entries')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (limit) {
    query = query.limit(limit)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching progress entries:', error)
    return []
  }

  return data || []
}

/**
 * Gets the most recent progress entry for a user.
 *
 * @param userId - The user's ID
 * @returns The most recent entry or null if none exists
 */
export async function getLatestProgress(
  userId: string
): Promise<ProgressEntry | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('progress_entries')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (error) {
    if (error.code !== 'PGRST116') {
      console.error('Error fetching latest progress:', error)
    }
    return null
  }

  return data
}

/**
 * Gets all weekly actions for a user.
 *
 * @param userId - The user's ID
 * @returns Array of weekly actions, newest first
 */
export async function getWeeklyActions(userId: string): Promise<WeeklyAction[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('weekly_actions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching weekly actions:', error)
    return []
  }

  return data || []
}

/**
 * Gets weekly actions filtered by completion status.
 *
 * @param userId - The user's ID
 * @param isCompleted - Filter by completion status
 * @returns Array of filtered weekly actions
 */
export async function getWeeklyActionsByStatus(
  userId: string,
  isCompleted: boolean
): Promise<WeeklyAction[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('weekly_actions')
    .select('*')
    .eq('user_id', userId)
    .eq('is_completed', isCompleted)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching weekly actions by status:', error)
    return []
  }

  return data || []
}

/**
 * Gets the user's settings.
 *
 * @param userId - The user's ID
 * @returns Settings or null if not found
 */
export async function getUserSettings(userId: string): Promise<Settings | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('settings')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (error) {
    if (error.code !== 'PGRST116') {
      console.error('Error fetching user settings:', error)
    }
    return null
  }

  return data
}

/**
 * Gets a summary of the client's data for the home screen.
 * Combines multiple queries for efficiency.
 *
 * @param userId - The user's ID
 * @returns Object containing theme, progress entries, actions, and settings
 */
export async function getClientHomeSummary(userId: string): Promise<{
  user: User | null
  currentTheme: DevelopmentTheme | null
  progressEntries: ProgressEntry[]
  weeklyActions: WeeklyAction[]
  settings: Settings | null
}> {
  // Run queries in parallel for better performance
  const [user, currentTheme, progressEntries, weeklyActions, settings] =
    await Promise.all([
      getUserProfile(userId),
      getCurrentTheme(userId),
      getProgressEntries(userId),
      getWeeklyActions(userId),
      getUserSettings(userId),
    ])

  return {
    user,
    currentTheme,
    progressEntries,
    weeklyActions,
    settings,
  }
}

/**
 * Theme with hypotheses - combines theme data with its associated hypotheses.
 */
export type ThemeWithHypotheses = DevelopmentTheme & {
  hypotheses: WeeklyAction[]
}

/**
 * Gets all themes for a user with their associated hypotheses.
 * This is the main data structure for the canvas view.
 *
 * @param userId - The user's ID
 * @returns Array of themes with their hypotheses
 */
export async function getThemesWithHypotheses(
  userId: string
): Promise<ThemeWithHypotheses[]> {
  const [themes, allHypotheses] = await Promise.all([
    getAllThemes(userId),
    getAllHypotheses(userId),
  ])

  // Group hypotheses by theme_id
  return themes.map((theme) => ({
    ...theme,
    hypotheses: allHypotheses.filter((h) => h.theme_id === theme.id),
  }))
}

/**
 * Gets a complete canvas summary for the client home screen.
 * Returns all data needed for the Leadership Development Canvas view.
 *
 * @param userId - The user's ID
 * @returns Complete canvas data including user, themes with hypotheses, and settings
 */
export async function getCanvasSummary(userId: string): Promise<{
  user: User | null
  themes: ThemeWithHypotheses[]
  settings: Settings | null
}> {
  const [user, themes, settings] = await Promise.all([
    getUserProfile(userId),
    getThemesWithHypotheses(userId),
    getUserSettings(userId),
  ])

  return {
    user,
    themes,
    settings,
  }
}

/**
 * Gets action completion statistics for a user.
 *
 * @param userId - The user's ID
 * @returns Object with total, completed, and open action counts
 */
export async function getActionStats(userId: string): Promise<{
  total: number
  completed: number
  open: number
}> {
  const actions = await getWeeklyActions(userId)
  const completed = actions.filter((a) => a.is_completed).length

  return {
    total: actions.length,
    completed,
    open: actions.length - completed,
  }
}
