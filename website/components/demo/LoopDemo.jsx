'use client'

import { useState } from 'react'

import { citySlug } from '@/lib/config'
import { getIssue } from '@/lib/issues'

import BoardPanel from './BoardPanel'
import DraftPanel from './DraftPanel'
import IssuePanel from './IssuePanel'
import PhoneFrame from './PhoneFrame'
import PublishedPanel from './PublishedPanel'
import StepTracker from './StepTracker'
import styles from './demo.module.css'

/**
 * Orchestrates the four-stage walkthrough.
 *
 * The original page mutated the DOM directly; here the stage and the selected
 * issue are the only state, and the phone plus the panel are both derived from
 * them. Keying the panel on `stage` re-runs the entry animation on each step.
 */
export default function LoopDemo() {
  const [stage, setStage] = useState(0)
  const [current, setCurrent] = useState(null)

  const selectIssue = (id) => {
    setCurrent(getIssue(id))
    setStage(1)
  }

  const reset = () => {
    setCurrent(null)
    setStage(0)
  }

  const panels = [
    <BoardPanel key="board" />,
    current && <IssuePanel issue={current} onOrganize={() => setStage(2)} onReset={reset} />,
    current && <DraftPanel issue={current} onPublish={() => setStage(3)} onReset={reset} />,
    current && <PublishedPanel issue={current} onReset={reset} />,
  ]

  return (
    <section className={styles.demoSection}>
      <div className="wrap">
        <div className={styles.demoHead}>
          <h2>Try the loop</h2>
          <p>
            One problem on a map becomes an event on a public board. Tap a pin in the phone to
            start.
          </p>
        </div>

        <div className={styles.stage}>
          <div className={styles.stageBar}>
            <div className={styles.tl}>
              <i />
              <i />
              <i />
            </div>
            <div className={styles.stageUrl}>rally.org/{citySlug}</div>
          </div>

          <div className={styles.stageBody}>
            <PhoneFrame current={current} stage={stage} onSelectIssue={selectIssue} />

            <div className={styles.panel}>
              <StepTracker stage={stage} />
              <div key={stage} className={styles.view}>
                {panels[stage]}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
