import { useState, useCallback, useRef } from "react";
import usePotholes from "./hooks/usePotholes";
import MapView from "./components/MapView";
import Dashboard from "./components/Dashboard";
import AlertBanner from "./components/AlertBanner";
import ReportButton from "./components/ReportButton";
import Sidebar from "./components/Sidebar";
import Legend from "./components/Legend";
import DemoMode from "./components/DemoMode";
import Chatbot from "./components/Chatbot";

export default function App() {
  const { potholes, loading, error } = usePotholes();
  const [alert, setAlert] = useState(null);
  const [mapCenter, setMapCenter] = useState(null);
  const [mapZoom, setMapZoom] = useState(null);
  const [routePath, setRoutePath] = useState(null);
  const mapRef = useRef(null);

  const handleDismissAlert = useCallback(() => {
    setAlert(null);
  }, []);

  // Called when a pothole is confirmed (from Simulate Bump or Demo Mode)
  const handlePotholeConfirmed = useCallback((data) => {
    setAlert(data);
  }, []);

  // Returns the current center of the Leaflet map
  const getMapCenter = useCallback(() => {
    const map = mapRef.current;
    if (map) {
      const center = map.getCenter();
      return { lat: center.lat, lng: center.lng };
    }
    return { lat: 12.9716, lng: 77.5946 };
  }, []);

  // Fly-to a ward on the map
  const handleWardClick = useCallback((lat, lng) => {
    setMapCenter([lat, lng]);
    setMapZoom(15);
    // Reset after a tick so the same ward can be clicked again
    setTimeout(() => setMapCenter(null), 100);
  }, []);

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-dark-900">
      {/* ── Top Bar ── */}
      <header className="glass border-b border-slate-700/50 px-4 py-3 flex items-center justify-between z-50">
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-400 
                          flex items-center justify-center text-lg font-bold shadow-lg shadow-blue-500/20"
          >
            🛣️
          </div>
          <div>
            <h1 className="text-lg font-bold text-white tracking-tight">
              Road<span className="text-cyan-400">Pulse</span>
            </h1>
            <p className="text-[10px] text-slate-400 -mt-0.5">
              Bengaluru Road Health Digital Twin
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {error ? (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-900/50 border border-red-700/50">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-xs text-red-300">
                Offline — cached data
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-900/30 border border-green-700/30">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs text-green-300">Live</span>
            </div>
          )}
        </div>
      </header>

      {/* ── Alert Banner ── */}
      <AlertBanner alert={alert} onDismiss={handleDismissAlert} />

      {/* ── Dashboard Stats ── */}
      <div className="px-4 py-2.5 border-b border-slate-800/50 overflow-x-auto">
        <Dashboard potholes={potholes} />
      </div>

      {/* ── Map ── */}
      <main className="flex-1 relative">
        {loading && potholes.length === 0 ? (
          <div className="absolute inset-0 flex items-center justify-center bg-dark-900 z-40">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin mx-auto mb-4" />
              <p className="text-slate-400 text-sm">Loading road data...</p>
            </div>
          </div>
        ) : null}

        <MapView
          potholes={potholes}
          mapCenter={mapCenter}
          mapZoom={mapZoom}
          routePath={routePath}
          onMapRef={(ref) => {
            mapRef.current = ref;
          }}
        />

        {/* Overlays */}
        <Sidebar potholes={potholes} onWardClick={handleWardClick} />
        <Chatbot onShowRoute={setRoutePath} potholes={potholes} />
        <Legend />
        <ReportButton
          getMapCenter={getMapCenter}
          onPotholeConfirmed={handlePotholeConfirmed}
        />
        <DemoMode onNew={handlePotholeConfirmed} />
      </main>
    </div>
  );
}
