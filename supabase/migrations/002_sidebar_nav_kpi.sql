-- Konfigurasi dashboard: branding, menu + sub menu, KPI per halaman menu
-- Jalankan setelah 001 (atau standalone jika tabel belum ada)

create extension if not exists "pgcrypto";

-- Branding & header
create table if not exists public.company_branding (
  id smallint primary key check (id = 1),
  company_name text not null default 'Perusahaan Anda',
  logo_url text,
  logo_alt text,
  header_title text,
  header_subtitle text,
  updated_at timestamptz default now()
);

-- Menu: parent_id null = menu utama; sub menu mengarah ke parent_id
create table if not exists public.nav_menu_items (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid references public.nav_menu_items(id) on delete cascade,
  label text not null,
  path text not null,
  icon_key text not null default 'Circle',
  sort_order int not null default 0,
  is_visible boolean not null default true,
  constraint nav_menu_path_unique unique (path)
);

-- KPI yang ditampilkan per halaman (menu_id = halaman yang aktif)
create table if not exists public.dashboard_kpis (
  id uuid primary key default gen_random_uuid(),
  menu_id uuid not null references public.nav_menu_items(id) on delete cascade,
  slug text not null,
  label text not null,
  subtitle text,
  icon_key text,
  sort_order int not null default 0,
  value_text text not null,
  value_numeric numeric,
  delta_percent numeric,
  trend text check (trend is null or trend in ('up', 'down', 'flat')),
  period_label text,
  accent text not null default 'emerald',
  updated_at timestamptz default now(),
  constraint dashboard_kpis_menu_slug unique (menu_id, slug)
);

alter table public.company_branding enable row level security;
alter table public.nav_menu_items enable row level security;
alter table public.dashboard_kpis enable row level security;

drop policy if exists "read_company_branding" on public.company_branding;
create policy "read_company_branding" on public.company_branding for select using (true);

drop policy if exists "read_nav_menu" on public.nav_menu_items;
create policy "read_nav_menu" on public.nav_menu_items for select using (true);

drop policy if exists "read_dashboard_kpis" on public.dashboard_kpis;
create policy "read_dashboard_kpis" on public.dashboard_kpis for select using (true);

grant usage on schema public to anon, authenticated;
grant select on public.company_branding, public.nav_menu_items, public.dashboard_kpis to anon, authenticated;

-- Seed (gunakan DO agar FK konsisten)
do $$
declare
  id_home uuid := 'a0000001-0000-4000-8000-000000000001';
  id_sales uuid := 'a0000001-0000-4000-8000-000000000002';
  id_reports uuid := 'a0000001-0000-4000-8000-000000000003';
  id_rep_m uuid := 'a0000001-0000-4000-8000-000000000004';
  id_rep_a uuid := 'a0000001-0000-4000-8000-000000000005';
begin
  insert into public.company_branding (id, company_name, logo_url, logo_alt, header_title, header_subtitle)
  values (
    1,
    'ACME Indonesia',
    null,
    'Logo ACME',
    'Dashboard',
    'Ringkasan operasional'
  )
  on conflict (id) do update set
    company_name = excluded.company_name,
    header_title = excluded.header_title,
    header_subtitle = excluded.header_subtitle;

  insert into public.nav_menu_items (id, parent_id, label, path, icon_key, sort_order) values
    (id_home, null, 'Beranda', '/', 'Home', 1)
  on conflict (path) do update set
    label = excluded.label,
    parent_id = excluded.parent_id,
    icon_key = excluded.icon_key,
    sort_order = excluded.sort_order;

  insert into public.nav_menu_items (id, parent_id, label, path, icon_key, sort_order) values
    (id_sales, null, 'Penjualan', '/sales', 'TrendingUp', 2)
  on conflict (path) do update set
    label = excluded.label,
    parent_id = excluded.parent_id,
    icon_key = excluded.icon_key,
    sort_order = excluded.sort_order;

  insert into public.nav_menu_items (id, parent_id, label, path, icon_key, sort_order) values
    (id_reports, null, 'Laporan', '/reports', 'FileText', 3)
  on conflict (path) do update set
    label = excluded.label,
    parent_id = excluded.parent_id,
    icon_key = excluded.icon_key,
    sort_order = excluded.sort_order;

  insert into public.nav_menu_items (id, parent_id, label, path, icon_key, sort_order) values
    (id_rep_m, id_reports, 'Laporan Bulanan', '/reports/monthly', 'Calendar', 1)
  on conflict (path) do update set
    label = excluded.label,
    parent_id = excluded.parent_id,
    icon_key = excluded.icon_key,
    sort_order = excluded.sort_order;

  insert into public.nav_menu_items (id, parent_id, label, path, icon_key, sort_order) values
    (id_rep_a, id_reports, 'Laporan Tahunan', '/reports/annual', 'CalendarRange', 2)
  on conflict (path) do update set
    label = excluded.label,
    parent_id = excluded.parent_id,
    icon_key = excluded.icon_key,
    sort_order = excluded.sort_order;

  insert into public.dashboard_kpis (menu_id, slug, label, subtitle, icon_key, sort_order, value_text, value_numeric, delta_percent, trend, period_label, accent) values
    (id_home, 'revenue', 'Pendapatan', 'vs bulan lalu', 'Wallet', 1, 'Rp 12,4 M', 12400000000, 4.2, 'up', 'Bulan ini', 'emerald'),
    (id_home, 'orders', 'Pesanan', 'Total tercatat', 'ShoppingCart', 2, '1.284', 1284, null, 'flat', '30 hari', 'sky'),
    (id_home, 'conversion', 'Konversi', 'Funnel utama', 'Percent', 3, '3,8%', 3.8, -0.4, 'down', '7 hari', 'amber'),
    (id_sales, 'pipeline', 'Nilai pipeline', 'Prospek aktif', 'Target', 1, 'Rp 8,2 M', 8200000000, 12.1, 'up', 'Kuartal', 'emerald'),
    (id_sales, 'deals', 'Deal menang', 'Tertutup bulan ini', 'BadgeCheck', 2, '42', 42, 8, 'up', 'Bulan ini', 'violet'),
    (id_rep_m, 'export', 'Ekspor CSV', 'Unduhan laporan', 'Download', 1, '1.240', null, null, 'flat', 'Bulan lalu', 'slate'),
    (id_rep_a, 'yoy', 'Pertumbuhan YoY', 'Tahun ke tahun', 'LineChart', 1, '+18,5%', 18.5, 2.1, 'up', 'FY', 'emerald')
  on conflict (menu_id, slug) do update set
    label = excluded.label,
    subtitle = excluded.subtitle,
    icon_key = excluded.icon_key,
    sort_order = excluded.sort_order,
    value_text = excluded.value_text,
    value_numeric = excluded.value_numeric,
    delta_percent = excluded.delta_percent,
    trend = excluded.trend,
    period_label = excluded.period_label,
    accent = excluded.accent;
end $$;
