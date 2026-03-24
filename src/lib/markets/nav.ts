import type { MarketCode } from "@/lib/markets/dashboard-data";

/** Empat menu utama di drawer hamburger — selaras dengan routing `[[...segments]]`. */
export const MARKET_DRAWER_ITEMS: {
  code: MarketCode;
  label: string;
  path: string;
}[] = [
  { code: "myr", label: "MYR", path: "/myr" },
  { code: "usc", label: "USC", path: "/usc" },
  { code: "sgd", label: "SGD", path: "/sgd" },
];

/** Segment pertama URL → kode market (sama logika dengan halaman dashboard). */
export function marketCodeFromPathname(pathname: string): MarketCode {
  const seg =
    pathname.split("/").filter(Boolean)[0]?.toLowerCase() ?? "myr";
  if (seg === "usc" || seg === "sgd" || seg === "myr") {
    return seg;
  }
  return "myr";
}

export function marketDrawerHref(
  path: string,
  searchParams: URLSearchParams,
): string {
  const q = searchParams.toString();
  return q ? `${path}?${q}` : path;
}
