"use client";

import dynamic from "next/dynamic";
import type { ChartPoint } from "@/components/dashboard/PortfolioChart";

const PortfolioChart = dynamic(
  () =>
    import("@/components/dashboard/PortfolioChart").then((m) => m.PortfolioChart),
  {
    ssr: false,
    loading: () => (
      <div
        className="h-[260px] animate-pulse rounded-2xl border border-border bg-muted dark:border-white/[0.06] dark:bg-white/[0.04]"
        aria-hidden
      />
    ),
  },
);

type Props = {
  data: ChartPoint[];
  title?: string;
};

export function PortfolioChartSection({ data, title }: Props) {
  return <PortfolioChart data={data} title={title} />;
}
