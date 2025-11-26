-- ============================================
-- SOCIALCRAFT AI - PHASE 1: CAMPAIGN SYSTEM MIGRATION
-- ============================================
-- This migration sets up:
-- 1. Enhanced brand_personas table (with forbidden_words, example_posts)
-- 2. trend_cache table (for cost optimization)
-- 3. campaigns table (campaign management)
-- 4. campaign_posts table (individual posts within campaigns)
--
-- Run this in Supabase SQL Editor
-- ============================================

-- ============================================
-- 1. ENHANCED BRAND_PERSONAS TABLE
-- ============================================
-- Drop existing table if it exists (only if empty or in dev)
-- In production, use ALTER TABLE instead

-- Check if brand_personas needs enhancement
DO $$
BEGIN
    -- Add forbidden_words column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'brand_personas' AND column_name = 'forbidden_words'
    ) THEN
        ALTER TABLE public.brand_personas
        ADD COLUMN forbidden_words TEXT[] DEFAULT '{}';
    END IF;

    -- Add example_posts column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'brand_personas' AND column_name = 'example_posts'
    ) THEN
        ALTER TABLE public.brand_personas
        ADD COLUMN example_posts JSONB DEFAULT '[]';
    END IF;

    -- Add description column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'brand_personas' AND column_name = 'description'
    ) THEN
        ALTER TABLE public.brand_personas
        ADD COLUMN description TEXT;
    END IF;

    -- Add is_default column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'brand_personas' AND column_name = 'is_default'
    ) THEN
        ALTER TABLE public.brand_personas
        ADD COLUMN is_default BOOLEAN DEFAULT false;
    END IF;

    -- Add updated_at column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'brand_personas' AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE public.brand_personas
        ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
    END IF;
END $$;

-- Add index for user's personas
CREATE INDEX IF NOT EXISTS idx_brand_personas_user 
ON public.brand_personas(user_id, created_at DESC);

-- Add index for default persona lookup
CREATE INDEX IF NOT EXISTS idx_brand_personas_default 
ON public.brand_personas(user_id, is_default) 
WHERE is_default = true;

-- Enable RLS
ALTER TABLE public.brand_personas ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Users can view own personas" ON public.brand_personas;
CREATE POLICY "Users can view own personas"
ON public.brand_personas FOR SELECT
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own personas" ON public.brand_personas;
CREATE POLICY "Users can insert own personas"
ON public.brand_personas FOR INSERT
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own personas" ON public.brand_personas;
CREATE POLICY "Users can update own personas"
ON public.brand_personas FOR UPDATE
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own personas" ON public.brand_personas;
CREATE POLICY "Users can delete own personas"
ON public.brand_personas FOR DELETE
USING (auth.uid() = user_id);

-- ============================================
-- 2. TREND_CACHE TABLE (Cost Optimization)
-- ============================================
-- Caches Trend Scout results to avoid repeated $0.035 API calls

CREATE TABLE IF NOT EXISTS public.trend_cache (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    query_hash TEXT NOT NULL,
    query_text TEXT NOT NULL,
    result_json JSONB NOT NULL,
    sources JSONB DEFAULT '[]',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL,
    hit_count INTEGER DEFAULT 0
);

-- Index for fast lookup by hash
CREATE UNIQUE INDEX IF NOT EXISTS idx_trend_cache_hash 
ON public.trend_cache(query_hash);

-- Index for cleanup of expired entries
CREATE INDEX IF NOT EXISTS idx_trend_cache_expires 
ON public.trend_cache(expires_at);

-- No RLS on trend_cache - it's shared across all users for cost savings
-- But we'll still protect it at the API level

-- ============================================
-- 3. CAMPAIGNS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS public.campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Campaign basics
    name TEXT NOT NULL,
    description TEXT,
    status TEXT CHECK (status IN ('draft', 'active', 'paused', 'completed', 'archived')) DEFAULT 'draft',
    
    -- Theme & Goals
    theme_goal TEXT NOT NULL,  -- e.g., "Launch week for Product X"
    content_mix JSONB DEFAULT '{"educational": 30, "promotional": 30, "engagement": 40}',
    
    -- Targeting
    target_platforms TEXT[] NOT NULL DEFAULT '{}',
    brand_persona_id UUID REFERENCES public.brand_personas(id) ON DELETE SET NULL,
    
    -- Scheduling
    date_range_start DATE NOT NULL,
    date_range_end DATE NOT NULL,
    posting_frequency TEXT CHECK (posting_frequency IN ('daily', 'every_other_day', 'twice_weekly', 'weekly')) DEFAULT 'daily',
    
    -- Competitor Analysis (cached once per campaign)
    competitor_handles TEXT[] DEFAULT '{}',
    competitor_analysis_json JSONB,
    competitor_analysis_updated_at TIMESTAMPTZ,
    
    -- Source material
    source_trend_report_id UUID REFERENCES public.trend_reports(id) ON DELETE SET NULL,
    source_content TEXT,  -- Manual input or combined trend data
    
    -- Metrics
    total_posts INTEGER DEFAULT 0,
    posts_published INTEGER DEFAULT 0,
    estimated_credits INTEGER DEFAULT 0,
    credits_used INTEGER DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_campaigns_user 
