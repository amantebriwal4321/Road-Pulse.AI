import { useState, useEffect, useRef } from 'react';

interface GeolocationState {
  coords: [number, number] | null;
  accuracy: number | null;
  error: string | null;
  loading: boolean;
}

/**
 * Continuously watches the user's GPS position via the browser Geolocation API.
 * - Throttles position updates to avoid excessive re-renders (3 s minimum gap).
 * - Cleans up the watcher on unmount.
 */
export function useGeolocation(throttleMs = 3000): GeolocationState {
  const [state, setState] = useState<GeolocationState>({
    coords: null,
    accuracy: null,
    error: null,
    loading: true,
  });

  const lastUpdateRef = useRef<number>(0);
  const watchIdRef = useRef<number | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setState((s) => ({ ...s, loading: false, error: 'Geolocation not supported by this browser.' }));
      return;
    }

    const onSuccess = (pos: GeolocationPosition) => {
      const now = Date.now();
      if (now - lastUpdateRef.current < throttleMs) return; // throttle
      lastUpdateRef.current = now;
      setState({
        coords: [pos.coords.latitude, pos.coords.longitude],
        accuracy: pos.coords.accuracy,
        error: null,
        loading: false,
      });
    };

    const onError = (err: GeolocationPositionError) => {
      setState((s) => ({
        ...s,
        loading: false,
        error: err.code === 1 ? 'Location permission denied.' : 'Unable to determine location.',
      }));
    };

    watchIdRef.current = navigator.geolocation.watchPosition(onSuccess, onError, {
      enableHighAccuracy: true,
      maximumAge: throttleMs,
      timeout: 10_000,
    });

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, [throttleMs]);

  return state;
}
