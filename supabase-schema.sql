-- Supabase setup for Marchao Sanma sharing/stat foundations.
-- Use anon/publishable key on the frontend. Do not expose service_role keys.

create table if not exists public.shared_paifus (
  share_id text primary key,
  created_at timestamptz not null default now(),
  title text not null,
  paifu_json jsonb not null,
  settlement_json jsonb,
  is_public boolean not null default true
);

create index if not exists shared_paifus_public_created_at_idx
  on public.shared_paifus (is_public, created_at desc);

create table if not exists public.hanchan_stats (
  id bigint generated always as identity primary key,
  hanchan_id text not null,
  rank integer not null,
  settlement_point integer not null,
  chip_count integer not null,
  total_hands integer not null,
  win_count integer not null,
  deal_in_count integer not null,
  created_at timestamptz not null default now()
);

create index if not exists hanchan_stats_hanchan_id_idx
  on public.hanchan_stats (hanchan_id);

-- Initial public test policies. Tighten these with Auth / RLS / Edge Functions
-- before using the data for trusted rankings.
alter table public.shared_paifus enable row level security;
alter table public.hanchan_stats enable row level security;

create policy "Public can read public shared paifus"
  on public.shared_paifus
  for select
  using (is_public = true);

create policy "Public can insert shared paifus for test"
  on public.shared_paifus
  for insert
  with check (is_public = true);

create policy "Public can insert hanchan stats for test"
  on public.hanchan_stats
  for insert
  with check (true);