ON public.campaigns(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_campaigns_status 
ON public.campaigns(user_id, status);

CREATE INDEX IF NOT EXISTS idx_campaigns_dates 
ON public.campaigns(user_id, date_range_start, date_range_end);

-- Enable RLS
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Users can view own campaigns" ON public.campaigns;
CREATE POLICY "Users can view own campaigns"
ON public.campaigns FOR SELECT
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own campaigns" ON public.campaigns;
CREATE POLICY "Users can insert own campaigns"
ON public.campaigns FOR INSERT
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own campaigns" ON public.campaigns;
CREATE POLICY "Users can update own campaigns"
ON public.campaigns FOR UPDATE
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own campaigns" ON public.campaigns;
CREATE POLICY "Users can delete own campaigns"
ON public.campaigns FOR DELETE
USING (auth.uid() = user_id);

-- ============================================
-- 4. CAMPAIGN_POSTS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS public.campaign_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Post basics
    platform TEXT NOT NULL,
    content_type TEXT CHECK (content_type IN ('educational', 'promotional', 'engagement')) DEFAULT 'promotional',
    status TEXT CHECK (status IN ('draft', 'text_generated', 'visuals_generated', 'scheduled', 'published', 'failed')) DEFAULT 'draft',
    
    -- Content (text first approach)
    text_content JSONB,  -- The GeneratedContent object (without media)
    
    -- A/B Variation
    variation_type TEXT CHECK (variation_type IN ('original', 'variation_a', 'variation_b')) DEFAULT 'original',
    variation_group UUID,  -- Groups original + variations together
    variation_changes JSONB,  -- What was changed: {hook: true, cta: true, tone: false, format: false}
    
    -- Media (generated separately)
    has_media BOOLEAN DEFAULT false,
    media_type TEXT CHECK (media_type IN ('image', 'video', 'carousel')),
    media_url TEXT,
    media_prompt TEXT,
    
    -- Scheduling
    scheduled_at TIMESTAMPTZ,
    scheduled_post_id UUID REFERENCES public.scheduled_posts(id) ON DELETE SET NULL,
    
    -- Performance Prediction
    predicted_engagement_score INTEGER,  -- 0-100
    prediction_factors JSONB,  -- {timing: 8, hook_strength: 9, platform_fit: 7, ...}
    prediction_source TEXT CHECK (prediction_source IN ('baseline', 'deep_analysis')),
    
    -- Actual Performance (after publishing)
    actual_engagement_score INTEGER,
    actual_metrics JSONB,  -- {likes, comments, shares, impressions, clicks}
    
    -- Credits tracking
    text_credits_used INTEGER DEFAULT 0,
    media_credits_used INTEGER DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    published_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_campaign_posts_campaign 
ON public.campaign_posts(campaign_id, created_at);

CREATE INDEX IF NOT EXISTS idx_campaign_posts_user 
ON public.campaign_posts(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_campaign_posts_status 
ON public.campaign_posts(campaign_id, status);

CREATE INDEX IF NOT EXISTS idx_campaign_posts_scheduled 
ON public.campaign_posts(scheduled_at) 
WHERE status = 'scheduled';

CREATE INDEX IF NOT EXISTS idx_campaign_posts_variation 
ON public.campaign_posts(variation_group);

-- Enable RLS
ALTER TABLE public.campaign_posts ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Users can view own campaign posts" ON public.campaign_posts;
CREATE POLICY "Users can view own campaign posts"
ON public.campaign_posts FOR SELECT
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own campaign posts" ON public.campaign_posts;
CREATE POLICY "Users can insert own campaign posts"
ON public.campaign_posts FOR INSERT
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own campaign posts" ON public.campaign_posts;
CREATE POLICY "Users can update own campaign posts"
ON public.campaign_posts FOR UPDATE
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own campaign posts" ON public.campaign_posts;
CREATE POLICY "Users can delete own campaign posts"
ON public.campaign_posts FOR DELETE
USING (auth.uid() = user_id);

-- ============================================
-- 5. HELPER FUNCTIONS (with search_path set for security)
-- ============================================

-- Function to clean up expired cache entries (run via cron)
CREATE OR REPLACE FUNCTION public.cleanup_expired_trend_cache()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM public.trend_cache 
    WHERE expires_at < NOW();
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$;

-- Function to get cached trend or return null
CREATE OR REPLACE FUNCTION public.get_cached_trend(p_query_hash TEXT)
RETURNS TABLE (
    result_json JSONB,
    sources JSONB,
    hit_count INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Update hit count and return result if not expired
    UPDATE public.trend_cache tc
    SET hit_count = tc.hit_count + 1
    WHERE tc.query_hash = p_query_hash
      AND tc.expires_at > NOW();
    
    RETURN QUERY
    SELECT tc.result_json, tc.sources, tc.hit_count
    FROM public.trend_cache tc
    WHERE tc.query_hash = p_query_hash
      AND tc.expires_at > NOW();
END;
$$;

-- Function to set trend cache
CREATE OR REPLACE FUNCTION public.set_trend_cache(
    p_query_hash TEXT,
    p_query_text TEXT,
    p_result_json JSONB,
    p_sources JSONB DEFAULT '[]',
    p_ttl_hours INTEGER DEFAULT 24
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.trend_cache (query_hash, query_text, result_json, sources, expires_at)
    VALUES (
        p_query_hash,
        LEFT(p_query_text, 500),
        p_result_json,
        p_sources,
        NOW() + (p_ttl_hours || ' hours')::INTERVAL
    )
    ON CONFLICT (query_hash) 
    DO UPDATE SET
        result_json = EXCLUDED.result_json,
        sources = EXCLUDED.sources,
        expires_at = EXCLUDED.expires_at,
        hit_count = 0;
END;
$$;

-- Function to update campaign post counts
CREATE OR REPLACE FUNCTION public.update_campaign_counts()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
        UPDATE public.campaigns c
        SET 
            total_posts = (
                SELECT COUNT(*) 
                FROM public.campaign_posts cp 
                WHERE cp.campaign_id = NEW.campaign_id
            ),
            posts_published = (
                SELECT COUNT(*) 
                FROM public.campaign_posts cp 
                WHERE cp.campaign_id = NEW.campaign_id 
                  AND cp.status = 'published'
            ),
            updated_at = NOW()
        WHERE c.id = NEW.campaign_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.campaigns c
        SET 
            total_posts = (
                SELECT COUNT(*) 
                FROM public.campaign_posts cp 
                WHERE cp.campaign_id = OLD.campaign_id
            ),
            posts_published = (
                SELECT COUNT(*) 
                FROM public.campaign_posts cp 
                WHERE cp.campaign_id = OLD.campaign_id 
                  AND cp.status = 'published'
            ),
            updated_at = NOW()
        WHERE c.id = OLD.campaign_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$;

-- Trigger for campaign post counts
DROP TRIGGER IF EXISTS trigger_update_campaign_counts ON public.campaign_posts;
CREATE TRIGGER trigger_update_campaign_counts
AFTER INSERT OR UPDATE OR DELETE ON public.campaign_posts
FOR EACH ROW EXECUTE FUNCTION public.update_campaign_counts();

-- Function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

-- Triggers for updated_at
DROP TRIGGER IF EXISTS trigger_campaigns_updated_at ON public.campaigns;
CREATE TRIGGER trigger_campaigns_updated_at
BEFORE UPDATE ON public.campaigns
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS trigger_campaign_posts_updated_at ON public.campaign_posts;
CREATE TRIGGER trigger_campaign_posts_updated_at
BEFORE UPDATE ON public.campaign_posts
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS trigger_brand_personas_updated_at ON public.brand_personas;
CREATE TRIGGER trigger_brand_personas_updated_at
BEFORE UPDATE ON public.brand_personas
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ============================================
-- 6. VIEWS FOR ANALYTICS
-- ============================================

-- Campaign overview view
CREATE OR REPLACE VIEW public.campaign_overview AS
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

-- Grant access to views
GRANT SELECT ON public.campaign_overview TO authenticated;

-- ============================================
-- 7. VERIFICATION
-- ============================================

-- Check all tables exist
SELECT 
    table_name,
    CASE 
        WHEN table_name IN ('brand_personas', 'trend_cache', 'campaigns', 'campaign_posts') 
        THEN '✅ Created'
        ELSE '❓ Unknown'
    END as status
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('brand_personas', 'trend_cache', 'campaigns', 'campaign_posts')
ORDER BY table_name;

-- Verify functions have search_path set
SELECT 
    proname as function_name,
    CASE 
        WHEN proconfig @> ARRAY['search_path=public'] THEN '✅ Secured'
        ELSE '⚠️ Missing search_path'
    END as security_status
FROM pg_proc 
WHERE pronamespace = 'public'::regnamespace
  AND proname IN (
      'cleanup_expired_trend_cache',
      'get_cached_trend', 
      'set_trend_cache',
      'update_campaign_counts',
      'update_updated_at'
  );

-- ============================================
-- MIGRATION COMPLETE
-- ============================================
