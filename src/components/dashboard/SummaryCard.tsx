type SummaryCardProps = {
  title: string;
  balance: string;
  changeLabel: string;
  changePercent: number;
  subtitle?: string;
};

export function SummaryCard({
  title,
  balance,
  changeLabel,
  changePercent,
  subtitle = "Ringkasan portofolio",
}: SummaryCardProps) {
  const positive = changePercent >= 0;

  return (
    <section
      className="relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-sm dark:border-white/[0.08] dark:bg-gradient-to-br dark:from-white/[0.07] dark:via-white/[0.03] dark:to-transparent dark:shadow-[0_0_0_1px_rgba(255,255,255,0.04)_inset,0_24px_48px_-12px_rgba(0,0,0,0.45)]"
      aria-labelledby="summary-heading"
    >
      <div
        className="pointer-events-none absolute -right-16 -top-24 h-56 w-56 rounded-full bg-amber-400/20 blur-3xl dark:bg-amber-400/10"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -left-10 bottom-0 h-40 w-40 rounded-full bg-emerald-500/15 blur-3xl dark:bg-emerald-500/10"
        aria-hidden
      />

      <div className="relative">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
          {title}
        </p>
        <h1
          id="summary-heading"
          className="mt-2 text-3xl font-semibold tracking-tight text-foreground tabular-nums sm:text-4xl"
        >
          {balance}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>

        <div className="mt-5 flex flex-wrap items-baseline gap-2">
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold tabular-nums ${
              positive
                ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                : "bg-rose-500/15 text-rose-700 dark:text-rose-300"
            }`}
          >
            {positive ? "+" : ""}
            {changePercent.toFixed(2)}%
          </span>
          <span className="text-sm text-muted-foreground">{changeLabel}</span>
        </div>
      </div>
    </section>
  );
}
