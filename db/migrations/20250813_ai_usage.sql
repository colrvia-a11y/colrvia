-- Track per-event AI model usage & cost
create table if not exists public.ai_usage (
  id uuid primary key default gen_random_uuid(),
  user_id uuid null references auth.users(id) on delete set null,
  -- Optional logical session or grouping key (intake session id, consult room id, etc.)
  session_id text null,
  event text not null,                 -- e.g. palette_orchestrator | vision_room_profile | intake_finalize | chat_turn
  model text not null,
  input_tokens int not null default 0,
  output_tokens int not null default 0,
  total_tokens int not null default 0,
  cost_usd numeric(12,6) not null default 0,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.ai_usage enable row level security;

-- Allow authenticated users to read their own usage rows
do $$
begin
  if not exists (select 1 from pg_policies where tablename='ai_usage' and policyname='ai_usage_own_select') then
    create policy ai_usage_own_select on public.ai_usage
      for select to authenticated
      using (auth.uid() = user_id);
  end if;
end $$;

-- Writes always performed with service role (no insert/update policies needed for regular users)

create index if not exists idx_ai_usage_created_at on public.ai_usage(created_at desc);
create index if not exists idx_ai_usage_user_created on public.ai_usage(user_id, created_at desc);
create index if not exists idx_ai_usage_event_created on public.ai_usage(event, created_at desc);
