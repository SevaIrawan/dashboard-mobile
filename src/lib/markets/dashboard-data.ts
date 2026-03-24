import { createServerSupabase } from "@/lib/supabase/server";
import { getDashboardSession } from "@/lib/auth/dashboard-session";

export type MarketCode = "overall" | "usc" | "sgd" | "myr";
export type PeriodCode = "daily" | "weekly" | "monthly" | "annually";

type MarketRow = {
  line: string | null;
  cases_bets: number | null;
  deposit_cases: number | null;
  net_profit: number | null;
  valid_amount: number | null;
  days_inactive: number | null;
  date: string | null;
};

type NetProfitRow = {
  line: string | null;
  net_profit: number | null;
  date: string | null;
};

const MARKET_TABLES: Record<Exclude<MarketCode, "overall">, string> = {
  usc: "blue_whale_usc",
  sgd: "blue_whale_sgd",
  myr: "blue_whale_myr",
};

function toNumber(v: unknown): number {
  if (typeof v === "number") return Number.isFinite(v) ? v : 0;
  if (typeof v === "string") {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  }
  return 0;
}

function getStartDate(period: PeriodCode): string {
  const d = new Date();
  if (period === "daily") d.setDate(d.getDate() - 1);
  if (period === "weekly") d.setDate(d.getDate() - 7);
  if (period === "monthly") d.setDate(d.getDate() - 30);
  if (period === "annually") d.setDate(d.getDate() - 365);
  return d.toISOString().slice(0, 10);
}

async function fetchMarketRows(
  tableName: string,
  startDate: string,
): Promise<MarketRow[]> {
  const supabase = await createServerSupabase();
  if (!supabase) return [];

  // Pilih kolom secukupnya agar query ringan.
  const { data, error } = await supabase
    .from(tableName)
    .select("line,cases_bets,deposit_cases,net_profit,valid_amount,days_inactive,date")
    .gte("date", startDate);

  if (error || !data) return [];
  return data as MarketRow[];
}

function mergeRows(a: MarketRow[], b: MarketRow[]): MarketRow[] {
  if (a.length === 0) return b;
  if (b.length === 0) return a;
  return [...a, ...b];
}

function clamp(v: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, v));
}

function parseDateOnly(raw: string): Date {
  return new Date(`${raw}T00:00:00Z`);
}

function toDateKey(d: Date): string {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function addDays(d: Date, days: number): Date {
  const next = new Date(d.getTime());
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

function addMonths(d: Date, months: number): Date {
  const next = new Date(d.getTime());
  next.setUTCMonth(next.getUTCMonth() + months);
  return next;
}

function startOfMonth(d: Date): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1));
}

function endOfMonth(d: Date): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0));
}

function startOfYear(d: Date): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
}

function endOfYear(d: Date): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), 11, 31));
}

function calcComparisonPct(current: number, previous: number): number {
  if (previous === 0) {
    if (current === 0) return 0;
    return current > 0 ? 100 : -100;
  }
  return ((current - previous) / Math.abs(previous)) * 100;
}

type DateRange = {
  from: Date;
  to: Date;
};

function getCurrentAndCompareRanges(
  period: PeriodCode,
  latestDate: Date,
): { current: DateRange; compare: DateRange } {
  if (period === "daily") {
    return {
      current: { from: latestDate, to: latestDate },
      compare: { from: addDays(latestDate, -1), to: addDays(latestDate, -1) },
    };
  }

  if (period === "weekly") {
    const currentTo = latestDate;
    const currentFrom = addDays(currentTo, -6);
    const compareTo = addMonths(currentTo, -1);
    const compareFrom = addDays(compareTo, -6);
    return {
      current: { from: currentFrom, to: currentTo },
      compare: { from: compareFrom, to: compareTo },
    };
  }

  if (period === "monthly") {
    const currentMonthStart = startOfMonth(latestDate);
    const currentMonthEnd = endOfMonth(latestDate);
    const prevMonthDate = addMonths(latestDate, -1);
    return {
      current: { from: currentMonthStart, to: currentMonthEnd },
      compare: { from: startOfMonth(prevMonthDate), to: endOfMonth(prevMonthDate) },
    };
  }

  const prevYearDate = addMonths(latestDate, -12);
  return {
    current: { from: startOfYear(latestDate), to: endOfYear(latestDate) },
    compare: { from: startOfYear(prevYearDate), to: endOfYear(prevYearDate) },
  };
}

