-- jobs table for render workflow
create table if not exists public.jobs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  status text not null check (status in ('queued','processing','ready','failed')) default 'queued',
  input jsonb not null default '{}'::jsonb,
  result jsonb,
  error text,
  idempotency_key text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists jobs_user_idem_idx on public.jobs(user_id, idempotency_key);
create index if not exists jobs_status_idx on public.jobs(status);

-- updated_at trigger
create or replace function public.tg_jobs_updated_at()
returns trigger language plpgsql as $$
begin
  NEW.updated_at = now();
  return NEW;
end;$$;

create trigger tg_jobs_updated_at before update on public.jobs
for each row execute procedure public.tg_jobs_updated_at();

-- RLS
alter table public.jobs enable row level security;

create policy "jobs_select_own" on public.jobs for select using (auth.uid() = user_id);
create policy "jobs_insert_own" on public.jobs for insert with check (auth.uid() = user_id);
create policy "jobs_update_own" on public.jobs for update using (auth.uid() = user_id);

-- Edge function will need service role for updating result/error; alternatively you can create a SECURITY DEFINER function.
