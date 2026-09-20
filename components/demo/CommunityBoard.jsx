'use client'

import { useState } from 'react'

import SignupDialog from '@/components/events/SignupDialog'

import styles from './demo.module.css'

/**
 * The public board. A freshly published event renders as "Live" and is not
 * joinable by its own organizer; everything else can be joined once.
 *
 * "Sign up" opens the signup dialog rather than toggling a label, because a
 * button that says "Signed up" without asking who you are has not signed
 * anyone up for anything. Details land in local state — nothing persists.
 *
 * `onInteract` lets the caller know a real person clicked something. The
 * landing walkthrough uses it to stop autoplaying — without it, joining an
 * event here would be overwritten by the timer a few seconds later.
 */
export default function CommunityBoard({ events, onInteract }) {
  /** event id -> { party, name, email, phone, org }, for the joined count. */
  const [signups, setSignups] = useState(() => new Map())
  const [openId, setOpenId] = useState(null)

  const openEvent = openId ? events.find((event) => event.id === openId) : null

  const startSignup = (event) => {
    onInteract?.()
    setOpenId(event.id)
  }

  const confirmSignup = (party, details) =>
    setSignups((prev) => new Map(prev).set(openId, { party, ...details }))

  return (
    <div>
      {events.map((event) => {
        const signup = signups.get(event.id)
        const closed = Boolean(event.fresh || signup)

        return (
          <div
            key={event.id}
            className={`${styles.boardCard} ${event.fresh ? styles.boardCardFresh : ''}`.trim()}
          >
            <div className={styles.bcDate}>
              <div className={styles.m}>{event.m}</div>
              <div className={styles.d}>{event.d}</div>
            </div>

            <div className={styles.bcBody}>
              <h5>{event.title}</h5>
              <p>
                {event.when} · {event.going + (signup?.party || 0)} going · Hosted by{' '}
                {event.host}
              </p>
            </div>

            <button
              type="button"
              className={`${styles.bcGo} ${closed ? styles.bcGoDone : ''}`.trim()}
              /*
               * aria-disabled, not disabled. The dialog hands focus back to
               * the button that opened it, and a genuinely disabled button
               * cannot take focus — so signing up would drop the keyboard
               * user back onto <body>. The click is guarded instead.
               */
              aria-disabled={closed || undefined}
              onClick={() => !closed && startSignup(event)}
            >
              {/* Same three labels the app uses, so the walkthrough teaches
                  the real interface rather than a variant of it. */}
              {event.fresh ? 'Yours' : signup ? 'Signed up' : 'Sign up'}
            </button>
          </div>
        )
      })}

      <SignupDialog
        open={Boolean(openEvent)}
        event={openEvent}
        onClose={() => setOpenId(null)}
        onSubmit={confirmSignup}
      />
    </div>
  )
}
