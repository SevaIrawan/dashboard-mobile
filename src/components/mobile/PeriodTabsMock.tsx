"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

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
    setActive(tab);
    const params = new URLSearchParams(searchParams.toString());
    params.set("period", toKey[tab]);
    router.replace(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="inline-flex rounded-full bg-slate-100 p-1 dark:bg-slate-800/80">
      {tabs.map((tab) => (
        <button
          key={tab}
          type="button"
          onClick={() => handleClick(tab)}
          className={`rounded-full px-3 py-1.5 text-[11px] font-semibold transition-colors ${
            active === tab
              ? "bg-[#0d4aa3] text-white shadow-sm ring-1 ring-[#6da8ff]/70"
              : "text-slate-500 hover:bg-slate-200/60 hover:text-slate-700 dark:text-slate-300 dark:hover:bg-slate-700/70 dark:hover:text-white"
          }`}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}
