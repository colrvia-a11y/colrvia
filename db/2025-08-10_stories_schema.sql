-- Stories schema & RLS (idempotent)
-- Run this in Supabase SQL Editor for the production project.

create table if not exists public.stories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  designer_key text not null,
  brand text not null check (brand in ('sherwin_williams','behr')),
  inputs jsonb not null default '{}'::jsonb,
  palette jsonb not null default '{}'::jsonb,
  narrative text,
  has_variants boolean not null default false,
  status text not null default 'new',
  created_at timestamptz not null default now()
);

alter table public.stories enable row level security;

drop policy if exists "stories read own" on public.stories;
create policy "stories read own" on public.stories
for select using (auth.uid() = user_id);

drop policy if exists "stories write own" on public.stories;
create policy "stories write own" on public.stories
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create or replace function public.set_auth_user_id()
returns trigger language plpgsql as $$
begin
  if new.user_id is null then
    new.user_id := auth.uid();
  end if;
  return new;
end $$;

drop trigger if exists trg_set_auth_user_id on public.stories;
create trigger trg_set_auth_user_id
before insert on public.stories
for each row execute function public.set_auth_user_id();

alter table public.stories
  add column if not exists has_variants boolean not null default false;

alter table public.stories
  add column if not exists status text not null default 'new';

alter table public.stories
  alter column palette set default '{}'::jsonb,
  alter column inputs set default '{}'::jsonb;
