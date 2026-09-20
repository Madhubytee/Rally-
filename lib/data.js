'use client'

import { MONTHS, formatEventDate, formatEventTime } from './board'
import { formatCoord } from './geo'
import { scoreSeverity } from './severity'
import { explain, suggestFor } from './suggestions'
import { getSupabaseBrowser } from './supabase/client'

/**
 * Reads and writes for the pin, event and signup layers.
 *
 * Every function degrades rather than throws. If Supabase is not configured
 * the caller gets null and falls back to bundled seed data, so the app is
 * always demonstrable — a dead database shows yesterday's map, not a stack
 * trace.
 */

/** A `measured_at` older than this reads as "a while ago" rather than a date. */
const relativeWhen = (iso) => {
  const days = Math.floor((Date.now() - new Date(`${iso}T12:00:00`)) / 86_400_000)
  if (days <= 0) return 'today'
  if (days === 1) return 'yesterday'
  if (days < 14) return `${days} days ago`
  if (days < 60) return `${Math.floor(days / 7)} weeks ago`
  if (days < 365) return `${Math.floor(days / 30)} months ago`
  return 'over a year ago'
}

/** Database row to the shape every component already expects. */
export function toIssue(row) {
  const base = {
    id: row.id,
    lat: row.lat,
    lng: row.lng,
    type: row.type,
    waterSource: row.water_source,
    larvaeCount: row.larvae_count,
    measuredAt: row.measured_at,
    loc: row.loc || formatCoord(row.lat, row.lng),
    detail: row.detail,
    when: relativeWhen(row.measured_at),
    reports: row.reports,
    src: row.source,
  }

  const sev = scoreSeverity(base)
  const suggestion = suggestFor(row.type)

  return { ...base, sev, why: explain({ ...base, sev }), ...suggestion }
}

export function toEvent(row) {
  const starts = new Date(row.starts_at)
  const time = `${String(starts.getHours()).padStart(2, '0')}:${String(
    starts.getMinutes(),
  ).padStart(2, '0')}`

  return {
    id: row.id,
    m: MONTHS[starts.getMonth()],
    d: String(starts.getDate()).padStart(2, '0'),
    title: row.title,
    when: `${formatEventDate(starts)} ${formatEventTime(time)}`,
    going: row.going_count,
    host: row.host_name,
    bring: row.bring,
    loc: row.loc,
    issueId: row.issue_id,
    organizerId: row.organizer_id,
  }
}

/** Every pin, newest observation first. Null when there is no database. */
export async function fetchIssues() {
  const supabase = getSupabaseBrowser()
  if (!supabase) return null

  const { data, error } = await supabase
    .from('issues')
    .select('*')
    .order('measured_at', { ascending: false })

  if (error) {
    console.error('Could not load issues:', error.message)
    return null
  }
  return data.map(toIssue)
}

/** Upcoming events. Past ones drop off on their own. */
export async function fetchEvents() {
  const supabase = getSupabaseBrowser()
  if (!supabase) return null

  const { data, error } = await supabase
    .from('events')
    .select('*')
    .order('starts_at', { ascending: true })

  if (error) {
    console.error('Could not load events:', error.message)
    return null
  }
  return data.map(toEvent)
}

/** Layer 2. Deliberately open to anyone — no account, by design. */
export async function createIssue({ type, lat, lng, detail }) {
  const supabase = getSupabaseBrowser()
  if (!supabase) return null

  const { data, error } = await supabase
    .from('issues')
    .insert({
      lat,
      lng,
      type,
      detail,
      loc: formatCoord(lat, lng),
      /*
       * A fresh report has not been sampled, so the count stays null. Never
       * zero — that would claim the reporter looked for larvae and found
       * none, which is a different and stronger statement.
       */
      larvae_count: null,
      water_source: type === 'Standing water' ? 'Container' : null,
      source: 'Resident report',
    })
    .select()
    .single()

  if (error) {
    console.error('Could not save report:', error.message)
    return null
  }
  return toIssue(data)
}

/** Layer 3. Requires a signed-in organizer; RLS enforces it server side. */
export async function createEvent(draft, { userId, hostName }) {
  const supabase = getSupabaseBrowser()
  if (!supabase) return null

  const startsAt = new Date(`${draft.date}T${draft.time || '09:00'}`)

  const { data, error } = await supabase
    .from('events')
    .insert({
      issue_id: draft.issueId,
      organizer_id: userId,
      title: draft.name,
      loc: draft.loc,
      lat: draft.lat,
      lng: draft.lng,
      starts_at: startsAt.toISOString(),
      bring: draft.bring,
      host_name: draft.host || hostName,
    })
    .select()
    .single()

  if (error) {
    console.error('Could not publish event:', error.message)
    return { error: error.message }
  }
  return toEvent(data)
}

/**
 * Joining an event. Anonymous, and the row is write-only to the public: the
 * headcount is kept by a database trigger so the number can be shown without
 * anyone being able to read the names behind it.
 */
export async function createSignup(eventId, { name, email, phone, org, party }) {
  const supabase = getSupabaseBrowser()
  if (!supabase) return null

  const { error } = await supabase.from('signups').insert({
    event_id: eventId,
    name,
    email,
    phone: phone || null,
    org: org || null,
    party_size: party,
  })

  if (error) {
    console.error('Could not save signup:', error.message)
    return { error: error.message }
  }
  return { ok: true }
}
