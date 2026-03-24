-- Dashboard mobile: tabel + RLS baca untuk anon (sesuaikan kebijakan di production)
-- Jalankan di Supabase SQL Editor atau: supabase db push

create extension if not exists "pgcrypto";

-- Profil header
create table if not exists public.dashboard_profile (
  id smallint primary key default 1 check (id = 1),
  display_name text not null default 'Jack Doeson',
  welcome_line text not null default 'WELCOME BACK',
  avatar_url text,
  updated_at timestamptz default now()
);

-- Kartu ringkasan status (Active, Overdue, Pending, Meetings)
create table if not exists public.status_summary (
  id uuid primary key default gen_random_uuid(),
  kind text not null unique,
  value_text text not null,
  trend_text text,
  accent text not null default 'emerald',
  sort_order int not null default 0
);

-- Daftar proyek
create table if not exists public.dashboard_projects (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  status text not null,
  progress int not null check (progress >= 0 and progress <= 100),
  color text not null default 'blue',
  sort_order int not null default 0
);

-- Filter periode analytics
create table if not exists public.analytics_filter (
  id smallint primary key default 1 check (id = 1),
  label text not null default 'Last 7 Days',
  updated_at timestamptz default now()
);

-- Kartu performa + sparkline (nilai sebagai json array angka)
create table if not exists public.performance_cards (
  id uuid primary key default gen_random_uuid(),
  metric_key text not null unique,
  label text not null,
  value_display text not null,
  trend text not null default 'up',
  sparkline jsonb not null default '[]'::jsonb,
  accent text not null default 'emerald',
  sort_order int not null default 0
);

-- Titik grafik Follower Stats
create table if not exists public.follower_stats_points (
  id uuid primary key default gen_random_uuid(),
  label text not null,
  value numeric not null,
  sort_order int not null default 0
);

-- Metrik engagement (Followers, Reactions, ...)
create table if not exists public.engagement_metrics (
  id uuid primary key default gen_random_uuid(),
  metric_key text not null unique,
  value_display text not null,
  change_pct numeric,
  sort_order int not null default 0
);

-- Acquisition referrals
create table if not exists public.acquisition_referrals (
  id uuid primary key default gen_random_uuid(),
  source text not null,
  subtitle text,
  value_display text not null,
  change_text text,
  sort_order int not null default 0
);

-- RLS
alter table public.dashboard_profile enable row level security;
alter table public.status_summary enable row level security;
alter table public.dashboard_projects enable row level security;
alter table public.analytics_filter enable row level security;
alter table public.performance_cards enable row level security;
alter table public.follower_stats_points enable row level security;
alter table public.engagement_metrics enable row level security;
alter table public.acquisition_referrals enable row level security;

-- Baca publik untuk dashboard (persempit di production, mis. auth.uid())
create policy "dashboard_read_profile" on public.dashboard_profile for select using (true);
create policy "dashboard_read_status" on public.status_summary for select using (true);
create policy "dashboard_read_projects" on public.dashboard_projects for select using (true);
create policy "dashboard_read_filter" on public.analytics_filter for select using (true);
create policy "dashboard_read_performance" on public.performance_cards for select using (true);
create policy "dashboard_read_follower" on public.follower_stats_points for select using (true);
create policy "dashboard_read_engagement" on public.engagement_metrics for select using (true);
create policy "dashboard_read_acquisition" on public.acquisition_referrals for select using (true);

-- Izinkan role anon & authenticated membaca (Supabase default)
grant usage on schema public to anon, authenticated;
grant select on all tables in schema public to anon, authenticated;

-- Seed (idempotent)
insert into public.dashboard_profile (id, display_name, welcome_line, avatar_url)
values (1, 'Jack Doeson', 'WELCOME BACK', null)
on conflict (id) do update set
  display_name = excluded.display_name,
  welcome_line = excluded.welcome_line;

insert into public.status_summary (kind, value_text, trend_text, accent, sort_order) values
  ('active', '23', '+ 3 More vs last 7 days', 'emerald', 1),
  ('overdue', '12', '- 1 Less vs last 7 days', 'rose', 2),
  ('pending', '35', '+ 2 New vs last 7 days', 'amber', 3),
  ('meetings', 'None', 'No new Meetings', 'sky', 4)
on conflict (kind) do nothing;

insert into public.dashboard_projects (title, status, progress, color, sort_order) values
  ('Website Launch', 'Developing', 66, 'blue', 1),
  ('Application Update', 'Complete', 100, 'emerald', 2),
  ('Server Data Transfer', 'Canceled', 8, 'rose', 3)
on conflict do nothing;

insert into public.analytics_filter (id, label) values (1, 'Last 7 Days')
on conflict (id) do update set label = excluded.label;

insert into public.performance_cards (metric_key, label, value_display, trend, sparkline, accent, sort_order) values
  ('weekly_income', 'Weekly Income', '$1.150', 'up', '[120,118,122,125,124,128,115]'::jsonb, 'emerald', 1),
  ('new_users_a', 'New Users', '15.3k', 'flat', '[10,11,12,14,15,15,15]'::jsonb, 'sky', 2),
  ('new_users_b', 'New Users', '35.1k', 'down', '[40,38,37,36,35,35,35]'::jsonb, 'orange', 3),
  ('interactions', 'User Interactions', '1.361', 'up', '[1.1,1.15,1.2,1.25,1.3,1.35,1.36]'::jsonb, 'violet', 4)
on conflict (metric_key) do update set
  label = excluded.label,
  value_display = excluded.value_display,
  trend = excluded.trend,
  sparkline = excluded.sparkline,
  accent = excluded.accent,
  sort_order = excluded.sort_order;

insert into public.follower_stats_points (label, value, sort_order) values
  ('Mon', 1200, 1),
  ('Tue', 1350, 2),
  ('Wed', 1280, 3),
  ('Thu', 1500, 4),
  ('Fri', 1620, 5),
  ('Sat', 1750, 6),
  ('Sun', 1820, 7)
on conflict do nothing;

-- Hapus duplikat jika seed dijalankan ulang: gunakan truncate untuk dev
-- (opsional) delete from public.follower_stats_points; lalu insert lagi

insert into public.engagement_metrics (metric_key, value_display, change_pct, sort_order) values
  ('followers', '2.531', 2.5, 1),
  ('reactions', '25.351', -0.35, 2),
  ('reach', '351.12k', 24.5, 3),
  ('comments', '1.351', 0, 4)
on conflict (metric_key) do update set
  value_display = excluded.value_display,
  change_pct = excluded.change_pct;

insert into public.acquisition_referrals (source, subtitle, value_display, change_text, sort_order) values
  ('Facebook', 'Organic Users', '$53.15', 'Up by 24.5%', 1),
  ('Google', 'Sponsored Ads', '25.30%', 'Up by 0.33%', 2)
on conflict do nothing;
