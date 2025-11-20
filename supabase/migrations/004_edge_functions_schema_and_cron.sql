-- =====================================================
-- SocialCraft AI - Edge Functions Schema Updates
-- =====================================================
-- Purpose:
-- 1. Update schema to match edge function requirements
-- 2. Add columns and constraints needed by edge functions
--
-- Note: Cron scheduling is handled via GitHub Actions
-- See: .github/workflows/edge-functions-scheduler.yml
-- =====================================================

-- =====================================================
-- 1. UPDATE SCHEDULED_POSTS TABLE
-- =====================================================
-- Add missing columns needed by edge functions
ALTER TABLE public.scheduled_posts
  ADD COLUMN IF NOT EXISTS platform_post_id TEXT,
  ADD COLUMN IF NOT EXISTS publishing_started_at TIMESTAMPTZ;

-- Update status constraint to include 'publishing' and 'published'
ALTER TABLE public.scheduled_posts
  DROP CONSTRAINT IF EXISTS scheduled_posts_status_check;

ALTER TABLE public.scheduled_posts
  ADD CONSTRAINT scheduled_posts_status_check
  CHECK (status IN ('scheduled', 'publishing', 'published', 'failed'));

-- Migrate existing 'posted' status to 'published'
UPDATE public.scheduled_posts
SET status = 'published'
WHERE status = 'posted';

-- Create index for platform_post_id for analytics lookups
CREATE INDEX IF NOT EXISTS scheduled_posts_platform_post_id_idx
  ON public.scheduled_posts(platform_post_id);

-- =====================================================
-- 2. UPDATE CONNECTED_ACCOUNTS TABLE
-- =====================================================
-- Add is_active column for token refresh logic
ALTER TABLE public.connected_accounts
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

-- Create index for token refresh queries
CREATE INDEX IF NOT EXISTS connected_accounts_token_expires_idx
  ON public.connected_accounts(token_expires_at)
  WHERE is_active = TRUE;

-- =====================================================
-- 3. UPDATE ANALYTICS_CACHE TABLE
-- =====================================================
-- Drop old table and recreate with new schema to match edge function
DROP TABLE IF EXISTS public.analytics_cache CASCADE;

CREATE TABLE public.analytics_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scheduled_post_id UUID REFERENCES public.scheduled_posts(id) ON DELETE CASCADE NOT NULL UNIQUE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  platform TEXT NOT NULL,
  impressions INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0,
  shares INTEGER DEFAULT 0,
  engagement_rate DECIMAL(5,2) DEFAULT 0,
  fetched_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX analytics_cache_user_id_idx ON public.analytics_cache(user_id);
CREATE INDEX analytics_cache_platform_idx ON public.analytics_cache(platform);
CREATE INDEX analytics_cache_fetched_at_idx ON public.analytics_cache(fetched_at DESC);

-- Enable Row Level Security
ALTER TABLE public.analytics_cache ENABLE ROW LEVEL SECURITY;

-- Policies: Users can only access their own analytics
CREATE POLICY "Users can view own analytics cache"
  ON public.analytics_cache FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage analytics cache"
  ON public.analytics_cache FOR ALL
  USING (true)
  WITH CHECK (true);

-- =====================================================
-- COMPLETE!
-- =====================================================
-- This migration updates the database schema to support
-- edge functions for automated content publishing.
--
-- Edge functions are scheduled via GitHub Actions.
-- See: .github/workflows/edge-functions-scheduler.yml
--
-- To set up GitHub Actions:
-- 1. Go to your GitHub repository > Settings > Secrets and variables > Actions
-- 2. Add the following secrets:
--    - SUPABASE_URL: Your Supabase project URL
--    - SUPABASE_SERVICE_ROLE_KEY: Your service role key
-- 3. The workflow will automatically run on schedule
-- =====================================================
