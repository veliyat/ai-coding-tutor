import { OnboardingForm, useStudentProfile } from '@/modules/auth'
import { Skeleton } from '@/shared/components/ui/skeleton'

export function Onboarding() {
  const { loading } = useStudentProfile()

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8">
        <div className="w-full max-w-md space-y-4">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <div className="w-full max-w-md">
        <OnboardingForm />
      </div>
    </div>
  )
}
