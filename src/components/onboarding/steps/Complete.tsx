import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useOnboarding } from '@/contexts/OnboardingContext'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'

export function Complete() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const [statusMessage, setStatusMessage] = useState('')
  const { data } = useOnboarding()
  const { user, refreshProfile } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    setShowConfetti(true)
    const timer = setTimeout(() => setShowConfetti(false), 3000)
    return () => clearTimeout(timer)
  }, [])

  const handleComplete = async () => {
    if (!user) return

    setIsSubmitting(true)

    try {
      setStatusMessage('Salvando suas preferências...')

      // Save onboarding data
      const onboardingData = {
        main_specialty: data.main_specialty,
        focus_procedures: data.focus_procedures,
        real_differentiator: data.real_differentiator,
        how_to_be_remembered: data.how_to_be_remembered,
        tone_of_voice: data.tone_of_voice,
        language_to_avoid: data.language_to_avoid,
        persona: data.persona,
        ideal_patient: data.ideal_patient,
        patient_pains: data.patient_pains,
        main_objection: data.main_objection,
        decision_delay_reason: data.decision_delay_reason,
        common_questions: data.common_questions,
        priority_procedures: data.priority_procedures,
        procedures_to_hide: data.procedures_to_hide,
        current_ticket: data.current_ticket,
        target_ticket: data.target_ticket,
        main_bottleneck: data.main_bottleneck,
        has_authorized_cases: data.has_authorized_cases,
        proof_types: data.proof_types,
        technical_differentiators: data.technical_differentiators,
        achievements: data.achievements,
        connection_story: data.connection_story,
        flagship_procedure: data.flagship_procedure,
        flagship_fear: data.flagship_fear,
        myth_to_break: data.myth_to_break,
        instagram_handle: data.instagram_handle,
        tiktok_handle: data.tiktok_handle,
        youtube_handle: data.youtube_handle,
        facebook_handle: data.facebook_handle,
        linkedin_handle: data.linkedin_handle,
        whatsapp_number: data.whatsapp_number,
      }

      // Try update first, then insert if no rows affected
      const { data: updated } = await supabase
        .from('user_onboarding')
        .update(onboardingData)
        .eq('user_id', user.id)
        .select('id')

      if (!updated || updated.length === 0) {
        const { error: insertError } = await supabase
          .from('user_onboarding')
          .insert({ user_id: user.id, ...onboardingData })

        // If duplicate key, the record exists - just update it
        if (insertError?.code === '23505') {
          const { error: retryError } = await supabase
            .from('user_onboarding')
            .update(onboardingData)
            .eq('user_id', user.id)
          if (retryError) throw retryError
        } else if (insertError) {
          throw insertError
        }
      }

      // Update profile to mark onboarding as complete
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          onboarding_completed: true,
          onboarding_completed_at: new Date().toISOString(),
        })
        .eq('id', user.id)

      if (profileError) throw profileError

      // Generate 30 script subjects based on onboarding
      setStatusMessage('Gerando seus 30 roteiros personalizados...')

      try {
        const { error: functionError } = await supabase.functions.invoke('generate-subjects')

        if (functionError) {
          console.error('Failed to generate subjects:', functionError)
        }
      } catch (subjectError) {
        // Don't block onboarding completion if subject generation fails
        console.error('Error generating subjects:', subjectError)
      }

      // Refresh profile in context so guards see updated onboarding_completed
      await refreshProfile()

      toast.success('Configuração concluída!')
      navigate('/dashboard')
    } catch (error) {
      console.error('Error saving onboarding:', error)
      toast.error('Erro ao salvar. Tente novamente.')
      setIsSubmitting(false)
      setStatusMessage('')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex flex-col items-center justify-center p-6">
      {/* Confetti Effect */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          {[...Array(50)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-3 h-3 rounded-sm"
              style={{
                backgroundColor: ['#0066E0', '#00C4CC', '#F59E0B', '#EC4899', '#22C55E'][i % 5],
                left: `${Math.random() * 100}%`,
              }}
              initial={{ y: -20, opacity: 1, rotate: 0 }}
              animate={{
                y: '100vh',
                opacity: 0,
                rotate: Math.random() * 360,
              }}
              transition={{
                duration: 2 + Math.random() * 2,
                delay: Math.random() * 0.5,
                ease: 'easeOut',
              }}
            />
          ))}
        </div>
      )}

      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', duration: 0.6 }}
        className="w-32 h-32 mb-8 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center"
      >
        <motion.svg
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="w-16 h-16 text-white"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={3}
        >
          <motion.path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M5 13l4 4L19 7"
          />
        </motion.svg>
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4 text-center"
      >
        Tudo pronto!
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="text-xl text-gray-500 mb-8 text-center max-w-md"
      >
        {statusMessage || 'Sua conta está configurada. Vamos criar seus roteiros!'}
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Button
          size="lg"
          onClick={handleComplete}
          isLoading={isSubmitting}
          iconRight={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          }
        >
          Ir para Dashboard
        </Button>
      </motion.div>
    </div>
  )
}
