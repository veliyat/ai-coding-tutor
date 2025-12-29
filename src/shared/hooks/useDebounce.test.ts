import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useDebounce } from './useDebounce'

describe('useDebounce', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('initial', 500))
    expect(result.current).toBe('initial')
  })

  it('debounces value changes', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 500),
      { initialProps: { value: 'first' } }
    )

    expect(result.current).toBe('first')

    // Update value
    rerender({ value: 'second' })
    expect(result.current).toBe('first') // Still old value

    // Fast forward 499ms
    act(() => {
      vi.advanceTimersByTime(499)
    })
    expect(result.current).toBe('first') // Still old value

    // Fast forward 1 more ms
    act(() => {
      vi.advanceTimersByTime(1)
    })
    expect(result.current).toBe('second') // Now updated
  })

  it('uses default delay of 500ms', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value),
      { initialProps: { value: 'initial' } }
    )

    rerender({ value: 'updated' })

    act(() => {
      vi.advanceTimersByTime(499)
    })
    expect(result.current).toBe('initial')

    act(() => {
      vi.advanceTimersByTime(1)
    })
    expect(result.current).toBe('updated')
  })

  it('resets timer on rapid value changes', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 300),
      { initialProps: { value: 'a' } }
    )

    // Rapid updates
    rerender({ value: 'b' })
    act(() => {
      vi.advanceTimersByTime(100)
    })

    rerender({ value: 'c' })
    act(() => {
      vi.advanceTimersByTime(100)
    })

    rerender({ value: 'd' })

    // Value should still be 'a' because timer keeps resetting
    expect(result.current).toBe('a')

    // Wait full delay after last update
    act(() => {
      vi.advanceTimersByTime(300)
    })
    expect(result.current).toBe('d')
  })

  it('works with objects', () => {
    const obj1 = { name: 'first' }
    const obj2 = { name: 'second' }

    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 500),
      { initialProps: { value: obj1 } }
    )

    expect(result.current).toBe(obj1)

    rerender({ value: obj2 })

    act(() => {
      vi.advanceTimersByTime(500)
    })
    expect(result.current).toBe(obj2)
  })
})
