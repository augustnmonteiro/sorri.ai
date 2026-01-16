-- Note: Using gen_random_uuid() which is built into PostgreSQL 13+
-- No extension needed

-- ==========================================
-- PROFILES TABLE (extends auth.users)
-- ==========================================
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    onboarding_completed BOOLEAN DEFAULT FALSE,
    onboarding_completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
    ON public.profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name)
    VALUES (
        NEW.id,
        NEW.email,
        NEW.raw_user_meta_data->>'full_name'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==========================================
-- ONBOARDING DATA TABLE
-- ==========================================
CREATE TABLE public.user_onboarding (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,

    -- Step 1: Specialty
    specialty TEXT NOT NULL,

    -- Step 2: Clinic Name
    clinic_name TEXT NOT NULL,

    -- Step 3: Tone of Voice
    tone_of_voice TEXT NOT NULL CHECK (
        tone_of_voice IN ('professional', 'friendly', 'educational', 'humorous', 'empathetic')
    ),

    -- Step 4: Video Edit Style
    edit_style TEXT NOT NULL CHECK (
        edit_style IN ('dynamic', 'calm', 'trending', 'minimal')
    ),

    -- Step 5: Target Audience
    target_audience TEXT[] DEFAULT '{}',

    -- Step 6: Social Platforms
    social_platforms TEXT[] DEFAULT '{}',

    -- Step 7: Posting Frequency
    posting_frequency TEXT NOT NULL CHECK (
        posting_frequency IN ('daily', '3-4-per-week', '1-2-per-week', 'weekly', 'biweekly')
    ),

    -- Step 8: Content Goals
    content_goals TEXT[] DEFAULT '{}',

    -- Step 9: Brand Colors
    brand_color_primary TEXT DEFAULT '#0066E0',
    brand_color_secondary TEXT DEFAULT '#00C4CC',

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE public.user_onboarding ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own onboarding"
    ON public.user_onboarding FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own onboarding"
    ON public.user_onboarding FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own onboarding"
    ON public.user_onboarding FOR UPDATE
    USING (auth.uid() = user_id);

-- ==========================================
-- SCRIPTS TABLE (Video Pipeline)
-- ==========================================
CREATE TYPE script_status AS ENUM ('script', 'recorded', 'editing', 'published');

CREATE TABLE public.scripts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,

    -- Content
    title TEXT NOT NULL,
    topic TEXT,
    content TEXT NOT NULL,
    hook TEXT,
    cta TEXT,

    -- Status & Pipeline
    status script_status DEFAULT 'script',
    status_order INTEGER DEFAULT 0,

    -- Video/Media
    video_url TEXT,
    edited_video_url TEXT,
    thumbnail_url TEXT,

    -- Metadata
    duration_estimate INTEGER,
    platform TEXT,
    scheduled_for TIMESTAMPTZ,
    published_at TIMESTAMPTZ,

    -- AI Generation
    ai_generated BOOLEAN DEFAULT TRUE,
    generation_params JSONB,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    recorded_at TIMESTAMPTZ,
    editing_started_at TIMESTAMPTZ,
    editing_completed_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX idx_scripts_user_id ON public.scripts(user_id);
CREATE INDEX idx_scripts_status ON public.scripts(status);
CREATE INDEX idx_scripts_user_status ON public.scripts(user_id, status);

-- RLS Policies
ALTER TABLE public.scripts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own scripts"
    ON public.scripts FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own scripts"
    ON public.scripts FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own scripts"
    ON public.scripts FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own scripts"
    ON public.scripts FOR DELETE
    USING (auth.uid() = user_id);

-- ==========================================
-- INSTAGRAM CONNECTIONS TABLE
-- ==========================================
CREATE TABLE public.instagram_connections (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
    instagram_user_id TEXT NOT NULL,
    access_token TEXT NOT NULL,
    token_expires_at TIMESTAMPTZ,
    instagram_username TEXT,
    connected_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE public.instagram_connections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own instagram connection"
    ON public.instagram_connections FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own instagram connection"
    ON public.instagram_connections FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own instagram connection"
    ON public.instagram_connections FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own instagram connection"
    ON public.instagram_connections FOR DELETE
    USING (auth.uid() = user_id);

-- ==========================================
-- UPDATED_AT TRIGGER
-- ==========================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at_profiles
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_onboarding
    BEFORE UPDATE ON public.user_onboarding
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_scripts
    BEFORE UPDATE ON public.scripts
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
