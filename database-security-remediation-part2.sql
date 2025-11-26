-- =====================================================
-- SocialCraftAI - Database Security Remediation Part 2
-- Fixes: security_definer_view and rls_disabled_in_public
-- =====================================================

-- =====================================================
-- 1. Fix campaign_overview view (SECURITY DEFINER → INVOKER)
-- =====================================================
-- The issue: SECURITY DEFINER views bypass RLS of the querying user
-- Solution: Recreate as SECURITY INVOKER (default, respects caller's RLS)

DROP VIEW IF EXISTS public.campaign_overview;

CREATE VIEW public.campaign_overview 
WITH (security_invoker = true)
AS
SELECT 
    c.id,
    c.user_id,
    c.name,
    c.status,
    c.theme_goal,
    c.target_platforms,
    c.date_range_start,
    c.date_range_end,
    c.total_posts,
    c.posts_published,
    c.estimated_credits,
    c.credits_used,
    bp.name as persona_name,
    CASE 
        WHEN c.date_range_end < CURRENT_DATE THEN 'completed'
        WHEN c.date_range_start > CURRENT_DATE THEN 'upcoming'
        ELSE 'active'
    END as date_status,
    c.created_at
FROM public.campaigns c
LEFT JOIN public.brand_personas bp ON c.brand_persona_id = bp.id;

-- Grant access
GRANT SELECT ON public.campaign_overview TO authenticated;

-- =====================================================
-- 2. Fix unified_trend_research view (SECURITY DEFINER → INVOKER)
-- =====================================================

DROP VIEW IF EXISTS public.unified_trend_research;

CREATE VIEW public.unified_trend_research
WITH (security_invoker = true)
AS
SELECT 
    id,
    user_id,
    niche AS topic,
    source_type,
    CASE
        WHEN source_type = 'quick'::text THEN overall_summary
        ELSE LEFT(content, 500)
    END AS summary_preview,
    CASE
        WHEN source_type = 'quick'::text THEN identified_trends
        ELSE NULL::jsonb
    END AS trends,
    CASE
        WHEN source_type = 'quick'::text THEN related_keywords
        ELSE NULL::jsonb
    END AS keywords,
    sources,
    content AS full_content,
    created_at,
    CASE
        WHEN source_type = 'quick'::text THEN 'Generator Research'::text
        ELSE 'Trend Scout'::text
    END AS source_label
FROM public.trend_reports
ORDER BY created_at DESC;

-- Grant access
GRANT SELECT ON public.unified_trend_research TO authenticated;

-- =====================================================
-- 3. Fix trend_cache RLS (Enable RLS + add policies)
-- =====================================================
-- The trend_cache is shared across users for cost optimization,
-- but we still need RLS enabled. We'll use permissive policies
-- that allow authenticated users to read/write.

ALTER TABLE public.trend_cache ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to read cache (shared resource)
DROP POLICY IF EXISTS "Authenticated users can read trend cache" ON public.trend_cache;
CREATE POLICY "Authenticated users can read trend cache"
ON public.trend_cache FOR SELECT
TO authenticated
USING (true);

-- Allow all authenticated users to insert cache entries
DROP POLICY IF EXISTS "Authenticated users can insert trend cache" ON public.trend_cache;
CREATE POLICY "Authenticated users can insert trend cache"
ON public.trend_cache FOR INSERT
TO authenticated
WITH CHECK (true);

-- Allow all authenticated users to update cache entries (for hit_count)
DROP POLICY IF EXISTS "Authenticated users can update trend cache" ON public.trend_cache;
CREATE POLICY "Authenticated users can update trend cache"
ON public.trend_cache FOR UPDATE
TO authenticated
USING (true);

-- Allow service role to delete expired entries (cleanup function)
DROP POLICY IF EXISTS "Service role can delete trend cache" ON public.trend_cache;
CREATE POLICY "Service role can delete trend cache"
ON public.trend_cache FOR DELETE
TO service_role
USING (true);

-- =====================================================
-- Verification
-- =====================================================

-- Check views have security_invoker option
SELECT 
    c.relname as view_name,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM pg_options_to_table(c.reloptions) 
            WHERE option_name = 'security_invoker' AND option_value = 'true'
        ) THEN '✅ SECURITY INVOKER'
        ELSE '⚠️ Check manually'
    END as security_status
FROM pg_class c
JOIN pg_namespace n ON c.relnamespace = n.oid
WHERE n.nspname = 'public'
  AND c.relkind = 'v'
  AND c.relname IN ('campaign_overview', 'unified_trend_research');

-- Check RLS is enabled on trend_cache
SELECT 
    relname as table_name,
    CASE 
        WHEN relrowsecurity THEN '✅ RLS Enabled'
        ELSE '⚠️ RLS Disabled'
    END as rls_status
FROM pg_class
WHERE relname = 'trend_cache'
  AND relnamespace = 'public'::regnamespace;

-- Check policies exist on trend_cache
SELECT 
    policyname,
    cmd as operation,
    roles
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'trend_cache';
