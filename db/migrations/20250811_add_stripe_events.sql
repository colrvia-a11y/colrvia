-- Stores processed Stripe webhook events for idempotency / audit.
create table if not exists public.stripe_events (
  id text primary key,
  type text not null,
  created_at timestamptz not null default now(),
  processed_at timestamptz not null default now(),
  raw jsonb not null
);

-- Optional: limit who can read rows; only service role should write.
alter table public.stripe_events enable row level security;

do $$
begin
  if not exists (select 1 from pg_policies where tablename = 'stripe_events' and policyname = 'allow-read-authenticated') then
    create policy "allow-read-authenticated"
      on public.stripe_events
      for select
      to authenticated
      using (true);
  end if;
end $$;
