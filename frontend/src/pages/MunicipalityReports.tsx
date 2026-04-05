import { MetaverseGrid } from "@/components/MetaverseGrid";
import { GlassCard } from "@/components/GlassCard";
import { HUDLabel } from "@/components/HUDLabel";
import { NeonButton } from "@/components/NeonButton";
import { aiReports } from "@/data/ai-reports";
import { usePotholes } from "@/hooks/usePotholes";
import { useNavigate } from "react-router-dom";
import { useState, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import { Globe, FileText, LayoutGrid, Search, Download, Send } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { getLastScanReport, generateScanReport } from "@/lib/generateScanReport";

const volumeData = Array.from({ length: 30 }, (_, i) => ({ day: i + 1, reports: Math.floor(Math.random() * 30) + 10 }));

const MunicipalityReports = () => {
  const navigate = useNavigate();
  const { potholes } = usePotholes(10000);

  // Live severity breakdown from API
  const severityData = useMemo(() => {
    const critical = potholes.filter(p => p.severity >= 9).length;
    const high = potholes.filter(p => p.severity >= 7 && p.severity < 9).length;
    const medium = potholes.filter(p => p.severity >= 4 && p.severity < 7).length;
    const low = potholes.filter(p => p.severity < 4).length;
    return [
      { name: 'Critical', value: critical, color: '#FF3D57' },
      { name: 'High', value: high, color: '#FF6D00' },
      { name: 'Medium', value: medium, color: '#FFB300' },
      { name: 'Low', value: low, color: '#00E676' },
    ];
  }, [potholes]);
  const [selectedId, setSelectedId] = useState(aiReports[0].id);
  const selected = aiReports.find((r) => r.id === selectedId)!;

  // Download last simulation PDF (or alert if none exists)
  const handleDownloadPdf = useCallback(() => {
    const last = getLastScanReport();
    if (last) {
      generateScanReport(last);
    } else {
      alert('No scan report available yet. Run a simulation from Citizen Hub first.');
    }
  }, []);

  return (
    <div className="min-h-screen bg-metaverse-grid relative pb-24">
      <MetaverseGrid />
      <div className="relative z-10 flex flex-col lg:flex-row">
        {/* Report List */}
        <div className="w-full lg:w-96 p-4 space-y-3 overflow-y-auto lg:h-screen border-r border-border-glow">
          <HUDLabel className="border-electric-blue/30 text-electric-blue">TWIN REPORTS</HUDLabel>
          <div className="relative mt-3">
            <Search className="absolute left-3 top-3 w-4 h-4 text-text-secondary" />
            <input placeholder="Search reports..." className="w-full pl-10 pr-4 py-3 bg-surface border border-border-glow rounded-lg text-foreground placeholder:text-text-secondary text-sm font-medium focus:outline-none" />
          </div>
          {aiReports.map((r) => (
            <GlassCard key={r.id} className={`p-4 cursor-pointer ${selectedId === r.id ? 'border-electric-blue/40' : ''}`}
              onClick={() => setSelectedId(r.id)} nohover>
              <p className="font-mono text-xs font-medium text-cyan">{r.id}</p>
              <p className="text-foreground text-sm font-medium font-display mt-1">{r.roadName}</p>
              <p className="text-text-secondary text-xs font-medium font-mono mt-1">{r.ward} · {r.dateRange}</p>
              <div className="flex gap-2 mt-2">
                {r.aiProcessed && <span className="text-[9px] bg-cyan/10 text-cyan px-2 py-0.5 rounded font-mono">AI ANALYSED</span>}
                {r.pdfReady && <span className="text-[9px] bg-green/10 text-green px-2 py-0.5 rounded font-mono">PDF READY</span>}
              </div>
            </GlassCard>
          ))}
        </div>

        {/* Report Detail */}
        <div className="flex-1 p-4 lg:p-8 overflow-y-auto lg:h-screen">
          <HUDLabel className="border-electric-blue/30 text-electric-blue mb-4">TWIN REPORT · {selected.id}</HUDLabel>
          <h2 className="text-2xl font-display font-bold text-foreground mb-1">{selected.roadName}</h2>
          <p className="text-text-secondary text-sm font-medium font-mono mb-6">{selected.ward} · {selected.dateRange} · {selected.evidenceCount} evidence points</p>

          {/* AI Analysis */}
          <motion.div className="mb-8">
            <GlassCard className="p-6 animate-border-cycle" nohover>
              <HUDLabel className="mb-3">AI TWIN ANALYSIS</HUDLabel>
              <p className="text-text-secondary text-[10px] font-mono mb-4">Powered by Road Intelligence Engine</p>

              <div className="space-y-4">
                <div>
                  <p className="text-foreground text-sm font-medium leading-relaxed">{selected.analysis}</p>
                </div>
                <div className="glass-card p-3">
                  <p className="text-alert font-mono text-sm font-medium font-bold">PRIORITY ASSESSMENT: {selected.priorityTier}</p>
                </div>
                <div>
                  <p className="text-text-secondary text-xs font-medium font-mono mb-1">RECOMMENDED ACTION</p>
                  <p className="text-foreground text-sm font-medium">{selected.recommendedAction}</p>
                </div>
                <div>
                  <p className="text-text-secondary text-xs font-medium font-mono mb-1">BUDGET ESTIMATE</p>
                  <p className="text-cyan font-mono text-lg font-bold">{selected.costEstimate}</p>
                </div>
                <div>
                  <p className="text-text-secondary text-xs font-medium font-mono mb-1">SIMILAR RESOLVED CASES</p>
                  <p className="text-foreground text-sm font-medium">{selected.similarCase}</p>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <NeonButton variant="primary" className="bg-electric-blue" onClick={handleDownloadPdf}><Download className="w-4 h-4" /> DOWNLOAD PDF</NeonButton>
                <NeonButton variant="secondary" className="border-electric-blue text-electric-blue"><Send className="w-4 h-4" /> FORWARD TO PWD</NeonButton>
              </div>
            </GlassCard>
          </motion.div>

          {/* Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <GlassCard className="p-4" nohover>
              <p className="text-text-secondary text-xs font-medium font-mono mb-3">REPORT VOLUME — 30 DAYS</p>
              <ResponsiveContainer width="100%" height={150}>
                <AreaChart data={volumeData}>
                  <defs>
                    <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2979FF" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#2979FF" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="day" stroke="#7B9BBF" tick={{ fontSize: 10 }} />
                  <YAxis stroke="#7B9BBF" tick={{ fontSize: 10 }} />
                  <Area type="monotone" dataKey="reports" stroke="#2979FF" fill="url(#areaGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </GlassCard>

            <GlassCard className="p-4" nohover>
              <p className="text-text-secondary text-xs font-medium font-mono mb-3">SEVERITY BREAKDOWN</p>
              <ResponsiveContainer width="100%" height={150}>
                <PieChart>
                  <Pie data={severityData} cx="50%" cy="50%" outerRadius={55} dataKey="value" stroke="none">
                    {severityData.map((d, i) => <Cell key={i} fill={d.color} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap gap-3 mt-2">
                {severityData.map((d) => (
                  <div key={d.name} className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }} />
                    <span className="text-[10px] text-text-secondary font-mono">{d.name}: {d.value}</span>
                  </div>
                ))}
              </div>
            </GlassCard>
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
              className={`flex flex-col items-center gap-1 cursor-pointer transition-colors ${item.id === 'reports' ? 'text-electric-blue' : 'text-text-secondary hover:text-foreground'}`}>
              <item.icon className="w-5 h-5" />
              <span className="text-[10px] font-mono">{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MunicipalityReports;
