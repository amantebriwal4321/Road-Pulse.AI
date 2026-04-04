import { MetaverseGrid } from "@/components/MetaverseGrid";
import { GlassCard } from "@/components/GlassCard";
import { HUDLabel } from "@/components/HUDLabel";
import { NeonButton } from "@/components/NeonButton";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check } from "lucide-react";

const designations = ['Field Engineer', 'Ward Officer', 'City Planner', 'Commissioner', 'Data Analyst'];
const wardNames = ['Marathahalli', 'Whitefield', 'Koramangala', 'HSR Layout', 'BTM Layout', 'Silk Board', 'JP Nagar', 'Hebbal', 'Indiranagar', 'Jayanagar', 'Electronic City', 'Rajajinagar'];

const MunicipalityOnboarding = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [jurisdictionLevel, setJurisdictionLevel] = useState('ward');
  const [selectedWards, setSelectedWards] = useState<string[]>(['Marathahalli']);
  const [activating, setActivating] = useState(false);

  const toggleWard = (w: string) => setSelectedWards((p) => p.includes(w) ? p.filter((x) => x !== w) : [...p, w]);

  const activate = () => {
    setActivating(true);
    setTimeout(() => navigate('/municipality/map'), 3000);
  };

  if (activating) {
    return (
      <div className="min-h-screen bg-metaverse-grid flex items-center justify-center relative overflow-hidden">
        <MetaverseGrid />
        <div className="absolute inset-0 overflow-hidden">
          <div className="w-full h-1 bg-gradient-to-r from-transparent via-electric-blue to-transparent animate-scanning" />
        </div>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center z-10">
          <motion.p initial={{ opacity: 1 }} animate={{ opacity: 0 }} transition={{ delay: 1.5 }}
            className="font-mono text-electric-blue text-xl tracking-widest">INITIALISING COMMAND CENTRE...</motion.p>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2 }}
            className="font-mono text-electric-blue text-3xl tracking-widest font-bold">COMMAND CENTRE ACTIVE</motion.p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-metaverse-grid flex items-center justify-center px-4 py-8">
      <MetaverseGrid />
      <GlassCard className="relative z-10 w-full max-w-lg p-8" nohover>
        <div className="text-center mb-4">
          <HUDLabel className="border-electric-blue/30 text-electric-blue">COMMAND INITIALISATION — STEP {step} OF 3</HUDLabel>
        </div>

        <div className="flex items-center justify-center gap-2 mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-mono border ${s <= step ? 'bg-electric-blue/20 border-electric-blue text-electric-blue' : 'border-border-glow text-text-secondary'}`}>
                {s < step ? <Check className="w-4 h-4" /> : s}
              </div>
              {s < 3 && <div className={`w-8 h-px ${s < step ? 'bg-electric-blue' : 'bg-border-glow'}`} />}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <h3 className="text-xl font-display font-semibold text-foreground mb-4">Register Command Profile</h3>
              <div className="space-y-3">
                <input placeholder="Full name" className="w-full px-4 py-3 bg-surface border border-border-glow rounded-lg text-foreground placeholder:text-text-secondary text-sm focus:outline-none" />
                <select className="w-full px-4 py-3 bg-surface border border-border-glow rounded-lg text-foreground text-sm focus:outline-none">
                  {designations.map((d) => <option key={d}>{d}</option>)}
                </select>
                <input placeholder="Department" className="w-full px-4 py-3 bg-surface border border-border-glow rounded-lg text-foreground placeholder:text-text-secondary text-sm focus:outline-none" />
                <input placeholder="Employee ID" className="w-full px-4 py-3 bg-surface border border-border-glow rounded-lg text-foreground placeholder:text-text-secondary text-sm focus:outline-none" />
                <input placeholder="Phone" className="w-full px-4 py-3 bg-surface border border-border-glow rounded-lg text-foreground placeholder:text-text-secondary text-sm focus:outline-none" />
              </div>
              <NeonButton className="w-full mt-6 bg-electric-blue hover:shadow-[0_0_24px_hsl(var(--electric-blue)/0.4)]" onClick={() => setStep(2)}>Continue →</NeonButton>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <h3 className="text-xl font-display font-semibold text-foreground mb-1">Define Your City Sector</h3>
              <p className="text-text-secondary text-sm mb-4">Your digital twin will be filtered to your jurisdiction.</p>

              <div className="flex gap-2 mb-4">
                {['Ward', 'Zone', 'City'].map((l) => (
                  <button key={l} onClick={() => setJurisdictionLevel(l.toLowerCase())}
                    className={`flex-1 py-3 rounded-lg border text-sm transition-all cursor-pointer ${jurisdictionLevel === l.toLowerCase() ? 'border-electric-blue bg-electric-blue/10 text-electric-blue' : 'border-border-glow text-text-secondary'}`}>
                    {l}
                  </button>
                ))}
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                {wardNames.map((w) => (
                  <button key={w} onClick={() => toggleWard(w)}
                    className={`px-3 py-1.5 rounded-full text-xs font-mono border transition-all cursor-pointer ${selectedWards.includes(w) ? 'border-electric-blue bg-electric-blue/10 text-electric-blue' : 'border-border-glow text-text-secondary'}`}>
                    {w}
                  </button>
                ))}
              </div>

              <NeonButton className="w-full bg-electric-blue hover:shadow-[0_0_24px_hsl(var(--electric-blue)/0.4)]" onClick={() => setStep(3)}>Continue →</NeonButton>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="s3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <h3 className="text-xl font-display font-semibold text-foreground mb-4">Command Preferences</h3>

              <div className="space-y-5 mb-6">
                <div>
                  <p className="text-sm text-foreground mb-2">Alert me when potholes exceed severity</p>
                  <input type="range" min="1" max="10" defaultValue="7" className="w-full accent-[hsl(var(--electric-blue))]" />
                  <div className="flex justify-between text-[10px] font-mono text-text-secondary"><span>1</span><span>10</span></div>
                </div>
                <div>
                  <p className="text-sm text-foreground mb-2">Emergency dispatch threshold</p>
                  <input type="range" min="1" max="10" defaultValue="8" className="w-full accent-[hsl(var(--electric-blue))]" />
                </div>
                <div>
                  <p className="text-sm text-foreground mb-2">Report frequency</p>
                  <div className="flex gap-2">
                    {['Daily', 'Weekly', 'Monthly'].map((f) => (
                      <button key={f} className="flex-1 py-2 rounded-lg border border-border-glow text-text-secondary text-sm hover:border-electric-blue hover:text-electric-blue transition-all cursor-pointer">{f}</button>
                    ))}
                  </div>
                </div>
              </div>

              <NeonButton className="w-full bg-electric-blue hover:shadow-[0_0_24px_hsl(var(--electric-blue)/0.4)]" size="lg" onClick={activate}>
                INITIALISE COMMAND CENTRE →
              </NeonButton>
            </motion.div>
          )}
        </AnimatePresence>
      </GlassCard>
    </div>
  );
};

export default MunicipalityOnboarding;
