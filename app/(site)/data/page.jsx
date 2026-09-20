import Link from 'next/link'

import { config } from '@/lib/config'
import { COUNTY_BOUNDS } from '@/lib/geo'
import { CLEAN_REPORT, LAYER_COUNTS } from '@/lib/issues'
import { DATA_ASOF } from '@/lib/severity'

import styles from '../routes.module.css'

export const metadata = {
  title: 'Data — Rally',
  description:
    'Where Rally gets its pins, how priority is scored, what the cleaning rules are, and how thin the GLOBE coverage really is here.',
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

/* Records inside each bounding box across the whole GLOBE archive, counted
   against the search API on the as-of date. The point of printing all four is
   that the Alachua number is the reason to widen the region, not a bug. */
const COVERAGE = [
  { region: 'Alachua County', records: '6' },
  { region: 'North Florida', records: '15' },
  { region: 'Florida', records: '634' },
  { region: 'Southeast US', records: '1,163' },
]

export default function DataPage() {
  return (
    <main>
      <div className="wrap page-head">
        <h1>Where the pins come from</h1>
        <p>
          Rally reads NASA GLOBE Observer participatory science records so the map is useful
          before the first resident ever opens it. The scoring rule is printed here rather
          than hidden, so anyone can audit it — including the part where the coverage is
          thinner than anyone would like.
        </p>
      </div>

      <div className={`wrap ${styles.section}`}>
        <div className={styles.note}>
          Honest status: the GLOBE layer is real. <code>lib/globe.js</code> calls the open
          GLOBE search API — no key, no account — and the {LAYER_COUNTS.globe} standing water
          sites on the map are verbatim records from it, coordinates, dates and larvae counts
          included. The {LAYER_COUNTS.resident} resident reports and every event are still
          demo state, held in React and cleared by a reload.
        </div>

        <h2 className={styles.subhead}>The three layers</h2>
        <div className={styles.cardGrid}>
          <div className={styles.card}>
            <div className={styles.cardKicker}>Layer 1 · {LAYER_COUNTS.globe} live records</div>
            <h3>GLOBE Observer</h3>
            <p>
              Mosquito Habitat Mapper records: someone found standing water, logged where it
              was, and reported whether larvae were present. Collected through NASA&apos;s
              GLOBE Observer app and read straight from the public search API.
            </p>
          </div>
          <div className={styles.card}>
            <div className={styles.cardKicker}>
              Layer 2 · {LAYER_COUNTS.resident} demo records
            </div>
            <h3>Resident reports</h3>
            <p>
              Filed inside Rally, in the same shape as layer 1 so both render identically:
              coordinates, type, one line of description, timestamp. These are still seeded
              examples — nothing persists until a store is wired up.
            </p>
          </div>
          <div className={styles.card}>
            <div className={styles.cardKicker}>Layer 3 · derived</div>
            <h3>Events</h3>
            <p>
              Derived, never collected. An event inherits coordinates, issue type and
              suggested supplies from the pin it came from. The organizer adds only a time.
            </p>
          </div>
        </div>

        <h2 className={styles.subhead}>How thin the GLOBE layer is here</h2>
        <p className={styles.bodyCopy}>
          Alachua County has six Mosquito Habitat Mapper observations across nine years: three
          from two days in August 2019 and three from one afternoon in January 2026, clustered
          around UF campus and southwest Gainesville. All six are still water, and{' '}
          <b>not one has a positive larvae count</b>. So every &ldquo;larvae confirmed&rdquo;
          pin you see on the Gainesville map is a resident report, not a GLOBE record.
        </p>
        <p className={styles.bodyCopy}>
          That is not enough to seed a county map on its own, which is why GLOBE runs here as
          a sparse supplementary layer over resident reports rather than as the primary
          source. Widening the bounding box is four numbers in <code>lib/geo.js</code>, and
          the counts below are what each choice would buy.
        </p>

        <dl className={styles.specs}>
          {COVERAGE.map((row) => (
            <div key={row.region} className={styles.specRow}>
              <dt>{row.region}</dt>
              <dd>{row.records} records in the whole archive</dd>
            </div>
          ))}
          <div className={styles.specRow}>
            <dt>Publication lag</dt>
            <dd>
              Roughly six months. This is an archive, not a live feed, and nothing from it is
              labelled current conditions.
            </dd>
          </div>
        </dl>

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
        <p className={styles.bodyCopy}>
          Staleness is checked before anything else, so a year-old larvae confirmation scores
          low rather than high — sending volunteers to a site that has probably dried up is
          worse than not ranking it at all. Scores are computed against a fixed as-of date
          rather than the wall clock, so the same input gives the same output on the server
          and in the browser.
        </p>

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
              not that the site is clear — zeroing it would understate the risk. Three of the
              six GLOBE records here are blanks.
            </dd>
          </div>
          <div className={styles.specRow}>
            <dt>Applied to the current set</dt>
            <dd>
              {CLEAN_REPORT.kept} of {CLEAN_REPORT.total} records kept,{' '}
              {CLEAN_REPORT.total - CLEAN_REPORT.kept} dropped. The rules run in the app
              rather than in a notebook, so what is displayed cannot drift from what was
              cleaned.
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
            <dt>Bounding box</dt>
            <dd>
              {COUNTY_BOUNDS.minLat} to {COUNTY_BOUNDS.maxLat} lat, {COUNTY_BOUNDS.minLng} to{' '}
              {COUNTY_BOUNDS.maxLng} lng
            </dd>
          </div>
          <div className={styles.specRow}>
            <dt>Map centre</dt>
            <dd>
              {config.map.lat}, {config.map.lng} · zoom {config.map.zoom}
            </dd>
          </div>
          <div className={styles.specRow}>
            <dt>GLOBE sites on the map</dt>
            <dd>
              {LAYER_COUNTS.globe} — the complete Alachua County archive, 2017 to{' '}
              {DATA_ASOF.slice(0, 4)}
            </dd>
          </div>
          <div className={styles.specRow}>
            <dt>Data as of</dt>
            <dd>{DATA_ASOF}</dd>
          </div>
          <div className={styles.specRow}>
            <dt>GLOBE protocol</dt>
            <dd>{config.globe.protocol}</dd>
          </div>
          <div className={styles.specRow}>
            <dt>GLOBE API base</dt>
            <dd>{config.globe.apiBase} (open, no key required)</dd>
          </div>
        </dl>

        <p className={styles.note} style={{ marginBottom: 0 }}>
          Global Learning and Observations to Benefit the Environment (GLOBE) Program, accessed{' '}
          {DATA_ASOF},{' '}
          <a
            href="https://www.globe.gov/globe-data"
            target="_blank"
            rel="noreferrer"
            style={{ textDecoration: 'underline' }}
          >
            globe.gov
          </a>
          , Mosquito Habitat Mapper protocol. Change the bounding box and this runs anywhere
          with GLOBE coverage — see the{' '}
          <Link href="/map" style={{ textDecoration: 'underline' }}>
            report directory
          </Link>{' '}
          for what is open right now.
        </p>
      </div>
    </main>
  )
}
