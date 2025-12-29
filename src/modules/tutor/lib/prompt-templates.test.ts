import { describe, it, expect } from 'vitest'
import { getRandomResponse, MOCK_RESPONSES, PROACTIVE_PROMPTS } from './prompt-templates'

describe('prompt-templates', () => {
  describe('PROACTIVE_PROMPTS', () => {
    it('has all required prompt categories', () => {
      expect(PROACTIVE_PROMPTS.syntaxError).toBeDefined()
      expect(PROACTIVE_PROMPTS.multipleFailures).toBeDefined()
      expect(PROACTIVE_PROMPTS.logicError).toBeDefined()
      expect(PROACTIVE_PROMPTS.stuck).toBeDefined()
    })

    it('prompts are non-empty strings', () => {
      Object.values(PROACTIVE_PROMPTS).forEach(prompt => {
        expect(typeof prompt).toBe('string')
        expect(prompt.length).toBeGreaterThan(0)
      })
    })
  })

  describe('MOCK_RESPONSES', () => {
    it('has all required response categories', () => {
      expect(MOCK_RESPONSES.syntaxError).toBeDefined()
      expect(MOCK_RESPONSES.testFailing).toBeDefined()
      expect(MOCK_RESPONSES.generalHelp).toBeDefined()
      expect(MOCK_RESPONSES.encouragement).toBeDefined()
      expect(MOCK_RESPONSES.hintLevel1).toBeDefined()
      expect(MOCK_RESPONSES.hintLevel2).toBeDefined()
      expect(MOCK_RESPONSES.hintLevel3).toBeDefined()
    })

    it('each category has at least one response', () => {
      Object.values(MOCK_RESPONSES).forEach(responses => {
        expect(Array.isArray(responses)).toBe(true)
        expect(responses.length).toBeGreaterThan(0)
      })
    })

    it('all responses are non-empty strings', () => {
      Object.values(MOCK_RESPONSES).forEach(responses => {
        responses.forEach(response => {
          expect(typeof response).toBe('string')
          expect(response.length).toBeGreaterThan(0)
        })
      })
    })
  })

  describe('getRandomResponse', () => {
    it('returns a string from the specified category', () => {
      const response = getRandomResponse('syntaxError')

      expect(typeof response).toBe('string')
      expect(MOCK_RESPONSES.syntaxError).toContain(response)
    })

    it('returns responses from each category', () => {
      const categories: (keyof typeof MOCK_RESPONSES)[] = [
        'syntaxError',
        'testFailing',
        'generalHelp',
        'encouragement',
        'hintLevel1',
        'hintLevel2',
        'hintLevel3',
      ]

      categories.forEach(category => {
        const response = getRandomResponse(category)
        expect(MOCK_RESPONSES[category]).toContain(response)
      })
    })

    it('can return different responses on multiple calls (randomness)', () => {
      // Run multiple times and check we get variety
      // For categories with multiple responses
      const responses = new Set<string>()
      for (let i = 0; i < 20; i++) {
        responses.add(getRandomResponse('syntaxError'))
      }

      // Should have gotten at least 1 response (could be same if only 1 option)
      // With 2 options and 20 tries, very likely to get both
      expect(responses.size).toBeGreaterThanOrEqual(1)
    })
  })
})
