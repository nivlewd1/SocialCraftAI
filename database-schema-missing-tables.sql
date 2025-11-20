-- ============================================
-- SOCIALCRAFT AI - MISSING TABLES CREATION SCRIPT
-- ============================================
-- Run this ONLY if the inspection reveals missing tables

-- ============================================
-- 1. SCHEDULED_POSTS TABLE (if not exists)
-- ============================================
CREATE TABLE IF NOT EXISTS scheduled_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    platform TEXT NOT NULL CHECK (platform IN ('linkedin', 'twitter', 'instagram', 'tiktok')),
    content JSONB NOT NULL, -- { text, hashtags, image_prompt }
    scheduled_at TIMESTAMPTZ NOT NULL,
    status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'publishing', 'published', 'failed')),
    error_message TEXT,
    posted_at TIMESTAMPTZ,
    platform_post_id TEXT, -- ID from the platform after posting
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_scheduled_posts_user_id ON scheduled_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_scheduled_posts_status ON scheduled_posts(status);
CREATE INDEX IF NOT EXISTS idx_scheduled_posts_scheduled_at ON scheduled_posts(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_scheduled_posts_status_scheduled ON scheduled_posts(status, scheduled_at) WHERE status = 'scheduled';

-- Row Level Security
ALTER TABLE scheduled_posts ENABLE ROW LEVEL SECURITY;

-- Users can only see their own scheduled posts
CREATE POLICY "Users can view own scheduled posts"
    ON scheduled_posts FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own scheduled posts"
    ON scheduled_posts FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own scheduled posts"
    ON scheduled_posts FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own scheduled posts"
    ON scheduled_posts FOR DELETE
    USING (auth.uid() = user_id);

-- Service role can update all (for edge function)
CREATE POLICY "Service role can update all scheduled posts"
    ON scheduled_posts FOR ALL
    USING (auth.role() = 'service_role');

-- ============================================
-- 2. TREND_REPORTS TABLE (if not exists)
-- ============================================
CREATE TABLE IF NOT EXISTS trend_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    niche TEXT NOT NULL,
    content TEXT NOT NULL,
    sources JSONB DEFAULT '[]'::jsonb, -- Array of { title, url }
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_trend_reports_user_id ON trend_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_trend_reports_created_at ON trend_reports(created_at DESC);

-- Row Level Security
ALTER TABLE trend_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own trend reports"
    ON trend_reports FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own trend reports"
    ON trend_reports FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own trend reports"
    ON trend_reports FOR DELETE
    USING (auth.uid() = user_id);

-- ============================================
-- 3. USER_API_CREDENTIALS TABLE (NEW - for platform posting)
-- ============================================
CREATE TABLE IF NOT EXISTS user_api_credentials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    platform TEXT NOT NULL CHECK (platform IN ('linkedin', 'twitter', 'instagram', 'tiktok')),
    credentials JSONB NOT NULL, -- Encrypted: { access_token, refresh_token, expires_at }
    is_active BOOLEAN NOT NULL DEFAULT true,
    last_used_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, platform)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_user_api_credentials_user_id ON user_api_credentials(user_id);
CREATE INDEX IF NOT EXISTS idx_user_api_credentials_platform ON user_api_credentials(platform);

-- Row Level Security
ALTER TABLE user_api_credentials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own api credentials"
    ON user_api_credentials FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own api credentials"
    ON user_api_credentials FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own api credentials"
    ON user_api_credentials FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own api credentials"
    ON user_api_credentials FOR DELETE
    USING (auth.uid() = user_id);

-- Service role can read all (for edge function)
CREATE POLICY "Service role can read all api credentials"
    ON user_api_credentials FOR SELECT
    USING (auth.role() = 'service_role');

-- ============================================
-- 4. DRAFTS TABLE (if not exists)
-- ============================================
CREATE TABLE IF NOT EXISTS drafts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT,
    content JSONB NOT NULL, -- { text, platform, hashtags, image_prompt }
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_drafts_user_id ON drafts(user_id);
CREATE INDEX IF NOT EXISTS idx_drafts_updated_at ON drafts(updated_at DESC);

-- Row Level Security
ALTER TABLE drafts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own drafts"
    ON drafts FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own drafts"
    ON drafts FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own drafts"
    ON drafts FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own drafts"
    ON drafts FOR DELETE
    USING (auth.uid() = user_id);

-- ============================================
-- 5. PROFILES TABLE (if not exists)
-- ============================================
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    full_name TEXT,
    avatar_url TEXT,
    subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'pro', 'enterprise')),
    subscription_status TEXT DEFAULT 'active' CHECK (subscription_status IN ('active', 'cancelled', 'expired')),
    stripe_customer_id TEXT UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_profiles_subscription_tier ON profiles(subscription_tier);
