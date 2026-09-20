import { typeGroup } from './issues.js'

/**
 * The four numbers in the bar under the map.
 *
 * Non-experts read numbers before they read maps, so these carry the summary
 * the map only implies. Each one is a plain count over the records currently
 * shown — filter the map and these move with it.
 */
export function summarize(issues, events = []) {
  const total = issues.length
  const confirmed = issues.filter((issue) => issue.larvaeCount > 0).length
  const water = issues.filter((issue) => typeGroup(issue.type) === 'Water').length

  return [
    { n: total, label: 'Open reports nearby' },
    {
      /*
       * Share of shown records with a confirmed larvae count. Records where
       * nobody sampled sit in the denominator, which is the honest reading:
       * the figure is "confirmed out of everything", not "confirmed out of
       * everything tested", and inflating it by dropping the unsampled would
       * overstate how much is actually known.
       */
      n: total ? `${Math.round((confirmed / total) * 100)}%` : '—',
      label: 'Larvae confirmed',
    },
    { n: water, label: 'Standing water sites' },
    { n: events.length, label: 'Events this month' },
  ]
}

/** Most common water source, for the data page. */
export function topWaterSource(issues) {
  const counts = new Map()
  for (const issue of issues) {
    if (!issue.waterSource || issue.waterSource === 'Not applicable') continue
    counts.set(issue.waterSource, (counts.get(issue.waterSource) || 0) + 1)
  }
  const ranked = [...counts.entries()].sort((a, b) => b[1] - a[1])
  return ranked.length ? ranked[0][0] : '—'
}
