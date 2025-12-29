import { describe, it, expect } from 'vitest'
import { toTutorMessage } from './index'
import type { TutorMessageRow } from './index'

describe('tutor types', () => {
  describe('toTutorMessage', () => {
    it('converts database row to TutorMessage', () => {
      const row: TutorMessageRow = {
        id: 'msg-123',
        student_id: 'student-1',
        lesson_id: 'lesson-1',
        role: 'student',
        content: 'How do I use variables?',
        message_type: 'question',
        created_at: '2024-01-15T10:30:00Z',
      }

      const message = toTutorMessage(row)

      expect(message.id).toBe('msg-123')
      expect(message.role).toBe('student')
      expect(message.content).toBe('How do I use variables?')
      expect(message.messageType).toBe('question')
      expect(message.createdAt).toBeInstanceOf(Date)
      expect(message.createdAt.toISOString()).toBe('2024-01-15T10:30:00.000Z')
    })

    it('handles tutor role', () => {
      const row: TutorMessageRow = {
        id: 'msg-456',
        student_id: 'student-1',
        lesson_id: 'lesson-1',
        role: 'tutor',
        content: 'Variables are containers for storing data.',
        message_type: 'explanation',
        created_at: '2024-01-15T10:31:00Z',
      }

      const message = toTutorMessage(row)

      expect(message.role).toBe('tutor')
      expect(message.messageType).toBe('explanation')
    })

    it('handles null message_type', () => {
      const row: TutorMessageRow = {
        id: 'msg-789',
        student_id: 'student-1',
        lesson_id: 'lesson-1',
        role: 'student',
        content: 'Hello',
        message_type: null,
        created_at: '2024-01-15T10:32:00Z',
      }

      const message = toTutorMessage(row)

      expect(message.messageType).toBeNull()
    })

    it('handles null created_at by using current date', () => {
      const beforeTest = Date.now()

      const row: TutorMessageRow = {
        id: 'msg-abc',
        student_id: 'student-1',
        lesson_id: 'lesson-1',
        role: 'student',
        content: 'Test',
        message_type: null,
        created_at: null,
      }

      const message = toTutorMessage(row)

      const afterTest = Date.now()
      expect(message.createdAt.getTime()).toBeGreaterThanOrEqual(beforeTest)
      expect(message.createdAt.getTime()).toBeLessThanOrEqual(afterTest)
    })

    it('handles different message types', () => {
      const messageTypes = ['question', 'hint', 'explanation', 'encouragement', 'proactive'] as const

      messageTypes.forEach(type => {
        const row: TutorMessageRow = {
          id: `msg-${type}`,
          student_id: 'student-1',
          lesson_id: 'lesson-1',
          role: 'tutor',
          content: 'Content',
          message_type: type,
          created_at: '2024-01-15T10:00:00Z',
        }

        const message = toTutorMessage(row)
        expect(message.messageType).toBe(type)
      })
    })
  })
})
