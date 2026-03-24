"use client";

import { useEffect, useState } from "react";

export function HeaderClock() {
  const [now, setNow] = useState<string>(() =>
    new Date().toLocaleString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }),
  );

  useEffect(() => {
    const tick = () =>
      setNow(
        new Date().toLocaleString("id-ID", {
          day: "numeric",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }),
      );
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <p className="mt-0.5 truncate text-[10px] leading-snug text-white/60 sm:text-[11px] lg:text-xs">
      {now}
    </p>
  );
}
