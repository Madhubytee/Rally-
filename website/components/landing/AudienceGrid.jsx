import styles from './landing.module.css'

const AUDIENCES = [
  {
    role: 'Resident',
    title: 'Report it in ten seconds',
    body: "Drop a pin where you're standing, pick what's wrong, write one line. No account, no forms, no city phone tree.",
  },
  {
    role: 'Organizer',
    title: 'See problems stacking up',
    body: 'Filter by issue type and watch where reports cluster. Turn any pin into an event with the location already filled in.',
  },
  {
    role: 'Student org',
    title: 'Find service hours nearby',
    body: 'Open the board, pick a Saturday, bring twelve people. The work is already located and already needed.',
  },
]

export default function AudienceGrid() {
  return (
    <section className={styles.who}>
      <div className="wrap">
        <h2>Most people would volunteer. They just never hear where.</h2>
        <div className={styles.whoGrid}>
          {AUDIENCES.map((item) => (
            <div key={item.role} className={styles.whoCell}>
              <div className={styles.role}>{item.role}</div>
              <h4>{item.title}</h4>
              <p>{item.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
