import { SEED_EVENTS, buildPublishedEvent } from '@/lib/board'

import CommunityBoard from './CommunityBoard'
import EventFlyer from './EventFlyer'
import styles from './demo.module.css'

/** Stage 3 — the flyer is generated and the event is on the public board. */
export default function PublishedPanel({ issue, onReset }) {
  const events = [buildPublishedEvent(issue), ...SEED_EVENTS]

  return (
    <>
      <h3 className={styles.panelTitle}>Published</h3>
      <p className={styles.lede}>
        The flyer is generated and the event is live on the board. Everyone within a mile sees
        it.
      </p>

      <div className={styles.resultGrid}>
        <EventFlyer issue={issue} />

        <div>
          <div className={styles.resultLabel}>Community board, updated</div>
          <CommunityBoard events={events} />

          <div className={styles.rowActions} style={{ marginTop: 18 }}>
            <button type="button" className="btn btn-line btn-lg" onClick={onReset}>
              Run it again
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
