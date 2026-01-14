/**
 * XP System Configuration
 *
 * Kid-friendly design: No penalties, only bonuses!
 * Encourage asking for help and taking risks.
 */

// =============================================================================
// XP Rewards
// =============================================================================

export const XP_REWARDS = {
  // Micro-rewards (frequent, small)
  FIRST_CODE_RUN_SESSION: 5,
  ERROR_FIXED: 10,
  HINT_USED: 5, // Encourage asking for help!
  FIRST_TEST_PASS: 15,

  // Major rewards
  ALL_TESTS_PASS: 50,
  LESSON_COMPLETE: 100,
  FIRST_ATTEMPT_BONUS: 50,
  STREAK_DAILY_BONUS: 25,

  // Speed bonuses
  FAST_COMPLETION_BONUS: 25, // Under 5 minutes
} as const

// =============================================================================
// Level System
// =============================================================================

export interface Level {
  level: number
  xp: number
  title: string
  icon: string
  color: string
}

export const LEVELS: Level[] = [
  { level: 1, xp: 0, title: 'Starter', icon: '🌱', color: '#94A3B8' },
  { level: 2, xp: 150, title: 'Explorer', icon: '🌿', color: '#22C55E' },
  { level: 3, xp: 400, title: 'Coder', icon: '⭐', color: '#3B82F6' },
  { level: 4, xp: 800, title: 'Builder', icon: '🌟', color: '#8B5CF6' },
  { level: 5, xp: 1500, title: 'Creator', icon: '💫', color: '#F59E0B' },
  { level: 6, xp: 2500, title: 'Developer', icon: '🔥', color: '#EF4444' },
  { level: 7, xp: 4000, title: 'Expert', icon: '💎', color: '#EC4899' },
  { level: 8, xp: 6000, title: 'Master', icon: '👑', color: '#14B8A6' },
  { level: 9, xp: 9000, title: 'Legend', icon: '🏆', color: '#F97316' },
  { level: 10, xp: 15000, title: 'Wizard', icon: '🧙', color: '#8B5CF6' },
]

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Calculate level from XP total
 */
export function calculateLevel(xp: number): number {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (xp >= LEVELS[i].xp) {
      return LEVELS[i].level
    }
  }
  return 1
}

/**
 * Get level info for a given XP total
 */
export function getLevelInfo(xp: number): Level {
  const level = calculateLevel(xp)
  return LEVELS[level - 1]
}

/**
 * Get XP progress within current level
 */
export function getLevelProgress(xp: number): {
  currentXP: number
  nextLevelXP: number
  progressPercent: number
  xpToNextLevel: number
} {
  const currentLevel = calculateLevel(xp)
  const currentLevelData = LEVELS[currentLevel - 1]
  const nextLevelData = LEVELS[currentLevel] // undefined if max level

  if (!nextLevelData) {
    // Max level reached
    return {
      currentXP: xp,
      nextLevelXP: currentLevelData.xp,
      progressPercent: 100,
      xpToNextLevel: 0,
    }
  }

  const xpIntoLevel = xp - currentLevelData.xp
  const xpNeededForLevel = nextLevelData.xp - currentLevelData.xp
  const progressPercent = Math.min(
    100,
    Math.round((xpIntoLevel / xpNeededForLevel) * 100)
  )

  return {
    currentXP: xp,
    nextLevelXP: nextLevelData.xp,
    progressPercent,
    xpToNextLevel: nextLevelData.xp - xp,
  }
}

/**
 * Calculate XP for completing a lesson
 */
export function calculateLessonXP(options: {
  passed: boolean
  isFirstAttempt: boolean
  timeSpentSeconds: number
}): number {
  if (!options.passed) {
    return 0
  }

  let xp = XP_REWARDS.LESSON_COMPLETE

  // First attempt bonus
  if (options.isFirstAttempt) {
    xp += XP_REWARDS.FIRST_ATTEMPT_BONUS
  }

  // Speed bonus (under 5 minutes = 300 seconds)
  if (options.timeSpentSeconds > 0 && options.timeSpentSeconds < 300) {
    xp += XP_REWARDS.FAST_COMPLETION_BONUS
  }

  return xp
}

/**
 * Get the max level
 */
export function getMaxLevel(): number {
  return LEVELS[LEVELS.length - 1].level
}

/**
 * Check if user is at max level
 */
export function isMaxLevel(level: number): boolean {
  return level >= getMaxLevel()
}

// =============================================================================
// Achievement Categories
// =============================================================================

export const ACHIEVEMENT_CATEGORIES = {
  general: { label: 'General', icon: '🎯' },
  streak: { label: 'Streaks', icon: '🔥' },
  speed: { label: 'Speed', icon: '⚡' },
  mastery: { label: 'Mastery', icon: '💎' },
} as const

export type AchievementCategory = keyof typeof ACHIEVEMENT_CATEGORIES

// =============================================================================
// Gamification Colors (for UI consistency)
// =============================================================================

export const GAMIFICATION_COLORS = {
  xp: '#F59E0B', // Gold/amber for XP
  streak: '#EF4444', // Red/fire for streaks
  levelUp: '#8B5CF6', // Purple for level ups
  success: '#22C55E', // Green for success
  achievement: '#3B82F6', // Blue for achievements
} as const
