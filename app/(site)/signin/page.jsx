import { Suspense } from 'react'

import SignInForm from '@/components/auth/SignInForm'

import styles from '@/components/auth/auth.module.css'

export const metadata = {
  title: 'Organizer sign in — Rally',
  description: 'Sign in to publish volunteer events. Reporting and joining never need an account.',
}

/*
 * A centred column rather than the marketing page header. An auth page has
 * one job and one control; stretching it across a 1240px grid leaves the form
 * stranded in the corner with the eye travelling nowhere.
 */
export default function SignInPage() {
  return (
    <main className={styles.page}>
      <div className={styles.column}>
        <div className={styles.mark} aria-hidden="true">
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 2.5c3.6 3.9 5.6 6.9 5.6 9.6a5.6 5.6 0 1 1-11.2 0c0-2.7 2-5.7 5.6-9.6Z"
              fill="#7612fa"
            />
            <circle cx="12" cy="13" r="2.4" fill="#fff" />
          </svg>
        </div>

        <h1 className={styles.title}>Sign in to organize</h1>
        <p className={styles.lede}>
          An account is only needed to publish an event. Reporting a problem and joining a
          cleanup work without one, and always will.
        </p>

        <Suspense fallback={null}>
          <SignInForm />
        </Suspense>
      </div>
    </main>
  )
}
