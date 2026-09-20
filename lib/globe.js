import { COUNTY_BOUNDS } from './geo'

/**
 * NASA GLOBE Observer — Mosquito Habitat Mapper.
 *
 * Layer 1. Participatory science records: a volunteer finds standing water,
 * reports whether larvae are present, and optionally counts them.
 *
 * The search API is open. No key, no account, no token — and CORS is wide
 * open, so this works from the browser as well as the server. (The key-gated
 * API documented at api.globe.gov/docs is a different service: that one is
 * for *submitting* measurements into GLOBE, not reading them out.)
 *
 * Attribution is required wherever this data is shown:
 *   Global Learning and Observations to Benefit the Environment (GLOBE)
 *   Program, [date accessed], globe.gov
 */

const API = 'https://api.globe.gov/search/v1/measurement/protocol/measureddate/lat/lon/'

export const PROTOCOL = 'mosquito_habitat_mapper'

export const GLOBE_ATTRIBUTION =
  'Global Learning and Observations to Benefit the Environment (GLOBE) Program, globe.gov'

/**
 * Larvae counts come back as strings, or null, and the archive contains
 * junk — a negative count is in there.
 *
 * null is preserved as null and never becomes zero. The observer not
 * sampling is not the same as the observer finding nothing, and flattening
 * the two would let an unchecked site read as a clear one.
 */
export function parseLarvaeCount(raw) {
  if (raw == null || raw === '' || raw === 'null') return null
  const n = Number(raw)
  if (!Number.isFinite(n) || n < 0) return null
  return n
}

/**
 * Map one API row onto the app's record shape.
 *
 * Uses the top-level latitude/longitude, which carry six decimal places. The
 * pair inside `data` is rounded to four and sits 50–100 m away from it.
 */
function toRecord(row) {
  const d = row.data || {}
  const larvaeCount = parseLarvaeCount(d.mosquitohabitatmapperLarvaeCount)
  const measuredAt = (d.mosquitohabitatmapperMeasuredAt || row.measuredDate || '').slice(0, 10)

  return {
    id: `globe-${d.mosquitohabitatmapperMosquitoHabitatMapperId || row.pid}`,
    lat: row.latitude,
    lng: row.longitude,
    type: 'Standing water',
    waterSource: d.mosquitohabitatmapperWaterSource || d.mosquitohabitatmapperWaterSourceType || null,
    waterSourceType: d.mosquitohabitatmapperWaterSourceType || null,
    larvaeCount,
    measuredAt,
    loc: row.siteName || `${row.latitude.toFixed(4)}, ${row.longitude.toFixed(4)}`,
    detail:
      larvaeCount > 0
        ? `Standing water with ${larvaeCount} larvae counted in the sample.`
        : larvaeCount === 0
          ? 'Standing water logged. The observer sampled and found no larvae.'
          : 'Standing water logged. No larvae sample was taken.',
    reports: 1,
    src: 'NASA GLOBE Observer',
    event: 'Standing water clearing',
    bring: 'Gloves, a bucket, boots',
  }
}

/**
 * Fetch observations inside a bounding box.
 *
 * The bbox parameters are enforced server-side, so nothing is filtered in the
 * browser. There is no pagination; the whole matching set arrives in one
 * response.
 *
 * Publication lag is around six months, so this is an archive, not a live
 * feed. Nothing here should be presented as current conditions.
 */
export async function fetchGlobeObservations({
  bounds = COUNTY_BOUNDS,
  startDate = '2017-01-01',
  endDate = new Date().toISOString().slice(0, 10),
  signal,
} = {}) {
  const params = new URLSearchParams({
    protocols: PROTOCOL,
    startdate: startDate,
    enddate: endDate,
    minlat: String(bounds.minLat),
    maxlat: String(bounds.maxLat),
    minlon: String(bounds.minLng),
    maxlon: String(bounds.maxLng),
    geojson: 'FALSE',
    sample: 'FALSE',
  })

  const res = await fetch(`${API}?${params}`, { signal })
  if (!res.ok) throw new Error(`GLOBE API returned ${res.status}`)

  const body = await res.json()
  const rows = body.results || []

  return rows
    .filter((row) => Number.isFinite(row.latitude) && Number.isFinite(row.longitude))
    .map(toRecord)
}
