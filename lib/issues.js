import { inBounds, isValidCoord } from './geo.js'
import { scoreSeverity } from './severity.js'

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
 * `data/README.md` documents the pipeline and the coverage numbers.
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
  'Pond',
  'Lake',
  'Swamp or wetland',
  'Not applicable',
]

/* ---------------------------------------------------------------------------
 * Layer 1 — real NASA GLOBE Observer records
 * ---------------------------------------------------------------------------
 * These six are the complete Mosquito Habitat Mapper archive for Alachua
 * County: everything the GLOBE search API returns for the county bounding box
 * across 2017–2026. Coordinates, dates, water sources and larvae counts are
 * verbatim from the API. Nothing here is invented.
 *
 * Read them and the limits of the layer are obvious. Three are from one
 * afternoon in January 2026 and three from two days in August 2019, all still
 * water, and not one has a positive larvae count. The app shows them because
 * they are true, not because they are enough — and the copy around them says
 * so rather than implying a dense national feed.
 *
 * `loc` names the general area rather than a specific landmark: GLOBE gives a
 * site code, not an address, and guessing a street corner from a coordinate
 * would be inventing detail the source does not have.
 */
const GLOBE_OBSERVATIONS = [
  {
    id: 'globe-50490',
    siteId: '17RLN703804',
    lat: 29.646806,
    lng: -82.339988,
    type: 'Standing water',
    waterSource: 'Pond',
    larvaeCount: 0,
    measuredAt: '2026-01-31',
    loc: 'UF campus area',
    detail: 'Pond logged as a possible habitat. The observer sampled and found no larvae.',
    when: 'Jan 31, 2026',
    reports: 1,
    src: 'NASA GLOBE Observer',
    why: 'Sampled and clear at the time of the reading. Still water that stays put is worth rechecking after heavy rain, because a clear pond in January says little about August.',
    event: 'Campus pond recheck',
    bring: 'Gloves, boots, a dipper if you have one',
  },
  {
    id: 'globe-50488',
    siteId: '17RLN699804',
    lat: 29.646765,
    lng: -82.344119,
    type: 'Standing water',
    waterSource: 'Pond',
    larvaeCount: 0,
    measuredAt: '2026-01-31',
    loc: 'UF campus area, west',
    detail: 'Second pond logged the same afternoon. Sampled, no larvae found.',
    when: 'Jan 31, 2026',
    reports: 1,
    src: 'NASA GLOBE Observer',
    why: 'One of three readings taken within an hour of each other, which is what a class or a group survey looks like in the data. Useful as a baseline to compare a later visit against.',
    event: 'Campus pond recheck',
    bring: 'Gloves, boots, a dipper if you have one',
  },
  {
    id: 'globe-50489',
    siteId: '17RLN701805',
    lat: 29.647688,
    lng: -82.342066,
    type: 'Standing water',
    waterSource: 'Pond',
    larvaeCount: 0,
    measuredAt: '2026-01-31',
    loc: 'UF campus area, north',
    detail: 'Third pond in the same survey. Sampled, no larvae found.',
    when: 'Jan 31, 2026',
    reports: 1,
    src: 'NASA GLOBE Observer',
    why: 'Clear in winter. Florida mosquito season runs through the warm months, so the reading that matters here is the one nobody has taken yet.',
    event: 'Campus pond recheck',
    bring: 'Gloves, boots, a dipper if you have one',
  },
  {
    id: 'globe-15062',
    siteId: '17RLN667786',
    lat: 29.630185,
    lng: -82.376951,
    type: 'Standing water',
    waterSource: 'Pond',
    larvaeCount: null,
    measuredAt: '2019-08-11',
    loc: 'Southwest Gainesville',
    detail: 'Pond logged as a possible habitat. No larvae sample was taken.',
    when: 'Aug 2019',
    reports: 1,
    src: 'NASA GLOBE Observer',
    why: 'Nobody sampled this one, so nothing is known about larvae here — which is not the same as knowing it is clear. Seven years on, the only honest next step is to go and look.',
    event: 'Southwest pond survey',
    bring: 'Gloves, boots, the GLOBE Observer app',
  },
  {
    id: 'globe-15063',
    siteId: '17RLN662785',
    lat: 29.629229,
    lng: -82.382103,
    type: 'Standing water',
    waterSource: 'Lake',
    larvaeCount: null,
    measuredAt: '2019-08-11',
    loc: 'Southwest Gainesville',
    detail: 'Lake edge logged as a possible habitat. No larvae sample was taken.',
    when: 'Aug 2019',
    reports: 1,
    src: 'NASA GLOBE Observer',
    why: 'A large water body is a weaker signal than a container — fish and flow both suppress larvae. Worth a look at the still margins rather than the open water.',
    event: 'Southwest pond survey',
    bring: 'Gloves, boots, the GLOBE Observer app',
  },
  {
    id: 'globe-15027',
    siteId: '17RLN655786',
    lat: 29.630056,
    lng: -82.389344,
    type: 'Standing water',
    waterSource: 'Swamp or wetland',
    larvaeCount: null,
    measuredAt: '2019-08-10',
    loc: 'Southwest Gainesville, wetland',
    detail: 'Wetland logged as a possible habitat. No larvae sample was taken.',
    when: 'Aug 2019',
    reports: 1,
    src: 'NASA GLOBE Observer',
    why: 'Natural wetland, so this is habitat rather than a fixable problem. It belongs on the map as context, not as a cleanup target.',
    event: 'Southwest wetland survey',
    bring: 'Boots, the GLOBE Observer app',
  },
]

