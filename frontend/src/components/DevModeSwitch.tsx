import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

interface DevModeSwitchProps {
  className?: string;
}

export const DevModeSwitch = ({ className }: DevModeSwitchProps) => {
  const location = useLocation();
  const isCitizen = location.pathname.startsWith('/citizen');
  const isMuni = location.pathname.startsWith('/municipality');

  return (
    <div className={cn("fixed bottom-4 left-4 z-50", className)}>
      <div className="glass-card px-3 py-2 text-[10px] font-mono text-text-secondary flex items-center gap-2">
        <Link to={isCitizen ? "/municipality/map" : "/citizen/drive"} className="hover:text-cyan transition-colors">
          {isCitizen ? "→ MUNICIPALITY" : isMuni ? "→ CITIZEN" : "CITIZEN ↔ MUNI"}
        </Link>
      </div>
    </div>
  );
};
