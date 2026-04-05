import { useThemeStore } from "@/stores/themeStore";
import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { LiveMap } from "@/components/LiveMap";
import { usePotholes } from "@/hooks/usePotholes";
import { useGeolocation } from "@/hooks/useGeolocation";
import { useTwinScan } from "@/hooks/useTwinScan";
import { TwinScanPanel } from "@/components/TwinScanPanel";
import { DriveSim, type DriveSimState } from "@/components/DriveSim";
import { SimHUD } from "@/components/SimHUD";
import { distanceMeters } from "@/lib/haversine";
import {
  generateScanReport,
  setLastScanReport,
} from "@/lib/generateScanReport";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutGrid,
  User,
  Navigation,
  Radio,
  AlertTriangle,
  X,
  Locate,
  MapPin,
  Play,
  Moon,
  Sun,
  Building2,
} from "lucide-react";
import type { Map as LeafletMap } from "leaflet";

/* ── Constants ──────────────────────────────────────────────────── */
const DEMO_LOCATION: [number, number] = [12.9408, 77.5551];

function isBengaluru(lat: number, lng: number): boolean {
  return lat >= 12.7 && lat <= 13.2 && lng >= 77.3 && lng <= 77.9;
}

/* ═══════════════════════════════════════════════════════════════════
   SUB-COMPONENTS
   ═══════════════════════════════════════════════════════════════════ */

