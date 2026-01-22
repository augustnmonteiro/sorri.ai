-- Remove 'lite' plan option, keeping only 'free' and 'pro'

-- First, migrate any existing 'lite' users to 'free'
UPDATE public.profiles
SET plan = 'free'
WHERE plan = 'lite';

-- Drop the existing constraint
ALTER TABLE public.profiles
DROP CONSTRAINT IF EXISTS profiles_plan_check;

-- Add new constraint with only 'free' and 'pro'
ALTER TABLE public.profiles
ADD CONSTRAINT profiles_plan_check CHECK (plan IN ('free', 'pro'));

-- Update the column comment
COMMENT ON COLUMN public.profiles.plan IS 'User subscription plan: free (1 video/month, 7 days delivery) or pro (4 videos/month, 72h delivery)';
