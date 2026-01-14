import { createContext, useContext, useCallback, type ReactNode } from 'react'
import { useGamification } from '../hooks/useGamification'
import { useGamificationListener } from '../hooks/useGamificationListener'
import { useMicroRewards } from '../hooks/useMicroRewards'
import { getLevelInfo } from '../lib/xp-system'
import { MicroRewardStack } from './MicroReward'
import { LevelUpCelebration } from './LevelUpCelebration'
import type { Achievement } from '../types'

// =============================================================================
// Context Type
// =============================================================================

interface GamificationContextType {
  // State
  xpTotal: number
  currentLevel: number
  currentStreak: number
  longestStreak: number
  isLoading: boolean

  // Derived
  levelInfo: ReturnType<typeof getLevelInfo> | null
  levelProgress: ReturnType<typeof import('../lib/xp-system').getLevelProgress> | null

  // Achievements
  achievements: Achievement[]
  unlockedSlugs: Set<string>

  // Actions
  refresh: () => Promise<void>
}

const GamificationContext = createContext<GamificationContextType | null>(null)

// =============================================================================
// Hook
// =============================================================================

export function useGamificationContext() {
  const context = useContext(GamificationContext)
  if (!context) {
    throw new Error(
      'useGamificationContext must be used within a GamificationProvider'
    )
  }
  return context
}

// =============================================================================
// Provider
// =============================================================================

interface GamificationProviderProps {
  children: ReactNode
}

export function GamificationProvider({ children }: GamificationProviderProps) {
  const gamification = useGamification()
  const microRewards = useMicroRewards()

  // Handle gamification events
  const handleXPAwarded = useCallback(
    (xp: number, reason: string) => {
      microRewards.addReward(xp, reason, '✨')
    },
    [microRewards]
  )

  const handleLevelUp = useCallback(
    (oldLevel: number, newLevel: number) => {
      const newLevelInfo = getLevelInfo(
        newLevel === 10 ? 15000 : newLevel * 500
      )
      microRewards.showLevelUp(
        oldLevel,
        newLevel,
        newLevelInfo.title,
        newLevelInfo.icon
      )

      // Refresh gamification state
      gamification.refresh()
    },
    [microRewards, gamification]
  )

  const handleAchievementUnlocked = useCallback(
    (achievement: { slug: string; title: string; icon: string }) => {
      // Find the full achievement data
      const fullAchievement = gamification.achievements.find(
        (a) => a.slug === achievement.slug
      )
      if (fullAchievement) {
        microRewards.showAchievement(fullAchievement)
      }

      // Refresh achievements
      gamification.refreshAchievements()
    },
    [microRewards, gamification]
  )

  const handleStreakUpdated = useCallback(
    (streak: number, continued: boolean) => {
      if (continued && streak > 1) {
        microRewards.addReward(25, `${streak} day streak!`, '🔥')
      }
    },
    [microRewards]
  )

  // Set up the listener
  useGamificationListener({
    onXPAwarded: handleXPAwarded,
    onLevelUp: handleLevelUp,
    onAchievementUnlocked: handleAchievementUnlocked,
    onStreakUpdated: handleStreakUpdated,
  })

  // Build context value
  const contextValue: GamificationContextType = {
    xpTotal: gamification.state?.xpTotal ?? 0,
    currentLevel: gamification.state?.currentLevel ?? 1,
    currentStreak: gamification.state?.currentStreak ?? 0,
    longestStreak: gamification.state?.longestStreak ?? 0,
    isLoading: gamification.isLoading,
    levelInfo: gamification.levelInfo,
    levelProgress: gamification.levelProgress,
    achievements: gamification.achievements,
    unlockedSlugs: gamification.unlockedSlugs,
    refresh: gamification.refresh,
  }

  return (
    <GamificationContext.Provider value={contextValue}>
      {children}

      {/* Micro-reward notifications */}
      <MicroRewardStack
        rewards={microRewards.rewards}
        onDismiss={microRewards.dismissReward}
      />

      {/* Level up celebration */}
      {microRewards.levelUpData && (
        <LevelUpCelebration
          data={microRewards.levelUpData}
          onDismiss={microRewards.dismissLevelUp}
        />
      )}

      {/* Achievement notification toast could go here */}
    </GamificationContext.Provider>
  )
}
