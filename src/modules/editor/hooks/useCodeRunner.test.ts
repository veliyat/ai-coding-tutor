import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useCodeRunner } from './useCodeRunner'

describe('useCodeRunner', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('initial state', () => {
    it('starts with no result and not running', () => {
      const { result } = renderHook(() => useCodeRunner())

      expect(result.current.result).toBeNull()
      expect(result.current.running).toBe(false)
    })
  })

  describe('run', () => {
    it('sets running to true immediately', () => {
      const { result } = renderHook(() => useCodeRunner())

      act(() => {
        result.current.run('console.log("test")')
      })

      expect(result.current.running).toBe(true)
    })

    it('clears previous result when starting new run', () => {
      const { result } = renderHook(() => useCodeRunner())

      // Run once
      act(() => {
        result.current.run('console.log("first")')
        vi.advanceTimersByTime(100)
      })

      expect(result.current.result).not.toBeNull()

      // Run again
      act(() => {
        result.current.run('console.log("second")')
      })

      expect(result.current.result).toBeNull()
      expect(result.current.running).toBe(true)
    })

    it('executes code and returns result after delay', async () => {
      const { result } = renderHook(() => useCodeRunner())

      act(() => {
        result.current.run('console.log("Hello")')
      })

      // Before timeout
      expect(result.current.running).toBe(true)
      expect(result.current.result).toBeNull()

      // After timeout
      act(() => {
        vi.advanceTimersByTime(100)
      })

      expect(result.current.running).toBe(false)
      expect(result.current.result).not.toBeNull()
      expect(result.current.result?.output).toBe('Hello')
    })

    it('captures errors in result', async () => {
      const { result } = renderHook(() => useCodeRunner())

      act(() => {
        result.current.run('throw new Error("test error")')
        vi.advanceTimersByTime(100)
      })

      expect(result.current.result?.error).toBe('test error')
      expect(result.current.result?.allPassed).toBe(false)
    })

    it('runs test cases and reports results', async () => {
      const { result } = renderHook(() => useCodeRunner())
      const testCases = [
        { name: 'outputs hello', expectedOutput: 'Hello' },
      ]

      act(() => {
        result.current.run('console.log("Hello")', testCases)
        vi.advanceTimersByTime(100)
      })

      expect(result.current.result?.testResults).toHaveLength(1)
      expect(result.current.result?.testResults[0].passed).toBe(true)
      expect(result.current.result?.allPassed).toBe(true)
    })

    it('reports failing test cases', async () => {
      const { result } = renderHook(() => useCodeRunner())
      const testCases = [
        { name: 'outputs world', expectedOutput: 'World' },
      ]

      act(() => {
        result.current.run('console.log("Hello")', testCases)
        vi.advanceTimersByTime(100)
      })

      expect(result.current.result?.testResults[0].passed).toBe(false)
      expect(result.current.result?.allPassed).toBe(false)
    })
  })

  describe('reset', () => {
    it('clears result', async () => {
      const { result } = renderHook(() => useCodeRunner())

      act(() => {
        result.current.run('console.log("test")')
        vi.advanceTimersByTime(100)
      })

      expect(result.current.result).not.toBeNull()

      act(() => {
        result.current.reset()
      })

      expect(result.current.result).toBeNull()
    })

    it('sets running to false', () => {
      const { result } = renderHook(() => useCodeRunner())

      act(() => {
        result.current.run('console.log("test")')
      })

      expect(result.current.running).toBe(true)

      act(() => {
        result.current.reset()
      })

      expect(result.current.running).toBe(false)
    })
  })

  describe('edge cases', () => {
    it('handles empty code', async () => {
      const { result } = renderHook(() => useCodeRunner())

      act(() => {
        result.current.run('')
        vi.advanceTimersByTime(100)
      })

      expect(result.current.result?.output).toBe('')
      expect(result.current.result?.error).toBeNull()
    })

    it('handles multiple rapid runs', async () => {
      const { result } = renderHook(() => useCodeRunner())

      // Start multiple runs quickly
      act(() => {
        result.current.run('console.log("1")')
      })

      act(() => {
        result.current.run('console.log("2")')
      })

      act(() => {
        result.current.run('console.log("3")')
        vi.advanceTimersByTime(100)
      })

      // Should have result from last run
      expect(result.current.result?.output).toBe('3')
    })

    it('handles empty test cases array', async () => {
      const { result } = renderHook(() => useCodeRunner())

      act(() => {
        result.current.run('console.log("test")', [])
        vi.advanceTimersByTime(100)
      })

      expect(result.current.result?.testResults).toHaveLength(0)
      expect(result.current.result?.allPassed).toBe(true)
    })
  })
})
