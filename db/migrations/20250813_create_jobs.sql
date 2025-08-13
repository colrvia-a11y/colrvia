-- Jobs table for render workflow
create table if not exists public.jobs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'queued' check (status in ('queued','processing','ready','failed')),
  input jsonb not null,
  result jsonb,
  error text,
  idempotency_key text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists jobs_user_id_idx on public.jobs (user_id);
create unique index if not exists jobs_idempotency_key_uidx on public.jobs (user_id, idempotency_key) where idempotency_key is not null;

create or replace function public.touch_jobs_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end; $$;

drop trigger if exists trg_touch_jobs on public.jobs;
create trigger trg_touch_jobs before update on public.jobs
for each row execute function public.touch_jobs_updated_at();

alter table public.jobs enable row level security;

create policy if not exists "read own jobs" on public.jobs
  for select using (auth.uid() = user_id);

create policy if not exists "insert own jobs" on public.jobs
  for insert with check (auth.uid() = user_id);

create policy if not exists "update own jobs" on public.jobs
  for update using (auth.uid() = user_id);
