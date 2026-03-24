"use client";

import { Menu } from "lucide-react";
import type { CompanyBranding } from "@/lib/dashboard/types";
import { HeaderClock } from "@/components/dashboard/HeaderClock";
import { HeaderToolbar } from "@/components/dashboard/HeaderToolbar";

type Props = {
  branding: CompanyBranding | null;
  onOpenSidebar?: () => void;
  /** Untuk aksesibilitas: menu drawer sedang terbuka */
  navOpen?: boolean;
};

export function DashboardHeader({
  branding,
  onOpenSidebar,
  navOpen = false,
}: Props) {
  const title =
    branding?.header_title?.trim() ||
    branding?.company_name ||
    "Dashboard";

  return (
    <header className="sticky top-0 z-30 flex min-h-[52px] items-center gap-2 border-b border-white/10 bg-[#1a1e2e] px-2 py-2 sm:gap-3 sm:px-3 sm:py-2.5 lg:px-4">
      <button
        type="button"
        className="inline-flex min-h-11 min-w-11 shrink-0 touch-manipulation select-none items-center justify-center rounded-lg border border-white/15 bg-white/5 text-white shadow-sm active:opacity-80"
        onClick={onOpenSidebar}
        aria-label="Buka menu navigasi"
        aria-expanded={navOpen}
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className="min-w-0 flex-1 pr-1">
        <p className="truncate text-sm font-semibold leading-tight text-white sm:text-base">
          {title}
        </p>
        <HeaderClock />
      </div>

      <HeaderToolbar branding={branding} />
    </header>
  );
}
