import { inBounds, isValidCoord } from './geo'
import { scoreSeverity } from './severity'

/**
 * The pin layer.
 *
 * Two sources share one shape so they render identically on the map:
 *
 *   Layer 1 — NASA GLOBE Observer, Mosquito Habitat Mapper. Participatory
 *             science records: a volunteer finds standing water and reports
 *             whether larvae are present.
 *   Layer 2 — Resident reports, generated inside the app.
 *
 * Everything below is seed data standing in for the GLOBE export while the
 * import is wired up. `data/README.md` documents the real pipeline. Replacing
 * this array with the notebook's `pins.json` is the only change needed — the
 * field names here are the field names it emits.
 */

/** What a resident can report. Layer 2 is constrained to this enum. */
export const ISSUE_TYPES = [
  'Standing water',
  'Water leak',
  'Litter buildup',
  'Illegal dumping',
  'Overgrowth',
  'Broken infrastructure',
]

/** GLOBE's container categories, trimmed to the ones that appear locally. */
export const WATER_SOURCES = [
  'Storm drain',
  'Ditch',
  'Culvert',
  'Container',
  'Tire',
  'Puddle',
  'Not applicable',
]

/*
 * Raw records, pre-clean. `larvaeCount: null` means the observer never
 * sampled, which is not the same as a zero — see lib/severity.js.
 */
const RAW_ISSUES = [
  {
    id: 'p1',
    lat: 29.6595,
    lng: -82.339,
    type: 'Standing water',
    waterSource: 'Storm drain',
    larvaeCount: 12,
    measuredAt: '2026-09-18',
    loc: 'NW 13th St & NW 8th Ave',
    detail: 'A clogged storm drain has held water for six days. Larvae confirmed in the sample.',
    when: '2 days ago',
    reports: 4,
    src: 'NASA GLOBE Observer',
    why: 'Larvae confirmed on site. Aedes mosquitoes breed in water that sits about a week, so clearing this drain breaks the cycle before it starts.',
    event: 'Storm drain clearing on NW 13th',
    bring: 'Gloves, a bucket, a rake',
  },
  {
    id: 'p2',
    lat: 29.651,
    lng: -82.34,
    type: 'Water leak',
    waterSource: 'Puddle',
    larvaeCount: null,
    measuredAt: '2026-09-20',
    loc: 'SW 2nd Ave & 10th St',
    detail: 'A slow leak is pooling across the sidewalk and running into the gutter.',
    when: '5 hours ago',
    reports: 7,
    src: 'Resident report',
    why: 'Seven neighbors flagged this in one morning. Enough reports on one spot is the signal to escalate to the city.',
    event: 'Sidewalk leak report drive',
    bring: 'Phone camera, clipboard',
  },
  {
    id: 'p3',
    lat: 29.643,
    lng: -82.323,
    type: 'Litter buildup',
    waterSource: 'Not applicable',
    larvaeCount: null,
    measuredAt: '2026-09-19',
    loc: 'Depot Park north entrance',
    detail: 'Trash collecting along the trail edge after the weekend.',
    when: '1 day ago',
    reports: 3,
    src: 'Resident report',
    why: 'A two hour pass with a dozen people clears the whole trail edge. Small and finishable, good first event for a new org.',
    event: 'Depot Park trail cleanup',
    bring: 'Gloves, trash bags, water',
  },
  {
    id: 'p4',
    lat: 29.644,
    lng: -82.317,
    type: 'Standing water',
    waterSource: 'Ditch',
    larvaeCount: 0,
    measuredAt: '2026-09-16',
    loc: 'SE 4th St drainage ditch',
    detail: 'The ditch has not drained since last week of rain. No larvae found yet.',
    when: '4 days ago',
    reports: 2,
    src: 'NASA GLOBE Observer',
    why: 'No larvae yet, which makes this the cheapest possible fix. Clear it now and nothing hatches here at all.',
    event: 'SE 4th St ditch clearing',
    bring: 'Gloves, shovel, boots',
  },
  {
    id: 'p5',
    lat: 29.656,
    lng: -82.33,
    type: 'Illegal dumping',
    waterSource: 'Container',
    larvaeCount: null,
    measuredAt: '2026-09-17',
    loc: 'NW 5th Ave alley',
    detail: 'Furniture and construction debris left behind the vacant lot.',
    when: '3 days ago',
    reports: 5,
    src: 'Resident report',
    why: 'Dumped furniture holds rainwater, so this is a mosquito site and an eyesore at once. One truck and six people clears it.',
    event: 'NW 5th Ave alley haul out',
    bring: 'Gloves, a truck if you have one',
  },
  {
    id: 'p6',
    lat: 29.639,
    lng: -82.343,
    type: 'Standing water',
    waterSource: 'Culvert',
    larvaeCount: 8,
    measuredAt: '2026-09-14',
    loc: 'Tumblin Creek culvert',
    detail: 'Water pooling at the culvert mouth. Larvae confirmed in two samples.',
    when: '6 days ago',
    reports: 3,
    src: 'NASA GLOBE Observer',
    why: 'Larvae confirmed twice at the same spot. Repeat confirmations mean an established breeding site, not a one off puddle.',
    event: 'Tumblin Creek culvert clearing',
    bring: 'Gloves, waders, a rake',
  },
  {
    /*
     * Deliberately stale. Larvae were confirmed here, but the observation is
     * over a year old, so the staleness rule takes precedence and this scores
     * low rather than high. It is the record that proves the rule ordering.
     */
    id: 'p7',
    lat: 29.6295,
    lng: -82.3585,
    type: 'Standing water',
    waterSource: 'Tire',
    larvaeCount: 3,
    measuredAt: '2025-06-02',
    loc: 'SW 34th St tire pile',
    detail: 'Tires holding rainwater behind the service road. Not revisited since last summer.',
    when: 'over a year ago',
    reports: 1,
    src: 'NASA GLOBE Observer',
    why: 'Larvae were confirmed here, but the reading is over a year old. Worth a look to confirm it is still wet before anyone organizes around it.',
    event: 'SW 34th St tire pile check',
    bring: 'Gloves, boots',
  },
]

