'use client'

import Sheet from './Sheet'
import styles from './app.module.css'

/**
 * Stage two: the pin becomes a plan.
 *
 * Name, meeting point and supplies arrive pre-filled from the report — the
 * dashed fields. The organizer supplies only what the report could not know:
 * when, and who is hosting.
 */
export default function DraftSheet({ open, draft, error, onChange, onClose, onPublish }) {
  const set = (key) => (event) => onChange({ ...draft, [key]: event.target.value })

  return (
    <Sheet open={open} onClose={onClose} labelledBy="draft-sheet-title">
      {draft && (
        <>
          <h1 id="draft-sheet-title" className={styles.sheetTitle}>
            New event
          </h1>
          <p className={styles.sheetLede}>
            Location and supplies came from the report. Pick a time and publish.
          </p>

          <div className={styles.field}>
            <label htmlFor="e-name">
              Event name<span className={styles.tag}>filled in</span>
            </label>
            <input id="e-name" className={styles.auto} value={draft.name} onChange={set('name')} />
          </div>

          <div className={styles.field}>
            <label htmlFor="e-loc">
              Meeting point<span className={styles.tag}>from the report</span>
            </label>
            <input id="e-loc" className={styles.auto} value={draft.loc} onChange={set('loc')} />
          </div>

          <div className={styles.two}>
            <div className={styles.field}>
              <label htmlFor="e-date">Date</label>
              <input id="e-date" type="date" value={draft.date} onChange={set('date')} />
            </div>
            <div className={styles.field}>
              <label htmlFor="e-time">Start</label>
              <input id="e-time" type="time" value={draft.time} onChange={set('time')} />
            </div>
          </div>

          <div className={styles.field}>
            <label htmlFor="e-bring">
              Bring<span className={styles.tag}>suggested</span>
            </label>
            <input id="e-bring" className={styles.auto} value={draft.bring} onChange={set('bring')} />
          </div>

          <div className={styles.field}>
            <label htmlFor="e-host">Hosted by</label>
            <input id="e-host" value={draft.host} onChange={set('host')} />
          </div>

          {error && (
            <p className={styles.error} role="alert">
              {error}
            </p>
          )}

          <button type="button" className={styles.cta} onClick={onPublish}>
            Publish event
          </button>
          <button type="button" className={`${styles.cta} ${styles.ctaGhost} ${styles.ctaSm}`} onClick={onClose}>
            Cancel
          </button>
        </>
      )}
    </Sheet>
  )
}
