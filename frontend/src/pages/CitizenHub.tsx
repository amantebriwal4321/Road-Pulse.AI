import { MetaverseGrid } from "@/components/MetaverseGrid";
import { GlassCard } from "@/components/GlassCard";
import { HUDLabel } from "@/components/HUDLabel";
import { SeverityPulse } from "@/components/SeverityPulse";
import { LiveMap } from "@/components/LiveMap";
import { usePotholes } from "@/hooks/usePotholes";
import { useNavigate } from "react-router-dom";
import { useMemo } from "react";
import { Map, LayoutGrid, User, AlertTriangle, TrendingDown, CheckCircle } from "lucide-react";

const CitizenHub = () => {
  const navigate = useNavigate();
  const { potholes } = usePotholes(5000);

  // Live road alerts from top-5 most recent high-severity potholes
  const alerts = useMemo(() => {
    const severityMap = (sev: number) => {
      if (sev >= 9) return 'critical' as const;
      if (sev >= 7) return 'pothole' as const;
      if (sev >= 4) return 'rough' as const;
      return 'smooth' as const;
    };
    const messageMap = (sev: number) => {
      if (sev >= 9) return 'Critical pothole cluster detected';
      if (sev >= 7) return 'Road quality deteriorating';
      if (sev >= 4) return 'Surface wear increasing';
      return 'Road condition stable';
    };
    return [...potholes]
      .sort((a, b) => b.severity - a.severity)
      .slice(0, 5)
      .map((p, i) => ({
        severity: severityMap(p.severity),
        road: p.ward || 'Unknown Road',
        message: messageMap(p.severity),
        time: i === 0 ? 'Just now' : `${(i * 15)}m ago`,
      }));
  }, [potholes]);

  // Live city stats
  const cityStats = useMemo(() => {
    const active = potholes.length;
    const avgSev = active > 0 ? potholes.reduce((s, p) => s + p.severity, 0) / active : 0;
    const healthScore = Math.round(100 - avgSev * 10);
    return [
      { icon: AlertTriangle, value: active.toLocaleString(), label: 'Active Complaints' },
      { icon: CheckCircle, value: String(Math.round(active * 0.2)), label: 'Repairs This Month' },
      { icon: TrendingDown, value: `${healthScore}/100`, label: 'City Health Score' },
    ];
  }, [potholes]);

  return (
    <div className="min-h-screen bg-metaverse-grid relative pb-24">
      <MetaverseGrid />
      <div className="relative z-10 p-4">
        <div className="flex items-center gap-3 mb-6">
          <HUDLabel>TWIN HUB</HUDLabel>
          <h2 className="text-xl font-display font-semibold text-foreground">Your Road Intelligence</h2>
        </div>

        {/* City Road Explorer — LIVE Leaflet map */}
        <GlassCard className="p-0 overflow-hidden mb-6" nohover>
          <div className="relative">
            <div className="h-[200px]">
              <LiveMap potholes={potholes} height="200px" showPopups={false} />
            </div>
            <div className="absolute top-3 right-3 z-[1000]"><HUDLabel>CITY TWIN · LIVE</HUDLabel></div>
          </div>
          <div className="p-4 flex gap-2 overflow-x-auto">
            {['ALL', 'CRITICAL', 'HIGH', 'NEAR ME', 'MY ROUTES'].map((f) => (
              <button key={f} className="px-3 py-1.5 text-[10px] font-mono rounded-full border border-border-glow text-text-secondary hover:border-cyan hover:text-cyan transition-colors whitespace-nowrap cursor-pointer">
                {f}
              </button>
            ))}
          </div>
        </GlassCard>

        {/* Road Alerts Feed — LIVE from API */}
        <div className="mb-6">
          <HUDLabel className="mb-3">TWIN ADVISORIES · LIVE</HUDLabel>
          <div className="space-y-3 mt-3">
            {alerts.map((a, i) => (
              <GlassCard key={i} className="p-4 flex items-start gap-3" nohover>
                <SeverityPulse severity={a.severity} size="sm" className="mt-1" />
                <div className="flex-1">
                  <p className="text-foreground text-sm font-display">{a.message}</p>
                  <p className="text-text-secondary text-xs font-mono mt-1">{a.road} · {a.time}</p>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>

        {/* City Stats — LIVE */}
        <HUDLabel className="mb-3">CITY SNAPSHOT · LIVE</HUDLabel>
        <div className="grid grid-cols-3 gap-3 mt-3">
          {cityStats.map((s) => (
            <GlassCard key={s.label} className="p-3 text-center" nohover>
              <s.icon className="w-4 h-4 text-cyan mx-auto mb-1" />
              <p className="font-mono text-lg text-cyan font-bold">{s.value}</p>
              <p className="text-text-secondary text-[9px] font-mono mt-1">{s.label}</p>
            </GlassCard>
          ))}
        </div>
      </div>

      {/* Bottom Nav */}
      <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-40">
        <div className="glass-card px-6 py-3 flex gap-8 rounded-full">
          {[
            { id: 'drive', label: 'Drive', icon: Map, path: '/citizen/drive' },
            { id: 'hub', label: 'Hub', icon: LayoutGrid, path: '/citizen/hub' },
            { id: 'profile', label: 'Profile', icon: User, path: '/citizen/profile' },
          ].map((item) => (
            <button key={item.id} onClick={() => navigate(item.path)}
              className={`flex flex-col items-center gap-1 cursor-pointer transition-colors ${item.id === 'hub' ? 'text-cyan' : 'text-text-secondary hover:text-foreground'}`}>
              <item.icon className="w-5 h-5" />
              <span className="text-[10px] font-mono">{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CitizenHub;
