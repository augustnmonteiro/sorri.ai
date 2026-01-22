import { createContext, useContext, useReducer, useEffect, useCallback, type ReactNode } from 'react'
import type { OnboardingData } from '@/types'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'

interface OnboardingState {
  currentStep: number
  totalSteps: number
  data: Partial<OnboardingData>
  isSubmitting: boolean
  isSaving: boolean
  isLoading: boolean
}

type OnboardingAction =
  | { type: 'SET_STEP'; step: number }
  | { type: 'UPDATE_DATA'; data: Partial<OnboardingData> }
  | { type: 'NEXT_STEP' }
  | { type: 'PREV_STEP' }
  | { type: 'SET_SUBMITTING'; isSubmitting: boolean }
  | { type: 'SET_SAVING'; isSaving: boolean }
  | { type: 'SET_LOADING'; isLoading: boolean }
  | { type: 'LOAD_DATA'; data: Partial<OnboardingData>; step: number }
  | { type: 'RESET' }

const TOTAL_STEPS = 14

const initialData: Partial<OnboardingData> = {
  main_specialty: [],
  tone_of_voice: [],
  proof_types: [],
}

const initialState: OnboardingState = {
  currentStep: 1,
  totalSteps: TOTAL_STEPS,
  data: initialData,
  isSubmitting: false,
  isSaving: false,
  isLoading: true,
}

function onboardingReducer(state: OnboardingState, action: OnboardingAction): OnboardingState {
  switch (action.type) {
    case 'SET_STEP':
      return { ...state, currentStep: Math.max(1, Math.min(action.step, TOTAL_STEPS)) }
    case 'UPDATE_DATA':
      return { ...state, data: { ...state.data, ...action.data } }
    case 'NEXT_STEP':
      return { ...state, currentStep: Math.min(state.currentStep + 1, TOTAL_STEPS) }
    case 'PREV_STEP':
      return { ...state, currentStep: Math.max(state.currentStep - 1, 1) }
    case 'SET_SUBMITTING':
      return { ...state, isSubmitting: action.isSubmitting }
    case 'SET_SAVING':
      return { ...state, isSaving: action.isSaving }
    case 'SET_LOADING':
      return { ...state, isLoading: action.isLoading }
    case 'LOAD_DATA':
      return {
        ...state,
        data: { ...initialData, ...action.data },
        currentStep: action.step,
        isLoading: false
      }
    case 'RESET':
      return initialState
    default:
      return state
  }
}

