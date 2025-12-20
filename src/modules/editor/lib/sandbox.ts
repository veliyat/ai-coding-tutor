import type { TestCase, TestResult, ExecutionResult } from '../types'

/**
 * Execute JavaScript code in a sandboxed environment
 * Captures console.log output and runs test cases
 */
export function executeCode(code: string, testCases: TestCase[] = []): ExecutionResult {
  const logs: string[] = []
  let error: string | null = null

  // Create a mock console that captures output
  const mockConsole = {
    log: (...args: unknown[]) => {
      logs.push(args.map(arg => String(arg)).join(' '))
    },
    error: (...args: unknown[]) => {
      logs.push(`Error: ${args.map(arg => String(arg)).join(' ')}`)
    },
    warn: (...args: unknown[]) => {
      logs.push(`Warning: ${args.map(arg => String(arg)).join(' ')}`)
    },
  }

  try {
    // Create a function from the code with console injected
    const fn = new Function('console', code)
    fn(mockConsole)
  } catch (e) {
    error = e instanceof Error ? e.message : String(e)
  }

  // Run test cases
  const output = logs.join('\n')
  const testResults: TestResult[] = testCases.map((test) => {
    // Check if expected output appears in actual output (simple contains check)
    let passed = true
    if (test.expectedOutput) {
      const expectedLines = test.expectedOutput.split('\n').map(l => l.trim()).filter(Boolean)
      for (const expected of expectedLines) {
        if (!output.includes(expected)) {
          passed = false
          break
        }
      }
    }

    return {
      name: test.name,
      passed: error === null && passed,
      expected: test.expectedOutput,
      actual: output,
    }
  })

  const allPassed = error === null && testResults.every((r) => r.passed)

  return {
    output,
    error,
    testResults,
    allPassed,
  }
}
