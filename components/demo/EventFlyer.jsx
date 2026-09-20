import { DRAFT_DEFAULTS } from '@/lib/board'

import styles from './demo.module.css'

export default function EventFlyer({ issue }) {
  return (
    <div className={styles.flyer}>
      <div className={styles.flyerArt}>
        <svg width="150" height="130" viewBox="0 0 150 130" fill="#fff" aria-hidden="true">
          <path d="M75 12c22 24 34 42 34 58a34 34 0 1 1-68 0c0-16 12-34 34-58Z" />
        </svg>
        <div className={styles.ftag}>COMMUNITY CLEANUP</div>
        <h4>{issue.event}</h4>
      </div>

      <div className={styles.flyerMeta}>
        <div className={styles.fmRow}>
          <b>When</b>
          <span>{DRAFT_DEFAULTS.flyerWhen}</span>
        </div>
        <div className={styles.fmRow}>
          <b>Where</b>
          <span>{issue.loc}</span>
        </div>
        <div className={styles.fmRow}>
          <b>Bring</b>
          <span>{issue.bring}</span>
        </div>
        <div className={styles.fmRow}>
          <b>Host</b>
          <span>{DRAFT_DEFAULTS.host}</span>
        </div>
      </div>

      <div className={styles.flyerFoot}>
        Site data: NASA GLOBE Observer · Share this anywhere
      </div>
    </div>
  )
}
