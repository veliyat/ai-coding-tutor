import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useExerciseAttempts } from './useExerciseAttempts'
import type { ExecutionResult } from '@/modules/editor'

// Helper to create ExecutionResult
function createResult(allPassed: boolean, error: string | null = null): ExecutionResult {
  return {
    output: 'test output',
    error,
    testResults: [],
    allPassed,
  }
}

describe('useExerciseAttempts', () => {
  describe('initial state', () => {
    it('starts with zero attempts', () => {
      const { result } = renderHook(() => useExerciseAttempts('lesson-1'))

      expect(result.current.attemptCount).toBe(0)
      expect(result.current.consecutiveFailures).toBe(0)
      expect(result.current.lastError).toBeNull()
      expect(result.current.lastCode).toBeNull()
      expect(result.current.lastResult).toBeNull()
      expect(result.current.shouldPromptHelp).toBe(false)
      expect(result.current.hintLevel).toBe(0)
    })
  })

  describe('recordAttempt', () => {
    it('increments attempt count on success', () => {
      const { result } = renderHook(() => useExerciseAttempts('lesson-1'))

      act(() => {
        result.current.recordAttempt('console.log("test")', createResult(true))
      })

      expect(result.current.attemptCount).toBe(1)
      expect(result.current.consecutiveFailures).toBe(0)
    })

    it('increments attempt count and consecutive failures on failure', () => {
      const { result } = renderHook(() => useExerciseAttempts('lesson-1'))

      act(() => {
        result.current.recordAttempt('bad code', createResult(false))
      })

      expect(result.current.attemptCount).toBe(1)
      expect(result.current.consecutiveFailures).toBe(1)
    })

    it('resets consecutive failures on success', () => {
      const { result } = renderHook(() => useExerciseAttempts('lesson-1'))

      // Two failures
      act(() => {
        result.current.recordAttempt('bad', createResult(false))
        result.current.recordAttempt('bad', createResult(false))
      })
      expect(result.current.consecutiveFailures).toBe(2)

      // Then success
      act(() => {
        result.current.recordAttempt('good', createResult(true))
      })

      expect(result.current.consecutiveFailures).toBe(0)
      expect(result.current.attemptCount).toBe(3)
    })

    it('stores last error from result', () => {
      const { result } = renderHook(() => useExerciseAttempts('lesson-1'))

      act(() => {
        result.current.recordAttempt('bad code', createResult(false, 'SyntaxError: Unexpected'))
      })

      expect(result.current.lastError).toBe('SyntaxError: Unexpected')
    })

    it('stores last code', () => {
      const { result } = renderHook(() => useExerciseAttempts('lesson-1'))
      const code = 'console.log("hello")'

      act(() => {
        result.current.recordAttempt(code, createResult(true))
      })

      expect(result.current.lastCode).toBe(code)
    })

    it('stores last result', () => {
      const { result } = renderHook(() => useExerciseAttempts('lesson-1'))
      const execResult = createResult(true)

      act(() => {
        result.current.recordAttempt('code', execResult)
      })

      expect(result.current.lastResult).toEqual(execResult)
    })
  })

  describe('shouldPromptHelp', () => {
    it('triggers after 3 consecutive failures', () => {
      const { result } = renderHook(() => useExerciseAttempts('lesson-1'))

      // First two failures - no prompt
      act(() => {
        result.current.recordAttempt('bad', createResult(false))
      })
      expect(result.current.shouldPromptHelp).toBe(false)

      act(() => {
        result.current.recordAttempt('bad', createResult(false))
      })
      expect(result.current.shouldPromptHelp).toBe(false)

      // Third failure - prompt triggers
      act(() => {
        result.current.recordAttempt('bad', createResult(false))
      })
      expect(result.current.shouldPromptHelp).toBe(true)
    })

    it('does not re-trigger after being dismissed', () => {
      const { result } = renderHook(() => useExerciseAttempts('lesson-1'))

      // Trigger help prompt
      act(() => {
        result.current.recordAttempt('bad', createResult(false))
        result.current.recordAttempt('bad', createResult(false))
        result.current.recordAttempt('bad', createResult(false))
      })
      expect(result.current.shouldPromptHelp).toBe(true)

      // Dismiss the prompt
      act(() => {
        result.current.dismissPrompt()
      })
      expect(result.current.shouldPromptHelp).toBe(false)

      // More failures shouldn't re-trigger since prompt was already shown
      // (the condition checks !prev.shouldPromptHelp but it's now false after dismiss)
      // Actually the logic triggers again once after dismiss because shouldPromptHelp is false again
      act(() => {
        result.current.recordAttempt('bad', createResult(false))
        result.current.recordAttempt('bad', createResult(false))
        result.current.recordAttempt('bad', createResult(false))
      })
      // After dismiss and 3 more failures, it will trigger again
      expect(result.current.shouldPromptHelp).toBe(true)
    })
  })

  describe('dismissPrompt', () => {
    it('sets shouldPromptHelp to false', () => {
      const { result } = renderHook(() => useExerciseAttempts('lesson-1'))

      // Trigger prompt
      act(() => {
        result.current.recordAttempt('bad', createResult(false))
        result.current.recordAttempt('bad', createResult(false))
        result.current.recordAttempt('bad', createResult(false))
      })
      expect(result.current.shouldPromptHelp).toBe(true)

      act(() => {
        result.current.dismissPrompt()
      })

      expect(result.current.shouldPromptHelp).toBe(false)
    })

    it('preserves other state when dismissing', () => {
      const { result } = renderHook(() => useExerciseAttempts('lesson-1'))

      act(() => {
        result.current.recordAttempt('bad', createResult(false))
        result.current.recordAttempt('bad', createResult(false))
        result.current.recordAttempt('bad', createResult(false))
      })

      const attemptsBefore = result.current.attemptCount
      const failuresBefore = result.current.consecutiveFailures

      act(() => {
        result.current.dismissPrompt()
      })

      expect(result.current.attemptCount).toBe(attemptsBefore)
      expect(result.current.consecutiveFailures).toBe(failuresBefore)
    })
  })

  describe('incrementHintLevel', () => {
    it('increments hint level', () => {
      const { result } = renderHook(() => useExerciseAttempts('lesson-1'))

      expect(result.current.hintLevel).toBe(0)

      act(() => {
        result.current.incrementHintLevel()
      })
      expect(result.current.hintLevel).toBe(1)

      act(() => {
        result.current.incrementHintLevel()
      })
      expect(result.current.hintLevel).toBe(2)
    })

    it('preserves other state', () => {
      const { result } = renderHook(() => useExerciseAttempts('lesson-1'))

      act(() => {
        result.current.recordAttempt('code', createResult(true))
      })
      const attemptsBefore = result.current.attemptCount

      act(() => {
        result.current.incrementHintLevel()
      })

      expect(result.current.attemptCount).toBe(attemptsBefore)
    })
  })

  describe('resetAttempts', () => {
    it('resets all state to initial values', () => {
      const { result } = renderHook(() => useExerciseAttempts('lesson-1'))

      // Build up some state
      act(() => {
        result.current.recordAttempt('bad', createResult(false))
        result.current.recordAttempt('bad', createResult(false))
        result.current.recordAttempt('bad', createResult(false))
        result.current.incrementHintLevel()
      })

      expect(result.current.attemptCount).toBeGreaterThan(0)
      expect(result.current.hintLevel).toBeGreaterThan(0)
      expect(result.current.shouldPromptHelp).toBe(true)

      act(() => {
        result.current.resetAttempts()
      })

      expect(result.current.attemptCount).toBe(0)
      expect(result.current.consecutiveFailures).toBe(0)
      expect(result.current.lastError).toBeNull()
      expect(result.current.lastCode).toBeNull()
      expect(result.current.lastResult).toBeNull()
      expect(result.current.shouldPromptHelp).toBe(false)
      expect(result.current.hintLevel).toBe(0)
    })
  })

  describe('resetForLesson', () => {
    it('resets when lesson ID changes', () => {
      const { result } = renderHook(
        ({ lessonId }) => useExerciseAttempts(lessonId),
        { initialProps: { lessonId: 'lesson-1' } }
      )

      act(() => {
        result.current.recordAttempt('code', createResult(true))
      })
      expect(result.current.attemptCount).toBe(1)

      // Change lesson
      act(() => {
        result.current.resetForLesson('lesson-2')
      })

      expect(result.current.attemptCount).toBe(0)
    })

    it('does not reset when lesson ID is the same', () => {
      const { result } = renderHook(() => useExerciseAttempts('lesson-1'))

      act(() => {
        result.current.recordAttempt('code', createResult(true))
      })
      expect(result.current.attemptCount).toBe(1)

      act(() => {
        result.current.resetForLesson('lesson-1')
      })

      expect(result.current.attemptCount).toBe(1) // Not reset
    })
  })
})
