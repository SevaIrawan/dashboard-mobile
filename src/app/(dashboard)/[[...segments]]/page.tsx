import { MobileHeaderMock } from "@/components/mobile/MobileHeaderMock";
import { NetProfitLineCarousel } from "@/components/mobile/NetProfitLineCarousel";
import { PeriodTabsMock } from "@/components/mobile/PeriodTabsMock";
import { CircleGauge, Dot } from "lucide-react";
import { redirect } from "next/navigation";
import {
  SITE_COMPANY_NAME,
  SITE_LOGO_PUBLIC_PATH,
} from "@/lib/branding/site";
import {
  formatSidebarUpdateDate,
  getLatestBlueWhaleUscDate,
  getMarketRows,
  getNetProfitKpiSummary,
  getUserHeaderContext,
  summarizeRows,
  type MarketCode,
  type PeriodCode,
} from "@/lib/markets/dashboard-data";

const countries = [
  { name: "Indonesia", value: "43.435", ratio: "23,58%" },
  { name: "United States", value: "34.471", ratio: "18,72%" },
  { name: "Japan", value: "25.582", ratio: "13,89%" },
];

const marketMap: Record<string, { code: MarketCode; label: string }> = {
  overall: { code: "overall", label: "Overall" },
  usc: { code: "usc", label: "USC" },
  sgd: { code: "sgd", label: "SGD" },
  myr: { code: "myr", label: "MYR" },
};

function formatInt(v: number): string {
  return Math.round(v).toLocaleString("id-ID");
}

function getMarketCurrency(marketCode: MarketCode): "RM" | "SGD" | "USD" {
  if (marketCode === "sgd") return "SGD";
  if (marketCode === "usc") return "USD";
  return "RM";
}

type Props = {
  params: Promise<{ segments?: string[] }>;
  searchParams: Promise<{ period?: string }>;
};

export default async function MobileMockDashboardPage({
  params,
  searchParams,
}: Props) {
  const { segments } = await params;
  const { period: rawPeriod } = await searchParams;

  const firstSeg = segments?.[0]?.toLowerCase() ?? "myr";
  if (firstSeg === "overall") redirect("/myr");
  const market = marketMap[firstSeg] ?? marketMap.myr;
  const period: PeriodCode =
    rawPeriod === "daily" ||
    rawPeriod === "weekly" ||
    rawPeriod === "monthly" ||
    rawPeriod === "annually"
      ? rawPeriod
      : "monthly";

  const [rows, userCtx, uscLatestDateRaw, netProfitKpi] = await Promise.all([
    getMarketRows(market.code, period),
    getUserHeaderContext(),
    getLatestBlueWhaleUscDate(),
    getNetProfitKpiSummary(market.code, period),
  ]);
  const dataUpdateLabel = uscLatestDateRaw
    ? formatSidebarUpdateDate(uscLatestDateRaw)
    : null;
  const summary = summarizeRows(rows);
  const currencyCode = getMarketCurrency(market.code);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <MobileHeaderMock
        marketLabel={market.label}
        username={userCtx.username}
        marketCode={market.code}
        companyName={SITE_COMPANY_NAME}
        logoSrc={SITE_LOGO_PUBLIC_PATH}
        dataUpdateLabel={dataUpdateLabel}
      />

      <div className="flex-1 space-y-4 overflow-y-auto overflow-x-hidden px-3 py-3">
        <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
                {currencyCode} {formatInt(netProfitKpi.totalValue)}
              </p>
            </div>
            <div className="h-2 w-1" />
          </div>

          <div className="mt-2">
            <NetProfitLineCarousel
              items={netProfitKpi.lines}
              controlsAtTop
              metaLabel="Net Profit"
              metaComparison={`${netProfitKpi.totalComparisonPct >= 0 ? "+" : ""}${netProfitKpi.totalComparisonPct.toFixed(1)}%`}
              metaComparisonPositive={netProfitKpi.totalComparisonPct >= 0}
            />
          </div>

          <div className="mt-4 flex justify-center">
            <PeriodTabsMock initial={period} />
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
              Today&apos;s Increase
            </h2>
            <button
              type="button"
              className="rounded-full border border-slate-300 px-3 py-1 text-xs font-semibold text-slate-600 dark:border-slate-600 dark:text-slate-200"
            >
              Details
            </button>
          </div>

          <div className="mt-4 grid grid-cols-[1fr_auto] gap-4">
            <div className="flex items-center justify-center">
              <div
                className="relative h-36 w-36 rounded-full"
                style={{
                  background:
                    "conic-gradient(#f97316 0 36%, #0d244a 36% 62%, #cbd5e1 62% 100%)",
                }}
              >
                <div className="absolute inset-[18%] rounded-full bg-white dark:bg-slate-900" />
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <p className="text-3xl font-bold text-slate-900 dark:text-white">
                    {formatInt(summary.totalSales)}
                  </p>
                  <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                    Total Sales
                  </p>
                </div>
              </div>
            </div>
            <div className="space-y-2 text-xs">
              <p className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                <Dot className="h-4 w-4 text-orange-500" /> Duckticket
              </p>
              <p className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                <Dot className="h-4 w-4 text-[#0d244a]" /> Seevent
              </p>
              <p className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                <Dot className="h-4 w-4 text-slate-400" /> Ticketing
              </p>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2">
            {["Billing", "Top Country", "Target"].map((label) => (
              <div
                key={label}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-2 text-center dark:border-slate-700 dark:bg-slate-800"
              >
                <CircleGauge className="mx-auto h-4 w-4 text-[#0d244a] dark:text-amber-300" />
                <p className="mt-1 text-[10px] font-semibold text-slate-600 dark:text-slate-300">
                  {label}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">
                User Retention Cohorts
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Performing +6.1%
              </p>
            </div>
            <button
              type="button"
              className="rounded-full border border-slate-300 px-2.5 py-1 text-[11px] font-semibold text-slate-600 dark:border-slate-600 dark:text-slate-200"
            >
              Get Report
            </button>
          </div>

          <div className="mt-4 grid grid-cols-10 gap-1.5">
            {summary.retentionBars.map((level, i) => {
              return (
                <span
                  key={i}
                  className={`h-3 rounded-[4px] ${
                    level === "strong"
                      ? "bg-[#0d244a] dark:bg-amber-300"
                      : level === "mid"
                        ? "bg-orange-300 dark:bg-orange-500"
                        : "bg-slate-200 dark:bg-slate-700"
                  }`}
                />
              );
            })}
          </div>

          <div className="mt-4 flex items-end justify-between">
            <p className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
              {summary.totalProfit === 0
                ? "0%"
                : `${Math.max(Math.min(Math.round(summary.totalProfit / 1000), 99), 1)}%`}
            </p>
            <div className="space-y-1 text-right text-[11px] text-slate-500 dark:text-slate-400">
              {countries.map((country) => (
                <p key={country.name}>
                  {country.name}:{" "}
                  <span className="font-semibold text-slate-700 dark:text-slate-200">
                    {country.value}
                  </span>{" "}
                  ({country.ratio})
                </p>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
