'use client';

import { useState, useCallback, useRef } from 'react';
import { latLngToCell } from 'h3-js';

export interface UserLocation {
  latitude: number;
  longitude: number;
  city?: string;
  country?: string;
  /** H3 indices keyed by resolution (1–7) */
  h3Indices: Record<number, string>;
}

/** Build H3 indices at resolutions 1–7 for a given lat/lng. */
function buildH3Indices(lat: number, lng: number): Record<number, string> {
  const indices: Record<number, string> = {};
  for (let res = 1; res <= 7; res++) {
    indices[res] = latLngToCell(lat, lng, res);
  }
  return indices;
}

/**
 * Hook that resolves the user's location:
 * 1. IP geolocation via geojs.io (fast, no permission needed)
 * 2. Fallback: browser Geolocation API (requires permission)
 */
export function useUserLocation() {
  const [location, setLocation] = useState<UserLocation | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const busyRef = useRef(false);

  const done = useCallback(() => {
    busyRef.current = false;
    setIsLocating(false);
  }, []);

  const locate = useCallback(async () => {
    if (busyRef.current) return;
    busyRef.current = true;
    setIsLocating(true);
    setError(null);

    // Strategy 1: IP geolocation
    try {
      const res = await fetch('https://get.geojs.io/v1/ip/geo.json');
      if (res.ok) {
        const data = await res.json();
        const lat = parseFloat(data.latitude);
        const lng = parseFloat(data.longitude);
        if (Number.isFinite(lat) && Number.isFinite(lng)) {
          setLocation({
            latitude: lat,
            longitude: lng,
            city: data.city || undefined,
            country: data.country || undefined,
            h3Indices: buildH3Indices(lat, lng),
          });
          done();
          return;
        }
      }
    } catch {
      // fall through to browser geolocation
    }

    // Strategy 2: Browser Geolocation API
    if ('geolocation' in navigator) {
      try {
        const pos = await new Promise<GeolocationPosition>((resolve, reject) =>
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: false,
            timeout: 8000,
            maximumAge: 300_000,
          })
        );
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setLocation({
          latitude: lat,
          longitude: lng,
          h3Indices: buildH3Indices(lat, lng),
        });
        done();
        return;
      } catch {
        // both strategies failed
      }
    }

    setError('Could not determine your location');
    done();
  }, [done]);

  const clear = useCallback(() => {
    setLocation(null);
    setError(null);
  }, []);

  return { location, isLocating, error, locate, clear };
}
