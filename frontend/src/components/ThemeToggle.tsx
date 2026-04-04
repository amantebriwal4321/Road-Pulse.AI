import { Sun, Moon } from "lucide-react";
import { useThemeStore } from "@/stores/themeStore";

export const ThemeToggle = () => {
  const { theme, toggle } = useThemeStore();
  return (
    <button
      onClick={toggle}
      className="glass-card p-3 rounded-full cursor-pointer transition-all hover:shadow-[0_0_16px_hsl(var(--cyan)/0.3)]"
      aria-label="Toggle theme"
    >
      {theme === 'dark' ? <Sun className="w-5 h-5 text-cyan" /> : <Moon className="w-5 h-5 text-cyan" />}
    </button>
  );
};
