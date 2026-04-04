import { cn } from "@/lib/utils";

export const LiveIndicator = ({ className }: { className?: string }) => (
  <div className={cn("flex items-center gap-2", className)}>
    <span className="relative flex h-2.5 w-2.5">
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-alert opacity-75" />
      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-alert" />
    </span>
    <span className="font-mono text-xs text-alert tracking-widest">LIVE</span>
  </div>
);
