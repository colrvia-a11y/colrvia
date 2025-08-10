-- Optional migration to add a nullable title column to stories
alter table public.stories add column if not exists title text;
comment on column public.stories.title is 'Optional user-facing name for the story';

-- No RLS changes required; existing policies still apply.
