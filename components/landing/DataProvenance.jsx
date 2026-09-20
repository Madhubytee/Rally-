import { LAYER_COUNTS } from '@/lib/issues'
import { SEVERITY_RULE } from '@/lib/severity'

import styles from './provenance.module.css'

/**
 * Where the pins come from, and how fresh each source is.
 *
 * The numbers are read from the data modules rather than typed here, so this
 * section cannot drift out of step with what the map actually shows.
 *
 * The GLOBE coverage figure is stated plainly. A civic app that overstates its
 * evidence is worse than one with thin evidence, and anyone who checks the
 * archive will find six records whatever this page claims.
 */

const LAYERS = [
  {
    kicker: 'Layer 1',
    name: 'NASA GLOBE Observer',
    who: 'Volunteers worldwide, through NASA’s GLOBE Observer phone app',
    how: 'Someone finds standing water, photographs it, and records whether larvae are present. Optionally they count the larvae and attempt a species ID.',
    freshness: 'Archive, roughly six months behind',
    detail:
      'Published through the open GLOBE search API — no key, no account. Records reach the API around six months after they are observed, so this layer is history, never current conditions.',
    caveat: `Alachua County has ${LAYER_COUNTS.globe} observations in the entire nine-year archive, and none with a positive larvae count. All ${LAYER_COUNTS.globe} are on the map. That is the real coverage, and it is why the resident layer matters.`,
  },
  {
    kicker: 'Layer 2',
    name: 'Residents',
    who: 'Anyone nearby, with no account and no training',
    how: 'Pick what is wrong, confirm the location, add one line. About ten seconds. The phone supplies the coordinates.',
    freshness: 'Immediate',
    detail:
      'Stored in the same shape as a GLOBE record, so both render as one map rather than two overlays. This is a second participatory science layer — the same thing GLOBE does, scoped to one city.',
    caveat:
      'Unverified by design. A single report is a claim; the count of neighbors flagging the same spot is the evidence, and it is shown on every pin.',
  },
  {
    kicker: 'Layer 3',
    name: 'Events',
    who: 'Organizers, the only role that needs an account',
    how: 'An event is derived from a pin, never typed from scratch. It inherits the location, the issue type and the suggested supplies; the organizer adds a date, a time and a host.',
    freshness: 'Live',
    detail:
      'Because the event carries the pin it came from, the map can show which problems already have someone working on them and which are still waiting.',
    caveat: 'Signups attach to the event. Names and emails are visible only to that organizer.',
  },
]

export default function DataProvenance() {
  return (
    <section className={styles.section} id="data">
      <div className="wrap">
        <div className={styles.head}>
          <h2>Where the pins come from</h2>
          <p>
            Three sources, one shape on the map. Every pin says which layer it came from and
            when it was last observed, because a site nobody has looked at in a year is a
            different thing from one checked yesterday.
          </p>
        </div>

        <div className={styles.grid}>
          {LAYERS.map((layer) => (
            <article key={layer.name} className={styles.card}>
              <div className={styles.kicker}>{layer.kicker}</div>
              <h3>{layer.name}</h3>

              <dl className={styles.rows}>
                <div>
                  <dt>Collected by</dt>
                  <dd>{layer.who}</dd>
                </div>
                <div>
                  <dt>How</dt>
                  <dd>{layer.how}</dd>
                </div>
                <div>
                  <dt>Freshness</dt>
                  <dd>
                    <span className={styles.fresh}>{layer.freshness}</span>
                  </dd>
                </div>
              </dl>

              <p className={styles.detail}>{layer.detail}</p>
              <p className={styles.caveat}>{layer.caveat}</p>
            </article>
          ))}
        </div>

        <div className={styles.rule}>
          <div className={styles.ruleHead}>
            <h3>Keeping it current</h3>
            <p>
              Freshness is scored, not assumed. The rule is printed here and on the map so it can
              be checked rather than trusted.
            </p>
          </div>

          <ul className={styles.ruleList}>
            {SEVERITY_RULE.map((rule) => (
              <li key={rule.level}>
                <span className={`${styles.dot} ${styles[rule.level]}`} aria-hidden="true" />
                <b>{rule.label.replace(' priority', '')}</b>
                <span>{rule.rule}</span>
              </li>
            ))}
          </ul>

          <p className={styles.ruleNote}>
            Staleness is checked before anything else: a year-old larvae confirmation describes a
            site that has probably dried up, and calling it urgent would send volunteers to the
            wrong place. A blank larvae count stays blank — it means nobody sampled, not that the
            site is clear, and treating the two the same would understate the risk.
          </p>

          <p className={styles.attribution}>
            Site data: Global Learning and Observations to Benefit the Environment (GLOBE)
            Program, globe.gov
          </p>
        </div>
      </div>
    </section>
  )
}
