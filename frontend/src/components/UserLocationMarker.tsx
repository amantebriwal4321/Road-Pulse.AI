import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';

interface UserLocationMarkerProps {
  coords: [number, number];
  centerOnFirst?: boolean;
}

/**
 * Renders a pulsing blue "You Are Here" dot at the user's GPS location.
 * Flies the map to the user on first render only (centerOnFirst = true).
 */
export function UserLocationMarker({ coords, centerOnFirst = true }: UserLocationMarkerProps) {
  const map = useMap();
  const markerRef = useRef<L.Marker | null>(null);
  const hasCenteredRef = useRef(false);

  useEffect(() => {
    // Create pulsing blue dot using a DivIcon
    const icon = L.divIcon({
      className: '',
      html: `
        <div style="position:relative;width:24px;height:24px;">
          <!-- outer pulse ring -->
          <div style="
            position:absolute;inset:-6px;
            border-radius:50%;
            background:rgba(37,99,235,0.2);
            animation:locationPulse 2s ease-out infinite;
          "></div>
          <!-- inner solid dot -->
          <div style="
            position:absolute;inset:4px;
            border-radius:50%;
            background:#2563eb;
            box-shadow:0 0 0 3px rgba(255,255,255,0.9), 0 2px 6px rgba(37,99,235,0.6);
          "></div>
        </div>
      `,
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    });

    if (!markerRef.current) {
      markerRef.current = L.marker(coords, { icon, zIndexOffset: 1000 })
        .addTo(map)
        .bindTooltip('You are here', { permanent: false, className: 'location-tooltip' });
    } else {
      markerRef.current.setLatLng(coords);
    }

    // Fly to user on first-ever render
    if (centerOnFirst && !hasCenteredRef.current) {
      map.flyTo(coords, 15, { duration: 1.5 });
      hasCenteredRef.current = true;
    }

    return () => {
      if (markerRef.current) {
        markerRef.current.remove();
        markerRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coords[0], coords[1]]);

  return null;
}
