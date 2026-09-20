import styles from './demo.module.css'

/** Stage 1 — the full report behind a pin, and why it is worth a Saturday. */
export default function IssuePanel({ issue, onOrganize, onReset }) {
  return (
    <>
      <h3 className={styles.panelTitle}>{issue.type}</h3>
      <p className={styles.lede}>{issue.detail}</p>

      <dl className={styles.kv}>
        <dt>Location</dt>
        <dd>{issue.loc}</dd>
        <dt>Reported</dt>
        <dd>{issue.when}</dd>
        <dt>Neighbors flagging</dt>
        <dd>{issue.reports}</dd>
        <dt>Source</dt>
        <dd>
          <span className={styles.src}>{issue.src}</span>
        </dd>
      </dl>

      <div className={styles.callout}>{issue.why}</div>

      <div className={styles.rowActions}>
        <button type="button" className="btn btn-accent btn-lg" onClick={onOrganize}>
          Organize an event here
        </button>
        <button type="button" className={styles.reset} onClick={onReset}>
          Back to the board
        </button>
      </div>
    </>
  )
}
