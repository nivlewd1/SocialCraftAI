-- ============================================
-- SOCIALCRAFT AI - REQUIRED DATABASE MIGRATIONS
-- ============================================
-- Run these in Supabase SQL Editor before deploying edge function

-- ============================================
-- 1. ADD MISSING COLUMNS TO SCHEDULED_POSTS
-- ============================================

-- Add platform_post_id to track posted content
ALTER TABLE scheduled_posts
ADD COLUMN IF NOT EXISTS platform_post_id TEXT;

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_scheduled_posts_platform_post_id
ON scheduled_posts(platform_post_id)
WHERE platform_post_id IS NOT NULL;

-- ============================================
-- 2. ADD OPTIONAL is_active TO CONNECTED_ACCOUNTS
-- ============================================

-- Add is_active flag for manual account disabling
ALTER TABLE connected_accounts
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Add index for faster active account queries
CREATE INDEX IF NOT EXISTS idx_connected_accounts_active
ON connected_accounts(user_id, platform, is_active)
WHERE is_active = true;

-- ============================================
-- 3. UPDATE EXISTING ROWS TO SET DEFAULTS
-- ============================================

-- Set is_active to true for all existing connected accounts
UPDATE connected_accounts
SET is_active = true
WHERE is_active IS NULL;

-- ============================================
-- 4. ADD HELPFUL VIEWS FOR MONITORING
-- ============================================

-- View: Posts ready to publish (for debugging)
CREATE OR REPLACE VIEW posts_ready_to_publish AS
SELECT
    sp.id,
    sp.user_id,
    sp.platform,
    sp.content->>'text' as post_text,
    sp.scheduled_at,
    sp.created_at,
    EXTRACT(EPOCH FROM (NOW() - sp.scheduled_at)) / 60 as minutes_overdue,
    ca.platform_username,
    ca.token_expires_at,
    CASE
        WHEN ca.access_token IS NULL THEN '❌ No account connected'
        WHEN ca.token_expires_at IS NOT NULL AND ca.token_expires_at <= NOW() THEN '⚠️ Token expired'
        WHEN ca.is_active = false THEN '⚠️ Account inactive'
        ELSE '✅ Ready to publish'
    END as status_reason
FROM scheduled_posts sp
LEFT JOIN connected_accounts ca
    ON sp.user_id = ca.user_id
    AND sp.platform = ca.platform
WHERE sp.status = 'scheduled'
  AND sp.scheduled_at <= NOW()
ORDER BY sp.scheduled_at ASC;

-- View: Connected accounts summary
CREATE OR REPLACE VIEW connected_accounts_summary AS
SELECT
    ca.user_id,
    ca.platform,
    ca.platform_username,
    ca.is_active,
    CASE
        WHEN ca.token_expires_at IS NULL THEN 'No expiration set'
        WHEN ca.token_expires_at <= NOW() THEN 'Expired'
        WHEN ca.token_expires_at <= NOW() + INTERVAL '7 days' THEN 'Expiring soon'
        ELSE 'Valid'
    END as token_status,
    ca.token_expires_at,
    ca.created_at,
    COUNT(sp.id) as scheduled_posts_count,
    COUNT(sp.id) FILTER (WHERE sp.status = 'published') as published_posts_count,
    COUNT(sp.id) FILTER (WHERE sp.status = 'failed') as failed_posts_count
FROM connected_accounts ca
LEFT JOIN scheduled_posts sp ON ca.user_id = sp.user_id AND ca.platform = sp.platform
GROUP BY ca.user_id, ca.platform, ca.platform_username, ca.is_active, ca.token_expires_at, ca.created_at
ORDER BY ca.created_at DESC;

-- View: Platform posting statistics
CREATE OR REPLACE VIEW platform_stats AS
SELECT
    platform,
    COUNT(*) as total_posts,
    COUNT(*) FILTER (WHERE status = 'scheduled') as scheduled,
    COUNT(*) FILTER (WHERE status = 'publishing') as publishing,
    COUNT(*) FILTER (WHERE status = 'published') as published,
    COUNT(*) FILTER (WHERE status = 'failed') as failed,
    ROUND(100.0 * COUNT(*) FILTER (WHERE status = 'published') / NULLIF(COUNT(*), 0), 2) as success_rate,
    MAX(posted_at) as last_published_at,
    COUNT(DISTINCT user_id) as unique_users
FROM scheduled_posts
GROUP BY platform
ORDER BY total_posts DESC;

-- ============================================
-- 5. ADD TRIGGER FOR UPDATED_AT
-- ============================================

-- Ensure updated_at is automatically updated
CREATE OR REPLACE FUNCTION update_connected_accounts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to connected_accounts
DROP TRIGGER IF EXISTS update_connected_accounts_updated_at_trigger ON connected_accounts;
CREATE TRIGGER update_connected_accounts_updated_at_trigger
    BEFORE UPDATE ON connected_accounts
    FOR EACH ROW
    EXECUTE FUNCTION update_connected_accounts_updated_at();

-- ============================================
-- 6. VERIFY MIGRATIONS
-- ============================================

-- Check that all required columns exist
SELECT
    'scheduled_posts' as table_name,
    column_name,
    data_type,
    CASE WHEN column_name IN ('platform_post_id') THEN '✅ Added' ELSE '✓ Existing' END as status
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'scheduled_posts'
  AND column_name IN ('id', 'user_id', 'platform', 'content', 'scheduled_at', 'status', 'platform_post_id', 'error_message', 'posted_at')
ORDER BY ordinal_position;

SELECT
    'connected_accounts' as table_name,
    column_name,
    data_type,
    CASE WHEN column_name IN ('is_active') THEN '✅ Added' ELSE '✓ Existing' END as status
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'connected_accounts'
  AND column_name IN ('id', 'user_id', 'platform', 'access_token', 'refresh_token', 'token_expires_at', 'is_active')
ORDER BY ordinal_position;

-- ============================================
-- 7. GRANT PERMISSIONS TO SERVICE ROLE
-- ============================================

-- Ensure service role can access views
GRANT SELECT ON posts_ready_to_publish TO service_role;
GRANT SELECT ON connected_accounts_summary TO service_role;
GRANT SELECT ON platform_stats TO service_role;

-- ============================================
-- MIGRATION COMPLETE
-- ============================================

-- Test query: Check posts ready to publish
SELECT * FROM posts_ready_to_publish LIMIT 5;

-- Test query: Check connected accounts
SELECT * FROM connected_accounts_summary;

-- Test query: Check platform stats
SELECT * FROM platform_stats;
