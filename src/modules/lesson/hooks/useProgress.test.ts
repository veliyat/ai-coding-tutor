import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useProgress } from './useProgress'

// Create mock builders that return themselves for chaining
let mockSelectResult: { data: unknown; error: { message: string } | null } = { data: [], error: null }
let mockUpsertResult: { data: unknown; error: { message: string } | null } = { data: null, error: null }
let mockInsertResult: { data: unknown; error: { message: string } | null } = { data: null, error: null }
let mockUpdateResult: { data: unknown; error: { message: string } | null } = { data: null, error: null }

const mockQueryBuilder = {
  select: vi.fn().mockReturnThis(),
  eq: vi.fn().mockImplementation(() => Promise.resolve(mockSelectResult)),
  upsert: vi.fn().mockImplementation(() => Promise.resolve(mockUpsertResult)),
  insert: vi.fn().mockImplementation(() => Promise.resolve(mockInsertResult)),
  update: vi.fn().mockReturnThis(),
}

// Override eq to handle both select and update scenarios
mockQueryBuilder.eq.mockImplementation(() => {
  // Return a promise that resolves with the appropriate result
  return Promise.resolve(mockSelectResult)
})

// Make update return a builder with eq
mockQueryBuilder.update.mockReturnValue({
  eq: vi.fn().mockImplementation(() => Promise.resolve(mockUpdateResult)),
})

vi.mock('@/shared/lib/supabase', () => ({
  supabase: {
    from: vi.fn().mockImplementation(() => mockQueryBuilder),
  },
}))

// Mock useIdentity
vi.mock('@/modules/auth', () => ({
  useIdentity: vi.fn(),
}))

import { useIdentity } from '@/modules/auth'

const mockUseIdentity = useIdentity as ReturnType<typeof vi.fn>

describe('useProgress', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Reset default mock results
    mockSelectResult = { data: [], error: null }
    mockUpsertResult = { data: null, error: null }
    mockInsertResult = { data: null, error: null }
    mockUpdateResult = { data: null, error: null }
  })

  describe('initial state', () => {
    it('returns loading state initially', () => {
      mockUseIdentity.mockReturnValue({
        profileId: 'profile-1',
        loading: true,
      })

      const { result } = renderHook(() => useProgress())

      expect(result.current.loading).toBe(true)
    })

    it('returns empty progress when not authenticated', async () => {
      mockUseIdentity.mockReturnValue({
        profileId: null,
        loading: false,
      })

      const { result } = renderHook(() => useProgress())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.progress).toEqual({})
      expect(result.current.error).toBeNull()
    })
  })

  describe('getStatus', () => {
    it('returns not_started for unknown lesson', async () => {
      mockUseIdentity.mockReturnValue({
        profileId: 'profile-1',
        loading: false,
      })

      const { result } = renderHook(() => useProgress())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.getStatus('unknown-lesson')).toBe('not_started')
    })
  })

  describe('startLesson', () => {
    it('returns error when not authenticated', async () => {
      mockUseIdentity.mockReturnValue({
        profileId: null,
        loading: false,
      })

      const { result } = renderHook(() => useProgress())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      let response: { error: string | null } = { error: null }
      await act(async () => {
        response = await result.current.startLesson('lesson-1')
      })

      expect(response.error).toBe('Not authenticated')
    })

    it('creates progress record for new lesson', async () => {
      mockUseIdentity.mockReturnValue({
        profileId: 'profile-1',
        loading: false,
      })

      const { result } = renderHook(() => useProgress())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      await act(async () => {
        await result.current.startLesson('new-lesson')
      })

      expect(mockQueryBuilder.upsert).toHaveBeenCalled()
    })
  })

  describe('completeLesson', () => {
    it('returns error when not authenticated', async () => {
      mockUseIdentity.mockReturnValue({
        profileId: null,
        loading: false,
      })

      const { result } = renderHook(() => useProgress())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      let response: { error: string | null } = { error: null }
      await act(async () => {
        response = await result.current.completeLesson('lesson-1')
      })

      expect(response.error).toBe('Not authenticated')
    })

    it('creates new completed record if not started', async () => {
      mockUseIdentity.mockReturnValue({
        profileId: 'profile-1',
        loading: false,
      })

      const { result } = renderHook(() => useProgress())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      await act(async () => {
        await result.current.completeLesson('new-lesson')
      })

      expect(mockQueryBuilder.insert).toHaveBeenCalled()
    })
  })
})
