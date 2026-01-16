-- Add columns to store original AI-generated content for scripts
-- This allows users to edit their scripts while preserving the original version

ALTER TABLE public.scripts
ADD COLUMN IF NOT EXISTS original_content TEXT,
ADD COLUMN IF NOT EXISTS original_hook TEXT,
ADD COLUMN IF NOT EXISTS original_description TEXT;

-- Add comment to explain the columns
COMMENT ON COLUMN public.scripts.original_content IS 'Stores the original AI-generated content before user edits';
COMMENT ON COLUMN public.scripts.original_hook IS 'Stores the original AI-generated hook before user edits';
COMMENT ON COLUMN public.scripts.original_description IS 'Stores the original AI-generated description before user edits';
