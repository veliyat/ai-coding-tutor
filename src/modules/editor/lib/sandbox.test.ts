import { describe, it, expect } from 'vitest'
import { executeCode } from './sandbox'
import type { TestCase } from '../types'

describe('sandbox', () => {
  describe('executeCode', () => {
    describe('basic execution', () => {
      it('executes simple code and captures console.log output', () => {
        const result = executeCode('console.log("Hello, World!")')

        expect(result.output).toBe('Hello, World!')
        expect(result.error).toBeNull()
        expect(result.allPassed).toBe(true)
      })

      it('captures multiple console.log calls', () => {
        const code = `
          console.log("Line 1")
          console.log("Line 2")
          console.log("Line 3")
        `
        const result = executeCode(code)

        expect(result.output).toBe('Line 1\nLine 2\nLine 3')
        expect(result.error).toBeNull()
      })

      it('captures console.error output with Error prefix', () => {
        const result = executeCode('console.error("Something went wrong")')

        expect(result.output).toBe('Error: Something went wrong')
        expect(result.error).toBeNull()
      })

      it('captures console.warn output with Warning prefix', () => {
        const result = executeCode('console.warn("Be careful")')

        expect(result.output).toBe('Warning: Be careful')
        expect(result.error).toBeNull()
      })

      it('handles multiple arguments to console.log', () => {
        const result = executeCode('console.log("Count:", 42, "items")')

        expect(result.output).toBe('Count: 42 items')
      })

      it('handles empty code', () => {
        const result = executeCode('')

        expect(result.output).toBe('')
        expect(result.error).toBeNull()
        expect(result.allPassed).toBe(true)
      })

      it('handles code with no output', () => {
        const result = executeCode('const x = 5; const y = x + 10;')

        expect(result.output).toBe('')
        expect(result.error).toBeNull()
      })
    })

    describe('error handling', () => {
      it('catches syntax errors', () => {
        const result = executeCode('const x =')

        expect(result.error).not.toBeNull()
        expect(result.allPassed).toBe(false)
      })

      it('catches reference errors', () => {
        const result = executeCode('console.log(undefinedVariable)')

        expect(result.error).toContain('undefinedVariable')
        expect(result.allPassed).toBe(false)
      })

      it('catches type errors', () => {
        const result = executeCode('null.toString()')

        expect(result.error).not.toBeNull()
        expect(result.allPassed).toBe(false)
      })

      it('preserves output captured before error', () => {
        const code = `
          console.log("Before error")
          throw new Error("Test error")
        `
        const result = executeCode(code)

        expect(result.output).toBe('Before error')
        expect(result.error).toBe('Test error')
        expect(result.allPassed).toBe(false)
      })

      it('handles non-Error throws', () => {
        const result = executeCode('throw "string error"')

        expect(result.error).toBe('string error')
      })
    })

    describe('test cases', () => {
      it('runs test cases and reports pass when output matches', () => {
        const testCases: TestCase[] = [
          { name: 'prints hello', expectedOutput: 'Hello' },
        ]
        const result = executeCode('console.log("Hello")', testCases)

        expect(result.testResults).toHaveLength(1)
        expect(result.testResults[0].passed).toBe(true)
        expect(result.testResults[0].name).toBe('prints hello')
        expect(result.allPassed).toBe(true)
      })

      it('reports fail when output does not match', () => {
        const testCases: TestCase[] = [
          { name: 'prints hello', expectedOutput: 'Goodbye' },
        ]
        const result = executeCode('console.log("Hello")', testCases)

        expect(result.testResults[0].passed).toBe(false)
        expect(result.testResults[0].expected).toBe('Goodbye')
        expect(result.testResults[0].actual).toBe('Hello')
        expect(result.allPassed).toBe(false)
      })

      it('handles multiple test cases', () => {
        const testCases: TestCase[] = [
          { name: 'contains foo', expectedOutput: 'foo' },
          { name: 'contains bar', expectedOutput: 'bar' },
          { name: 'contains baz', expectedOutput: 'baz' },
        ]
        const result = executeCode('console.log("foo bar")', testCases)

        expect(result.testResults).toHaveLength(3)
        expect(result.testResults[0].passed).toBe(true)  // foo found
        expect(result.testResults[1].passed).toBe(true)  // bar found
        expect(result.testResults[2].passed).toBe(false) // baz not found
        expect(result.allPassed).toBe(false)
      })

      it('handles multiline expected output', () => {
        const testCases: TestCase[] = [
          { name: 'prints both lines', expectedOutput: 'Line 1\nLine 2' },
        ]
        const code = `
          console.log("Line 1")
          console.log("Line 2")
        `
        const result = executeCode(code, testCases)

        expect(result.testResults[0].passed).toBe(true)
      })

      it('fails all tests when code has error', () => {
        const testCases: TestCase[] = [
          { name: 'test 1', expectedOutput: 'anything' },
          { name: 'test 2', expectedOutput: 'anything' },
        ]
        const result = executeCode('throw new Error("crash")', testCases)

        expect(result.testResults.every(t => !t.passed)).toBe(true)
        expect(result.allPassed).toBe(false)
      })

      it('handles empty test cases array', () => {
        const result = executeCode('console.log("test")', [])

        expect(result.testResults).toHaveLength(0)
        expect(result.allPassed).toBe(true)
      })

      it('handles test case with empty expectedOutput', () => {
        const testCases: TestCase[] = [
          { name: 'empty expectation', expectedOutput: '' },
        ]
        const result = executeCode('console.log("output")', testCases)

        // Empty expectedOutput should pass (nothing to check)
        expect(result.testResults[0].passed).toBe(true)
      })

      it('uses contains matching for expected output', () => {
        const testCases: TestCase[] = [
          { name: 'contains partial', expectedOutput: 'middle' },
        ]
        const result = executeCode('console.log("start middle end")', testCases)

        expect(result.testResults[0].passed).toBe(true)
      })
    })

    describe('JavaScript features', () => {
      it('supports variable declarations', () => {
        const code = `
          let x = 5
          const y = 10
          var z = x + y
          console.log(z)
        `
        const result = executeCode(code)

        expect(result.output).toBe('15')
        expect(result.error).toBeNull()
      })

      it('supports functions', () => {
        const code = `
          function add(a, b) {
            return a + b
          }
          console.log(add(2, 3))
        `
        const result = executeCode(code)

        expect(result.output).toBe('5')
      })

      it('supports arrow functions', () => {
        const code = `
          const multiply = (a, b) => a * b
          console.log(multiply(4, 5))
        `
        const result = executeCode(code)

        expect(result.output).toBe('20')
      })

      it('supports arrays', () => {
        const code = `
          const arr = [1, 2, 3, 4, 5]
          console.log(arr.length)
          console.log(arr.map(x => x * 2).join(","))
        `
        const result = executeCode(code)

        expect(result.output).toContain('5')
        expect(result.output).toContain('2,4,6,8,10')
      })

      it('supports objects', () => {
        const code = `
          const person = { name: "Alice", age: 30 }
          console.log(person.name)
          console.log(person.age)
        `
        const result = executeCode(code)

        expect(result.output).toContain('Alice')
        expect(result.output).toContain('30')
      })

      it('supports loops', () => {
        const code = `
          for (let i = 0; i < 3; i++) {
            console.log(i)
          }
        `
        const result = executeCode(code)

        expect(result.output).toBe('0\n1\n2')
      })

      it('supports conditionals', () => {
        const code = `
          const x = 10
          if (x > 5) {
            console.log("big")
          } else {
            console.log("small")
          }
        `
        const result = executeCode(code)

        expect(result.output).toBe('big')
      })

      it('supports template literals', () => {
        const code = `
          const name = "World"
          console.log(\`Hello, \${name}!\`)
        `
        const result = executeCode(code)

        expect(result.output).toBe('Hello, World!')
      })

      it('supports destructuring', () => {
        const code = `
          const [a, b] = [1, 2]
          const { x, y } = { x: 3, y: 4 }
          console.log(a, b, x, y)
        `
        const result = executeCode(code)

        expect(result.output).toBe('1 2 3 4')
      })

      it('supports spread operator', () => {
        const code = `
          const arr1 = [1, 2]
          const arr2 = [...arr1, 3, 4]
          console.log(arr2.join(","))
        `
        const result = executeCode(code)

        expect(result.output).toBe('1,2,3,4')
      })
    })

    describe('edge cases', () => {
      it('handles undefined values', () => {
        const result = executeCode('console.log(undefined)')

        expect(result.output).toBe('undefined')
      })

      it('handles null values', () => {
        const result = executeCode('console.log(null)')

        expect(result.output).toBe('null')
      })

      it('handles boolean values', () => {
        const result = executeCode('console.log(true, false)')

        expect(result.output).toBe('true false')
      })

      it('handles object output', () => {
        const result = executeCode('console.log({a: 1})')

        expect(result.output).toBe('[object Object]')
      })

      it('handles array output', () => {
        const result = executeCode('console.log([1, 2, 3])')

        expect(result.output).toBe('1,2,3')
      })
    })
  })
})
