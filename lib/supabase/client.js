'use client'

import { createBrowserClient } from '@supabase/ssr'

import { SUPABASE_ANON_KEY, SUPABASE_URL, isSupabaseConfigured } from './config'

/*
 * One client per browser tab. `createBrowserClient` is cheap, but a fresh
 * instance per call means a fresh auth listener per call, and those stack up
 * into duplicate token refreshes.
 */
let client = null

/** The browser client, or null when the project has no Supabase configured. */
export function getSupabaseBrowser() {
  if (!isSupabaseConfigured) return null
  if (!client) client = createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  return client
}
