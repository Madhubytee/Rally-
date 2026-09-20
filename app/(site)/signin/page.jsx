import { Suspense } from 'react'

import SignInForm from '@/components/auth/SignInForm'

import styles from '../routes.module.css'

export const metadata = {
  title: 'Organizer sign in — Rally',
  description: 'Sign in to publish volunteer events. Reporting and joining never need an account.',
}

export default function SignInPage() {
  return (
    <main>
      <div className="wrap page-head">
        <h1>Sign in to organize</h1>
        <p>
          An account is only needed to publish an event. Reporting a problem and joining a
          cleanup work without one, and always will.
        </p>
      </div>

      <div className={`wrap ${styles.section}`}>
        {/* useSearchParams needs a Suspense boundary to stay statically rendered. */}
        <Suspense fallback={null}>
          <SignInForm />
        </Suspense>
      </div>
    </main>
  )
}
