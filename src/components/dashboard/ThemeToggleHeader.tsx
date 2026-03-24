"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/providers/ThemeProvider";
import { useEffect, useState } from "react";

type Size = "sm" | "md";

const sizeClass: Record<Size, string> = {
  sm: "h-9 w-9 min-h-11 min-w-11",
  md: "h-9 w-9 min-h-10 min-w-10",
};

/** Satu tombol: ikon matahari di mode gelap, bulan di mode terang. */
export function ThemeToggleHeader({ size = "md" }: { size?: Size }) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <span
        className={`inline-flex items-center justify-center rounded-lg bg-white/5 ${sizeClass[size]}`}
      />
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={`inline-flex shrink-0 items-center justify-center rounded-lg bg-white/5 text-amber-300 transition hover:bg-white/10 hover:text-amber-200 ${sizeClass[size]}`}
      aria-label={isDark ? "Mode siang" : "Mode malam"}
      title={isDark ? "Mode siang" : "Mode malam"}
    >
      {isDark ? (
        <Sun className="h-4 w-4" aria-hidden />
      ) : (
        <Moon className="h-4 w-4" aria-hidden />
      )}
    </button>
  );
}
