import { type ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useOnboarding } from '@/contexts/OnboardingContext'
import { Button } from '@/components/ui'
import logo from '@/assets/images/logo.png'

interface OnboardingLayoutProps {
  children: ReactNode
  showBack?: boolean
  showNext?: boolean
  nextLabel?: string
  onNext?: () => void | Promise<void>
  isNextLoading?: boolean
}

export function OnboardingLayout({
  children,
  showBack = true,
  showNext = true,
  nextLabel = 'Continuar',
  onNext,
  isNextLoading = false,
}: OnboardingLayoutProps) {
  const { currentStep, totalSteps, prevStep, nextStep, canGoNext, isSaving } = useOnboarding()

  const handleNext = async () => {
    if (onNext) {
      await onNext()
    } else {
      await nextStep()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex flex-col">
      {/* Header */}
      <header className="p-6">
        <img src={logo} alt="Sorri.AI" className="h-8" />
      </header>

      {/* Content */}
      <main className="flex-1 flex items-center justify-center px-6 py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-2xl"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="p-6">
        <div className="max-w-2xl mx-auto">
          {/* Progress dots */}
          <div className="flex justify-center gap-2 mb-6">
            {Array.from({ length: totalSteps }).map((_, index) => (
              <motion.div
                key={index}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index + 1 === currentStep
                    ? 'w-8 bg-primary'
                    : index + 1 < currentStep
                    ? 'w-2 bg-primary'
                    : 'w-2 bg-gray-300'
                }`}
                initial={false}
                animate={{
                  scale: index + 1 === currentStep ? 1.1 : 1,
                }}
              />
            ))}
          </div>

          {/* Navigation buttons */}
          <div className="flex justify-between items-center">
            {showBack && currentStep > 1 ? (
              <Button variant="ghost" onClick={prevStep}>
                <svg className="w-5 h-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Voltar
              </Button>
            ) : (
              <div />
            )}

            {showNext && (
              <Button
                onClick={handleNext}
                disabled={!canGoNext || isSaving}
                isLoading={isNextLoading || isSaving}
                iconRight={
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                }
              >
                {nextLabel}
              </Button>
            )}
          </div>
        </div>
      </footer>
    </div>
  )
}
