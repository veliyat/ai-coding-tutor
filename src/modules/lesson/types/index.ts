import type { Database } from '@/shared/types/database'

// Database row types
export type ModuleRow = Database['public']['Tables']['modules']['Row']
export type LessonRow = Database['public']['Tables']['lessons']['Row']
export type ProgressRow = Database['public']['Tables']['student_progress']['Row']

// Lesson content structure (stored as JSON in lessons.content)
export interface ContentSection {
  type: 'explanation' | 'code_example'
  title?: string
  text?: string
  code?: string
  language?: 'javascript'
  output?: string
}

export interface LessonContent {
  sections: ContentSection[]
}

// Exercise structure (stored as JSON in lessons.exercise)
export interface TestCase {
  name: string
  input?: string
  expectedOutput: string
}

export interface Hint {
  level: number
  text: string
  code?: string
}

export interface Exercise {
  description: string
  starterCode: string
  solution: string
  testCases: TestCase[]
  hints: Hint[]
}

// Parsed lesson with typed content
export interface Lesson extends Omit<LessonRow, 'content' | 'exercise'> {
  content: LessonContent
  exercise: Exercise | null
}

// Module with its lessons
export interface ModuleWithLessons extends ModuleRow {
  lessons: LessonRow[]
}

// Progress status
export type ProgressStatus = 'not_started' | 'in_progress' | 'completed'
