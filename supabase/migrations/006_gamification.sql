-- Migration: Add gamification support (XP, levels, streaks, achievements)
-- Phase 2 of Personalized Learning feature

-- =============================================================================
-- 1. Add gamification columns to student_profiles
-- =============================================================================

ALTER TABLE student_profiles ADD COLUMN IF NOT EXISTS xp_total INTEGER DEFAULT 0;
ALTER TABLE student_profiles ADD COLUMN IF NOT EXISTS current_level INTEGER DEFAULT 1;
ALTER TABLE student_profiles ADD COLUMN IF NOT EXISTS current_streak INTEGER DEFAULT 0;
ALTER TABLE student_profiles ADD COLUMN IF NOT EXISTS longest_streak INTEGER DEFAULT 0;
ALTER TABLE student_profiles ADD COLUMN IF NOT EXISTS last_activity_date DATE;
ALTER TABLE student_profiles ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'UTC';
ALTER TABLE student_profiles ADD COLUMN IF NOT EXISTS sound_enabled BOOLEAN DEFAULT false;

-- =============================================================================
-- 2. Create achievements table
-- =============================================================================

CREATE TABLE IF NOT EXISTS achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  xp_reward INTEGER DEFAULT 0,
  criteria JSONB NOT NULL,
  category TEXT DEFAULT 'general',  -- 'general', 'streak', 'speed', 'mastery'
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================================================
-- 3. Create student_achievements junction table
-- =============================================================================

CREATE TABLE IF NOT EXISTS student_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES student_profiles(id) ON DELETE CASCADE,
  achievement_id UUID REFERENCES achievements(id) ON DELETE CASCADE,
  earned_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(student_id, achievement_id)
);

-- =============================================================================
-- 4. Seed initial achievements
-- =============================================================================

INSERT INTO achievements (slug, title, description, icon, xp_reward, criteria, category) VALUES
  -- Lesson milestones
  ('first-lesson', 'First Steps', 'Complete your first lesson', '🎯', 50, '{"type": "lessons_completed", "threshold": 1}', 'general'),
  ('five-lessons', 'Getting Started', 'Complete 5 lessons', '⭐', 100, '{"type": "lessons_completed", "threshold": 5}', 'general'),
  ('ten-lessons', 'On Your Way', 'Complete 10 lessons', '🌟', 150, '{"type": "lessons_completed", "threshold": 10}', 'general'),
  ('twenty-lessons', 'Dedicated Learner', 'Complete 20 lessons', '📚', 200, '{"type": "lessons_completed", "threshold": 20}', 'general'),

  -- Module milestones
  ('first-module', 'Module Master', 'Complete an entire module', '🏆', 200, '{"type": "modules_completed", "threshold": 1}', 'mastery'),

  -- Streak achievements
  ('streak-3', 'On a Roll', 'Learn 3 days in a row', '🔥', 75, '{"type": "streak", "threshold": 3}', 'streak'),
  ('streak-7', 'Week Warrior', 'Learn 7 days in a row', '💪', 150, '{"type": "streak", "threshold": 7}', 'streak'),
  ('streak-14', 'Two Week Titan', 'Learn 14 days in a row', '⚡', 250, '{"type": "streak", "threshold": 14}', 'streak'),
  ('streak-30', 'Dedication', 'Learn 30 days in a row', '👑', 500, '{"type": "streak", "threshold": 30}', 'streak'),

  -- Mastery achievements
  ('perfect-lesson', 'Perfectionist', 'Complete a lesson on first attempt', '💎', 100, '{"type": "first_attempt_pass", "threshold": 1}', 'mastery'),
  ('five-perfect', 'Flawless Five', 'Complete 5 lessons on first attempt', '✨', 200, '{"type": "first_attempt_pass", "threshold": 5}', 'mastery'),

  -- Speed achievements
  ('quick-learner', 'Quick Learner', 'Complete a lesson in under 5 minutes', '⚡', 75, '{"type": "fast_completion", "threshold": 300}', 'speed'),

  -- Coding activity
  ('first-code-run', 'Hello World', 'Run your first piece of code', '🚀', 25, '{"type": "code_runs", "threshold": 1}', 'general'),
  ('hundred-runs', 'Code Machine', 'Run code 100 times', '🤖', 150, '{"type": "code_runs", "threshold": 100}', 'general'),

  -- Error fixing
  ('bug-squasher', 'Bug Squasher', 'Fix 10 errors', '🐛', 100, '{"type": "errors_fixed", "threshold": 10}', 'mastery'),
  ('bug-hunter', 'Bug Hunter', 'Fix 50 errors', '🔍', 200, '{"type": "errors_fixed", "threshold": 50}', 'mastery')
ON CONFLICT (slug) DO NOTHING;

-- =============================================================================
-- 5. Row Level Security
-- =============================================================================

ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_achievements ENABLE ROW LEVEL SECURITY;

-- Achievements are viewable by everyone (public catalog)
CREATE POLICY "Achievements are viewable by everyone"
  ON achievements FOR SELECT
  USING (true);

