import type { MarketCode } from "@/lib/markets/dashboard-data";

/** Market tunggal (tanpa agregat `overall`). */
export type SingleMarketCode = Exclude<MarketCode, "overall">;

const ALL_MARKETS: readonly SingleMarketCode[] = ["myr", "usc", "sgd"];

/**
 * Normalisasi string role dari DB / cookie (huruf kecil, spasi → underscore).
 */
export function normalizeDashboardRole(raw: string): string {
  return raw.trim().toLowerCase().replace(/\s+/g, "_");
}

/**
 * Role yang dikenali:
 * - admin, executive → MYR + USC + SGD
 * - manager_myr | manager_sgd | manager_usc → market tersebut saja
 * Role lain (legacy) → akses penuh tiga market (perilaku lama seperti admin).
 */
export function getAllowedMarketsForRole(role: string): SingleMarketCode[] {
  const r = normalizeDashboardRole(role);
  switch (r) {
    case "admin":
    case "executive":
      return [...ALL_MARKETS];
    case "manager_myr":
      return ["myr"];
    case "manager_sgd":
      return ["sgd"];
    case "manager_usc":
      return ["usc"];
    default:
      return [...ALL_MARKETS];
  }
}

/** Path landing pertama yang diizinkan untuk role (urutan MYR → USC → SGD). */
export function getDefaultDashboardPathForRole(role: string): string {
  const order: SingleMarketCode[] = ["myr", "usc", "sgd"];
  const allowed = new Set(getAllowedMarketsForRole(role));
  const first = order.find((code) => allowed.has(code)) ?? "myr";
  return `/${first}`;
}
