'use client'

import { useState } from 'react'

import styles from './demo.module.css'

/**
 * The public board. A freshly published event renders as "Live" and is not
 * joinable by its own organizer; everything else can be joined once.
 */
export default function CommunityBoard({ events }) {
  const [joined, setJoined] = useState(() => new Set())

  const join = (id) =>
    setJoined((prev) => {
      const next = new Set(prev)
      next.add(id)
      return next
    })

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
              <h5>{event.t}</h5>
              <p>{event.s}</p>
            </div>

            <button
              type="button"
              className={`${styles.bcGo} ${
                event.fresh || hasJoined ? styles.bcGoDone : ''
              }`.trim()}
              disabled={event.fresh || hasJoined}
              onClick={() => join(event.id)}
            >
              {event.fresh ? 'Live' : hasJoined ? "You're in" : "I'll be there"}
            </button>
          </div>
        )
      })}
    </div>
  )
}
