import { useEffect, useState } from 'react'
import { supabase } from '@/shared/lib/supabase'
import type { Lesson, LessonContent, Exercise, ModuleRow } from '../types'

interface LessonState {
  lesson: Lesson | null
  module: ModuleRow | null
  loading: boolean
  error: string | null
}

export function useLesson(slug: string | undefined) {
  const [state, setState] = useState<LessonState>({
    lesson: null,
    module: null,
    loading: true,
    error: null,
  })

  useEffect(() => {
    async function fetchLesson() {
      if (!slug) {
        setState({ lesson: null, module: null, loading: false, error: 'No lesson slug provided' })
        return
      }

      const { data, error } = await supabase
        .from('lessons')
        .select('*')
        .eq('slug', slug)
        .single()

      if (error) {
        setState({ lesson: null, module: null, loading: false, error: error.message })
        return
      }

      if (!data) {
        setState({ lesson: null, module: null, loading: false, error: 'Lesson not found' })
        return
      }

      // Parse JSON content
      const content = (data.content as unknown as LessonContent) || { sections: [] }
      const exercise = (data.exercise as unknown as Exercise) || null

      const lesson: Lesson = {
        ...data,
        content,
        exercise,
      }

      // Fetch module info
      let module: ModuleRow | null = null
      if (data.module_id) {
        const { data: moduleData } = await supabase
          .from('modules')
          .select('*')
          .eq('id', data.module_id)
          .single()
        module = moduleData
      }

      setState({ lesson, module, loading: false, error: null })
    }

    fetchLesson()
  }, [slug])

  return state
}
