-- Footer sidebar (tanggal update data), welcome di header, bendera locale
alter table public.company_branding
  add column if not exists data_last_updated date,
  add column if not exists welcome_user_label text default 'admin',
  add column if not exists locale_flag_emoji text default '🇲🇾';

comment on column public.company_branding.data_last_updated is 'Tampil di kotak Update di bawah sidebar';
comment on column public.company_branding.welcome_user_label is 'Nama untuk teks Welcome, … di header';
comment on column public.company_branding.locale_flag_emoji is 'Emoji bendera / locale (bisa diganti URL gambar di UI nanti)';

update public.company_branding
set
  data_last_updated = coalesce(data_last_updated, current_date - 1),
  welcome_user_label = coalesce(welcome_user_label, 'admin'),
  locale_flag_emoji = coalesce(locale_flag_emoji, '🇲🇾')
where id = 1;
