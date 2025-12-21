import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import type { Database } from '@/lib/supabase/types'

/**
 * Updates the Supabase auth session from the request cookies.
 * Call this in your middleware.ts to keep sessions fresh.
 *
 * This middleware:
 * 1. Reads the Supabase auth token from cookies
 * 2. Refreshes the session if needed
 * 3. Updates the response cookies with the new session
 *
 * Usage in middleware.ts:
 * ```tsx
 * import { updateSession } from '@/lib/supabase/middleware'
 *
 * export async function middleware(request: NextRequest) {
 *   return await updateSession(request)
 * }
 *
 * export const config = {
 *   matcher: [
 *     '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
 *   ],
 * }
 * ```
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANT: Do not run any code between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make your app
  // vulnerable to security issues.

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Redirect unauthenticated users away from protected routes
  const pathname = request.nextUrl.pathname
  const isProtected = pathname.startsWith('/client') || pathname.startsWith('/coach')

  if (!user && isProtected) {
    const url = request.nextUrl.clone()
    url.pathname = '/'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

/**
 * Protected route checker for middleware.
 * Returns true if the path requires authentication.
 */
export function isProtectedRoute(pathname: string): boolean {
  const protectedPaths = ['/client', '/coach', '/api/send-nudge']
  return protectedPaths.some((path) => pathname.startsWith(path))
}

/**
 * Role-based route checker.
 * Returns the required role for a given path, or null if no specific role needed.
 */
export function getRequiredRole(pathname: string): 'client' | 'coach' | null {
  if (pathname.startsWith('/coach')) return 'coach'
  if (pathname.startsWith('/client')) return 'client'
  return null
}
