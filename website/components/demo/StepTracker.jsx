import styles from './demo.module.css'

const STEPS = ['Spot it', 'Open it', 'Plan it', 'Publish it']

export default function StepTracker({ stage }) {
  return (
    <div className={styles.panelSteps}>
      {STEPS.map((label, i) => {
        const classes = [styles.pstep]
        if (i === stage) classes.push(styles.pstepOn)
        if (i < stage) classes.push(styles.pstepPast)

        return (
          <div key={label} className={classes.join(' ')}>
            <i>{i + 1}</i>
            {label}
          </div>
        )
      })}
    </div>
  )
}
