'use client'

import { ISSUE_FILTERS } from '@/lib/issues'
import { SEVERITY_RULE, SEVERITY_SHORT } from '@/lib/severity'
import { summarize } from '@/lib/stats'

import styles from './app.module.css'

const SEV_TAG = {
  high: styles.badgeHigh,
  med: styles.badgeMed,
  low: styles.badgeLow,
}

/**
 * The panel beside (or below) the map: filters, the four headline numbers,
 * and the reports as a list.
 *
 * The map itself is not rendered here — it lives in the app shell so it can
 * hold its own grid column on desktop and stay on screen while the panel
 * switches tabs. This component owns everything that scrolls.
 *
 * The list is not redundant with the map. Pins show where; the list shows
 * what, in priority order, and it is the only way to read the set on a
 * screen reader or to compare two sites without clicking each one.
 */
export default function MapScreen({ issues, events, filter, onFilter, selectedId, onSelect }) {
  const stats = summarize(issues, events)

  /* Worst and freshest first — the order someone would work through them. */
  const ranked = [...issues].sort((a, b) => {
    const weight = { high: 0, med: 1, low: 2 }
    if (weight[a.sev] !== weight[b.sev]) return weight[a.sev] - weight[b.sev]
    return (b.measuredAt || '').localeCompare(a.measuredAt || '')
  })

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

      <div className={styles.stats}>
        {stats.map((stat) => (
          <div key={stat.label} className={styles.stat}>
            <div className={styles.statN}>{stat.n}</div>
            <div className={styles.statL}>{stat.label}</div>
          </div>
        ))}
      </div>

      <ul className={styles.list}>
        {ranked.map((issue) => (
          <li key={issue.id}>
            <button
              type="button"
              className={`${styles.listRow} ${
                selectedId === issue.id ? styles.listRowOn : ''
              }`.trim()}
              onClick={() => onSelect(issue.id)}
            >
              <span className={`${styles.badge} ${SEV_TAG[issue.sev]} ${styles.listBadge}`}>
                {SEVERITY_SHORT[issue.sev]}
              </span>

              <span className={styles.listBody}>
                <span className={styles.listTitle}>{issue.type}</span>
                <span className={styles.listLoc}>{issue.loc}</span>
                <span className={styles.listMeta}>
                  {issue.src} · {issue.when}
                  {issue.done ? ' · event scheduled' : ''}
                </span>
              </span>
            </button>
          </li>
        ))}

        {ranked.length === 0 && <li className={styles.empty}>No reports match this filter.</li>}
      </ul>

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
