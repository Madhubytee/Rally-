/**
 * Region definition and map projection.
 *
 * One bounding box constant defines where the app runs. Change these four
 * numbers and everything downstream — the GLOBE import filter, the placeholder
 * map, the "within your area" copy — follows. That is the whole reuse
 * argument: this is the only place the region is named.
 */

/** Alachua County, Florida. Source: US Census county cartographic boundary. */
export const COUNTY_BOUNDS = {
  minLat: 29.4239,
  maxLat: 29.9458,
  minLng: -82.6595,
  maxLng: -82.0555,
}

/**
 * The tighter window the map actually draws — urban Gainesville. Using the
 * whole county here would cluster every pin into a few pixels at the centre.
 */
export const MAP_BOUNDS = {
  minLat: 29.615,
  maxLat: 29.685,
  minLng: -82.4,
  maxLng: -82.3,
}

export const CITY_CENTER = { lat: 29.6516, lng: -82.3248 }

/** Latitude and longitude that could not be a real reading on Earth. */
export const isValidCoord = (lat, lng) =>
  Number.isFinite(lat) &&
  Number.isFinite(lng) &&
  lat >= -90 &&
  lat <= 90 &&
  lng >= -180 &&
  lng <= 180

export const inBounds = (lat, lng, bounds = COUNTY_BOUNDS) =>
  lat >= bounds.minLat &&
  lat <= bounds.maxLat &&
  lng >= bounds.minLng &&
  lng <= bounds.maxLng

/**
 * Project a coordinate to a percentage offset inside the map viewport.
 *
 * This is a plain linear stretch of the bounding box, not a real projection.
 * Over a few miles the error is invisible, and it keeps the placeholder map
 * dependency-free. When real tiles land, this function is the only thing that
 * gets swapped for the map library's own projection.
 *
 * Returns null for anything outside the drawn window so callers can skip it
 * rather than pinning it to an edge and implying a location it does not have.
 */
export function project(lat, lng, bounds = MAP_BOUNDS) {
  if (!isValidCoord(lat, lng)) return null

  const x = ((lng - bounds.minLng) / (bounds.maxLng - bounds.minLng)) * 100
  const y = ((bounds.maxLat - lat) / (bounds.maxLat - bounds.minLat)) * 100

  if (x < 0 || x > 100 || y < 0 || y > 100) return null
  return { x, y }
}

/** Straight-line distance in miles. Used for the "within N miles" header. */
export function distanceMiles(a, b) {
  const R = 3958.8
  const toRad = (deg) => (deg * Math.PI) / 180
  const dLat = toRad(b.lat - a.lat)
  const dLng = toRad(b.lng - a.lng)
  const lat1 = toRad(a.lat)
  const lat2 = toRad(b.lat)

  const h =
    Math.sin(dLat / 2) ** 2 + Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2)
  return 2 * R * Math.asin(Math.sqrt(h))
}

/** Display form for a coordinate pair, matching what the report field shows. */
export const formatCoord = (lat, lng) => `${lat.toFixed(4)}, ${lng.toFixed(4)}`
