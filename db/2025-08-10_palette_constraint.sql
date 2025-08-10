-- Default to [] so we never store null
alter table public.stories
  alter column palette set default '[]'::jsonb;

-- Enforce array JSON for palette
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'stories_palette_is_array_chk'
  ) THEN
    ALTER TABLE public.stories
      ADD CONSTRAINT stories_palette_is_array_chk
      CHECK (jsonb_typeof(palette) = 'array');
  END IF;
END$$;

COMMENT ON COLUMN public.stories.palette IS 'Array<Swatch> JSONB; length typically 5';
