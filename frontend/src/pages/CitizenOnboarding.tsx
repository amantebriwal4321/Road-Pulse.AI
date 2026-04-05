import { MetaverseGrid } from "@/components/MetaverseGrid";
import { GlassCard } from "@/components/GlassCard";
import { HUDLabel } from "@/components/HUDLabel";
import { NeonButton } from "@/components/NeonButton";
import { ScanningLine } from "@/components/ScanningLine";
import { LiveMap } from "@/components/LiveMap";
import { usePotholes } from "@/hooks/usePotholes";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useUserStore } from "@/stores/userStore";
import { Check, Bike, Car, Truck, CircleDot } from "lucide-react";

const vehicleTypes = [
  { id: 'two-wheeler', label: 'Two-Wheeler', icon: Bike },
  { id: 'hatchback', label: 'Hatchback', icon: Car },
  { id: 'sedan', label: 'Sedan', icon: Car },
  { id: 'suv', label: 'SUV / MUV', icon: Truck },
  { id: 'auto', label: 'Auto-Rickshaw', icon: CircleDot },
  { id: 'delivery', label: 'Delivery', icon: Truck },
];

const cities = ['Bengaluru', 'Mumbai', 'Delhi', 'Chennai', 'Hyderabad', 'Pune', 'Kolkata', 'Ahmedabad'];

