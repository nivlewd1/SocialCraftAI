-- =====================================================
-- FIX EXISTING SCHEDULED POSTS
-- This migration fixes the content structure for existing posts
-- =====================================================

-- BACKUP: First, let's see what we're about to change
-- Run this first to review the posts that will be affected
SELECT
    id,
    platform,
    status,
    created_at,
    CASE
        WHEN content ? 'primaryContent' THEN 'Already Fixed'
        WHEN content ? 'text' THEN 'Needs Fix (has text)'
        WHEN content ? 'content' THEN 'Needs Fix (has content)'
        ELSE 'Unknown Structure'
    END as fix_status,
    content
FROM scheduled_posts
WHERE NOT (content ? 'primaryContent')
ORDER BY created_at DESC;

-- =====================================================
-- FIX 1: Update posts that have 'text' field to use 'primaryContent'
-- =====================================================
UPDATE scheduled_posts
SET content = jsonb_set(
    content,
    '{primaryContent}',
    content->'text',
    true
),
updated_at = NOW()
WHERE content ? 'text'
  AND NOT (content ? 'primaryContent');

-- =====================================================
-- FIX 2: Update posts that have 'content' field to use 'primaryContent'
-- =====================================================
UPDATE scheduled_posts
SET content = jsonb_set(
    content,
    '{primaryContent}',
    content->'content',
    true
),
updated_at = NOW()
WHERE content ? 'content'
  AND NOT (content ? 'primaryContent')
  AND NOT (content ? 'text');

-- =====================================================
-- FIX 3: Add missing fields to old posts for consistency
-- =====================================================
UPDATE scheduled_posts
SET content = content ||
    jsonb_build_object(
        'platform', COALESCE(content->>'platform', platform),
        'hashtags', COALESCE(content->'hashtags', '[]'::jsonb),
        'variations', COALESCE(content->'variations', '[]'::jsonb),
        'optimizationTips', COALESCE(content->'optimizationTips', '[]'::jsonb),
        'engagementPotential', COALESCE((content->>'engagementPotential')::numeric, 0),
        'analysis', COALESCE(content->'analysis', '{"emotionalTriggers":[],"viralPatterns":[],"audienceValue":""}'::jsonb)
    ),
    updated_at = NOW()
WHERE NOT (content ? 'platform')
   OR NOT (content ? 'hashtags')
   OR NOT (content ? 'variations');

-- =====================================================
-- FIX 4: Reset failed posts to scheduled if they now have valid content
-- (Only do this if the user wants to retry failed posts automatically)
-- OPTIONAL: Comment this out if you want to keep failed posts as failed
-- =====================================================
-- UPDATE scheduled_posts
-- SET status = 'scheduled',
--     error_message = NULL,
--     updated_at = NOW()
-- WHERE status = 'failed'
--   AND content ? 'primaryContent'
--   AND (content->>'primaryContent') <> ''
--   AND scheduled_at > NOW(); -- Only reset future posts

-- =====================================================
-- VERIFICATION: Check the results
-- =====================================================
SELECT
    'After Migration' as stage,
    CASE
        WHEN content ? 'primaryContent' THEN 'Fixed: Has primaryContent'
        WHEN content ? 'text' THEN 'Still has text'
        WHEN content ? 'content' THEN 'Still has content'
        ELSE 'Unknown'
    END as structure,
    status,
    COUNT(*) as count
FROM scheduled_posts
GROUP BY structure, status
ORDER BY status, count DESC;

-- Show sample of fixed posts
SELECT
    id,
    platform,
    status,
    created_at,
    content ? 'primaryContent' as has_primary_content,
    content->>'primaryContent' as primary_content_preview,
    jsonb_object_keys(content) as content_keys
FROM scheduled_posts
ORDER BY created_at DESC
LIMIT 10;
