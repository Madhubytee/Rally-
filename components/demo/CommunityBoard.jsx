'use client'

import { useState } from 'react'

import styles from './demo.module.css'

/**
 * The public board. A freshly published event renders as "Live" and is not
 * joinable by its own organizer; everything else can be joined once.
 *
 * `onInteract` lets the caller know a real person clicked something. The
 * landing walkthrough uses it to stop autoplaying — without it, joining an
 * event here would be overwritten by the timer a few seconds later.
 */
export default function CommunityBoard({ events, onInteract }) {
  const [joined, setJoined] = useState(() => new Set())

  const join = (id) => {
    onInteract?.()
    setJoined((prev) => new Set(prev).add(id))
  }

  return (
    <div>
      {events.map((event) => {
        const hasJoined = joined.has(event.id)

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
                {event.when} · {event.going} going · Hosted by {event.host}
              </p>
            </div>

            <button
              type="button"
              className={`${styles.bcGo} ${
                event.fresh || hasJoined ? styles.bcGoDone : ''
              }`.trim()}
              disabled={event.fresh || hasJoined}
              onClick={() => join(event.id)}
            >
              {/* Same three labels the app uses, so the walkthrough teaches
                  the real interface rather than a variant of it. */}
              {event.fresh ? 'Yours' : hasJoined ? 'Signed up' : 'Sign up'}
            </button>
          </div>
        )
      })}
    </div>
  )
}
