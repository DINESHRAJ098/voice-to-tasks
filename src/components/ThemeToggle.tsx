import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch — only render the icon after mount.
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    // Render a placeholder of the same size to avoid layout shift.
    return (
      <Button variant="ghost" size="icon" className="size-8 opacity-0" disabled>
        <Sun className="size-4" />
      </Button>
    );
  }

  const isDark = theme === "dark";

  return (
    <Button
      variant="ghost"
      size="icon"
      className="size-8 text-muted-foreground hover:text-foreground transition-colors"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
    >
      {isDark ? (
        <Sun className="size-4 transition-transform duration-200 rotate-0 scale-100" />
      ) : (
        <Moon className="size-4 transition-transform duration-200" />
      )}
    </Button>
  );
}
