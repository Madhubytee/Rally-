import { config } from '@/lib/config'

import styles from '../routes.module.css'

export const metadata = {
  title: 'Data — Rally',
  description:
    'Where Rally gets its pins, how priority is scored, and what the cleaning rules are.',
}

const SCORING = [
  {
    kicker: 'High',
    title: 'Larvae confirmed',
    body: 'An observer sampled the site and found larvae, so it is actively producing mosquitoes. These are the pins worth a Saturday.',
  },
  {
    kicker: 'Medium',
    title: 'Water logged, no larvae found',
    body: 'Standing water was recorded but no larvae were found, or no sample was taken at all. Still worth clearing — this is the cheapest point to intervene.',
  },
  {
    kicker: 'Low',
    title: 'Last observed over a year ago',
    body: 'The site may have resolved on its own. Kept on the map, ranked below anything current.',
  },
]

export default function DataPage() {
  return (
    <main>
      <div className="wrap page-head">
        <h1>Where the pins come from</h1>
        <p>
          Rally is seeded with NASA GLOBE Observer participatory science records so the map is
          useful before the first resident ever opens it. The scoring rule is printed here
          rather than hidden, so anyone can audit it.
        </p>
      </div>

      <div className={`wrap ${styles.section}`}>
        <div className={styles.note}>
          Honest status: the GLOBE Observer import is not wired up yet. The pins currently on
          the site are demo records shaped like real ones, and the configuration below is what
          the import will run against.
        </div>

        <h2 className={styles.subhead}>The three layers</h2>
        <div className={styles.cardGrid}>
          <div className={styles.card}>
            <div className={styles.cardKicker}>Layer 1</div>
            <h3>GLOBE Observer</h3>
            <p>
              Mosquito Habitat Mapper records: someone found standing water, logged where it
              was, and reported whether larvae were present. Collected through NASA&apos;s
              GLOBE Observer app.
            </p>
          </div>
          <div className={styles.card}>
            <div className={styles.cardKicker}>Layer 2</div>
            <h3>Resident reports</h3>
            <p>
              Filed inside Rally, in the same shape as layer 1 so both render identically:
              coordinates, type, one line of description, timestamp.
            </p>
          </div>
          <div className={styles.card}>
            <div className={styles.cardKicker}>Layer 3</div>
            <h3>Events</h3>
            <p>
              Derived, never collected. An event inherits coordinates, issue type and suggested
              supplies from the pin it came from. The organizer adds only a time.
            </p>
          </div>
        </div>

        <h2 className={styles.subhead}>How priority is scored</h2>
        <div className={styles.cardGrid}>
          {SCORING.map((rule) => (
            <div key={rule.kicker} className={styles.card}>
              <div className={styles.cardKicker}>{rule.kicker}</div>
              <h3>{rule.title}</h3>
              <p>{rule.body}</p>
            </div>
          ))}
        </div>

        <h2 className={styles.subhead}>Cleaning rules</h2>
        <dl className={styles.specs}>
          <div className={styles.specRow}>
            <dt>No coordinates</dt>
            <dd>Dropped. A site nobody can find is a site nobody can fix.</dd>
          </div>
          <div className={styles.specRow}>
            <dt>Coordinates out of range</dt>
            <dd>Dropped as entry errors.</dd>
          </div>
          <div className={styles.specRow}>
            <dt>Blank larvae count</dt>
            <dd>
              Kept as blank, never coerced to zero. A blank means the observer did not sample,
              not that the site is clear — zeroing it would understate the risk.
            </dd>
          </div>
        </dl>

        <h2 className={styles.subhead}>Current configuration</h2>
        <dl className={styles.specs}>
          <div className={styles.specRow}>
            <dt>Region</dt>
            <dd>{config.defaultCity}, Florida (Alachua County bounding box)</dd>
          </div>
          <div className={styles.specRow}>
            <dt>Map centre</dt>
            <dd>
              {config.map.lat}, {config.map.lng} · zoom {config.map.zoom}
            </dd>
          </div>
          <div className={styles.specRow}>
            <dt>Seeded sites</dt>
            <dd>{config.seededSiteCount} standing water sites</dd>
          </div>
          <div className={styles.specRow}>
            <dt>GLOBE protocol</dt>
            <dd>{config.globe.protocol}</dd>
          </div>
          <div className={styles.specRow}>
            <dt>GLOBE API base</dt>
            <dd>{config.globe.apiBase}</dd>
          </div>
        </dl>

        <p className={styles.note} style={{ marginBottom: 0 }}>
          Data source:{' '}
          <a
            href="https://www.globe.gov/globe-data"
            target="_blank"
            rel="noreferrer"
            style={{ textDecoration: 'underline' }}
          >
            NASA GLOBE Observer
          </a>
          , Mosquito Habitat Mapper protocol. Change the bounding box and this runs anywhere
          with GLOBE coverage.
        </p>
      </div>
    </main>
  )
}
