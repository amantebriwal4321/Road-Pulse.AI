import { cn } from "@/lib/utils";

interface HUDLabelProps {
  children: React.ReactNode;
  className?: string;
}

export const HUDLabel = ({ children, className }: HUDLabelProps) => (
  <span
    className={cn(
      "font-mono text-[10px] text-cyan uppercase tracking-[0.15em] px-2 py-0.5 border border-cyan/30 rounded-sm inline-block",
      className
    )}
  >
    {children}
  </span>
);
