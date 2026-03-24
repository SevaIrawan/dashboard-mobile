"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { NetProfitLineKpi } from "@/lib/markets/dashboard-data";

export type NetProfitLineCarouselHandle = {
  scrollPrev: () => void;
  scrollNext: () => void;
};

function formatInt(v: number): string {
  return Math.round(v).toLocaleString("id-ID");
}

function formatPct(v: number): string {
  return `${v >= 0 ? "+" : ""}${v.toFixed(1)}%`;
}

type Props = {
  items: NetProfitLineKpi[];
  controlsAtTop?: boolean;
  /** Jangan render tombol panah di dalam carousel (pakai ref dari parent). */
  omitControls?: boolean;
  metaLabel?: string;
  metaComparison?: string;
  metaComparisonPositive?: boolean;
};

export const NetProfitLineCarousel = forwardRef<
  NetProfitLineCarouselHandle,
  Props
>(function NetProfitLineCarousel(
  {
    items,
    controlsAtTop = false,
    omitControls = false,
    metaLabel,
    metaComparison,
    metaComparisonPositive = true,
  },
  ref,
) {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const idleTimerRef = useRef<number | null>(null);
  const scrollRafRef = useRef<number | null>(null);
  const [index, setIndex] = useState(0);
  const [autoplayEnabled, setAutoplayEnabled] = useState(false);
  const maxIndex = Math.max(items.length - 2, 0);

  function scrollNodeToIndex(nextIndex: number) {
    const track = trackRef.current;
    if (!track) return;
    const cards = track.querySelectorAll("article");
    const target = cards.item(nextIndex) as HTMLElement | null;
    if (!target) return;
    track.scrollTo({
      left: target.offsetLeft,
      behavior: "smooth",
    });
  }

  function scrollToIndex(nextIndex: number) {
    const idx = Math.max(0, Math.min(maxIndex, nextIndex));
    setIndex(idx);
    scrollNodeToIndex(idx);
  }

  function armAutoplayAfterIdle() {
    setAutoplayEnabled(false);
    if (idleTimerRef.current) window.clearTimeout(idleTimerRef.current);
    idleTimerRef.current = window.setTimeout(() => {
      setAutoplayEnabled(true);
    }, 20000);
  }

  useImperativeHandle(
    ref,
    () => ({
      scrollPrev: () => {
        armAutoplayAfterIdle();
        setIndex((prev) => {
          const idx = Math.max(0, prev - 1);
          scrollNodeToIndex(idx);
          return idx;
        });
      },
      scrollNext: () => {
        armAutoplayAfterIdle();
        setIndex((prev) => {
          const idx = Math.min(maxIndex, prev + 1);
          scrollNodeToIndex(idx);
          return idx;
        });
      },
    }),
    [maxIndex],
  );

  function syncIndexFromScroll() {
    const track = trackRef.current;
    if (!track) return;
    const cards = track.querySelectorAll("article");
    if (cards.length === 0) return;

    let nearest = 0;
    let minDistance = Number.POSITIVE_INFINITY;
    const left = track.scrollLeft;
    cards.forEach((node, idx) => {
      const el = node as HTMLElement;
      const distance = Math.abs(el.offsetLeft - left);
      if (distance < minDistance) {
        minDistance = distance;
        nearest = idx;
      }
    });

    const next = Math.max(0, Math.min(maxIndex, nearest));
    setIndex(next);
  }

  useEffect(() => {
    armAutoplayAfterIdle();
    return () => {
      if (idleTimerRef.current) window.clearTimeout(idleTimerRef.current);
      if (scrollRafRef.current) window.cancelAnimationFrame(scrollRafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (items.length <= 2 || !autoplayEnabled) return;
    const id = window.setInterval(() => {
      setIndex((prev) => {
        const next = prev >= maxIndex ? 0 : prev + 1;
        scrollNodeToIndex(next);
        return next;
      });
    }, 3000);
    return () => window.clearInterval(id);
  }, [items.length, maxIndex, controlsAtTop, autoplayEnabled]);

  if (items.length === 0) {
    return (
      <p className="rounded-2xl border border-slate-200/50 bg-slate-50/50 px-3 py-4 text-center text-xs text-slate-500 dark:border-slate-700 dark:bg-slate-800/30 dark:text-slate-400">
        Tidak ada data line untuk periode ini.
      </p>
    );
  }

  return (
    <div>
      {controlsAtTop && !omitControls && items.length > 2 ? (
        <div className="mb-2 flex items-center justify-between gap-2">
          <div className="min-w-0">
            {metaLabel ? (
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                {metaLabel}
              </p>
            ) : null}
            {metaComparison ? (
              <p
                className={`mt-0.5 text-[11px] font-semibold ${
                  metaComparisonPositive
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-red-600 dark:text-red-400"
                }`}
              >
                {metaComparison}
              </p>
            ) : null}
          </div>
          <div className="flex justify-end gap-1.5">
            <button
              type="button"
              onClick={() => {
                armAutoplayAfterIdle();
                scrollToIndex(index - 1);
              }}
              className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-slate-300 text-slate-600 dark:border-slate-600 dark:text-slate-300"
              aria-label="Scroll kiri"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => {
                armAutoplayAfterIdle();
                scrollToIndex(index + 1);
              }}
              className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-slate-300 text-slate-600 dark:border-slate-600 dark:text-slate-300"
              aria-label="Scroll kanan"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      ) : null}

      <div className="relative">
        <div
          ref={trackRef}
          className="flex snap-x snap-mandatory gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          onTouchStart={armAutoplayAfterIdle}
          onPointerDown={armAutoplayAfterIdle}
          onScroll={() => {
            if (scrollRafRef.current) window.cancelAnimationFrame(scrollRafRef.current);
            scrollRafRef.current = window.requestAnimationFrame(() => {
              syncIndexFromScroll();
            });
          }}
        >
          {items.map((item) => {
            const positive = item.comparisonPct >= 0;
            return (
              <article
                key={item.label}
                className="w-[calc((100%-0.5rem)/2)] min-w-[calc((100%-0.5rem)/2)] shrink-0 snap-start rounded-2xl border border-slate-200 bg-slate-50 p-2.5 dark:border-slate-700 dark:bg-slate-800"
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

      {!controlsAtTop && !omitControls && items.length > 2 ? (
        <div className="mt-2 flex justify-end gap-1.5">
          <button
            type="button"
            onClick={() => {
              armAutoplayAfterIdle();
              scrollToIndex(index - 1);
            }}
            className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-slate-300 text-slate-600 dark:border-slate-600 dark:text-slate-300"
            aria-label="Scroll kiri"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => {
              armAutoplayAfterIdle();
              scrollToIndex(index + 1);
            }}
            className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-slate-300 text-slate-600 dark:border-slate-600 dark:text-slate-300"
            aria-label="Scroll kanan"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      ) : null}
    </div>
  );
});
