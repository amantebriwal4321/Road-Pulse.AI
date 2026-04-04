import { MetaverseGrid } from "@/components/MetaverseGrid";
import { GlassCard } from "@/components/GlassCard";
import { HUDLabel } from "@/components/HUDLabel";
import { SeverityPulse } from "@/components/SeverityPulse";
import { useNavigate } from "react-router-dom";
import { Map, LayoutGrid, User, AlertTriangle, TrendingDown, CheckCircle } from "lucide-react";

const alerts = [
  { severity: 'critical' as const, road: 'Silk Board Junction', message: 'Critical pothole cluster emerged', time: '12 min ago' },
  { severity: 'pothole' as const, road: 'Outer Ring Road', message: 'Road quality deteriorating', time: '34 min ago' },
  { severity: 'smooth' as const, road: 'Koramangala 80 Feet Road', message: 'Repair completed ✓', time: '2 hours ago' },
  { severity: 'rough' as const, road: 'HSR Layout 27th Main', message: 'Surface wear increasing', time: '3 hours ago' },
  { severity: 'critical' as const, road: 'Marathahalli Bridge', message: 'New critical zone detected', time: '5 hours ago' },
];

const CitizenHub = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-metaverse-grid relative pb-24">
      <MetaverseGrid />
      <div className="relative z-10 p-4">
        <div className="flex items-center gap-3 mb-6">
          <HUDLabel>TWIN HUB</HUDLabel>
          <h2 className="text-xl font-display font-semibold text-foreground">Your Road Intelligence</h2>
        </div>

        {/* City Road Explorer */}
        <GlassCard className="p-0 overflow-hidden mb-6" nohover>
          <div className="relative">
            <div className="h-[200px] bg-surface flex items-center justify-center">
              <span className="text-text-secondary text-xs font-mono">CITY TWIN MAP · LIVE</span>
            </div>
            <div className="absolute top-3 right-3"><HUDLabel>CITY TWIN · LIVE</HUDLabel></div>
          </div>
          <div className="p-4 flex gap-2 overflow-x-auto">
            {['ALL', 'CRITICAL', 'HIGH', 'NEAR ME', 'MY ROUTES'].map((f) => (
              <button key={f} className="px-3 py-1.5 text-[10px] font-mono rounded-full border border-border-glow text-text-secondary hover:border-cyan hover:text-cyan transition-colors whitespace-nowrap cursor-pointer">
                {f}
              </button>
            ))}
          </div>
        </GlassCard>

        {/* Road Alerts Feed */}
        <div className="mb-6">
          <HUDLabel className="mb-3">TWIN ADVISORIES</HUDLabel>
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

        {/* City Stats */}
        <HUDLabel className="mb-3">CITY SNAPSHOT</HUDLabel>
        <div className="grid grid-cols-3 gap-3 mt-3">
          {[
            { icon: AlertTriangle, value: '1,247', label: 'Active Complaints' },
            { icon: CheckCircle, value: '47', label: 'Repairs This Month' },
            { icon: TrendingDown, value: '52/100', label: 'City Health Score' },
          ].map((s) => (
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
