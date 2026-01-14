// Components
export { GamificationProvider, useGamificationContext } from './components/GamificationProvider'
export { LevelBadge } from './components/LevelBadge'
export { XPDisplay } from './components/XPDisplay'
export { StreakCounter } from './components/StreakCounter'
export { MicroReward, MicroRewardStack } from './components/MicroReward'
export { AchievementCard } from './components/AchievementCard'
export { LevelUpCelebration } from './components/LevelUpCelebration'

// Hooks
export { useGamification } from './hooks/useGamification'
export { useGamificationListener } from './hooks/useGamificationListener'
export { useMicroRewards } from './hooks/useMicroRewards'

// Lib
export {
  XP_REWARDS,
  LEVELS,
  calculateLevel,
  getLevelInfo,
  getLevelProgress,
  calculateLessonXP,
  getMaxLevel,
  isMaxLevel,
  ACHIEVEMENT_CATEGORIES,
  GAMIFICATION_COLORS,
} from './lib/xp-system'
export type { Level, AchievementCategory } from './lib/xp-system'

// Types
export type {
  Achievement,
  StudentAchievement,
  AchievementCriteria,
  GamificationState,
  GamificationStats,
  GamificationEventName,
  GamificationEvent,
  XPAwardResult,
  StreakUpdateResult,
  AchievementUnlockResult,
  GamificationResult,
  MicroReward as MicroRewardData,
  LevelUpData,
  AchievementNotification,
} from './types'
