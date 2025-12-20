export interface TestCase {
  name: string
  input?: string
  expectedOutput: string
}

export interface TestResult {
  name: string
  passed: boolean
  expected: string
  actual: string
}

export interface ExecutionResult {
  output: string
  error: string | null
  testResults: TestResult[]
  allPassed: boolean
}
