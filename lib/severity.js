/**
 * Priority scoring.
 *
 * One transparent rule, printed on the page so a judge or a resident can audit
 * it. No model and no weights — reproducibility is the point, and a black box
 * fails it.
 */

/**
 * The date the bundled dataset was cut. Staleness is measured against this
 * rather than the wall clock so the scores are deterministic: the same input
 * always produces the same output, on the server and in the browser, today and
 * next week. A live import replaces this with the fetch date.
 */
export const DATA_ASOF = '2026-09-20'

const STALE_AFTER_DAYS = 365
const DAY_MS = 86_400_000

export const SEVERITY_RULE = [
  {
    level: 'high',
    label: 'High priority',
    rule: 'Larvae confirmed in the sample, so the site is actively producing mosquitoes.',
  },
  {
    level: 'med',
    label: 'Medium priority',
    rule: 'Standing water logged, with no larvae found or no sample taken.',
  },
  {
    level: 'low',
    label: 'Low priority',
    rule: 'Last observed over a year ago, so it may have resolved on its own.',
  },
]

export const SEVERITY_LABEL = {
  high: 'High priority',
  med: 'Medium priority',
  low: 'Low priority',
}

export const daysSince = (isoDate, asof = DATA_ASOF) =>
  Math.floor((new Date(`${asof}T00:00:00Z`) - new Date(`${isoDate}T00:00:00Z`)) / DAY_MS)

/**
 * Score one record.
 *
 * Staleness is checked first: a year-old larvae confirmation describes a site
 * that probably dried up, and calling it high priority would send volunteers
 * to the wrong place.
 *
 * `larvaeCount` of null means the observer never sampled. That is deliberately
 * NOT the same as a zero, and it must never be coerced into one — a blank
 * means unknown, and treating unknown as clear understates the risk.
 */
export function scoreSeverity({ measuredAt, larvaeCount }, asof = DATA_ASOF) {
  if (measuredAt && daysSince(measuredAt, asof) > STALE_AFTER_DAYS) return 'low'
  if (typeof larvaeCount === 'number' && larvaeCount > 0) return 'high'
  return 'med'
}

/** Compact form for badges that only have room for a word. */
export const SEVERITY_SHORT = {
  high: 'High',
  med: 'Medium',
  low: 'Low',
}
