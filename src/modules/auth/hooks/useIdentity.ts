import { useAuth } from './useAuth'
import { useAccessCode } from './useAccessCode'
import { useStudentProfile } from './useStudentProfile'

export type IdentityType = 'anonymous' | 'code_based' | 'registered'

interface Identity {
  /** The type of identity: anonymous, code_based, or registered */
  type: IdentityType
  /** The profile ID (used as student_id for progress tracking) */
  profileId: string | null
  /** Display name (generated for code-based, real name for registered) */
  displayName: string | null
  /** Avatar emoji */
  avatar: string | null
  /** Access code (for code-based users) */
  accessCode: string | null
  /** Whether the user can access protected content */
  isAuthenticated: boolean
  /** Whether identity is still being determined */
  loading: boolean
}

/**
 * Unified identity hook that supports both:
 * - Code-based authentication (anonymous profiles with access codes)
 * - Registered authentication (Supabase auth users)
 *
 * Registered users take precedence over code-based users.
 */
export function useIdentity(): Identity {
  const { user, loading: authLoading } = useAuth()
  const { accessCode, profile: codeProfile, loading: codeLoading } = useAccessCode()
  const { profile: authProfile, loading: profileLoading } = useStudentProfile()

  // Still loading if any source is loading
  // For auth users, we also wait for their profile
  const loading = authLoading || codeLoading || (user && profileLoading)

  // Registered user takes precedence (has Supabase auth session)
  if (user && authProfile) {
    return {
      type: 'registered',
      profileId: authProfile.id,
      displayName: authProfile.display_name,
      avatar: authProfile.avatar_emoji,
      accessCode: null, // Hide code for registered users
      isAuthenticated: true,
      loading: false,
    }
  }

  // Code-based user (has valid access code but no auth session)
  if (accessCode && codeProfile) {
    return {
      type: 'code_based',
      profileId: codeProfile.id,
      displayName: codeProfile.display_name,
      avatar: codeProfile.avatar_emoji,
      accessCode,
      isAuthenticated: true,
      loading: false,
    }
  }

  // Anonymous visitor (no auth, no code)
  return {
    type: 'anonymous',
    profileId: null,
    displayName: null,
    avatar: null,
    accessCode: null,
    isAuthenticated: false,
    loading: Boolean(loading),
  }
}
