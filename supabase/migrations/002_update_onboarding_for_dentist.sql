-- ==========================================
-- UPDATE USER_ONBOARDING TABLE FOR DENTIST-FOCUSED QUESTIONS
-- ==========================================

-- Drop old constraints and columns
ALTER TABLE public.user_onboarding
    DROP CONSTRAINT IF EXISTS user_onboarding_tone_of_voice_check,
    DROP CONSTRAINT IF EXISTS user_onboarding_edit_style_check,
    DROP CONSTRAINT IF EXISTS user_onboarding_posting_frequency_check;

-- Remove old columns
ALTER TABLE public.user_onboarding
    DROP COLUMN IF EXISTS specialty,
    DROP COLUMN IF EXISTS clinic_name,
    DROP COLUMN IF EXISTS edit_style,
    DROP COLUMN IF EXISTS target_audience,
    DROP COLUMN IF EXISTS posting_frequency,
    DROP COLUMN IF EXISTS content_goals;

-- Change tone_of_voice from TEXT to TEXT[] (array for multiple selections)
ALTER TABLE public.user_onboarding
    ALTER COLUMN tone_of_voice TYPE TEXT[] USING ARRAY[tone_of_voice];

-- ==========================================
-- 1) PERFIL DO DENTISTA E POSICIONAMENTO
-- ==========================================
ALTER TABLE public.user_onboarding
    ADD COLUMN IF NOT EXISTS main_specialty TEXT,
    ADD COLUMN IF NOT EXISTS focus_procedures TEXT,
    ADD COLUMN IF NOT EXISTS real_differentiator TEXT,
    ADD COLUMN IF NOT EXISTS how_to_be_remembered TEXT;

-- ==========================================
-- 2) TOM DE VOZ E IDENTIDADE
-- ==========================================
-- tone_of_voice already exists as TEXT[], keeping it
ALTER TABLE public.user_onboarding
    ADD COLUMN IF NOT EXISTS language_to_avoid TEXT,
    ADD COLUMN IF NOT EXISTS persona TEXT;

-- Add check constraint for persona
ALTER TABLE public.user_onboarding
    ADD CONSTRAINT user_onboarding_persona_check CHECK (
        persona IS NULL OR persona IN ('authority', 'advisor', 'serious_doctor', 'storyteller')
    );

-- ==========================================
-- 3) PUBLICO-ALVO E PACIENTE IDEAL
-- ==========================================
ALTER TABLE public.user_onboarding
    ADD COLUMN IF NOT EXISTS ideal_patient TEXT,
    ADD COLUMN IF NOT EXISTS patient_pains TEXT,
    ADD COLUMN IF NOT EXISTS main_objection TEXT,
    ADD COLUMN IF NOT EXISTS decision_delay_reason TEXT,
    ADD COLUMN IF NOT EXISTS common_questions TEXT;

-- ==========================================
-- 4) SERVICOS QUE DAO LUCRO E AGENDA
-- ==========================================
ALTER TABLE public.user_onboarding
    ADD COLUMN IF NOT EXISTS priority_procedures TEXT,
    ADD COLUMN IF NOT EXISTS procedures_to_hide TEXT,
    ADD COLUMN IF NOT EXISTS current_ticket TEXT,
    ADD COLUMN IF NOT EXISTS target_ticket TEXT,
    ADD COLUMN IF NOT EXISTS main_bottleneck TEXT;

-- Add check constraint for main_bottleneck
ALTER TABLE public.user_onboarding
    ADD CONSTRAINT user_onboarding_main_bottleneck_check CHECK (
        main_bottleneck IS NULL OR main_bottleneck IN ('attraction', 'conversion', 'attendance', 'closing', 'retention')
    );

