import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { LiveMap } from "@/components/LiveMap";
import { usePotholes } from "@/hooks/usePotholes";
import { useGeolocation } from "@/hooks/useGeolocation";
import { distanceMeters } from "@/lib/haversine";
import { useNavigate } from "react-router-dom";
import { HUDLabel } from "@/components/HUDLabel";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutGrid,
  User,
  MapPin,
  Navigation,
  Car,
  Radio,
  AlertTriangle,
  X,
  Locate,
  Play,
} from "lucide-react";
import type { Map as LeafletMap } from "leaflet";

// ─── Hackathon demo location (BGS Flyover / Mysore Road, Bengaluru) ──────────
// If the device's GPS is detected outside Bengaluru bounds (e.g. Mumbai),
// this fallback is used so the demo always shows Bengaluru data correctly.
const DEMO_LOCATION: [number, number] = [12.9408, 77.5551];

/** Bengaluru rough bounding box — anything outside falls back to DEMO_LOCATION */
function isBengaluru(lat: number, lng: number): boolean {
  return lat >= 12.7 && lat <= 13.2 && lng >= 77.3 && lng <= 77.9;
}

// ─── Bottom Nav ────────────────────────────────────────────────
const BottomNav = ({ active }: { active: string }) => {
  const navigate = useNavigate();
  const items = [
    { id: "drive", label: "Drive", icon: Navigation, path: "/citizen/drive" },
    { id: "hub", label: "Hub", icon: LayoutGrid, path: "/citizen/hub" },
    { id: "profile", label: "Profile", icon: User, path: "/citizen/profile" },
  ];
  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[1000]">
      <div
        style={{
          background: "rgba(255,255,255,0.92)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(0,0,0,0.08)",
          borderRadius: 9999,
          boxShadow: "0 4px 24px rgba(0,0,0,0.12)",
          padding: "10px 28px",
          display: "flex",
          gap: 32,
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
              color: item.id === active ? "#2563eb" : "#9ca3af",
              border: "none",
              background: "transparent",
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
};

// ─── Proximity Alert Banner ────────────────────────────────────
function ProximityAlert({
  message,
  onDismiss,
}: {
  message: string;
  onDismiss: () => void;
}) {
  return (
    <div
      className="animate-slide-down"
      style={{
        position: "absolute",
        top: 60,
        left: 12,
        right: 12,
        zIndex: 2000,
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

// ─── Twin Advisories pill ─────────────────────────────────────
function AdvisoryPill({ text }: { text: string }) {
  return (
    <div
      style={{
        position: "absolute",
        bottom: 90,
        left: 12,
        right: 12,
        zIndex: 1000,
        background: "rgba(255,255,255,0.92)",
        backdropFilter: "blur(16px)",
        border: "1px solid rgba(37,99,235,0.2)",
        borderRadius: 12,
        padding: "10px 14px",
        display: "flex",
        alignItems: "center",
        gap: 8,
        boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
      }}
    >
      <div
        style={{
          width: 8,
          height: 8,
          borderRadius: "50%",
          background: "#2563eb",
          flexShrink: 0,
          boxShadow: "0 0 0 3px rgba(37,99,235,0.2)",
          animation: "locationPulse 2s ease-out infinite",
        }}
      />
      <span
        style={{
          fontSize: 11,
          fontFamily: "monospace",
          color: "#1e3a8a",
          flex: 1,
          fontWeight: 600,
        }}
      >
        TWIN ADVISORIES · LIVE
      </span>
      <span style={{ fontSize: 12, color: "#374151" }}>{text}</span>
    </div>
  );
}

// ─── Main CitizenHub ──────────────────────────────────────────
const CitizenHub = () => {
  const { potholes } = usePotholes(8000);
  const { coords, error: geoError } = useGeolocation(3000);
  const [autoDetect, setAutoDetect] = useState(true);
  const [driveMode, setDriveMode] = useState(false);
  const [proximityAlert, setProximityAlert] = useState<string | null>(null);
  const [mapRef, setMapRef] = useState<LeafletMap | null>(null);
  const [routeData, setRouteData] = useState<any | null>(null);
  const alertTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Simulator State ──
  const [simulating, setSimulating] = useState(false);
  const [simRoute, setSimRoute] = useState<[number, number][]>([]);
  const [simIndex, setSimIndex] = useState(0);
  const [simPotholes, setSimPotholes] = useState<any[]>([]);

  // ── Demo fallback: use hardcoded Bengaluru location if GPS is outside city ──
  // This ensures the demo works correctly on any laptop anywhere in India.
  const usingDemoLocation =
    coords !== null && !isBengaluru(coords[0], coords[1]);

  let baseCoords: [number, number] | null = coords
    ? isBengaluru(coords[0], coords[1])
      ? coords
      : DEMO_LOCATION
    : null;

  const effectiveCoords: [number, number] | null =
    simulating && simRoute[simIndex] ? simRoute[simIndex] : baseCoords;

  const combinedPotholes = useMemo(() => {
    return [...potholes, ...simPotholes];
  }, [potholes, simPotholes]);

  const advisoryText = useMemo(() => {
    if (!combinedPotholes.length) return "No active alerts nearby";
    const critical = combinedPotholes.find((p) => p.severity >= 9);
    if (critical) return `⚠️ Critical cluster · ${critical.ward ?? "Unknown"}`;
    const high = combinedPotholes.find((p) => p.severity >= 7);
    if (high) return `⚠️ High severity · ${high.ward ?? "Unknown"}`;
    return `${combinedPotholes.length} potholes tracked · Bengaluru`;
  }, [combinedPotholes]);

  // ── Simulator Logic ──
  const startSimulation = useCallback(() => {
    if (!baseCoords) return;
    const [bLat, bLng] = baseCoords;
    const pts: [number, number][] = [];
    const r = 0.003; // small circle
    for (let i = 0; i < 60; i++) {
      const ang = (i / 60) * Math.PI * 2;
      pts.push([bLat + r * Math.sin(ang), bLng + r * Math.cos(ang)]);
    }
    setSimRoute(pts);
    setSimIndex(0);
    setSimPotholes([]);
    setSimulating(true);
    setDriveMode(true); // Automatically enter drive mode to watch simulation
  }, [baseCoords]);

  useEffect(() => {
    if (!simulating || simIndex >= simRoute.length - 1) {
      if (simulating && simIndex >= simRoute.length - 1) {
        setTimeout(() => setSimulating(false), 2000);
      }
      return;
    }
    const t = setTimeout(() => {
      setSimIndex((i) => i + 1);
      if (Math.random() < 0.25) {
        setSimPotholes((prev) => [
          ...prev,
          {
            id: "sim-" + simIndex,
            lat: simRoute[simIndex][0] + (Math.random() - 0.5) * 0.0005,
            lng: simRoute[simIndex][1] + (Math.random() - 0.5) * 0.0005,
            severity: 4 + Math.random() * 6,
            report_count: 5,
            status: "open",
            ward: "Simulation",
            city: "Bengaluru",
          },
        ]);
      }
    }, 600); // move every 600ms
    return () => clearTimeout(t);
  }, [simulating, simIndex, simRoute]);

  // ── Proximity detection ──────────────────────────────────────
  const checkProximity = useCallback(() => {
    if (!autoDetect || !effectiveCoords || !combinedPotholes.length) return;
    const [uLat, uLng] = effectiveCoords;
    const nearby = combinedPotholes
      .filter((p) => distanceMeters(uLat, uLng, p.lat, p.lng) < 300)
      .sort((a, b) => b.severity - a.severity);
    if (!nearby.length) return;
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
  }, [autoDetect, effectiveCoords, combinedPotholes]);

  useEffect(() => {
    if (!autoDetect && !simulating) return;
    const interval = setInterval(checkProximity, 5000);
    return () => clearInterval(interval);
  }, [autoDetect, checkProximity, simulating]);

  // ── Centre on user ───────────────────────────────────────────
  const centreOnUser = useCallback(() => {
    if (mapRef && effectiveCoords)
      mapRef.flyTo(effectiveCoords, 16, { duration: 1.2 });
  }, [mapRef, effectiveCoords]);

  // ── Drive mode: lock orientation / full screen ───────────────
  if (driveMode) {
    return (
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 9999,
          background: "#000",
        }}
      >
        {/* Full-screen dark map in drive mode */}
        <div style={{ position: "absolute", inset: 0 }}>
          <LiveMap
            potholes={combinedPotholes}
            height="100%"
            tileMode="dark"
            userLocation={effectiveCoords}
            center={effectiveCoords ?? [12.9716, 77.5946]}
            zoom={16}
            showPopups={false}
            routeData={routeData}
            onMapRef={setMapRef}
          />
        </div>

        {/* HUD overlay */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            padding: "16px 20px",
            background:
              "linear-gradient(to bottom, rgba(0,0,0,0.7), transparent)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            zIndex: 100,
          }}
        >
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: "#00fff7",
                boxShadow: "0 0 6px #00fff7",
                animation: "locationPulse 2s ease-out infinite",
              }}
            />
            <span
              style={{
                color: "#00fff7",
                fontFamily: "monospace",
                fontSize: 11,
                fontWeight: 700,
              }}
            >
              TWIN ACTIVE · SCANNING
            </span>
          </div>
          <button
            onClick={() => setDriveMode(false)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              background: "rgba(255,255,255,0.15)",
              border: "1px solid rgba(255,255,255,0.2)",
              color: "white",
              borderRadius: 8,
              padding: "6px 14px",
              cursor: "pointer",
              fontSize: 12,
              fontFamily: "monospace",
            }}
          >
            <X size={14} /> EXIT DRIVE MODE
          </button>
        </div>

        {/* Nearby potholes count badge */}
        <div
          style={{
            position: "absolute",
            bottom: 40,
            left: 20,
            zIndex: 100,
            background: "rgba(239,68,68,0.9)",
            borderRadius: 10,
            padding: "8px 16px",
          }}
        >
          <span
            style={{
              color: "white",
              fontFamily: "monospace",
              fontWeight: 700,
              fontSize: 13,
            }}
          >
            {combinedPotholes.filter((p) => p.severity >= 7).length} hazards
            nearby
          </span>
        </div>

        <AnimatePresence>
          {proximityAlert && (
            <motion.div
              initial={{ y: -80 }}
              animate={{ y: 0 }}
              exit={{ y: -80 }}
              style={{
                position: "absolute",
                top: 70,
                left: 12,
                right: 12,
                zIndex: 200,
              }}
            >
              <ProximityAlert
                message={proximityAlert}
                onDismiss={() => setProximityAlert(null)}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // ── Normal Hub view ──────────────────────────────────────────
  return (
    <div style={{ position: "fixed", inset: 0, background: "#f8fafc" }}>
      {/* ── Full-screen LIGHT map ── */}
      <div style={{ position: "absolute", inset: 0 }}>
        <LiveMap
          potholes={combinedPotholes}
          height="100%"
          tileMode="light"
          userLocation={autoDetect || simulating ? effectiveCoords : null}
          center={effectiveCoords ?? [12.9716, 77.5946]}
          zoom={13}
          showPopups={true}
          routeData={routeData}
          onMapRef={setMapRef}
        />
      </div>

      {/* ── Top bar overlay ── */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          padding: "12px 16px",
          background:
            "linear-gradient(to bottom, rgba(248,250,252,0.95) 0%, rgba(248,250,252,0) 100%)",
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        {/* Title */}
        <div style={{ flex: 1 }}>
          <p
            style={{
              fontFamily: "monospace",
              fontSize: 10,
              color: "#6b7280",
              letterSpacing: "0.12em",
              fontWeight: 700,
            }}
          >
            ROADPULSE TWIN HUB
          </p>
          <p
            style={{
              fontSize: 16,
              fontWeight: 700,
              color: "#111827",
              margin: 0,
              lineHeight: 1.2,
            }}
          >
            {combinedPotholes.length} active potholes · Bengaluru
          </p>
        </div>

        {/* Auto-detect toggle */}
        <button
          onClick={() => setAutoDetect((v) => !v)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            cursor: "pointer",
            background: autoDetect
              ? "rgba(37,99,235,0.1)"
              : "rgba(156,163,175,0.1)",
            border: `1px solid ${autoDetect ? "rgba(37,99,235,0.3)" : "rgba(156,163,175,0.3)"}`,
            borderRadius: 8,
            padding: "6px 12px",
          }}
        >
          <Radio size={14} color={autoDetect ? "#2563eb" : "#9ca3af"} />
          <span
            style={{
              fontFamily: "monospace",
              fontSize: 10,
              fontWeight: 700,
              color: autoDetect ? "#2563eb" : "#9ca3af",
            }}
          >
            {autoDetect ? "DETECT ON" : "DETECT OFF"}
          </span>
        </button>
      </div>

      {/* ── GPS error or demo-location notice ── */}
      {(geoError || usingDemoLocation) && (
        <div
          style={{
            position: "absolute",
            top: 60,
            left: 12,
            right: 12,
            zIndex: 1000,
            background: usingDemoLocation
              ? "rgba(59,130,246,0.92)"
              : "rgba(251,191,36,0.95)",
            borderRadius: 10,
            padding: "8px 14px",
            display: "flex",
            gap: 8,
            alignItems: "center",
          }}
        >
          <MapPin size={14} color={usingDemoLocation ? "white" : "#78350f"} />
          <span
            style={{
              fontSize: 11,
              fontFamily: "monospace",
              color: usingDemoLocation ? "white" : "#78350f",
            }}
          >
            {usingDemoLocation
              ? "📍 DEMO LOCATION · BGS Flyover, Bengaluru (GPS outside city)"
              : geoError}
          </span>
        </div>
      )}

      {/* ── Proximity alert ── */}
      <AnimatePresence>
        {proximityAlert && (
          <motion.div
            initial={{ y: -80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -80, opacity: 0 }}
            style={{
              position: "absolute",
              top: 60,
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

      {/* ── Floating action buttons (right side) ── */}
      <div
        style={{
          position: "absolute",
          right: 14,
          bottom: 110,
          zIndex: 1000,
          display: "flex",
          flexDirection: "column",
          gap: 10,
        }}
      >
        {/* Run Simulation */}
        <button
          onClick={startSimulation}
          disabled={simulating || !baseCoords}
          title="Run Simulation"
          style={{
            width: 44,
            height: 44,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.95)",
            border: "1px solid rgba(0,0,0,0.1)",
            boxShadow: "0 2px 12px rgba(0,0,0,0.15)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: simulating || !baseCoords ? "default" : "pointer",
          }}
        >
          <Play
            size={20}
            color={simulating ? "#9ca3af" : "#22c55e"}
            fill={simulating ? "transparent" : "#22c55e"}
          />
        </button>

        {/* Centre on me */}
        <button
          onClick={centreOnUser}
          disabled={!effectiveCoords}
          title="Centre on my location"
          style={{
            width: 44,
            height: 44,
            borderRadius: "50%",
            background: effectiveCoords
              ? "rgba(255,255,255,0.95)"
              : "rgba(255,255,255,0.5)",
            border: "1px solid rgba(0,0,0,0.1)",
            boxShadow: "0 2px 12px rgba(0,0,0,0.15)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: effectiveCoords ? "pointer" : "default",
          }}
        >
          <Locate size={20} color={effectiveCoords ? "#2563eb" : "#9ca3af"} />
        </button>

        {/* Drive mode */}
        <button
          onClick={() => setDriveMode(true)}
          title="Enter Drive Mode"
          style={{
            width: 44,
            height: 44,
            borderRadius: "50%",
            background: "rgba(37,99,235,0.95)",
            border: "1px solid rgba(37,99,235,0.5)",
            boxShadow: "0 2px 12px rgba(37,99,235,0.35)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
          }}
        >
          <Car size={20} color="white" />
        </button>
      </div>

      {/* ── Twin Advisories pill ── */}
      <AdvisoryPill text={advisoryText} />

      {/* ── Bottom nav ── */}
      <BottomNav active="hub" />
    </div>
  );
};

export default CitizenHub;
