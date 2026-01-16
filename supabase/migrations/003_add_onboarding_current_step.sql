-- ==========================================
-- ADD CURRENT_STEP TO TRACK ONBOARDING PROGRESS
-- ==========================================

-- Add current_step column to track where the user is in the onboarding flow
ALTER TABLE public.user_onboarding
    ADD COLUMN IF NOT EXISTS current_step INTEGER DEFAULT 1;

-- Add constraint to ensure step is within valid range (1-15)
ALTER TABLE public.user_onboarding
    ADD CONSTRAINT user_onboarding_current_step_check CHECK (
        current_step >= 1 AND current_step <= 15
    );

COMMENT ON COLUMN public.user_onboarding.current_step IS 'Current step in the onboarding flow (1-15), used to resume progress';