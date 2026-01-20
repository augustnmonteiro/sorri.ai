import type { Specialty, ToneOption, PersonaOption, BottleneckOption } from '@/types'

export const SPECIALTIES: Specialty[] = [
  { id: 1, name: 'general_dentistry', name_pt: 'Clínica Geral', icon: '🦷' },
  { id: 2, name: 'orthodontics', name_pt: 'Ortodontia', icon: '😁' },
  { id: 3, name: 'implantology', name_pt: 'Implantodontia', icon: '🔩' },
  { id: 4, name: 'endodontics', name_pt: 'Endodontia', icon: '🔬' },
  { id: 5, name: 'periodontics', name_pt: 'Periodontia', icon: '🩺' },
  { id: 6, name: 'prosthodontics', name_pt: 'Prótese Dentária', icon: '👄' },
  { id: 7, name: 'pediatric_dentistry', name_pt: 'Odontopediatria', icon: '👶' },
  { id: 8, name: 'oral_surgery', name_pt: 'Cirurgia Bucomaxilofacial', icon: '⚕️' },
  { id: 9, name: 'porcelain_veneers', name_pt: 'Lentes de Porcelana', icon: '💎' },
  { id: 10, name: 'resin_veneers', name_pt: 'Facetas em Resina', icon: '✨' },
  { id: 11, name: 'dental_radiology', name_pt: 'Radiologia Odontológica', icon: '📷' },
  { id: 12, name: 'harmonization', name_pt: 'Harmonização Orofacial', icon: '💉' },
]

export const TONE_OPTIONS: { value: ToneOption; label: string; emoji: string; description: string }[] = [
  { value: 'premium', label: 'Premium', emoji: '👑', description: 'Sofisticado e exclusivo' },
  { value: 'friendly', label: 'Amigável', emoji: '😊', description: 'Acolhedor e acessível' },
  { value: 'humorous', label: 'Bem-humorado', emoji: '😄', description: 'Leve e divertido' },
  { value: 'technical', label: 'Técnico', emoji: '🔬', description: 'Científico e detalhado' },
  { value: 'direct', label: 'Direto', emoji: '🎯', description: 'Objetivo e sem rodeios' },
  { value: 'welcoming', label: 'Acolhedor', emoji: '🤗', description: 'Caloroso e empático' },
]

export const PERSONA_OPTIONS: { value: PersonaOption; label: string; emoji: string; description: string }[] = [
  { value: 'authority', label: 'Autoridade Professora', emoji: '🎓', description: 'Ensina e educa com propriedade' },
  { value: 'advisor', label: 'Amigo Conselheiro', emoji: '🤝', description: 'Aconselha como um amigo próximo' },
  { value: 'serious_doctor', label: 'Médico Sério', emoji: '👨‍⚕️', description: 'Profissional e respeitoso' },
  { value: 'storyteller', label: 'Storytelling Pessoal', emoji: '📖', description: 'Conta histórias e conecta' },
]

export const BOTTLENECK_OPTIONS: { value: BottleneckOption; label: string; emoji: string; description: string }[] = [
  { value: 'attraction', label: 'Atração', emoji: '🧲', description: 'Trazer mais pessoas interessadas' },
  { value: 'conversion', label: 'Conversão', emoji: '💬', description: 'Transformar interessados em leads' },
  { value: 'attendance', label: 'Comparecimento', emoji: '📅', description: 'Fazer agendados aparecerem' },
  { value: 'closing', label: 'Fechamento', emoji: '🤝', description: 'Converter consultas em tratamentos' },
  { value: 'retention', label: 'Retenção', emoji: '🔄', description: 'Manter pacientes voltando' },
]

export const PROOF_TYPE_OPTIONS = [
  'Depoimentos em vídeo',
  'Prints de mensagens',
  'Avaliações Google',
  'Fotos de antes/depois',
  'Vídeos de bastidores',
  'Casos clínicos documentados',
]

export const SCRIPT_STATUS_CONFIG = {
  script: { label: 'Roteiros', color: 'primary', nextStatus: 'recorded' as const, nextLabel: 'Marcar Gravado' },
  recorded: { label: 'Gravados', color: 'warning', nextStatus: 'editing' as const, nextLabel: 'Enviar para Edição' },
  editing: { label: 'Em Edição', color: 'secondary', nextStatus: 'published' as const, nextLabel: 'Marcar Publicado' },
  published: { label: 'Publicados', color: 'success', nextStatus: null, nextLabel: null },
}

// Plan configuration with limits and delivery times
export const PLAN_CONFIG = {
  free: {
    name: 'Free',
    videoEditsPerMonth: 1,
    deliveryHours: 168, // 7 days
    deliveryText: '7 dias',
    ideasPerGeneration: 10,
  },
  pro: {
    name: 'Pro',
    videoEditsPerMonth: 4,
    deliveryHours: 72, // 72 hours
    deliveryText: '72 horas',
    ideasPerGeneration: 30,
  },
} as const
