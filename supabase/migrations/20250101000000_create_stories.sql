create table if not exists public.stories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text,
  status text not null default 'queued' check (status in ('draft','queued','processing','ready','failed')),
  input jsonb not null,
  result jsonb,
  error text,
  idempotency_key text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists stories_user_id_idx on public.stories (user_id);
create unique index if not exists stories_idem_uidx on public.stories (user_id, idempotency_key) where idempotency_key is not null;
create or replace function public.touch_stories_updated_at()
returns trigger language plpgsql as $$ begin new.updated_at = now(); return new; end; $$;
drop trigger if exists trg_touch_stories on public.stories;
create trigger trg_touch_stories before update on public.stories for each row execute function public.touch_stories_updated_at();
alter table public.stories enable row level security;
create policy "read own stories" on public.stories for select using (auth.uid() = user_id);
create policy "insert own stories" on public.stories for insert with check (auth.uid() = user_id);
create policy "update own stories" on public.stories for update using (auth.uid() = user_id);
