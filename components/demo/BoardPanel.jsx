import { SEED_EVENTS } from '@/lib/board'
import { config } from '@/lib/config'

import CommunityBoard from './CommunityBoard'
import styles from './demo.module.css'

/** Stage 0 — the resting state: what is already being organized nearby. */
export default function BoardPanel({ onInteract }) {
  return (
    <>
      <h3 className={styles.panelTitle}>{config.defaultCity} community board</h3>
      <p className={styles.lede}>
        Everything neighbors are organizing right now. Anyone can see it. Anyone can join.
      </p>

      <CommunityBoard events={SEED_EVENTS} onInteract={onInteract} />

      <div className={styles.callout}>
        The map opens with {config.seededSiteCount} standing water sites already on it, pulled
        from NASA&apos;s GLOBE Observer. Nobody has to fill an empty map before the app is
        useful.
      </div>
    </>
  )
}
