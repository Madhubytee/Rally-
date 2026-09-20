/**
 * Supabase connection details.
 *
 * Both values are public by design. The anon key is an identifier, not a
 * credential: it ships to every browser, and what actually protects the data
 * is the row-level security in `data/schema.sql`. The service-role key, which
 * bypasses those policies, must never appear in a NEXT_PUBLIC_ variable.
 *
 * When these are blank the app runs on bundled seed data instead of failing.
 * That keeps the project deployable and reviewable before anyone has a
 * database, and makes "is this persisting?" answerable by one env var.
 */
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY)
