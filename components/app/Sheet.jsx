'use client'

import { useEffect, useRef } from 'react'

import styles from './app.module.css'

/**
 * A bottom sheet.
 *
 * Kept mounted and translated off-screen so the open/close transition runs,
 * but flipped to `visibility: hidden` when closed — without that, a sheet
 * sitting below the fold is still focusable and screen readers still walk it.
 *
 * Focus moves to the sheet on open, Escape closes it, and focus returns to
 * whatever opened it on close.
 *
 * The effect depends on `open` alone. `onClose` is a fresh closure on every
 * parent render, so including it would re-run this on each keystroke and pull
 * focus out of the input the user is typing in — which made every form in
 * every sheet impossible to fill. The handler is read through a ref instead,
 * so it stays current without being a dependency.
 */
export default function Sheet({ open, onClose, labelledBy, children }) {
  const ref = useRef(null)
  const onCloseRef = useRef(onClose)
  const openedFrom = useRef(null)

  useEffect(() => {
    onCloseRef.current = onClose
  })

  useEffect(() => {
    if (!open) return undefined

    openedFrom.current = document.activeElement
    ref.current?.focus()

    const onKeyDown = (event) => {
      if (event.key === 'Escape') onCloseRef.current()
    }
    document.addEventListener('keydown', onKeyDown)

    return () => {
      document.removeEventListener('keydown', onKeyDown)

      /*
       * Hand focus back to the control that opened the sheet. Without this it
       * lands on <body>, because the element it was on has just been hidden —
       * so a keyboard user would restart their tab journey from the top of
       * the page every time they closed a sheet.
       */
      const previous = openedFrom.current
      if (previous?.isConnected && typeof previous.focus === 'function') {
        previous.focus()
      }
    }
  }, [open])

  return (
    <section
      ref={ref}
      className={`${styles.sheet} ${open ? styles.sheetOn : ''}`.trim()}
      role="dialog"
      aria-modal="true"
      aria-labelledby={labelledBy}
      aria-hidden={!open}
      tabIndex={-1}
    >
      <div className={styles.grip} />
      {children}
    </section>
  )
}
