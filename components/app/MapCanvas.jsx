'use client'

import dynamic from 'next/dynamic'
import { useState } from 'react'

import PlaceholderMap from './PlaceholderMap'
import styles from './app.module.css'

/*
 * maplibre-gl touches `window` at import time, so it cannot be server
 * rendered. `ssr: false` is only legal inside a Client Component — this file
 * is the boundary that makes it legal.
 */
const CityMap = dynamic(() => import('./CityMap'), {
  ssr: false,
  loading: () => <div className={styles.mapLoading}>Loading the map…</div>,
})

/**
 * Chooses between the real basemap and the drawn fallback.
 *
 * The tiles come from a free service with no SLA. If it is unreachable — a
 * blocked network, a dead CDN, a conference wifi captive portal — the app
 * falls back to the schematic map rather than showing an empty grey box. The
 * pins carry real coordinates either way, so nothing is lost but the
 * streets.
 */
export default function MapCanvas({ issues, selectedId, onSelect, me }) {
  const [failed, setFailed] = useState(false)

  if (failed) {
    return (
      <>
        <PlaceholderMap issues={issues} selectedId={selectedId} onSelect={onSelect} me={me} />
        <div className={styles.mapFallbackNote}>
          Street map unavailable — showing a schematic. Pin positions are accurate.
        </div>
      </>
    )
  }

  return (
    <CityMap
      issues={issues}
      selectedId={selectedId}
      onSelect={onSelect}
      me={me}
      onError={() => setFailed(true)}
    />
  )
}
