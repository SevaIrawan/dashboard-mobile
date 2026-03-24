"use client";

import { useTheme } from "@/components/providers/ThemeProvider";
import { useEffect, useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export type ChartPoint = { label: string; value: number };

type PortfolioChartProps = {
  data: ChartPoint[];
  title?: string;
};

export function PortfolioChart({
  data,
  title = "Performa 6 bulan",
}: PortfolioChartProps) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && resolvedTheme === "dark";

  const palette = useMemo(
    () =>
      isDark
        ? {
            stroke: "#fbbf24",
            fillTop: "#fbbf24",
            fillOpacity: 0.35,
            grid: "rgba(255,255,255,0.06)",
            tick: "#71717a",
            tooltipBg: "rgba(15, 23, 42, 0.95)",
            tooltipBorder: "rgba(255,255,255,0.1)",
            tooltipFg: "#f4f4f5",
            tooltipMuted: "#a1a1aa",
            activeDotStroke: "#0a0f18",
          }
        : {
            cardBg: "rgba(255, 255, 255, 0.95)",
            stroke: "#d97706",
            fillTop: "#f59e0b",
            fillOpacity: 0.25,
            grid: "rgba(15, 23, 42, 0.08)",
            tick: "#64748b",
            tooltipBg: "rgba(255, 255, 255, 0.98)",
            tooltipBorder: "rgba(15, 23, 42, 0.12)",
            tooltipFg: "#0f172a",
            tooltipMuted: "#64748b",
            activeDotStroke: "#ffffff",
          },
    [isDark],
  );

  return (
    <section
      className="rounded-2xl border border-border bg-card p-4 shadow-sm dark:border-white/[0.08] dark:bg-[#0c121c]/80 dark:shadow-none"
      aria-labelledby="chart-heading"
    >
      <div className="mb-4 flex items-end justify-between gap-2 px-1">
        <div>
          <h2
            id="chart-heading"
            className="text-sm font-medium text-foreground"
          >
            {title}
          </h2>
          <p className="text-xs text-muted-foreground">Nilai bersih (simulasi)</p>
        </div>
      </div>

      <div className="h-[220px] w-full min-h-[220px] min-w-0 sm:h-[260px] sm:min-h-[260px]">
        <ResponsiveContainer width="100%" height="100%" minWidth={0}>
          <AreaChart
            data={data}
            margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="fillValue" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="0%"
                  stopColor={palette.fillTop}
                  stopOpacity={palette.fillOpacity}
                />
                <stop
                  offset="100%"
                  stopColor={palette.fillTop}
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 6"
              stroke={palette.grid}
              vertical={false}
            />
            <XAxis
              dataKey="label"
              tick={{ fill: palette.tick, fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              dy={6}
            />
            <YAxis
              tick={{ fill: palette.tick, fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
              width={40}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: palette.tooltipBg,
                border: `1px solid ${palette.tooltipBorder}`,
                borderRadius: "12px",
                fontSize: "12px",
                color: palette.tooltipFg,
              }}
              labelStyle={{ color: palette.tooltipMuted }}
              formatter={(value) => {
                const n =
                  typeof value === "number"
                    ? value
                    : typeof value === "string"
                      ? Number(value)
                      : NaN;
                const text = Number.isFinite(n)
                  ? n.toLocaleString("id-ID", {
                      style: "currency",
                      currency: "IDR",
                      maximumFractionDigits: 0,
                    })
                  : "—";
                return [text, "Nilai"];
              }}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke={palette.stroke}
              strokeWidth={2}
              fill="url(#fillValue)"
              dot={false}
              activeDot={{
                r: 4,
                strokeWidth: 2,
                stroke: palette.activeDotStroke,
                fill: palette.stroke,
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
