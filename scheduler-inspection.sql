-- =====================================================
-- SCHEDULER ISSUE INSPECTION
-- Run these queries to diagnose and fix scheduler problems
-- =====================================================

-- 1. Check scheduled_posts table structure
SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'scheduled_posts'
ORDER BY ordinal_position;

-- 2. Check connected_accounts table structure
SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'connected_accounts'
ORDER BY ordinal_position;

-- 3. Show ALL existing posts with their content structure
SELECT
    id,
    user_id,
    platform,
    status,
    scheduled_at,
    error_message,
    created_at,
    updated_at,
    -- Analyze content structure
    jsonb_typeof(content) as content_type,
    CASE
        WHEN content ? 'primaryContent' THEN 'NEW: Has primaryContent'
        WHEN content ? 'text' THEN 'OLD: Has text field'
        WHEN content ? 'content' THEN 'LEGACY: Has content field'
        ELSE 'UNKNOWN: ' || (SELECT string_agg(key, ', ') FROM jsonb_object_keys(content) key)
    END as content_structure,
    -- Show actual content
    content
FROM scheduled_posts
ORDER BY created_at DESC;

-- 4. Show FAILED posts specifically with full details
SELECT
    sp.id,
    sp.user_id,
    sp.platform,
    sp.status,
    sp.scheduled_at,
    sp.error_message,
    sp.created_at,
    -- Content analysis
    CASE
        WHEN sp.content ? 'primaryContent' THEN 
            CASE 
                WHEN sp.content->>'primaryContent' = '' THEN 'Empty primaryContent'
                ELSE 'Has primaryContent: ' || LEFT(sp.content->>'primaryContent', 50)
            END
        WHEN sp.content ? 'text' THEN 
            CASE 
                WHEN sp.content->>'text' = '' THEN 'Empty text'
                ELSE 'Has text: ' || LEFT(sp.content->>'text', 50)
            END
        ELSE 'No recognizable content field'
    END as content_summary,
    sp.content as full_content
FROM scheduled_posts sp
WHERE sp.status = 'failed'
ORDER BY sp.created_at DESC;

-- 5. Check if posts have matching connected accounts
SELECT
    sp.id as post_id,
    sp.platform as post_platform,
    sp.status,
    sp.user_id,
    ca.platform as account_platform,
    ca.platform_username,
    ca.id as account_id,
    CASE
        WHEN ca.id IS NOT NULL THEN 'MATCHED'
        ELSE 'NO ACCOUNT'
    END as match_status
FROM scheduled_posts sp
LEFT JOIN connected_accounts ca
    ON sp.user_id = ca.user_id
    AND sp.platform = ca.platform
WHERE sp.status IN ('scheduled', 'failed')
ORDER BY sp.created_at DESC;

-- 6. Count posts by content structure type
SELECT
    CASE
        WHEN content ? 'primaryContent' THEN 'NEW: primaryContent'
        WHEN content ? 'text' THEN 'OLD: text'
        WHEN content ? 'content' THEN 'LEGACY: content'
        ELSE 'UNKNOWN'
    END as structure_type,
    COUNT(*) as count,
    status
FROM scheduled_posts
GROUP BY structure_type, status
ORDER BY status, count DESC;

-- 7. List all connected accounts
SELECT
    id,
    user_id,
    platform,
    platform_username,
    CASE
        WHEN access_token IS NOT NULL THEN 'Has Token'
        ELSE 'No Token'
    END as token_status,
    token_expires_at,
    created_at
FROM connected_accounts
ORDER BY created_at DESC;

-- 8. Show platform case sensitivity issues
SELECT
    DISTINCT platform,
    COUNT(*) as count
FROM scheduled_posts
GROUP BY platform
UNION ALL
SELECT
    DISTINCT platform,
    COUNT(*) as count
FROM connected_accounts
GROUP BY platform
ORDER BY platform;
