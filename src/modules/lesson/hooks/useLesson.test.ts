import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useLesson } from './useLesson'

// Mock result storage
let mockLessonResult: { data: unknown; error: { message: string } | null } = { data: null, error: null }
let mockModuleResult: { data: unknown; error: { message: string } | null } = { data: null, error: null }

vi.mock('@/shared/lib/supabase', () => ({
  supabase: {
    from: vi.fn().mockImplementation((table: string) => ({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockImplementation(() => {
            if (table === 'lessons') {
              return Promise.resolve(mockLessonResult)
            }
            return Promise.resolve(mockModuleResult)
          }),
        }),
      }),
    })),
  },
}))

describe('useLesson', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockLessonResult = { data: null, error: null }
    mockModuleResult = { data: null, error: null }
  })

  describe('initial state', () => {
    it('starts in loading state and resolves', async () => {
      // Set up mock - lesson not found case
      mockLessonResult = { data: null, error: null }

      const { result } = renderHook(() => useLesson('intro-to-variables'))

      // Wait for loading to complete
      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      // After load completes, should have error (lesson not found)
      expect(result.current.error).toBe('Lesson not found')
    })
  })

  describe('missing slug', () => {
    it('returns error when slug is undefined', async () => {
      const { result } = renderHook(() => useLesson(undefined))

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.error).toBe('No lesson slug provided')
      expect(result.current.lesson).toBeNull()
    })

    it('returns error when slug is empty string', async () => {
      const { result } = renderHook(() => useLesson(''))

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.error).toBe('No lesson slug provided')
    })
  })

  describe('fetching lesson', () => {
    it('loads lesson data successfully', async () => {
      const lessonData = {
        id: 'lesson-1',
        slug: 'intro-to-variables',
        title: 'Introduction to Variables',
        module_id: 'module-1',
        order: 1,
        content: {
          sections: [
            { type: 'explanation', text: 'Variables store data' },
          ],
        },
        exercise: {
          description: 'Create a variable',
          starterCode: '',
          solution: '',
          testCases: [],
          hints: [],
        },
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
      }
      const moduleData = {
        id: 'module-1',
        title: 'Getting Started',
        order: 1,
      }

      mockLessonResult = { data: lessonData, error: null }
      mockModuleResult = { data: moduleData, error: null }

      const { result } = renderHook(() => useLesson('intro-to-variables'))

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.lesson).not.toBeNull()
      expect(result.current.lesson?.title).toBe('Introduction to Variables')
      expect(result.current.lesson?.content.sections).toHaveLength(1)
      expect(result.current.module?.title).toBe('Getting Started')
    })

    it('handles lesson not found', async () => {
      mockLessonResult = { data: null, error: null }

      const { result } = renderHook(() => useLesson('nonexistent'))

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.error).toBe('Lesson not found')
      expect(result.current.lesson).toBeNull()
    })

    it('handles database error', async () => {
      mockLessonResult = { data: null, error: { message: 'Database error' } }

      const { result } = renderHook(() => useLesson('intro'))

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.error).toBe('Database error')
    })

    it('handles lesson with no module', async () => {
      const lessonData = {
        id: 'lesson-1',
        slug: 'standalone',
        title: 'Standalone Lesson',
        module_id: null,
        order: 1,
        content: { sections: [] },
        exercise: null,
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
      }

      mockLessonResult = { data: lessonData, error: null }

      const { result } = renderHook(() => useLesson('standalone'))

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.lesson).not.toBeNull()
      expect(result.current.module).toBeNull()
    })

    it('parses content and exercise from JSON', async () => {
      const lessonData = {
        id: 'lesson-1',
        slug: 'test',
        title: 'Test',
        module_id: null,
        order: 1,
        content: {
          sections: [
            { type: 'explanation', text: 'Test content' },
            { type: 'code_example', code: 'let x = 5;' },
          ],
        },
        exercise: {
          description: 'Do something',
          starterCode: '// start',
          solution: 'console.log("done")',
          testCases: [{ name: 'test1', expectedOutput: 'done' }],
          hints: [{ level: 1, text: 'Hint 1' }],
        },
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
      }

      mockLessonResult = { data: lessonData, error: null }

      const { result } = renderHook(() => useLesson('test'))

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.lesson?.content.sections).toHaveLength(2)
      expect(result.current.lesson?.exercise?.description).toBe('Do something')
      expect(result.current.lesson?.exercise?.testCases).toHaveLength(1)
      expect(result.current.lesson?.exercise?.hints).toHaveLength(1)
    })
  })

  describe('slug changes', () => {
    it('refetches when slug changes', async () => {
      const lesson1 = {
        id: 'lesson-1',
        slug: 'lesson-1',
        title: 'Lesson 1',
        module_id: null,
        order: 1,
        content: { sections: [] },
        exercise: null,
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
      }

      mockLessonResult = { data: lesson1, error: null }

      const { result, rerender } = renderHook(
        ({ slug }) => useLesson(slug),
        { initialProps: { slug: 'lesson-1' } }
      )

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.lesson?.title).toBe('Lesson 1')

      // Change to a different lesson
      const lesson2 = { ...lesson1, id: 'lesson-2', slug: 'lesson-2', title: 'Lesson 2' }
      mockLessonResult = { data: lesson2, error: null }

      rerender({ slug: 'lesson-2' })

      await waitFor(() => {
        expect(result.current.lesson?.title).toBe('Lesson 2')
      })
    })
  })
})