CREATE INDEX IF NOT EXISTS idx_profiles_stripe_customer_id ON profiles(stripe_customer_id);

-- Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
    ON profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id);

-- ============================================
-- 6. POST_ANALYTICS TABLE (NEW - track engagement)
-- ============================================
CREATE TABLE IF NOT EXISTS post_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scheduled_post_id UUID NOT NULL REFERENCES scheduled_posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    platform TEXT NOT NULL,
    impressions INTEGER DEFAULT 0,
    likes INTEGER DEFAULT 0,
    comments INTEGER DEFAULT 0,
    shares INTEGER DEFAULT 0,
    clicks INTEGER DEFAULT 0,
    engagement_rate DECIMAL(5,2),
    fetched_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_post_analytics_user_id ON post_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_post_analytics_scheduled_post_id ON post_analytics(scheduled_post_id);
CREATE INDEX IF NOT EXISTS idx_post_analytics_fetched_at ON post_analytics(fetched_at DESC);

-- Row Level Security
ALTER TABLE post_analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own post analytics"
    ON post_analytics FOR SELECT
    USING (auth.uid() = user_id);

-- ============================================
-- 7. AUTOMATED TRIGGERS
-- ============================================

-- Update updated_at timestamp automatically
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply to scheduled_posts
DROP TRIGGER IF EXISTS update_scheduled_posts_updated_at ON scheduled_posts;
CREATE TRIGGER update_scheduled_posts_updated_at
    BEFORE UPDATE ON scheduled_posts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Apply to user_api_credentials
DROP TRIGGER IF EXISTS update_user_api_credentials_updated_at ON user_api_credentials;
CREATE TRIGGER update_user_api_credentials_updated_at
    BEFORE UPDATE ON user_api_credentials
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Apply to drafts
DROP TRIGGER IF EXISTS update_drafts_updated_at ON drafts;
CREATE TRIGGER update_drafts_updated_at
    BEFORE UPDATE ON drafts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Apply to profiles
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 8. VIEWS FOR REPORTING
-- ============================================

-- User activity summary
CREATE OR REPLACE VIEW user_activity_summary AS
SELECT
    u.id as user_id,
    u.email,
    p.subscription_tier,
    COUNT(DISTINCT tr.id) as trend_reports_count,
    COUNT(DISTINCT sp.id) as scheduled_posts_count,
    COUNT(DISTINCT d.id) as drafts_count,
    COUNT(DISTINCT sp.id) FILTER (WHERE sp.status = 'published') as published_posts_count,
    MAX(tr.created_at) as last_report_at,
    MAX(sp.created_at) as last_scheduled_at
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
LEFT JOIN trend_reports tr ON u.id = tr.user_id
LEFT JOIN scheduled_posts sp ON u.id = sp.user_id
LEFT JOIN drafts d ON u.id = d.user_id
GROUP BY u.id, u.email, p.subscription_tier;

-- Posts needing to be published (for edge function monitoring)
CREATE OR REPLACE VIEW posts_ready_to_publish AS
SELECT
    sp.id,
    sp.user_id,
    u.email,
    sp.platform,
    sp.content,
    sp.scheduled_at,
    sp.created_at,
    EXTRACT(EPOCH FROM (NOW() - sp.scheduled_at)) as seconds_overdue,
    CASE
        WHEN cred.is_active THEN 'Ready'
        ELSE 'Missing Credentials'
    END as status_reason
FROM scheduled_posts sp
JOIN auth.users u ON sp.user_id = u.id
LEFT JOIN user_api_credentials cred ON sp.user_id = cred.user_id AND sp.platform = cred.platform
WHERE sp.status = 'scheduled'
  AND sp.scheduled_at <= NOW()
ORDER BY sp.scheduled_at ASC;

-- ============================================
-- 9. GRANT PERMISSIONS
-- ============================================

-- Grant necessary permissions for service role
GRANT ALL ON scheduled_posts TO service_role;
GRANT ALL ON trend_reports TO service_role;
GRANT ALL ON user_api_credentials TO service_role;
GRANT ALL ON drafts TO service_role;
GRANT ALL ON profiles TO service_role;
GRANT ALL ON post_analytics TO service_role;

-- Grant read permissions for authenticated users
GRANT SELECT ON user_activity_summary TO authenticated;
GRANT SELECT ON posts_ready_to_publish TO service_role; -- Only service role
