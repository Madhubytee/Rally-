'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'

import { getSupabaseBrowser } from '@/lib/supabase/client'

import styles from './auth.module.css'

/**
 * Organizer sign in.
 *
 * Only organizers have accounts. Reporting a problem and joining a cleanup
 * both stay anonymous, because the project's whole argument is that
 * volunteering fails at the discovery step — putting a registration wall in
 * front of it would add back the friction Rally exists to remove.
 *
 * One form for both sign in and sign up. Asking someone to find the other tab
 * is a pointless extra decision when the fields are identical.
 */
export default function SignInForm() {
  const supabase = getSupabaseBrowser()
  const router = useRouter()
  const params = useSearchParams()
  const next = params.get('next') || '/app'

  const [mode, setMode] = useState('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [hostName, setHostName] = useState('')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [busy, setBusy] = useState(false)

  /**
   * Google, via Supabase's OAuth redirect.
   *
   * `redirectTo` points at our own callback route, not at a page — the
   * provider hands back a one-time code that has to be traded for a session
   * cookie server side, which is what /auth/callback does.
   */
  const signInWithGoogle = async () => {
    if (!supabase) return

    setBusy(true)
    setError('')

    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    })

    if (oauthError) {
      setBusy(false)
      setError(
        /*
         * The provider being switched off is the overwhelmingly likely cause
         * here, and "Unsupported provider" alone sends people hunting through
         * their own code instead of the dashboard.
         */
        /provider is not enabled|Unsupported provider/i.test(oauthError.message)
          ? 'Google sign in is not enabled on this project yet. Turn it on in Supabase under Authentication → Providers.'
          : oauthError.message,
      )
    }
    /* On success the browser navigates away, so nothing to reset. */
  }

  const submit = async (event) => {
    event.preventDefault()

    if (!supabase) {
      setError('No database is configured, so sign in is unavailable.')
      return
    }

    setBusy(true)
    setError('')
    setNotice('')

    if (mode === 'signup') {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: { data: { host_name: hostName.trim() || 'A neighbor' } },
      })

      setBusy(false)

      if (signUpError) {
        setError(signUpError.message)
        return
      }

      /*
       * With email confirmation on, Supabase returns a user but no session.
       * Saying "check your email" only when that is actually true avoids
       * sending people to an inbox that will never receive anything.
       */
      if (!data.session) {
        setNotice('Check your email to confirm the account, then sign in.')
        setMode('signin')
        return
      }

      router.push(next)
      router.refresh()
      return
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    })

    setBusy(false)

    if (signInError) {
      setError(signInError.message)
      return
    }

    router.push(next)
    /* Server Components cache the signed-out render; refresh re-runs them. */
    router.refresh()
  }

  if (!supabase) {
    return (
      <div className={styles.card}>
        <p className={styles.error}>
          Sign in needs Supabase configured. Add NEXT_PUBLIC_SUPABASE_URL and
          NEXT_PUBLIC_SUPABASE_ANON_KEY, then restart.
        </p>
      </div>
    )
  }

  return (
    <form className={styles.card} onSubmit={submit}>
      <div className={styles.tabs} role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={mode === 'signin'}
          className={`${styles.tab} ${mode === 'signin' ? styles.tabOn : ''}`.trim()}
          onClick={() => {
            setMode('signin')
            setError('')
          }}
        >
          Sign in
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mode === 'signup'}
          className={`${styles.tab} ${mode === 'signup' ? styles.tabOn : ''}`.trim()}
          onClick={() => {
            setMode('signup')
            setError('')
          }}
        >
          Create an account
        </button>
      </div>

      <button
        type="button"
        className={styles.oauth}
        onClick={signInWithGoogle}
        disabled={busy}
      >
        <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
          <path
            fill="#4285F4"
            d="M45.1 24.5c0-1.6-.1-3.1-.4-4.5H24v8.5h11.8c-.5 2.7-2 5-4.4 6.6v5.5h7.1c4.1-3.8 6.6-9.4 6.6-16.1Z"
          />
          <path
            fill="#34A853"
            d="M24 46c5.9 0 10.9-2 14.5-5.4l-7.1-5.5c-2 1.3-4.5 2.1-7.4 2.1-5.7 0-10.6-3.9-12.3-9.1H4.3v5.7C7.9 41.1 15.4 46 24 46Z"
          />
          <path
            fill="#FBBC05"
            d="M11.7 28.1c-.4-1.3-.7-2.7-.7-4.1s.3-2.8.7-4.1v-5.7H4.3A22 22 0 0 0 2 24c0 3.6.9 6.9 2.3 9.8l7.4-5.7Z"
          />
          <path
            fill="#EA4335"
            d="M24 9.9c3.2 0 6.1 1.1 8.4 3.3l6.3-6.3C34.9 3.4 29.9 1.3 24 1.3 15.4 1.3 7.9 6.2 4.3 13.4l7.4 5.7c1.7-5.2 6.6-9.2 12.3-9.2Z"
          />
        </svg>
        Continue with Google
      </button>

      <div className={styles.divider}>
        <span>or use email</span>
      </div>

      {mode === 'signup' && (
        <label className={styles.field}>
          <span>
            Organization or host name
            <em>shown on every event you publish</em>
          </span>
          <input
            value={hostName}
            onChange={(e) => setHostName(e.target.value)}
            placeholder="UF Circle K"
            autoComplete="organization"
          />
        </label>
      )}

      <label className={styles.field}>
        <span>Email</span>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@ufl.edu"
          autoComplete="email"
        />
      </label>

      <label className={styles.field}>
        <span>Password</span>
        <input
          type="password"
          required
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="At least 6 characters"
          autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
        />
      </label>

      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}
      {notice && (
        <p className={styles.notice} role="status">
          {notice}
        </p>
      )}

      <button type="submit" className={styles.submit} disabled={busy}>
        {busy ? 'Working…' : mode === 'signup' ? 'Create account' : 'Sign in'}
      </button>

      <p className={styles.foot}>
        You only need an account to publish events. Reporting a problem and joining a cleanup
        never require one.
      </p>
    </form>
  )
}
