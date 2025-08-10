-- Run this once in Supabase SQL editor for your project
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";
create table if not exists public.stories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  designer text not null,
  vibe text not null,
  brand text not null,
  room_type text,
  lighting text not null,
  has_warm_wood boolean not null default false,
  photo_url text,
  palette jsonb not null,
  placements jsonb not null,
  narrative text not null,
  preview_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.stories enable row level security;
create index if not exists idx_stories_user_created on public.stories(user_id, created_at desc);
-- auto-updated updated_at
create or replace function public.set_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;
select 1; -- harmless to ensure file runs even if function exists
-- drop + recreate trigger
drop trigger if exists trg_stories_updated_at on public.stories;
create trigger trg_stories_updated_at before update on public.stories
  for each row execute function public.set_updated_at();
-- RLS: owner can do everything
drop policy if exists "stories_owner_select" on public.stories;
drop policy if exists "stories_owner_crud" on public.stories;
create policy "stories_owner_select" on public.stories
  for select using ( auth.uid() = user_id );
create policy "stories_owner_crud" on public.stories
  for all using ( auth.uid() = user_id ) with check ( auth.uid() = user_id );
