'use client'

import { useState } from 'react'

import { MAP_BOUNDS, inBounds, isValidCoord } from '@/lib/geo'
import { ISSUE_TYPES } from '@/lib/issues'

import styles from './app.module.css'

/**
 * Layer 2 — a resident report.
 *
 * The location field is pre-filled from the device once the locate button has
 * run, and stays editable either way: a phone held indoors can be a hundred
 * metres out, and someone reporting a site they walked past earlier needs to
 * correct it by hand.
 *
 * `edited` is null until the field is touched, rather than an empty string.
 * With an empty string as the sentinel, clearing the box would fall straight
 * back to the device coordinates and the field could never be emptied.
 */
export default function ReportScreen({ coords, onLocate, locating, locateError, onSubmit }) {
  const [type, setType] = useState(ISSUE_TYPES[0])
  const [edited, setEdited] = useState(null)
  const [note, setNote] = useState('')
  const [error, setError] = useState('')

  const value = edited ?? coords ?? ''
  const fromDevice = edited === null && Boolean(coords)

  /** A fresh fix should replace whatever was typed, so drop the edit. */
  const locate = () => {
    setEdited(null)
    onLocate()
  }

  const submit = () => {
    const parts = value.split(',')
    const lat = Number(parts[0]?.trim())
    const lng = Number(parts[1]?.trim())

    /*
     * Number('') is 0, so a bare comma would otherwise parse as a valid
     * (0, 0) off the coast of Africa. Both halves have to be present.
     */
    if (parts.length !== 2 || !parts[0].trim() || !parts[1].trim() || !isValidCoord(lat, lng)) {
      setError('Location needs to be two numbers, like 29.6516, -82.3248.')
      return
    }

    /*
     * Reject anything the map cannot draw. Without this the report is
     * accepted, the counter goes up, and the pin never appears — the worst
     * kind of failure, because it looks like it worked.
     */
    if (!inBounds(lat, lng, MAP_BOUNDS)) {
      setError('That spot is outside the Gainesville map. Check the numbers are not swapped.')
      return
    }

    setError('')
    onSubmit({ type, lat, lng, detail: note.trim() || 'Reported by a neighbor.' })
    setNote('')
    setEdited(null)
  }

  return (
    <div className={styles.pad}>
      <h1 className={styles.screenTitle}>Report an issue</h1>
      <p className={styles.screenLede}>
        Takes about ten seconds. Your report goes on the map for everyone nearby.
      </p>

      <div className={styles.field}>
        <label htmlFor="r-type">What&apos;s wrong</label>
        <select id="r-type" value={type} onChange={(e) => setType(e.target.value)}>
          {ISSUE_TYPES.map((option) => (
            <option key={option}>{option}</option>
          ))}
        </select>
      </div>

      <div className={styles.field}>
        <label htmlFor="r-loc">
          Where
          <span className={styles.tag}>
            {fromDevice ? 'from your device' : 'latitude, longitude'}
          </span>
        </label>
        <input
          id="r-loc"
          className={fromDevice ? styles.auto : undefined}
          value={value}
          placeholder="29.6516, -82.3248"
          inputMode="decimal"
          onChange={(e) => setEdited(e.target.value)}
        />
      </div>

      <p className={styles.fieldHint}>
        <button
          type="button"
          onClick={locate}
          disabled={locating}
          style={{ color: 'var(--a-accent)', fontWeight: 600, padding: 0 }}
        >
          {locating ? 'Finding you…' : 'Use my current location'}
        </button>
        {locateError ? ` · ${locateError}` : ''}
      </p>

      <div className={styles.field}>
        <label htmlFor="r-note">One line about it</label>
        <textarea
          id="r-note"
          value={note}
          placeholder="Water has been sitting here since the rain last week."
          onChange={(e) => setNote(e.target.value)}
        />
      </div>

      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}

      <button type="button" className={styles.cta} onClick={submit}>
        Add to the map
      </button>
    </div>
  )
}
