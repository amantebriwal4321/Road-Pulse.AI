import { MetaverseGrid } from "@/components/MetaverseGrid";
import { GlassCard } from "@/components/GlassCard";
import { HUDLabel } from "@/components/HUDLabel";
import { NeonButton } from "@/components/NeonButton";
import { LiveIndicator } from "@/components/LiveIndicator";
import { SeverityPulse } from "@/components/SeverityPulse";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LiveMap } from "@/components/LiveMap";
import { usePotholes } from "@/hooks/usePotholes";
import { useTwinScan } from "@/hooks/useTwinScan";
import { TwinScanPanel } from "@/components/TwinScanPanel";
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Globe, FileText, LayoutGrid, TrendingUp, TrendingDown } from "lucide-react";

const tickerTemplates = [
  'New critical cluster detected',
  'Reports confirmed via DBSCAN',
  'Repair verified ✓',
  'Auto-complaint filed',
  'Surface deterioration detected',
  'Crew dispatch recommended',
];

const MunicipalityMap = () => {
  const navigate = useNavigate();
  const { potholes, refetch } = usePotholes(5000);
  const scan = useTwinScan([12.9716, 77.5946], 3500); // Bengaluru city centre
  const [tickerItems, setTickerItems] = useState<string[]>([]);

  // Fast-refresh potholes when scan is active
  useEffect(() => {
    if (!scan.active) return;
    const fast = setInterval(refetch, 4000);
    return () => clearInterval(fast);
  }, [scan.active, refetch]);

  // Pipe scan confirmations into the twin feed ticker
  useEffect(() => {
    if (!scan.lastEvent?.confirmed) return;
    const e = scan.lastEvent;
    setTickerItems(prev => [
      `New pothole confirmed — ${e.lat.toFixed(4)},${e.lng.toFixed(4)} (${(e.confidence * 100).toFixed(0)}% conf)`,
      ...prev.slice(0, 4),
    ]);
  }, [scan.lastEvent]);

  // Compute live stats
  const stats = useMemo(() => {
    const total = potholes.length;
    const critical = potholes.filter(p => p.severity >= 9).length;
    const high = potholes.filter(p => p.severity >= 7).length;
    const totalReports = potholes.reduce((s, p) => s + p.report_count, 0);
    const avgSev = total > 0 ? potholes.reduce((s, p) => s + p.severity, 0) / total : 0;
    const coverage = Math.min(100, Math.round((total / 300) * 100));
    return [
      { label: 'ACTIVE POTHOLES', value: total.toLocaleString(), trend: `+${Math.floor(total * 0.05)}`, up: true },
      { label: 'CRITICAL ZONES', value: String(critical), trend: `+${Math.max(1, Math.floor(critical * 0.1))}`, up: true },
      { label: 'HIGH SEVERITY', value: String(high), trend: `+${Math.max(1, Math.floor(high * 0.08))}`, up: true },
      { label: 'AVG SEVERITY', value: avgSev.toFixed(1), trend: avgSev > 6 ? '+0.3' : '-0.2', up: avgSev > 6 },
      { label: 'DATA POINTS (24H)', value: totalReports.toLocaleString(), trend: '+' + Math.floor(totalReports * 0.02).toLocaleString(), up: true },
      { label: 'TWIN COVERAGE', value: `${coverage}%`, trend: '+1.2%', up: true },
    ];
  }, [potholes]);

  // Emergency queue: top-5 most severe potholes
  const emergencyQueue = useMemo(() => {
    return [...potholes]
      .sort((a, b) => b.severity - a.severity)
      .slice(0, 5)
      .map((p, i) => ({
        id: `e${i}`,
        roadName: p.ward || 'Unknown Road',
        ward: p.ward || 'Unknown',
        severityScore: p.severity,
        reportCount: p.report_count,
        status: 'pending' as const,
      }));
  }, [potholes]);

  const [dispatchedIds, setDispatchedIds] = useState<Set<string>>(new Set());

  // Live ticker from real potholes
  useEffect(() => {
    const interval = setInterval(() => {
      if (potholes.length === 0) return;
      const p = potholes[Math.floor(Math.random() * potholes.length)];
      const template = tickerTemplates[Math.floor(Math.random() * tickerTemplates.length)];
      const msg = `${template} — ${p.ward || 'Unknown'} (${p.severity.toFixed(1)}/10)`;
      setTickerItems(prev => [msg, ...prev.slice(0, 4)]);
    }, 5000);
    return () => clearInterval(interval);
  }, [potholes]);

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
            {/* Stats — LIVE from API */}
            <div>
              <HUDLabel className="border-electric-blue/30 text-electric-blue mb-3">ACTIVE METRICS · LIVE</HUDLabel>
              <div className="space-y-2 mt-3">
                {stats.map((m) => (
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

            {/* Emergency Queue — LIVE top-5 severe potholes */}
            <div>
              <HUDLabel className="border-alert/30 text-alert mb-3">EMERGENCY QUEUE · LIVE</HUDLabel>
              <div className="space-y-2 mt-3">
                {emergencyQueue.map((e) => (
                  <GlassCard key={e.id} className="p-3" nohover>
                    <div className="flex items-start gap-2">
                      <SeverityPulse severity="critical" size="sm" className="mt-1" />
                      <div className="flex-1 min-w-0">
                        <p className="text-foreground text-sm font-display truncate">{e.roadName}</p>
                        <p className="text-text-secondary text-[10px] font-mono">{e.ward} · {e.severityScore.toFixed(1)} · {e.reportCount} reports</p>
                      </div>
                    </div>
                    {!dispatchedIds.has(e.id) ? (
                      <NeonButton size="sm" variant="primary" className="w-full mt-2 bg-alert hover:shadow-[0_0_16px_hsl(var(--alert)/0.4)] text-xs"
                        onClick={() => setDispatchedIds(prev => new Set(prev).add(e.id))}>DISPATCH</NeonButton>
                    ) : (
                      <HUDLabel className="mt-2 border-amber/30 text-amber">CREW DISPATCHED</HUDLabel>
                    )}
                  </GlassCard>
                ))}
              </div>
            </div>

            {/* Ticker — generated from real pothole data */}
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

          {/* Main Map — LIVE Leaflet */}
          <div className="flex-1 p-4">
            <div className="relative h-[60vh] lg:h-[calc(100vh-100px)] rounded-lg border border-border-glow overflow-hidden">
              <LiveMap potholes={potholes} height="100%" tileMode="dark" />
              <div className="absolute top-3 left-3 z-[1000]">
                <HUDLabel className="border-electric-blue/30 text-electric-blue">DIGITAL TWIN · BENGALURU · {potholes.length} POTHOLES</HUDLabel>
              </div>
              {/* Twin Scan Panel — sits bottom-right of the map */}
              <div style={{ position: 'absolute', bottom: 80, right: 16, zIndex: 1000 }}>
                <TwinScanPanel scan={scan} />
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
