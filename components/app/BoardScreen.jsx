'use client'

import styles from './app.module.css'

export default function BoardScreen({ events, onJoin }) {
  return (
    <div className={styles.pad}>
      <h1 className={styles.screenTitle}>Community board</h1>
      <p className={styles.screenLede}>
        Everything neighbors are organizing nearby. No account needed to join.
      </p>

      {events.length === 0 ? (
        <p className={styles.empty}>Nothing scheduled yet. Turn a pin into the first one.</p>
      ) : (
        events.map((event, index) => {
          const done = event.signed || event.fresh
          const label = event.signed ? 'Signed up' : event.fresh ? 'Yours' : 'Sign up'

          return (
            <div key={event.id} className={styles.card}>
              <div className={styles.date}>
                <div className={styles.dateM}>{event.m}</div>
                <div className={styles.dateD}>{event.d}</div>
              </div>

              <div className={styles.cardBody}>
                <h3>{event.title}</h3>
                <p>
                  {event.when} · {event.going} going · {event.host}
                </p>
              </div>

              <button
                type="button"
                className={`${styles.join} ${done ? styles.joinIn : ''}`.trim()}
                disabled={done}
                onClick={() => onJoin(index)}
              >
                {label}
              </button>
            </div>
          )
        })
      )}
    </div>
  )
}