-- ==========================================
-- 5) PROVA, AUTORIDADE E CONFIANCA
-- ==========================================
ALTER TABLE public.user_onboarding
    ADD COLUMN IF NOT EXISTS has_authorized_cases BOOLEAN,
    ADD COLUMN IF NOT EXISTS proof_types TEXT[] DEFAULT '{}',
    ADD COLUMN IF NOT EXISTS technical_differentiators TEXT,
    ADD COLUMN IF NOT EXISTS achievements TEXT,
    ADD COLUMN IF NOT EXISTS connection_story TEXT;

-- ==========================================
-- 6) DIFERENCIACAO POR ESPECIALIDADE (BONUS)
-- ==========================================
ALTER TABLE public.user_onboarding
    ADD COLUMN IF NOT EXISTS flagship_procedure TEXT,
    ADD COLUMN IF NOT EXISTS flagship_fear TEXT,
    ADD COLUMN IF NOT EXISTS myth_to_break TEXT;

-- ==========================================
-- UPDATE COMMENTS
-- ==========================================
COMMENT ON TABLE public.user_onboarding IS 'Stores dentist onboarding data for personalized content generation';

COMMENT ON COLUMN public.user_onboarding.main_specialty IS 'Primary dental specialty (e.g., orthodontics, implantology)';
COMMENT ON COLUMN public.user_onboarding.focus_procedures IS 'Main procedures the dentist focuses on';
COMMENT ON COLUMN public.user_onboarding.real_differentiator IS 'What differentiates this dentist (technique, technology, care)';
COMMENT ON COLUMN public.user_onboarding.how_to_be_remembered IS 'Personal brand positioning statement';

COMMENT ON COLUMN public.user_onboarding.tone_of_voice IS 'Communication tone (2-3 selections): premium, friendly, humorous, technical, direct, welcoming';
COMMENT ON COLUMN public.user_onboarding.language_to_avoid IS 'Words/phrases to avoid in content';
COMMENT ON COLUMN public.user_onboarding.persona IS 'Communication persona: authority, advisor, serious_doctor, storyteller';

COMMENT ON COLUMN public.user_onboarding.ideal_patient IS 'Description of ideal patient profile';
COMMENT ON COLUMN public.user_onboarding.patient_pains IS 'Main pain points of target patients';
COMMENT ON COLUMN public.user_onboarding.main_objection IS 'Most common objection before closing';
COMMENT ON COLUMN public.user_onboarding.decision_delay_reason IS 'Why patients delay their decision';
COMMENT ON COLUMN public.user_onboarding.common_questions IS 'Frequently asked questions from patients';

COMMENT ON COLUMN public.user_onboarding.priority_procedures IS 'Procedures to prioritize in marketing (next 30-90 days)';
COMMENT ON COLUMN public.user_onboarding.procedures_to_hide IS 'Procedures done but not to be promoted';
COMMENT ON COLUMN public.user_onboarding.current_ticket IS 'Current average ticket value';
COMMENT ON COLUMN public.user_onboarding.target_ticket IS 'Target average ticket value';
COMMENT ON COLUMN public.user_onboarding.main_bottleneck IS 'Main business bottleneck: attraction, conversion, attendance, closing, retention';

COMMENT ON COLUMN public.user_onboarding.has_authorized_cases IS 'Whether dentist has authorized clinical cases with consent';
COMMENT ON COLUMN public.user_onboarding.proof_types IS 'Types of social proof available';
COMMENT ON COLUMN public.user_onboarding.technical_differentiators IS 'Technical equipment/methods that provide confidence';
COMMENT ON COLUMN public.user_onboarding.achievements IS 'Professional achievements and credentials';
COMMENT ON COLUMN public.user_onboarding.connection_story IS 'Personal story that creates connection with patients';

COMMENT ON COLUMN public.user_onboarding.flagship_procedure IS 'Main flagship procedure';
COMMENT ON COLUMN public.user_onboarding.flagship_fear IS 'Fear about communicating the flagship procedure';
COMMENT ON COLUMN public.user_onboarding.myth_to_break IS 'Common myth in the niche to debunk';
