import { Navigate, useLocation } from 'react-router-dom'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { useIdentity } from '../hooks/useIdentity'

interface AuthGuardProps {
  children: React.ReactNode
}

/**
 * Route guard that requires authentication.
 * Supports both code-based (anonymous) and registered (Supabase auth) users.
 * Redirects to landing page if not authenticated.
 */
export function AuthGuard({ children }: AuthGuardProps) {
  const { isAuthenticated, loading } = useIdentity()
  const location = useLocation()

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

  if (!isAuthenticated) {
    // Redirect to landing page (not login) since users can start without account
    return <Navigate to="/" state={{ from: location }} replace />
  }

  return <>{children}</>
}
