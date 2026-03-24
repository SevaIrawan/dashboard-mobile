"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Building2, Menu, X } from "lucide-react";
import { LogoutButton } from "@/components/dashboard/LogoutButton";
import { SITE_MARKET_FLAG_PATHS } from "@/lib/branding/site";
import type { SingleMarketCode } from "@/lib/auth/role-permissions";
import type { MarketCode } from "@/lib/markets/dashboard-data";
import {
  MARKET_DRAWER_ITEMS,
  marketCodeFromPathname,
  marketDrawerHref,
} from "@/lib/markets/nav";

function formatHeaderTimestamp(date: Date): string {
  // Pakai timezone Malaysia (GMT+8) agar konsisten dengan request.
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Kuala_Lumpur",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).formatToParts(date);
  const map = Object.fromEntries(parts.map((p) => [p.type, p.value]));
  const yy = map.year ?? "0000";
  const mm = map.month ?? "00";
  const dd = map.day ?? "00";
  const hh = map.hour ?? "00";
  const mi = map.minute ?? "00";
  const ss = map.second ?? "00";
  return `${yy}-${mm}-${dd} ${hh}:${mi}:${ss}`;
}

export function MobileHeaderMock({
  marketLabel,
  username,
  marketCode,
  allowedMarketCodes,
  companyName,
  logoSrc,
  dataUpdateLabel,
}: {
  marketLabel: string;
  username: string;
  marketCode: MarketCode;
  /** Market yang boleh dipilih di drawer (sesuai role). */
  allowedMarketCodes: SingleMarketCode[];
  companyName: string;
  /** Path di `public/`, mis. `/brand/nexmax-logo.png` */
  logoSrc: string;
  /** Sudah diformat di server, mis. "24 Mar 2026"; null jika tidak ada data */
  dataUpdateLabel: string | null;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [menuOpen, setMenuOpen] = useState(false);
  const [logoFailed, setLogoFailed] = useState(false);
  const [flagFailed, setFlagFailed] = useState(false);
  const [flagVariantIndex, setFlagVariantIndex] = useState(0);
  const [now, setNow] = useState("");
  const activeCode = marketCodeFromPathname(pathname);
  const allowed = new Set(allowedMarketCodes);
  const drawerItems = MARKET_DRAWER_ITEMS.filter((item) =>
    allowed.has(item.code),
  );
  const primaryFlagSrc =
    SITE_MARKET_FLAG_PATHS[marketCode] ?? SITE_MARKET_FLAG_PATHS.overall;
  const flagCandidates = [
    primaryFlagSrc,
    primaryFlagSrc.replace("/Brand/", "/brand/"),
    primaryFlagSrc.replace("flag-", ""),
    primaryFlagSrc.replace("/Brand/flag-", "/Brand/"),
    primaryFlagSrc.replace("/Brand/", "/brand/").replace("flag-", ""),
    primaryFlagSrc.replace(".png", ".webp"),
    primaryFlagSrc.replace(".png", ".svg"),
  ];
  const flagSrc = flagCandidates[Math.min(flagVariantIndex, flagCandidates.length - 1)];

  useEffect(() => {
    setLogoFailed(false);
  }, [logoSrc]);

  useEffect(() => {
    setFlagFailed(false);
    setFlagVariantIndex(0);
  }, [primaryFlagSrc]);

  useEffect(() => {
    setNow(formatHeaderTimestamp(new Date()));
    const id = window.setInterval(() => {
      setNow(formatHeaderTimestamp(new Date()));
    }, 1000);
    return () => window.clearInterval(id);
  }, []);

  const closeMenu = useCallback(() => setMenuOpen(false), []);

  useEffect(() => {
    if (!menuOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [menuOpen]);

  useEffect(() => {
    if (!menuOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") closeMenu();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen, closeMenu]);

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/95 px-3 py-2 backdrop-blur-sm dark:border-slate-700 dark:bg-[#0f172a]/95">
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="inline-flex min-h-10 min-w-10 items-center justify-center rounded-xl bg-slate-100/70 text-slate-600 dark:bg-slate-800/70 dark:text-slate-300"
            aria-label="Buka menu market"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(true)}
          >
            <Menu className="h-4 w-4" />
          </button>

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">
              {marketLabel}
            </p>
            <p className="truncate text-[11px] text-slate-500 dark:text-slate-400">
              {now}
            </p>
          </div>

          <p className="max-w-[72px] truncate text-[11px] font-medium text-slate-500 dark:text-slate-300">
            {username}
          </p>

          <div className="ml-auto inline-flex h-8 w-8 items-center justify-center overflow-hidden rounded-full border border-white/70 bg-white dark:bg-slate-900">
            {flagFailed ? (
              <span className="text-sm" aria-hidden>
                🇲🇾
              </span>
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={flagSrc}
                alt=""
                className="h-full w-full object-cover"
                onError={() => {
                  if (flagVariantIndex < flagCandidates.length - 1) {
                    setFlagVariantIndex((prev) => prev + 1);
                    return;
                  }
                  setFlagFailed(true);
                }}
              />
            )}
          </div>

        </div>
      </header>

      {menuOpen ? (
        <>
          <button
            type="button"
            className="fixed inset-0 z-[70] cursor-default border-0 bg-black/70 p-0"
            aria-label="Tutup menu"
            onClick={closeMenu}
          />
          <div
            className="pointer-events-none fixed top-0 bottom-0 left-[max(0px,calc(50vw-min(50vw,215px)))] z-[80] w-[min(100vw,430px)]"
            role="dialog"
            aria-modal="true"
            aria-label="Pilih market"
          >
            <aside
              className="pointer-events-auto absolute left-0 top-0 flex h-full w-[88%] max-w-[20rem] flex-col border-r border-white/15 bg-[#1a222d] pb-[max(env(safe-area-inset-bottom),8px)] pl-[max(env(safe-area-inset-left),0px)] pt-0 shadow-2xl"
              style={{ WebkitOverflowScrolling: "touch" }}
            >
              <div className="flex items-start gap-2 border-b border-white/10 px-2.5 pb-3 pt-[max(env(safe-area-inset-top),12px)] sm:px-3">
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-amber-400/80 bg-[#131820]">
                    {logoFailed ? (
                      <Building2 className="h-6 w-6 text-amber-200/90" aria-hidden />
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={logoSrc}
                        alt=""
                        className="h-full w-full object-contain p-1"
                        onError={() => setLogoFailed(true)}
                      />
                    )}
                  </div>
                  <div className="min-w-0 pr-1">
                    <p className="truncate text-base font-semibold tracking-tight text-white">
                      {companyName}
                    </p>
                    {dataUpdateLabel ? (
                      <p className="mt-0.5 truncate text-[11px] text-white/60">
                        Update:{" "}
                        <span className="font-semibold text-white/85">
                          {dataUpdateLabel}
                        </span>
                      </p>
                    ) : null}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={closeMenu}
                  className="inline-flex min-h-10 min-w-10 shrink-0 touch-manipulation items-center justify-center rounded-xl border border-white/15 bg-white/[0.06] text-white/90 transition hover:bg-white/10 hover:text-white active:opacity-90"
                  aria-label="Tutup menu"
                >
                  <X className="h-5 w-5" strokeWidth={2} aria-hidden />
                </button>
              </div>
              <nav className="flex-1 overflow-y-auto px-3 py-3" aria-label="Market">
                <ul className="space-y-1">
                  {drawerItems.map((item) => {
                    const href = marketDrawerHref(item.path, searchParams);
                    const active = item.code === activeCode;
                    return (
                      <li key={item.code}>
                        <Link
                          href={href}
                          onClick={closeMenu}
                          className={`block rounded-xl px-3 py-3 text-sm font-semibold transition ${
                            active
                              ? "bg-[#243042] text-amber-300"
                              : "text-slate-200 hover:bg-white/[0.06] hover:text-white"
                          }`}
                        >
                          {item.label}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </nav>
              <div className="mt-auto border-t border-white/10 px-4 py-3">
                <LogoutButton className="w-full justify-center" />
              </div>
            </aside>
          </div>
        </>
      ) : null}
    </>
  );
}
