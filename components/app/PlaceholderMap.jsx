'use client'

import { project } from '@/lib/geo'

import styles from './app.module.css'

/**
 * A schematic city grid with the pins projected onto it.
 *
 * Deliberately not a real basemap. It has no network dependency, so it always
 * renders — in a dead conference hall, behind a captive portal, in a
 * screenshot. `lib/geo.js#project` is the seam: pins carry real coordinates
 * and this only decides where they land, so swapping in MapLibre means
 * replacing this component and nothing else.
 */
export default function PlaceholderMap({ issues, selectedId, onSelect, me }) {
  const placed = issues
    .map((issue) => ({ issue, at: project(issue.lat, issue.lng) }))
    .filter((p) => p.at)

  const mePos = me ? project(me.lat, me.lng) : null

  return (
    <>
      <svg viewBox="0 0 400 460" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <rect width="400" height="460" fill="#eef0f2" />
        <rect x="16" y="14" width="150" height="100" rx="3" fill="#e2e6e9" />
        <rect x="190" y="14" width="118" height="100" rx="3" fill="#e2e6e9" />
        <rect x="332" y="14" width="84" height="100" rx="3" fill="#e2e6e9" />
        <rect x="16" y="140" width="150" height="112" rx="3" fill="#e2e6e9" />
        <rect x="190" y="140" width="118" height="112" rx="3" fill="#dfe8e2" />
        <rect x="332" y="140" width="84" height="112" rx="3" fill="#e2e6e9" />
        <rect x="16" y="278" width="150" height="100" rx="3" fill="#e2e6e9" />
        <rect x="190" y="278" width="118" height="100" rx="3" fill="#e2e6e9" />
        <rect x="332" y="278" width="84" height="100" rx="3" fill="#e2e6e9" />
        <rect x="16" y="404" width="150" height="80" rx="3" fill="#e2e6e9" />
        <rect x="190" y="404" width="118" height="80" rx="3" fill="#dfe8e2" />
        <rect x="332" y="404" width="84" height="80" rx="3" fill="#e2e6e9" />
        <path
          d="M0 126h400M0 264h400M0 390h400M176 0v460M318 0v460"
          stroke="#fbfcfc"
          strokeWidth="12"
          fill="none"
        />
        <path
          d="M-8 198c50 24 84-6 132 14s78 52 134 38 60-28 60-28"
          stroke="#cfe0ea"
          strokeWidth="10"
          fill="none"
          strokeLinecap="round"
        />
      </svg>

      <div className={styles.pinLayer}>
        {placed.map(({ issue, at }, index) => (
          <button
            key={issue.id}
            type="button"
            className={[
              styles.pin,
              issue.done ? styles.pinDone : '',
              selectedId === issue.id ? styles.pinSelected : '',
              index === 0 && !issue.done && issue.sev === 'high' ? styles.pinPulse : '',
            ]
              .filter(Boolean)
              .join(' ')}
            data-sev={issue.sev}
            style={{ left: `${at.x}%`, top: `${at.y}%` }}
            aria-label={`${issue.type} at ${issue.loc}`}
            onClick={() => onSelect(issue.id)}
          />
        ))}

        {mePos && (
          <div
            className={styles.mePin}
            style={{ left: `${mePos.x}%`, top: `${mePos.y}%` }}
            role="img"
            aria-label="Your location"
          />
        )}
      </div>
    </>
  )
}
