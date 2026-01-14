import { useCallback, useState } from 'react'
import { useSubscribe } from '@/shared/hooks'
import { supabase } from '@/shared/lib/supabase'
import { useIdentity } from '@/modules/auth'
import type { GamificationResult } from '../types'
import { logger } from '@/shared/lib/logger'

interface UseGamificationListenerOptions {
  onResult?: (result: GamificationResult) => void
  onXPAwarded?: (xp: number, reason: string) => void
  onLevelUp?: (oldLevel: number, newLevel: number) => void
  onAchievementUnlocked?: (achievement: { slug: string; title: string; icon: string }) => void
  onStreakUpdated?: (streak: number, continued: boolean) => void
}

interface UseGamificationListenerReturn {
  isProcessing: boolean
  lastResult: GamificationResult | null
}

/**
 * Hook that listens to app events and triggers gamification evaluation.
 * Calls the Edge Function to securely evaluate achievements and award XP.
 */
export function useGamificationListener(
  options: UseGamificationListenerOptions = {}
): UseGamificationListenerReturn {
  const { profileId } = useIdentity()
  const [isProcessing, setIsProcessing] = useState(false)
  const [lastResult, setLastResult] = useState<GamificationResult | null>(null)

  const {
    onResult,
    onXPAwarded,
    onLevelUp,
    onAchievementUnlocked,
    onStreakUpdated,
  } = options

  // Process gamification event via Edge Function
  const processEvent = useCallback(
    async (eventName: string, eventData: Record<string, unknown>) => {
      if (!profileId) {
        logger.debug('No profile ID, skipping gamification')
        return
      }

      setIsProcessing(true)

      try {
        const { data, error } = await supabase.functions.invoke(
          'evaluate-gamification-event',
          {
            body: {
              studentId: profileId,
              eventName,
              eventData,
            },
          }
        )

        if (error) {
          logger.error('Gamification evaluation failed:', error)
          return
        }

        const result = data as GamificationResult
        setLastResult(result)

        // Trigger callbacks
        onResult?.(result)

        if (result.xp) {
          onXPAwarded?.(result.xp.xpAwarded, result.xp.reason)

          if (result.xp.levelUp) {
            onLevelUp?.(result.xp.oldLevel, result.xp.newLevel)
          }
        }

        if (result.streak) {
          onStreakUpdated?.(result.streak.newStreak, result.streak.streakContinued)
        }

        for (const unlock of result.achievements) {
          onAchievementUnlocked?.({
            slug: unlock.achievement.slug,
            title: unlock.achievement.title,
            icon: unlock.achievement.icon,
          })
        }

        logger.debug('Gamification result:', result)
      } catch (err) {
        // Never block the user - gamification is non-critical
        logger.error('Gamification processing error:', err)
      } finally {
        setIsProcessing(false)
      }
    },
    [profileId, onResult, onXPAwarded, onLevelUp, onAchievementUnlocked, onStreakUpdated]
  )

  // Subscribe to exercise attempts
  useSubscribe(
    'exercise:attempt_recorded',
    useCallback(
      (data) => {
        processEvent('exercise:attempt', {
          lessonId: data.lessonId,
          exerciseId: data.exerciseId,
          passed: data.passed,
          isFirstAttempt: data.isFirstAttempt,
          timeSpentSeconds: data.timeSpentSeconds,
        })
      },
      [processEvent]
    )
  )

  // Subscribe to lesson completion
  useSubscribe(
    'lesson:completed',
    useCallback(
      (data) => {
        processEvent('lesson:completed', {
          lessonId: data.lessonId,
          timeSeconds: data.timeSeconds,
        })
      },
      [processEvent]
    )
  )

  // Subscribe to code runs
  useSubscribe(
    'code:run_executed',
    useCallback(
      (data) => {
        processEvent('code:run', {
          hasErrors: data.hasErrors,
        })
      },
      [processEvent]
    )
  )

  // Subscribe to error fixes
  useSubscribe(
    'error:fixed',
    useCallback(
      (data) => {
        processEvent('error:fixed', {
          errorType: data.errorType,
        })
      },
      [processEvent]
    )
  )

  // Subscribe to hint usage
  useSubscribe(
    'hint:used',
    useCallback(
      (data) => {
        processEvent('hint:used', {
          lessonId: data.lessonId,
        })
      },
      [processEvent]
    )
  )

  return {
    isProcessing,
    lastResult,
  }
}
