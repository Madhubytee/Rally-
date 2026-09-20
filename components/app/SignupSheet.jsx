'use client'

import { useState } from 'react'

import Sheet from './Sheet'
import styles from './app.module.css'

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/**
 * Joining an event. No account, by design — asking someone to register before
 * they can show up to a two-hour cleanup loses most of them at the form.
 *
 * Name and email are the minimum the organizer needs to reach people if the
 * time moves or it rains. Everything else is optional.
 */
export default function SignupSheet({ open, event, onClose, onSubmit }) {
  const [form, setForm] = useState({ name: '', email: '', phone: '', party: '1', org: '' })
  const [error, setError] = useState('')
  const [done, setDone] = useState(null)

  const set = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }))

  const close = () => {
    onClose()
    /*
     * Reset after the close transition, not during it — clearing immediately
     * makes the confirmation flicker back to an empty form on the way out.
     */
    setTimeout(() => {
      setDone(null)
      setError('')
      setForm({ name: '', email: '', phone: '', party: '1', org: '' })
    }, 250)
  }

  const submit = () => {
    const name = form.name.trim()
    const email = form.email.trim()

    if (!name || !email) {
      setError('Name and email are both needed so the organizer can reach you.')
      return
    }
    if (!EMAIL.test(email)) {
      setError('That email address does not look right.')
      return
    }

    const party = Math.min(50, Math.max(1, parseInt(form.party, 10) || 1))
    setError('')
    onSubmit(party)
    setDone({ name, email, party })
  }

  return (
    <Sheet open={open} onClose={close} labelledBy="signup-sheet-title">
      {event && !done && (
        <>
          <h1 id="signup-sheet-title" className={styles.sheetTitle}>
            Sign up
          </h1>
          <p style={{ margin: '0 0 4px', fontSize: '14.5px', fontWeight: 600 }}>{event.title}</p>
          <p className={styles.sheetLede}>
            {event.when} · {event.host}
          </p>

          <div className={styles.field}>
            <label htmlFor="su-name">Your name</label>
            <input
              id="su-name"
              autoComplete="name"
              placeholder="Jordan Alvarez"
              value={form.name}
              onChange={set('name')}
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="su-email">Email</label>
            <input
              id="su-email"
              type="email"
              autoComplete="email"
              placeholder="you@ufl.edu"
              value={form.email}
              onChange={set('email')}
            />
          </div>

          <div className={styles.two}>
            <div className={styles.field}>
              <label htmlFor="su-phone">
                Phone<span className={styles.tag}>optional</span>
              </label>
              <input
                id="su-phone"
                type="tel"
                autoComplete="tel"
                placeholder="352 555 0148"
                value={form.phone}
                onChange={set('phone')}
              />
            </div>
            <div className={styles.field}>
              <label htmlFor="su-party">How many of you</label>
              <input
                id="su-party"
                type="number"
                min="1"
                max="50"
                value={form.party}
                onChange={set('party')}
              />
            </div>
          </div>

          <div className={styles.field}>
            <label htmlFor="su-org">
              Group or org<span className={styles.tag}>optional</span>
            </label>
            <input id="su-org" placeholder="UF Circle K" value={form.org} onChange={set('org')} />
          </div>

          {error && (
            <p className={styles.error} role="alert">
              {error}
            </p>
          )}

          <button type="button" className={styles.cta} onClick={submit}>
            Count me in
          </button>
          <button type="button" className={`${styles.cta} ${styles.ctaGhost} ${styles.ctaSm}`} onClick={close}>
            Cancel
          </button>
        </>
      )}

      {event && done && (
        <>
          <h1 id="signup-sheet-title" className={styles.sheetTitle}>
            You&apos;re on the list
          </h1>
          <p className={styles.sheetLede}>
            Thanks {done.name.split(' ')[0]}. The organizer has your details.
          </p>

          <div className={styles.kv}>
            <div className={styles.kvK}>Going</div>
            <div className={styles.kvV}>
              {done.party === 1
                ? 'You'
                : `You and ${done.party - 1} other${done.party > 2 ? 's' : ''}`}
            </div>

            <div className={styles.kvK}>When</div>
            <div className={styles.kvV}>{event.when}</div>

            <div className={styles.kvK}>Bring</div>
            <div className={styles.kvV}>{event.bring || 'Gloves and water'}</div>

            <div className={styles.kvK}>Confirmation</div>
            <div className={styles.kvV}>{done.email}</div>
          </div>

          <div className={styles.note}>
            Add it to your calendar and bring one person who was not going to come.
          </div>

          <button type="button" className={styles.cta} onClick={close}>
            Done
          </button>
        </>
      )}
    </Sheet>
  )
}
