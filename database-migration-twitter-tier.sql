-- =====================================================
-- TWITTER TIER SUPPORT MIGRATION
-- Adds twitter_tier column to connected_accounts
-- =====================================================

-- Add twitter_tier column to connected_accounts
ALTER TABLE connected_accounts 
ADD COLUMN IF NOT EXISTS twitter_tier TEXT 
CHECK (twitter_tier IN ('FREE', 'PREMIUM', 'PREMIUM_PLUS')) 
DEFAULT 'FREE';

-- Add comment explaining the column
COMMENT ON COLUMN connected_accounts.twitter_tier IS 
'Twitter/X subscription tier: FREE (280 chars), PREMIUM (4000 chars), PREMIUM_PLUS (25000 chars)';

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS connected_accounts_twitter_tier_idx 
ON connected_accounts(twitter_tier) 
WHERE platform = 'twitter';

-- Update existing Twitter accounts to FREE tier (default)
UPDATE connected_accounts 
SET twitter_tier = 'FREE' 
WHERE platform = 'twitter' 
AND twitter_tier IS NULL;

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Check the updated schema
SELECT 
    column_name,
    data_type,
    column_default,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'connected_accounts'
AND column_name IN ('platform', 'twitter_tier')
ORDER BY ordinal_position;

-- Check existing Twitter accounts
SELECT 
    id,
    user_id,
    platform,
    twitter_tier,
    platform_username,
    created_at
FROM connected_accounts
WHERE platform = 'twitter'
ORDER BY created_at DESC;

-- Count by tier
SELECT 
    twitter_tier,
    COUNT(*) as count
FROM connected_accounts
WHERE platform = 'twitter'
GROUP BY twitter_tier;

-- =====================================================
-- HELPER FUNCTION (Optional)
-- =====================================================

-- Function to update Twitter tier when detected by backend
-- Security: Uses immutable search_path to prevent injection attacks
CREATE OR REPLACE FUNCTION update_twitter_tier(
    p_user_id UUID,
    p_tier TEXT
) RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    UPDATE connected_accounts
    SET twitter_tier = p_tier,
        updated_at = NOW()
    WHERE user_id = p_user_id
    AND platform = 'twitter';
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION update_twitter_tier(UUID, TEXT) TO authenticated;

COMMENT ON FUNCTION update_twitter_tier IS 
'Updates the Twitter tier for a user based on backend detection';
