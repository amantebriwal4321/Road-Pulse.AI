export const ScanningLine = ({ className }: { className?: string }) => (
  <div className={cn("absolute inset-0 overflow-hidden pointer-events-none z-10", className)}>
    <div className="w-full h-px bg-gradient-to-r from-transparent via-cyan to-transparent animate-scanning" />
  </div>
);

import { cn } from "@/lib/utils";
