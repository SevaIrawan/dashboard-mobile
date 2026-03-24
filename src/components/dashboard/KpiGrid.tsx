import { getNavIcon } from "@/lib/dashboard/nav-icons";
import type { DashboardKpi } from "@/lib/dashboard/types";
import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";

const accentRing: Record<string, string> = {
  emerald:
    "border-emerald-200/80 bg-emerald-50/80 dark:border-emerald-800/50 dark:bg-emerald-950/25",
  rose: "border-rose-200/80 bg-rose-50/80 dark:border-rose-800/50 dark:bg-rose-950/25",
  amber:
    "border-amber-200/80 bg-amber-50/80 dark:border-amber-800/50 dark:bg-amber-950/25",
  sky: "border-sky-200/80 bg-sky-50/80 dark:border-sky-800/50 dark:bg-sky-950/25",
  violet:
    "border-violet-200/80 bg-violet-50/80 dark:border-violet-800/50 dark:bg-violet-950/25",
  slate:
    "border-slate-200/80 bg-slate-50/80 dark:border-slate-700/50 dark:bg-slate-900/30",
};

function TrendIcon({ trend }: { trend: DashboardKpi["trend"] }) {
  if (trend === "up") {
    return <ArrowUpRight className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />;
  }
  if (trend === "down") {
    return <ArrowDownRight className="h-3.5 w-3.5 text-rose-600 dark:text-rose-400" />;
  }
  return <Minus className="h-3.5 w-3.5 text-muted-foreground" />;
}

type Props = {
  kpis: DashboardKpi[];
};

export function KpiGrid({ kpis }: Props) {
  if (kpis.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-border bg-card/50 px-4 py-8 text-center text-sm text-muted-foreground">
        Belum ada KPI untuk halaman ini. Tambahkan baris di tabel{" "}
        <code className="rounded bg-muted px-1 py-0.5 text-xs">dashboard_kpis</code>{" "}
        di Supabase.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {kpis.map((kpi) => {
        const Icon = getNavIcon(kpi.icon_key);
        const ring =
          accentRing[kpi.accent] ??
          accentRing.emerald;

        return (
          <article
            key={kpi.id}
            className={`rounded-2xl border p-4 shadow-sm ${ring}`}
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {kpi.label}
                </p>
                <p className="mt-1 text-2xl font-semibold tabular-nums tracking-tight text-foreground">
                  {kpi.value_text}
                </p>
                {kpi.subtitle ? (
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {kpi.subtitle}
                  </p>
                ) : null}
              </div>
              <span className="rounded-xl border border-border/60 bg-background/80 p-2 text-foreground shadow-sm dark:bg-zinc-900/80">
                <Icon className="h-5 w-5" aria-hidden />
              </span>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1 rounded-full bg-background/80 px-2 py-0.5 font-medium text-foreground dark:bg-zinc-900/80">
                <TrendIcon trend={kpi.trend} />
                {kpi.delta_percent != null ? (
                  <>
                    {kpi.delta_percent > 0 ? "+" : ""}
                    {kpi.delta_percent}%
                  </>
                ) : (
                  "—"
                )}
              </span>
              {kpi.period_label ? (
                <span className="text-muted-foreground">{kpi.period_label}</span>
              ) : null}
            </div>
          </article>
        );
      })}
    </div>
  );
}
