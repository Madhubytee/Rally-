'use client'

import styles from './demo.module.css'

const STEPS = ['Spot it', 'Open it', 'Plan it', 'Publish it']

/**
 * The four stages, and a way back to any of them.
 *
 * They are buttons rather than labels because the walkthrough advances itself:
 * anyone who wants to re-read a step they just watched go past needs a way to
 * return to it.
 */
export default function StepTracker({ stage, onJump }) {
  return (
    <div className={styles.panelSteps}>
      {STEPS.map((label, i) => {
        const classes = [styles.pstep]
        if (i === stage) classes.push(styles.pstepOn)
        if (i < stage) classes.push(styles.pstepPast)

        return (
          <button
            key={label}
            type="button"
            className={classes.join(' ')}
            aria-current={i === stage ? 'step' : undefined}
            onClick={() => onJump(i)}
          >
            <i>{i + 1}</i>
            {label}
          </button>
        )
      })}
    </div>
  )
}
