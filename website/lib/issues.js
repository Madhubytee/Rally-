/**
 * Demo issue data for the Gainesville map.
 *
 * Standing-water entries mirror the shape of a NASA GLOBE Observer Mosquito
 * Habitat Mapper record; resident entries mirror an in-app report. When the
 * live data layer lands, this module is the seam it replaces.
 *
 * x / y are percentage offsets inside the map viewport, not real coordinates.
 */
export const ISSUES = [
  {
    id: 'p1',
    x: 23,
    y: 24,
    sev: 'high',
    type: 'Standing water',
    loc: 'NW 13th St & NW 8th Ave',
    detail: 'A clogged storm drain has held water for six days. Larvae confirmed in the sample.',
    when: '2 days ago',
    reports: 4,
    src: 'NASA GLOBE Observer',
    why: 'Larvae confirmed on site. Aedes mosquitoes breed in water that sits for about a week, so clearing this drain breaks the cycle before it starts.',
    event: 'Storm drain clearing on NW 13th',
    bring: 'Gloves, a bucket, a rake if you have one',
  },
  {
    id: 'p2',
    x: 62,
    y: 17,
    sev: 'high',
    type: 'Water main leak',
    loc: 'SW 2nd Ave & 10th St',
    detail: 'A slow leak is pooling across the sidewalk and running continuously into the gutter.',
    when: '5 hours ago',
    reports: 7,
    src: 'Resident report',
    why: 'Seven neighbors flagged this in one morning. Enough reports on one spot is the signal an organizer needs to escalate to the city.',
    event: 'Sidewalk leak report drive',
    bring: 'Phone camera, clipboard',
  },
  {
    id: 'p3',
    x: 41,
    y: 49,
    sev: 'med',
    type: 'Litter buildup',
    loc: 'Depot Park north entrance',
    detail: 'Trash is collecting along the trail edge after the weekend crowds.',
    when: '1 day ago',
    reports: 3,
    src: 'Resident report',
    why: 'A two hour pass with a dozen people clears the whole trail edge. Small, finishable, good first event for a new org.',
    event: 'Depot Park trail cleanup',
    bring: 'Gloves, trash bags, water bottle',
  },
  {
    id: 'p4',
    x: 74,
    y: 60,
    sev: 'med',
    type: 'Standing water',
    loc: 'SE 4th St drainage ditch',
    detail: 'The ditch has not drained since last week of rain. No larvae found yet.',
    when: '4 days ago',
    reports: 2,
    src: 'NASA GLOBE Observer',
    why: 'No larvae yet, which makes this the cheapest possible fix. Clearing the ditch now means nothing hatches here at all.',
    event: 'SE 4th St ditch clearing',
    bring: 'Gloves, shovel, boots',
  },
  {
    id: 'p5',
    x: 30,
    y: 73,
    sev: 'med',
    type: 'Illegal dumping',
    loc: 'NW 5th Ave alley',
    detail: 'Furniture and construction debris left behind the vacant lot.',
    when: '3 days ago',
    reports: 5,
    src: 'Resident report',
    why: 'Dumped furniture holds rainwater, so this is a mosquito site and an eyesore at the same time. One truck and six people clears it.',
    event: 'NW 5th Ave alley haul out',
    bring: 'Gloves, a truck if you have one',
  },
  {
    id: 'p6',
    x: 86,
    y: 31,
    sev: 'high',
    type: 'Standing water',
    loc: 'Tumblin Creek culvert',
    detail: 'Water pooling at the culvert mouth. Larvae confirmed in two samples.',
    when: '6 days ago',
    reports: 3,
    src: 'NASA GLOBE Observer',
    why: 'Larvae confirmed twice at the same spot. Repeat confirmations mean this is an established breeding site, not a one off puddle.',
    event: 'Tumblin Creek culvert clearing',
    bring: 'Gloves, waders, a rake',
  },
]

/** Filter chips shown above the map. */
export const ISSUE_FILTERS = ['All', 'Water', 'Litter', 'Dumping']

export const getIssue = (id) => ISSUES.find((issue) => issue.id === id)

export const openIssueCount = ISSUES.length
