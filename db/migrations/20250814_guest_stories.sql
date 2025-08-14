-- Allow guest stories (nullable user_id) and add status column if missing
ALTER TABLE public.stories ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE public.stories ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending';
