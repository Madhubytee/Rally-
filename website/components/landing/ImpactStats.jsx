import styles from './landing.module.css'

const STATS = [
  {
    n: '700M',
    body: (
      <>
        People infected by mosquito borne disease every year, <b>close to one in ten of us</b>.
      </>
    ),
  },
  {
    n: '152',
    body: (
      <>
        Locally acquired dengue cases in Florida this year, and <b>one confirmed death</b>.
      </>
    ),
  },
  {
    n: '0',
    body: (
      <>
        Drugs that cure dengue. <b>Removing standing water is the prevention</b>, which means it
        is work people can do.
      </>
    ),
  },
]

export default function ImpactStats() {
  return (
    <section className={styles.strip}>
      <div className={`wrap ${styles.stripGrid}`}>
        {STATS.map((stat) => (
          <div key={stat.n} className={styles.stat}>
            <div className={styles.statN}>{stat.n}</div>
            <p>{stat.body}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
