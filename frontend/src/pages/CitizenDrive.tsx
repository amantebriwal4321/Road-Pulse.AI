<<<<<<< Updated upstream
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
=======
/**
 * CitizenDrive — Route Planner + AI Chatbot Interface
 *
 * Layout: Full-screen split view
 *   [LEFT / TOP on mobile]  → Live Leaflet map with pothole markers
 *   [RIGHT / BOTTOM sidebar] → AI Route Chatbot
 *
 * ── AI_CHATBOT_INTEGRATION POINT ──────────────────────────────
 * When your AI chatbot is ready, plug it into the `handleSendMessage`
 * function below. It receives the user's message string and should:
 *   1. Call your AI route API
 *   2. Return a text response (shown as a chat bubble)
 *   3. Optionally return route polyline coords → pass to setRoutePolyline()
 *      to draw the route on the map
 * ──────────────────────────────────────────────────────────────
 */

import { useState, useRef, useEffect } from 'react';
import { LiveMap }         from '@/components/LiveMap';
import { usePotholes }     from '@/hooks/usePotholes';
import { useTwinScan }     from '@/hooks/useTwinScan';
import { TwinScanPanel }   from '@/components/TwinScanPanel';
import { useNavigate }     from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send, Bot, User, MapPin, Navigation,
  LayoutGrid, Map, ChevronDown, ChevronUp,
  Sparkles, X,
} from 'lucide-react';

// Bengaluru demo coords (same as Hub fallback)
const DRIVE_SCAN_BASE: [number, number] = [12.9408, 77.5551];

// ─── Types ───────────────────────────────────────────────────────
interface ChatMessage {
  role: 'user' | 'assistant';
  text: string;
  timestamp: Date;
}
>>>>>>> Stashed changes

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
<<<<<<< Updated upstream
  const { data: potholes = [] } = usePotholes(10000);
  const [routeData, setRouteData] = useState<any | null>(null);
=======
  const { potholes, refetch } = usePotholes(10000);
  const scan = useTwinScan(DRIVE_SCAN_BASE, 3500);

  // Fast refresh while scanning so new confirmed potholes appear quickly
  useEffect(() => {
    if (!scan.active) return;
    const fast = setInterval(refetch, 4000);
    return () => clearInterval(fast);
  }, [scan.active, refetch]);

  // ── Chat state ───────────────────────────────────────────────
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      text: "Hi! I'm your RoadPulse AI navigator 🗺️\n\nTell me where you want to go and I'll find the smoothest route — avoiding potholes along the way.\n\nExample: \"From Silk Board to Manyata Tech Park\"",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // ── AI_CHATBOT_INTEGRATION POINT ─────────────────────────────
  // Replace this placeholder function with your real AI API call.
  // Receives: userMessage (string)
  // Returns:  { reply: string, routePolyline?: [number,number][] }
  const callAIChatbot = async (userMessage: string): Promise<string> => {
    // TODO: Replace with your AI chatbot API call
    // Example:
    //   const res = await fetch('/api/route-ai', {
    //     method: 'POST',
    //     body: JSON.stringify({ message: userMessage, potholes }),
    //   });
    //   const data = await res.json();
    //   return data.reply;

    // Placeholder response (remove when AI is integrated)
    await new Promise((r) => setTimeout(r, 1200));
    if (userMessage.toLowerCase().includes('silk board') || userMessage.toLowerCase().includes('marathahalli')) {
      return "I found 2 routes for you:\n\n🟢 **Smoothest Route** — Via Outer Ring Road (14.1 km · 34 min)\n   Road score: 9.1/10 · Only 3 potholes\n\n🟠 **Fastest Route** — Via Hosur Road (12.4 km · 28 min)\n   Road score: 6.2/10 · 14 potholes detected\n\n**Recommendation:** Take the Outer Ring Road route. You'll save significant suspension wear.\n\n_Pothole data powered by RoadPulse Digital Twin_";
    }
    return "Sure! Please tell me your **starting point** and **destination** in Bengaluru and I'll calculate the best pothole-avoiding route for you.";
  };
  // ── END AI_CHATBOT_INTEGRATION POINT ─────────────────────────

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed) return;

    // Add user message
    const userMsg: ChatMessage = { role: 'user', text: trimmed, timestamp: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const reply = await callAIChatbot(trimmed);
      setMessages((prev) => [...prev, {
        role: 'assistant',
        text: reply,
        timestamp: new Date(),
      }]);
    } catch {
      setMessages((prev) => [...prev, {
        role: 'assistant',
        text: 'Sorry, I had trouble connecting. Please try again.',
        timestamp: new Date(),
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  // Simple markdown-ish bold renderer
  const renderText = (text: string) => {
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) =>
      part.startsWith('**') && part.endsWith('**')
        ? <strong key={i}>{part.slice(2, -2)}</strong>
        : part.split('\n').map((line, j, arr) => (
          <span key={j}>{line}{j < arr.length - 1 && <br />}</span>
        ))
    );
  };
>>>>>>> Stashed changes

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
<<<<<<< Updated upstream
=======

          {/* Route will be drawn here by AI */}
          {/* AI_CHATBOT_INTEGRATION: render Polyline component here with routePolyline state */}

          {/* ── Twin Scan Panel — top-left, below the legend ── */}
          <TwinScanPanel
            scan={scan}
            compact={true}
            style={{ position: 'absolute', left: 12, top: 110, zIndex: 500 }}
          />
>>>>>>> Stashed changes
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
