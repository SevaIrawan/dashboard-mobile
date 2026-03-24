export type CompanyBranding = {
  id: number;
  company_name: string;
  logo_url: string | null;
  logo_alt: string | null;
  header_title: string | null;
  header_subtitle: string | null;
  /** Tanggal update data (footer sidebar) — kolom dari migrasi 003 */
  data_last_updated?: string | null;
  /** Teks setelah "Welcome, " */
  welcome_user_label?: string | null;
  /** Emoji bendera / locale di header */
  locale_flag_emoji?: string | null;
};

export type NavMenuRow = {
  id: string;
  parent_id: string | null;
  label: string;
  path: string;
  icon_key: string;
  sort_order: number;
  is_visible: boolean;
};

export type NavMenuTree = NavMenuRow & {
  children: NavMenuTree[];
};

export type DashboardKpi = {
  id: string;
  menu_id: string;
  slug: string;
  label: string;
  subtitle: string | null;
  icon_key: string | null;
  sort_order: number;
  value_text: string;
  value_numeric: number | null;
  delta_percent: number | null;
  trend: "up" | "down" | "flat" | null;
  period_label: string | null;
  accent: string;
};
