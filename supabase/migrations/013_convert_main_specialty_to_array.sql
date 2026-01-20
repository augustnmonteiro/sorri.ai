-- Convert main_specialty from TEXT to TEXT[] to support multiple specialties (up to 2)

-- Alter the column type to TEXT[], converting existing single values to arrays
ALTER TABLE public.user_onboarding
ALTER COLUMN main_specialty TYPE TEXT[]
USING CASE
    WHEN main_specialty IS NULL THEN NULL
    ELSE ARRAY[main_specialty]
END;

-- Update the comment
COMMENT ON COLUMN public.user_onboarding.main_specialty IS 'Primary dental specialties (up to 2)';
