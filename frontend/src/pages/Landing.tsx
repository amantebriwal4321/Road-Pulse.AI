import { MetaverseGrid } from "@/components/MetaverseGrid";
import { GlassCard } from "@/components/GlassCard";
import { HUDLabel } from "@/components/HUDLabel";
import { NeonButton } from "@/components/NeonButton";
import { ThemeToggle } from "@/components/ThemeToggle";
import { usePotholes } from "@/hooks/usePotholes";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { User, Building2, Activity } from "lucide-react";
import { useEffect, useState, useMemo } from "react";

const CountUp = ({ target, suffix = '' }: { target: number; suffix?: string }) => {
  const [val, setVal] = useState(0);
  useEffect(() => {
    const dur = 2000;
    const steps = 60;
    const inc = target / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += inc;
      if (current >= target) { setVal(target); clearInterval(timer); }
      else setVal(Math.floor(current));
    }, dur / steps);
    return () => clearInterval(timer);
  }, [target]);
  return <span>{val.toLocaleString('en-IN')}{suffix}</span>;
};

const Landing = () => {
  const navigate = useNavigate();
  const { potholes } = usePotholes(10000);

  // Live stats
  const liveStats = useMemo(() => {
    const totalReports = potholes.reduce((s, p) => s + p.report_count, 0);
    const damageCost = Math.round(totalReports * 500 / 10000000 * 10) / 10;
    return [
      { value: potholes.length, label: 'POTHOLES MAPPED' },
      { value: 1, label: 'CITY ACTIVE' },
      { value: damageCost, label: 'DAMAGE TRACKED', prefix: '₹', suffix: ' CR' },
    ];
  }, [potholes]);

  return (
    <div className="min-h-screen bg-metaverse-grid relative overflow-hidden">
      <MetaverseGrid />

      {/* Header */}
      <div className="relative z-10 flex justify-between items-start p-6 md:p-10">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl font-display font-bold text-foreground">ROAD</span>
            <Activity className="w-6 h-6 text-cyan" />
            <span className="text-2xl font-display font-bold text-cyan">PULSE</span>
          </div>
          <HUDLabel>DIGITAL TWIN PLATFORM</HUDLabel>
        </div>
        <ThemeToggle />
      </div>

      {/* Hero */}
      <div className="relative z-10 flex flex-col items-center justify-center px-6 pt-8 md:pt-16 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-4xl"
        >
          <p className="text-text-secondary text-2xl md:text-4xl font-display mb-2">YOUR CITY HAS A</p>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-display font-bold text-gradient-cyan mb-6">
            DIGITAL TWIN
          </h1>
          <p className="text-text-secondary text-lg md:text-xl max-w-xl mx-auto mb-12 font-display">
            Every pothole. Every road. Every commute. Mapped in real-time into a living digital replica of your city.
          </p>
        </motion.div>

        {/* Animated grid SVG */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, duration: 1 }}
          className="w-full max-w-2xl mb-12"
        >
          <svg viewBox="0 0 400 120" className="w-full">
            {[20, 50, 80, 110].map((y) => (
              <motion.line key={`h${y}`} x1="0" y1={y} x2="400" y2={y} stroke="hsl(var(--cyan))" strokeOpacity="0.15" strokeWidth="1"
                initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.5 + y * 0.005, duration: 1.5 }} />
            ))}
            {[40, 100, 160, 220, 280, 340].map((x) => (
              <motion.line key={`v${x}`} x1={x} y1="0" x2={x} y2="120" stroke="hsl(var(--cyan))" strokeOpacity="0.15" strokeWidth="1"
                initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.5 + x * 0.002, duration: 1.5 }} />
            ))}
            {[
              { cx: 100, cy: 50, fill: '#00E676' }, { cx: 160, cy: 80, fill: '#FFB300' },
              { cx: 220, cy: 20, fill: '#FF3D57' }, { cx: 280, cy: 50, fill: '#FF6D00' },
              { cx: 340, cy: 80, fill: '#00E676' }, { cx: 40, cy: 110, fill: '#FFB300' },
              { cx: 160, cy: 20, fill: '#00E676' }, { cx: 280, cy: 110, fill: '#FF3D57' },
            ].map((dot, i) => (
              <motion.circle key={i} cx={dot.cx} cy={dot.cy} r="4" fill={dot.fill}
                initial={{ scale: 0 }} animate={{ scale: [0, 1.3, 1] }}
                transition={{ delay: 1.2 + i * 0.15, duration: 0.5 }}>
                <animate attributeName="opacity" values="1;0.4;1" dur="2s" repeatCount="indefinite" begin={`${i * 0.3}s`} />
              </motion.circle>
            ))}
          </svg>
        </motion.div>

        {/* CTA Cards */}
        <div className="grid md:grid-cols-2 gap-6 w-full max-w-4xl mb-16">
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.8, duration: 0.6 }}>
            <GlassCard className="min-h-[220px] flex flex-col items-center text-center p-8 cursor-pointer" onClick={() => navigate('/citizen/login')}>
              <User className="w-12 h-12 text-cyan mb-4" />
              <HUDLabel className="mb-3">CITIZEN</HUDLabel>
              <h3 className="text-xl font-display font-semibold text-foreground mb-2">Commuter Twin</h3>
              <p className="text-text-secondary text-sm mb-6 flex-1">Your daily drive becomes a real-time road survey. Navigate smarter. Protect your vehicle. Fix your city.</p>
              <NeonButton variant="primary" onClick={() => navigate('/citizen/login')}>Enter Citizen Mode →</NeonButton>
            </GlassCard>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1, duration: 0.6 }}>
            <GlassCard className="min-h-[220px] flex flex-col items-center text-center p-8 cursor-pointer" onClick={() => navigate('/municipality/login')}>
              <Building2 className="w-12 h-12 text-electric-blue mb-4" />
              <HUDLabel className="mb-3">AUTHORITY</HUDLabel>
              <h3 className="text-xl font-display font-semibold text-foreground mb-2">City Command</h3>
              <p className="text-text-secondary text-sm mb-6 flex-1">Monitor your city's road health twin in real-time. Act on live data. Generate evidence-based reports instantly.</p>
              <NeonButton variant="secondary" onClick={() => navigate('/municipality/login')}>Enter Municipality Portal →</NeonButton>
            </GlassCard>
          </motion.div>
        </div>

        {/* Stats Bar — LIVE from API */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.4, duration: 0.6 }}
          className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-12 w-full max-w-3xl"
        >
          {liveStats.map((stat, i) => (
            <div key={i} className="flex flex-col items-center">
              <span className="font-mono text-2xl md:text-3xl text-cyan font-bold">
                {stat.prefix || ''}<CountUp target={stat.value} />{stat.suffix || ''}
              </span>
              <span className="text-text-secondary text-xs font-mono tracking-wider mt-1">{stat.label}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default Landing;
