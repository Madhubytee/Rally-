'use client'

import { ISSUE_FILTERS } from '@/lib/issues'
import { SEVERITY_RULE } from '@/lib/severity'
import { summarize } from '@/lib/stats'

import PlaceholderMap from './PlaceholderMap'
import styles from './app.module.css'

export default function MapScreen({
  issues,
  events,
  filter,
  onFilter,
  selectedId,
  onSelect,
  me,
  onLocate,
  locating,
  locateError,
}) {
  const stats = summarize(issues, events)

  return (
    <section>
      <div className={styles.chips} role="group" aria-label="Filter reports by type">
        {ISSUE_FILTERS.map((chip) => (
          <button
            key={chip}
            type="button"
            className={`${styles.chip} ${filter === chip ? styles.chipOn : ''}`.trim()}
            aria-pressed={filter === chip}
            onClick={() => onFilter(chip)}
          >
            {chip}
          </button>
        ))}
      </div>

      <div className={styles.map}>
        <PlaceholderMap
          issues={issues}
          selectedId={selectedId}
          onSelect={onSelect}
          me={me}
        />

        <button
          type="button"
          className={styles.locateBtn}
          onClick={onLocate}
          disabled={locating}
          aria-label={locating ? 'Finding your location' : 'Show my location'}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Zm8.94 3a9 9 0 0 0-7.94-7.94V1h-2v2.06A9 9 0 0 0 3.06 11H1v2h2.06A9 9 0 0 0 11 20.94V23h2v-2.06A9 9 0 0 0 20.94 13H23v-2h-2.06ZM12 19a7 7 0 1 1 0-14 7 7 0 0 1 0 14Z" />
          </svg>
        </button>

        <div className={styles.hint}>
          {locateError ||
            (issues.length
              ? 'Tap a pin to see the report'
              : 'No reports match this filter')}
        </div>
      </div>

      <div className={styles.stats}>
        {stats.map((stat) => (
          <div key={stat.label} className={styles.stat}>
            <div className={styles.statN}>{stat.n}</div>
            <div className={styles.statL}>{stat.label}</div>
          </div>
        ))}
      </div>

      <div className={styles.pad}>
        <div className={styles.eyebrow}>How priority is set</div>
        <ul className={styles.ruleList}>
          {SEVERITY_RULE.map((rule) => (
            <li key={rule.level}>
              <b>{rule.label.replace(' priority', '')}</b> — {rule.rule}
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
