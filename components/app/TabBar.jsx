'use client'

import styles from './app.module.css'

const TABS = [
  {
    id: 'map',
    label: 'Map',
    path: 'M12 2C8.1 2 5 5.1 5 9c0 5.2 7 13 7 13s7-7.8 7-13c0-3.9-3.1-7-7-7Zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5Z',
  },
  {
    id: 'board',
    label: 'Board',
    path: 'M7 2v2H5a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-2V2h-2v2H9V2H7Zm12 8v9H5v-9h14Z',
  },
  { id: 'report', label: 'Report', path: 'M11 5h2v6h6v2h-6v6h-2v-6H5v-2h6V5Z' },
]

export default function TabBar({ tab, onChange }) {
  return (
    <nav className={styles.tabs} aria-label="Sections">
      {TABS.map((t) => (
        <button
          key={t.id}
          type="button"
          className={`${styles.tab} ${tab === t.id ? styles.tabOn : ''}`.trim()}
          aria-current={tab === t.id ? 'page' : undefined}
          onClick={() => onChange(t.id)}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d={t.path} />
          </svg>
          {t.label}
        </button>
      ))}
    </nav>
  )
}
