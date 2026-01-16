-- Add user roles to profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin'));

-- Add edited video URL to scripts (for admin uploads)
ALTER TABLE public.scripts
ADD COLUMN IF NOT EXISTS edited_video_url TEXT;

-- Create storage bucket for edited videos
INSERT INTO storage.buckets (id, name, public)
VALUES ('edited-videos', 'edited-videos', false)
ON CONFLICT (id) DO NOTHING;

-- Drop existing policies if they exist, then recreate
DROP POLICY IF EXISTS "Admins can upload edited videos" ON storage.objects;
DROP POLICY IF EXISTS "Admins can view edited videos" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own edited videos" ON storage.objects;
DROP POLICY IF EXISTS "Admins can view all raw videos" ON storage.objects;
DROP POLICY IF EXISTS "Admins can view all scripts" ON public.scripts;
DROP POLICY IF EXISTS "Admins can update all scripts" ON public.scripts;

-- RLS policies for edited-videos bucket
CREATE POLICY "Admins can upload edited videos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'edited-videos' AND
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Admins can view edited videos"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'edited-videos' AND
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Users can view their own edited videos"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'edited-videos' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow admins to view raw videos from all users
CREATE POLICY "Admins can view all raw videos"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'raw-videos' AND
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- RLS policy for admins to view all scripts in editing
CREATE POLICY "Admins can view all scripts"
ON public.scripts FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- RLS policy for admins to update scripts
CREATE POLICY "Admins can update all scripts"
ON public.scripts FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Create index for faster queries on editing status
CREATE INDEX IF NOT EXISTS idx_scripts_editing_status
ON public.scripts (status, expected_delivery_at)
WHERE status = 'editing';
