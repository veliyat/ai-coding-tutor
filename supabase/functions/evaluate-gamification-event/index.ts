import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from 'jsr:@supabase/supabase-js@2'

// =============================================================================
// Types
// =============================================================================

interface GamificationRequest {
  studentId: string
  eventName: string
  eventData: Record<string, unknown>
}

interface XPAwardResult {
  xpAwarded: number
  reason: string
  newXpTotal: number
  oldLevel: number
  newLevel: number
  levelUp: boolean
}

interface StreakUpdateResult {
  newStreak: number
  streakContinued: boolean
  streakStarted: boolean
  longestStreak: number
}

interface AchievementUnlockResult {
  achievement: {
    id: string
    slug: string
    title: string
    description: string
    icon: string
    xp_reward: number
  }
  earnedAt: string
}

interface GamificationResult {
  xp: XPAwardResult | null
  streak: StreakUpdateResult | null
  achievements: AchievementUnlockResult[]
}

interface StudentStats {
  lessonsCompleted: number
  modulesCompleted: number
  currentStreak: number
  firstAttemptPasses: number
  fastestLessonSeconds: number | null
  totalCodeRuns: number
  errorsFixed: number
}

// =============================================================================
// XP Constants (must match frontend xp-system.ts)
// =============================================================================

const XP_REWARDS = {
  FIRST_CODE_RUN_SESSION: 5,
  ERROR_FIXED: 10,
  HINT_USED: 5,
  FIRST_TEST_PASS: 15,
  ALL_TESTS_PASS: 50,
  LESSON_COMPLETE: 100,
  FIRST_ATTEMPT_BONUS: 50,
  STREAK_DAILY_BONUS: 25,
  FAST_COMPLETION_BONUS: 25,
}

// =============================================================================
// Helper Functions
// =============================================================================

function calculateLevel(xp: number): number {
  if (xp >= 15000) return 10
  if (xp >= 9000) return 9
  if (xp >= 6000) return 8
  if (xp >= 4000) return 7
  if (xp >= 2500) return 6
  if (xp >= 1500) return 5
  if (xp >= 800) return 4
  if (xp >= 400) return 3
  if (xp >= 150) return 2
  return 1
}

// =============================================================================
// XP Calculation
// =============================================================================

function calculateXP(
  eventName: string,
  eventData: Record<string, unknown>
): { xp: number; reason: string } | null {
  switch (eventName) {
    case 'exercise:attempt':
      if (eventData.passed) {
        let xp = XP_REWARDS.ALL_TESTS_PASS
        let reason = 'Exercise passed'

        if (eventData.isFirstAttempt) {
          xp += XP_REWARDS.FIRST_ATTEMPT_BONUS
          reason = 'Perfect! First attempt'
        }

        const timeSeconds = eventData.timeSpentSeconds as number
        if (timeSeconds > 0 && timeSeconds < 300) {
          xp += XP_REWARDS.FAST_COMPLETION_BONUS
          reason += ' (speed bonus!)'
        }

        return { xp, reason }
      }
      return null

    case 'lesson:completed':
      return { xp: XP_REWARDS.LESSON_COMPLETE, reason: 'Lesson completed' }

    case 'code:run':
      // Only award XP for first code run of the session
      // This would need session tracking - for now, skip
      return null

    case 'error:fixed':
      return { xp: XP_REWARDS.ERROR_FIXED, reason: 'Bug squashed!' }

    case 'hint:used':
      return { xp: XP_REWARDS.HINT_USED, reason: 'Smart move asking for help!' }

    default:
      return null
  }
}

// =============================================================================
// Achievement Checking
// =============================================================================

interface AchievementCriteria {
  type: string
  threshold: number
}

function checkAchievementCriteria(
  criteria: AchievementCriteria,
  stats: StudentStats
): boolean {
  switch (criteria.type) {
    case 'lessons_completed':
      return stats.lessonsCompleted >= criteria.threshold
    case 'modules_completed':
      return stats.modulesCompleted >= criteria.threshold
    case 'streak':
      return stats.currentStreak >= criteria.threshold
    case 'first_attempt_pass':
      return stats.firstAttemptPasses >= criteria.threshold
    case 'fast_completion':
      return (
        stats.fastestLessonSeconds !== null &&
        stats.fastestLessonSeconds <= criteria.threshold
      )
    case 'code_runs':
      return stats.totalCodeRuns >= criteria.threshold
    case 'errors_fixed':
      return stats.errorsFixed >= criteria.threshold
    default:
      return false
  }
}

