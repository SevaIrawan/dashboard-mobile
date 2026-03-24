"use client";

import { EllipsisVertical } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { CompanyBranding } from "@/lib/dashboard/types";
import { LogoutButton } from "@/components/dashboard/LogoutButton";
import { ThemeToggleHeader } from "@/components/dashboard/ThemeToggleHeader";

type Props = {
  branding: CompanyBranding | null;
};

/** Satu pola untuk semua lebar layar: tema + menu ⋮ (Welcome / bendera / Logout) — tidak melebar seperti toolbar desktop. */
export function HeaderToolbar({ branding }: Props) {
  const user = branding?.welcome_user_label?.trim() || "admin";
  const flag = branding?.locale_flag_emoji?.trim() || "🇲🇾";
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onPointerDown(e: PointerEvent) {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, []);

  return (
    <div className="relative flex shrink-0 items-center gap-1.5">
      <ThemeToggleHeader size="sm" />
      <div className="relative" ref={wrapRef}>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg border border-white/15 bg-white/5 text-white transition hover:bg-white/10"
          aria-expanded={open}
          aria-haspopup="menu"
          aria-label="Menu akun"
        >
          <EllipsisVertical className="h-5 w-5" />
        </button>
        {open ? (
          <div
            className="absolute right-0 top-[calc(100%+6px)] z-[60] w-[min(calc(100vw-1.5rem),16rem)] rounded-xl border border-white/15 bg-[#1a222d] p-3 shadow-2xl ring-1 ring-black/40"
            role="menu"
          >
            <p className="border-b border-white/10 pb-2 text-sm text-white">
              <span className="text-white/70">Welcome, </span>
              <span className="font-semibold">{user}</span>
            </p>
            <div className="flex items-center gap-2 py-2 text-sm text-white/90">
              <span
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/5 text-lg"
                aria-hidden
              >
                {flag}
              </span>
              <span className="text-xs text-white/60">Locale</span>
            </div>
            <div className="pt-1">
              <LogoutButton className="w-full justify-center" />
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
