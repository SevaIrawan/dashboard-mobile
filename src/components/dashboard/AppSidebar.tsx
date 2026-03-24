"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Building2, ChevronDown, ChevronRight } from "lucide-react";
import { getNavIcon } from "@/lib/dashboard/nav-icons";
import type { CompanyBranding, NavMenuTree } from "@/lib/dashboard/types";

function isPathActive(pathname: string, itemPath: string) {
  if (itemPath === "/") return pathname === "/";
  return pathname === itemPath || pathname.startsWith(`${itemPath}/`);
}

function collectOpenParentIds(
  pathname: string,
  nodes: NavMenuTree[],
): Set<string> {
  const open = new Set<string>();

  function walk(items: NavMenuTree[]): boolean {
    let anyHit = false;
    for (const item of items) {
      if (item.children.length > 0) {
        const childHit = walk(item.children);
        const selfHit = isPathActive(pathname, item.path);
        if (childHit || selfHit) {
          open.add(item.id);
          anyHit = true;
        }
      } else if (isPathActive(pathname, item.path)) {
        anyHit = true;
      }
    }
    return anyHit;
  }

  walk(nodes);
  return open;
}

function formatUpdateDate(iso: string | null | undefined) {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

type NavAccordionProps = {
  items: NavMenuTree[];
  pathname: string;
  expanded: Set<string>;
  toggle: (id: string) => void;
  onNavigate?: () => void;
  nested?: boolean;
};

function NavAccordion({
  items,
  pathname,
  expanded,
  toggle,
  onNavigate,
  nested = false,
}: NavAccordionProps) {
  return (
    <ul
      className={
        nested
          ? "mt-1 space-y-0.5 border-l border-white/10 pl-3"
          : "space-y-0.5"
      }
    >
      {items.map((item) => {
        const Icon = getNavIcon(item.icon_key);
        const hasChildren = item.children.length > 0;
        const active = isPathActive(pathname, item.path);
        const open = expanded.has(item.id);

        if (hasChildren) {
          return (
            <li key={item.id}>
              <div
                className={`flex items-stretch gap-0.5 rounded-lg ${
                  active || open
                    ? "bg-[#243042]"
                    : "hover:bg-white/[0.04]"
                }`}
              >
                <Link
                  href={item.path}
                  onClick={onNavigate}
                  className="flex min-w-0 flex-1 items-center gap-2 px-2 py-2 text-sm font-medium text-slate-100"
                >
                  <Icon className="h-4 w-4 shrink-0 text-white/90" aria-hidden />
                  <span className="truncate">{item.label}</span>
                </Link>
                <button
                  type="button"
                  onClick={() => toggle(item.id)}
                  className="flex w-9 shrink-0 items-center justify-center text-white/70 transition hover:text-white"
                  aria-expanded={open}
                  aria-label={open ? "Ciutkan menu" : "Bentangkan menu"}
                >
                  {open ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </button>
              </div>
              {open ? (
                <ul className="ml-2 mt-1 space-y-0.5 border-l border-white/10 py-1 pl-3">
                  {item.children.map((child) => {
                    const CIcon = getNavIcon(child.icon_key);
                    const cActive = isPathActive(pathname, child.path);
                    return (
                      <li key={child.id}>
                        <Link
                          href={child.path}
                          onClick={onNavigate}
                          className={`flex items-center gap-2 rounded-md py-1.5 pl-1 text-sm ${
                            cActive
                              ? "font-semibold text-amber-300"
                              : "text-slate-300 hover:text-white"
                          }`}
                        >
                          <span className="text-[10px] text-white/50">•</span>
                          <CIcon className="h-3.5 w-3.5 shrink-0 opacity-80" aria-hidden />
                          <span className="truncate">{child.label}</span>
                        </Link>
                        {child.children.length > 0 ? (
                          <NavAccordion
                            items={child.children}
                            pathname={pathname}
                            expanded={expanded}
                            toggle={toggle}
                            onNavigate={onNavigate}
                            nested
                          />
                        ) : null}
                      </li>
                    );
                  })}
                </ul>
              ) : null}
            </li>
          );
        }

        return (
          <li key={item.id}>
            <Link
              href={item.path}
              onClick={onNavigate}
              className={`flex items-center gap-2 rounded-lg px-2 py-2 text-sm font-medium transition ${
                active
                  ? "bg-[#243042] text-amber-300"
                  : "text-slate-200 hover:bg-white/[0.04] hover:text-white"
              }`}
            >
              <Icon className="h-4 w-4 shrink-0 text-white/90" aria-hidden />
              <span className="truncate">{item.label}</span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

type Props = {
  branding: CompanyBranding | null;
  menuTree: NavMenuTree[];
  onNavigate?: () => void;
};

export function AppSidebar({ branding, menuTree, onNavigate }: Props) {
  const pathname = usePathname();
  const name = branding?.company_name ?? "Dashboard";
  const logoAlt = branding?.logo_alt ?? name;
  const updateLine = formatUpdateDate(branding?.data_last_updated ?? null);

  const autoOpen = useMemo(
    () => collectOpenParentIds(pathname, menuTree),
    [pathname, menuTree],
  );

  const [expanded, setExpanded] = useState<Set<string>>(() => new Set(autoOpen));

  useEffect(() => {
    setExpanded((prev) => new Set([...prev, ...autoOpen]));
  }, [autoOpen]);

  const toggle = useCallback((id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  return (
    <div className="flex h-full flex-col bg-[#1a222d] text-slate-100">
      <div className="border-b border-white/10 px-4 py-4">
        <div className="flex items-center gap-3">
          {branding?.logo_url ? (
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-2 border-amber-400/90 bg-[#131820] p-1 shadow-inner">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={branding.logo_url}
                alt={logoAlt}
                className="h-full w-full rounded-full object-contain"
              />
            </div>
          ) : (
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-2 border-amber-400/90 bg-[#131820] shadow-inner">
              <Building2 className="h-7 w-7 text-amber-200/90" aria-hidden />
            </div>
          )}
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-white">{name}</p>
            {branding?.header_subtitle ? (
              <p className="truncate text-xs text-white/55">
                {branding.header_subtitle}
              </p>
            ) : null}
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-3" aria-label="Menu">
        <p className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/40">
          Menu
        </p>
        {menuTree.length === 0 ? (
          <p className="px-2 text-xs text-white/50">
            Tidak ada menu. Isi tabel{" "}
            <code className="rounded bg-white/10 px-1">nav_menu_items</code>.
          </p>
        ) : (
          <NavAccordion
            items={menuTree}
            pathname={pathname}
            expanded={expanded}
            toggle={toggle}
            onNavigate={onNavigate}
          />
        )}
      </nav>

      {updateLine ? (
        <div className="border-t border-white/10 p-4">
          <div className="rounded-lg border border-amber-400/80 bg-[#131820] px-3 py-3 text-center shadow-sm">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-white/80">
              Update
            </p>
            <p className="mt-1 text-sm font-bold text-white">{updateLine}</p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
