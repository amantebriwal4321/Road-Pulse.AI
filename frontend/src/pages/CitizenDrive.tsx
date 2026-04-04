import { useState, useRef, useEffect } from "react";
import { LiveMap } from "@/components/LiveMap";
import { usePotholes } from "@/hooks/usePotholes";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  Bot,
  bg,
  User,
  MapPin,
  Navigation,
  LayoutGrid,
  Map,
  ChevronDown,
  ChevronUp,
  Sparkles,
  X,
} from "lucide-react";
import { Chatbot } from "@/components/Chatbot";

// ─── Bottom Nav ──────────────────────────────────────────────────
const BottomNav = ({ active }: { active: string }) => {
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

// ─── Main Component ───────────────────────────────────────────────
const CitizenDrive = () => {
  const { data: potholes = [] } = usePotholes(10000);
  const [routeData, setRouteData] = useState<any | null>(null);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "#f1f5f9",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* ── Top header bar ────────────────────────────────────── */}
      <div
        style={{
          height: 52,
          background: "rgba(255,255,255,0.95)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(0,0,0,0.08)",
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
              background: "#2563eb",
              boxShadow: "0 0 6px rgba(37,99,235,0.6)",
            }}
          />
          <span
            style={{
              fontFamily: "monospace",
              fontWeight: 700,
              fontSize: 13,
              color: "#1e3a8a",
            }}
          >
            ROADPULSE DRIVE
          </span>
          <span
            style={{
              fontSize: 10,
              fontFamily: "monospace",
              background: "rgba(37,99,235,0.1)",
              color: "#2563eb",
              padding: "2px 8px",
              borderRadius: 4,
              fontWeight: 700,
            }}
          >
            {potholes.length} HAZARDS MAPPED
          </span>
        </div>
      </div>

      {/* ── Main split layout ─────────────────────────────────── */}
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
            tileMode="light"
            center={[12.9352, 77.5551]}
            zoom={13}
            showPopups={true}
            routePath={routeData}
          />

          {/* Map legend overlay */}
          <div
            style={{
              position: "absolute",
              top: 12,
              left: 12,
              zIndex: 500,
              background: "rgba(255,255,255,0.92)",
              backdropFilter: "blur(12px)",
              borderRadius: 10,
              padding: "8px 12px",
              boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
            }}
          >
            <p
              style={{
                fontSize: 9,
                fontFamily: "monospace",
                color: "#6b7280",
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
                <span style={{ fontSize: 10, color: "#374151" }}>{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── CHATBOT SIDEBAR ──────────────────────────────────── */}
        <Chatbot onShowRoute={setRouteData} potholes={potholes} />
      </div>

      {/* ── Bottom nav ──────────────────────────────────────────── */}
      <BottomNav active="drive" />
    </div>
  );
};

export default CitizenDrive;
