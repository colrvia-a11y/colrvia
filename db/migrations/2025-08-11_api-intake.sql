-- Intake flows: editable, versioned rule graphs
create table if not exists intake_flows (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  version int not null default 1,
  is_active boolean not null default false,
  nodes jsonb not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_intake_flows_active on intake_flows(is_active);

-- Per-user (or anonymous) sessions
create table if not exists intake_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  designer_id text not null,
  flow_slug text not null,
  flow_version int not null,
  answers jsonb not null default '{}'::jsonb,
  current_node text,
  status text not null default 'active',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Editable palette guidelines
create table if not exists palette_guidelines (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  designer_id text,
  brand text,
  config jsonb not null,
  is_active boolean not null default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Seed active flow + guidelines if none exist
insert into intake_flows (slug, version, is_active, nodes)
select 'default', 1, true, '{
  "start": { "id":"start", "type":"single", "key":"room_type", "question":"Which room?", "options":["Foyer","Living","Dining","Kitchen","Pantry","Breakfast Nook","Bedroom","Kid's Room","Nursery","Home Office","Bathroom","Powder Room","Laundry/Mudroom","Hallway","Stairwell","Loft/Bonus","Media Room","Sunroom","Basement","Gym","Closet","Garage","Other"], "next":"primary_use" },
  "primary_use": { "id":"primary_use", "type":"multi", "key":"primary_use", "question":"Top uses (pick up to 3)", "options":["Relax","Work/Study","Entertain","Sleep","Play","Eat","Cook","Get ready","Laundry","Storage","Exercise","Other"], "max":3, "next":"desired_vibe" },
  "desired_vibe": { "id":"desired_vibe", "type":"single", "key":"desired_vibe", "question":"Desired vibe", "options":["Calm","Airy","Cozy","Focused","Luxe","Energizing","Grounded","Fresh","Moody"], "next":"avoid_vibe" },
  "avoid_vibe": { "id":"avoid_vibe", "type":"single", "key":"avoid_vibe", "question":"Vibe you do NOT want", "next":"lighting" },
  "lighting": { "id":"lighting", "type":"single", "key":"lighting", "question":"How is the lighting? (e.g., lots of daylight, warm artificial light)", "next":"room_photos" },
  "room_photos": { "id":"room_photos", "type":"multi", "key":"room_photos", "question":"Room photos (8am/noon/4pm; lights off + on)", "helper":"Daylight near a window; include one shot with white paper for reference.", "next":"existing_elements_desc" },
  "existing_elements_desc": { "id":"existing_elements_desc", "type":"single", "key":"existing_elements_desc", "question":"Describe key existing items (optional)", "next":"existing_elements_photos" },
  "existing_elements_photos": { "id":"existing_elements_photos", "type":"multi", "key":"existing_elements_photos", "question":"Photos of existing items", "next":"done" },
  "done": { "id":"done", "type":"end" }
}'::jsonb
where not exists (select 1 from intake_flows where is_active = true);

insert into palette_guidelines (name, designer_id, brand, config, is_active)
select 'default', null, null, '{
  "ratios": { "primary":0.6, "secondary":0.3, "accent":0.1 },
  "whites": { "trim":"crisp", "ceiling":"light" },
  "contrast":"balanced",
  "bounds": { "avoidTooDarkForLowLight": true }
}'::jsonb, true
where not exists (select 1 from palette_guidelines where is_active = true);
