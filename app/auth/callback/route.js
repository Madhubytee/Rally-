import { NextResponse } from 'next/server'

import { getSupabaseServer } from '@/lib/supabase/server'

/**
 * Where Supabase sends people back to after an email confirmation or a magic
 * link. The link carries a one-time code that has to be traded for a session
 * cookie, which can only happen server side.
 */
export async function GET(request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') || '/app'

  if (code) {
    const supabase = await getSupabaseServer()
    const { error } = (await supabase?.auth.exchangeCodeForSession(code)) || {}
    if (!error) return NextResponse.redirect(`${origin}${next}`)
  }

  return NextResponse.redirect(`${origin}/signin?error=callback`)
}
