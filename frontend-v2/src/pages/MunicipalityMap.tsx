import { MetaverseGrid } from "@/components/MetaverseGrid";
import { GlassCard } from "@/components/GlassCard";
import { HUDLabel } from "@/components/HUDLabel";
import { NeonButton } from "@/components/NeonButton";
import { LiveIndicator } from "@/components/LiveIndicator";
import { SeverityPulse } from "@/components/SeverityPulse";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useMunicipalityStore } from "@/stores/municipalityStore";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Globe, FileText, LayoutGrid, TrendingUp, TrendingDown } from "lucide-react";

const ticker = [
  'New critical cluster — Whitefield Main Rd',
  '47 reports confirmed — Silk Board',
  'Repair verified — Koramangala ✓',
  'Auto-complaint filed — Ward 84',
  'Surface deterioration — Outer Ring Road',
  'Crew dispatched — Marathahalli Bridge',
];

const MunicipalityMap = () => {
  const navigate = useNavigate();
  const { emergencyQueue, dispatchCrew } = useMunicipalityStore();
  const [tickerItems, setTickerItems] = useState(ticker.slice(0, 3));

  useEffect(() => {
    const interval = setInterval(() => {
      const next = ticker[Math.floor(Math.random() * ticker.length)];
      setTickerItems((p) => [next, ...p.slice(0, 4)]);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-metaverse-grid relative pb-24">
      <MetaverseGrid />
      <div className="relative z-10">
        {/* Top bar */}
        <div className="glass-card m-0 rounded-none px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <HUDLabel className="border-electric-blue/30 text-electric-blue">CITY TWIN · LIVE</HUDLabel>
            <LiveIndicator />
          </div>
          <div className="font-mono text-sm text-text-secondary hidden md:block">
            BENGALURU · {new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <HUDLabel className="border-electric-blue/30 text-electric-blue hidden md:inline-block">WARD OFFICER — WARD 52</HUDLabel>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row">
          {/* Sidebar */}
          <div className="w-full lg:w-80 p-4 space-y-4 overflow-y-auto lg:h-[calc(100vh-60px)]">
            {/* Stats */}
            <div>
              <HUDLabel className="border-electric-blue/30 text-electric-blue mb-3">ACTIVE METRICS</HUDLabel>
              <div className="space-y-2 mt-3">
                {[
                  { label: 'ACTIVE POTHOLES', value: '1,247', trend: '+12', up: true },
                  { label: 'CRITICAL ZONES', value: '23', trend: '+3', up: true },
                  { label: 'COMPLAINTS TODAY', value: '89', trend: '+7', up: true },
                  { label: 'REPAIRS PENDING', value: '156', trend: '-4', up: false },
                  { label: 'DATA POINTS (24H)', value: '94,231', trend: '+2.1K', up: true },
                  { label: 'TWIN COVERAGE', value: '78.3%', trend: '+1.2%', up: true },
                ].map((m) => (
                  <div key={m.label} className="flex items-center justify-between">
                    <span className="text-text-secondary text-xs">{m.label}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm text-cyan font-bold">{m.value}</span>
                      <span className={`text-[10px] font-mono flex items-center ${m.up ? 'text-alert' : 'text-green'}`}>
                        {m.up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        {m.trend}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Emergency Queue */}
            <div>
              <HUDLabel className="border-alert/30 text-alert mb-3">EMERGENCY QUEUE</HUDLabel>
              <div className="space-y-2 mt-3">
                {emergencyQueue.map((e) => (
                  <GlassCard key={e.id} className="p-3" nohover>
                    <div className="flex items-start gap-2">
                      <SeverityPulse severity="critical" size="sm" className="mt-1" />
                      <div className="flex-1 min-w-0">
                        <p className="text-foreground text-sm font-display truncate">{e.roadName}</p>
                        <p className="text-text-secondary text-[10px] font-mono">{e.ward} · {e.severityScore} · {e.reportCount} reports</p>
                      </div>
                    </div>
                    {e.status === 'pending' ? (
                      <NeonButton size="sm" variant="primary" className="w-full mt-2 bg-alert hover:shadow-[0_0_16px_hsl(var(--alert)/0.4)] text-xs"
                        onClick={() => dispatchCrew(e.id)}>DISPATCH</NeonButton>
                    ) : (
                      <HUDLabel className="mt-2 border-amber/30 text-amber">CREW DISPATCHED</HUDLabel>
                    )}
                  </GlassCard>
                ))}
              </div>
            </div>

            {/* Ticker */}
            <div>
              <HUDLabel className="border-electric-blue/30 text-electric-blue mb-3">TWIN FEED</HUDLabel>
              <div className="space-y-2 mt-3">
                <AnimatePresence>
                  {tickerItems.map((t, i) => (
                    <motion.div key={`${t}-${i}`} initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                      className="glass-card p-2 border-l-2 border-l-electric-blue text-xs text-foreground">
                      {t}
                      <p className="text-text-secondary text-[9px] font-mono mt-1">{i === 0 ? 'Just now' : `${i * 5}m ago`}</p>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Main Map */}
          <div className="flex-1 p-4">
            <div className="relative h-[60vh] lg:h-[calc(100vh-100px)] bg-surface rounded-lg border border-border-glow flex items-center justify-center overflow-hidden">
              <span className="text-text-secondary text-xs font-mono">DIGITAL TWIN · BENGALURU · SET MAPBOX TOKEN TO ENABLE</span>
              <div className="absolute top-3 left-3"><HUDLabel className="border-electric-blue/30 text-electric-blue">DIGITAL TWIN · BENGALURU</HUDLabel></div>
              {/* Scanning line */}
              <div className="absolute inset-0 overflow-hidden">
                <div className="w-full h-px bg-gradient-to-r from-transparent via-electric-blue to-transparent animate-scanning" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Nav */}
      <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-40">
        <div className="glass-card px-6 py-3 flex gap-8 rounded-full">
          {[
            { id: 'map', label: 'Map', icon: Globe, path: '/municipality/map' },
            { id: 'reports', label: 'Reports', icon: FileText, path: '/municipality/reports' },
            { id: 'hub', label: 'Hub', icon: LayoutGrid, path: '/municipality/hub' },
          ].map((item) => (
            <button key={item.id} onClick={() => navigate(item.path)}
              className={`flex flex-col items-center gap-1 cursor-pointer transition-colors ${item.id === 'map' ? 'text-electric-blue' : 'text-text-secondary hover:text-foreground'}`}>
              <item.icon className="w-5 h-5" />
              <span className="text-[10px] font-mono">{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MunicipalityMap;
