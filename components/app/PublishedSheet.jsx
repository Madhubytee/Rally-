'use client'

import Sheet from './Sheet'
import styles from './app.module.css'

/** Stage three: the flyer, generated from the event with nothing retyped. */
export default function PublishedSheet({ open, event, onClose, onSeeBoard }) {
  return (
    <Sheet open={open} onClose={onClose} labelledBy="published-sheet-title">
      {event && (
        <>
          <h1 id="published-sheet-title" className={styles.sheetTitle}>
            Your event is live
          </h1>
          <p className={styles.sheetLede}>
            The flyer is ready to share and the event is on the board.
          </p>

          <div className={styles.flyer}>
            <div className={styles.flyerArt}>
              <div className={styles.flyerKicker}>Community cleanup</div>
              <h2>{event.title}</h2>
            </div>

            <div className={styles.flyerMeta}>
              <div>
                <b>When</b>
                <span>{event.when}</span>
              </div>
              <div>
                <b>Where</b>
                <span>{event.loc}</span>
              </div>
              <div>
                <b>Bring</b>
                <span>{event.bring}</span>
              </div>
              <div>
                <b>Host</b>
                <span>{event.host}</span>
              </div>
            </div>

            <div className={styles.flyerFoot}>
              Site data: NASA GLOBE Observer · Share anywhere
            </div>
          </div>

          <button type="button" className={styles.cta} onClick={onSeeBoard}>
            See it on the board
          </button>
          <button type="button" className={`${styles.cta} ${styles.ctaGhost} ${styles.ctaSm}`} onClick={onClose}>
            Done
          </button>
        </>
      )}
    </Sheet>
  )
}
