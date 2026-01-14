import type { AchievementCategory } from '../lib/xp-system'

// =============================================================================
// Database Types
// =============================================================================

export interface Achievement {
  id: string
  slug: string
  title: string
  description: string
  icon: string
  xp_reward: number
  criteria: AchievementCriteria
  category: AchievementCategory
  created_at: string
}

export interface StudentAchievement {
  id: string
  student_id: string
  achievement_id: string
  earned_at: string
  achievement?: Achievement
}

export interface AchievementCriteria {
  type:
    | 'lessons_completed'
    | 'modules_completed'
    | 'streak'
    | 'first_attempt_pass'
    | 'fast_completion'
    | 'code_runs'
    | 'errors_fixed'
  threshold: number
}

// =============================================================================
// Gamification State
// =============================================================================

export interface GamificationState {
  xpTotal: number
  currentLevel: number
  currentStreak: number
  longestStreak: number
  lastActivityDate: string | null
  soundEnabled: boolean
}

export interface GamificationStats {
  lessonsCompleted: number
  modulesCompleted: number
  firstAttemptPasses: number
  fastestLessonSeconds: number | null
  totalCodeRuns: number
  errorsFixed: number
}

// =============================================================================
// Event Types (for Edge Function)
// =============================================================================

export type GamificationEventName =
  | 'exercise:attempt'
  | 'lesson:completed'
  | 'code:run'
  | 'error:fixed'
  | 'hint:used'

export interface GamificationEvent {
  eventName: GamificationEventName
  eventData: Record<string, unknown>
}

// =============================================================================
// Result Types
// =============================================================================

export interface XPAwardResult {
  xpAwarded: number
  reason: string
  newXpTotal: number
  oldLevel: number
  newLevel: number
  levelUp: boolean
}

export interface StreakUpdateResult {
  newStreak: number
  streakContinued: boolean
  streakStarted: boolean
  longestStreak: number
}

export interface AchievementUnlockResult {
  achievement: Achievement
  earnedAt: string
}

export interface GamificationResult {
  xp: XPAwardResult | null
  streak: StreakUpdateResult | null
  achievements: AchievementUnlockResult[]
}

// =============================================================================
// UI Types
// =============================================================================

export interface MicroReward {
  id: string
  xp: number
  message: string
  icon?: string
}

export interface LevelUpData {
  oldLevel: number
  newLevel: number
  newTitle: string
  newIcon: string
}

export interface AchievementNotification {
  achievement: Achievement
  earnedAt: string
  isNew: boolean
}
