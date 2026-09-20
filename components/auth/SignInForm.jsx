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
