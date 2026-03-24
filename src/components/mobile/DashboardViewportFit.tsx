"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  children: React.ReactNode;
};

export function DashboardViewportFit({ children }: Props) {
  const contentRef = useRef<HTMLDivElement | null>(null);
  const [scale, setScale] = useState(1);
  const [desktopFitMode, setDesktopFitMode] = useState(false);
  const [isMobileViewport, setIsMobileViewport] = useState(false);

  useEffect(() => {
    function recalc() {
      const el = contentRef.current;
      if (!el) return;

      const vw = window.visualViewport?.width ?? window.innerWidth;
      const vh = window.visualViewport?.height ?? window.innerHeight;

      // Di HP/tablet kecil: gunakan lebar perangkat penuh, tanpa scaling.
      if (vw <= 500) {
        setIsMobileViewport(true);
        setDesktopFitMode(false);
        setScale(1);
        return;
      }

      setIsMobileViewport(false);
      setDesktopFitMode(true);
      const contentWidth = el.offsetWidth || 430;
      const contentHeight = el.scrollHeight || 1;
      const fit = Math.min((vw - 8) / contentWidth, (vh - 8) / contentHeight, 1);
      setScale(Number.isFinite(fit) ? fit : 1);
    }

    recalc();
    const onResize = () => recalc();
    window.addEventListener("resize", onResize);
    window.visualViewport?.addEventListener("resize", onResize);

    const observer =
      contentRef.current != null ? new ResizeObserver(() => recalc()) : null;
    if (observer && contentRef.current) observer.observe(contentRef.current);

    return () => {
      window.removeEventListener("resize", onResize);
      window.visualViewport?.removeEventListener("resize", onResize);
      observer?.disconnect();
    };
  }, []);

  if (isMobileViewport) {
    return (
      <div className="app-backdrop flex min-h-[100svh] w-full justify-center overflow-x-hidden supports-[min-height:100dvh]:min-h-[100dvh]">
        <div className="flex min-h-[100svh] w-full max-w-[430px] flex-col overflow-visible border-x border-slate-200 bg-[#f5f7fb] shadow-[0_0_40px_rgba(15,23,42,0.2)] supports-[min-height:100dvh]:min-h-[100dvh] dark:border-slate-700 dark:bg-[#0b1220]">
          {children}
        </div>
      </div>
    );
  }

  return (
    <div className="app-backdrop flex h-[100svh] min-h-[100svh] w-full items-start justify-center overflow-hidden supports-[height:100dvh]:h-[100dvh] supports-[min-height:100dvh]:min-h-[100dvh]">
      <div
        className="origin-top"
        style={
          desktopFitMode
            ? { transform: `scale(${scale})`, transformOrigin: "top center" }
            : undefined
        }
      >
        <div
          ref={contentRef}
          className={`flex flex-col overflow-hidden border-x border-slate-200 bg-[#f5f7fb] shadow-[0_0_40px_rgba(15,23,42,0.2)] dark:border-slate-700 dark:bg-[#0b1220] ${
            desktopFitMode ? "w-[430px] max-w-[430px]" : "w-[min(100vw,430px)]"
          }`}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
