-- ============================================
-- Frictionless Onboarding - Schema Migration
-- ============================================
-- Enables anonymous learning with access codes.
-- Three states: Anonymous Visitor → Code-Based Student → Registered Learner

-- ============================================
-- 0. REMOVE FOREIGN KEY CONSTRAINT ON ID
-- ============================================
-- The original table has id REFERENCES auth.users(id), which prevents
-- anonymous profiles. We decouple this by removing the FK constraint
-- and using auth_user_id for the auth relationship instead.

ALTER TABLE student_profiles
DROP CONSTRAINT IF EXISTS student_profiles_id_fkey;

-- ============================================
-- 1. ADD NEW COLUMNS TO STUDENT_PROFILES
-- ============================================

-- Access code for anonymous profiles (e.g., "SWIFT-BEAR-73")
ALTER TABLE student_profiles
ADD COLUMN access_code TEXT UNIQUE;

-- Reference to auth user (nullable for anonymous profiles)
-- This decouples the profile from requiring an auth user
ALTER TABLE student_profiles
ADD COLUMN auth_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Track last activity for cleanup job
ALTER TABLE student_profiles
ADD COLUMN last_active_at TIMESTAMPTZ DEFAULT now();

-- Index for fast access_code lookups
CREATE INDEX idx_student_profiles_access_code
ON student_profiles(access_code) WHERE access_code IS NOT NULL;

-- Index for auth_user_id lookups
CREATE INDEX idx_student_profiles_auth_user_id
ON student_profiles(auth_user_id) WHERE auth_user_id IS NOT NULL;

-- ============================================
-- 2. MIGRATE EXISTING DATA
-- ============================================

-- Copy id to auth_user_id for existing registered users
UPDATE student_profiles
SET auth_user_id = id
WHERE auth_user_id IS NULL;

-- ============================================
-- 3. UPDATE RLS POLICIES
-- ============================================

-- Drop existing profile policies
DROP POLICY IF EXISTS "Users can view own profile" ON student_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON student_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON student_profiles;

-- New policies supporting both auth-based and code-based access

-- Allow authenticated users to view their own profile (via auth_user_id)
CREATE POLICY "Auth users can view own profile"
ON student_profiles FOR SELECT
USING (auth.uid() = auth_user_id);

-- Allow anyone to view profiles by access_code (for code-based auth)
-- Application validates the code before querying
CREATE POLICY "Anyone can view profile by access_code"
ON student_profiles FOR SELECT
USING (access_code IS NOT NULL);

-- Allow authenticated users to update their own profile
CREATE POLICY "Auth users can update own profile"
ON student_profiles FOR UPDATE
USING (auth.uid() = auth_user_id);

-- Allow anyone to update profiles with access_code (for code-based users)
-- Application validates the code matches before updating
CREATE POLICY "Anyone can update profile with access_code"
ON student_profiles FOR UPDATE
USING (access_code IS NOT NULL AND auth_user_id IS NULL);

-- Allow anonymous profile creation (for Start Learning flow)
CREATE POLICY "Allow anonymous profile creation"
ON student_profiles FOR INSERT
WITH CHECK (auth_user_id IS NULL AND access_code IS NOT NULL);

-- Allow authenticated profile creation (existing signup flow)
CREATE POLICY "Allow authenticated profile creation"
ON student_profiles FOR INSERT
WITH CHECK (auth.uid() = id);

-- ============================================
-- 4. UPDATE RELATED TABLE POLICIES
-- ============================================

-- Drop existing progress policies
DROP POLICY IF EXISTS "Users can view own progress" ON student_progress;
DROP POLICY IF EXISTS "Users can insert own progress" ON student_progress;
DROP POLICY IF EXISTS "Users can update own progress" ON student_progress;

-- Progress: Allow access for both auth and code-based users
CREATE POLICY "Users can view own progress"
ON student_progress FOR SELECT
USING (
  student_id IN (
    SELECT id FROM student_profiles
    WHERE auth_user_id = auth.uid() OR access_code IS NOT NULL
  )
);

CREATE POLICY "Users can insert own progress"
ON student_progress FOR INSERT
WITH CHECK (
  student_id IN (
    SELECT id FROM student_profiles
    WHERE auth_user_id = auth.uid() OR access_code IS NOT NULL
  )
);

CREATE POLICY "Users can update own progress"
ON student_progress FOR UPDATE
USING (
  student_id IN (
    SELECT id FROM student_profiles
    WHERE auth_user_id = auth.uid() OR access_code IS NOT NULL
  )
);

-- Drop existing attempts policies
DROP POLICY IF EXISTS "Users can view own attempts" ON exercise_attempts;
DROP POLICY IF EXISTS "Users can insert own attempts" ON exercise_attempts;

