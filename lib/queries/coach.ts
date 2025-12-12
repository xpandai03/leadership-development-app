import { createClient } from '@/lib/supabase/server'
import type {
  User,
  DevelopmentTheme,
  ProgressEntry,
  WeeklyAction,
  NudgeSent,
} from '@/lib/supabase/types'

/**
 * Query functions for coach data.
 * These queries leverage the coach's RLS policies to access all client data.
 */

/**
 * Client summary type for the coach dashboard.
 */
export interface ClientSummary {
  user: User
  currentTheme: DevelopmentTheme | null
  latestProgress: ProgressEntry | null
  weeklyActions: WeeklyAction[]
  actionStats: {
    total: number
    completed: number
    open: number
  }
}

/**
 * Gets all clients (users with role = 'client').
 * Only accessible by coaches due to RLS policies.
 *
 * @returns Array of client users
 */
export async function getAllClients(): Promise<User[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('role', 'client')
    .order('name', { ascending: true })

  if (error) {
    console.error('Error fetching clients:', error)
    return []
  }

  return data || []
}

/**
 * Gets the current theme for a specific client.
 *
 * @param clientId - The client's user ID
 * @returns The most recent theme or null
 */
export async function getClientTheme(
  clientId: string
): Promise<DevelopmentTheme | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('development_themes')
    .select('*')
    .eq('user_id', clientId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (error) {
    if (error.code !== 'PGRST116') {
      console.error('Error fetching client theme:', error)
    }
    return null
  }

  return data
}

/**
 * Gets the latest progress entry for a specific client.
 *
 * @param clientId - The client's user ID
 * @returns The most recent progress entry or null
 */
export async function getClientLatestProgress(
  clientId: string
): Promise<ProgressEntry | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('progress_entries')
    .select('*')
    .eq('user_id', clientId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (error) {
    if (error.code !== 'PGRST116') {
      console.error('Error fetching client progress:', error)
    }
    return null
  }

  return data
}

/**
 * Gets all weekly actions for a specific client.
 *
 * @param clientId - The client's user ID
 * @returns Array of weekly actions
 */
export async function getClientWeeklyActions(
  clientId: string
): Promise<WeeklyAction[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('weekly_actions')
    .select('*')
    .eq('user_id', clientId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching client actions:', error)
    return []
  }

  return data || []
}

/**
 * Gets a complete summary for a single client.
 *
 * @param clientId - The client's user ID
 * @returns ClientSummary object with all client data
 */
export async function getClientSummary(
  clientId: string
): Promise<ClientSummary | null> {
  const supabase = await createClient()

  // Fetch user first
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('*')
    .eq('id', clientId)
    .single()

  if (userError || !user) {
    console.error('Error fetching client:', userError)
    return null
  }

  // Fetch related data in parallel
  const [currentTheme, latestProgress, weeklyActions] = await Promise.all([
    getClientTheme(clientId),
    getClientLatestProgress(clientId),
    getClientWeeklyActions(clientId),
  ])

  const completed = weeklyActions.filter((a) => a.is_completed).length

  return {
    user,
    currentTheme,
    latestProgress,
    weeklyActions,
    actionStats: {
      total: weeklyActions.length,
      completed,
      open: weeklyActions.length - completed,
    },
  }
}

/**
 * Gets summaries for all clients.
 * Optimized to fetch data efficiently for the coach dashboard.
 *
 * @returns Array of ClientSummary objects
 */
export async function getAllClientSummaries(): Promise<ClientSummary[]> {
  const clients = await getAllClients()

  // Fetch summaries in parallel
  const summaries = await Promise.all(
    clients.map(async (client) => {
      const summary = await getClientSummary(client.id)
      return summary
    })
  )

  // Filter out any null summaries
  return summaries.filter((s): s is ClientSummary => s !== null)
}

/**
 * Gets nudges sent by a coach.
 *
 * @param coachId - The coach's user ID
 * @param limit - Optional limit on results
 * @returns Array of nudges sent
 */
export async function getNudgesSentByCoach(
  coachId: string,
  limit?: number
): Promise<NudgeSent[]> {
  const supabase = await createClient()

  let query = supabase
    .from('nudges_sent')
    .select('*')
    .eq('coach_id', coachId)
    .order('sent_at', { ascending: false })

  if (limit) {
    query = query.limit(limit)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching nudges:', error)
    return []
  }

  return data || []
}

/**
 * Gets nudges sent to a specific client.
 *
 * @param clientId - The client's user ID
 * @param limit - Optional limit on results
 * @returns Array of nudges sent to the client
 */
export async function getNudgesSentToClient(
  clientId: string,
  limit?: number
): Promise<NudgeSent[]> {
  const supabase = await createClient()

  let query = supabase
    .from('nudges_sent')
    .select('*')
    .eq('client_id', clientId)
    .order('sent_at', { ascending: false })

  if (limit) {
    query = query.limit(limit)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching client nudges:', error)
    return []
  }

  return data || []
}

/**
 * Gets dashboard statistics for the coach.
 *
 * @returns Object with total clients, actions completed this week, etc.
 */
export async function getCoachDashboardStats(): Promise<{
  totalClients: number
  totalOpenActions: number
  totalCompletedActions: number
  clientsWithNoTheme: number
}> {
  const summaries = await getAllClientSummaries()

  let totalOpenActions = 0
  let totalCompletedActions = 0
  let clientsWithNoTheme = 0

  for (const summary of summaries) {
    totalOpenActions += summary.actionStats.open
    totalCompletedActions += summary.actionStats.completed
    if (!summary.currentTheme) {
      clientsWithNoTheme++
    }
  }

  return {
    totalClients: summaries.length,
    totalOpenActions,
    totalCompletedActions,
    clientsWithNoTheme,
  }
}
