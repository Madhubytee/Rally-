import { SEED_EVENTS } from '@/lib/board'
import { config } from '@/lib/config'
import { LAYER_COUNTS } from '@/lib/issues'

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

      {/*
        The count is read from the data, not typed. It used to say 412 — an
        env-file placeholder nobody had revisited — while the actual archive
        holds six. A civic tool that inflates its own evidence on the landing
        page has lost the argument before anyone opens the map.
      */}
      <div className={styles.callout}>
        The map opens already seeded from NASA&apos;s GLOBE Observer — all{' '}
        {LAYER_COUNTS.globe} standing water records the archive holds for Alachua County.
        Thin, which is the point: {LAYER_COUNTS.resident} resident reports sit beside them,
        and that is the half a satellite cannot collect.
      </div>
    </>
  )
}
