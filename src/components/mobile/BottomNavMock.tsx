"use client";

import { useEffect, useRef, useState } from "react";
import {
  BarChart3,
  ChevronDown,
  House,
  MessageCircle,
  Settings,
  Users,
  X,
} from "lucide-react";
import { useTheme } from "@/components/providers/ThemeProvider";

const items = [
  { id: "dashboard", label: "Dashboard", icon: House },
  { id: "orders", label: "Orders", icon: BarChart3 },
  { id: "customers", label: "Customers", icon: Users },
  { id: "message", label: "Message", icon: MessageCircle },
  { id: "settings", label: "Settings", icon: Settings },
] as const;

export function BottomNavMock() {
  const [active, setActive] = useState<(typeof items)[number]["id"]>("dashboard");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const settingsRef = useRef<HTMLDivElement | null>(null);
  const { theme, setTheme } = useTheme();
  const [themeSelectOpen, setThemeSelectOpen] = useState(false);

  function closeSettings() {
    setSettingsOpen(false);
    setThemeSelectOpen(false);
    setActive("dashboard");
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") closeSettings();
    }
    function onClickOutside(e: MouseEvent) {
      if (!settingsRef.current) return;
      if (!settingsRef.current.contains(e.target as Node)) closeSettings();
    }
    if (settingsOpen) {
      window.addEventListener("keydown", onKey);
      document.addEventListener("mousedown", onClickOutside);
    }
    return () => {
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClickOutside);
    };
  }, [settingsOpen]);

  return (
    <nav
      className="sticky bottom-0 z-30 border-t border-slate-200/80 bg-white/95 px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur-sm dark:border-slate-700 dark:bg-[#0f172a]/95"
      aria-label="Bottom navigation"
    >
      <ul className="grid grid-cols-5 gap-1">
        {items.map((item) => {
          const Icon = item.icon;
          const selected =
            item.id === "settings"
              ? settingsOpen || active === item.id
              : active === item.id;
          return (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => {
                  if (item.id === "settings") {
                    setSettingsOpen((prev) => !prev);
                    setThemeSelectOpen(false);
                    setActive("settings");
                    return;
                  }
                  closeSettings();
                  setActive(item.id);
                }}
                className={`flex w-full flex-col items-center gap-1 rounded-xl px-1 py-1.5 text-[10px] font-medium ${
                  selected
                    ? "text-[#0d244a] dark:text-amber-300"
                    : "text-slate-400 dark:text-slate-400"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="truncate">{item.label}</span>
              </button>
            </li>
          );
        })}
      </ul>

      {settingsOpen ? (
        <div className="fixed inset-0 z-40" role="presentation">
          <button
            type="button"
            className="absolute inset-0 h-full w-full cursor-default border-0 bg-black/35 p-0"
            aria-label="Tutup pengaturan"
            onClick={closeSettings}
          />
          <div
            ref={settingsRef}
            className="absolute bottom-[max(56px,env(safe-area-inset-bottom)+52px)] left-2 right-2 rounded-2xl border border-slate-200 bg-white p-3 shadow-2xl dark:border-slate-700 dark:bg-[#0f172a]"
          >
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300">
                Settings
              </p>
              <button
                type="button"
                onClick={closeSettings}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                aria-label="Tutup settings"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-2.5 dark:border-slate-700 dark:bg-slate-900/70">
              <button
                type="button"
                onClick={() => setThemeSelectOpen((prev) => !prev)}
                className="flex w-full items-center justify-between rounded-lg px-2 py-2 text-left hover:bg-white/70 dark:hover:bg-slate-800/70"
                aria-expanded={themeSelectOpen}
              >
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-100">
                  Theme
                </span>
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase text-slate-500 dark:text-slate-300">
                  {theme}
                  <ChevronDown
                    className={`h-3.5 w-3.5 transition-transform ${
                      themeSelectOpen ? "rotate-180" : ""
                    }`}
                  />
                </span>
              </button>

              {themeSelectOpen ? (
                <div className="mt-1 space-y-1 rounded-lg border border-slate-200 bg-white p-1 dark:border-slate-700 dark:bg-slate-800">
                  {(["light", "dark", "system"] as const).map((name) => (
                    <button
                      key={name}
                      type="button"
                      onClick={() => {
                        setTheme(name);
                        setThemeSelectOpen(false);
                      }}
                      className={`flex w-full items-center justify-between rounded-md px-2 py-2 text-sm ${
                        theme === name
                          ? "bg-[#0d4aa3] text-white"
                          : "text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-700"
                      }`}
                    >
                      <span className="capitalize">{name}</span>
                      {theme === name ? <span className="text-xs">Active</span> : null}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>

          </div>
        </div>
      ) : null}
    </nav>
  );
}
