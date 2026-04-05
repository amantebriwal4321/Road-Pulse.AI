import { MetaverseGrid } from "@/components/MetaverseGrid";
import { GlassCard } from "@/components/GlassCard";
import { HUDLabel } from "@/components/HUDLabel";
import { NeonButton } from "@/components/NeonButton";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Mail, Lock, Shield } from "lucide-react";
import { useState } from "react";

const MunicipalityLogin = () => {
  const navigate = useNavigate();
  const [otpSent, setOtpSent] = useState(false);
  const { register, handleSubmit } = useForm();

  const onSubmit = () => navigate('/municipality/map');

  return (
    <div className="min-h-screen bg-metaverse-grid flex items-center justify-center px-4">
      <MetaverseGrid />
      <GlassCard className="relative z-10 w-full max-w-md p-8" nohover>
        <div className="text-center mb-6">
          <HUDLabel className="mb-3 border-electric-blue/30 text-electric-blue">AUTHORITY ACCESS — RESTRICTED</HUDLabel>
          <h2 className="text-2xl font-display font-bold text-foreground mb-1">City Command Access</h2>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="relative">
            <Shield className="absolute left-3 top-3 w-4 h-4 text-text-secondary" />
            <input {...register('govId')} placeholder="Government ID" className="w-full pl-10 pr-4 py-3 bg-surface border border-border-glow rounded-lg text-foreground placeholder:text-text-secondary text-sm font-medium focus:outline-none focus:border-electric-blue/50" />
          </div>
          <div className="relative">
            <Mail className="absolute left-3 top-3 w-4 h-4 text-text-secondary" />
            <input {...register('email')} type="email" placeholder="Official Email" className="w-full pl-10 pr-4 py-3 bg-surface border border-border-glow rounded-lg text-foreground placeholder:text-text-secondary text-sm font-medium focus:outline-none focus:border-electric-blue/50" />
          </div>
          <input {...register('org')} placeholder="Organisation name" className="w-full px-4 py-3 bg-surface border border-border-glow rounded-lg text-foreground placeholder:text-text-secondary text-sm font-medium focus:outline-none focus:border-electric-blue/50" />

          {!otpSent ? (
            <NeonButton type="button" variant="secondary" className="w-full border-electric-blue text-electric-blue hover:bg-electric-blue/10" onClick={() => setOtpSent(true)}>
              Send OTP
            </NeonButton>
          ) : (
            <div className="flex gap-2">
              {Array(6).fill(0).map((_, i) => (
                <input key={i} maxLength={1} className="w-full aspect-square bg-surface border border-border-glow rounded-lg text-foreground text-center font-mono text-lg focus:outline-none focus:border-electric-blue/50" />
              ))}
            </div>
          )}

          <NeonButton type="submit" variant="primary" className="w-full bg-electric-blue hover:shadow-[0_0_24px_hsl(var(--electric-blue)/0.4)]">
            VERIFY & ENTER
          </NeonButton>
        </form>

        <p className="text-center text-sm font-medium text-text-secondary mt-4">
          <button onClick={() => navigate('/municipality/onboarding')} className="text-electric-blue hover:underline cursor-pointer">
            Register new authority profile →
          </button>
        </p>
      </GlassCard>
    </div>
  );
};

export default MunicipalityLogin;
