'use client'

import 'maplibre-gl/dist/maplibre-gl.css'

import { useEffect, useRef } from 'react'
import Map, { Marker, NavigationControl, ScaleControl } from '@vis.gl/react-maplibre'

import { CITY_CENTER, COUNTY_BOUNDS } from '@/lib/geo'

import styles from './app.module.css'

/**
 * The real Gainesville basemap.
 *
 * Tiles come from OpenFreeMap, which needs no key, no account and has no
 * request cap. The style is an env var so switching provider — to MapTiler or
 * CARTO, both of which do need a key — is a one-line change rather than a
 * refactor.
 *
 * `positron` is deliberate: a muted greyscale basemap with the points of
 * interest stripped out. A full-colour street map competes with the pins, and
 * the pins are the content here.
 */
const MAP_STYLE =
  process.env.NEXT_PUBLIC_MAP_STYLE || 'https://tiles.openfreemap.org/styles/positron'

/** [west, south, east, north] — MapLibre's order, not the app's. */
const MAX_BOUNDS = [
  COUNTY_BOUNDS.minLng,
  COUNTY_BOUNDS.minLat,
  COUNTY_BOUNDS.maxLng,
  COUNTY_BOUNDS.maxLat,
]

export default function CityMap({ issues, selectedId, onSelect, me, focus, onError }) {
  const mapRef = useRef(null)

  /* Follow the device once a fix arrives, but never yank the view otherwise. */
  useEffect(() => {
    if (!me) return
    mapRef.current?.flyTo({ center: [me.lng, me.lat], zoom: 14, duration: 900 })
  }, [me])

  /*
   * Fly to a point the app explicitly asks for. Used after someone files a
   * report: the pin is added to a map already holding eighteen others, and
   * without this they are left hunting for their own contribution with no
   * idea whether it registered.
   */
  useEffect(() => {
    if (!focus) return
    mapRef.current?.flyTo({ center: [focus.lng, focus.lat], zoom: 15, duration: 1100 })
  }, [focus])

  /* Centre the selected pin if it is off screen — tapping the list should
     not leave the map showing somewhere else entirely. */
  useEffect(() => {
    if (!selectedId) return
    const issue = issues.find((i) => i.id === selectedId)
    const map = mapRef.current
    if (!issue || !map) return
    if (!map.getBounds().contains([issue.lng, issue.lat])) {
      map.easeTo({ center: [issue.lng, issue.lat], duration: 600 })
    }
  }, [selectedId, issues])

  return (
    <Map
      ref={mapRef}
      initialViewState={{
        longitude: CITY_CENTER.lng,
        latitude: CITY_CENTER.lat,
        zoom: 12.4,
      }}
      mapStyle={MAP_STYLE}
      maxBounds={MAX_BOUNDS}
      minZoom={9}
      maxZoom={18}
      attributionControl={{ compact: true }}
      style={{ width: '100%', height: '100%' }}
      onError={onError}
    >
      <NavigationControl position="top-right" showCompass={false} />
      <ScaleControl position="bottom-left" unit="imperial" />

      {issues.map((issue) => (
        <Marker
          key={issue.id}
          longitude={issue.lng}
          latitude={issue.lat}
          anchor="center"
          onClick={(event) => {
            /* Otherwise the map treats it as a background click and the
               selection is cleared in the same gesture that made it. */
            event.originalEvent.stopPropagation()
            onSelect(issue.id)
          }}
        >
          <button
            type="button"
            className={[
              styles.mapPin,
              issue.done ? styles.pinDone : '',
              selectedId === issue.id ? styles.pinSelected : '',
            ]
              .filter(Boolean)
              .join(' ')}
            data-sev={issue.sev}
            aria-label={`${issue.type} at ${issue.loc}`}
          />
        </Marker>
      ))}

      {me && (
        <Marker longitude={me.lng} latitude={me.lat} anchor="center">
          <div className={styles.mePin} role="img" aria-label="Your location" />
        </Marker>
      )}
    </Map>
  )
}
