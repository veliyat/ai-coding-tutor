import { useEffect, useState } from 'react'
import { supabase } from '@/shared/lib/supabase'
import type { ModuleWithLessons } from '../types'

interface ModulesState {
  modules: ModuleWithLessons[]
  loading: boolean
  error: string | null
}

export function useModules() {
  const [state, setState] = useState<ModulesState>({
    modules: [],
    loading: true,
    error: null,
  })

  useEffect(() => {
    async function fetchModules() {
      const { data: modules, error: modulesError } = await supabase
        .from('modules')
        .select('*')
        .order('sequence_order')

      if (modulesError) {
        setState({ modules: [], loading: false, error: modulesError.message })
        return
      }

      const { data: lessons, error: lessonsError } = await supabase
        .from('lessons')
        .select('*')
        .order('sequence_order')

      if (lessonsError) {
        setState({ modules: [], loading: false, error: lessonsError.message })
        return
      }

      // Group lessons by module
      const modulesWithLessons: ModuleWithLessons[] = (modules || []).map((mod) => ({
        ...mod,
        lessons: (lessons || []).filter((lesson) => lesson.module_id === mod.id),
      }))

      setState({ modules: modulesWithLessons, loading: false, error: null })
    }

    fetchModules()
  }, [])

  return state
}
