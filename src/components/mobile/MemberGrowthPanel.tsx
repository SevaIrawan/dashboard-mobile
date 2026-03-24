"use client";

import { useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Dot } from "lucide-react";
import type { MemberBrandKpi } from "@/lib/markets/dashboard-data";
import {
  NetProfitLineCarousel,
  type NetProfitLineCarouselHandle,
} from "@/components/mobile/NetProfitLineCarousel";

type ViewMode = "growth" | "active" | "new";

type Props = {
  activeTotal: number;
  newDepositorTotal: number;
  pureMemberTotal: number;
  activeBrands: MemberBrandKpi[];
  newDepositorBrands: MemberBrandKpi[];
};

function formatInt(v: number): string {
  return Math.round(v).toLocaleString("id-ID");
}

export function MemberGrowthPanel({
  activeTotal,
  newDepositorTotal,
  pureMemberTotal,
  activeBrands,
  newDepositorBrands,
}: Props) {
  const [mode, setMode] = useState<ViewMode>("growth");
  const brandCarouselRef = useRef<NetProfitLineCarouselHandle>(null);
  const title =
    mode === "growth"
      ? "Member Growth"
      : mode === "active"
        ? "Active Member"
        : "New Depositor";
  const total = Math.max(activeTotal + newDepositorTotal + pureMemberTotal, 1);
  const activePct = (activeTotal / total) * 100;
  const newPct = (newDepositorTotal / total) * 100;
  const purePct = (pureMemberTotal / total) * 100;
  const selected = mode === "new" ? newDepositorBrands : activeBrands;
  const brandCarouselCanScroll = selected.length > 2;

  const donutStyle = useMemo(
    () => ({
      background: `conic-gradient(#2563eb 0 ${activePct}%, #f97316 ${activePct}% ${activePct + newPct}%, #94a3b8 ${activePct + newPct}% 100%)`,
    }),
    [activePct, newPct],
  );

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <div>
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white">{title}</h2>
          {mode === "growth" ? (
            <p className="mt-0.5 text-[11px] font-medium text-slate-500 dark:text-slate-300">
              Follow period Net Profit
            </p>
          ) : (
            <div className="mt-0.5 flex min-h-[28px] items-center justify-between gap-2">
              <p className="min-w-0 flex-1 text-[11px] font-medium leading-snug text-slate-500 dark:text-slate-300">
                Follow period Net Profit
              </p>
              <div
                className={`flex shrink-0 items-center gap-1.5 ${!brandCarouselCanScroll ? "opacity-40" : ""}`}
              >
                <button
                  type="button"
                  disabled={!brandCarouselCanScroll}
                  onClick={() => brandCarouselRef.current?.scrollPrev()}
                  className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-slate-300 text-slate-600 disabled:pointer-events-none dark:border-slate-600 dark:text-slate-300"
                  aria-label="Scroll kiri"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  disabled={!brandCarouselCanScroll}
                  onClick={() => brandCarouselRef.current?.scrollNext()}
                  className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-slate-300 text-slate-600 disabled:pointer-events-none dark:border-slate-600 dark:text-slate-300"
                  aria-label="Scroll kanan"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {mode === "growth" ? (
          <div className="mt-4 grid grid-cols-[1fr_auto] gap-4">
            <div className="flex items-center justify-center">
              <div className="relative h-36 w-36 rounded-full" style={donutStyle}>
                <div className="absolute inset-[18%] rounded-full bg-white dark:bg-slate-900" />
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <p className="text-3xl font-bold text-slate-900 dark:text-white">{formatInt(activeTotal)}</p>
                  <p className="text-[11px] font-medium text-slate-500 dark:text-slate-300">Active</p>
                </div>
              </div>
            </div>
            <div className="space-y-1.5 text-xs">
              <p className="flex items-center gap-1.5 text-slate-700 dark:text-slate-100">
                <Dot className="h-4 w-4 text-blue-500" /> Active Member: {formatInt(activeTotal)}
              </p>
              <p className="flex items-center gap-1.5 text-slate-700 dark:text-slate-100">
                <Dot className="h-4 w-4 text-orange-500" /> New Depositor: {formatInt(newDepositorTotal)}
              </p>
              <p className="flex items-center gap-1.5 text-slate-700 dark:text-slate-100">
                <Dot className="h-4 w-4 text-slate-400" /> Pure Member: {formatInt(pureMemberTotal)}
              </p>
              <p className="pt-1 text-[11px] text-slate-500 dark:text-slate-300">
                Mix: A {activePct.toFixed(0)}% / N {newPct.toFixed(0)}% / P {purePct.toFixed(0)}%
              </p>
            </div>
          </div>
        ) : (
          <div className="mt-2 min-h-[8.5rem]">
            {selected.length > 0 ? (
              <NetProfitLineCarousel
                ref={brandCarouselRef}
                items={selected}
                omitControls
              />
            ) : (
              <p className="flex min-h-[8.5rem] items-center text-xs text-slate-500 dark:text-slate-400">
                Belum ada data brand.
              </p>
            )}
          </div>
        )}

        <div className="mt-4 flex items-center gap-2">
          {(
            [
              { id: "growth", label: "Member Growth" },
              { id: "active", label: "Active Member" },
              { id: "new", label: "New Depositor" },
            ] as const
          ).map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => {
                setMode(opt.id);
              }}
              className={`min-w-0 flex-1 whitespace-nowrap rounded-full px-2 py-1.5 text-[11px] font-semibold transition ${
                mode === opt.id
                  ? "bg-[#0d4aa3] text-white ring-1 ring-[#6da8ff]/70"
                  : "border border-slate-300 text-slate-600 dark:border-slate-600 dark:text-slate-300"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </section>
  );
}
