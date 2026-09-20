/**
 * The guidance attached to a pin: what to call the event, what to bring, and
 * why this site is worth someone's Saturday.
 *
 * Derived in code rather than stored per row. It is editorial content — it
 * changes when we learn to explain something better, not when the data
 * changes — and keeping it here means one edit updates every pin instead of
 * a migration over thousands of rows.
 */

const BY_TYPE = {
  'Standing water': {
    event: 'Standing water clearing',
    bring: 'Gloves, a bucket, boots',
  },
  'Water leak': {
    event: 'Leak report drive',
    bring: 'Phone camera, clipboard',
  },
  'Litter buildup': {
    event: 'Litter sweep',
    bring: 'Gloves, trash bags, water',
  },
  'Illegal dumping': {
    event: 'Dumping haul out',
    bring: 'Gloves, a truck if you have one',
  },
  Overgrowth: {
    event: 'Path clearing',
    bring: 'Loppers, gloves, long sleeves',
  },
  'Broken infrastructure': {
    event: 'Infrastructure report drive',
    bring: 'Phone camera, clipboard',
  },
}

const FALLBACK = { event: 'Community cleanup', bring: 'Gloves, trash bags, water' }

/** Why this pin is worth acting on, keyed off what is actually known. */
export function explain({ sev, larvaeCount, reports, type }) {
  if (sev === 'low') {
    return 'The last observation here is over a year old, so it may have resolved on its own. Worth confirming it is still a problem before anyone organizes around it.'
  }

  if (larvaeCount > 0) {
    return 'Larvae confirmed on site. Aedes mosquitoes breed in water that sits about a week, so clearing this breaks the cycle before it starts.'
  }

  if (reports >= 5) {
    return `${reports} neighbors have flagged this spot. Enough reports on one location is the signal that gets it escalated to the city.`
  }

  if (larvaeCount === 0) {
    return 'Sampled and clear at the time of the reading. Standing water that stays put is worth rechecking after heavy rain.'
  }

  if (type === 'Standing water') {
    return 'Standing water with no sample taken, so nothing is known about larvae here — which is not the same as knowing it is clear.'
  }

  return 'Reported by a neighbor with no confirmation yet. One more person flagging the same spot moves it up the list.'
}

/** Pre-filled event name and supplies for the draft form. */
export const suggestFor = (type) => BY_TYPE[type] || FALLBACK
