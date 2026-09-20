import Link from 'next/link'

import styles from '../routes.module.css'

export const metadata = {
  title: 'Organizers — Rally',
  description: 'Turn a cluster of reports into a Saturday morning with twelve people.',
}

const STEPS = [
  {
    kicker: 'Step one',
    title: 'Find where reports stack up',
    body: 'Filter the map by issue type. Repeat reports on one spot are the signal — seven flags in a morning is a different problem than one flag in a week.',
  },
  {
    kicker: 'Step two',
    title: 'Convert a pin, do not start a form',
    body: 'An event inherits the location, the issue type and the suggested supplies from the report it came from. You add a date, a time, and a headcount.',
  },
  {
    kicker: 'Step three',
    title: 'Publish and let the block find it',
    body: 'Publishing generates a shareable flyer and posts the event to the public board. Everyone within a mile sees it without being invited.',
  },
]

export default function OrganizersPage() {
  return (
    <main>
      <div className="wrap page-head">
        <h1>You do not need a nonprofit to run a cleanup</h1>
        <p>
          Rally is built so a student org, a neighborhood association, or one motivated person
          can put work on the calendar in about two minutes.
        </p>
      </div>

      <div className={`wrap ${styles.section}`}>
        <div className={styles.cardGrid}>
          {STEPS.map((step) => (
            <div key={step.title} className={styles.card}>
              <div className={styles.cardKicker}>{step.kicker}</div>
              <h3>{step.title}</h3>
              <p>{step.body}</p>
            </div>
          ))}
        </div>

        <p className={styles.note}>
          Organizer accounts are not built yet. The{' '}
          <Link href="/" style={{ textDecoration: 'underline' }}>
            walkthrough on the home page
          </Link>{' '}
          shows the full pin-to-published flow end to end.
        </p>
      </div>
    </main>
  )
}
