-- Add description column to scripts table
ALTER TABLE public.scripts
    ADD COLUMN IF NOT EXISTS description TEXT;

COMMENT ON COLUMN public.scripts.description IS 'Generated description for the social media post';
