/**
 * DriveSim — Animated vehicle simulation for the Hub page.
 *
 * PURPOSE: Demo for judges showing how RoadPulse scans potholes in real-time.
 *
 * Behavior:
 *  - Follows a smooth OSRM route through key Bengaluru roads
 *  - As the car moves, simulated pothole markers APPEAR near the vehicle
 *  - When the car moves away, those temporary markers DISAPPEAR
 *  - Only shows data around the vehicle's current location (scanning radius)
 *  - Real backend data (from TwinScan) remains separate on the map
 */
import { useEffect, useRef, useCallback } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import { distanceMeters } from "@/lib/haversine";

/* ── Types ─────────────────────────────────────────────────────── */
export interface SimDetection {
  id: string;
  lat: number;
  lng: number;
  severity: number;
  detectedAt: number;
  ward: string;
}

export interface DriveSimState {
  active: boolean;
  speed: number;
  distanceKm: number;
  detections: SimDetection[];
  progress: number;
  scanCount: number;
  vehiclePos: [number, number] | null;
}

interface DriveSimProps {
  active: boolean;
  baseCoords: [number, number];
  onStateChange: (state: DriveSimState) => void;
}

/* ── Predefined key Bengaluru waypoints for a clean route ──────── */
const BENGALURU_WAYPOINTS: [number, number][] = [
  [12.9408, 77.5551],   // BGS Flyover / Mysore Road (Start)
  [12.9516, 77.5660],   // Chamrajpet
  [12.9606, 77.5726],   // KR Market area
  [12.9716, 77.5946],   // MG Road / City Center
  [12.9632, 77.5885],   // Lalbagh approach
  [12.9510, 77.5810],   // Basavanagudi
  [12.9408, 77.5551],   // Back to start (loop)
];

/* ── Pre-seeded pothole locations along the route ─────────────── */
/* These simulate the detections the car "discovers" as it drives. */
const SIMULATED_POTHOLES: Omit<SimDetection, "detectedAt">[] = [
  // Near Chamrajpet
  { id: "sim-1", lat: 12.9485, lng: 77.5620, severity: 7.2, ward: "Chamrajpet" },
  { id: "sim-2", lat: 12.9500, lng: 77.5645, severity: 5.8, ward: "Chamrajpet" },
  // Near KR Market
  { id: "sim-3", lat: 12.9580, lng: 77.5710, severity: 8.5, ward: "Chickpet" },
  { id: "sim-4", lat: 12.9560, lng: 77.5695, severity: 6.1, ward: "Chickpet" },
  { id: "sim-5", lat: 12.9595, lng: 77.5735, severity: 9.1, ward: "KR Market" },
  // Near MG Road
  { id: "sim-6", lat: 12.9700, lng: 77.5920, severity: 4.5, ward: "MG Road" },
  { id: "sim-7", lat: 12.9710, lng: 77.5935, severity: 7.8, ward: "MG Road" },
  // Near Lalbagh
  { id: "sim-8", lat: 12.9640, lng: 77.5870, severity: 6.9, ward: "Lalbagh" },
  { id: "sim-9", lat: 12.9618, lng: 77.5850, severity: 8.2, ward: "Lalbagh" },
  // Near Basavanagudi
  { id: "sim-10", lat: 12.9520, lng: 77.5790, severity: 5.4, ward: "Basavanagudi" },
  { id: "sim-11", lat: 12.9495, lng: 77.5770, severity: 7.6, ward: "Basavanagudi" },
  // Near Mysore Road (start area)
  { id: "sim-12", lat: 12.9420, lng: 77.5570, severity: 8.8, ward: "Mysore Road" },
  { id: "sim-13", lat: 12.9440, lng: 77.5590, severity: 6.3, ward: "Mysore Road" },
];

/** Severity → color */
function sevColor(s: number): string {
  if (s >= 7) return "#ef4444";
  if (s >= 4) return "#f59e0b";
  return "#22c55e";
}

/** Severity → label */
function sevLabel(s: number): string {
  if (s >= 7) return "HIGH";
  if (s >= 4) return "MEDIUM";
  return "LOW";
}

