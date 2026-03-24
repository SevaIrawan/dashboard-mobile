"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/providers/ThemeProvider";
import { useEffect, useState } from "react";

const modes = [
  { id: "light" as const, label: "Siang", icon: Sun },
  { id: "dark" as const, label: "Malam", icon: Moon },
  { id: "system" as const, label: "Auto", icon: Monitor },
];

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div
        className="h-9 w-full max-w-[220px] rounded-full bg-muted/30 dark:bg-white/5"
        aria-hidden
      />
    );
  }

  return (
    <div
      className="inline-flex rounded-full border border-border bg-card p-0.5 shadow-sm dark:border-white/10 dark:bg-zinc-900/80"
      role="group"
      aria-label="Mode tampilan"
    >
      {modes.map(({ id, label, icon: Icon }) => {
        const isSelected =
          id === "system"
            ? theme === "system"
            : theme === id;

        return (
          <button
            key={id}
            type="button"
            onClick={() => setTheme(id)}
            className={`flex min-w-0 flex-1 items-center justify-center gap-1 rounded-full px-2.5 py-1.5 text-[11px] font-medium transition-colors ${
              isSelected
                ? "bg-foreground text-background shadow-sm dark:bg-amber-400 dark:text-zinc-950"
                : "text-muted-foreground hover:text-foreground"
            }`}
            title={label}
          >
            <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden />
            <span className="hidden sm:inline">{label}</span>
          </button>
        );
      })}
    </div>
  );
}
