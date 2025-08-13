-- Add story_id column to jobs for linking to created stories
alter table public.jobs add column if not exists story_id uuid references public.stories(id) on delete set null;
create index if not exists jobs_story_id_idx on public.jobs(story_id);
