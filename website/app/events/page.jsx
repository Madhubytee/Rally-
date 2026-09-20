import CommunityBoard from '@/components/demo/CommunityBoard'
import { BOARD } from '@/lib/board'
import { config } from '@/lib/config'

import styles from '../routes.module.css'

export const metadata = {
  title: 'Events — Rally',
  description: 'The public board of volunteer events neighbors are organizing right now.',
}

export default function EventsPage() {
  return (
    <main>
      <div className="wrap page-head">
        <h1>What the block is doing this week</h1>
        <p>
          Every event on the {config.defaultCity} board. No account needed to show up — pick one
          and turn up.
        </p>
      </div>

      <div className={`wrap ${styles.section}`}>
        <CommunityBoard events={BOARD} />
      </div>
    </main>
  )
}