/* ── Main component ─────────────────────────────────────────────── */
export function DriveSim({
  active,
  baseCoords,
  onStateChange,
}: DriveSimProps) {
  const map = useMap();
  const layerGroupRef = useRef<L.LayerGroup | null>(null);
  const animRef = useRef<number>(0);
  const simMarkersRef = useRef<Map<string, { marker: L.CircleMarker; label: L.Marker }>>(new Map());

  /* ── Fetch route from OSRM ──────────────────────────────────── */
  const fetchRoute = useCallback(async (): Promise<[number, number][]> => {
    // Use predefined Bengaluru waypoints for a clean, repeatable demo
    const wps = BENGALURU_WAYPOINTS;
    const coordString = wps.map(([lat, lng]) => `${lng},${lat}`).join(";");
    const url = `https://router.project-osrm.org/route/v1/driving/${coordString}?overview=full&geometries=geojson`;

    try {
      const res = await fetch(url);
      const data = await res.json();
      if (data.routes && data.routes.length > 0) {
        return data.routes[0].geometry.coordinates.map(
          (c: number[]) => [c[1], c[0]] as [number, number]
        );
      }
    } catch (e) {
      console.warn("OSRM fetch failed, using interpolated fallback", e);
    }

    // Fallback: smooth interpolation between waypoints
    const fallback: [number, number][] = [];
    for (let i = 0; i < wps.length - 1; i++) {
      const steps = 40;
      for (let s = 0; s <= steps; s++) {
        const t = s / steps;
        fallback.push([
          wps[i][0] + (wps[i + 1][0] - wps[i][0]) * t,
          wps[i][1] + (wps[i + 1][1] - wps[i][1]) * t,
        ]);
      }
    }
    return fallback;
  }, []);

  /* ── Cleanup ─────────────────────────────────────────────────── */
  const cleanup = useCallback(() => {
    if (animRef.current) cancelAnimationFrame(animRef.current);
    if (layerGroupRef.current) {
      layerGroupRef.current.clearLayers();
      map.removeLayer(layerGroupRef.current);
      layerGroupRef.current = null;
    }
    simMarkersRef.current.clear();
  }, [map]);

  /* ── Main simulation loop ────────────────────────────────────── */
  useEffect(() => {
    if (!active) {
      cleanup();
      onStateChange({
        active: false, speed: 0, distanceKm: 0, detections: [],
        progress: 0, scanCount: 0, vehiclePos: null,
      });
      return;
    }

    let cancelled = false;

    (async () => {
      const route = await fetchRoute();
      if (cancelled || route.length < 2) return;

      const group = L.layerGroup().addTo(map);
      layerGroupRef.current = group;

      // ── Ghost route trail (faint dashed) ───────────────────────
      L.polyline(route, {
        color: "#94a3b8",
        weight: 3,
        opacity: 0.25,
        dashArray: "8, 10",
        lineCap: "round",
      }).addTo(group);

      // ── Driven path (fills behind vehicle) ─────────────────────
      const drivenLine = L.polyline([], {
        color: "#2563eb",
        weight: 4,
        opacity: 0.8,
        lineCap: "round",
        lineJoin: "round",
      }).addTo(group);

      const drivenGlow = L.polyline([], {
        color: "#3b82f6",
        weight: 14,
        opacity: 0.12,
        lineCap: "round",
        lineJoin: "round",
      }).addTo(group);

      // ── Vehicle marker ─────────────────────────────────────────
      const carIcon = L.divIcon({
        className: "",
        html: `
          <div class="sim-vehicle">
            <div class="sim-vehicle-radar"></div>
            <div class="sim-vehicle-body">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.5-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.5 2.8C1.4 11.3 1 12.1 1 13v3c0 .6.4 1 1 1h2"/>
                <circle cx="7" cy="17" r="2"/>
                <circle cx="17" cy="17" r="2"/>
              </svg>
            </div>
          </div>
        `,
        iconSize: [44, 44],
        iconAnchor: [22, 22],
      });

      const vehicleMarker = L.marker(route[0], {
        icon: carIcon,
        zIndexOffset: 2000,
      }).addTo(group);

      // ── Scanning radius circle (subtle, moves with car) ────────
      const scanCircle = L.circle(route[0], {
        radius: 250,
        color: "#2563eb",
        fillColor: "#2563eb",
        fillOpacity: 0.03,
        weight: 1,
        opacity: 0.2,
        dashArray: "6, 6",
      }).addTo(group);

      // ── Fit map to route ───────────────────────────────────────
      map.fitBounds(route as L.LatLngBoundsExpression, {
        padding: [80, 80],
        duration: 1.5,
      });

      // ── Animation constants ────────────────────────────────────
      const LOOP_DURATION = 55_000;  // ~55 seconds for the full loop
      const SCAN_RADIUS = 250;       // metres — potholes appear/disappear within this
      const DETECT_RADIUS = 80;      // metres — "confirmed detection" zone
      let startTime: number | null = null;
      let scanCount = 0;
      let lastScanIdx = -1;
      const allDetections: SimDetection[] = [];

      const animate = (ts: number) => {
        if (cancelled) return;
        if (!startTime) startTime = ts;
        const elapsed = ts - startTime;
        const progress = (elapsed % LOOP_DURATION) / LOOP_DURATION;

        // ── Interpolate position ──────────────────────────────────
        const totalPts = route.length;
        const exactIdx = progress * (totalPts - 1);
        const baseIdx = Math.floor(exactIdx);
        const frac = exactIdx - baseIdx;
        const a = route[Math.min(baseIdx, totalPts - 1)];
        const b = route[Math.min(baseIdx + 1, totalPts - 1)];
        const lat = a[0] + (b[0] - a[0]) * frac;
        const lng = a[1] + (b[1] - a[1]) * frac;
        const pos: [number, number] = [lat, lng];

        // ── Move vehicle + scan circle ────────────────────────────
        vehicleMarker.setLatLng(pos);
        scanCircle.setLatLng(pos);

        // ── Update driven path ────────────────────────────────────
        const driven = route.slice(0, baseIdx + 1);
        driven.push(pos);
        drivenLine.setLatLngs(driven);
        drivenGlow.setLatLngs(driven);

        // ── Show/hide simulated potholes based on car proximity ───
        for (const sp of SIMULATED_POTHOLES) {
          const dist = distanceMeters(lat, lng, sp.lat, sp.lng);
          const existing = simMarkersRef.current.get(sp.id);

          if (dist <= SCAN_RADIUS) {
            // SHOW — pothole is within scanning range
            if (!existing) {
              const radius = Math.max(5, Math.min(18, sp.severity * 2));
              const marker = L.circleMarker([sp.lat, sp.lng], {
                radius,
                color: sevColor(sp.severity),
                fillColor: sevColor(sp.severity),
                fillOpacity: 0.6,
                weight: 2,
                opacity: 0.85,
                className: "sim-pothole-appear",
              }).addTo(group);

              // Severity label floating above
              const labelIcon = L.divIcon({
                className: "",
                html: `
                  <div class="sim-pothole-label">
                    <span class="sim-pothole-tag" style="background:${sevColor(sp.severity)}">
                      ${sevLabel(sp.severity)} · ${sp.severity.toFixed(1)}
                    </span>
                    <span class="sim-pothole-ward">${sp.ward}</span>
                  </div>
                `,
                iconSize: [0, 0],
                iconAnchor: [0, 28],
              });
              const label = L.marker([sp.lat, sp.lng], {
                icon: labelIcon,
                zIndexOffset: 1500,
                interactive: false,
              }).addTo(group);

              simMarkersRef.current.set(sp.id, { marker, label });
            }

            // Check direct detection (close pass)
            if (dist <= DETECT_RADIUS) {
              const alreadyDetected = allDetections.find(d => d.id === sp.id);
              if (!alreadyDetected) {
                allDetections.push({
                  ...sp,
                  detectedAt: Date.now(),
                });

                // Flash pulse on detection
                const pulseIcon = L.divIcon({
                  className: "",
                  html: `<div class="sim-radar-pulse"></div>`,
                  iconSize: [0, 0],
                  iconAnchor: [0, 0],
                });
                const pulse = L.marker([sp.lat, sp.lng], {
                  icon: pulseIcon,
                  interactive: false,
                }).addTo(group);
                setTimeout(() => { if (group.hasLayer(pulse)) group.removeLayer(pulse); }, 2000);

                // Detection badge
                const badgeIcon = L.divIcon({
                  className: "",
                  html: `
                    <div class="sim-detection-alert">
                      <span class="sim-detection-badge ${sp.severity >= 7 ? 'high' : 'medium'}">
                        ⚠ DETECTED · Sev ${sp.severity.toFixed(1)}
                      </span>
                    </div>
                  `,
                  iconSize: [0, 0],
                  iconAnchor: [0, 40],
                });
                const badge = L.marker([sp.lat, sp.lng], {
                  icon: badgeIcon,
                  zIndexOffset: 1600,
                  interactive: false,
                }).addTo(group);
                setTimeout(() => { if (group.hasLayer(badge)) group.removeLayer(badge); }, 3500);
              }
            }
          } else {
            // HIDE — pothole is outside scanning range, remove it
            if (existing) {
              group.removeLayer(existing.marker);
              group.removeLayer(existing.label);
              simMarkersRef.current.delete(sp.id);
            }
          }
        }

        // ── Scan pulse at intervals ───────────────────────────────
        const scanInterval = Math.max(5, Math.floor(totalPts / 40));
        const currentScanIdx = Math.floor(baseIdx / scanInterval);
        if (currentScanIdx !== lastScanIdx) {
          lastScanIdx = currentScanIdx;
          scanCount++;

          const pulseIcon = L.divIcon({
            className: "",
            html: `<div class="sim-radar-pulse"></div>`,
            iconSize: [0, 0],
            iconAnchor: [0, 0],
          });
          const pulse = L.marker(pos, {
            icon: pulseIcon,
            interactive: false,
          }).addTo(group);
          setTimeout(() => { if (group.hasLayer(pulse)) group.removeLayer(pulse); }, 2000);
        }

        // ── Speed simulation ──────────────────────────────────────
        const baseSpeed = 28 + Math.sin(progress * Math.PI * 6) * 12;
        const speed = Math.max(8, Math.round(baseSpeed + (Math.random() - 0.5) * 6));

        // ── Distance ──────────────────────────────────────────────
        let totalDistM = 0;
        for (let i = 1; i < driven.length; i++) {
          totalDistM += distanceMeters(
            driven[i - 1][0], driven[i - 1][1],
            driven[i][0], driven[i][1]
          );
        }

        // ── Emit state ────────────────────────────────────────────
        onStateChange({
          active: true,
          speed,
          distanceKm: parseFloat((totalDistM / 1000).toFixed(2)),
          detections: [...allDetections],
          progress,
          scanCount,
          vehiclePos: pos,
        });

        animRef.current = requestAnimationFrame(animate);
      };

      animRef.current = requestAnimationFrame(animate);
    })();

    return () => {
      cancelled = true;
      cleanup();
    };
  }, [active, map, fetchRoute, cleanup, onStateChange]);

  return null;
}
