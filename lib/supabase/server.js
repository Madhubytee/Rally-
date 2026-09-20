import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

import { SUPABASE_ANON_KEY, SUPABASE_URL, isSupabaseConfigured } from './config'

/**
 * Supabase client for Server Components, Server Actions and Route Handlers.
 *
 * A new client per request, never a module-level singleton: it carries the
 * caller's cookies, so sharing one between requests would hand one visitor
 * another visitor's session.
 */
export async function getSupabaseServer() {
  if (!isSupabaseConfigured) return null

  const store = await cookies()

  return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll: () => store.getAll(),
      setAll(list) {
        try {
          list.forEach(({ name, value, options }) => store.set(name, value, options))
        } catch {
          /*
           * Server Components cannot set cookies. That is fine — the
           * middleware refreshes the session on every request, so the write
           * this call wanted to make has already happened there.
           */
        }
      },
    },
  })
}

/** The signed-in organizer, or null. */
export async function getUser() {
  const supabase = await getSupabaseServer()
  if (!supabase) return null

  /*
   * getUser, not getSession. getSession reads the cookie and trusts it;
   * getUser revalidates the token against Supabase, which is what you want
   * before showing anyone anything that depends on who they are.
   */
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return user ?? null
}
