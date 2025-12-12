import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase/types'

/**
 * Creates a Supabase client with service role privileges.
 * BYPASSES ALL RLS POLICIES - use with extreme caution!
 *
 * Only use this client for:
 * - Server-side operations that need to bypass RLS
 * - Validating user roles in API routes
 * - n8n webhook queries (weekly nudge automation)
 * - Admin operations
 *
 * NEVER:
 * - Import this in client components
 * - Expose the service role key to the browser
 * - Use when the regular server client would suffice
 *
 * Usage:
 * ```tsx
 * // In API route or server action
 * import { createAdminClient } from '@/lib/supabase/admin'
 *
 * export async function POST(request: Request) {
 *   const supabase = createAdminClient()
 *   // Can read/write any data regardless of RLS
 *   const { data } = await supabase.from('users').select()
 * }
 * ```
 */
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      'Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables'
    )
  }

  return createSupabaseClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

/**
 * Checks if a user has the 'coach' role.
 * Uses admin client to bypass RLS for role verification.
 *
 * Usage:
 * ```tsx
 * import { isCoach } from '@/lib/supabase/admin'
 *
 * export async function POST(request: Request) {
 *   const userId = '...' // from session
 *   if (!await isCoach(userId)) {
 *     return Response.json({ error: 'Forbidden' }, { status: 403 })
 *   }
 *   // proceed with coach-only operation
 * }
 * ```
 */
export async function isCoach(userId: string): Promise<boolean> {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('users')
    .select('role')
    .eq('id', userId)
    .single()

  if (error || !data) {
    return false
  }

  return data.role === 'coach'
}

/**
 * Gets a user's profile by ID using admin privileges.
 * Useful for fetching any user's data regardless of RLS.
 */
export async function getUserById(userId: string) {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) {
    return null
  }

  return data
}
