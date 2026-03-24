"use client";

import { useEffect, useMemo, useRef, useState, type TouchEvent } from "react";
import { Bar, BarChart, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Last7DaysBrandPoint } from "@/lib/markets/dashboard-data";

type MetricKey =
  | "avg_transaction_value"
  | "deposit_cases"
  | "deposit_amount"
  | "withdraw_cases"
  | "withdraw_amount"
  | "winrate";

type KpiDef = {
  key: MetricKey;
  title: string;
  chart: "line" | "bar";
  color: string;
  isPercent?: boolean;
};

const KPI_DEFS: KpiDef[] = [
  {
    key: "avg_transaction_value",
    title: "Average Transaction Value",
    chart: "line",
    color: "#3b82f6",
  },
  { key: "deposit_cases", title: "Deposit Cases", chart: "bar", color: "#3b82f6" },
  { key: "deposit_amount", title: "Deposit Amount", chart: "line", color: "#3b82f6" },
  { key: "withdraw_cases", title: "Withdraw Cases", chart: "bar", color: "#f97316" },
  { key: "withdraw_amount", title: "Withdraw Amount", chart: "line", color: "#f97316" },
  { key: "winrate", title: "Winrate", chart: "line", color: "#f97316", isPercent: true },
];

type Props = {
  brands: string[];
  points: Last7DaysBrandPoint[];
  dateKeys: string[];
};

type ChartRow = { label: string; value: number };

function formatDayLabel(dateKey: string): string {
  const [y, m, d] = dateKey.split("-");
  if (!y || !m || !d) return dateKey;
  return `${d}/${m}`;
}

function formatValue(value: number, isPercent?: boolean): string {
  if (isPercent) return `${value.toFixed(2)}%`;
  return Math.round(value).toLocaleString("id-ID");
}

function metricValue(point: Last7DaysBrandPoint, metric: MetricKey): number {
  if (metric === "avg_transaction_value") {
    if (point.deposit_cases === 0) return 0;
    return point.deposit_amount / point.deposit_cases;
  }
  if (metric === "deposit_cases") return point.deposit_cases;
  if (metric === "deposit_amount") return point.deposit_amount;
  if (metric === "withdraw_cases") return point.withdraw_cases;
  if (metric === "withdraw_amount") return point.withdraw_amount;
  if (point.deposit_amount === 0) return 0;
  return (point.net_profit / point.deposit_amount) * 100;
}

