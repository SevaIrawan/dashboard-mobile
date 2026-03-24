"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { NetProfitLineKpi } from "@/lib/markets/dashboard-data";

function formatInt(v: number): string {
  return Math.round(v).toLocaleString("id-ID");
}

function formatPct(v: number): string {
  return `${v >= 0 ? "+" : ""}${v.toFixed(1)}%`;
}

type Props = {
  items: NetProfitLineKpi[];
};

export function NetProfitLineCarousel({ items }: Props) {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [index, setIndex] = useState(0);
  const cardWidth = 118;

  const maxIndex = Math.max(items.length - 1, 0);

  function scrollToIndex(nextIndex: number) {
    const idx = Math.max(0, Math.min(maxIndex, nextIndex));
    setIndex(idx);
    if (!trackRef.current) return;
    trackRef.current.scrollTo({
      left: idx * (cardWidth + 8),
      behavior: "smooth",
    });
  }

  useEffect(() => {
    if (items.length <= 3) return;
    const id = window.setInterval(() => {
      setIndex((prev) => {
        const next = prev >= maxIndex ? 0 : prev + 1;
        if (trackRef.current) {
          trackRef.current.scrollTo({
            left: next * (cardWidth + 8),
            behavior: "smooth",
          });
        }
        return next;
      });
    }, 3000);
    return () => window.clearInterval(id);
  }, [items.length, maxIndex]);

  if (items.length === 0) {
    return (
      <p className="rounded-2xl border border-slate-200/50 bg-slate-50/50 px-3 py-4 text-center text-xs text-slate-500 dark:border-slate-700 dark:bg-slate-800/30 dark:text-slate-400">
        Tidak ada data line untuk periode ini.
      </p>
    );
  }

  return (
    <div>
      <div className="relative">
        <div
          ref={trackRef}
          className="flex snap-x snap-mandatory gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {items.map((item) => {
            const positive = item.comparisonPct >= 0;
            return (
              <article
                key={item.label}
                className="w-[118px] shrink-0 snap-start rounded-2xl border border-slate-200 bg-slate-50 p-2.5 dark:border-slate-700 dark:bg-slate-800"
              >
                <p className="truncate text-[11px] font-semibold uppercase text-slate-500 dark:text-slate-300">
                  {item.label}
                </p>
                <p className="mt-1 text-[1.35rem] font-bold leading-tight text-slate-900 dark:text-white">
                  {formatInt(item.value)}
                </p>
                <div className="mt-2 h-1.5 rounded-full bg-slate-200 dark:bg-slate-700">
                  <div
                    className={`h-full rounded-full ${
                      positive ? "bg-emerald-500" : "bg-red-500"
                    }`}
                    style={{ width: `${item.barPercent}%` }}
                  />
                </div>
                <p
                  className={`mt-1 text-[10px] font-semibold ${
                    positive ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"
                  }`}
                >
                  {formatPct(item.comparisonPct)}
                </p>
              </article>
            );
          })}
        </div>
      </div>

      {items.length > 3 ? (
        <div className="mt-2 flex justify-end gap-1.5">
          <button
            type="button"
            onClick={() => scrollToIndex(index - 1)}
            className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-slate-300 text-slate-600 dark:border-slate-600 dark:text-slate-300"
            aria-label="Scroll kiri"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => scrollToIndex(index + 1)}
            className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-slate-300 text-slate-600 dark:border-slate-600 dark:text-slate-300"
            aria-label="Scroll kanan"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      ) : null}
    </div>
  );
}
