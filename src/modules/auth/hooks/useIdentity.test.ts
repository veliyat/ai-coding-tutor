import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useIdentity } from './useIdentity'

// Mock the dependent hooks
vi.mock('./useAuth', () => ({
  useAuth: vi.fn(),
}))

vi.mock('./useAccessCode', () => ({
  useAccessCode: vi.fn(),
}))

vi.mock('./useStudentProfile', () => ({
  useStudentProfile: vi.fn(),
}))

import { useAuth } from './useAuth'
import { useAccessCode } from './useAccessCode'
import { useStudentProfile } from './useStudentProfile'

const mockUseAuth = useAuth as ReturnType<typeof vi.fn>
const mockUseAccessCode = useAccessCode as ReturnType<typeof vi.fn>
const mockUseStudentProfile = useStudentProfile as ReturnType<typeof vi.fn>

describe('useIdentity', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('loading state', () => {
    it('returns loading when auth is loading', () => {
      mockUseAuth.mockReturnValue({
        user: null,
        loading: true,
      })
      mockUseAccessCode.mockReturnValue({
        accessCode: null,
        profile: null,
        loading: false,
      })
      mockUseStudentProfile.mockReturnValue({
        profile: null,
        loading: false,
      })

      const { result } = renderHook(() => useIdentity())

      expect(result.current.loading).toBe(true)
    })

    it('returns loading when access code is loading', () => {
      mockUseAuth.mockReturnValue({
        user: null,
        loading: false,
      })
      mockUseAccessCode.mockReturnValue({
        accessCode: null,
        profile: null,
        loading: true,
      })
      mockUseStudentProfile.mockReturnValue({
        profile: null,
        loading: false,
      })

      const { result } = renderHook(() => useIdentity())

      expect(result.current.loading).toBe(true)
    })

    it('returns loading when user exists but profile is loading', () => {
      mockUseAuth.mockReturnValue({
        user: { id: 'user-1' },
        loading: false,
      })
      mockUseAccessCode.mockReturnValue({
        accessCode: null,
        profile: null,
        loading: false,
      })
      mockUseStudentProfile.mockReturnValue({
        profile: null,
        loading: true,
      })

      const { result } = renderHook(() => useIdentity())

      expect(result.current.loading).toBe(true)
    })
  })

  describe('anonymous state', () => {
    it('returns anonymous when no auth and no access code', () => {
      mockUseAuth.mockReturnValue({
        user: null,
        loading: false,
      })
      mockUseAccessCode.mockReturnValue({
        accessCode: null,
        profile: null,
        loading: false,
      })
      mockUseStudentProfile.mockReturnValue({
        profile: null,
        loading: false,
      })

      const { result } = renderHook(() => useIdentity())

      expect(result.current.type).toBe('anonymous')
      expect(result.current.profileId).toBeNull()
      expect(result.current.displayName).toBeNull()
      expect(result.current.avatar).toBeNull()
      expect(result.current.accessCode).toBeNull()
      expect(result.current.isAuthenticated).toBe(false)
      expect(result.current.loading).toBe(false)
    })
  })

  describe('code-based identity', () => {
    it('returns code_based when access code is present but no auth user', () => {
      const codeProfile = {
        id: 'profile-1',
        display_name: 'Swift Panda',
        avatar_emoji: '🐼',
      }

      mockUseAuth.mockReturnValue({
        user: null,
        loading: false,
      })
      mockUseAccessCode.mockReturnValue({
        accessCode: 'SWIFT-BEAR-73',
        profile: codeProfile,
        loading: false,
      })
      mockUseStudentProfile.mockReturnValue({
        profile: null,
        loading: false,
      })

      const { result } = renderHook(() => useIdentity())

      expect(result.current.type).toBe('code_based')
      expect(result.current.profileId).toBe('profile-1')
      expect(result.current.displayName).toBe('Swift Panda')
      expect(result.current.avatar).toBe('🐼')
      expect(result.current.accessCode).toBe('SWIFT-BEAR-73')
      expect(result.current.isAuthenticated).toBe(true)
      expect(result.current.loading).toBe(false)
    })
  })

  describe('registered identity', () => {
    it('returns registered when auth user and profile exist', () => {
      const authProfile = {
        id: 'profile-2',
        display_name: 'John Doe',
        avatar_emoji: '🦊',
      }

      mockUseAuth.mockReturnValue({
        user: { id: 'user-1' },
        loading: false,
      })
      mockUseAccessCode.mockReturnValue({
        accessCode: null,
        profile: null,
        loading: false,
      })
      mockUseStudentProfile.mockReturnValue({
        profile: authProfile,
        loading: false,
      })

      const { result } = renderHook(() => useIdentity())

      expect(result.current.type).toBe('registered')
      expect(result.current.profileId).toBe('profile-2')
      expect(result.current.displayName).toBe('John Doe')
      expect(result.current.avatar).toBe('🦊')
      expect(result.current.accessCode).toBeNull() // Hidden for registered users
      expect(result.current.isAuthenticated).toBe(true)
      expect(result.current.loading).toBe(false)
    })

    it('registered user takes precedence over code-based', () => {
      // Edge case: user has both auth profile and code-based profile
      const authProfile = {
        id: 'profile-auth',
        display_name: 'Auth User',
        avatar_emoji: '🦁',
      }
      const codeProfile = {
        id: 'profile-code',
        display_name: 'Code User',
        avatar_emoji: '🐼',
      }

      mockUseAuth.mockReturnValue({
        user: { id: 'user-1' },
        loading: false,
      })
      mockUseAccessCode.mockReturnValue({
        accessCode: 'CODE-123-00',
        profile: codeProfile,
        loading: false,
      })
      mockUseStudentProfile.mockReturnValue({
        profile: authProfile,
        loading: false,
      })

      const { result } = renderHook(() => useIdentity())

      expect(result.current.type).toBe('registered')
      expect(result.current.profileId).toBe('profile-auth')
      expect(result.current.displayName).toBe('Auth User')
    })
  })

  describe('edge cases', () => {
    it('returns anonymous when auth user exists but no profile yet (pre-onboarding)', () => {
      mockUseAuth.mockReturnValue({
        user: { id: 'user-1' },
        loading: false,
      })
      mockUseAccessCode.mockReturnValue({
        accessCode: null,
        profile: null,
        loading: false,
      })
      mockUseStudentProfile.mockReturnValue({
        profile: null,
        loading: false,
      })

      const { result } = renderHook(() => useIdentity())

      // User exists but no profile yet - falls through to anonymous
      expect(result.current.type).toBe('anonymous')
      expect(result.current.isAuthenticated).toBe(false)
    })

    it('returns anonymous when access code exists but profile is null', () => {
      mockUseAuth.mockReturnValue({
        user: null,
        loading: false,
      })
      mockUseAccessCode.mockReturnValue({
        accessCode: 'SWIFT-BEAR-73', // Code exists but profile fetch failed
        profile: null,
        loading: false,
      })
      mockUseStudentProfile.mockReturnValue({
        profile: null,
        loading: false,
      })

      const { result } = renderHook(() => useIdentity())

      expect(result.current.type).toBe('anonymous')
      expect(result.current.isAuthenticated).toBe(false)
    })
  })
})
