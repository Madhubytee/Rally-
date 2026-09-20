/**
 * Load the bundled pin layer into Supabase.
 *
 *   node data/seed.mjs
 *
 * Uses the anon key and the same "anyone can report" policy a resident's
 * phone uses, so it proves the public write path works rather than going
 * around it with a service-role key.
 *
 * Idempotent for the GLOBE layer: those rows carry `globe_id`, which is
 * unique, so re-running updates instead of duplicating. Resident demo rows
 * have no natural key, so the script refuses to add them twice unless asked
 * with --force.
 */
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { createClient } from '@supabase/supabase-js'

import { ISSUES } from '../lib/issues.js'

const here = dirname(fileURLToPath(import.meta.url))

/* .env is not loaded automatically outside Next, so read it here. */
const env = Object.fromEntries(
  readFileSync(join(here, '..', '.env'), 'utf8')
    .split(/\r?\n/)
    .map((line) => line.match(/^([A-Za-z0-9_]+)=(.*)$/))
    .filter(Boolean)
    .map((m) => [m[1], m[2].trim()]),
)

const url = env.NEXT_PUBLIC_SUPABASE_URL
const key = env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!url || !key) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY in .env')
  process.exit(1)
}

const supabase = createClient(url, key)
const force = process.argv.includes('--force')

const toRow = (issue) => ({
  lat: issue.lat,
  lng: issue.lng,
  type: issue.type,
  detail: issue.detail,
  loc: issue.loc,
  water_source: issue.waterSource === 'Not applicable' ? null : issue.waterSource,
  larvae_count: issue.larvaeCount,
  measured_at: issue.measuredAt,
  reports: issue.reports,
  source: issue.src,
  globe_id: issue.id.startsWith('globe-') ? issue.id : null,
})

const globe = ISSUES.filter((i) => i.src === 'NASA GLOBE Observer').map(toRow)
const resident = ISSUES.filter((i) => i.src !== 'NASA GLOBE Observer').map(toRow)

const { count } = await supabase.from('issues').select('*', { count: 'exact', head: true })
console.log(`issues table currently holds ${count} row(s)`)

/* GLOBE rows key off globe_id, so upsert is safe to repeat. */
const { error: globeError } = await supabase
  .from('issues')
  .upsert(globe, { onConflict: 'globe_id' })

if (globeError) {
  console.error('GLOBE layer failed:', globeError.message)
  process.exit(1)
}
console.log(`GLOBE layer: ${globe.length} record(s) upserted`)

if (count > 0 && !force) {
  console.log(
    `Resident layer skipped — the table is not empty and these rows have no unique key.\n` +
      `Re-run with --force if you want them inserted anyway.`,
  )
} else {
  const { error } = await supabase.from('issues').insert(resident)
  if (error) {
    console.error('Resident layer failed:', error.message)
    process.exit(1)
  }
  console.log(`Resident layer: ${resident.length} record(s) inserted`)
}

const { count: after } = await supabase.from('issues').select('*', { count: 'exact', head: true })
console.log(`Done. issues table now holds ${after} row(s).`)
