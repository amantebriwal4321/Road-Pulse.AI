import { cn } from "@/lib/utils";

type Severity = 'smooth' | 'rough' | 'pothole' | 'critical';

const severityColors: Record<Severity, string> = {
  smooth: 'text-green',
  rough: 'text-amber',
  pothole: 'text-orange',
  critical: 'text-alert',
};

interface SeverityPulseProps {
  severity: Severity;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const SeverityPulse = ({ severity, size = 'md', className }: SeverityPulseProps) => {
  const sizes = { sm: 'w-2 h-2', md: 'w-3 h-3', lg: 'w-4 h-4' };
  const pingSizes = { sm: 'w-2 h-2', md: 'w-3 h-3', lg: 'w-4 h-4' };

  return (
    <span className={cn("relative inline-flex", className)}>
      {severity === 'critical' && (
        <span className={cn("absolute inline-flex rounded-full opacity-75 animate-ping-radar", pingSizes[size], severityColors[severity].replace('text-', 'bg-'))} />
      )}
      <span className={cn("relative inline-flex rounded-full animate-pulse-glow", sizes[size], severityColors[severity].replace('text-', 'bg-'))} />
    </span>
  );
};