/**
 * The three cleaning rules, applied in order and reproducible.
 *
 *   1. Drop records with no coordinates. An unmappable site cannot be acted on.
 *   2. Drop coordinates outside valid ranges. Those are data entry errors.
 *   3. Keep records with a blank larvae count. A blank means the observer did
 *      not sample, not that the site is clear, so it is preserved as null and
 *      never coerced to zero.
 *
 * Returns both the kept records and a count of what each rule removed, so the
 * numbers can be shown rather than asserted.
 */
export function cleanRecords(rows, bounds) {
  const dropped = { missingCoords: 0, invalidCoords: 0, outOfRegion: 0 }
  const kept = []

  for (const row of rows) {
    if (row.lat == null || row.lng == null) {
      dropped.missingCoords += 1
      continue
    }
    if (!isValidCoord(row.lat, row.lng)) {
      dropped.invalidCoords += 1
      continue
    }
    if (bounds && !inBounds(row.lat, row.lng, bounds)) {
      dropped.outOfRegion += 1
      continue
    }
    kept.push({ ...row, sev: scoreSeverity(row) })
  }

  return { kept, dropped }
}

const cleaned = cleanRecords(RAW_ISSUES)

/** Cleaned, scored records. This is what the map renders. */
export const ISSUES = cleaned.kept

/** What cleaning removed, for the data page to report honestly. */
export const CLEAN_REPORT = { ...cleaned.dropped, total: RAW_ISSUES.length, kept: ISSUES.length }

/** Filter chips shown above the map. */
export const ISSUE_FILTERS = ['All', 'Water', 'Litter', 'Dumping']

/** Which chip a record answers to. */
export function typeGroup(type) {
  const t = type.toLowerCase()
  if (t.includes('water') || t.includes('leak')) return 'Water'
  if (t.includes('litter')) return 'Litter'
  if (t.includes('dumping')) return 'Dumping'
  return 'Other'
}

export const filterIssues = (issues, filter) =>
  filter === 'All' ? issues : issues.filter((issue) => typeGroup(issue.type) === filter)

export const getIssue = (id) => ISSUES.find((issue) => issue.id === id)

/** Shown in the phone mock's header on the landing page. */
export const openIssueCount = ISSUES.length
