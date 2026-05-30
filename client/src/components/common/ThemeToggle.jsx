import { Moon, Sun } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

export function ThemeToggle({ compact = false }) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  if (compact) {
    return (
      <button
        onClick={toggleTheme}
        className="w-8 h-8 rounded-xl flex items-center justify-center hover:bg-surface-2 text-text-muted hover:text-text-primary transition-all"
        title={`Switch to ${isDark ? "light" : "dark"} mode`}
      >
        {isDark ? <Sun size={15} /> : <Moon size={15} />}
      </button>
    );
  }

  return (
    <button
      onClick={toggleTheme}
      className={`
        relative w-14 h-7 rounded-full transition-colors duration-300
        ${isDark ? "bg-violet-600" : "bg-slate-200"}
      `}
      title={`Switch to ${isDark ? "light" : "dark"} mode`}
    >
      <span
        className={`
          absolute top-1 w-5 h-5 rounded-full bg-white shadow-sm
          flex items-center justify-center transition-all duration-300
          ${isDark ? "left-8" : "left-1"}
        `}
      >
        {isDark
          ? <Moon size={10} className="text-violet-600" />
          : <Sun size={10} className="text-amber-500" />
        }
      </span>
    </button>
  );
}