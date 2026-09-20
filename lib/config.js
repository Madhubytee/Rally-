/**
 * Environment-driven config, read once and shared.
 *
 * Next inlines NEXT_PUBLIC_* at build time, so these must be referenced as
 * full literals (process.env.NEXT_PUBLIC_X) rather than looked up dynamically.
 * Everything here is public by definition — no secrets belong in this file.
 */
export const config = {
  appName: process.env.NEXT_PUBLIC_APP_NAME || 'Rally',
  defaultCity: process.env.NEXT_PUBLIC_DEFAULT_CITY || 'Gainesville',

  map: {
    lat: Number(process.env.NEXT_PUBLIC_MAP_CENTER_LAT) || 29.6516,
    lng: Number(process.env.NEXT_PUBLIC_MAP_CENTER_LNG) || -82.3248,
    zoom: Number(process.env.NEXT_PUBLIC_MAP_DEFAULT_ZOOM) || 13,
    tileToken: process.env.NEXT_PUBLIC_MAP_TILE_TOKEN || '',
  },

  globe: {
    apiBase: process.env.NEXT_PUBLIC_GLOBE_API_BASE || 'https://api.globe.gov/search/v1',
    protocol: process.env.NEXT_PUBLIC_GLOBE_PROTOCOL || 'mosquito_habitat_mapper',
  },
}

/** City slug used in URLs, e.g. rally.org/gainesville */
export const citySlug = config.defaultCity.toLowerCase().replace(/\s+/g, '-')
