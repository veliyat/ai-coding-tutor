import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useLocalStorage } from './useLocalStorage'

describe('useLocalStorage', () => {
  beforeEach(() => {
    window.localStorage.clear()
    vi.clearAllMocks()
  })

  it('returns initial value when localStorage is empty', () => {
    const { result } = renderHook(() => useLocalStorage('key', 'default'))
    expect(result.current[0]).toBe('default')
  })

  it('returns value from localStorage if exists', () => {
    window.localStorage.setItem('key', JSON.stringify('stored'))
    const { result } = renderHook(() => useLocalStorage('key', 'default'))
    expect(result.current[0]).toBe('stored')
  })

  it('updates localStorage when setValue is called', () => {
    const { result } = renderHook(() => useLocalStorage('key', 'initial'))

    act(() => {
      result.current[1]('updated')
    })

    expect(result.current[0]).toBe('updated')
    expect(JSON.parse(window.localStorage.getItem('key')!)).toBe('updated')
  })

  it('supports functional updates', () => {
    const { result } = renderHook(() => useLocalStorage('count', 0))

    act(() => {
      result.current[1]((prev) => prev + 1)
    })

    expect(result.current[0]).toBe(1)

    act(() => {
      result.current[1]((prev) => prev + 1)
    })

    expect(result.current[0]).toBe(2)
  })

  it('removes value from localStorage', () => {
    window.localStorage.setItem('key', JSON.stringify('value'))
    const { result } = renderHook(() => useLocalStorage('key', 'default'))

    expect(result.current[0]).toBe('value')

    act(() => {
      result.current[2]() // removeValue
    })

    expect(result.current[0]).toBe('default')
    expect(window.localStorage.getItem('key')).toBeNull()
  })

  it('works with objects', () => {
    const initial = { name: 'test', count: 0 }
    const { result } = renderHook(() => useLocalStorage('obj', initial))

    expect(result.current[0]).toEqual(initial)

    act(() => {
      result.current[1]({ name: 'updated', count: 5 })
    })

    expect(result.current[0]).toEqual({ name: 'updated', count: 5 })
  })

  it('works with arrays', () => {
    const { result } = renderHook(() => useLocalStorage<string[]>('items', []))

    act(() => {
      result.current[1](['a', 'b', 'c'])
    })

    expect(result.current[0]).toEqual(['a', 'b', 'c'])
  })

  it('handles invalid JSON in localStorage gracefully', () => {
    window.localStorage.setItem('key', 'not valid json')
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

    const { result } = renderHook(() => useLocalStorage('key', 'default'))

    expect(result.current[0]).toBe('default')
    expect(consoleSpy).toHaveBeenCalled()

    consoleSpy.mockRestore()
  })

  it('uses different keys independently', () => {
    const { result: result1 } = renderHook(() =>
      useLocalStorage('key1', 'default1')
    )
    const { result: result2 } = renderHook(() =>
      useLocalStorage('key2', 'default2')
    )

    act(() => {
      result1.current[1]('value1')
      result2.current[1]('value2')
    })

    expect(result1.current[0]).toBe('value1')
    expect(result2.current[0]).toBe('value2')
  })
})