async function fetchLatestDateFromTable(tableName: string): Promise<Date | null> {
  const supabase = await createServerSupabase();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from(tableName)
    .select("date")
    .order("date", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error || !data?.date) return null;
  const parsed = parseDateOnly(String(data.date));
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

async function fetchNetProfitRowsInRange(
  tableName: string,
  from: Date,
  to: Date,
): Promise<NetProfitRow[]> {
  const supabase = await createServerSupabase();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from(tableName)
    .select("line,net_profit,date")
    .gte("date", toDateKey(from))
    .lte("date", toDateKey(to));
  if (error || !data) return [];
  return data as NetProfitRow[];
}

function aggregateNetProfitByLine(rows: NetProfitRow[]): Map<string, number> {
  const out = new Map<string, number>();
  for (const row of rows) {
    const key = (row.line ?? "Unknown").trim() || "Unknown";
    out.set(key, (out.get(key) ?? 0) + toNumber(row.net_profit));
  }
  return out;
}

function sumMap(map: Map<string, number>): number {
  let total = 0;
  for (const v of map.values()) total += v;
  return total;
}

export type NetProfitLineKpi = {
  label: string;
  value: number;
  comparisonPct: number;
  barPercent: number;
};

export type NetProfitKpiSummary = {
  totalValue: number;
  totalComparisonPct: number;
  lines: NetProfitLineKpi[];
};

function tableNamesForMarket(market: MarketCode): string[] {
  if (market === "overall") {
    return [MARKET_TABLES.usc, MARKET_TABLES.sgd, MARKET_TABLES.myr];
  }
  return [MARKET_TABLES[market]];
}

export async function getNetProfitKpiSummary(
  market: MarketCode,
  period: PeriodCode,
): Promise<NetProfitKpiSummary> {
  const tables = tableNamesForMarket(market);
  const latestDates = await Promise.all(tables.map((t) => fetchLatestDateFromTable(t)));
  const validLatestDates = latestDates.filter((d): d is Date => d !== null);
  if (validLatestDates.length === 0) {
    return { totalValue: 0, totalComparisonPct: 0, lines: [] };
  }

  const latestDate = validLatestDates.reduce((acc, curr) =>
    curr.getTime() > acc.getTime() ? curr : acc,
  );
  const { current, compare } = getCurrentAndCompareRanges(period, latestDate);

  const [currentRowsPerTable, compareRowsPerTable] = await Promise.all([
    Promise.all(tables.map((t) => fetchNetProfitRowsInRange(t, current.from, current.to))),
    Promise.all(tables.map((t) => fetchNetProfitRowsInRange(t, compare.from, compare.to))),
  ]);

  const currentRows = currentRowsPerTable.flat();
  const compareRows = compareRowsPerTable.flat();
  const currentMap = aggregateNetProfitByLine(currentRows);
  const compareMap = aggregateNetProfitByLine(compareRows);

  const allLineKeys = [...currentMap.keys()];
  const rawLines = allLineKeys
    .map((label) => {
      const value = currentMap.get(label) ?? 0;
      const prev = compareMap.get(label) ?? 0;
      return {
        label,
        value,
        comparisonPct: calcComparisonPct(value, prev),
      };
    })
    .sort((a, b) => b.value - a.value);

  const maxAbsComparison =
    rawLines.length > 0
      ? Math.max(...rawLines.map((x) => Math.abs(x.comparisonPct)), 1)
      : 1;

  const lines: NetProfitLineKpi[] = rawLines.map((line) => ({
    ...line,
    barPercent: clamp((Math.abs(line.comparisonPct) / maxAbsComparison) * 100, 18, 100),
  }));

  const totalValue = sumMap(currentMap);
  const totalPrev = sumMap(compareMap);
  const totalComparisonPct = calcComparisonPct(totalValue, totalPrev);

  return {
    totalValue,
    totalComparisonPct,
    lines,
  };
}

export async function getWelcomeUsername(): Promise<string> {
  const supabase = await createServerSupabase();
  if (!supabase) return "admin";

  const { data } = await supabase
    .from("users")
    .select("username,updated_at")
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return data?.username ?? "admin";
}

export type UserHeaderContext = {
  username: string;
  role: string;
};

function pickUserRole(row: Record<string, unknown> | null | undefined): string {
  if (!row) return "admin";
  const raw =
    row.role ??
    row.user_role ??
    row.usertype ??
    row.position ??
    row.level ??
    row.title;
  if (typeof raw === "string" && raw.trim().length > 0) return raw.trim();
  return "admin";
}

export async function getUserHeaderContext(): Promise<UserHeaderContext> {
  const session = await getDashboardSession();
  if (session) return { username: session.username, role: session.role };

  const supabase = await createServerSupabase();
  if (!supabase) return { username: "admin", role: "admin" };

  const { data, error } = await supabase
    .from("users")
    .select("*")
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !data) return { username: "admin", role: "admin" };
  const row = data as Record<string, unknown>;
  const username =
    typeof row.username === "string" && row.username.trim().length > 0
      ? row.username.trim()
      : "admin";
  const role = pickUserRole(row);
  return { username, role };
}

