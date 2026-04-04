import { cn } from "@/lib/utils";
import { motion, HTMLMotionProps } from "framer-motion";
import React from "react";

interface GlassCardProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
  className?: string;
  nohover?: boolean;
}

export const GlassCard = ({ children, className, nohover, ...props }: GlassCardProps) => (
  <motion.div
    className={cn(
      "glass-card p-6",
      !nohover && "transition-all duration-300",
      className
    )}
    whileHover={nohover ? undefined : { scale: 1.01 }}
    {...props}
  >
    {children}
  </motion.div>
);
