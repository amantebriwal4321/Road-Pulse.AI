import { MetaverseGrid } from "@/components/MetaverseGrid";
import { GlassCard } from "@/components/GlassCard";
import { HUDLabel } from "@/components/HUDLabel";
import { NeonButton } from "@/components/NeonButton";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Mail, Eye, EyeOff, Lock } from "lucide-react";
import { useState } from "react";

const CitizenLogin = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const { register, handleSubmit } = useForm();

  const onSubmit = () => navigate('/citizen/drive');

  return (
    <div className="min-h-screen bg-metaverse-grid flex items-center justify-center px-4">
      <MetaverseGrid />
      <GlassCard className="relative z-10 w-full max-w-md p-8" nohover>
        <div className="text-center mb-6">
          <HUDLabel className="mb-3">CITIZEN AUTHENTICATION</HUDLabel>
          <h2 className="text-2xl font-display font-bold text-foreground mb-1">Access Your Twin</h2>
          <p className="text-text-secondary text-sm">Sign in to your commuter digital twin profile</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="relative">
            <Mail className="absolute left-3 top-3 w-4 h-4 text-text-secondary" />
            <input {...register('email')} type="email" placeholder="Email address"
              className="w-full pl-10 pr-4 py-3 bg-surface border border-border-glow rounded-lg text-foreground placeholder:text-text-secondary font-display text-sm focus:outline-none focus:border-cyan/50" />
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-3 w-4 h-4 text-text-secondary" />
            <input {...register('password')} type={showPassword ? 'text' : 'password'} placeholder="Password"
              className="w-full pl-10 pr-10 py-3 bg-surface border border-border-glow rounded-lg text-foreground placeholder:text-text-secondary font-display text-sm focus:outline-none focus:border-cyan/50" />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3">
              {showPassword ? <EyeOff className="w-4 h-4 text-text-secondary" /> : <Eye className="w-4 h-4 text-text-secondary" />}
            </button>
          </div>

          <NeonButton type="submit" variant="primary" className="w-full">AUTHENTICATE</NeonButton>
        </form>

        <div className="flex items-center my-5">
          <div className="flex-1 h-px bg-border-glow" />
          <span className="px-3 text-text-secondary text-xs">OR</span>
          <div className="flex-1 h-px bg-border-glow" />
        </div>

        <NeonButton variant="ghost" className="w-full mb-4">Sign in with Google</NeonButton>

        <p className="text-center text-sm text-text-secondary">
          New to RoadPulse?{' '}
          <button onClick={() => navigate('/citizen/onboarding')} className="text-cyan hover:underline cursor-pointer">
            Create profile →
          </button>
        </p>

        <div className="mt-6 text-center">
          <HUDLabel>SECURED · ANONYMISED · GDPR COMPLIANT</HUDLabel>
        </div>
      </GlassCard>
    </div>
  );
};

export default CitizenLogin;