-- Attempts: Allow access for both auth and code-based users
CREATE POLICY "Users can view own attempts"
ON exercise_attempts FOR SELECT
USING (
  student_id IN (
    SELECT id FROM student_profiles
    WHERE auth_user_id = auth.uid() OR access_code IS NOT NULL
  )
);

CREATE POLICY "Users can insert own attempts"
ON exercise_attempts FOR INSERT
WITH CHECK (
  student_id IN (
    SELECT id FROM student_profiles
    WHERE auth_user_id = auth.uid() OR access_code IS NOT NULL
  )
);

-- Drop existing messages policies
DROP POLICY IF EXISTS "Users can view own messages" ON tutor_messages;
DROP POLICY IF EXISTS "Users can insert own messages" ON tutor_messages;

-- Messages: Allow access for both auth and code-based users
CREATE POLICY "Users can view own messages"
ON tutor_messages FOR SELECT
USING (
  student_id IN (
    SELECT id FROM student_profiles
    WHERE auth_user_id = auth.uid() OR access_code IS NOT NULL
  )
);

CREATE POLICY "Users can insert own messages"
ON tutor_messages FOR INSERT
WITH CHECK (
  student_id IN (
    SELECT id FROM student_profiles
    WHERE auth_user_id = auth.uid() OR access_code IS NOT NULL
  )
);

-- ============================================
-- 5. ACTIVITY TRACKING TRIGGERS
-- ============================================

-- Function to update last_active_at on student_profiles
CREATE OR REPLACE FUNCTION update_last_active()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE student_profiles
  SET last_active_at = now()
  WHERE id = NEW.student_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on student_progress changes
CREATE TRIGGER update_activity_on_progress
AFTER INSERT OR UPDATE ON student_progress
FOR EACH ROW EXECUTE FUNCTION update_last_active();

-- Trigger on exercise_attempts
CREATE TRIGGER update_activity_on_attempt
AFTER INSERT ON exercise_attempts
FOR EACH ROW EXECUTE FUNCTION update_last_active();

-- Trigger on tutor_messages
CREATE TRIGGER update_activity_on_message
AFTER INSERT ON tutor_messages
FOR EACH ROW EXECUTE FUNCTION update_last_active();

-- ============================================
-- 6. CLEANUP FUNCTION FOR INACTIVE PROFILES
-- ============================================

-- Function to delete inactive unregistered profiles (10+ days)
CREATE OR REPLACE FUNCTION cleanup_inactive_profiles()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  WITH deleted AS (
    DELETE FROM student_profiles
    WHERE auth_user_id IS NULL
      AND last_active_at < now() - INTERVAL '10 days'
    RETURNING id
  )
  SELECT COUNT(*) INTO deleted_count FROM deleted;

  RAISE NOTICE 'Cleaned up % inactive profiles', deleted_count;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION cleanup_inactive_profiles() TO postgres, service_role;

-- ============================================
-- 7. SCHEDULE CLEANUP JOB (pg_cron)
-- ============================================
-- Note: pg_cron must be enabled in your Supabase project
-- Run this manually in SQL Editor if pg_cron is available:
--
-- SELECT cron.schedule(
--   'cleanup-inactive-profiles',
--   '0 3 * * *',  -- Daily at 3 AM UTC
--   'SELECT cleanup_inactive_profiles()'
-- );

-- ============================================
-- 8. PROFILE UPGRADE FUNCTION
-- ============================================
-- Function to upgrade a code-based profile to a registered user
-- Uses SECURITY DEFINER to bypass RLS for this specific operation

CREATE OR REPLACE FUNCTION upgrade_profile_to_registered(
  p_profile_id UUID,
  p_access_code TEXT,
  p_auth_user_id UUID,
  p_display_name TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
  updated_count INTEGER;
BEGIN
  UPDATE student_profiles
  SET
    auth_user_id = p_auth_user_id,
    display_name = p_display_name
  WHERE id = p_profile_id
    AND access_code = p_access_code
    AND auth_user_id IS NULL;  -- Prevent double-registration

  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RETURN updated_count > 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute to anon and authenticated users
GRANT EXECUTE ON FUNCTION upgrade_profile_to_registered TO anon, authenticated;

-- ============================================
-- 9. REMOVE AUTO-CREATE PROFILE TRIGGER
-- ============================================

-- Remove the trigger that auto-creates profiles on signup.
-- Profile creation is now handled explicitly in the application:
-- - Code-based users: createProfile() in useAccessCode
-- - Direct signup: SignupForm creates profile after signup
-- - Upgrade: upgrade_profile_to_registered() updates existing profile

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
