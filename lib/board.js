/**
 * The event layer.
 *
 * Events are derived, not collected. One inherits its coordinates, issue type
 * and suggested supplies from the pin it came from; the organizer adds only
 * date, time and host. That inheritance is the whole product idea — turning a
 * report into a plan should not mean re-entering what the report already knew.
 *
 * Signups attach to the event. Nothing here persists yet; `data/README.md`
 * notes what a real store would need.
 */

export const MONTHS = [
  'JAN',
  'FEB',
  'MAR',
  'APR',
  'MAY',
  'JUN',
  'JUL',
  'AUG',
  'SEP',
  'OCT',
  'NOV',
  'DEC',
]

/** Events already on the board when the app loads. */
export const SEED_EVENTS = [
  {
    id: 'e1',
    m: 'SEP',
    d: '21',
    title: 'Sweetwater Branch litter sweep',
    when: 'Sunday 8 AM',
    going: 14,
    host: 'Depot Neighbors',
    bring: 'Gloves, trash bags, water',
  },
  {
    id: 'e2',
    m: 'SEP',
    d: '24',
    title: 'Tire pickup at the 6th St lot',
    when: 'Wednesday 5 PM',
    going: 9,
    host: 'UF Circle K',
    bring: 'Gloves, a truck if you have one',
  },
  {
    id: 'e3',
    m: 'OCT',
    d: '04',
    title: 'Porters Quarters drain check',
    when: 'Saturday 10 AM',
    going: 6,
    host: 'Alachua Mosquito Control',
    bring: 'Gloves, boots, a rake',
  },
]

export const DEFAULT_HOST = 'UF Circle K'
export const DEFAULT_START_TIME = '09:00'

/** The next Saturday, as the date input's default value. */
export function nextSaturday(from = new Date()) {
  const d = new Date(from)
  d.setDate(d.getDate() + ((6 - d.getDay() + 7) % 7 || 7))
  return d
}

/** `2026-09-26`, the format a native date input expects. */
export const toDateValue = (date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
    date.getDate(),
  ).padStart(2, '0')}`

/** `Sat, Sep 26` for the flyer and the board row. */
export const formatEventDate = (date) =>
  date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })

/**
 * Build the draft an organizer sees, pre-filled from the pin they tapped.
 * Only date, time and host are theirs to choose.
 */
export function draftFromIssue(issue) {
  const date = nextSaturday()
  return {
    issueId: issue.id,
    name: issue.event,
    loc: issue.loc,
    lat: issue.lat,
    lng: issue.lng,
    date: toDateValue(date),
    time: DEFAULT_START_TIME,
    bring: issue.bring,
    host: DEFAULT_HOST,
  }
}

/** Turn a submitted draft into a board entry. */
export function publishDraft(draft) {
  const date = draft.date ? new Date(`${draft.date}T12:00`) : new Date()
  const time = draft.time || DEFAULT_START_TIME

  return {
    id: `e-${draft.issueId}-${date.getTime()}`,
    m: MONTHS[date.getMonth()],
    d: String(date.getDate()).padStart(2, '0'),
    title: draft.name,
    when: `${formatEventDate(date)} ${time}`,
    going: 1,
    host: draft.host || 'A neighbor',
    bring: draft.bring,
    loc: draft.loc,
    fresh: true,
  }
}

/* --------------------------------------------------------------------------
   Landing-page flow illustration
   --------------------------------------------------------------------------
   The marketing demo walks through report → draft → published with fixed copy
   rather than live state. These constants exist only for that walkthrough; the
   running app uses draftFromIssue and publishDraft above.
   -------------------------------------------------------------------------- */

export const DRAFT_DEFAULTS = {
  date: 'Saturday, Sep 26',
  time: '9:00 – 11:00 AM',
  host: DEFAULT_HOST,
  volunteers: 12,
  month: 'SEP',
  day: '26',
  flyerWhen: 'Sat Sep 26, 9–11 AM',
}

/** The board entry the walkthrough shows after the organizer publishes. */
export const buildPublishedEvent = (issue) => ({
  id: `new-${issue.id}`,
  m: DRAFT_DEFAULTS.month,
  d: DRAFT_DEFAULTS.day,
  title: issue.event,
  when: 'Saturday 9 AM',
  going: 1,
  host: DRAFT_DEFAULTS.host,
  bring: issue.bring,
  fresh: true,
})
