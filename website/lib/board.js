/**
 * Events already on the community board. Replaced by the events API when
 * persistence lands.
 */
export const BOARD = [
  {
    id: 'e1',
    m: 'SEP',
    d: '21',
    t: 'Sweetwater Branch litter sweep',
    s: 'Sunday 8 AM · 14 going · Hosted by Depot Neighbors',
  },
  {
    id: 'e2',
    m: 'SEP',
    d: '24',
    t: 'Tire pickup at the 6th St lot',
    s: 'Wednesday 5 PM · 9 going · Hosted by UF Circle K',
  },
  {
    id: 'e3',
    m: 'OCT',
    d: '04',
    t: 'Porters Quarters drain check',
    s: 'Saturday 10 AM · 6 going · Hosted by Alachua Mosquito Control',
  },
]

/** Defaults the draft form pre-fills. The organizer only picks a time. */
export const DRAFT_DEFAULTS = {
  date: 'Saturday, Sep 26',
  time: '9:00 – 11:00 AM',
  host: 'UF Circle K',
  volunteers: 12,
  month: 'SEP',
  day: '26',
  flyerWhen: 'Sat Sep 26, 9–11 AM',
}

/** Builds the board entry created when an organizer publishes a draft. */
export const buildPublishedEvent = (issue) => ({
  id: `new-${issue.id}`,
  m: DRAFT_DEFAULTS.month,
  d: DRAFT_DEFAULTS.day,
  t: issue.event,
  s: `Saturday 9 AM · 1 going · Hosted by ${DRAFT_DEFAULTS.host}`,
  fresh: true,
})
