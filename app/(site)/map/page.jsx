import { config } from '@/lib/config'
import { ISSUES } from '@/lib/issues'
import { SEVERITY_SHORT } from '@/lib/severity'

import styles from '../routes.module.css'

const SEV_TAG = {
  high: styles.sevHigh,
  med: styles.sevMed,
  low: styles.sevLow,
}

export const metadata = {
  title: 'Map — Rally',
  description: 'Every open report near you, from GLOBE Observer sites and resident reports.',
}

export default function MapPage() {
  return (
    <main>
      <div className="wrap page-head">
        <h1>Every open report nearby</h1>
        <p>
          {config.defaultCity} and the surrounding area. Standing water sites come seeded from
          NASA GLOBE Observer; everything else is reported by neighbors.
        </p>
      </div>

      <div className={`wrap ${styles.section}`}>
        <div className={styles.note}>
          This list renders the same demo records the landing page uses. The live map view and
          the GLOBE Observer import are the next piece of work.
        </div>

        <div className={styles.issueList}>
          {ISSUES.map((issue) => (
            <article key={issue.id} className={styles.issueRow}>
              <span className={`${styles.sevTag} ${SEV_TAG[issue.sev]}`}>
                {SEVERITY_SHORT[issue.sev]}
              </span>

              <div className={styles.issueBody}>
                <h3>{issue.type}</h3>
                <p className={styles.issueLoc}>{issue.loc}</p>
                <p>{issue.detail}</p>
                <div className={styles.issueMeta}>
                  <span className={styles.srcTag}>{issue.src}</span>
                  <span>{issue.when}</span>
                  <span>{issue.reports} neighbors flagged it</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </main>
  )
}
