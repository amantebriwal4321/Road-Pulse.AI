import { useState, useEffect } from "react";
import { LiveMap } from "@/components/LiveMap";
import { usePotholes } from "@/hooks/usePotholes";
import { useTwinScan } from "@/hooks/useTwinScan";
import { TwinScanPanel } from "@/components/TwinScanPanel";
import { useNavigate } from "react-router-dom";
import { User, LayoutGrid, Map, Moon, Sun } from "lucide-react";
import { Chatbot } from "@/components/Chatbot";
import type { RouteResult } from "@/components/Chatbot";

// Bengaluru demo coords (same as Hub fallback)
const DRIVE_SCAN_BASE: [number, number] = [12.9408, 77.5551];

// ─── Bottom Nav ──────────────────────────────────────────────────
const BottomNav = ({ active, dark }: { active: string; dark: boolean }) => {
  const navigate = useNavigate();
  const items = [
    { id: "drive", label: "Drive", icon: Map, path: "/citizen/drive" },
    { id: "hub", label: "Hub", icon: LayoutGrid, path: "/citizen/hub" },
    { id: "profile", label: "Profile", icon: User, path: "/citizen/profile" },
  ];
  return (
    <div
      style={{
        position: "absolute",
        bottom: 16,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 1000,
      }}
    >
      <div
        style={{
          background: dark ? "rgba(30,20,20,0.88)" : "rgba(255,255,255,0.92)",
          backdropFilter: "blur(20px)",
          border: dark
            ? "1px solid rgba(255,255,255,0.08)"
            : "1px solid rgba(0,0,0,0.08)",
          borderRadius: 9999,
          boxShadow: dark
            ? "0 4px 24px rgba(0,0,0,0.5)"
            : "0 4px 24px rgba(0,0,0,0.12)",
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
              color:
                item.id === active
                  ? "hsl(var(--primary))"
                  : dark
                    ? "rgba(255,255,255,0.4)"
                    : "#9ca3af",
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

// ─── Main Component ───────────────────────────────────────────────
const CitizenDrive = () => {
  const { potholes, refetch } = usePotholes(10000);
  const scan = useTwinScan(DRIVE_SCAN_BASE, 3500);
  const [routeResult, setRouteResult] = useState<RouteResult | null>(null);
  const [darkMode, setDarkMode] = useState(true);

  // Fast refresh while scanning so new confirmed potholes appear quickly
  useEffect(() => {
    if (!scan.active) return;
    const fast = setInterval(refetch, 4000);
    return () => clearInterval(fast);
  }, [scan.active, refetch]);

  const d = darkMode;
  const glassBorder = d ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)";

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: d ? "hsl(var(--void))" : "#f1f5f9",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* ── Top header bar ─────────────────────────────────────── */}
      <div
        style={{
          height: 52,
          background: d ? "rgba(30,20,20,0.95)" : "rgba(255,255,255,0.95)",
          backdropFilter: "blur(20px)",
          borderBottom: `1px solid ${glassBorder}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 16px",
          flexShrink: 0,
          zIndex: 100,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: "hsl(var(--primary))",
              boxShadow: "0 0 6px hsl(var(--primary) / 0.6)",
            }}
          />
          <span
            style={{
              fontFamily: "monospace",
              fontWeight: 700,
              fontSize: 13,
              color: d ? "#fff" : "hsl(var(--foreground))",
            }}
          >
            ROADPULSE DRIVE
          </span>
          <span
            style={{
              fontSize: 10,
              fontFamily: "monospace",
              background: "hsl(var(--primary) / 0.1)",
              color: "hsl(var(--primary))",
              padding: "2px 8px",
              borderRadius: 4,
              fontWeight: 700,
            }}
          >
            {potholes.length} HAZARDS MAPPED
          </span>
        </div>

        {/* Theme toggle */}
        <button
          onClick={() => setDarkMode((v) => !v)}
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
      </div>

      {/* ── Main split layout ──────────────────────────────────── */}
      <div
        style={{
          flex: 1,
          display: "flex",
          overflow: "hidden",
          position: "relative",
        }}
      >
        {/* ── MAP (left / full on mobile when sidebar closed) ── */}
        <div
          style={{
            flex: "1 1 0",
            position: "relative",
            transition: "all 0.3s ease",
          }}
        >
          <LiveMap
            potholes={potholes}
            height="100%"
            tileMode={d ? "dark" : "light"}
            center={[12.9352, 77.5551]}
            zoom={13}
            showPopups={true}
            routePath={routeResult?.path ?? null}
            routeDistanceKm={routeResult?.distanceKm}
            routePotholesCount={routeResult?.potholesCount}
          />

          {/* Map legend overlay */}
          <div
            style={{
              position: "absolute",
              top: 12,
              left: 12,
              zIndex: 500,
              background: d ? "rgba(30,20,20,0.92)" : "rgba(255,255,255,0.92)",
              backdropFilter: "blur(12px)",
              borderRadius: 10,
              padding: "8px 12px",
              border: `1px solid ${glassBorder}`,
              boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
            }}
          >
            <p
              style={{
                fontSize: 9,
                fontFamily: "monospace",
                color: d ? "rgba(255,255,255,0.5)" : "#6b7280",
                fontWeight: 700,
                marginBottom: 6,
              }}
            >
              POTHOLE SEVERITY
            </p>
            {[
              { color: "#ef4444", label: "High (7–10)" },
              { color: "#f59e0b", label: "Medium (4–7)" },
              { color: "#22c55e", label: "Low (0–4)" },
            ].map(({ color, label }) => (
              <div
                key={label}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  marginBottom: 3,
                }}
              >
                <div
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    background: color,
                  }}
                />
                <span
                  style={{ fontSize: 10, color: d ? "#e2e8f0" : "#374151" }}
                >
                  {label}
                </span>
              </div>
            ))}
          </div>

          {/* ── Twin Scan Panel — top-left, below the legend ── */}
          <TwinScanPanel
            scan={scan}
            compact={true}
            style={{ position: "absolute", left: 12, top: 110, zIndex: 500 }}
          />
        </div>

        {/* ── CHATBOT SIDEBAR ──────────────────────────────────── */}
        <Chatbot onShowRoute={setRouteResult} potholes={potholes} />
      </div>

      {/* ── Bottom nav ───────────────────────────────────────────── */}
      <BottomNav active="drive" dark={d} />
    </div>
  );
};

export default CitizenDrive;
