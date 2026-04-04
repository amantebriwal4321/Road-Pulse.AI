import { useState, useRef, useEffect } from "react";

// Helper function to calculate distance in meters between two lat/lng pairs
const getDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371e3; // Radius of the Earth in meters
  const p1 = (lat1 * Math.PI) / 180;
  const p2 = (lat2 * Math.PI) / 180;
  const dp = ((lat2 - lat1) * Math.PI) / 180;
  const dl = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dp / 2) * Math.sin(dp / 2) +
    Math.cos(p1) * Math.cos(p2) * Math.sin(dl / 2) * Math.sin(dl / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in meters
};

export default function Chatbot({ onShowRoute, potholes = [] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: "Hi! I am the RoadPulse AI. Need the safest route today?",
    },
  ]);
  const [input, setInput] = useState("");
  const msgsEndRef = useRef(null);

  useEffect(() => {
    msgsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userText = input.trim();
    setMessages((prev) => [...prev, { role: "user", text: userText }]);
    setInput("");

    const lowerReq = userText.toLowerCase();

    // Look for phrases like "route from [origin] to [destination]"
    const routeMatch = lowerReq.match(/from\s+(.+?)\s+to\s+(.+)/i);

    if (routeMatch) {
      const originQuery = routeMatch[1].trim();
      const destQuery = routeMatch[2].trim();

      try {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            text: `Finding the safest road from ${originQuery} to ${destQuery}...`,
          },
        ]);

        // Helper to get coordinates via free Nominatim API
        const getGeocode = async (place) => {
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

        // Compare all alternative routes to find the one with the lowest pothole intersections
        let bestRouteCoords = null;
        let minPotholesFound = Infinity;

        // Iterate through the routes
        for (const route of data.routes) {
          // Convert [lon, lat] from GeoJSON back to [lat, lon] for Leaflet
          const routeCoords = route.geometry.coordinates.map((c) => [
            c[1],
            c[0],
          ]);

          let potholesOnRoute = 0;

          // Check against known local potholes in the App state
          for (const p of potholes) {
            if (p.status !== "open") continue; // only calculate active potholes

            // Is this pothole close to ANY segment on the route?
            let isClose = false;
            for (const rCoord of routeCoords) {
              if (getDistance(p.lat, p.lng, rCoord[0], rCoord[1]) < 30) {
                isClose = true; // Within ~30 meters of a path node
                break;
              }
            }
            if (isClose) potholesOnRoute++;
          }

          // Keep track of the route having minimum potholes
          if (potholesOnRoute < minPotholesFound) {
            minPotholesFound = potholesOnRoute;
            bestRouteCoords = routeCoords;
          }
        }

        setMessages((prev) => [
          ...prev.slice(0, -1),
          {
            role: "assistant",
            text: `I simulated ${data.routes.length} possible route options. The safest path found between ${originQuery} and ${destQuery} encounters only ${minPotholesFound} open potholes. I've highlighted it for you!`,
          },
        ]);
        onShowRoute(bestRouteCoords);
      } catch (err) {
        console.error("Routing Error:", err);
        setMessages((prev) => [
          ...prev.slice(0, -1),
          {
            role: "assistant",
            text: `Routing failed: ${err.message}. Try being more specific with the location names.`,
          },
        ]);
        onShowRoute(null);
      }
    } else if (
      lowerReq.includes("route") ||
      lowerReq.includes("path") ||
      lowerReq.includes("hospital")
    ) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: "To find a safe route, please tell me the start and end points. For example: 'route from MG Road to Indiranagar'.",
        },
      ]);
      onShowRoute(null);
    } else {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: "I can help you find safe routes between places! Try asking 'Give me the shortest route from MG Road to Koramangala'.",
        },
      ]);
      onShowRoute(null);
    }
  };

  return (
    <div
      className={`fixed top-20 right-4 z-[1000] flex flex-col transition-all duration-300 ${isOpen ? "w-80 h-[500px]" : "w-auto h-auto"}`}
    >
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="ml-auto glass rounded-full p-4 text-cyan-400 hover:text-white hover:bg-cyan-600/30 border border-cyan-500/50 transition-all shadow-lg shadow-cyan-500/20"
          title="Ask AI for Routes"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
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
        <div className="flex flex-col h-full glass rounded-2xl overflow-hidden shadow-2xl border border-cyan-500/30 bg-dark-900/90 backdrop-blur-md">
          {/* Header */}
          <div className="px-4 py-3 bg-slate-800/80 flex justify-between items-center border-b border-cyan-500/20">
            <div className="flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
              </span>
              <h3 className="font-bold text-white text-sm">RoadPulse AI</h3>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-white"
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
                      ? "bg-cyan-600/50 text-white rounded-tr-none border border-cyan-500/30"
                      : "bg-slate-700/50 text-slate-200 rounded-tl-none border border-slate-600"
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}
            <div ref={msgsEndRef} />
          </div>

          {/* Input */}
          <form
            onSubmit={handleSend}
            className="p-3 border-t border-slate-700/50 bg-slate-800/50 flex gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask for a route..."
              className="flex-1 bg-dark-900 border border-slate-600 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500 placeholder-slate-500"
            />
            <button
              type="submit"
              className="bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl p-2 transition-colors"
            >
              <svg
                className="w-5 h-5 -rotate-90"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                />
              </svg>
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
