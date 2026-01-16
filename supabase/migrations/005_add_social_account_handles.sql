-- ==========================================
-- ADD SOCIAL MEDIA ACCOUNT HANDLES
-- ==========================================
-- These fields store the user's social media handles/usernames
-- All fields are optional

ALTER TABLE public.user_onboarding
    ADD COLUMN IF NOT EXISTS instagram_handle TEXT,
    ADD COLUMN IF NOT EXISTS tiktok_handle TEXT,
    ADD COLUMN IF NOT EXISTS youtube_handle TEXT,
    ADD COLUMN IF NOT EXISTS facebook_handle TEXT,
    ADD COLUMN IF NOT EXISTS linkedin_handle TEXT;

-- Remove old social_platforms column if it exists (no longer used)
ALTER TABLE public.user_onboarding
    DROP COLUMN IF EXISTS social_platforms;

-- ==========================================
-- UPDATE COMMENTS
-- ==========================================
COMMENT ON COLUMN public.user_onboarding.instagram_handle IS 'Instagram username/handle';
COMMENT ON COLUMN public.user_onboarding.tiktok_handle IS 'TikTok username/handle';
COMMENT ON COLUMN public.user_onboarding.youtube_handle IS 'YouTube channel handle';
COMMENT ON COLUMN public.user_onboarding.facebook_handle IS 'Facebook page name';
COMMENT ON COLUMN public.user_onboarding.linkedin_handle IS 'LinkedIn profile handle';
