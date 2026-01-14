import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/shared/lib/supabase'
import { useIdentity } from '@/modules/auth'
import { getLevelInfo, getLevelProgress } from '../lib/xp-system'
import type {
  GamificationState,
  Achievement,
  StudentAchievement,
} from '../types'

interface UseGamificationReturn {
  // State
  state: GamificationState | null
  isLoading: boolean
  error: Error | null

  // Derived values
  levelInfo: ReturnType<typeof getLevelInfo> | null
  levelProgress: ReturnType<typeof getLevelProgress> | null

  // Achievements
  achievements: Achievement[]
  earnedAchievements: StudentAchievement[]
  unlockedSlugs: Set<string>

  // Actions
  refresh: () => Promise<void>
  refreshAchievements: () => Promise<void>
}

export function useGamification(): UseGamificationReturn {
  const { profileId } = useIdentity()

  const [state, setState] = useState<GamificationState | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [earnedAchievements, setEarnedAchievements] = useState<
    StudentAchievement[]
  >([])

  // Fetch gamification state from student profile
  const fetchState = useCallback(async () => {
    if (!profileId) {
      setIsLoading(false)
      return
    }

    try {
      const { data, error: fetchError } = await supabase
        .from('student_profiles')
        .select(
          'xp_total, current_level, current_streak, longest_streak, last_activity_date, sound_enabled'
        )
        .eq('id', profileId)
        .single()

      if (fetchError) throw fetchError

      setState({
        xpTotal: data.xp_total ?? 0,
        currentLevel: data.current_level ?? 1,
        currentStreak: data.current_streak ?? 0,
        longestStreak: data.longest_streak ?? 0,
        lastActivityDate: data.last_activity_date,
        soundEnabled: data.sound_enabled ?? false,
      })
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch state'))
    } finally {
      setIsLoading(false)
    }
  }, [profileId])

  // Fetch all achievements catalog
  const fetchAchievements = useCallback(async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from('achievements')
        .select('*')
        .order('category')
        .order('criteria->threshold')

      if (fetchError) throw fetchError

      setAchievements((data as Achievement[]) ?? [])
    } catch (err) {
      console.error('Failed to fetch achievements:', err)
    }
  }, [])

  // Fetch earned achievements for current user
  const fetchEarnedAchievements = useCallback(async () => {
    if (!profileId) return

    try {
      const { data, error: fetchError } = await supabase
        .from('student_achievements')
        .select(
          `
          *,
          achievement:achievements(*)
        `
        )
        .eq('student_id', profileId)
        .order('earned_at', { ascending: false })

      if (fetchError) throw fetchError

      setEarnedAchievements((data as StudentAchievement[]) ?? [])
    } catch (err) {
      console.error('Failed to fetch earned achievements:', err)
    }
  }, [profileId])

  // Refresh all gamification data
  const refresh = useCallback(async () => {
    setIsLoading(true)
    await fetchState()
  }, [fetchState])

  // Refresh achievements only
  const refreshAchievements = useCallback(async () => {
    await Promise.all([fetchAchievements(), fetchEarnedAchievements()])
  }, [fetchAchievements, fetchEarnedAchievements])

  // Initial fetch
  useEffect(() => {
    fetchState()
    fetchAchievements()
    fetchEarnedAchievements()
  }, [fetchState, fetchAchievements, fetchEarnedAchievements])

  // Compute derived values
  const levelInfo = state ? getLevelInfo(state.xpTotal) : null
  const levelProgress = state ? getLevelProgress(state.xpTotal) : null

  // Compute set of unlocked achievement slugs for easy checking
  const unlockedSlugs = new Set(
    earnedAchievements
      .map((ea) => ea.achievement?.slug)
      .filter((slug): slug is string => !!slug)
  )

  return {
    state,
    isLoading,
    error,
    levelInfo,
    levelProgress,
    achievements,
    earnedAchievements,
    unlockedSlugs,
    refresh,
    refreshAchievements,
  }
}