/* ---------------------------------------------------------------------------
 * Layer 2 — resident reports
 * ---------------------------------------------------------------------------
 * Demo data. This is what the map looks like once neighbors have been using
 * it, and it is the layer that makes Rally a civic app rather than a mosquito
 * dashboard. Replaced by the `issues` table as soon as Supabase is wired up.
 */
const RESIDENT_REPORTS = [
  {
    id: 'r1',
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
    src: 'Resident report',
    why: 'Larvae confirmed on site. Aedes mosquitoes breed in water that sits about a week, so clearing this drain breaks the cycle before it starts.',
    event: 'Storm drain clearing on NW 13th',
    bring: 'Gloves, a bucket, a rake',
  },
  {
    id: 'r2',
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
    id: 'r3',
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
    id: 'r4',
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
    src: 'Resident report',
    why: 'No larvae yet, which makes this the cheapest possible fix. Clear it now and nothing hatches here at all.',
    event: 'SE 4th St ditch clearing',
    bring: 'Gloves, shovel, boots',
  },
  {
    id: 'r5',
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
    id: 'r6',
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
    src: 'Resident report',
    why: 'Larvae confirmed twice at the same spot. Repeat confirmations mean an established breeding site, not a one off puddle.',
    event: 'Tumblin Creek culvert clearing',
    bring: 'Gloves, waders, a rake',
  },
  {
    id: 'r7',
    lat: 29.6572,
    lng: -82.3205,
    type: 'Standing water',
    waterSource: 'Tire',
    larvaeCount: 21,
    measuredAt: '2026-09-15',
    loc: 'Duckpond, NE 6th St',
    detail: 'Four tires behind the fence, all holding water. Larvae in three of them.',
    when: '5 days ago',
    reports: 6,
    src: 'Resident report',
    why: 'Tires are the worst container there is — they hold water through a drought and shade it from the sun. Twenty minutes and a truck removes the problem permanently.',
    event: 'Duckpond tire removal',
    bring: 'Gloves, a truck, a hand truck',
  },
  {
    id: 'r8',
    lat: 29.6478,
    lng: -82.3184,
    type: 'Overgrowth',
    waterSource: 'Not applicable',
    larvaeCount: null,
    measuredAt: '2026-09-13',
    loc: 'Sweetwater Branch, SE 7th Ave',
    detail: 'Vegetation has closed over the walking path along the branch.',
    when: '1 week ago',
    reports: 2,
    src: 'Resident report',
    why: 'Not a breeding site, but it hides the ones behind it and pushes walkers into the road. Clearing it makes the rest of the corridor reportable.',
    event: 'Sweetwater Branch path clearing',
    bring: 'Loppers, gloves, long sleeves',
  },
  {
    id: 'r9',
    lat: 29.6685,
    lng: -82.3478,
    type: 'Broken infrastructure',
    waterSource: 'Puddle',
    larvaeCount: null,
    measuredAt: '2026-09-12',
    loc: 'NW 23rd Ave & NW 12th St',
    detail: 'Collapsed kerb drain. Water backs up across the crossing whenever it rains.',
    when: '1 week ago',
    reports: 9,
    src: 'Resident report',
    why: 'Nine reports on one corner. This one is a city work order rather than a volunteer job, and the report count is the evidence that gets it filed.',
    event: 'NW 23rd Ave drain report drive',
    bring: 'Phone camera, clipboard',
  },
  {
    id: 'r10',
    lat: 29.6248,
    lng: -82.3396,
    type: 'Standing water',
    waterSource: 'Container',
    larvaeCount: 0,
    measuredAt: '2026-09-11',
    loc: 'Bivens Arm, SW 13th St',
    detail: 'Buckets and a wheelbarrow left filled behind the maintenance shed.',
    when: '1 week ago',
    reports: 1,
    src: 'Resident report',
    why: 'Sampled and clear, but these refill with every storm. Tipping them out takes a minute and stops the site coming back.',
    event: 'Bivens Arm container tip out',
    bring: 'Gloves',
  },
  {
    id: 'r11',
    lat: 29.6332,
    lng: -82.3561,
    type: 'Litter buildup',
    waterSource: 'Not applicable',
    larvaeCount: null,
    measuredAt: '2026-09-10',
    loc: 'SW 34th St underpass',
    detail: 'Bottles and packaging piling up against the fence line.',
    when: '10 days ago',
    reports: 4,
    src: 'Resident report',
    why: 'Bottles and cups are containers once they fill with rain. Clearing litter here is mosquito control that does not look like mosquito control.',
    event: 'SW 34th St underpass sweep',
    bring: 'Gloves, trash bags, hi-vis if you have it',
  },
  {
    /*
     * Deliberately stale. Larvae were confirmed, but the reading is over a
     * year old, so the staleness rule takes precedence and this scores low
     * rather than high. It is the record that proves the rule ordering.
     */
    id: 'r12',
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
    src: 'Resident report',
    why: 'Larvae were confirmed here, but the reading is over a year old. Worth a look to confirm it is still wet before anyone organizes around it.',
    event: 'SW 34th St tire pile check',
    bring: 'Gloves, boots',
  },
]

const RAW_ISSUES = [...GLOBE_OBSERVATIONS, ...RESIDENT_REPORTS]

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

/** How many pins came from each layer, for the provenance section. */
export const LAYER_COUNTS = {
  globe: GLOBE_OBSERVATIONS.length,
  resident: RESIDENT_REPORTS.length,
}

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
