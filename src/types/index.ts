// Auth Types
export type UserPlan = 'free' | 'pro'
export type UserRole = 'user' | 'admin'

export interface User {
  id: string
  email: string
  full_name?: string
  avatar_url?: string
  onboarding_completed: boolean
  onboarding_completed_at?: string
  plan: UserPlan
  role: UserRole
  video_edits_this_month: number
  video_edits_reset_at?: string
  created_at: string
  updated_at: string
}

// Onboarding Types
export type ToneOption = 'premium' | 'friendly' | 'humorous' | 'technical' | 'direct' | 'welcoming'

export type PersonaOption = 'authority' | 'advisor' | 'serious_doctor' | 'storyteller'

export type BottleneckOption = 'attraction' | 'conversion' | 'attendance' | 'closing' | 'retention'

export interface OnboardingData {
  // 1) Perfil do dentista e posicionamento
  main_specialty: string[]
  focus_procedures: string
  real_differentiator: string
  how_to_be_remembered: string

  // 2) Tom de voz e identidade
  tone_of_voice: ToneOption[]
  language_to_avoid: string
  persona: PersonaOption

  // 3) Publico-alvo e paciente ideal
  ideal_patient: string
  patient_pains: string
  main_objection: string
  decision_delay_reason: string
  common_questions: string

  // 4) Servicos que dao lucro e agenda
  priority_procedures: string
  procedures_to_hide: string
  current_ticket: string
  target_ticket: string
  main_bottleneck: BottleneckOption

  // 5) Prova, autoridade e confianca
  has_authorized_cases: boolean
  proof_types: string[]
  technical_differentiators: string
  achievements: string
  connection_story: string

  // 6) Diferenciacao por especialidade (bonus)
  flagship_procedure: string
  flagship_fear: string
  myth_to_break: string

  // Social accounts (all optional)
  instagram_handle: string
  tiktok_handle: string
  youtube_handle: string
  facebook_handle: string
  linkedin_handle: string
  whatsapp_number: string
}

// Script Types
export type ScriptStatus = 'script' | 'recorded' | 'editing' | 'published'

export interface Script {
  id: string
  user_id: string
  title: string
  topic?: string
  content?: string | null
  hook?: string
  cta?: string
  status: ScriptStatus
  status_order: number
  video_url?: string
  edited_video_url?: string
  thumbnail_url?: string
  duration_estimate?: number
  platform?: string
  scheduled_for?: string
  published_at?: string
  ai_generated: boolean
  content_generated: boolean
  generation_params?: Record<string, unknown>
  created_at: string
  updated_at: string
  recorded_at?: string
  editing_started_at?: string
  editing_completed_at?: string
  editing_notes?: string
  raw_video_url?: string
  expected_delivery_at?: string
  description?: string
  original_content?: string
  original_hook?: string
  original_description?: string
}

export interface CreateScriptInput {
  title: string
  topic?: string
  content: string
  hook?: string
  cta?: string
  platform?: string
}

export interface UpdateScriptInput extends Partial<CreateScriptInput> {
  status?: ScriptStatus
  status_order?: number
  video_url?: string
  scheduled_for?: string
}

// Admin Types
export interface ScriptWithUser extends Script {
  profiles: {
    id: string
    full_name: string | null
    email: string
    plan: UserPlan
  } | null
}

// Instagram Types
export interface InstagramConnection {
  id: string
  user_id: string
  instagram_user_id: string
  instagram_username?: string
  connected_at: string
}

export interface InstagramMetrics {
  reach: number
  reach_change: number
  engagement_rate: number
  engagement_change: number
  followers: number
  followers_change: number
  best_post?: {
    title: string
    views: number
  }
}

// Specialty Type
export interface Specialty {
  id: number
  name: string
  name_pt: string
  icon?: string
}
