import { MetaverseGrid } from "@/components/MetaverseGrid";
import { GlassCard } from "@/components/GlassCard";
import { HUDLabel } from "@/components/HUDLabel";
import { NeonButton } from "@/components/NeonButton";
import { useUserStore } from "@/stores/userStore";
import { useNavigate } from "react-router-dom";
import { Map, LayoutGrid, User, Shield, Lock, LogOut } from "lucide-react";

const badges = [
  { name: 'Road Scout', earned: true },
  { name: 'Pothole Hunter', earned: true },
  { name: 'Data Guardian', earned: true },
  { name: 'Monsoon Mapper', earned: false },
  { name: 'Neighbourhood Hero', earned: false },
  { name: 'City Architect', earned: false },
];

const activityLog = [
  { date: 'Oct 3', distance: '8.3 km', potholes: 7, shared: true },
  { date: 'Oct 2', distance: '12.1 km', potholes: 4, shared: true },
  { date: 'Oct 1', distance: '6.7 km', potholes: 11, shared: false },
  { date: 'Sep 30', distance: '9.4 km', potholes: 3, shared: true },
  { date: 'Sep 29', distance: '7.8 km', potholes: 8, shared: true },
];

const CitizenProfile = () => {
  const navigate = useNavigate();
  const stats = useUserStore((s) => s.stats);

  return (
    <div className="min-h-screen bg-metaverse-grid relative pb-24">
      <MetaverseGrid />
      <div className="relative z-10 p-4">
        {/* Header */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-20 h-20 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center mb-3">
            <span className="text-primary font-display font-bold text-2xl">AK</span>
          </div>
          <h2 className="text-xl font-display font-bold text-foreground">Arjun Kumar</h2>
          <HUDLabel className="mt-2">TWIN ID: RPC-4821</HUDLabel>
          <div className="mt-2 flex items-center gap-2">
            <Shield className="w-4 h-4 text-primary" />
            <span className="text-primary font-mono text-sm font-semibold">GUARDIAN</span>
          </div>
        </div>

        {/* Vehicle Twin */}
        <GlassCard className="p-4 mb-4" nohover>
          <HUDLabel className="mb-3">VEHICLE TWIN</HUDLabel>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-foreground text-sm font-display">Sedan · Honda City</p>
              <HUDLabel className="mt-1">CALIBRATED · ±0.04g</HUDLabel>
            </div>
            <button className="text-primary text-xs font-mono cursor-pointer hover:underline">Edit</button>
          </div>
        </GlassCard>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          {[
            { value: `${stats.kmSurveyed} KM`, label: 'SURVEYED' },
            { value: String(stats.potholesLogged), label: 'POTHOLES' },
            { value: String(stats.repairsTriggered), label: 'REPAIRS' },
            { value: `₹${stats.damagePrevented.toLocaleString()}`, label: 'SAVED' },
            { value: `${stats.streak} DAY`, label: 'STREAK' },
            { value: String(stats.reportsShared), label: 'REPORTS' },
          ].map((s) => (
            <GlassCard key={s.label} className="p-3 text-center" nohover>
              <p className="font-mono text-sm text-primary font-bold">{s.value}</p>
              <p className="text-text-secondary text-[9px] font-mono mt-1">{s.label}</p>
            </GlassCard>
          ))}
        </div>

        {/* Badges */}
        <HUDLabel className="mb-3">TWIN ACHIEVEMENTS</HUDLabel>
        <div className="flex gap-3 overflow-x-auto pb-2 mt-3 mb-4">
          {badges.map((b) => (
            <div key={b.name} className={`flex-shrink-0 w-20 flex flex-col items-center gap-1 ${b.earned ? '' : 'opacity-40'}`}>
              <div className={`w-14 h-14 rounded-full border-2 flex items-center justify-center ${b.earned ? 'border-primary bg-primary/10 shadow-[0_0_12px_hsl(var(--primary)/0.3)]' : 'border-border-glow'}`}>
                {b.earned ? <Shield className="w-6 h-6 text-primary" /> : <Lock className="w-4 h-4 text-text-secondary" />}
              </div>
              <span className="text-[9px] font-mono text-text-secondary text-center">{b.name}</span>
            </div>
          ))}
        </div>

        {/* Activity Log */}
        <HUDLabel className="mb-3">ACTIVITY LOG</HUDLabel>
        <div className="space-y-2 mt-3 mb-6">
          {activityLog.map((a, i) => (
            <GlassCard key={i} className="p-3 flex items-center justify-between" nohover>
              <span className="font-mono text-xs text-text-secondary">{a.date}</span>
              <span className="font-mono text-xs text-foreground">{a.distance}</span>
              <span className="font-mono text-xs text-amber">{a.potholes} potholes</span>
              <span className={`font-mono text-xs ${a.shared ? 'text-green' : 'text-text-secondary'}`}>{a.shared ? '✓' : '✗'}</span>
            </GlassCard>
          ))}
        </div>

        {/* Sign out */}
        <NeonButton variant="ghost" className="w-full text-alert" onClick={() => navigate('/')}>
          <LogOut className="w-4 h-4" /> Sign Out
        </NeonButton>
      </div>

      <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-40">
        <div className="glass-card px-6 py-3 flex gap-8 rounded-full">
          {[
            { id: 'drive', label: 'Drive', icon: Map, path: '/citizen/drive' },
            { id: 'hub', label: 'Hub', icon: LayoutGrid, path: '/citizen/hub' },
            { id: 'profile', label: 'Profile', icon: User, path: '/citizen/profile' },
          ].map((item) => (
            <button key={item.id} onClick={() => navigate(item.path)}
              className={`flex flex-col items-center gap-1 cursor-pointer transition-colors ${item.id === 'profile' ? 'text-primary' : 'text-text-secondary hover:text-foreground'}`}>
              <item.icon className="w-5 h-5" />
              <span className="text-[10px] font-mono">{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CitizenProfile;
