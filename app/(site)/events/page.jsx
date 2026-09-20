import Link from 'next/link'

import CommunityBoard from '@/components/demo/CommunityBoard'
import { SEED_EVENTS } from '@/lib/board'
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
          Every event on the {config.defaultCity} board. No account needed to show up — pick
          one, sign up, and turn up.
        </p>
      </div>

      <div className={`wrap ${styles.section}`}>
        <div className={styles.boardLayout}>
          <CommunityBoard events={SEED_EVENTS} />

          <aside className={styles.boardAside}>
            <h2>Signing up</h2>
            <ol className={styles.boardSteps}>
              <li>Pick an event and press Sign up.</li>
              <li>
                Give your name and email so the organizer can reach you, plus how many people
                you are bringing.
              </li>
              <li>That is it — no account, no password, no app to install.</li>
            </ol>
            <p className={styles.boardAsideFoot}>
              This board is demo state: signups live in the page and a reload clears them.
              Want to run one of these instead?{' '}
              <Link href="/organizers" style={{ textDecoration: 'underline' }}>
                Organizing takes about two minutes.
              </Link>
            </p>
          </aside>
        </div>
      </div>
    </main>
  )
}
