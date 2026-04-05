import { useState, useEffect, useRef, useCallback } from "react";
import { reportBulkPotholes, type ReportResponse } from "@/services/api";

export interface ScanEvent {
  lat: number;
  lng: number;
  severity_raw: number;
  confirmed: boolean;
  confidence: number;
  pothole_id?: string;
  message: string;
  timestamp: Date;
}

export interface TwinScanState {
  active: boolean;
  totalScans: number;
  confirmedPotholes: number;
  lastEvent: ScanEvent | null;
  log: ScanEvent[];
  start: () => void;
  stop: () => void;
  toggle: () => void;
}

const DEVICE_ID = "TWIN-SCAN-LIVE-01";

const ROAD_POINTS = [
  [12.9168, 77.623], // Silk Board
  [12.914, 77.6252], // HSR
  [12.998, 77.595], // Hebbal
  [12.985, 77.605], // Nagavara
  [12.975, 77.606], // MG Road
  [12.972, 77.61], // Brigade
  [12.908, 77.596], // Jayanagar
  [13.01, 77.57], // Sadashivanagar
  [13.005, 77.55], // Rajajinagar
  [12.969, 77.749], // Whitefield
  [12.941, 77.556], // Mysore Road
  [12.934, 77.626], // Koramangala
  [12.845, 77.66], // Electronic City
  [12.97, 77.6499], // Old Airport Road
];

/**
 * Jitter within DBSCAN clustering radius.
 * DBSCAN eps = 0.00005° ≈ 5m — so we jitter ≤ 3m to land in the same cluster.
 * The base location shifts every ~10 scans to simulate road movement.
 */
function jitter(base: number, radiusDeg = 0.00003): number {
  return base + (Math.random() * 2 - 1) * radiusDeg;
}

// Move the "vehicle" to a new random road segment every scan
function getMovingBase(): [number, number] {
  // Pick a totally random realistic road location each tick to scatter potholes fast
  const newBase = ROAD_POINTS[Math.floor(Math.random() * ROAD_POINTS.length)];
  // Add real scatter (like reseed_realistic.py's scatter of 0.02) to spread them out
  return [
    newBase[0] + (Math.random() * 2 - 1) * 0.02,
    newBase[1] + (Math.random() * 2 - 1) * 0.02,
  ];
}

/**
 * useTwinScan — continuously fires POST /report/bulk every `intervalMs` ms.
 * Each request uses a slightly randomised location around `baseCoords`
 * to simulate a sensor sweeping the surrounding road network.
 *
 * When the backend confirms a pothole, the potholesHook refetches automatically
 * (it polls independently), so new markers appear on the map within seconds.
 */
export function useTwinScan(
  baseCoords: [number, number] | null,
  intervalMs = 250,
): TwinScanState {
  const [active, setActive] = useState(false);
  const [totalScans, setTotalScans] = useState(0);
  const [confirmedPotholes, setConfirmedPotholes] = useState(0);
  const [lastEvent, setLastEvent] = useState<ScanEvent | null>(null);
  const [log, setLog] = useState<ScanEvent[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const movingBaseRef = useRef<[number, number] | null>(null);

  const runScan = useCallback(async () => {
    if (!baseCoords) return;

    // Fast-jump to a brand new random road location every time
    const [baseLat, baseLng] = getMovingBase();

    // Apply final micro-jitter to the spot
    const lat = jitter(baseLat);
    const lng = jitter(baseLng);
    // Generate a random severity across the full range (2.0 to 10.0) so green dots (low severity) also appear
    const severity_raw = parseFloat((Math.random() * 8 + 2).toFixed(1)); // 2.0 – 10.0
    const speed_kmh = parseFloat((Math.random() * 45 + 10).toFixed(1)); // 10 – 55 km/h

    let result: ReportResponse;
    try {
      // Send 3 jittered reports in a single bulk HTTP request
      const responses = await reportBulkPotholes([
        {
          lat: jitter(lat, 0.00001),
          lng: jitter(lng, 0.00001),
          severity_raw,
          speed_kmh,
          device_id: DEVICE_ID + "-A",
        },
        {
          lat: jitter(lat, 0.00001),
          lng: jitter(lng, 0.00001),
          severity_raw,
          speed_kmh,
          device_id: DEVICE_ID + "-B",
        },
        {
          lat: jitter(lat, 0.00001),
          lng: jitter(lng, 0.00001),
          severity_raw,
          speed_kmh,
          device_id: DEVICE_ID + "-C",
        },
      ]);
      result = responses[responses.length - 1]; // The final one will contain the confirmed DBSCAN result
    } catch {
      return; // silent — don't break the scan loop on network error
    }

    const event: ScanEvent = {
      lat,
      lng,
      severity_raw,
      confirmed: result.pothole_confirmed,
      confidence: result.confidence ?? 0,
      pothole_id: result.pothole_id,
      message: result.message,
      timestamp: new Date(),
    };

    setTotalScans((n) => n + 1);
    if (result.pothole_confirmed) setConfirmedPotholes((n) => n + 1);
    setLastEvent(event);
    setLog((prev) => [event, ...prev].slice(0, 20));
  }, [baseCoords]);

  // Start / stop the scan loop
  useEffect(() => {
    if (!active) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }
    runScan(); // fire immediately on start
    intervalRef.current = setInterval(runScan, intervalMs);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [active, runScan, intervalMs]);

  const start = useCallback(() => setActive(true), []);
  const stop = useCallback(() => {
    setActive(false);
  }, []);
  const toggle = useCallback(() => setActive((v) => !v), []);

  return {
    active,
    totalScans,
    confirmedPotholes,
    lastEvent,
    log,
    start,
    stop,
    toggle,
  };
}