-- Students can view their own achievements
CREATE POLICY "Students can view own achievements"
  ON student_achievements FOR SELECT
  USING (
    student_id IN (
      SELECT id FROM student_profiles
      WHERE auth_user_id = auth.uid()
         OR (access_code IS NOT NULL AND id = student_id)
    )
  );

-- Allow insert for authenticated users (will be done via Edge Function with service role)
CREATE POLICY "Service role can insert achievements"
  ON student_achievements FOR INSERT
  WITH CHECK (true);

-- =============================================================================
-- 6. Create indexes for performance
-- =============================================================================

CREATE INDEX IF NOT EXISTS idx_student_achievements_student_id
  ON student_achievements(student_id);

CREATE INDEX IF NOT EXISTS idx_student_achievements_achievement_id
  ON student_achievements(achievement_id);

CREATE INDEX IF NOT EXISTS idx_achievements_category
  ON achievements(category);

CREATE INDEX IF NOT EXISTS idx_student_profiles_xp_total
  ON student_profiles(xp_total);

CREATE INDEX IF NOT EXISTS idx_student_profiles_current_streak
  ON student_profiles(current_streak);

-- =============================================================================
-- 7. Helper function to calculate level from XP
-- =============================================================================

CREATE OR REPLACE FUNCTION calculate_level(xp INTEGER)
RETURNS INTEGER AS $$
BEGIN
  RETURN CASE
    WHEN xp >= 15000 THEN 10
    WHEN xp >= 9000 THEN 9
    WHEN xp >= 6000 THEN 8
    WHEN xp >= 4000 THEN 7
    WHEN xp >= 2500 THEN 6
    WHEN xp >= 1500 THEN 5
    WHEN xp >= 800 THEN 4
    WHEN xp >= 400 THEN 3
    WHEN xp >= 150 THEN 2
    ELSE 1
  END;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- =============================================================================
-- 8. Function to award XP and update level
-- =============================================================================

CREATE OR REPLACE FUNCTION award_xp(
  p_student_id UUID,
  p_xp_amount INTEGER
)
RETURNS TABLE(
  new_xp_total INTEGER,
  old_level INTEGER,
  new_level INTEGER,
  level_up BOOLEAN
) AS $$
DECLARE
  v_old_xp INTEGER;
  v_old_level INTEGER;
  v_new_xp INTEGER;
  v_new_level INTEGER;
BEGIN
  -- Get current values
  SELECT xp_total, current_level INTO v_old_xp, v_old_level
  FROM student_profiles
  WHERE id = p_student_id;

  -- Calculate new values
  v_new_xp := COALESCE(v_old_xp, 0) + p_xp_amount;
  v_new_level := calculate_level(v_new_xp);

  -- Update the profile
  UPDATE student_profiles
  SET
    xp_total = v_new_xp,
    current_level = v_new_level,
    updated_at = now()
  WHERE id = p_student_id;

  -- Return results
  RETURN QUERY SELECT
    v_new_xp,
    COALESCE(v_old_level, 1),
    v_new_level,
    v_new_level > COALESCE(v_old_level, 1);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- 9. Function to update streak
-- =============================================================================

CREATE OR REPLACE FUNCTION update_streak(
  p_student_id UUID,
  p_timezone TEXT DEFAULT 'UTC'
)
RETURNS TABLE(
  new_streak INTEGER,
  streak_continued BOOLEAN,
  streak_started BOOLEAN
) AS $$
DECLARE
  v_last_activity DATE;
  v_current_streak INTEGER;
  v_longest_streak INTEGER;
  v_today DATE;
  v_new_streak INTEGER;
  v_continued BOOLEAN := false;
  v_started BOOLEAN := false;
BEGIN
  -- Get today's date in user's timezone
  v_today := (now() AT TIME ZONE p_timezone)::DATE;

  -- Get current values
  SELECT last_activity_date, current_streak, longest_streak
  INTO v_last_activity, v_current_streak, v_longest_streak
  FROM student_profiles
  WHERE id = p_student_id;

  -- Calculate new streak
  IF v_last_activity IS NULL THEN
    -- First activity ever
    v_new_streak := 1;
    v_started := true;
  ELSIF v_last_activity = v_today THEN
    -- Already active today, no change
    v_new_streak := COALESCE(v_current_streak, 1);
  ELSIF v_last_activity = v_today - 1 THEN
    -- Consecutive day - continue streak
    v_new_streak := COALESCE(v_current_streak, 0) + 1;
    v_continued := true;
  ELSE
    -- Streak broken - start over
    v_new_streak := 1;
    v_started := true;
  END IF;

  -- Update the profile
  UPDATE student_profiles
  SET
    current_streak = v_new_streak,
    longest_streak = GREATEST(COALESCE(v_longest_streak, 0), v_new_streak),
    last_activity_date = v_today,
    updated_at = now()
  WHERE id = p_student_id;

  -- Return results
  RETURN QUERY SELECT v_new_streak, v_continued, v_started;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- 10. Grant execute permissions
-- =============================================================================

GRANT EXECUTE ON FUNCTION calculate_level(INTEGER) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION award_xp(UUID, INTEGER) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION update_streak(UUID, TEXT) TO authenticated, anon;