/* ── Bottom Nav (supports both light & dark) ────────────────────── */
function BottomNav({
  active,
  dark = false,
}: {
  active: string;
  dark?: boolean;
}) {
  const navigate = useNavigate();
  const items = [
    { id: "drive", label: "Drive", icon: Navigation, path: "/citizen/drive" },
    { id: "hub", label: "Hub", icon: LayoutGrid, path: "/citizen/hub" },
    { id: "profile", label: "Profile", icon: User, path: "/citizen/profile" },
  ];
  return (
    <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-[1200]">
      <div
        style={{
          background: dark ? "rgba(30,20,20,0.88)" : "rgba(255,255,255,0.92)",
          backdropFilter: "blur(20px)",
          border: `1px solid ${dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"}`,
          borderRadius: 9999,
          boxShadow: dark
            ? "0 4px 24px rgba(0,0,0,0.5)"
            : "0 4px 24px rgba(0,0,0,0.12)",
          padding: "10px 32px",
          display: "flex",
          gap: 36,
        }}
      >
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => navigate(item.path)}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 3,
              cursor: "pointer",
              border: "none",
              background: "transparent",
              color:
                item.id === active
                  ? "hsl(var(--primary))"
                  : dark
                    ? "rgba(255,255,255,0.4)"
                    : "#9ca3af",
            }}
          >
            <item.icon size={20} />
            <span
              style={{
                fontSize: 10,
                fontFamily: "monospace",
                fontWeight: item.id === active ? 700 : 400,
              }}
            >
              {item.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ── Proximity Alert Banner ─────────────────────────────────────── */
function ProximityAlert({
  message,
  onDismiss,
}: {
  message: string;
  onDismiss: () => void;
}) {
  return (
    <div
      style={{
        background: "rgba(239,68,68,0.95)",
        backdropFilter: "blur(12px)",
        borderRadius: 12,
        padding: "12px 16px",
        display: "flex",
        alignItems: "center",
        gap: 10,
        boxShadow: "0 4px 20px rgba(239,68,68,0.35)",
      }}
    >
      <AlertTriangle size={18} color="white" />
      <span
        style={{
          flex: 1,
          color: "white",
          fontSize: 13,
          fontFamily: "monospace",
          fontWeight: 600,
        }}
      >
        {message}
      </span>
      <button
        onClick={onDismiss}
        style={{ background: "none", border: "none", cursor: "pointer" }}
      >
        <X size={16} color="rgba(255,255,255,0.8)" />
      </button>
    </div>
  );
}

/* ── Glass stat card (for the stats row) ────────────────────────── */
function StatCard({
  icon: Icon,
  label,
  value,
  color,
  dark,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  color: string;
  dark: boolean;
}) {
  return (
    <div
      style={{
        background: dark ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.7)",
        backdropFilter: "blur(12px)",
        border: `1px solid ${dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)"}`,
        borderRadius: 14,
        padding: "12px 14px",
        display: "flex",
        alignItems: "center",
        gap: 10,
        flex: 1,
        minWidth: 0,
      }}
    >
      <div
        style={{
          width: 34,
          height: 34,
          borderRadius: 10,
          background: `${color}15`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Icon size={16} color={color} />
      </div>
      <div>
        <p
          style={{
            margin: 0,
            fontSize: 16,
            fontWeight: 700,
            lineHeight: 1.1,
            fontFamily: "'Space Grotesk', sans-serif",
            color: dark ? "#fff" : "#111827",
          }}
        >
          {value}
        </p>
        <p
          style={{
            margin: 0,
            fontSize: 8,
            fontFamily: "monospace",
            color: dark ? "rgba(255,255,255,0.4)" : "#6b7280",
            letterSpacing: "0.06em",
            textTransform: "uppercase",
          }}
        >
          {label}
        </p>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   MAIN CITIZEN HUB
   ═══════════════════════════════════════════════════════════════════ */
const CitizenHub = () => {
  const { potholes, refetch } = usePotholes(8000);
  const { coords, error: geoError } = useGeolocation(3000);
  const navigate = useNavigate();
  const [autoDetect, setAutoDetect] = useState(true);
  const { theme, toggle } = useThemeStore();
  const [proximityAlert, setProximityAlert] = useState<string | null>(null);
  const [mapRef, setMapRef] = useState<LeafletMap | null>(null);
  const alertTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastAlertTimeRef = useRef<number>(0);

  // ── Simulation state ───────────────────────────────────────────
  const [simActive, setSimActive] = useState(false);
  const [simState, setSimState] = useState<DriveSimState>({
    active: false,
    speed: 0,
    distanceKm: 0,
    detections: [],
    progress: 0,
    scanCount: 0,
    vehiclePos: null,
  });

  // ── Location fallback ──────────────────────────────────────────
  const usingDemoLocation =
    coords !== null && !isBengaluru(coords[0], coords[1]);
  const effectiveCoords: [number, number] | null = coords
    ? isBengaluru(coords[0], coords[1])
      ? coords
      : DEMO_LOCATION
    : null;

  // ── Twin Scan ──────────────────────────────────────────────────
  const scan = useTwinScan(effectiveCoords ?? DEMO_LOCATION, 3500);

  useEffect(() => {
    if (!scan.active) return;
    const fast = setInterval(refetch, 4000);
    return () => clearInterval(fast);
  }, [scan.active, refetch]);

  // ── All potholes displayed (real backend data) ─────────────────

  // ── Severity breakdown ─────────────────────────────────────────
  const sevStats = useMemo(() => {
    const high = potholes.filter((p) => p.severity >= 7).length;
    const med = potholes.filter(
      (p) => p.severity >= 4 && p.severity < 7,
    ).length;
    const low = potholes.filter((p) => p.severity < 4).length;
    return { high, med, low };
  }, [potholes]);

  // ── Advisory text ──────────────────────────────────────────────
  const advisoryText = useMemo(() => {
    if (!potholes.length) return "No active alerts nearby";
    const critical = potholes.find((p) => p.severity >= 9);
    if (critical) return `Critical cluster · ${critical.ward ?? "Unknown"}`;
    const high = potholes.find((p) => p.severity >= 7);
    if (high) return `High severity · ${high.ward ?? "Unknown"}`;
    return `${potholes.length} potholes tracked`;
  }, [potholes]);

  // ── Proximity detection ────────────────────────────────────────
  const checkProximity = useCallback(() => {
    if (!autoDetect || !effectiveCoords || !potholes.length) return;

    // Enforce 20 second cooldown between alerts
    const now = Date.now();
    if (now - lastAlertTimeRef.current < 20000) return;

    const [uLat, uLng] = effectiveCoords;
    const nearby = potholes
      .filter((p) => distanceMeters(uLat, uLng, p.lat, p.lng) < 300)
      .sort((a, b) => b.severity - a.severity);
    if (!nearby.length) return;

    lastAlertTimeRef.current = now;

    const closest = nearby[0];
    const dist = Math.round(
      distanceMeters(uLat, uLng, closest.lat, closest.lng),
    );
    const label =
      closest.severity >= 7 ? "HIGH" : closest.severity >= 4 ? "MEDIUM" : "LOW";
    setProximityAlert(
      `${label} severity pothole ${dist}m away · ${closest.ward ?? "Nearby"}`,
    );
    if (alertTimerRef.current) clearTimeout(alertTimerRef.current);
    alertTimerRef.current = setTimeout(() => setProximityAlert(null), 5000);
  }, [autoDetect, effectiveCoords, potholes]);

  useEffect(() => {
    if (!autoDetect) return;
    const interval = setInterval(checkProximity, 5000);
    return () => clearInterval(interval);
  }, [autoDetect, checkProximity]);

  // ── Sim handlers ───────────────────────────────────────────────
  const simStartRef = useRef<Date | null>(null);
  const handleStartSim = useCallback(() => {
    simStartRef.current = new Date();
    setSimActive(true);
  }, []);
  const handleStopSim = useCallback(() => {
    // Generate PDF report from simulation data
    const reportData = {
      simState,
      startedAt: simStartRef.current ?? new Date(),
      stoppedAt: new Date(),
    };
    setLastScanReport(reportData); // store for Municipality download
    generateScanReport(reportData); // auto-download PDF
    setSimActive(false);
  }, [simState]);

  // ── Centre on user ─────────────────────────────────────────────
  const centreOnUser = useCallback(() => {
    if (mapRef && effectiveCoords)
      mapRef.flyTo(effectiveCoords, 15, { duration: 1.2 });
  }, [mapRef, effectiveCoords]);

  // ── Shared styles ──────────────────────────────────────────────
  const d = theme === "dark";
  const textPrimary = d ? "#fff" : "#111827";
  const textSecondary = d ? "rgba(255,255,255,0.5)" : "#6b7280";
  const glassBg = d ? "rgba(30,20,20,0.82)" : "rgba(255,255,255,0.85)";
  const glassBorder = d ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)";

  /* ═══════════════════════════════════════════════════════════════
     RENDER
     ═══════════════════════════════════════════════════════════════ */
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: d ? "hsl(var(--void))" : "#f8fafc",
      }}
    >
      {/* ── Full-screen map ──────────────────────────────────────── */}
      <div style={{ position: "absolute", inset: 0 }}>
        <LiveMap
          potholes={potholes}
          height="100%"
          tileMode={d ? "dark" : "light"}
          userLocation={autoDetect ? effectiveCoords : null}
          center={effectiveCoords ?? [12.9716, 77.5946]}
          zoom={13}
          showPopups={true}
          onMapRef={setMapRef}
        >
          <DriveSim
            active={simActive}
            baseCoords={effectiveCoords ?? DEMO_LOCATION}
            onStateChange={setSimState}
          />
        </LiveMap>
      </div>

      {/* ── Simulation HUD overlay ──────────────────────────────── */}
      <AnimatePresence>
        {simActive && <SimHUD simState={simState} onStop={handleStopSim} />}
      </AnimatePresence>

      {/* ── Top Header Bar ──────────────────────────────────────── */}
      {!simActive && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            zIndex: 1100,
            padding: "10px 14px 12px",
            background: d
              ? "linear-gradient(to bottom, rgba(30,20,20,0.95) 0%, transparent 100%)"
              : "linear-gradient(to bottom, rgba(248,250,252,0.97) 0%, transparent 100%)",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <div style={{ flex: 1, minWidth: 0 }}>
            <p
              style={{
                fontFamily: "monospace",
                fontSize: 8,
                letterSpacing: "0.14em",
                fontWeight: 700,
                color: textSecondary,
                margin: 0,
              }}
            >
              ROADPULSE TWIN HUB
            </p>
            <p
              style={{
                fontSize: 14,
                fontWeight: 700,
                color: textPrimary,
                margin: 0,
                lineHeight: 1.3,
              }}
            >
              {potholes.length} potholes · Bengaluru
            </p>
          </div>

          {/* Compact severity badges */}
          <div style={{ display: "flex", gap: 4 }}>
            <span
              style={{
                padding: "3px 8px",
                borderRadius: 6,
                fontSize: 9,
                fontFamily: "monospace",
                fontWeight: 700,
                background: "rgba(239,68,68,0.12)",
                color: "#ef4444",
              }}
            >
              {sevStats.high} HIGH
            </span>
            <span
              style={{
                padding: "3px 8px",
                borderRadius: 6,
                fontSize: 9,
                fontFamily: "monospace",
                fontWeight: 700,
                background: "rgba(245,158,11,0.12)",
                color: "#f59e0b",
              }}
            >
              {sevStats.med} MED
            </span>
            <span
              style={{
                padding: "3px 8px",
                borderRadius: 6,
                fontSize: 9,
                fontFamily: "monospace",
                fontWeight: 700,
                background: "rgba(34,197,94,0.12)",
                color: "#22c55e",
              }}
            >
              {sevStats.low} LOW
            </span>
          </div>

          {/* Theme toggle */}
          <button
            onClick={() => toggle()}
            style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              background: d ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.05)",
              border: `1px solid ${glassBorder}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
          >
            {d ? (
              <Sun size={14} color="#fbbf24" />
            ) : (
              <Moon size={14} color="#6b7280" />
            )}
          </button>

          {/* Detect toggle */}
          <button
            onClick={() => setAutoDetect((v) => !v)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 4,
              cursor: "pointer",
              background: autoDetect
                ? "hsl(var(--primary),0.12)"
                : d
                  ? "rgba(255,255,255,0.06)"
                  : "rgba(156,163,175,0.1)",
              border: `1px solid ${autoDetect ? "hsl(var(--primary),0.3)" : glassBorder}`,
              borderRadius: 8,
              padding: "5px 8px",
            }}
          >
            <Radio size={12} color={autoDetect ? "hsl(var(--primary))" : textSecondary} />
            <span
              style={{
                fontFamily: "monospace",
                fontSize: 8,
                fontWeight: 700,
                color: autoDetect ? "hsl(var(--primary))" : textSecondary,
              }}
            >
              {autoDetect ? "DETECT ON" : "OFF"}
            </span>
          </button>
        </div>
      )}

      {/* ── Demo location notice ─────────────────────────────────── */}
      {!simActive && (geoError || usingDemoLocation) && (
        <div
          style={{
            position: "absolute",
            top: 52,
            left: 12,
            right: 12,
            zIndex: 1100,
            background: usingDemoLocation
              ? "rgba(59,130,246,0.92)"
              : "rgba(251,191,36,0.95)",
            borderRadius: 8,
            padding: "5px 10px",
            display: "flex",
            gap: 6,
            alignItems: "center",
          }}
        >
          <MapPin size={11} color={usingDemoLocation ? "white" : "#78350f"} />
          <span
            style={{
              fontSize: 9,
              fontFamily: "monospace",
              color: usingDemoLocation ? "white" : "#78350f",
            }}
          >
            {usingDemoLocation ? "📍 DEMO · BGS Flyover, Bengaluru" : geoError}
          </span>
        </div>
      )}

      {/* ── Proximity alert ─────────────────────────────────────── */}
      <AnimatePresence>
        {proximityAlert && (
          <motion.div
            initial={{ y: -60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -60, opacity: 0 }}
            style={{
              position: "absolute",
              top: 52,
              left: 12,
              right: 12,
              zIndex: 2000,
            }}
          >
            <ProximityAlert
              message={proximityAlert}
              onDismiss={() => setProximityAlert(null)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Right FABs ──────────────────────────────────────────── */}
      <div
        style={{
          position: "absolute",
          right: 12,
          bottom: 100,
          zIndex: 1100,
          display: "flex",
          flexDirection: "column",
          gap: 8,
        }}
      >
        <button
          onClick={centreOnUser}
          disabled={!coords}
          title="Centre on my location"
          style={{
            width: 40,
            height: 40,
            borderRadius: "50%",
            background: glassBg,
            border: `1px solid ${glassBorder}`,
            boxShadow: "0 2px 10px rgba(0,0,0,0.12)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: coords ? "pointer" : "default",
          }}
        >
          <Locate size={18} color={coords ? "hsl(var(--primary))" : textSecondary} />
        </button>
        <button
          onClick={() => navigate("/municipality")}
          title="Municipality Dashboard"
          style={{
            width: 40,
            height: 40,
            borderRadius: "50%",
            background: glassBg,
            border: `1px solid ${glassBorder}`,
            boxShadow: "0 2px 10px rgba(0,0,0,0.12)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
          }}
        >
          <Building2
            size={16}
            color={d ? "rgba(255,255,255,0.5)" : "#6b7280"}
          />
        </button>
      </div>

      {/* ── Left panels (stacked, no overlap) ───────────────────── */}
      <div
        style={{
          position: "absolute",
          left: 12,
          bottom: 120,
          zIndex: 1100,
          display: "flex",
          flexDirection: "column",
          gap: 6,
          maxWidth: 240,
        }}
      >
        <TwinScanPanel scan={scan} style={{ maxWidth: 240 }} />
        {!simActive && (
          <button
            onClick={handleStartSim}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "8px 12px",
              borderRadius: 10,
              border: "none",
              cursor: "pointer",
              fontFamily: "monospace",
              background: "linear-gradient(135deg, #7c3aed, #6d28d9)",
              color: "white",
              boxShadow: "0 3px 12px rgba(124,58,237,0.35)",
            }}
          >
            <Play size={12} color="white" fill="white" />
            <div style={{ textAlign: "left" }}>
              <p
                style={{
                  margin: 0,
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: "0.05em",
                }}
              >
                DEMO SIMULATION
              </p>
              <p style={{ margin: 0, fontSize: 7, opacity: 0.7 }}>
                Vehicle scan demo
              </p>
            </div>
          </button>
        )}
      </div>

      {/* ── Advisory pill ───────────────────────────────────────── */}
      <div
        style={{
          position: "absolute",
          bottom: 62,
          left: 12,
          right: 12,
          zIndex: 1100,
          background: glassBg,
          backdropFilter: "blur(14px)",
          border: `1px solid ${glassBorder}`,
          borderRadius: 10,
          padding: "7px 12px",
          display: "flex",
          alignItems: "center",
          gap: 6,
        }}
      >
        <div
          style={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            flexShrink: 0,
            background: potholes.some((p) => p.severity >= 7)
              ? "#ef4444"
              : "hsl(var(--primary))",
            boxShadow: `0 0 0 2px ${potholes.some((p) => p.severity >= 7) ? "rgba(239,68,68,0.2)" : "hsl(var(--primary),0.2)"}`,
            animation: "locationPulse 2s ease-out infinite",
          }}
        />
        <span
          style={{
            fontSize: 9,
            fontFamily: "monospace",
            color: textSecondary,
            fontWeight: 600,
          }}
        >
          LIVE
        </span>
        <span
          style={{
            fontSize: 10,
            color: textPrimary,
            flex: 1,
            textAlign: "right",
            fontFamily: "monospace",
            fontWeight: 600,
          }}
        >
          {advisoryText}
        </span>
      </div>

      {/* ── Bottom nav ──────────────────────────────────────────── */}
      <BottomNav active="hub" dark={d} />
    </div>
  );
};

export default CitizenHub;
