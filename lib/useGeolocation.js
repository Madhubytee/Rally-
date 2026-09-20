'use client'

import { useCallback, useState } from 'react'

/**
 * The device's own position.
 *
 * `navigator.geolocation` is a browser API — no key, no account, no service
 * behind it. It does require a secure context, which means HTTPS in
 * production; Vercel serves every deployment over HTTPS, and localhost is
 * exempt during development.
 *
 * Only ever called from an event handler. Firing it on mount would throw a
 * permission prompt at someone who has not asked for anything yet, and the
 * denial that usually follows is sticky — the browser remembers it and there
 * is no way to ask again from script.
 */
export function useGeolocation() {
  const [position, setPosition] = useState(null)
  const [error, setError] = useState('')
  const [locating, setLocating] = useState(false)

  const locate = useCallback(() => {
    if (typeof navigator === 'undefined' || !('geolocation' in navigator)) {
      setError('This browser cannot share a location.')
      return
    }

    setLocating(true)
    setError('')

    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setPosition({
          lat: coords.latitude,
          lng: coords.longitude,
          accuracy: coords.accuracy,
        })
        setLocating(false)
      },
      (err) => {
        setError(
          {
            1: 'Location permission denied. Type the coordinates instead.',
            2: 'Could not work out where you are.',
            3: 'Location request timed out.',
          }[err.code] || 'Location lookup failed.',
        )
        setLocating(false)
      },
      { enableHighAccuracy: true, timeout: 10_000, maximumAge: 0 },
    )
  }, [])

  return { position, error, locating, locate }
}
