-- Market config + menu per market (Overall, USC, SGD, MYR)
-- Fokus tahap ini: struktur tabel dan seed data.

create extension if not exists "pgcrypto";

-- Sumber data market untuk wiring query tahap berikutnya.
create table if not exists public.market_sources (
  id uuid primary key default gen_random_uuid(),
  market_code text not null unique,
  market_label text not null,
  source_table text,
  is_active boolean not null default true,
  sort_order int not null default 0,
  updated_at timestamptz default now()
);

alter table public.market_sources enable row level security;
drop policy if exists "read_market_sources" on public.market_sources;
create policy "read_market_sources" on public.market_sources for select using (true);
grant select on public.market_sources to anon, authenticated;

do $$
declare
  id_overall uuid := 'b0000001-0000-4000-8000-000000000001';
  id_usc uuid := 'b0000001-0000-4000-8000-000000000002';
  id_sgd uuid := 'b0000001-0000-4000-8000-000000000003';
  id_myr uuid := 'b0000001-0000-4000-8000-000000000004';

  id_usc_overview uuid := 'b0000001-0000-4000-8000-000000000011';
  id_usc_perf uuid := 'b0000001-0000-4000-8000-000000000012';
  id_usc_target uuid := 'b0000001-0000-4000-8000-000000000013';
  id_usc_brand uuid := 'b0000001-0000-4000-8000-000000000014';
  id_usc_kpi uuid := 'b0000001-0000-4000-8000-000000000015';
  id_usc_auto uuid := 'b0000001-0000-4000-8000-000000000016';

  id_sgd_overview uuid := 'b0000001-0000-4000-8000-000000000021';
  id_sgd_perf uuid := 'b0000001-0000-4000-8000-000000000022';
  id_sgd_target uuid := 'b0000001-0000-4000-8000-000000000023';
  id_sgd_brand uuid := 'b0000001-0000-4000-8000-000000000024';
  id_sgd_kpi uuid := 'b0000001-0000-4000-8000-000000000025';
  id_sgd_auto uuid := 'b0000001-0000-4000-8000-000000000026';

  id_myr_overview uuid := 'b0000001-0000-4000-8000-000000000031';
  id_myr_perf uuid := 'b0000001-0000-4000-8000-000000000032';
  id_myr_target uuid := 'b0000001-0000-4000-8000-000000000033';
  id_myr_brand uuid := 'b0000001-0000-4000-8000-000000000034';
  id_myr_kpi uuid := 'b0000001-0000-4000-8000-000000000035';
  id_myr_auto uuid := 'b0000001-0000-4000-8000-000000000036';
