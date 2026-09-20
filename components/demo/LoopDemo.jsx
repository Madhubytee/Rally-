'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

import { citySlug } from '@/lib/config'
import { ISSUES, getIssue } from '@/lib/issues'

import BoardPanel from './BoardPanel'
import DraftPanel from './DraftPanel'
import IssuePanel from './IssuePanel'
import PhoneFrame from './PhoneFrame'
import PublishedPanel from './PublishedPanel'
import StepTracker from './StepTracker'
import styles from './demo.module.css'

/** How long each stage holds before the walkthrough moves itself along. */
const STAGE_MS = [3600, 4200, 4200, 5200]

/** The pin the walkthrough opens on its own — the first confirmed site. */
const DEFAULT_ISSUE = ISSUES.find((issue) => issue.sev === 'high') || ISSUES[0]

/**
 * Orchestrates the four-stage walkthrough.
 *
 * It plays itself. Most people will not think to tap a pin in a mock phone,
 * and a static first frame gives away none of the product, so the loop runs
 * on a timer until someone takes over.
 *
 * Any real interaction — a pin, a button, a step — stops the timer for good
 * rather than pausing it. Something that resumes on its own would fight the
 * person for the cursor, which is the failure mode of most autoplaying UI.
 * Hover and keyboard focus pause it instead, so it cannot advance out from
 * under someone who is mid-read.
 */
export default function LoopDemo() {
  const [stage, setStage] = useState(0)
  const [current, setCurrent] = useState(null)
  const [playing, setPlaying] = useState(true)
  const [paused, setPaused] = useState(false)

  /*
   * Autoplay is an enhancement, so it starts off and is switched on after
   * mount. The server render and the first client render therefore agree, and
   * anyone who has asked for reduced motion never has it switched on at all.
   */
  const [ready, setReady] = useState(false)
  const reducedMotion = useRef(false)

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)')
    reducedMotion.current = query.matches
    setReady(!query.matches)
  }, [])

  const selectIssue = useCallback((id) => {
    setCurrent(getIssue(id))
    setStage(1)
  }, [])

  const reset = useCallback(() => {
    setCurrent(null)
    setStage(0)
  }, [])

  /** Hand the walkthrough over. Called by every control on the stage. */
  const takeOver = useCallback(() => setPlaying(false), [])

  /** Jump straight to a stage, filling in the issue the later ones need. */
  const goToStage = useCallback(
    (next) => {
      takeOver()
      if (next === 0) {
        reset()
        return
      }
      setCurrent((prev) => prev || DEFAULT_ISSUE)
      setStage(next)
    },
    [reset, takeOver],
  )

  useEffect(() => {
    if (!ready || !playing || paused) return undefined

    const timer = setTimeout(() => {
      setStage((prev) => {
        if (prev === 0) {
          setCurrent(DEFAULT_ISSUE)
          return 1
        }
        if (prev < 3) return prev + 1
        setCurrent(null)
        return 0
      })
    }, STAGE_MS[stage])

    return () => clearTimeout(timer)
  }, [ready, playing, paused, stage])

  const panels = [
    <BoardPanel key="board" />,
    current && (
      <IssuePanel
        issue={current}
        onOrganize={() => {
          takeOver()
          setStage(2)
        }}
        onReset={() => {
          takeOver()
          reset()
        }}
      />
    ),
    current && (
      <DraftPanel
        issue={current}
        onPublish={() => {
          takeOver()
          setStage(3)
        }}
        onReset={() => {
          takeOver()
          reset()
        }}
      />
    ),
    current && (
      <PublishedPanel
        issue={current}
        onReset={() => {
          takeOver()
          reset()
        }}
      />
    ),
  ]

  return (
    <section className={styles.demoSection}>
      <div className="wrap">
        <div className={styles.demoHead}>
          <h2>Try the loop</h2>
          <p>
            One problem on a map becomes an event on a public board. It runs on its own — tap
            any pin or step to take over.
          </p>
        </div>

        <div
          className={styles.stage}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onFocusCapture={() => setPaused(true)}
          onBlurCapture={() => setPaused(false)}
        >
          <div className={styles.stageBar}>
            <div className={styles.tl}>
              <i />
              <i />
              <i />
            </div>
            <div className={styles.stageUrl}>rally.org/{citySlug}</div>
          </div>

          <div className={styles.stageBody}>
            <PhoneFrame
              current={current}
              stage={stage}
              onSelectIssue={(id) => {
                takeOver()
                selectIssue(id)
              }}
            />

            <div className={styles.panel}>
              <StepTracker stage={stage} onJump={goToStage} />
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
