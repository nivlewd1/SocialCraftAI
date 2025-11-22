-- =====================================================
-- SocialCraft AI - Security Fixes
-- =====================================================
-- Purpose: Fix Supabase security linter warnings
--
-- Issues addressed:
-- 1. can_post_now view exposes auth.users and has SECURITY DEFINER
-- 2. rate_limit_status view has SECURITY DEFINER
-- 3. pkce_store table has RLS disabled
-- =====================================================

-- =====================================================
-- 1. DROP PROBLEMATIC VIEWS
-- =====================================================
-- These views were created during development but are not
-- used by the application. They expose auth.users data
-- and use SECURITY DEFINER which bypasses RLS.

DROP VIEW IF EXISTS public.can_post_now CASCADE;
DROP VIEW IF EXISTS public.rate_limit_status CASCADE;

-- =====================================================
-- 2. FIX PKCE_STORE TABLE SECURITY
-- =====================================================
-- The pkce_store table is used for OAuth PKCE flow.
-- It stores temporary verification codes that are:
-- - Created when user initiates OAuth
-- - Retrieved during OAuth callback
-- - Deleted after use or expiration
--
-- Access pattern: Backend/Edge functions only via service_role

-- Enable Row Level Security
ALTER TABLE public.pkce_store ENABLE ROW LEVEL SECURITY;

-- Drop any existing policies first
DROP POLICY IF EXISTS "Service role can manage pkce_store" ON public.pkce_store;
DROP POLICY IF EXISTS "Allow anonymous pkce insertion" ON public.pkce_store;
DROP POLICY IF EXISTS "Allow anonymous pkce lookup by key" ON public.pkce_store;

-- Policy: Service role has full access
-- Edge functions use service_role key for OAuth operations
CREATE POLICY "Service role full access"
  ON public.pkce_store
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Block all access from anon and authenticated roles
-- PKCE store should only be accessed via service_role (edge functions)
-- No policies for anon/authenticated = no access

-- =====================================================
-- 3. CREATE SAFE HELPER VIEW (Optional)
-- =====================================================
-- If you need posting status info, use this safe view
-- that inherits RLS from scheduled_posts table.

CREATE OR REPLACE VIEW public.user_post_stats
WITH (security_invoker = true)  -- Explicit: use caller's permissions
AS
SELECT
  user_id,
  platform,
  COUNT(*) FILTER (WHERE status = 'published' AND posted_at > NOW() - INTERVAL '24 hours') as posts_last_24h,
  COUNT(*) FILTER (WHERE status = 'scheduled') as pending_posts
FROM public.scheduled_posts
GROUP BY user_id, platform;

-- =====================================================
-- COMPLETE!
-- =====================================================
-- After running this migration:
-- 1. can_post_now view - DROPPED
-- 2. rate_limit_status view - DROPPED
-- 3. pkce_store table - RLS ENABLED, service_role only
-- 4. user_post_stats view - Safe alternative with SECURITY INVOKER
--
-- Run in Supabase SQL Editor or via CLI:
-- supabase db push
-- =====================================================
