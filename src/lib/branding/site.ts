/** Nama perusahaan — tampil di drawer market. */
export const SITE_COMPANY_NAME = "NEXMAX";

/**
 * Logo statis dari folder `public/`.
 * Taruh file di: `public/brand/nexmax-logo.png` (atau ganti nama + path ini).
 * Contoh URL di browser: `/brand/nexmax-logo.png`
 */
export const SITE_LOGO_PUBLIC_PATH = "/brand/nexmax-logo.png";

/**
 * Flag market dari folder `public/Brand`.
 * Simpan file sesuai nama berikut:
 * - public/Brand/flag-my.png  (Malaysia)
 * - public/Brand/flag-sg.png  (Singapore)
 * - public/Brand/flag-kh.png  (Cambodia)
 */
export const SITE_MARKET_FLAG_PATHS = {
  overall: "/Brand/flag-my.png",
  myr: "/Brand/flag-my.png",
  sgd: "/Brand/flag-sg.png",
  usc: "/Brand/flag-kh.png",
} as const;
