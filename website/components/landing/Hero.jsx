import styles from './landing.module.css'

export default function Hero() {
  return (
    <header className={styles.hero}>
      <div className="wrap">
        <div className={styles.eyebrowPill}>
          <span className={styles.nasa}>Seeded with NASA data</span> GLOBE Observer standing
          water sites
        </div>

        <h1 className={styles.title}>Everyone wants to help. Nobody knows where.</h1>
        <p className={styles.sub}>Report a problem. Organize the cleanup. Bring the block.</p>

        <div className={styles.ctaRow}>
          <button type="button" className="btn btn-dark">
            Get started. It&apos;s free.
          </button>
          <div className={styles.ctaNote}>
            Free forever.
            <br />
            No account needed to volunteer.
          </div>
        </div>
      </div>
    </header>
  )
}
