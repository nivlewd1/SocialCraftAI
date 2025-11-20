-- =====================================================
-- SocialCraft AI - Edge Functions Schema & Cron Jobs
-- =====================================================
-- Purpose:
-- 1. Update schema to match edge function requirements
-- 2. Enable pg_cron extension for scheduled jobs
-- 3. Set up cron jobs to invoke edge functions
-- =====================================================

-- =====================================================
-- 1. ENABLE PG_CRON EXTENSION
-- =====================================================
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Grant usage to postgres role
GRANT USAGE ON SCHEMA cron TO postgres;

-- =====================================================
-- 2. UPDATE SCHEDULED_POSTS TABLE
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
-- 3. UPDATE CONNECTED_ACCOUNTS TABLE
-- =====================================================
-- Add is_active column for token refresh logic
ALTER TABLE public.connected_accounts
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

-- Create index for token refresh queries
CREATE INDEX IF NOT EXISTS connected_accounts_token_expires_idx
  ON public.connected_accounts(token_expires_at)
  WHERE is_active = TRUE;

-- =====================================================
-- 4. UPDATE ANALYTICS_CACHE TABLE
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
-- 5. ENABLE PG_NET EXTENSION FOR HTTP REQUESTS
-- =====================================================
CREATE EXTENSION IF NOT EXISTS pg_net;

-- =====================================================
-- 6. CREATE HTTP REQUEST FUNCTION FOR EDGE FUNCTIONS
-- =====================================================
-- This function uses pg_net to invoke edge functions via HTTP
CREATE OR REPLACE FUNCTION invoke_edge_function(function_name TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  supabase_url TEXT;
  service_key TEXT;
  function_url TEXT;
  request_id BIGINT;
BEGIN
  -- Get Supabase project reference (e.g., 'abcdefghijklmnop')
  -- You'll need to replace this with your actual project reference
  supabase_url := current_setting('app.settings.supabase_url', true);
  service_key := current_setting('app.settings.supabase_service_role_key', true);

  IF supabase_url IS NULL THEN
    RAISE WARNING 'Supabase URL not configured. Please set app.settings.supabase_url';
    RETURN;
  END IF;

  IF service_key IS NULL THEN
    RAISE WARNING 'Supabase service key not configured. Please set app.settings.supabase_service_role_key';
    RETURN;
  END IF;

  function_url := supabase_url || '/functions/v1/' || function_name;

  -- Make HTTP POST request to edge function using pg_net
  SELECT net.http_post(
    url := function_url,
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || service_key
    ),
    body := '{}'::jsonb
  ) INTO request_id;

  RAISE LOG 'Edge function % invoked: request_id=%', function_name, request_id;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Failed to invoke edge function %: %', function_name, SQLERRM;
END;
$$;

-- =====================================================
-- 7. SET UP CRON JOBS
-- =====================================================

-- Post Scheduler: Every 5 minutes
-- Checks for scheduled posts that are ready to publish
SELECT cron.schedule(
  'post-scheduler',           -- job name
  '*/5 * * * *',              -- every 5 minutes
  $$SELECT invoke_edge_function('post-scheduler');$$
);

-- Token Refresh: Daily at 2 AM UTC
-- Refreshes OAuth tokens that will expire within 7 days
SELECT cron.schedule(
  'token-refresh',            -- job name
  '0 2 * * *',                -- daily at 2 AM UTC
  $$SELECT invoke_edge_function('token-refresh');$$
);

-- Analytics Fetcher: Every hour
-- Fetches engagement metrics for published posts
SELECT cron.schedule(
  'analytics-fetcher',        -- job name
  '0 * * * *',                -- every hour at minute 0
  $$SELECT invoke_edge_function('analytics-fetcher');$$
);

-- Cleanup expired PKCE codes: Daily at 3 AM UTC
SELECT cron.schedule(
  'cleanup-pkce-codes',       -- job name
  '0 3 * * *',                -- daily at 3 AM UTC
  $$SELECT delete_expired_pkce_codes();$$
);

-- =====================================================
-- COMPLETE!
-- =====================================================
-- Next steps:
-- 1. Apply this migration: supabase db push
-- 2. Configure Supabase secrets for edge function invocation:
--    - Go to Supabase Dashboard > Settings > Database
--    - Add database secrets:
--      app.settings.supabase_url = your_supabase_url
--      app.settings.supabase_service_role_key = your_service_key
-- 3. Verify cron jobs: SELECT * FROM cron.job;
-- 4. Check job runs: SELECT * FROM cron.job_run_details ORDER BY start_time DESC LIMIT 10;
-- =====================================================
