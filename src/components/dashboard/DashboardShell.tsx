"use client";

import { useEffect, useState } from "react";
import { AppSidebar } from "@/components/dashboard/AppSidebar";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import type { CompanyBranding, NavMenuTree } from "@/lib/dashboard/types";

type Props = {
  branding: CompanyBranding | null;
  menuTree: NavMenuTree[];
  children: React.ReactNode;
};

/**
 * Menu = drawer full viewport (portal). Lebar konten dibatasi parent layout (~430px).
 */
export function DashboardShell({ branding, menuTree, children }: Props) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!sidebarOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [sidebarOpen]);

  useEffect(() => {
    if (!sidebarOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setSidebarOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [sidebarOpen]);

  return (
    <div className="relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-background">
      <div
        className={`absolute inset-0 z-40 transition-opacity duration-200 ease-out ${
          sidebarOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        aria-hidden={!sidebarOpen}
      >
        <div
          className={`absolute inset-0 transition-opacity duration-200 ease-out ${
            sidebarOpen ? "opacity-100" : "opacity-0"
          }`}
        >
          <button
            type="button"
            className="absolute inset-0 block h-full w-full cursor-default border-0 bg-black/70 p-0"
            aria-label="Tutup menu"
            onClick={() => setSidebarOpen(false)}
          />
        </div>
        <aside
          role="dialog"
          aria-modal="true"
          aria-label="Navigasi"
          className={`absolute left-0 top-0 z-50 flex h-full w-[88%] max-w-[20rem] flex-col border-r border-white/15 bg-[#1a222d] shadow-2xl transition-transform duration-250 ease-out will-change-transform ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
          style={{
            paddingTop: "max(env(safe-area-inset-top), 8px)",
            paddingBottom: "max(env(safe-area-inset-bottom), 8px)",
            WebkitOverflowScrolling: "touch",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <AppSidebar
            branding={branding}
            menuTree={menuTree}
            onNavigate={() => setSidebarOpen(false)}
          />
        </aside>
      </div>

      <DashboardHeader
        branding={branding}
        navOpen={sidebarOpen}
        onOpenSidebar={() => setSidebarOpen(true)}
      />
      <div className="flex w-full min-w-0 flex-1 overflow-x-hidden overflow-y-auto px-3 py-3 pb-[max(12px,env(safe-area-inset-bottom))] touch-pan-y sm:px-4 sm:py-4">
        {children}
      </div>
    </div>
  );
}
