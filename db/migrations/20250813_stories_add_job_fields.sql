-- Add idempotency and render lifecycle columns to stories if absent
alter table public.stories add column if not exists status text not null default 'queued' check (status in ('draft','queued','processing','ready','failed'));
alter table public.stories add column if not exists input jsonb not null default '{}'::jsonb;
alter table public.stories add column if not exists result jsonb;
alter table public.stories add column if not exists error text;
alter table public.stories add column if not exists idempotency_key text;
create unique index if not exists stories_idem_uidx on public.stories(user_id, idempotency_key) where idempotency_key is not null;
create index if not exists stories_status_idx on public.stories(status);

-- updated_at trigger
create or replace function public.tg_stories_updated_at()
returns trigger language plpgsql as $$
begin
  NEW.updated_at = now();
  return NEW;
end;$$;

drop trigger if exists tg_stories_updated_at on public.stories;
create trigger tg_stories_updated_at before update on public.stories
for each row execute procedure public.tg_stories_updated_at();

-- RLS policies
alter table public.stories enable row level security;
create policy if not exists "stories_select_own" on public.stories for select using (auth.uid() = user_id);
create policy if not exists "stories_insert_own" on public.stories for insert with check (auth.uid() = user_id);
create policy if not exists "stories_update_own" on public.stories for update using (auth.uid() = user_id);
