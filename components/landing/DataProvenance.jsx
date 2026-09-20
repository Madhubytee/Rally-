import { LAYER_COUNTS } from '@/lib/issues'
import { SEVERITY_RULE } from '@/lib/severity'

import styles from './provenance.module.css'

/**
 * Where the pins come from.
 *
 * This is a landing section, not the data reference — /data carries the long
 * version. Each layer gets three scannable beats (freshness, who collects it,
 * the one thing worth knowing) and nothing else, so the whole story reads in a
 * glance instead of a page of prose.
 *
 * Numbers come from the data modules rather than being typed here, so the copy
 * cannot drift from what the map actually shows.
 *
 * The GLOBE coverage figure is stated plainly. A civic app that overstates its
 * evidence is worse than one with thin evidence, and anyone who checks the
 * archive will find six records whatever this page claims.
 */

const LAYERS = [
  {
    kicker: 'Layer 1',
    name: 'NASA GLOBE Observer',
    fresh: 'Archive, ~6 months behind',
    who: 'Volunteers worldwide, through NASA’s GLOBE Observer phone app.',
    fact: (
      <>
        Alachua County has <b>{LAYER_COUNTS.globe} observations in the nine-year archive</b>,
        none with a positive larvae count. All {LAYER_COUNTS.globe} are on the map — coverage
        that thin is exactly why layer 2 exists.
      </>
    ),
  },
  {
    kicker: 'Layer 2',
    name: 'Residents',
    fresh: 'Immediate',
    who: 'Anyone nearby. No account, no training, about ten seconds.',
    fact: (
      <>
        <b>Unverified by design.</b> One report is a claim; the number of neighbors flagging the
        same spot is the evidence, and every pin shows it.
      </>
    ),
  },
  {
    kicker: 'Layer 3',
    name: 'Events',
    fresh: 'Live',
    who: 'Organizers — the only role that needs an account.',
    fact: (
      <>
        <b>Derived from a pin, never typed from scratch</b>, so the map can show which problems
        already have someone working on them.
      </>
    ),
  },
]

/**
 * The scoring conditions are owned by lib/severity.js so this page can never
 * contradict the scorer. Only the trailing "so ..." justification is dropped:
 * the condition is what a reader scans for here, and the reasoning is already
 * spelled out on the map and on /data.
 */
const condition = (rule) => `${rule.split(', so ')[0].replace(/\.$/, '')}.`

export default function DataProvenance() {
  return (
    <section className={styles.section} id="data">
      <div className="wrap">
        <div className={styles.head}>
          <h2>Where the pins come from</h2>
          <p>
            Three sources, one shape on the map. Every pin carries its layer and the day it was
            last observed.
          </p>
        </div>

        <div className={styles.grid}>
          {LAYERS.map((layer) => (
            <article key={layer.name} className={styles.cell}>
              {/* Kicker and freshness share one fixed-height meta row so the
                  headings below them sit on a common baseline across all three
                  cells, whatever the copy does. */}
              <div className={styles.meta}>
                <span className={styles.kicker}>{layer.kicker}</span>
                <span className={styles.fresh}>{layer.fresh}</span>
              </div>

              <h3>{layer.name}</h3>
              <p className={styles.who}>{layer.who}</p>
              <p className={styles.fact}>{layer.fact}</p>
            </article>
          ))}
        </div>

        <div className={styles.ruleBar}>
          <span className={styles.ruleLabel}>Priority is scored, not assumed</span>
          <ul className={styles.ruleList}>
            {SEVERITY_RULE.map((rule) => (
              <li key={rule.level}>
                <span className={`${styles.dot} ${styles[rule.level]}`} aria-hidden="true" />
                <b>{rule.label.replace(' priority', '')}</b>
                <span>{condition(rule.rule)}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className={styles.attribution}>
          Site data: Global Learning and Observations to Benefit the Environment (GLOBE) Program,
          globe.gov
        </p>
      </div>
    </section>
  )
}
