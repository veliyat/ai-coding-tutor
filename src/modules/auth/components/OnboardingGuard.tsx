import { Navigate } from 'react-router-dom'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { useIdentity } from '../hooks/useIdentity'
import { useStudentProfile } from '../hooks/useStudentProfile'

interface OnboardingGuardProps {
  children: React.ReactNode
}

/**
 * Route guard that ensures onboarding is complete.
 * - Code-based users skip onboarding (they get default values)
 * - Registered users must complete onboarding
 */
export function OnboardingGuard({ children }: OnboardingGuardProps) {
  const { type, loading: identityLoading } = useIdentity()
  const { isOnboardingComplete, loading: profileLoading } = useStudentProfile()

  const loading = identityLoading || (type === 'registered' && profileLoading)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="space-y-4 w-full max-w-md p-8">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </div>
    )
  }

  // Code-based users skip traditional onboarding
  // They already have a display name, avatar, and can start learning immediately
  if (type === 'code_based') {
    return <>{children}</>
  }

  // Registered users need to complete onboarding
  if (type === 'registered' && !isOnboardingComplete) {
    return <Navigate to="/onboarding" replace />
  }

  return <>{children}</>
}
