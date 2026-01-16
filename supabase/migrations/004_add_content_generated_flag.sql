-- ==========================================
-- ADD content_generated FLAG TO SCRIPTS TABLE
-- ==========================================
-- This flag indicates whether the full script content has been generated.
-- When subjects are created after onboarding, they only have titles.
-- The full content is generated lazily when the user opens the script.

ALTER TABLE public.scripts
    ADD COLUMN IF NOT EXISTS content_generated BOOLEAN DEFAULT FALSE;

-- Update existing scripts to have content_generated = true
-- (they already have content)
UPDATE public.scripts SET content_generated = TRUE WHERE content IS NOT NULL AND content != '';

-- Make content nullable since subjects won't have content initially
ALTER TABLE public.scripts
    ALTER COLUMN content DROP NOT NULL;

COMMENT ON COLUMN public.scripts.content_generated IS 'Whether the full script content has been generated (lazy generation)';
