-- =====================================================
-- SocialCraft AI - Recurring Posts Feature
-- =====================================================
-- Purpose: Allow users to set up automatic posting frequencies
-- Example: "Post every Monday at 9 AM" or "Daily at 2 PM"
-- =====================================================

-- =====================================================
-- 1. CREATE RECURRING_POSTS TABLE
-- =====================================================
CREATE TABLE public.recurring_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

  -- Content template
  title TEXT NOT NULL,
  content JSONB NOT NULL, -- Same structure as scheduled_posts.content

  -- Frequency settings
  frequency TEXT CHECK (frequency IN ('daily', 'weekly', 'monthly', 'custom')) NOT NULL,

  -- For weekly: days of week (1=Monday, 7=Sunday)
  -- Example: [1, 3, 5] = Monday, Wednesday, Friday
  days_of_week INTEGER[] DEFAULT '{}',

  -- For monthly: days of month (1-31)
  -- Example: [1, 15] = 1st and 15th of each month
  days_of_month INTEGER[] DEFAULT '{}',

  -- Time to post (stored as time without timezone, uses UTC)
  post_time TIME NOT NULL,

  -- Which platforms to post to
  platforms TEXT[] NOT NULL, -- ['linkedin', 'twitter', 'instagram']

  -- Active status
  is_active BOOLEAN DEFAULT TRUE,

  -- Optional: Start and end dates for the recurring schedule
  start_date DATE,
  end_date DATE,

  -- Tracking
  last_generated_at TIMESTAMPTZ, -- When we last created scheduled posts from this rule
  next_post_date TIMESTAMPTZ, -- Calculated next post date for quick reference

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Validation: weekly posts must have days_of_week
  CONSTRAINT weekly_requires_days CHECK (
    frequency != 'weekly' OR (days_of_week IS NOT NULL AND array_length(days_of_week, 1) > 0)
  ),

  -- Validation: monthly posts must have days_of_month
  CONSTRAINT monthly_requires_days CHECK (
    frequency != 'monthly' OR (days_of_month IS NOT NULL AND array_length(days_of_month, 1) > 0)
  ),

  -- Validation: platforms array must not be empty
  CONSTRAINT platforms_not_empty CHECK (
    array_length(platforms, 1) > 0
  )
);

-- Indexes for performance
CREATE INDEX recurring_posts_user_id_idx ON public.recurring_posts(user_id);
CREATE INDEX recurring_posts_is_active_idx ON public.recurring_posts(is_active) WHERE is_active = TRUE;
CREATE INDEX recurring_posts_next_post_date_idx ON public.recurring_posts(next_post_date) WHERE is_active = TRUE;

-- Enable Row Level Security
ALTER TABLE public.recurring_posts ENABLE ROW LEVEL SECURITY;

-- Policies: Users can only access their own recurring posts
CREATE POLICY "Users can view own recurring posts"
  ON public.recurring_posts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own recurring posts"
  ON public.recurring_posts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own recurring posts"
  ON public.recurring_posts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own recurring posts"
  ON public.recurring_posts FOR DELETE
  USING (auth.uid() = user_id);

-- Service role can manage all recurring posts (for edge function)
CREATE POLICY "Service role can manage all recurring posts"
  ON public.recurring_posts FOR ALL
  USING (true)
  WITH CHECK (true);

-- Auto-update timestamp
CREATE TRIGGER update_recurring_posts_updated_at
  BEFORE UPDATE ON public.recurring_posts
  FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at();

-- =====================================================
-- 2. ADD RECURRING_POST_ID TO SCHEDULED_POSTS
-- =====================================================
-- Track which scheduled posts were generated from recurring rules
ALTER TABLE public.scheduled_posts
  ADD COLUMN IF NOT EXISTS recurring_post_id UUID REFERENCES public.recurring_posts(id) ON DELETE SET NULL;

-- Index for quick lookups
CREATE INDEX IF NOT EXISTS scheduled_posts_recurring_id_idx
  ON public.scheduled_posts(recurring_post_id)
  WHERE recurring_post_id IS NOT NULL;