begin
  -- Market source master
  insert into public.market_sources (market_code, market_label, source_table, sort_order) values
    ('overall', 'Overall', null, 1),
    ('usc', 'USC', 'blue_whale_usc', 2),
    ('sgd', 'SGD', 'blue_whale_sgd', 3),
    ('myr', 'MYR', 'blue_whale_myr', 4)
  on conflict (market_code) do update set
    market_label = excluded.market_label,
    source_table = excluded.source_table,
    sort_order = excluded.sort_order,
    is_active = true,
    updated_at = now();

  -- Top level menu
  insert into public.nav_menu_items (id, parent_id, label, path, icon_key, sort_order, is_visible) values
    (id_overall, null, 'Overall', '/overall', 'Home', 1, true),
    (id_usc, null, 'USC', '/usc', 'TrendingUp', 2, true),
    (id_sgd, null, 'SGD', '/sgd', 'TrendingUp', 3, true),
    (id_myr, null, 'MYR', '/myr', 'TrendingUp', 4, true)
  on conflict (path) do update set
    label = excluded.label,
    parent_id = excluded.parent_id,
    icon_key = excluded.icon_key,
    sort_order = excluded.sort_order,
    is_visible = excluded.is_visible;

  -- USC submenu
  insert into public.nav_menu_items (id, parent_id, label, path, icon_key, sort_order, is_visible) values
    (id_usc_overview, id_usc, 'Overview', '/usc/overview', 'Home', 1, true),
    (id_usc_perf, id_usc, 'Business Performance', '/usc/business-performance', 'LineChart', 2, true),
    (id_usc_target, id_usc, 'Target Management', '/usc/target-management', 'Target', 3, true),
    (id_usc_brand, id_usc, 'Brand Comparison Trends', '/usc/brand-comparison-trends', 'FileText', 4, true),
    (id_usc_kpi, id_usc, 'KPI Comparison', '/usc/kpi-comparison', 'BadgeCheck', 5, true),
    (id_usc_auto, id_usc, 'Auto-Approval Monitor', '/usc/auto-approval-monitor', 'Calendar', 6, true)
  on conflict (path) do update set
    label = excluded.label,
    parent_id = excluded.parent_id,
    icon_key = excluded.icon_key,
    sort_order = excluded.sort_order,
    is_visible = excluded.is_visible;

  -- SGD submenu
  insert into public.nav_menu_items (id, parent_id, label, path, icon_key, sort_order, is_visible) values
    (id_sgd_overview, id_sgd, 'Overview', '/sgd/overview', 'Home', 1, true),
    (id_sgd_perf, id_sgd, 'Business Performance', '/sgd/business-performance', 'LineChart', 2, true),
    (id_sgd_target, id_sgd, 'Target Management', '/sgd/target-management', 'Target', 3, true),
    (id_sgd_brand, id_sgd, 'Brand Comparison Trends', '/sgd/brand-comparison-trends', 'FileText', 4, true),
    (id_sgd_kpi, id_sgd, 'KPI Comparison', '/sgd/kpi-comparison', 'BadgeCheck', 5, true),
    (id_sgd_auto, id_sgd, 'Auto-Approval Monitor', '/sgd/auto-approval-monitor', 'Calendar', 6, true)
  on conflict (path) do update set
    label = excluded.label,
    parent_id = excluded.parent_id,
    icon_key = excluded.icon_key,
    sort_order = excluded.sort_order,
    is_visible = excluded.is_visible;

  -- MYR submenu
  insert into public.nav_menu_items (id, parent_id, label, path, icon_key, sort_order, is_visible) values
    (id_myr_overview, id_myr, 'Overview', '/myr/overview', 'Home', 1, true),
    (id_myr_perf, id_myr, 'Business Performance', '/myr/business-performance', 'LineChart', 2, true),
    (id_myr_target, id_myr, 'Target Management', '/myr/target-management', 'Target', 3, true),
    (id_myr_brand, id_myr, 'Brand Comparison Trends', '/myr/brand-comparison-trends', 'FileText', 4, true),
    (id_myr_kpi, id_myr, 'KPI Comparison', '/myr/kpi-comparison', 'BadgeCheck', 5, true),
    (id_myr_auto, id_myr, 'Auto-Approval Monitor', '/myr/auto-approval-monitor', 'Calendar', 6, true)
  on conflict (path) do update set
    label = excluded.label,
    parent_id = excluded.parent_id,
    icon_key = excluded.icon_key,
    sort_order = excluded.sort_order,
    is_visible = excluded.is_visible;

  -- KPI seed awal per halaman top-level market
  insert into public.dashboard_kpis (menu_id, slug, label, subtitle, icon_key, sort_order, value_text, value_numeric, delta_percent, trend, period_label, accent) values
    (id_overall, 'overall_revenue', 'Overall Revenue', 'All markets', 'Wallet', 1, '1.24M', 1240000, 3.2, 'up', 'Monthly', 'emerald'),
    (id_usc, 'usc_revenue', 'USC Revenue', 'Market USC', 'Wallet', 1, '420k', 420000, 2.1, 'up', 'Monthly', 'sky'),
    (id_sgd, 'sgd_revenue', 'SGD Revenue', 'Market SGD', 'Wallet', 1, '390k', 390000, -0.4, 'down', 'Monthly', 'amber'),
    (id_myr, 'myr_revenue', 'MYR Revenue', 'Market MYR', 'Wallet', 1, '430k', 430000, 1.8, 'up', 'Monthly', 'emerald')
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