/** Nilai `date` terbaru di `blue_whale_usc` (untuk teks Update di sidebar). */
export async function getLatestBlueWhaleUscDate(): Promise<string | null> {
  const supabase = await createServerSupabase();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("blue_whale_usc")
    .select("date")
    .order("date", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || data == null || data.date == null) return null;
  return String(data.date);
}

export function formatSidebarUpdateDate(raw: string): string {
  const d = new Date(raw);
  if (!Number.isNaN(d.getTime())) {
    return d.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }
  return raw.trim() || "—";
}

export async function getMarketRows(
  market: MarketCode,
  period: PeriodCode,
): Promise<MarketRow[]> {
  const startDate = getStartDate(period);

  if (market === "overall") {
    const [usc, sgd, myr] = await Promise.all([
      fetchMarketRows(MARKET_TABLES.usc, startDate),
      fetchMarketRows(MARKET_TABLES.sgd, startDate),
      fetchMarketRows(MARKET_TABLES.myr, startDate),
    ]);
    return mergeRows(mergeRows(usc, sgd), myr);
  }

  return fetchMarketRows(MARKET_TABLES[market], startDate);
}

export function summarizeRows(rows: MarketRow[]) {
  const totalTicket = rows.reduce((acc, r) => acc + toNumber(r.cases_bets), 0);
  const totalSales = rows.reduce((acc, r) => acc + toNumber(r.deposit_cases), 0);
  const totalProfit = rows.reduce((acc, r) => acc + toNumber(r.net_profit), 0);

  const lineMap = new Map<string, { label: string; value: number }>();
  for (const row of rows) {
    const raw = (row.line ?? "Unknown").trim();
    const key = raw.length > 0 ? raw : "Unknown";
    const curr = lineMap.get(key) ?? { label: key, value: 0 };
    curr.value += toNumber(row.cases_bets);
    lineMap.set(key, curr);
  }

  const topLines = [...lineMap.values()]
    .sort((a, b) => b.value - a.value)
    .slice(0, 3);

  const retentionBars = Array.from({ length: 60 }, (_, i) => {
    const row = rows[i % Math.max(rows.length, 1)];
    const inactive = toNumber(row?.days_inactive);
    if (inactive <= 7) return "strong";
    if (inactive <= 30) return "mid";
    return "low";
  });

  return {
    totalTicket,
    totalSales,
    totalProfit,
    topLines,
    retentionBars,
  };
}

