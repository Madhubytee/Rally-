'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'

import { SEVERITY_RULE, SEVERITY_SHORT } from '@/lib/severity'

import styles from './map.module.css'

const SEV_TAG = {
  high: styles.sevHigh,
  med: styles.sevMed,
  low: styles.sevLow,
}

/** High first, then medium, then stale — the order a volunteer should read. */
const SEV_RANK = { high: 0, med: 1, low: 2 }

const SOURCES = ['All sources', 'NASA GLOBE Observer', 'Resident report']

/**
 * The report directory.
 *
 * This is the browsable index, not the map — the live map lives at /app and
 * owns panning, clustering and the report flow. Duplicating it here would
 * mean two map implementations to keep in step, so this page answers the
 * question a map is bad at instead: what is open, of what kind, how urgent,
 * and where did it come from.
 *
 * Filtering is client state and deliberately shallow: no URL params, because
 * nothing here is worth deep-linking to yet and a stale query string is
 * worse than none.
 */
export default function ReportDirectory({ issues }) {
  const [type, setType] = useState('All types')
  const [sev, setSev] = useState('all')
  const [src, setSrc] = useState('All sources')

  /* Derived from the data rather than listed, so a new issue type in
     lib/issues.js cannot silently go unfilterable. */
  const types = useMemo(
    () => ['All types', ...Array.from(new Set(issues.map((issue) => issue.type))).sort()],
    [issues],
  )

  const sevCounts = useMemo(
    () =>
      issues.reduce((acc, issue) => {
        acc[issue.sev] = (acc[issue.sev] || 0) + 1
        return acc
      }, {}),
    [issues],
  )

  const shown = useMemo(
    () =>
      issues
        .filter((issue) => type === 'All types' || issue.type === type)
        .filter((issue) => sev === 'all' || issue.sev === sev)
        .filter((issue) => src === 'All sources' || issue.src === src)
        .slice()
        .sort(
          (a, b) =>
            SEV_RANK[a.sev] - SEV_RANK[b.sev] || b.measuredAt.localeCompare(a.measuredAt),
        ),
    [issues, type, sev, src],
  )

  const filtered = type !== 'All types' || sev !== 'all' || src !== 'All sources'

  const clear = () => {
    setType('All types')
    setSev('all')
    setSrc('All sources')
  }

  return (
    <div className={styles.layout}>
      <aside className={styles.sidebar}>
        <div className={styles.group} role="group" aria-label="Filter by issue type">
          <h2 className={styles.groupLabel}>Issue type</h2>
          <div className={styles.chips}>
            {types.map((option) => (
              <button
                key={option}
                type="button"
                className={`${styles.chip} ${option === type ? styles.chipOn : ''}`.trim()}
                aria-pressed={option === type}
                onClick={() => setType(option)}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.group} role="group" aria-label="Filter by priority">
          <h2 className={styles.groupLabel}>Priority</h2>
          <div className={styles.chips}>
            <button
              type="button"
              className={`${styles.chip} ${sev === 'all' ? styles.chipOn : ''}`.trim()}
              aria-pressed={sev === 'all'}
              onClick={() => setSev('all')}
            >
              All priorities
            </button>
            {SEVERITY_RULE.map((rule) => (
              <button
                key={rule.level}
                type="button"
                className={`${styles.chip} ${sev === rule.level ? styles.chipOn : ''}`.trim()}
                aria-pressed={sev === rule.level}
                onClick={() => setSev(rule.level)}
              >
                <span className={`${styles.dot} ${SEV_TAG[rule.level]}`} aria-hidden="true" />
                {SEVERITY_SHORT[rule.level]}
                <span className={styles.chipCount}>{sevCounts[rule.level] || 0}</span>
              </button>
            ))}
          </div>
        </div>

        <div className={styles.group} role="group" aria-label="Filter by source">
          <h2 className={styles.groupLabel}>Source</h2>
          <div className={styles.chips}>
            {SOURCES.map((option) => (
              <button
                key={option}
                type="button"
                className={`${styles.chip} ${option === src ? styles.chipOn : ''}`.trim()}
                aria-pressed={option === src}
                onClick={() => setSrc(option)}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.legend}>
          <h2 className={styles.groupLabel}>How priority is scored</h2>
          {SEVERITY_RULE.map((rule) => (
            <div key={rule.level} className={styles.legendRow}>
              <span className={`${styles.swatch} ${SEV_TAG[rule.level]}`} aria-hidden="true" />
              <div>
                <b>{rule.label}</b>
                <p>{rule.rule}</p>
              </div>
            </div>
          ))}
          <p className={styles.legendFoot}>
            Staleness is checked first, so a year-old larvae confirmation scores low rather
            than high. The full rule is on the{' '}
            <Link href="/data" className={styles.inlineLink}>
              data page
            </Link>
            .
          </p>
        </div>
      </aside>

      <section className={styles.results} aria-label="Reports">
        <div className={styles.resultsHead}>
          <p className={styles.count}>
            Showing <b>{shown.length}</b> of {issues.length} open reports
          </p>
          {filtered && (
            <button type="button" className={styles.clear} onClick={clear}>
              Clear filters
            </button>
          )}
        </div>

        {shown.length === 0 ? (
          <p className={styles.empty}>
            No reports match those filters. Nothing open of that kind is a good outcome —
            widen the filters to see the rest.
          </p>
        ) : (
          <div className={styles.grid}>
            {shown.map((issue) => (
              <article key={issue.id} className={styles.card}>
                <div className={styles.cardTop}>
                  <span className={`${styles.sevTag} ${SEV_TAG[issue.sev]}`}>
                    {SEVERITY_SHORT[issue.sev]}
                  </span>
                  <span className={styles.srcTag}>{issue.src}</span>
                </div>

                <h3>{issue.type}</h3>
                <p className={styles.loc}>{issue.loc}</p>
                <p className={styles.detail}>{issue.detail}</p>

                <div className={styles.meta}>
                  <span>{issue.when}</span>
                  <span>
                    {issue.reports} {issue.reports === 1 ? 'neighbor' : 'neighbors'} flagged it
                  </span>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
