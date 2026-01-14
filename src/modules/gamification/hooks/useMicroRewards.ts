import { useState, useCallback, useRef } from 'react'
import type { MicroReward, LevelUpData, AchievementNotification } from '../types'
import type { Achievement } from '../types'

interface UseMicroRewardsReturn {
  // Reward queue
  rewards: MicroReward[]
  dismissReward: (id: string) => void

  // Level up state
  levelUpData: LevelUpData | null
  dismissLevelUp: () => void

  // Achievement notifications
  achievementNotification: AchievementNotification | null
  dismissAchievement: () => void

  // Actions to add notifications
  addReward: (xp: number, message: string, icon?: string) => void
  showLevelUp: (oldLevel: number, newLevel: number, title: string, icon: string) => void
  showAchievement: (achievement: Achievement) => void
}

/**
 * Hook to manage micro-reward notifications and celebrations.
 * Queues up rewards and shows them one at a time.
 */
export function useMicroRewards(): UseMicroRewardsReturn {
  const [rewards, setRewards] = useState<MicroReward[]>([])
  const [levelUpData, setLevelUpData] = useState<LevelUpData | null>(null)
  const [achievementNotification, setAchievementNotification] =
    useState<AchievementNotification | null>(null)

  const idCounter = useRef(0)

  // Add a micro-reward to the queue
  const addReward = useCallback((xp: number, message: string, icon?: string) => {
    const id = `reward-${++idCounter.current}`

    setRewards((prev) => [...prev, { id, xp, message, icon }])

    // Auto-dismiss after 3 seconds
    setTimeout(() => {
      setRewards((prev) => prev.filter((r) => r.id !== id))
    }, 3000)
  }, [])

  // Dismiss a specific reward
  const dismissReward = useCallback((id: string) => {
    setRewards((prev) => prev.filter((r) => r.id !== id))
  }, [])

  // Show level up celebration
  const showLevelUp = useCallback(
    (oldLevel: number, newLevel: number, title: string, icon: string) => {
      setLevelUpData({
        oldLevel,
        newLevel,
        newTitle: title,
        newIcon: icon,
      })
    },
    []
  )

  // Dismiss level up
  const dismissLevelUp = useCallback(() => {
    setLevelUpData(null)
  }, [])

  // Show achievement notification
  const showAchievement = useCallback((achievement: Achievement) => {
    setAchievementNotification({
      achievement,
      earnedAt: new Date().toISOString(),
      isNew: true,
    })

    // Auto-dismiss after 5 seconds
    setTimeout(() => {
      setAchievementNotification(null)
    }, 5000)
  }, [])

  // Dismiss achievement notification
  const dismissAchievement = useCallback(() => {
    setAchievementNotification(null)
  }, [])

  return {
    rewards,
    dismissReward,
    levelUpData,
    dismissLevelUp,
    achievementNotification,
    dismissAchievement,
    addReward,
    showLevelUp,
    showAchievement,
  }
}
