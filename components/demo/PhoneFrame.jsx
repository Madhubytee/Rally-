import { DRAFT_DEFAULTS } from '@/lib/board'
import { config } from '@/lib/config'
import { project } from '@/lib/geo'
import { ISSUES, ISSUE_FILTERS, openIssueCount } from '@/lib/issues'
import { SEVERITY_LABEL } from '@/lib/severity'

import CityMapSvg from './CityMapSvg'
import styles from './demo.module.css'

const SEV_CLASS = {
  high: styles.sevHigh,
  med: styles.sevMed,
  low: styles.sevLow,
}

const BADGE_CLASS = {
  high: styles.badgeHigh,
  med: styles.badgeMed,
  low: styles.badgeLow,
}

/*
 * Pins carry real coordinates, so the mock projects them the same way the app
 * does. Computed once at module scope because the record set is static here —
 * this is an illustration, not the live map.
 */
const PLACED = ISSUES.map((issue) => ({ issue, at: project(issue.lat, issue.lng) })).filter(
  (p) => p.at,
)

function PinIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2C8.1 2 5 5.1 5 9c0 5.2 7 13 7 13s7-7.8 7-13c0-3.9-3.1-7-7-7Zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5Z" />
    </svg>
  )
}

/**
 * What a resident sees. Pin appearance is derived from the demo stage rather
 * than mutated in place: at stage 3 the selected pin becomes an event pin.
 */
export default function PhoneFrame({ current, stage, onSelectIssue }) {
  const published = stage === 3

  return (
    <div className={styles.phoneCol}>
      <div className={styles.phone}>
        <div className={styles.notch} />
        <div className={styles.screen}>
          <div className={styles.status}>
            <span>2:27</span>
            <span>{config.defaultCity}</span>
          </div>

          <div className={styles.appHead}>
            <div className={styles.row1}>
              <span className={styles.appTitle}>{config.appName}</span>
              <span className={styles.openCount}>{openIssueCount} open</span>
            </div>
            <div className={styles.geo}>
              <PinIcon />
              Within 1 mile of you
            </div>
          </div>

          <div className={styles.chips}>
            {ISSUE_FILTERS.map((filter, i) => (
              <span
                key={filter}
                className={`${styles.chip} ${i === 0 ? styles.chipOn : ''}`.trim()}
              >
                {filter}
              </span>
            ))}
          </div>

          <div className={styles.maparea}>
            <CityMapSvg />

            <div>
              {PLACED.map(({ issue, at }, idx) => {
                const isSelected = current?.id === issue.id
                const isEventPin = published && isSelected
                const severity = isEventPin ? styles.sevEvent : SEV_CLASS[issue.sev]

                const classes = [styles.pin, severity]
                if (isSelected) classes.push(styles.sel)
                if (idx === 0 && !current) classes.push(styles.nudge)

                return (
                  <button
                    type="button"
                    key={issue.id}
                    className={classes.join(' ')}
                    style={{ left: `${at.x}%`, top: `${at.y}%`, zIndex: isSelected ? 3 : 2 }}
                    aria-label={`${issue.type} at ${issue.loc}`}
                    onClick={() => onSelectIssue(issue.id)}
                  />
                )
              })}
            </div>

            <div
              className={`${styles.bubble} ${current ? styles.bubbleShow : ''}`.trim()}
              role="status"
            >
              {current && (
                <>
                  <div className={styles.bTop}>
                    <span
                      className={`${styles.badge} ${
                        published ? styles.badgeEv : BADGE_CLASS[current.sev]
                      }`}
                    >
                      {published ? 'Event scheduled' : SEVERITY_LABEL[current.sev]}
                    </span>
                  </div>
                  <h4>{published ? current.event : current.type}</h4>
                  <div className={styles.bLoc}>{current.loc}</div>
                  <div className={styles.bMeta}>
                    {published ? (
                      <>
                        <span>{DRAFT_DEFAULTS.flyerWhen.replace('–11 AM', '')}</span>
                        <span>Tap to join</span>
                      </>
                    ) : (
                      <>
                        <span>{current.when}</span>
                        <span>{current.reports} neighbors flagged it</span>
                      </>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>

          <div className={styles.reportBtn}>+ Report an issue</div>
        </div>
      </div>

      <p className={styles.phoneHint}>
        What a resident sees. <b>Tap the pulsing pin</b> to follow one report through.
      </p>
    </div>
  )
}
