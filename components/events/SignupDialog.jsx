'use client'

import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

import styles from './events.module.css'

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const EMPTY = { name: '', email: '', phone: '', party: '1', org: '' }

/** Tab-trap query. Disabled controls are skipped, as the browser skips them. */
const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

/**
 * Signing up for an event, as a desktop dialog.
 *
 * Same field set and same validation as the in-app bottom sheet
 * (`components/app/SignupSheet.jsx`), because someone who joins from the
 * website and someone who joins in the app have to hand the organizer the
 * same information. The shape is deliberately different: this one has a wide
 * viewport to work with, so the event being joined stays beside the form
 * instead of scrolling away above it.
 *
 * Rendered through a portal into <body>. The landing walkthrough draws the
 * board inside a panel whose ancestors set `overflow: hidden` and keep a
 * `translate` from the stage animation — either one would trap a fixed
 * overlay inside the panel rather than letting it cover the page.
 *
 * Nothing persists. `onSubmit` hands the details to the caller's local state.
 */
export default function SignupDialog({ open, event, onClose, onSubmit }) {
  const [form, setForm] = useState(EMPTY)
  const [error, setError] = useState('')
  const [done, setDone] = useState(null)

  const dialogRef = useRef(null)
  const firstFieldRef = useRef(null)
  const confirmRef = useRef(null)
  const openedFrom = useRef(null)
  const onCloseRef = useRef(onClose)

  useEffect(() => {
    onCloseRef.current = onClose
  })

  /*
   * Reset on the way in, not on the way out. There is more than one exit —
   * Cancel, Escape and the backdrop — and only the entrance is guaranteed to
   * run for all of them. Clearing on exit let the next event open straight
   * onto the previous event's confirmation.
   */
  useEffect(() => {
    if (!open) return
    setForm(EMPTY)
    setError('')
    setDone(null)
  }, [open])

  /*
   * Focus, Escape, the tab trap and the scroll lock.
   *
   * This effect depends on `open` alone. `onClose` is a fresh closure on
   * every parent render, so listing it here would re-run the effect — and
   * with it the .focus() call — on every keystroke, pulling the caret out of
   * whichever input is being typed in. The handler is read through a ref so
   * it stays current without being a dependency.
   */
  useEffect(() => {
    if (!open) return undefined

    openedFrom.current = document.activeElement
    firstFieldRef.current?.focus()

    const { body } = document
    const restoreOverflow = body.style.overflow
    body.style.overflow = 'hidden'

    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        onCloseRef.current()
        return
      }
      if (e.key !== 'Tab') return

      const nodes = dialogRef.current?.querySelectorAll(FOCUSABLE)
      if (!nodes?.length) return

      const first = nodes[0]
      const last = nodes[nodes.length - 1]

      /* Wrap at both ends so tabbing cannot walk out into the page behind. */
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown)

    return () => {
      document.removeEventListener('keydown', onKeyDown)
      body.style.overflow = restoreOverflow

      /*
       * Hand focus back to the button that opened this. Without it focus
       * lands on <body>, so a keyboard user restarts their tab journey from
       * the top of the page every time they close the dialog.
       */
      const previous = openedFrom.current
      if (previous?.isConnected && typeof previous.focus === 'function') previous.focus()
    }
  }, [open])

  /*
   * The confirmation replaces the form, so the button that had focus is gone
   * by the time it renders. `done` is local state that flips once, on submit
   * — unlike a prop, it cannot re-fire this while someone is typing.
   */
  useEffect(() => {
    if (!done) return
    confirmRef.current?.focus()
  }, [done])

  if (!open || !event) return null

  const set = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }))

  const submit = (e) => {
    e.preventDefault()

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
    const phone = form.phone.trim()
    const org = form.org.trim()

    setError('')
    onSubmit?.(party, { name, email, phone, org })
    setDone({ name, email, party, phone, org })
  }

  /*
   * Close on the backdrop, keyed to mousedown rather than click: a click
   * fires wherever the button is released, so selecting text inside the
   * dialog and letting go outside it would otherwise throw the form away.
   */
  const onBackdrop = (e) => {
    if (e.target === e.currentTarget) onClose()
  }

  const badName = Boolean(error) && !form.name.trim()
  const badEmail = Boolean(error) && !EMAIL.test(form.email.trim())

  return createPortal(
    <div className={styles.overlay} onMouseDown={onBackdrop}>
      <div
        ref={dialogRef}
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby="signup-dialog-title"
      >
        <aside className={styles.aside}>
          <div className={styles.asideDate}>
            <span className={styles.asideMonth}>{event.m}</span>
            <span className={styles.asideDay}>{event.d}</span>
          </div>

          <h3 className={styles.asideTitle}>{event.title}</h3>

          <dl className={styles.asideMeta}>
            <div>
              <dt>When</dt>
              <dd>{event.when}</dd>
            </div>
            <div>
              <dt>Host</dt>
              <dd>{event.host}</dd>
            </div>
            <div>
              <dt>Bring</dt>
              <dd>{event.bring || 'Gloves and water'}</dd>
            </div>
            <div>
              <dt>Going</dt>
              <dd>{event.going} so far</dd>
            </div>
          </dl>

          <p className={styles.asideFoot}>
            No account needed. Your details go to the organizer so they can reach you if the
            time moves or it rains.
          </p>
        </aside>

        <div className={styles.main}>
          <button
            type="button"
            className={styles.close}
            onClick={onClose}
            aria-label="Close signup"
          >
            <svg width="15" height="15" viewBox="0 0 15 15" aria-hidden="true">
              <path
                d="M2 2 13 13M13 2 2 13"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            </svg>
          </button>

          {done ? (
            <div ref={confirmRef} tabIndex={-1} className={styles.pane}>
              <div className={styles.tick} aria-hidden="true">
                <svg width="16" height="16" viewBox="0 0 17 17">
                  <path
                    d="M3.5 9l3.2 3.2L13.5 5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.1"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>

              <h2 id="signup-dialog-title" className={styles.title}>
                You are on the list
              </h2>
              <p className={styles.lede}>
                Thanks {done.name.split(' ')[0]}. The organizer has your details — nothing else
                to do until the day.
              </p>

              <dl className={styles.summary}>
                <div>
                  <dt>Event</dt>
                  <dd>{event.title}</dd>
                </div>
                <div>
                  <dt>When</dt>
                  <dd>{event.when}</dd>
                </div>
                <div>
                  <dt>Going</dt>
                  <dd>
                    {done.party === 1
                      ? 'You'
                      : `You and ${done.party - 1} other${done.party > 2 ? 's' : ''}`}
                  </dd>
                </div>
                <div>
                  <dt>Confirmation to</dt>
                  <dd>{done.email}</dd>
                </div>
                {done.phone && (
                  <div>
                    <dt>Phone</dt>
                    <dd>{done.phone}</dd>
                  </div>
                )}
                {done.org && (
                  <div>
                    <dt>With</dt>
                    <dd>{done.org}</dd>
                  </div>
                )}
                <div>
                  <dt>Bring</dt>
                  <dd>{event.bring || 'Gloves and water'}</dd>
                </div>
              </dl>

              <p className={styles.hint}>
                Nothing is stored yet — this is a demo board, so a reload clears it.
              </p>

              <div className={styles.actions}>
                <button type="button" className={styles.primary} onClick={onClose}>
                  Done
                </button>
              </div>
            </div>
          ) : (
            <form className={styles.pane} onSubmit={submit} noValidate>
              <h2 id="signup-dialog-title" className={styles.title}>
                Sign up to join
              </h2>
              <p className={styles.lede}>
                Two required fields. The rest helps the organizer plan supplies.
              </p>

              <div className={styles.grid}>
                <div className={styles.field}>
                  <label htmlFor="sd-name">Your name</label>
                  <input
                    id="sd-name"
                    ref={firstFieldRef}
                    autoComplete="name"
                    placeholder="Jordan Alvarez"
                    value={form.name}
                    onChange={set('name')}
                    aria-invalid={badName || undefined}
                    aria-describedby={error ? 'sd-error' : undefined}
                  />
                </div>

                <div className={styles.field}>
                  <label htmlFor="sd-email">Email</label>
                  <input
                    id="sd-email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@ufl.edu"
                    value={form.email}
                    onChange={set('email')}
                    aria-invalid={badEmail || undefined}
                    aria-describedby={error ? 'sd-error' : undefined}
                  />
                </div>

                <div className={styles.field}>
                  <label htmlFor="sd-phone">
                    Phone<span className={styles.tag}>optional</span>
                  </label>
                  <input
                    id="sd-phone"
                    type="tel"
                    autoComplete="tel"
                    placeholder="352 555 0148"
                    value={form.phone}
                    onChange={set('phone')}
                  />
                </div>

                <div className={styles.field}>
                  <label htmlFor="sd-party">How many of you</label>
                  <input
                    id="sd-party"
                    type="number"
                    min="1"
                    max="50"
                    inputMode="numeric"
                    value={form.party}
                    onChange={set('party')}
                  />
                </div>

                <div className={`${styles.field} ${styles.fieldFull}`}>
                  <label htmlFor="sd-org">
                    Group or org<span className={styles.tag}>optional</span>
                  </label>
                  <input
                    id="sd-org"
                    placeholder="UF Circle K"
                    value={form.org}
                    onChange={set('org')}
                  />
                </div>
              </div>

              {error && (
                <p id="sd-error" className={styles.error} role="alert">
                  {error}
                </p>
              )}

              <div className={styles.actions}>
                <button type="submit" className={styles.primary}>
                  Count me in
                </button>
                <button type="button" className={styles.ghost} onClick={onClose}>
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>,
    document.body,
  )
}
