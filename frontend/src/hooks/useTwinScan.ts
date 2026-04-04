import { useState, useEffect, useRef, useCallback } from "react";
import { reportPothole, type ReportResponse } from "@/services/api";

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
  [12.9168, 77.6230], // Silk Board
  [12.9140, 77.6252], // HSR
  [12.9980, 77.5950], // Hebbal
  [12.9850, 77.6050], // Nagavara
  [12.9750, 77.6060], // MG Road
  [12.9720, 77.6100], // Brigade
  [12.9080, 77.5960], // Jayanagar
  [13.0100, 77.5700], // Sadashivanagar
  [13.0050, 77.5500], // Rajajinagar
  [12.9690, 77.7490], // Whitefield
  [12.9410, 77.5560], // Mysore Road
  [12.9340, 77.6260], // Koramangala
  [12.8450, 77.6600], // Electronic City
  [12.9700, 77.6499], // Old Airport Road
];

/**
 * Jitter within DBSCAN clustering radius.
 * DBSCAN eps = 0.00005° ≈ 5m — so we jitter ≤ 3m to land in the same cluster.
 * The base location shifts every ~10 scans to simulate road movement.
 */
function jitter(base: number, radiusDeg = 0.00003): number {
  return base + (Math.random() * 2 - 1) * radiusDeg;
}

// Move the "vehicle" ~80m along a road every N scans
let scanCount = 0;
let currentRoadIdx = 0;
function getMovingBase(base: [number, number]): [number, number] {
  scanCount++;
  // Every 8 scans, pick a completely different realistic road location and scatter slightly
  if (scanCount % 8 === 0) {
    currentRoadIdx = (currentRoadIdx + 1) % ROAD_POINTS.length;
    const newBase = ROAD_POINTS[currentRoadIdx];
    // Add real scatter (like reseed_realistic.py's scatter of 0.0008) to simulate movement along the road
    return [
      newBase[0] + (Math.random() * 2 - 1) * 0.0008,
      newBase[1] + (Math.random() * 2 - 1) * 0.0008
    ];
  }
  return base;
}

/**
 * useTwinScan — continuously fires POST /report every `intervalMs` ms.
 * Each request uses a slightly randomised location around `baseCoords`
 * to simulate a sensor sweeping the surrounding road network.
 *
 * When the backend confirms a pothole, the potholesHook refetches automatically
 * (it polls independently), so new markers appear on the map within seconds.
 */
export function useTwinScan(
  baseCoords: [number, number] | null,
  intervalMs = 500,
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

    // Advance the "vehicle" position
    if (!movingBaseRef.current) movingBaseRef.current = baseCoords;
    movingBaseRef.current = getMovingBase(movingBaseRef.current);
    const [baseLat, baseLng] = movingBaseRef.current;

    const lat = jitter(baseLat);
    const lng = jitter(baseLng);
    // Bias severity higher (5–10) so DBSCAN clusters confirm more often in demos
    const severity_raw = parseFloat((Math.random() * 5 + 5).toFixed(1)); // 5.0 – 10.0
    const speed_kmh = parseFloat((Math.random() * 45 + 10).toFixed(1)); // 10 – 55 km/h

    let result: ReportResponse;
    try {
      await reportPothole({
        lat: jitter(lat, 0.00001),
        lng: jitter(lng, 0.00001),
        severity_raw,
        speed_kmh,
        device_id: DEVICE_ID + "-A",
      });
      await reportPothole({
        lat: jitter(lat, 0.00001),
        lng: jitter(lng, 0.00001),
        severity_raw,
        speed_kmh,
        device_id: DEVICE_ID + "-B",
      });
      result = await reportPothole({
        lat: jitter(lat, 0.00001),
        lng: jitter(lng, 0.00001),
        severity_raw,
        speed_kmh,
        device_id: DEVICE_ID + "-C",
      });
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
