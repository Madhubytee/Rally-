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
 * Focus moves to the sheet on open and Escape closes it, which are the two
 * things a modal has to get right to be usable without a mouse.
 */
export default function Sheet({ open, onClose, labelledBy, children }) {
  const ref = useRef(null)

  useEffect(() => {
    if (!open) return undefined

    ref.current?.focus()

    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

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
