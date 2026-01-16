-- Add plan field to profiles
ALTER TABLE public.profiles
ADD COLUMN plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'lite', 'pro'));

-- Add monthly video edit tracking
ALTER TABLE public.profiles
ADD COLUMN video_edits_this_month INTEGER DEFAULT 0,
ADD COLUMN video_edits_reset_at TIMESTAMPTZ DEFAULT NOW();

-- Add editing request fields to scripts table
ALTER TABLE public.scripts
ADD COLUMN editing_notes TEXT,
ADD COLUMN raw_video_url TEXT,
ADD COLUMN expected_delivery_at TIMESTAMPTZ;

-- Create storage bucket for raw videos (uploaded by users)
INSERT INTO storage.buckets (id, name, public)
VALUES ('raw-videos', 'raw-videos', false)
ON CONFLICT (id) DO NOTHING;

-- Create storage bucket for edited videos (delivered to users)
INSERT INTO storage.buckets (id, name, public)
VALUES ('edited-videos', 'edited-videos', false)
ON CONFLICT (id) DO NOTHING;

-- RLS policies for raw-videos bucket
CREATE POLICY "Users can upload their own videos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'raw-videos' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can view their own raw videos"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'raw-videos' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can delete their own raw videos"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'raw-videos' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- RLS policies for edited-videos bucket
CREATE POLICY "Users can view their own edited videos"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'edited-videos' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