// =============================================================================
// Main Handler
// =============================================================================

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers':
    'Content-Type, Authorization, x-client-info, apikey',
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const { studentId, eventName, eventData }: GamificationRequest =
      await req.json()

    if (!studentId) {
      return new Response(JSON.stringify({ error: 'Student ID required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // -------------------------------------------------------------------------
    // Security: Validate studentId exists and is active
    // This prevents arbitrary XP injection to non-existent profiles
    // -------------------------------------------------------------------------
    const { data: profile, error: profileError } = await supabase
      .from('student_profiles')
      .select('id, last_active_at')
      .eq('id', studentId)
      .single()

    if (profileError || !profile) {
      return new Response(JSON.stringify({ error: 'Invalid student' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const result: GamificationResult = {
      xp: null,
      streak: null,
      achievements: [],
    }

    // -------------------------------------------------------------------------
    // 1. Calculate and award XP
    // -------------------------------------------------------------------------
    const xpCalc = calculateXP(eventName, eventData)

    if (xpCalc && xpCalc.xp > 0) {
      // Use the database function to award XP
      const { data: xpResult, error: xpError } = await supabase.rpc('award_xp', {
        p_student_id: studentId,
        p_xp_amount: xpCalc.xp,
      })

      if (xpError) {
        console.error('Error awarding XP:', xpError)
      } else if (xpResult && xpResult.length > 0) {
        const row = xpResult[0]
        result.xp = {
          xpAwarded: xpCalc.xp,
          reason: xpCalc.reason,
          newXpTotal: row.new_xp_total,
          oldLevel: row.old_level,
          newLevel: row.new_level,
          levelUp: row.level_up,
        }
      }
    }

    // -------------------------------------------------------------------------
    // 2. Update streak (only for meaningful activity)
    // -------------------------------------------------------------------------
    const streakEvents = ['exercise:attempt', 'lesson:completed']
    if (streakEvents.includes(eventName) && eventData.passed !== false) {
      // Get user's timezone
      const { data: profile } = await supabase
        .from('student_profiles')
        .select('timezone')
        .eq('id', studentId)
        .single()

      const timezone = profile?.timezone || 'UTC'

      const { data: streakResult, error: streakError } = await supabase.rpc(
        'update_streak',
        {
          p_student_id: studentId,
          p_timezone: timezone,
        }
      )

      if (streakError) {
        console.error('Error updating streak:', streakError)
      } else if (streakResult && streakResult.length > 0) {
        const row = streakResult[0]
        result.streak = {
          newStreak: row.new_streak,
          streakContinued: row.streak_continued,
          streakStarted: row.streak_started,
          longestStreak: row.new_streak, // This is already updated in the DB
        }

        // Award streak bonus if streak continued
        if (row.streak_continued) {
          const { data: bonusResult } = await supabase.rpc('award_xp', {
            p_student_id: studentId,
            p_xp_amount: XP_REWARDS.STREAK_DAILY_BONUS,
          })

          if (bonusResult && bonusResult.length > 0 && result.xp) {
            result.xp.xpAwarded += XP_REWARDS.STREAK_DAILY_BONUS
            result.xp.newXpTotal = bonusResult[0].new_xp_total
            result.xp.reason += ' + streak bonus!'
          }
        }
      }
    }

    // -------------------------------------------------------------------------
    // 3. Check for new achievements
    // -------------------------------------------------------------------------

    // Fetch student stats
    const { data: progressData } = await supabase
      .from('student_progress')
      .select('status, total_time_seconds')
      .eq('student_id', studentId)

    const lessonsCompleted =
      progressData?.filter((p) => p.status === 'completed').length || 0

    // Get current streak from profile
    const { data: currentProfile } = await supabase
      .from('student_profiles')
      .select('current_streak')
      .eq('id', studentId)
      .single()

    // Get first attempt passes count
    const { data: attemptsData } = await supabase
      .from('exercise_attempts')
      .select('lesson_id, passed')
      .eq('student_id', studentId)
      .eq('passed', true)

    // Count unique lessons passed on first attempt (simplified)
    const firstAttemptPasses = attemptsData?.length || 0

    // Get fastest lesson
    const fastestLesson = progressData
      ?.filter((p) => p.status === 'completed' && p.total_time_seconds)
      .sort((a, b) => (a.total_time_seconds || 0) - (b.total_time_seconds || 0))[0]

    const stats: StudentStats = {
      lessonsCompleted,
      modulesCompleted: 0, // Would need to calculate from progress
      currentStreak: currentProfile?.current_streak || result.streak?.newStreak || 0,
      firstAttemptPasses,
      fastestLessonSeconds: fastestLesson?.total_time_seconds || null,
      totalCodeRuns: 0, // Would need tracking
      errorsFixed: 0, // Would need tracking
    }

    // Fetch all achievements and check which ones are newly unlocked
    const { data: allAchievements } = await supabase
      .from('achievements')
      .select('*')

    const { data: earnedAchievements } = await supabase
      .from('student_achievements')
      .select('achievement_id')
      .eq('student_id', studentId)

    const earnedIds = new Set(earnedAchievements?.map((ea) => ea.achievement_id))

    for (const achievement of allAchievements || []) {
      // Skip if already earned
      if (earnedIds.has(achievement.id)) continue

      // Check if criteria is met
      const criteria = achievement.criteria as AchievementCriteria
      if (checkAchievementCriteria(criteria, stats)) {
        // Award the achievement
        const { error: insertError } = await supabase
          .from('student_achievements')
          .insert({
            student_id: studentId,
            achievement_id: achievement.id,
          })

        if (!insertError) {
          result.achievements.push({
            achievement: {
              id: achievement.id,
              slug: achievement.slug,
              title: achievement.title,
              description: achievement.description,
              icon: achievement.icon,
              xp_reward: achievement.xp_reward,
            },
            earnedAt: new Date().toISOString(),
          })

          // Award achievement XP bonus
          if (achievement.xp_reward > 0) {
            await supabase.rpc('award_xp', {
              p_student_id: studentId,
              p_xp_amount: achievement.xp_reward,
            })
          }
        }
      }
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Gamification error:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
