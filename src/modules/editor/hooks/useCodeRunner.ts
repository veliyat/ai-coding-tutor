import { useState, useCallback } from 'react'
import { executeCode } from '../lib/sandbox'
import type { TestCase, ExecutionResult } from '../types'

interface CodeRunnerState {
  result: ExecutionResult | null
  running: boolean
}

export function useCodeRunner() {
  const [state, setState] = useState<CodeRunnerState>({
    result: null,
    running: false,
  })

  const run = useCallback((code: string, testCases: TestCase[] = []) => {
    setState({ result: null, running: true })

    // Small delay to show loading state
    setTimeout(() => {
      const result = executeCode(code, testCases)
      setState({ result, running: false })
    }, 100)
  }, [])

  const reset = useCallback(() => {
    setState({ result: null, running: false })
  }, [])

  return {
    result: state.result,
    running: state.running,
    run,
    reset,
  }
}
