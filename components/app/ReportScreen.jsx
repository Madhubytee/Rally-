'use client'

import { useState } from 'react'

import { ISSUE_TYPES } from '@/lib/issues'

import styles from './app.module.css'

/**
 * Layer 2 — a resident report.
 *
 * The location field is pre-filled from the device when the map's locate
 * button has already run, and stays editable either way: a phone held indoors
 * can be a hundred metres out, and someone reporting a site they walked past
 * earlier needs to correct it by hand.
 */
export default function ReportScreen({ coords, onLocate, locating, locateError, onSubmit }) {
  const [type, setType] = useState(ISSUE_TYPES[0])
  const [loc, setLoc] = useState('')
  const [note, setNote] = useState('')
  const [error, setError] = useState('')

  const value = loc || coords || ''

  const submit = () => {
    const parsed = value.split(',').map((part) => Number(part.trim()))

    if (parsed.length !== 2 || !Number.isFinite(parsed[0]) || !Number.isFinite(parsed[1])) {
      setError('Location needs to be two numbers, like 29.6516, -82.3248.')
      return
    }

    setError('')
    onSubmit({
      type,
      lat: parsed[0],
      lng: parsed[1],
      detail: note.trim() || 'Reported by a neighbor.',
    })
    setNote('')
    setLoc('')
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
          <span className={styles.tag}>{coords ? 'from your device' : 'latitude, longitude'}</span>
        </label>
        <input
          id="r-loc"
          className={coords && !loc ? styles.auto : undefined}
          value={value}
          placeholder="29.6516, -82.3248"
          onChange={(e) => setLoc(e.target.value)}
        />
      </div>

      <p className={styles.fieldHint}>
        <button
          type="button"
          onClick={onLocate}
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

      {error && <p className={styles.error}>{error}</p>}

      <button type="button" className={styles.cta} onClick={submit}>
        Add to the map
      </button>
    </div>
  )
}
