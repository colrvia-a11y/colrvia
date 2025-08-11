-- intakes table for onboarding persistence
create table if not exists public.intakes (
  id uuid primary key default gen_random_uuid(),
  token_hash text not null,              -- sha256 of secret token
  designer_id text not null,
  user_id uuid null references auth.users(id) on delete set null,
  state jsonb not null default '{}'::jsonb,
  messages jsonb not null default '[]'::jsonb,
  done boolean not null default false,
  story_id uuid null references public.stories(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_intakes_updated_at on public.intakes(updated_at desc);

-- RLS: locked down; only service-role is allowed (API checks token)
alter table public.intakes enable row level security;

drop policy if exists "intakes deny all" on public.intakes;
create policy "intakes deny all" on public.intakes
  as restrictive for all
  using (false)
  with check (false);
