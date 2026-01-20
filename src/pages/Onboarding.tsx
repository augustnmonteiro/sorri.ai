import type { ReactNode } from 'react'
import { useOnboarding, OnboardingProvider } from '@/contexts/OnboardingContext'
import {
  Welcome,
  SocialAccounts,
  MainSpecialty,
  FocusProcedures,
  Differentiator,
  ToneSelection,
  Persona,
  IdealPatient,
  PatientPains,
  PriorityProcedures,
  Bottleneck,
  ProofAndAuthority,
  FlagshipProcedure,
  Complete,
} from '@/components/onboarding/steps'

function OnboardingSteps() {
  const { currentStep, isLoading } = useOnboarding()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    )
  }

  const steps: Record<number, ReactNode> = {
    1: <Welcome />,
    2: <SocialAccounts />,
    3: <MainSpecialty />,
    4: <FocusProcedures />,
    5: <Differentiator />,
    6: <ToneSelection />,
    7: <Persona />,
    8: <IdealPatient />,
    9: <PatientPains />,
    10: <PriorityProcedures />,
    11: <Bottleneck />,
    12: <ProofAndAuthority />,
    13: <FlagshipProcedure />,
    14: <Complete />,
  }

  return steps[currentStep] || <Welcome />
}

export function Onboarding() {
  return (
    <OnboardingProvider>
      <OnboardingSteps />
    </OnboardingProvider>
  )
}
