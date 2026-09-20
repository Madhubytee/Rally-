'use client'

import { SEVERITY_LABEL } from '@/lib/severity'

import Sheet from './Sheet'
import styles from './app.module.css'

const BADGE = {
  high: styles.badgeHigh,
  med: styles.badgeMed,
  low: styles.badgeLow,
}

/**
 * The report behind a pin, and the one button that turns it into a plan.
 *
 * Larvae count is shown as "not sampled" when it is null rather than as a
 * zero, because the two mean different things and collapsing them here would
 * undo the care taken in the scoring rule.
 */
export default function IssueSheet({ open, issue, onClose, onOrganize }) {
  return (
    <Sheet open={open} onClose={onClose} labelledBy="issue-sheet-title">
      {issue && (
        <>
          <span className={`${styles.badge} ${BADGE[issue.sev]}`}>
            {SEVERITY_LABEL[issue.sev]}
          </span>

          <h1 id="issue-sheet-title" className={styles.sheetTitle}>
            {issue.type}
          </h1>
          <p className={styles.sheetLede}>{issue.detail}</p>

          <div className={styles.kv}>
            <div className={styles.kvK}>Location</div>
            <div className={styles.kvV}>{issue.loc}</div>

            <div className={styles.kvK}>Reported</div>
            <div className={styles.kvV}>{issue.when}</div>

            <div className={styles.kvK}>Neighbors flagging</div>
            <div className={styles.kvV}>{issue.reports}</div>

            <div className={styles.kvK}>Larvae count</div>
            <div className={styles.kvV}>
              {issue.larvaeCount == null ? 'Not sampled' : issue.larvaeCount}
            </div>

            <div className={styles.kvK}>Water source</div>
            <div className={styles.kvV}>{issue.waterSource || '—'}</div>

            <div className={styles.kvK}>Source</div>
            <div className={styles.kvV}>{issue.src}</div>
          </div>

          <div className={styles.note}>{issue.why}</div>

          {issue.done ? (
            <p className={styles.sheetLede}>
              An event is already scheduled here. It is on the board.
            </p>
          ) : (
            <button type="button" className={styles.cta} onClick={onOrganize}>
              Organize an event here
            </button>
          )}

          <button type="button" className={`${styles.cta} ${styles.ctaGhost} ${styles.ctaSm}`} onClick={onClose}>
            Close
          </button>
        </>
      )}
    </Sheet>
  )
}
