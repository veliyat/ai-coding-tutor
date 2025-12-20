import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/shared/lib/supabase'
import { useAuth } from '@/modules/auth'
import type { ProgressRow, ProgressStatus } from '../types'

interface ProgressState {
  progress: Record<string, ProgressRow>  // keyed by lesson_id
  loading: boolean
  error: string | null
}

export function useProgress() {
  const { user, loading: authLoading } = useAuth()
  const [state, setState] = useState<ProgressState>({
    progress: {},
    loading: true,
    error: null,
  })

  const fetchProgress = useCallback(async () => {
    if (!user) {
      setState({ progress: {}, loading: false, error: null })
      return
    }

    const { data, error } = await supabase
      .from('student_progress')
      .select('*')
      .eq('student_id', user.id)

    if (error) {
      setState({ progress: {}, loading: false, error: error.message })
      return
    }

    // Index by lesson_id for quick lookup
    const progressMap: Record<string, ProgressRow> = {}
    for (const row of data || []) {
      if (row.lesson_id) {
        progressMap[row.lesson_id] = row
      }
    }

    setState({ progress: progressMap, loading: false, error: null })
  }, [user])

  useEffect(() => {
    if (authLoading) return
    fetchProgress()
  }, [authLoading, fetchProgress])

  const startLesson = useCallback(async (lessonId: string): Promise<{ error: string | null }> => {
    if (!user) return { error: 'Not authenticated' }

    const existing = state.progress[lessonId]
    if (existing) {
      // Already started
      return { error: null }
    }

    const { error } = await supabase.from('student_progress').insert({
      student_id: user.id,
      lesson_id: lessonId,
      status: 'in_progress',
      started_at: new Date().toISOString(),
    })

    if (error) return { error: error.message }

    await fetchProgress()
    return { error: null }
  }, [user, state.progress, fetchProgress])

  const completeLesson = useCallback(async (lessonId: string): Promise<{ error: string | null }> => {
    if (!user) return { error: 'Not authenticated' }

    const existing = state.progress[lessonId]
    if (!existing) {
      // Create new completed progress
      const { error } = await supabase.from('student_progress').insert({
        student_id: user.id,
        lesson_id: lessonId,
        status: 'completed',
        started_at: new Date().toISOString(),
        completed_at: new Date().toISOString(),
      })
      if (error) return { error: error.message }
    } else {
      // Update existing
      const { error } = await supabase
        .from('student_progress')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
        })
        .eq('id', existing.id)
      if (error) return { error: error.message }
    }

    await fetchProgress()
    return { error: null }
  }, [user, state.progress, fetchProgress])

  const getStatus = useCallback((lessonId: string): ProgressStatus => {
    const row = state.progress[lessonId]
    if (!row) return 'not_started'
    return (row.status as ProgressStatus) || 'not_started'
  }, [state.progress])

  return {
    progress: state.progress,
    loading: state.loading || authLoading,
    error: state.error,
    startLesson,
    completeLesson,
    getStatus,
  }
}
