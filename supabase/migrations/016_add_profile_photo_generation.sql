-- Add AI profile photo generation fields to profiles table

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS ai_profile_photo_url TEXT,
ADD COLUMN IF NOT EXISTS ai_profile_photo_generated_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS ai_profile_photo_generations_count INTEGER DEFAULT 0;

-- Create storage bucket for profile photos (public so images can be served)
INSERT INTO storage.buckets (id, name, public)
VALUES ('profile-photos', 'profile-photos', true)
ON CONFLICT (id) DO NOTHING;

-- RLS policies for profile-photos bucket

-- Anyone can view profile photos (bucket is public)
CREATE POLICY "Anyone can view profile photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'profile-photos');

-- Users can upload their own profile photos
CREATE POLICY "Users can upload their own profile photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'profile-photos' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Users can delete their own profile photos
CREATE POLICY "Users can delete their own profile photos"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'profile-photos' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