-- =====================================================
-- 3. HELPER FUNCTION: Calculate Next Post Date
-- =====================================================
CREATE OR REPLACE FUNCTION calculate_next_post_date(
  p_frequency TEXT,
  p_days_of_week INTEGER[],
  p_days_of_month INTEGER[],
  p_post_time TIME,
  p_start_date DATE DEFAULT NULL,
  p_end_date DATE DEFAULT NULL,
  p_from_date TIMESTAMPTZ DEFAULT NOW()
)
RETURNS TIMESTAMPTZ
LANGUAGE plpgsql
AS $$
DECLARE
  v_next_date DATE;
  v_next_datetime TIMESTAMPTZ;
  v_current_date DATE := p_from_date::DATE;
  v_day_of_week INTEGER;
  v_found BOOLEAN := FALSE;
  v_days_checked INTEGER := 0;
  v_max_days INTEGER := 400; -- Check up to ~1 year ahead
BEGIN
  -- Respect start date
  IF p_start_date IS NOT NULL AND v_current_date < p_start_date THEN
    v_current_date := p_start_date;
  END IF;

  -- Daily frequency
  IF p_frequency = 'daily' THEN
    v_next_date := v_current_date + INTERVAL '1 day';

  -- Weekly frequency
  ELSIF p_frequency = 'weekly' THEN
    -- Find next matching day of week
    WHILE v_days_checked < v_max_days AND NOT v_found LOOP
      v_current_date := v_current_date + INTERVAL '1 day';
      v_day_of_week := EXTRACT(ISODOW FROM v_current_date)::INTEGER; -- 1=Monday, 7=Sunday

      IF v_day_of_week = ANY(p_days_of_week) THEN
        v_next_date := v_current_date;
        v_found := TRUE;
      END IF;

      v_days_checked := v_days_checked + 1;
    END LOOP;

  -- Monthly frequency
  ELSIF p_frequency = 'monthly' THEN
    -- Find next matching day of month
    WHILE v_days_checked < v_max_days AND NOT v_found LOOP
      v_current_date := v_current_date + INTERVAL '1 day';

      IF EXTRACT(DAY FROM v_current_date)::INTEGER = ANY(p_days_of_month) THEN
        v_next_date := v_current_date;
        v_found := TRUE;
      END IF;

      v_days_checked := v_days_checked + 1;
    END LOOP;

  ELSE
    RAISE EXCEPTION 'Unsupported frequency: %', p_frequency;
  END IF;

  -- Check if we found a valid date
  IF NOT v_found AND p_frequency != 'daily' THEN
    RETURN NULL; -- Could not find next date within reasonable timeframe
  END IF;

  -- Combine date and time
  v_next_datetime := v_next_date + p_post_time;

  -- Check if beyond end date
  IF p_end_date IS NOT NULL AND v_next_datetime::DATE > p_end_date THEN
    RETURN NULL; -- Recurring schedule has ended
  END IF;

  RETURN v_next_datetime;
END;
$$;

-- =====================================================
-- 4. TRIGGER: Auto-calculate next_post_date
-- =====================================================
CREATE OR REPLACE FUNCTION update_recurring_post_next_date()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Calculate next post date when recurring post is created or updated
  NEW.next_post_date := calculate_next_post_date(
    NEW.frequency,
    NEW.days_of_week,
    NEW.days_of_month,
    NEW.post_time,
    NEW.start_date,
    NEW.end_date,
    COALESCE(NEW.last_generated_at, NOW())
  );

  RETURN NEW;
END;
$$;

CREATE TRIGGER calculate_next_post_date_trigger
  BEFORE INSERT OR UPDATE ON public.recurring_posts
  FOR EACH ROW
  EXECUTE FUNCTION update_recurring_post_next_date();

-- =====================================================
-- COMPLETE!
-- =====================================================
-- This migration adds recurring posts functionality.
--
-- Users can now create recurring post schedules like:
-- - Daily at 9 AM
-- - Every Monday, Wednesday, Friday at 2 PM
-- - 1st and 15th of each month at 10 AM
--
-- A new edge function (recurring-post-generator) will run daily
-- to generate upcoming scheduled_posts from active recurring rules.
--
-- See: supabase/functions/recurring-post-generator/
-- =====================================================
