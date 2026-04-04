import { useState, useRef, useEffect } from "react";
import { distanceMeters } from "@/lib/haversine";
import type { PotholeData } from "@/services/api";

interface ChatbotProps {
  onShowRoute: (route: [number, number][] | null) => void;
  potholes?: PotholeData[];
}

export function Chatbot({ onShowRoute, potholes = [] }: ChatbotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: "Hi! I am the RoadPulse AI. Need the safest route today?",
    },
  ]);
  const [fromInput, setFromInput] = useState("");
  const [toInput, setToInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const msgsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    msgsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleRouteSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fromInput.trim() || !toInput.trim()) return;

    const originQuery = fromInput.trim();
    const destQuery = toInput.trim();

    setMessages((prev) => [
      ...prev,
      { role: "user", text: `Find safe route: ${originQuery} → ${destQuery}` },
    ]);

    setFromInput("");
    setToInput("");
    setIsLoading(true);

    try {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: `Finding the safest map route from ${originQuery} to ${destQuery}...`,
        },
      ]);

      // Helper to get coordinates via free Nominatim API
      const getGeocode = async (place: string): Promise<[number, number]> => {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(place + ", Bengaluru")}&format=json&limit=1`,
        );
        const data = await res.json();
        if (data && data.length > 0) {
          return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
        }
        throw new Error(`Could not find location: ${place}`);
      };

      const start = await getGeocode(originQuery);
      const end = await getGeocode(destQuery);

      // Fetch up to 3 alternative road geometries from free OSRM API (lon, lat format in URL)
      const url = `https://router.project-osrm.org/route/v1/driving/${start[1]},${start[0]};${end[1]},${end[0]}?overview=full&geometries=geojson&alternatives=3`;
      const res = await fetch(url);
      const data = await res.json();

      if (!data.routes || data.routes.length === 0) {
        throw new Error("No driving route found between these locations.");
      }

      let bestRouteCoords: [number, number][] | null = null;
      let minPotholesFound = Infinity;
      let bestDistance = Infinity;

      // Iterate through the routes to find the one with least potholes (primary tie breaker is distance)
      for (const route of data.routes) {
        const routeCoords: [number, number][] = route.geometry.coordinates.map(
          (c: number[]) => [c[1], c[0]],
        );
        const routeDistance = route.distance || 0; // in meters

        let potholesOnRoute = 0;

        // Check against known local potholes in the App state
        for (const p of potholes) {
          if (p.status !== "open") continue; // only calculate active potholes

          let isClose = false;
          for (const rCoord of routeCoords) {
            // Distance is < 30 meters
            if (distanceMeters(p.lat, p.lng, rCoord[0], rCoord[1]) < 30) {
              isClose = true;
              break;
            }
          }
          if (isClose) potholesOnRoute++;
        }

        // Keep track of the route having minimum potholes, fallback to shortest distance if tied
        if (
          potholesOnRoute < minPotholesFound ||
          (potholesOnRoute === minPotholesFound && routeDistance < bestDistance)
        ) {
          minPotholesFound = potholesOnRoute;
          bestDistance = routeDistance;
          bestRouteCoords = routeCoords;
        }
      }

      setMessages((prev) => [
        ...prev.slice(0, -1),
        {
          role: "assistant",
          text: `I simulated ${data.routes.length} possible route options. The safest path found between ${originQuery} and ${destQuery} encounters only ${minPotholesFound} open potholes (Distance: ${(bestDistance / 1000).toFixed(1)} km). I've highlighted it for you!`,
        },
      ]);
      onShowRoute(bestRouteCoords);
    } catch (err: any) {
      console.error("Routing Error:", err);
      setMessages((prev) => [
        ...prev.slice(0, -1),
        {
          role: "assistant",
          text: `Routing failed: ${err.message}. Try being more specific with the location names.`,
        },
      ]);
      onShowRoute(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className={`fixed top-20 right-4 z-[1000] flex flex-col transition-all duration-300 ${isOpen ? "w-80 h-[500px]" : "w-auto h-auto"}`}
    >
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="ml-auto rounded-full p-4 text-cyan-400 hover:text-white transition-all shadow-lg shadow-cyan-500/20"
          style={{
            background: "rgba(255,255,255,0.92)",
            border: "1px solid rgba(37,99,235,0.2)",
            backdropFilter: "blur(16px)",
          }}
          title="Ask AI for Routes"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="#2563eb"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
            />
          </svg>
        </button>
      ) : (
        <div
          style={{
            background: "rgba(255,255,255,0.95)",
            border: "1px solid rgba(0,0,0,0.1)",
          }}
          className="flex flex-col h-full rounded-2xl overflow-hidden shadow-2xl backdrop-blur-md"
        >
          {/* Header */}
          <div
            className="px-4 py-3 flex justify-between items-center border-b"
            style={{
              background: "rgba(240,249,255,0.8)",
              borderColor: "rgba(37,99,235,0.1)",
            }}
          >
            <div className="flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
              </span>
              <h3 className="font-bold text-slate-800 text-sm">
                RoadPulse Route AI
              </h3>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-slate-800"
            >
              ✕
            </button>
          </div>

          {/* Chat List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${
                    m.role === "user"
                      ? "bg-blue-600 text-white rounded-tr-none shadow-sm"
                      : "bg-slate-100 text-slate-800 rounded-tl-none shadow-sm"
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}
            <div ref={msgsEndRef} />
          </div>

          {/* Input Form with 2 boxes */}
          <form
            onSubmit={handleRouteSearch}
            className="p-3 border-t flex flex-col gap-2"
            style={{
              background: "rgba(248,250,252,0.9)",
              borderColor: "rgba(0,0,0,0.05)",
            }}
          >
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={fromInput}
                onChange={(e) => setFromInput(e.target.value)}
                placeholder="From (e.g. MG Road)"
                required
                disabled={isLoading}
                className="flex-1 border rounded-lg px-3 py-1.5 text-sm text-slate-800 focus:outline-none focus:border-blue-500 bg-white"
                style={{ borderColor: "rgba(0,0,0,0.1)" }}
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={toInput}
                onChange={(e) => setToInput(e.target.value)}
                placeholder="To (e.g. Koramangala)"
                required
                disabled={isLoading}
                className="flex-1 border rounded-lg px-3 py-1.5 text-sm text-slate-800 focus:outline-none focus:border-blue-500 bg-white"
                style={{ borderColor: "rgba(0,0,0,0.1)" }}
              />
              <button
                type="submit"
                disabled={isLoading}
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg p-1.5 transition-colors disabled:opacity-50"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M14 5l7 7m0 0l-7 7m7-7H3"
                  />
                </svg>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
