import { useEffect, useRef, useState, useCallback } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";

interface AnimatedRouteProps {
  routePath: [number, number][];
  /** Distance in km */
  distanceKm?: number;
  /** Number of potholes avoided */
  potholesAvoided?: number;
}

/**
 * Draws a glowing, animated route on the Leaflet map with:
 * - Progressive reveal (the line "draws itself")
 * - Animated dashes with a travelling glow
 * - Pulsing start & end markers
 * - A moving dot that travels along the path
 */
export function AnimatedRoute({
  routePath,
  distanceKm,
  potholesAvoided,
}: AnimatedRouteProps) {
  const map = useMap();
  const layerGroupRef = useRef<L.LayerGroup | null>(null);
  const animFrameRef = useRef<number>(0);
  const [revealed, setRevealed] = useState(false);

  const cleanup = useCallback(() => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    if (layerGroupRef.current) {
      layerGroupRef.current.clearLayers();
      map.removeLayer(layerGroupRef.current);
      layerGroupRef.current = null;
    }
  }, [map]);

  useEffect(() => {
    cleanup();
    if (!routePath || routePath.length < 2) return;

    const group = L.layerGroup().addTo(map);
    layerGroupRef.current = group;

    // ── Fit map to route ───────────────────────────────────────────
    map.fitBounds(routePath as L.LatLngBoundsExpression, {
      padding: [60, 60],
      duration: 1.2,
    });

    // ── Background glow line (wide, semi-transparent) ──────────────
    const glowLine = L.polyline([], {
      color: "#06b6d4",
      weight: 14,
      opacity: 0.15,
      lineCap: "round",
      lineJoin: "round",
    }).addTo(group);

    // ── Main route line ────────────────────────────────────────────
    const mainLine = L.polyline([], {
      color: "#0ea5e9",
      weight: 5,
      opacity: 0.9,
      lineCap: "round",
      lineJoin: "round",
      dashArray: "12, 8",
    }).addTo(group);

    // ── Inner bright line ──────────────────────────────────────────
    const innerLine = L.polyline([], {
      color: "#7dd3fc",
      weight: 2,
      opacity: 0.6,
      lineCap: "round",
      lineJoin: "round",
    }).addTo(group);

    // ── Start marker ───────────────────────────────────────────────
    const startIcon = L.divIcon({
      className: "",
      html: `
        <div style="position:relative;width:32px;height:32px;">
          <div style="
            position:absolute;inset:-4px;
            border-radius:50%;
            background:rgba(34,197,94,0.2);
            animation:locationPulse 2s ease-out infinite;
          "></div>
          <div style="
            position:absolute;inset:0;
            display:flex;align-items:center;justify-content:center;
            border-radius:50%;
            background:linear-gradient(135deg,#22c55e,#16a34a);
            box-shadow:0 0 12px rgba(34,197,94,0.5), 0 2px 8px rgba(0,0,0,0.2);
            color:white;font-size:14px;font-weight:bold;
          ">A</div>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });

    L.marker(routePath[0], { icon: startIcon, zIndexOffset: 900 })
      .addTo(group)
      .bindTooltip("Start", {
        permanent: false,
        className: "route-tooltip-start",
        direction: "top",
        offset: [0, -16],
      });

    // ── End marker ─────────────────────────────────────────────────
    const endIcon = L.divIcon({
      className: "",
      html: `
        <div style="position:relative;width:32px;height:32px;">
          <div style="
            position:absolute;inset:-4px;
            border-radius:50%;
            background:rgba(239,68,68,0.2);
            animation:locationPulse 2s ease-out infinite;
          "></div>
          <div style="
            position:absolute;inset:0;
            display:flex;align-items:center;justify-content:center;
            border-radius:50%;
            background:linear-gradient(135deg,#ef4444,#dc2626);
            box-shadow:0 0 12px rgba(239,68,68,0.5), 0 2px 8px rgba(0,0,0,0.2);
            color:white;font-size:14px;font-weight:bold;
          ">B</div>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });

    L.marker(routePath[routePath.length - 1], {
      icon: endIcon,
      zIndexOffset: 900,
    })
      .addTo(group)
      .bindTooltip("Destination", {
        permanent: false,
        className: "route-tooltip-end",
        direction: "top",
        offset: [0, -16],
      });

    // ── Travelling dot ─────────────────────────────────────────────
    const dotIcon = L.divIcon({
      className: "",
      html: `
        <div style="
          width:12px;height:12px;
          border-radius:50%;
          background:white;
          box-shadow:0 0 16px #0ea5e9, 0 0 4px #0ea5e9;
          border:2px solid #0ea5e9;
        "></div>
      `,
      iconSize: [12, 12],
      iconAnchor: [6, 6],
    });
    const travelDot = L.marker(routePath[0], {
      icon: dotIcon,
      zIndexOffset: 1100,
    }).addTo(group);

    // ── Progressive reveal animation ───────────────────────────────
    const totalPoints = routePath.length;
    const REVEAL_DURATION = 1800; // ms
    let startTime: number | null = null;

    const animateReveal = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / REVEAL_DURATION, 1);

      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const pointCount = Math.max(2, Math.floor(eased * totalPoints));
      const partial = routePath.slice(0, pointCount);

      glowLine.setLatLngs(partial);
      mainLine.setLatLngs(partial);
      innerLine.setLatLngs(partial);

      if (progress < 1) {
        animFrameRef.current = requestAnimationFrame(animateReveal);
      } else {
        setRevealed(true);
        // After reveal, start the travelling dot loop
        animateDot(travelDot, routePath, group);
      }
    };

    animFrameRef.current = requestAnimationFrame(animateReveal);

    // ── Travelling dot loop ────────────────────────────────────────
    const animateDot = (
      dot: L.Marker,
      path: [number, number][],
      _group: L.LayerGroup
    ) => {
      const DOT_DURATION = 8000; // ms for full loop
      let dotStart: number | null = null;

      const moveDot = (ts: number) => {
        if (!layerGroupRef.current) return; // component unmounted
        if (!dotStart) dotStart = ts;
        const elapsed = ts - dotStart;
        const t = (elapsed % DOT_DURATION) / DOT_DURATION;

        const idx = t * (path.length - 1);
        const base = Math.floor(idx);
        const frac = idx - base;
        const a = path[Math.min(base, path.length - 1)];
        const b = path[Math.min(base + 1, path.length - 1)];

        const lat = a[0] + (b[0] - a[0]) * frac;
        const lng = a[1] + (b[1] - a[1]) * frac;
        dot.setLatLng([lat, lng]);

        animFrameRef.current = requestAnimationFrame(moveDot);
      };
      animFrameRef.current = requestAnimationFrame(moveDot);
    };

    // ── Route info card (HTML overlay) ─────────────────────────────
    if (distanceKm !== undefined) {
      const eta = Math.round((distanceKm / 30) * 60); // rough ETA at 30 km/h city speed
      const midIdx = Math.floor(routePath.length / 2);
      const midPoint = routePath[midIdx];

      const infoIcon = L.divIcon({
        className: "",
        html: `
          <div class="route-info-card">
            <div class="route-info-header">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0ea5e9" stroke-width="2.5">
                <path d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l5.447 2.724A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"/>
              </svg>
              <span>Route Info</span>
            </div>
            <div class="route-info-stats">
              <div class="route-stat">
                <span class="route-stat-value">${distanceKm.toFixed(1)} km</span>
                <span class="route-stat-label">Distance</span>
              </div>
              <div class="route-stat-divider"></div>
              <div class="route-stat">
                <span class="route-stat-value">~${eta} min</span>
                <span class="route-stat-label">ETA</span>
              </div>
              ${
                potholesAvoided !== undefined
                  ? `
              <div class="route-stat-divider"></div>
              <div class="route-stat">
                <span class="route-stat-value route-stat-safe">${potholesAvoided}</span>
                <span class="route-stat-label">Hazards</span>
              </div>
              `
                  : ""
              }
            </div>
          </div>
        `,
        iconSize: [0, 0],
        iconAnchor: [100, 70],
      });

      L.marker(midPoint, { icon: infoIcon, zIndexOffset: 1200, interactive: false }).addTo(group);
    }

    return cleanup;
  }, [routePath, distanceKm, potholesAvoided, map, cleanup]);

  return null;
}
