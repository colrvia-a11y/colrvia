create table if not exists public.catalog_sw (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  hex  text not null check (hex ~* '^#[0-9A-F]{6}$'),
  lrv  numeric null,
  created_at timestamptz not null default now()
);
alter table public.catalog_sw enable row level security;
create policy if not exists "catalog_sw_select_public" on public.catalog_sw
  for select to anon, authenticated using (true);
