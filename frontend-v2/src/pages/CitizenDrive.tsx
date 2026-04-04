import { MetaverseGrid } from "@/components/MetaverseGrid";
import { GlassCard } from "@/components/GlassCard";
import { HUDLabel } from "@/components/HUDLabel";
import { NeonButton } from "@/components/NeonButton";
import { LiveIndicator } from "@/components/LiveIndicator";
import { SeverityPulse } from "@/components/SeverityPulse";
import { useCommuteStore } from "@/stores/commuteStore";
import { aiAlerts } from "@/data/commute-simulation";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Navigation, Map, LayoutGrid, User, X } from "lucide-react";

const CitizenBottomNav = ({ active }: { active: string }) => {
  const navigate = useNavigate();
  const items = [
    { id: 'drive', label: 'Drive', icon: Map, path: '/citizen/drive' },
    { id: 'hub', label: 'Hub', icon: LayoutGrid, path: '/citizen/hub' },
    { id: 'profile', label: 'Profile', icon: User, path: '/citizen/profile' },
  ];
  return (
    <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-40">
      <div className="glass-card px-6 py-3 flex gap-8 rounded-full">
        {items.map((item) => (
          <button key={item.id} onClick={() => navigate(item.path)}
            className={`flex flex-col items-center gap-1 cursor-pointer transition-colors ${active === item.id ? 'text-cyan' : 'text-text-secondary hover:text-foreground'}`}>
            <item.icon className="w-5 h-5" />
            <span className="text-[10px] font-mono">{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

const CitizenDrive = () => {
  const { status, selectedRoute, selectRoute, startDrive, endDrive, resetDrive, tripStats } = useCommuteStore();
  const [alertIdx, setAlertIdx] = useState(0);
  const [showAlert, setShowAlert] = useState(false);
  const [detectionFlash, setDetectionFlash] = useState(false);

  // Simulate AI alerts during drive
  useEffect(() => {
    if (status !== 'driving') return;
    const interval = setInterval(() => {
      setShowAlert(true);
      setAlertIdx((p) => (p + 1) % aiAlerts.length);
      setTimeout(() => setShowAlert(false), 4000);
    }, 10000);
    return () => clearInterval(interval);
  }, [status]);

  // Simulate detection events
  useEffect(() => {
    if (status !== 'driving') return;
    const interval = setInterval(() => {
      setDetectionFlash(true);
      setTimeout(() => setDetectionFlash(false), 500);
    }, 12000);
    return () => clearInterval(interval);
  }, [status]);

  // POST-DRIVE REPORT
  if (status === 'report') {
    return (
      <div className="min-h-screen bg-metaverse-grid relative">
        <MetaverseGrid />
        <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} transition={{ type: 'spring', damping: 25 }}
          className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6 py-12">
          <button onClick={resetDrive} className="absolute top-6 right-6"><X className="w-6 h-6 text-text-secondary hover:text-foreground cursor-pointer" /></button>
          <HUDLabel className="mb-4">COMMUTE REPORT GENERATED</HUDLabel>
          <h2 className="text-4xl font-display font-bold text-gradient-cyan mb-8">Mission Complete</h2>

          <div className="w-full max-w-md h-48 bg-surface rounded-lg border border-border-glow mb-8 flex items-center justify-center">
            <span className="text-text-secondary text-xs font-mono">ROUTE MAP · SET MAPBOX TOKEN TO ENABLE</span>
          </div>

          <div className="grid grid-cols-2 gap-4 w-full max-w-md mb-8">
            {[
              { label: 'DISTANCE', value: `${tripStats.distance} KM` },
              { label: 'DURATION', value: `${tripStats.duration} MIN` },
              { label: 'POTHOLES LOGGED', value: String(tripStats.potholesLogged) },
              { label: 'TWIN DATA POINTS', value: String(tripStats.dataPoints) },
            ].map((s) => (
              <GlassCard key={s.label} className="p-4 text-center" nohover>
                <p className="font-mono text-lg text-cyan font-bold">{s.value}</p>
                <p className="text-text-secondary text-[10px] font-mono mt-1">{s.label}</p>
              </GlassCard>
            ))}
          </div>

          <GlassCard className="w-full max-w-md p-4 border-l-2 border-l-cyan mb-8" nohover>
            <p className="text-foreground text-sm">Your commute surveyed {tripStats.distance}km of roads and added {tripStats.dataPoints} data points to the city's digital twin.</p>
            <p className="text-cyan text-sm mt-1">2 auto-complaints queued for BBMP.</p>
          </GlassCard>

          <GlassCard className="w-full max-w-md p-6" nohover>
            <h4 className="font-display font-semibold text-foreground mb-2">Contribute to the City Twin?</h4>
            <p className="text-text-secondary text-sm mb-4">Share your anonymised route data to improve Bengaluru's road health map. No personal information is ever shared.</p>
            <HUDLabel className="mb-4">IDENTITY REMOVED · GPS ANONYMISED · AGGREGATE ONLY</HUDLabel>
            <div className="flex gap-3 mt-4">
              <NeonButton variant="primary" className="flex-1" onClick={resetDrive}>SHARE TO TWIN ✓</NeonButton>
              <NeonButton variant="ghost" className="flex-1" onClick={resetDrive}>Keep Private</NeonButton>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    );
  }

  // ACTIVE DRIVE
  if (status === 'driving') {
    return (
      <div className="min-h-screen bg-metaverse-grid relative">
        <MetaverseGrid />
        <AnimatePresence>
          {detectionFlash && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 border-4 border-alert z-50 pointer-events-none rounded-none" />
          )}
        </AnimatePresence>

        <div className="relative z-10">
          {/* Top bar */}
          <div className="flex justify-between items-center p-4">
            <HUDLabel>TWIN ACTIVE · SCANNING</HUDLabel>
            <LiveIndicator />
          </div>

          {/* Map placeholder */}
          <div className="mx-4 h-[50vh] bg-surface rounded-lg border border-border-glow flex items-center justify-center relative overflow-hidden">
            <span className="text-text-secondary text-xs font-mono">NAVIGATION MAP · SET MAPBOX TOKEN</span>
            {/* Scanning line effect */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="w-full h-px bg-gradient-to-r from-transparent via-cyan to-transparent animate-scanning" />
            </div>
          </div>

          {/* Speed HUD */}
          <div className="mx-4 mt-4">
            <GlassCard className="p-4 flex justify-between items-center" nohover>
              <div className="text-center">
                <p className="font-mono text-2xl text-cyan font-bold">42</p>
                <p className="text-text-secondary text-[10px] font-mono">KM/H</p>
              </div>
              <div className="flex items-center gap-2">
                <SeverityPulse severity="rough" />
                <span className="font-mono text-sm text-amber">MODERATE</span>
              </div>
              <div className="text-center">
                <p className="font-mono text-lg text-foreground">4.2 km</p>
                <p className="text-text-secondary text-[10px] font-mono">REMAINING</p>
              </div>
            </GlassCard>
          </div>

          {/* AI Alert */}
          <AnimatePresence>
            {showAlert && (
              <motion.div initial={{ y: -80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -80, opacity: 0 }}
                className="mx-4 mt-4">
                <GlassCard className="p-4 border-l-2 border-l-amber" nohover>
                  <HUDLabel className="mb-2">AI TWIN ADVISORY</HUDLabel>
                  <p className="text-foreground text-sm">{aiAlerts[alertIdx].message}</p>
                </GlassCard>
              </motion.div>
            )}
          </AnimatePresence>

          {/* End Drive */}
          <div className="mx-4 mt-6 pb-24">
            <NeonButton variant="secondary" className="w-full border-alert text-alert hover:bg-alert/10" onClick={endDrive}>
              END DRIVE
            </NeonButton>
          </div>
        </div>
      </div>
    );
  }

  // PRE-DRIVE (idle/routing)
  return (
    <div className="min-h-screen bg-metaverse-grid relative pb-24">
      <MetaverseGrid />
      <div className="relative z-10 p-4">
        <HUDLabel className="mb-2">TWIN STANDBY</HUDLabel>
        <h2 className="text-xl font-display font-semibold text-foreground mb-4">Plot Your Route</h2>

        <div className="space-y-3 mb-4">
          <div className="flex items-center gap-3 bg-surface border border-border-glow rounded-lg px-4 py-3">
            <MapPin className="w-4 h-4 text-cyan" />
            <span className="text-foreground text-sm">My Location</span>
          </div>
          <div className="flex items-center gap-3 bg-surface border border-border-glow rounded-lg px-4 py-3">
            <Navigation className="w-4 h-4 text-text-secondary" />
            <input placeholder="Where to?" className="bg-transparent text-foreground placeholder:text-text-secondary text-sm w-full focus:outline-none" />
          </div>
        </div>

        {/* Map placeholder */}
        <div className="h-[35vh] bg-surface rounded-lg border border-border-glow flex items-center justify-center mb-4">
          <span className="text-text-secondary text-xs font-mono">CITY TWIN MAP · SET MAPBOX TOKEN</span>
        </div>

        {/* Route options */}
        <div className="space-y-3 mb-4">
          <GlassCard className={`p-4 cursor-pointer ${selectedRoute === 'A' ? 'border-cyan/40' : ''}`} onClick={() => selectRoute('A')} nohover>
            <div className="flex justify-between items-start">
              <div>
                <HUDLabel>FASTEST</HUDLabel>
                <p className="text-foreground text-sm mt-2">12.4 km · 28 min</p>
              </div>
              <div className="text-right">
                <span className="font-mono text-lg text-amber">6.2 / 10</span>
                <p className="text-text-secondary text-xs">14 potholes</p>
              </div>
            </div>
          </GlassCard>

          <GlassCard className={`p-4 cursor-pointer ${selectedRoute === 'B' ? 'border-cyan/40' : ''}`} onClick={() => selectRoute('B')} nohover>
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2">
                  <HUDLabel>SMOOTHEST</HUDLabel>
                  <span className="text-[10px] bg-green/20 text-green px-2 py-0.5 rounded font-mono">RECOMMENDED</span>
                </div>
                <p className="text-foreground text-sm mt-2">14.1 km · 34 min</p>
              </div>
              <div className="text-right">
                <span className="font-mono text-lg text-green">9.1 / 10</span>
                <p className="text-text-secondary text-xs">3 potholes</p>
              </div>
            </div>
          </GlassCard>
        </div>

        <NeonButton variant="primary" className="w-full" size="lg" disabled={!selectedRoute} onClick={startDrive}>
          INITIATE DRIVE
        </NeonButton>
      </div>
      <CitizenBottomNav active="drive" />
    </div>
  );
};

export default CitizenDrive;
