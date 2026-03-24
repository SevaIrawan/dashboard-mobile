"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useState, useTransition } from "react";

const tabs = ["Daily", "Weekly", "Monthly", "Annually"] as const;
const toKey = {
  Daily: "daily",
  Weekly: "weekly",
  Monthly: "monthly",
  Annually: "annually",
} as const;

export function PeriodTabsMock({
  initial = "monthly",
}: {
  initial?: "daily" | "weekly" | "monthly" | "annually";
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [active, setActive] = useState<(typeof tabs)[number]>(
    initial === "daily"
      ? "Daily"
      : initial === "weekly"
        ? "Weekly"
        : initial === "annually"
          ? "Annually"
          : "Monthly",
  );

  function handleClick(tab: (typeof tabs)[number]) {
    if (isPending || active === tab) return;
    setActive(tab);
    const params = new URLSearchParams(searchParams.toString());
    params.set("period", toKey[tab]);
    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`);
    });
  }

  return (
    <div className="inline-flex rounded-full bg-slate-100 p-1 dark:bg-slate-800/80">
      {tabs.map((tab) => (
        <button
          key={tab}
          type="button"
          onClick={() => handleClick(tab)}
          disabled={isPending}
          className={`rounded-full px-3 py-1.5 text-[11px] font-semibold transition-colors ${
            active === tab
              ? "bg-[#0d4aa3] text-white shadow-sm ring-1 ring-[#6da8ff]/70"
              : "text-slate-500 hover:bg-slate-200/60 hover:text-slate-700 dark:text-slate-300 dark:hover:bg-slate-700/70 dark:hover:text-white"
          } ${isPending ? "cursor-wait opacity-90" : ""}`}
        >
          <span className="inline-flex items-center gap-1.5">
            {active === tab && isPending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
            ) : null}
            {tab}
          </span>
        </button>
      ))}
    </div>
  );
}
