import { DRAFT_DEFAULTS } from '@/lib/board'

import styles from './demo.module.css'

function Field({ label, autoTag, auto, children, full }) {
  return (
    <div className={`${styles.field} ${full ? styles.fieldFull : ''}`.trim()}>
      <label>
        {label}
        {autoTag && <span className={styles.autotag}>{autoTag}</span>}
      </label>
      <div className={`${styles.val} ${auto ? styles.valAuto : ''}`.trim()}>{children}</div>
    </div>
  )
}

/**
 * Stage 2 — the draft. Everything dashed is inherited from the report; the
 * organizer is only asked for a time and a headcount.
 */
export default function DraftPanel({ issue, onPublish, onReset }) {
  return (
    <>
      <h3 className={styles.panelTitle}>New event</h3>
      <p className={styles.lede}>
        Location, type and supplies come from the report. You pick a time and hit publish.
      </p>

      <div className={styles.formGrid}>
        <Field label="Event name" autoTag="filled in" auto full>
          {issue.event}
        </Field>
        <Field label="Date">{DRAFT_DEFAULTS.date}</Field>
        <Field label="Time">{DRAFT_DEFAULTS.time}</Field>
        <Field label="Meeting point" autoTag="from the report" auto full>
          {issue.loc}
        </Field>
        <Field label="Bring" autoTag="suggested for this issue type" auto full>
          {issue.bring}
        </Field>
        <Field label="Hosted by">{DRAFT_DEFAULTS.host}</Field>
        <Field label="Volunteers needed">{DRAFT_DEFAULTS.volunteers}</Field>
      </div>

      <div className={styles.rowActions}>
        <button type="button" className="btn btn-accent btn-lg" onClick={onPublish}>
          Publish event
        </button>
        <button type="button" className={styles.reset} onClick={onReset}>
          Cancel
        </button>
      </div>
    </>
  )
}