interface OnboardingContextType extends OnboardingState {
  setStep: (step: number) => void
  updateData: (data: Partial<OnboardingData>) => void
  nextStep: () => Promise<void>
  prevStep: () => void
  setSubmitting: (isSubmitting: boolean) => void
  reset: () => void
  canGoNext: boolean
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined)

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(onboardingReducer, initialState)
  const { user, loading: authLoading } = useAuth()

  // Load existing onboarding data when user is available
  useEffect(() => {
    // Don't do anything while auth is still loading
    if (authLoading) {
      return
    }

    const loadExistingData = async () => {
      if (!user) {
        // Auth finished loading but no user - set loading to false
        dispatch({ type: 'SET_LOADING', isLoading: false })
        return
      }

      // Set loading to true when we start fetching for a user
      dispatch({ type: 'SET_LOADING', isLoading: true })

      try {
        const { data: existingData, error } = await supabase
          .from('user_onboarding')
          .select('*')
          .eq('user_id', user.id)
          .single()

        if (error && error.code !== 'PGRST116') {
          // PGRST116 = no rows found, which is fine for new users
          console.error('Error loading onboarding data:', error)
          dispatch({ type: 'SET_LOADING', isLoading: false })
          return
        }

        if (existingData) {
          // Map database fields to state
          const loadedData: Partial<OnboardingData> = {
            main_specialty: Array.isArray(existingData.main_specialty)
              ? existingData.main_specialty
              : existingData.main_specialty
                ? [existingData.main_specialty]
                : [],
            focus_procedures: existingData.focus_procedures,
            real_differentiator: existingData.real_differentiator,
            how_to_be_remembered: existingData.how_to_be_remembered,
            tone_of_voice: existingData.tone_of_voice || [],
            language_to_avoid: existingData.language_to_avoid,
            persona: existingData.persona,
            ideal_patient: existingData.ideal_patient,
            patient_pains: existingData.patient_pains,
            main_objection: existingData.main_objection,
            decision_delay_reason: existingData.decision_delay_reason,
            common_questions: existingData.common_questions,
            priority_procedures: existingData.priority_procedures,
            procedures_to_hide: existingData.procedures_to_hide,
            current_ticket: existingData.current_ticket,
            target_ticket: existingData.target_ticket,
            main_bottleneck: existingData.main_bottleneck,
            has_authorized_cases: existingData.has_authorized_cases,
            proof_types: existingData.proof_types || [],
            technical_differentiators: existingData.technical_differentiators,
            achievements: existingData.achievements,
            connection_story: existingData.connection_story,
            flagship_procedure: existingData.flagship_procedure,
            flagship_fear: existingData.flagship_fear,
            myth_to_break: existingData.myth_to_break,
            instagram_handle: existingData.instagram_handle,
            tiktok_handle: existingData.tiktok_handle,
            youtube_handle: existingData.youtube_handle,
            facebook_handle: existingData.facebook_handle,
            linkedin_handle: existingData.linkedin_handle,
            whatsapp_number: existingData.whatsapp_number,
          }

          dispatch({
            type: 'LOAD_DATA',
            data: loadedData,
            step: existingData.current_step || 1
          })
        } else {
          dispatch({ type: 'SET_LOADING', isLoading: false })
        }
      } catch (err) {
        console.error('Error loading onboarding data:', err)
        dispatch({ type: 'SET_LOADING', isLoading: false })
      }
    }

    loadExistingData()
  }, [user, authLoading])

  // Save current step data to database
  const saveStepToDatabase = useCallback(async (nextStep: number) => {
    if (!user) return

    dispatch({ type: 'SET_SAVING', isSaving: true })

    const dataToSave = {
      current_step: nextStep,
      main_specialty: state.data.main_specialty,
      focus_procedures: state.data.focus_procedures,
      real_differentiator: state.data.real_differentiator,
      how_to_be_remembered: state.data.how_to_be_remembered,
      tone_of_voice: state.data.tone_of_voice,
      language_to_avoid: state.data.language_to_avoid,
      persona: state.data.persona,
      ideal_patient: state.data.ideal_patient,
      patient_pains: state.data.patient_pains,
      main_objection: state.data.main_objection,
      decision_delay_reason: state.data.decision_delay_reason,
      common_questions: state.data.common_questions,
      priority_procedures: state.data.priority_procedures,
      procedures_to_hide: state.data.procedures_to_hide,
      current_ticket: state.data.current_ticket,
      target_ticket: state.data.target_ticket,
      main_bottleneck: state.data.main_bottleneck,
      has_authorized_cases: state.data.has_authorized_cases,
      proof_types: state.data.proof_types,
      technical_differentiators: state.data.technical_differentiators,
      achievements: state.data.achievements,
      connection_story: state.data.connection_story,
      flagship_procedure: state.data.flagship_procedure,
      flagship_fear: state.data.flagship_fear,
      myth_to_break: state.data.myth_to_break,
      instagram_handle: state.data.instagram_handle,
      tiktok_handle: state.data.tiktok_handle,
      youtube_handle: state.data.youtube_handle,
      facebook_handle: state.data.facebook_handle,
      linkedin_handle: state.data.linkedin_handle,
      whatsapp_number: state.data.whatsapp_number,
    }

    try {
      console.log('Saving onboarding for user:', user.id)

      // Try to update first (most common case after initial save)
      const { data: updated, error: updateError } = await supabase
        .from('user_onboarding')
        .update(dataToSave)
        .eq('user_id', user.id)
        .select('id')

      // If update didn't affect any rows, try to insert
      if (!updated || updated.length === 0) {
        const { error: insertError } = await supabase
          .from('user_onboarding')
          .insert({ user_id: user.id, ...dataToSave })

        // If insert fails due to duplicate key, it means the record exists
        // but update failed (possibly RLS issue) - try update again
        if (insertError?.code === '23505') {
          const { error: retryError } = await supabase
            .from('user_onboarding')
            .update(dataToSave)
            .eq('user_id', user.id)

          if (retryError) {
            console.error('Error saving onboarding (retry):', retryError)
          }
        } else if (insertError) {
          console.error('Error saving onboarding:', insertError)
        }
      } else if (updateError) {
        console.error('Error saving onboarding:', updateError)
      }
    } catch (err) {
      console.error('Error saving onboarding step:', err)
    } finally {
      dispatch({ type: 'SET_SAVING', isSaving: false })
    }
  }, [user, state.data])

  const nextStep = useCallback(async () => {
    const nextStepNumber = Math.min(state.currentStep + 1, TOTAL_STEPS)
    await saveStepToDatabase(nextStepNumber)
    dispatch({ type: 'NEXT_STEP' })
  }, [state.currentStep, saveStepToDatabase])

  const canGoNext = (() => {
    const { data, currentStep } = state
    switch (currentStep) {
      case 1: return true // Welcome
      case 2: return true // SocialAccounts (all optional)
      case 3: return (data.main_specialty?.length ?? 0) >= 1 // MainSpecialty (1-2 selections)
      case 4: return !!data.focus_procedures // FocusProcedures
      case 5: return !!data.real_differentiator || !!data.how_to_be_remembered // Differentiator
      case 6: return (data.tone_of_voice?.length ?? 0) >= 2 // ToneSelection (2-3)
      case 7: return !!data.persona // Persona
      case 8: return !!data.ideal_patient // IdealPatient
      case 9: return true // PatientPains (optional)
      case 10: return !!data.current_ticket && !!data.target_ticket // PriorityProcedures (ticket values)
      case 11: return !!data.main_bottleneck // Bottleneck
      case 12: return true // ProofAndAuthority (optional)
      case 13: return true // FlagshipProcedure (optional)
      case 14: return true // Complete
      default: return false
    }
  })()

  const value: OnboardingContextType = {
    ...state,
    setStep: (step: number) => dispatch({ type: 'SET_STEP', step }),
    updateData: (data: Partial<OnboardingData>) => dispatch({ type: 'UPDATE_DATA', data }),
    nextStep,
    prevStep: () => dispatch({ type: 'PREV_STEP' }),
    setSubmitting: (isSubmitting: boolean) => dispatch({ type: 'SET_SUBMITTING', isSubmitting }),
    reset: () => dispatch({ type: 'RESET' }),
    canGoNext,
  }

  return (
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  )
}

export const useOnboarding = () => {
  const context = useContext(OnboardingContext)
  if (context === undefined) {
    throw new Error('useOnboarding must be used within an OnboardingProvider')
  }
  return context
}