const CitizenOnboarding = () => {
  const navigate = useNavigate();
  const { potholes } = usePotholes(10000);
  const [step, setStep] = useState(1);
  const [vehicleType, setVehicleType] = useState('');
  const [phoneTier, setPhoneTier] = useState('mid-range');
  const [mountPos, setMountPos] = useState('dashboard');
  const [calibrated, setCalibrated] = useState(false);
  const [calibrating, setCalibrating] = useState(false);
  const [activating, setActivating] = useState(false);
  const completeOnboarding = useUserStore((s) => s.completeOnboarding);

  const runCalibration = () => {
    setCalibrating(true);
    setTimeout(() => { setCalibrating(false); setCalibrated(true); }, 2500);
  };

  const activateTwin = () => {
    setActivating(true);
    setTimeout(() => {
      completeOnboarding();
      navigate('/citizen/drive');
    }, 3000);
  };

  if (activating) {
    return (
      <div className="min-h-screen bg-metaverse-grid flex items-center justify-center relative overflow-hidden">
        <MetaverseGrid />
        <div className="absolute inset-0 overflow-hidden">
          <div className="w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent animate-scanning" />
        </div>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center z-10">
          <motion.p initial={{ opacity: 1 }} animate={{ opacity: 0 }} transition={{ delay: 1.5, duration: 0.5 }}
            className="font-mono text-primary text-xl tracking-widest">TWIN INITIALISING...</motion.p>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2, duration: 0.5 }}
            className="font-mono text-primary text-3xl tracking-widest font-bold">TWIN ACTIVE</motion.p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-metaverse-grid flex items-center justify-center px-4 py-8">
      <MetaverseGrid />
      <GlassCard className="relative z-10 w-full max-w-lg p-8" nohover>
        <div className="text-center mb-4">
          <HUDLabel>TWIN CALIBRATION — STEP {step} OF 4</HUDLabel>
        </div>

        {/* Progress */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {[1, 2, 3, 4].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-mono border ${s <= step ? 'bg-primary/20 border-primary text-primary' : 'border-border-glow text-text-secondary'}`}>
                {s < step ? <Check className="w-4 h-4" /> : s}
              </div>
              {s < 4 && <div className={`w-8 h-px ${s < step ? 'bg-primary' : 'bg-border-glow'}`} />}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <h3 className="text-xl font-display font-semibold text-foreground mb-4">Initialize Your Profile</h3>
              <div className="space-y-3">
                <input placeholder="Full name" className="w-full px-4 py-3 bg-surface border border-border-glow rounded-lg text-foreground placeholder:text-text-secondary text-sm focus:outline-none focus:border-primary/50" />
                <input placeholder="Email" type="email" className="w-full px-4 py-3 bg-surface border border-border-glow rounded-lg text-foreground placeholder:text-text-secondary text-sm focus:outline-none focus:border-primary/50" />
                <input placeholder="Phone number" className="w-full px-4 py-3 bg-surface border border-border-glow rounded-lg text-foreground placeholder:text-text-secondary text-sm focus:outline-none focus:border-primary/50" />
                <select className="w-full px-4 py-3 bg-surface border border-border-glow rounded-lg text-foreground text-sm focus:outline-none focus:border-primary/50">
                  {cities.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <NeonButton className="w-full mt-6" onClick={() => setStep(2)}>Continue →</NeonButton>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <h3 className="text-xl font-display font-semibold text-foreground mb-1">Register Your Vehicle Twin</h3>
              <p className="text-text-secondary text-sm mb-4">We create a digital twin of your vehicle to calibrate impact sensitivity accurately.</p>
              <div className="grid grid-cols-3 gap-3 mb-4">
                {vehicleTypes.map((v) => (
                  <button key={v.id} onClick={() => setVehicleType(v.id)}
                    className={`p-4 rounded-lg border flex flex-col items-center gap-2 transition-all cursor-pointer ${vehicleType === v.id ? 'border-primary bg-primary/10 text-primary' : 'border-border-glow text-text-secondary hover:border-primary/30'}`}>
                    <v.icon className="w-8 h-8" />
                    <span className="text-xs">{v.label}</span>
                  </button>
                ))}
              </div>
              <NeonButton className="w-full" onClick={() => setStep(3)}>Continue →</NeonButton>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="s3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <h3 className="text-xl font-display font-semibold text-foreground mb-1">Calibrate Sensor Twin</h3>
              <p className="text-text-secondary text-sm mb-4">We map your phone's sensor fingerprint to normalise road impact readings.</p>

              <div className="flex gap-2 mb-4">
                {['Budget', 'Mid-range', 'Flagship'].map((tier) => (
                  <button key={tier} onClick={() => setPhoneTier(tier.toLowerCase())}
                    className={`flex-1 py-3 rounded-lg border text-sm transition-all cursor-pointer ${phoneTier === tier.toLowerCase() ? 'border-primary bg-primary/10 text-primary' : 'border-border-glow text-text-secondary'}`}>
                    {tier}
                  </button>
                ))}
              </div>
              <HUDLabel className="mb-4">AUTO-DETECTED: {phoneTier.toUpperCase()}</HUDLabel>

              <div className="flex gap-2 mb-6 mt-4">
                {['Pocket', 'Cup Holder', 'Dashboard', 'Handlebar'].map((pos) => (
                  <button key={pos} onClick={() => setMountPos(pos.toLowerCase())}
                    className={`flex-1 py-2 rounded-lg border text-xs transition-all cursor-pointer ${mountPos === pos.toLowerCase() ? 'border-primary bg-primary/10 text-primary' : 'border-border-glow text-text-secondary'}`}>
                    {pos}
                  </button>
                ))}
              </div>

              <div className="relative glass-card p-6 text-center mb-4">
                {calibrating && <ScanningLine />}
                {calibrated ? (
                  <div className="flex items-center justify-center gap-2">
                    <Check className="w-5 h-5 text-green" />
                    <HUDLabel>SENSITIVITY: OPTIMAL · ±0.04g</HUDLabel>
                  </div>
                ) : (
                  <>
                    <p className="text-text-secondary text-sm mb-3">Place device flat. Tap the button.</p>
                    <NeonButton onClick={runCalibration} disabled={calibrating}>
                      {calibrating ? 'CALIBRATING...' : 'RUN CALIBRATION TEST'}
                    </NeonButton>
                  </>
                )}
              </div>

              <NeonButton className="w-full" onClick={() => setStep(4)} disabled={!calibrated}>Continue →</NeonButton>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div key="s4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <h3 className="text-xl font-display font-semibold text-foreground mb-4">Activate Your Twin</h3>
              
              <div className="space-y-4 mb-6">
                <div className="glass-card p-4">
                  <div className="flex justify-between items-end mb-2">
                    <p className="text-text-secondary text-sm">Home Area</p>
                    <p className="text-text-secondary text-[10px] font-mono">SILK BOARD</p>
                  </div>
                  <div className="w-full h-32 bg-surface rounded-lg flex items-center justify-center border border-border-glow overflow-hidden relative">
                    {/* Overlay to disable scroll-zooming accidentally during onboarding */}
                    <div className="absolute inset-0 pointer-events-none z-10 box-border border-2 border-transparent hover:border-primary transition-colors" />
                    <LiveMap potholes={potholes} height="100%" center={[12.9165, 77.6229]} zoom={13} showPopups={false} />
                  </div>
                </div>
                <div className="glass-card p-4">
                  <div className="flex justify-between items-end mb-2">
                    <p className="text-text-secondary text-sm">Work Area</p>
                    <p className="text-text-secondary text-[10px] font-mono">MANYATA TECH PARK</p>
                  </div>
                  <div className="w-full h-32 bg-surface rounded-lg flex items-center justify-center border border-border-glow overflow-hidden relative">
                    <div className="absolute inset-0 pointer-events-none z-10 box-border border-2 border-transparent hover:border-primary transition-colors" />
                    <LiveMap potholes={potholes} height="100%" center={[13.0450, 77.6210]} zoom={13} showPopups={false} />
                  </div>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                {['Danger ahead alerts', 'Route intelligence', 'Weekly twin report'].map((label) => (
                  <label key={label} className="flex items-center justify-between">
                    <span className="text-sm text-foreground">{label}</span>
                    <div className="w-10 h-5 bg-primary/20 rounded-full relative cursor-pointer">
                      <div className="w-4 h-4 bg-primary rounded-full absolute top-0.5 right-0.5" />
                    </div>
                  </label>
                ))}
              </div>

              <NeonButton className="w-full" size="lg" onClick={activateTwin}>ACTIVATE TWIN →</NeonButton>
            </motion.div>
          )}
        </AnimatePresence>
      </GlassCard>
    </div>
  );
};

export default CitizenOnboarding;
