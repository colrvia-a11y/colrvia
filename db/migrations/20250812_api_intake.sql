-- db/migrations/20250812_api_intake.sql
create table if not exists intake_flows (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,               -- e.g. 'default'
  version int not null default 1,
  is_active boolean not null default false,
  nodes jsonb not null,                    -- rule graph (see schema below)
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_intake_flows_active on intake_flows(is_active);

create table if not exists intake_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  designer_id text not null,
  flow_slug text not null,
  flow_version int not null,
  answers jsonb not null default '{}'::jsonb,
  current_node text,                       -- node id
  status text not null default 'active',   -- active | done | cancelled
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists palette_guidelines (
  id uuid primary key default gen_random_uuid(),
  name text not null,                      -- e.g. 'default'
  designer_id text,                        -- optional: scope to a designer
  brand text,                              -- 'Sherwin-Williams' | 'Behr' | null
  config jsonb not null,                   -- ratios, constraints, etc (see below)
  is_active boolean not null default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- seed a minimal flow if none exists (safe idempotent insert)
insert into intake_flows (slug, version, is_active, nodes)
select 'default', 1, true, '{
  "start": { "id":"start", "type":"single", "key":"brand", "question":"Which paint brand do you prefer?", "options":["Sherwin-Williams","Behr"], "next":"lighting" },
  "lighting": { "id":"lighting", "type":"single", "key":"lighting", "question":"How is the light in the room?", "options":["Low","Mixed","Bright"], "next":"vibe" },
  "vibe": { "id":"vibe", "type":"multi", "key":"vibe", "question":"Pick a couple words that match your vibe", "options":["Cozy","Calm","Elegant","Airy","Bold"], "min":1, "max":2, "next":{
      "if":[
        { "when": { "==":[ {"var":"answers.brand"}, "Behr" ] }, "to":"room" }
      ],
      "else":"room"
  }},
  "room": { "id":"room", "type":"single", "key":"room", "question":"What space is this for?", "options":["Living Room","Bedroom","Kitchen","Office"], "next":"done" },
  "done": { "id":"done", "type":"end" }
}'::jsonb
where not exists (select 1 from intake_flows where slug='default');

insert into palette_guidelines (name, designer_id, brand, config, is_active)
select 'default', null, null, '{
  "ratios": { "primary":0.6, "secondary":0.3, "accent":0.1 },
  "whites": { "trim":"crisp", "ceiling":"light" },
  "contrast":"balanced",
  "bounds": { "avoidTooDarkForLowLight": true }
}'::jsonb, true
where not exists (select 1 from palette_guidelines where is_active=true);
