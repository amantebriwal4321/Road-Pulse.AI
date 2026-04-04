import { MetaverseGrid } from "@/components/MetaverseGrid";
import { GlassCard } from "@/components/GlassCard";
import { HUDLabel } from "@/components/HUDLabel";
import { NeonButton } from "@/components/NeonButton";
import { wards, cityHealthTrend } from "@/data/city-analytics";
import { useNavigate } from "react-router-dom";
import { Globe, FileText, LayoutGrid, Download } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, BarChart, Bar, Cell, ReferenceArea } from "recharts";

const predictedRoads = [
  { road: 'Outer Ring Road — Bellandur', probability: 82 },
  { road: 'Whitefield — ITPL Gate', probability: 74 },
  { road: 'Sarjapur Road — Wipro Jn', probability: 68 },
  { road: 'Silk Board — BTM Underpass', probability: 61 },
  { road: 'Hebbal Flyover — Service Rd', probability: 55 },
];

const MunicipalityHub = () => {
  const navigate = useNavigate();
  const sorted = [...wards].sort((a, b) => a.healthScore - b.healthScore);

  return (
    <div className="min-h-screen bg-metaverse-grid relative pb-24">
      <MetaverseGrid />
      <div className="relative z-10 p-4 lg:p-8 max-w-6xl mx-auto">
        <HUDLabel className="border-electric-blue/30 text-electric-blue mb-4">COMMAND HUB</HUDLabel>

        {/* City Health Trend */}
        <GlassCard className="p-6 mb-6" nohover>
          <HUDLabel className="border-electric-blue/30 text-electric-blue mb-4">CITY TWIN — 12 MONTH TREND</HUDLabel>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={cityHealthTrend}>
              <ReferenceArea x1="Jun" x2="Sep" fill="#2979FF" fillOpacity={0.1} />
              <XAxis dataKey="month" stroke="#7B9BBF" tick={{ fontSize: 11 }} />
              <YAxis stroke="#7B9BBF" tick={{ fontSize: 11 }} domain={[0, 100]} />
              <Line type="monotone" dataKey="score" stroke="#00E5FF" strokeWidth={2} dot={{ fill: '#00E5FF', r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
          <p className="text-text-secondary text-[10px] font-mono mt-2">Blue shaded: Monsoon period (Jun–Sep)</p>
        </GlassCard>

        {/* Ward Comparison */}
        <GlassCard className="p-6 mb-6" nohover>
          <HUDLabel className="border-electric-blue/30 text-electric-blue mb-4">WARD HEALTH COMPARISON</HUDLabel>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={sorted} layout="vertical">
              <XAxis type="number" domain={[0, 100]} stroke="#7B9BBF" tick={{ fontSize: 10 }} />
              <YAxis type="category" dataKey="name" stroke="#7B9BBF" tick={{ fontSize: 10 }} width={100} />
              <Bar dataKey="healthScore" radius={[0, 4, 4, 0]}>
                {sorted.map((w, i) => (
                  <Cell key={i} fill={w.healthScore < 40 ? '#FF3D57' : w.healthScore < 60 ? '#FFB300' : '#00E676'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </GlassCard>

        {/* Predictive + Monsoon */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <GlassCard className="p-6" nohover>
            <HUDLabel className="border-electric-blue/30 text-electric-blue mb-4">PREDICTIVE ANALYSIS · NEXT 30 DAYS</HUDLabel>
            <div className="space-y-3">
              {predictedRoads.map((r) => (
                <div key={r.road} className="flex items-center justify-between">
                  <span className="text-foreground text-sm truncate flex-1 mr-3">{r.road}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 h-2 bg-surface rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${r.probability}%`, backgroundColor: r.probability > 70 ? '#FF3D57' : r.probability > 50 ? '#FFB300' : '#00E676' }} />
                    </div>
                    <span className="font-mono text-xs text-alert w-10 text-right">{r.probability}%</span>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-text-secondary text-[10px] font-mono mt-3">Powered by road decay modelling</p>
          </GlassCard>

          <GlassCard className="p-6" nohover>
            <HUDLabel className="border-electric-blue/30 text-electric-blue mb-4">MONSOON READINESS</HUDLabel>
            <div className="flex justify-center mb-4">
              <div className="relative w-32 h-32">
                <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                  <circle cx="18" cy="18" r="16" fill="none" stroke="hsl(var(--surface))" strokeWidth="3" />
                  <circle cx="18" cy="18" r="16" fill="none" stroke="#FFB300" strokeWidth="3"
                    strokeDasharray={`${62 * 1.005} ${100.53 - 62 * 1.005}`} strokeLinecap="round" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="font-mono text-2xl text-amber font-bold">62</span>
                </div>
              </div>
            </div>
            <p className="text-center text-text-secondary text-xs font-mono">City Monsoon Preparedness Score</p>
          </GlassCard>
        </div>

        {/* Repair ROI */}
        <GlassCard className="p-6 mb-6" nohover>
          <HUDLabel className="border-electric-blue/30 text-electric-blue mb-4">REPAIR ROI TRACKER</HUDLabel>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { value: '47', label: 'Repairs Completed' },
              { value: '74%', label: 'Avg Report Reduction' },
              { value: '1,240', label: 'Complaints Saved' },
              { value: '₹18.4L', label: 'Damage Prevented' },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <p className="font-mono text-xl text-cyan font-bold">{s.value}</p>
                <p className="text-text-secondary text-[10px] font-mono mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Data Export */}
        <GlassCard className="p-6" nohover>
          <HUDLabel className="border-electric-blue/30 text-electric-blue mb-4">EXPORT TWIN DATA</HUDLabel>
          <div className="flex flex-wrap gap-3">
            <NeonButton variant="secondary" className="border-electric-blue text-electric-blue"><Download className="w-4 h-4" /> Monthly Summary PDF</NeonButton>
            <NeonButton variant="secondary" className="border-electric-blue text-electric-blue"><Download className="w-4 h-4" /> Raw CSV (anonymised)</NeonButton>
            <NeonButton variant="ghost">API Integration Docs</NeonButton>
          </div>
          <p className="text-text-secondary text-[10px] font-mono mt-3">All exports are GDPR-compliant and citizen-anonymised.</p>
        </GlassCard>
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
              className={`flex flex-col items-center gap-1 cursor-pointer transition-colors ${item.id === 'hub' ? 'text-electric-blue' : 'text-text-secondary hover:text-foreground'}`}>
              <item.icon className="w-5 h-5" />
              <span className="text-[10px] font-mono">{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MunicipalityHub;
