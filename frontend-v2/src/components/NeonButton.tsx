import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes } from "react";

interface NeonButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export const NeonButton = ({ variant = 'primary', size = 'md', className, children, ...props }: NeonButtonProps) => {
  const base = "font-display font-semibold rounded-lg transition-all duration-300 cursor-pointer inline-flex items-center justify-center gap-2";
  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };
  const variants = {
    primary: 'bg-cyan text-void hover:brightness-110 hover:shadow-[0_0_24px_hsl(var(--cyan)/0.4)]',
    secondary: 'bg-transparent border border-cyan text-cyan hover:bg-cyan/10',
    ghost: 'bg-transparent text-text-secondary hover:bg-muted hover:text-foreground',
  };

  return (
    <button className={cn(base, sizes[size], variants[variant], className)} {...props}>
      {children}
    </button>
  );
};
