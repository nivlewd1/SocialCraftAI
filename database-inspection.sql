-- ============================================
-- SOCIALCRAFT AI - DATABASE INSPECTION SCRIPT
-- ============================================
-- Run these queries in Supabase SQL Editor to get complete project picture

-- ============================================
-- 1. LIST ALL TABLES IN PUBLIC SCHEMA
-- ============================================
SELECT
    schemaname,
    tablename,
    tableowner,
    hasindexes,
    hasrules,
    hastriggers
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- ============================================
-- 2. GET DETAILED TABLE SCHEMAS
-- ============================================
SELECT
    table_name,
    column_name,
    data_type,
    character_maximum_length,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
ORDER BY table_name, ordinal_position;

-- ============================================
-- 3. CHECK SCHEDULED_POSTS TABLE (if exists)
-- ============================================
SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'scheduled_posts'
ORDER BY ordinal_position;

-- Sample data from scheduled_posts
SELECT
    id,
    user_id,
    platform,
    status,
    scheduled_at,
    posted_at,
    created_at,
    CASE
        WHEN content IS NOT NULL THEN 'Has Content'
        ELSE 'No Content'
    END as content_status
FROM scheduled_posts
ORDER BY created_at DESC
LIMIT 10;

-- Count posts by status
SELECT
    status,
    COUNT(*) as count,
    platform,
    COUNT(*) FILTER (WHERE scheduled_at <= NOW()) as ready_to_post
FROM scheduled_posts
GROUP BY status, platform
ORDER BY status, platform;

-- ============================================
-- 4. CHECK TREND_REPORTS TABLE (if exists)
-- ============================================
SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'trend_reports'
ORDER BY ordinal_position;

-- Sample trend reports
SELECT
    id,
    user_id,
    niche,
    created_at,
    LENGTH(content) as content_length,
    CASE
        WHEN sources IS NOT NULL THEN jsonb_array_length(sources::jsonb)
        ELSE 0
    END as source_count
FROM trend_reports
ORDER BY created_at DESC
LIMIT 10;

-- Count reports by user
SELECT
    user_id,
    COUNT(*) as report_count,
    MAX(created_at) as last_report
FROM trend_reports
GROUP BY user_id
ORDER BY report_count DESC
LIMIT 10;

-- ============================================
-- 5. CHECK USERS & AUTH TABLES
-- ============================================
-- Users from auth schema
SELECT
    id,
    email,
    created_at,
    email_confirmed_at,
    last_sign_in_at
FROM auth.users
ORDER BY created_at DESC
LIMIT 10;

-- Check for profiles table (common pattern)
SELECT
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'profiles'
ORDER BY ordinal_position;

-- ============================================
-- 6. CHECK SUBSCRIPTION/PAYMENT TABLES
-- ============================================
-- Common subscription table names to check
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('subscriptions', 'user_subscriptions', 'customers', 'stripe_customers')
ORDER BY table_name;

-- If subscriptions table exists:
SELECT
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name IN ('subscriptions', 'user_subscriptions')
ORDER BY table_name, ordinal_position;

-- ============================================
-- 7. CHECK INDEXES FOR PERFORMANCE
-- ============================================
SELECT
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename IN ('scheduled_posts', 'trend_reports', 'profiles', 'subscriptions')
ORDER BY tablename, indexname;

-- ============================================
-- 8. CHECK FOREIGN KEY RELATIONSHIPS
-- ============================================
SELECT
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_schema = 'public'
ORDER BY tc.table_name, kcu.column_name;

-- ============================================
-- 9. CHECK ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================
SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- ============================================
-- 10. CHECK FOR API KEYS/CONFIGURATION TABLES
-- ============================================
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name ILIKE '%config%'
     OR table_name ILIKE '%api%'
     OR table_name ILIKE '%key%'
     OR table_name ILIKE '%setting%'
ORDER BY table_name;

-- ============================================
-- 11. CHECK DRAFTS TABLE (if exists)
-- ============================================
SELECT
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'drafts'
ORDER BY ordinal_position;

-- ============================================
-- 12. EDGE FUNCTION REQUIREMENTS CHECK
-- ============================================
-- Check if we have everything needed for post-scheduler edge function:

-- A) Scheduled posts ready to be posted
SELECT
    COUNT(*) as posts_ready_to_publish,
    MIN(scheduled_at) as earliest_scheduled,
    MAX(scheduled_at) as latest_scheduled
FROM scheduled_posts
WHERE status = 'scheduled'
  AND scheduled_at <= NOW();

-- B) Users with scheduled posts needing API credentials
SELECT
    sp.user_id,
    COUNT(*) as pending_posts,
    array_agg(DISTINCT sp.platform) as platforms_needed
FROM scheduled_posts sp
WHERE sp.status = 'scheduled'
  AND sp.scheduled_at <= NOW()
GROUP BY sp.user_id;

-- C) Check if we need user_api_keys or similar table
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND (table_name ILIKE '%credential%'
       OR table_name ILIKE '%token%'
       OR table_name ILIKE '%api_key%'
       OR table_name ILIKE '%integration%')
ORDER BY table_name;

-- ============================================
-- 13. STORAGE BUCKETS (for media)
-- ============================================
SELECT
    id,
    name,
    public,
    created_at
FROM storage.buckets
ORDER BY created_at;

-- ============================================
-- 14. RECENT DATABASE ACTIVITY SUMMARY
-- ============================================
-- Summary of content generation activity
SELECT
    'Trend Reports' as table_name,
    COUNT(*) as total_rows,
    COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '7 days') as last_7_days,
    COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '30 days') as last_30_days,
    MAX(created_at) as most_recent
FROM trend_reports
UNION ALL
SELECT
    'Scheduled Posts',
    COUNT(*),
    COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '7 days'),
    COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '30 days'),
    MAX(created_at)
FROM scheduled_posts
UNION ALL
SELECT
    'Users',
    COUNT(*),
    COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '7 days'),
    COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '30 days'),
    MAX(created_at)
FROM auth.users;

-- ============================================
-- 15. PLATFORM INTEGRATION STATUS
-- ============================================
-- See which platforms are being used
SELECT
    platform,
    COUNT(*) as total_scheduled,
    COUNT(*) FILTER (WHERE status = 'scheduled') as pending,
    COUNT(*) FILTER (WHERE status = 'published') as published,
    COUNT(*) FILTER (WHERE status = 'failed') as failed
FROM scheduled_posts
GROUP BY platform
ORDER BY total_scheduled DESC;
