-- Add metadata fields to scripts table to support new subject generation prompt
ALTER TABLE public.scripts
    ADD COLUMN IF NOT EXISTS hashtags TEXT[] DEFAULT '{}',
    ADD COLUMN IF NOT EXISTS objective TEXT,
    ADD COLUMN IF NOT EXISTS format TEXT,
    ADD COLUMN IF NOT EXISTS pillar TEXT,
    ADD COLUMN IF NOT EXISTS funnel_stage TEXT,
    ADD COLUMN IF NOT EXISTS hook_style TEXT,
    ADD COLUMN IF NOT EXISTS content_angle TEXT;

-- Add comments for documentation
COMMENT ON COLUMN public.scripts.hashtags IS 'Array of hashtags for the script';
COMMENT ON COLUMN public.scripts.objective IS 'Marketing objective (attract, educate, engage, convert)';
COMMENT ON COLUMN public.scripts.format IS 'Video format (list, story, myth/truth, etc)';
COMMENT ON COLUMN public.scripts.pillar IS 'Content pillar (educational, objection handling, etc)';
COMMENT ON COLUMN public.scripts.funnel_stage IS 'Marketing funnel stage (top, middle, bottom)';
COMMENT ON COLUMN public.scripts.hook_style IS 'Style of the hook/intro';
COMMENT ON COLUMN public.scripts.content_angle IS 'Specific angle or differentiator for this content';
