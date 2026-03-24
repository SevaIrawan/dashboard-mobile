"use client";

import { BarChart3, House, MessageCircle, Settings, Users } from "lucide-react";
import { useState } from "react";

const items = [
  { id: "dashboard", label: "Dashboard", icon: House },
  { id: "orders", label: "Orders", icon: BarChart3 },
  { id: "customers", label: "Customers", icon: Users },
  { id: "message", label: "Message", icon: MessageCircle },
  { id: "settings", label: "Settings", icon: Settings },
] as const;

export function BottomNavMock() {
  const [active, setActive] = useState<(typeof items)[number]["id"]>("dashboard");

  return (
    <nav
      className="sticky bottom-0 z-30 border-t border-slate-200/80 bg-white/95 px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur-sm dark:border-slate-700 dark:bg-[#0f172a]/95"
      aria-label="Bottom navigation"
    >
      <ul className="grid grid-cols-5 gap-1">
        {items.map((item) => {
          const Icon = item.icon;
          const selected = active === item.id;
          return (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => setActive(item.id)}
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
    </nav>
  );
}
