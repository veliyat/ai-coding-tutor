import { Navigate } from 'react-router-dom'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { useStudentProfile } from '../hooks/useStudentProfile'

interface OnboardingGuardProps {
  children: React.ReactNode
}

export function OnboardingGuard({ children }: OnboardingGuardProps) {
  const { isOnboardingComplete, loading } = useStudentProfile()

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

  if (!isOnboardingComplete) {
    return <Navigate to="/onboarding" replace />
  }

  return <>{children}</>
}
