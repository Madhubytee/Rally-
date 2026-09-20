import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'

import { SUPABASE_ANON_KEY, SUPABASE_URL, isSupabaseConfigured } from '@/lib/supabase/config'

/**
 * Keeps the auth session alive.
 *
 * Supabase access tokens are short-lived. Without a refresh on each request
 * an organizer gets signed out mid-session, and — because Server Components
 * cannot write cookies — there would be nowhere else to persist the new
 * token. This is that place.
 */
export async function middleware(request) {
  let response = NextResponse.next({ request })

  if (!isSupabaseConfigured) return response

  const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(list) {
        list.forEach(({ name, value }) => request.cookies.set(name, value))
        response = NextResponse.next({ request })
        list.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
      },
    },
  })

  // Touching getUser is what triggers the refresh-and-set-cookie cycle.
  await supabase.auth.getUser()

  return response
}

export const config = {
  /*
   * Everything except static assets. Running this on image and font requests
   * would triple the auth traffic for no benefit.
   */
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