export function BrandKpiCarousel({ brands, points, dateKeys }: Props) {
  const idleTimerRef = useRef<number | null>(null);
  const [brand, setBrand] = useState(brands[0] ?? "Unknown");
  const [index, setIndex] = useState(0);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [autoplayEnabled, setAutoplayEnabled] = useState(false);

  useEffect(() => {
    setBrand((prev) => (brands.includes(prev) ? prev : (brands[0] ?? "Unknown")));
  }, [brands]);

  function armAutoplayAfterIdle() {
    setAutoplayEnabled(false);
    if (idleTimerRef.current) window.clearTimeout(idleTimerRef.current);
    idleTimerRef.current = window.setTimeout(() => {
      setAutoplayEnabled(true);
    }, 20000);
  }

  useEffect(() => {
    armAutoplayAfterIdle();
    return () => {
      if (idleTimerRef.current) window.clearTimeout(idleTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!autoplayEnabled) return;
    const id = window.setInterval(() => {
      setIndex((prev) => (prev >= KPI_DEFS.length - 1 ? 0 : prev + 1));
    }, 5000);
    return () => window.clearInterval(id);
  }, [autoplayEnabled]);

  const pointsByDate = useMemo(() => {
    const map = new Map<string, Last7DaysBrandPoint>();
    for (const row of points) {
      if (row.line !== brand) continue;
      map.set(row.date, row);
    }
    return map;
  }, [points, brand]);

  const activeDef = KPI_DEFS[index]!;
  const chartData: ChartRow[] = useMemo(
    () =>
      dateKeys.map((dateKey) => {
        const point = pointsByDate.get(dateKey) ?? {
          date: dateKey,
          line: brand,
          deposit_cases: 0,
          deposit_amount: 0,
          withdraw_cases: 0,
          withdraw_amount: 0,
          net_profit: 0,
        };
        return {
          label: formatDayLabel(dateKey),
          value: metricValue(point, activeDef.key),
        };
      }),
    [dateKeys, pointsByDate, brand, activeDef.key],
  );

  const latestValue = chartData.length > 0 ? chartData[chartData.length - 1]!.value : 0;

  function prevCard() {
    armAutoplayAfterIdle();
    setIndex((prev) => (prev <= 0 ? KPI_DEFS.length - 1 : prev - 1));
  }

  function nextCard() {
    armAutoplayAfterIdle();
    setIndex((prev) => (prev >= KPI_DEFS.length - 1 ? 0 : prev + 1));
  }

  function onTouchStart(e: TouchEvent<HTMLDivElement>) {
    armAutoplayAfterIdle();
    setTouchStartX(e.touches[0]?.clientX ?? null);
  }

  function onTouchEnd(e: TouchEvent<HTMLDivElement>) {
    const start = touchStartX;
    const end = e.changedTouches[0]?.clientX;
    setTouchStartX(null);
    if (start == null || end == null) return;
    const delta = end - start;
    if (Math.abs(delta) < 40) return;
    if (delta > 0) prevCard();
    if (delta < 0) nextCard();
  }

  if (brands.length === 0 || dateKeys.length === 0) {
    return (
      <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Data KPI belum tersedia.
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-semibold text-slate-900 dark:text-white">{activeDef.title}</p>
        <label className="sr-only" htmlFor="brand-picker">
          Pilih Brand
        </label>
        <select
          id="brand-picker"
          value={brand}
          onChange={(e) => {
            armAutoplayAfterIdle();
            setBrand(e.target.value);
          }}
          className="rounded-full border border-slate-300 bg-transparent px-3 py-1 text-[11px] font-semibold text-slate-800 outline-none dark:border-slate-500 dark:bg-[#0b1730] dark:text-white"
        >
          {brands.map((item) => (
            <option
              key={item}
              value={item}
              className="bg-white text-slate-900 dark:bg-[#0b1730] dark:text-white"
            >
              {item}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-1 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <p className="text-[11px] font-medium text-slate-600 dark:text-slate-200">Last 7 Days</p>
          <button
            type="button"
            onClick={prevCard}
            className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-slate-300 text-slate-600 dark:border-slate-600 dark:text-slate-300"
            aria-label="KPI sebelumnya"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={nextCard}
            className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-slate-300 text-slate-600 dark:border-slate-600 dark:text-slate-300"
            aria-label="KPI berikutnya"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div
        className="mt-3 rounded-2xl border border-slate-100 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800/60"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <p className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          {formatValue(latestValue, activeDef.isPercent)}
        </p>
        <div className="mt-2 h-44 w-full">
          <ResponsiveContainer width="100%" height="100%">
            {activeDef.chart === "line" ? (
              <LineChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 11, fill: "#cbd5e1" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis hide domain={["auto", "auto"]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#ffffff",
                    border: "1px solid #cbd5e1",
                    borderRadius: "10px",
                    color: "#0f172a",
                    fontSize: "12px",
                    fontWeight: 600,
                  }}
                  itemStyle={{ color: activeDef.color }}
                  labelStyle={{ color: "#334155", fontWeight: 700 }}
                  formatter={(v) => [formatValue(Number(v), activeDef.isPercent), activeDef.title]}
                  labelFormatter={(label) => `Tanggal ${label}`}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke={activeDef.color}
                  strokeWidth={2.25}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
              </LineChart>
            ) : (
              <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 11, fill: "#cbd5e1" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis hide domain={["auto", "auto"]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#ffffff",
                    border: "1px solid #cbd5e1",
                    borderRadius: "10px",
                    color: "#0f172a",
                    fontSize: "12px",
                    fontWeight: 600,
                  }}
                  itemStyle={{ color: activeDef.color }}
                  labelStyle={{ color: "#334155", fontWeight: 700 }}
                  formatter={(v) => [formatValue(Number(v), activeDef.isPercent), activeDef.title]}
                  labelFormatter={(label) => `Tanggal ${label}`}
                />
                <Bar dataKey="value" fill={activeDef.color} radius={[5, 5, 0, 0]} />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  );
}
