-- =====================================================
-- SocialCraftAI - Database Security Remediation
-- Fixes: function_search_path_mutable warnings
-- =====================================================
-- 
-- Issue: Functions without explicit search_path can be vulnerable
-- to search_path injection attacks where malicious objects in
-- other schemas could be resolved instead of intended ones.
--
-- Solution: Set search_path explicitly to 'public' for each function
-- =====================================================

-- =====================================================
-- 1. Fix cleanup_expired_trend_cache
-- =====================================================
DROP FUNCTION IF EXISTS public.cleanup_expired_trend_cache();

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

-- =====================================================
-- 2. Fix get_cached_trend (DROP first due to return type change)
-- =====================================================
DROP FUNCTION IF EXISTS public.get_cached_trend(TEXT);

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

-- =====================================================
-- 3. Fix set_trend_cache
-- =====================================================
DROP FUNCTION IF EXISTS public.set_trend_cache(TEXT, TEXT, JSONB, JSONB, INTEGER);

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

-- =====================================================
-- 4. Fix update_campaign_counts
-- =====================================================
DROP FUNCTION IF EXISTS public.update_campaign_counts() CASCADE;

CREATE OR REPLACE FUNCTION public.update_campaign_counts()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Update the campaign's post counts
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
            )
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
            )
        WHERE c.id = OLD.campaign_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$;

-- Recreate trigger (dropped with CASCADE above)
DROP TRIGGER IF EXISTS trigger_update_campaign_counts ON public.campaign_posts;
CREATE TRIGGER trigger_update_campaign_counts
AFTER INSERT OR UPDATE OR DELETE ON public.campaign_posts
FOR EACH ROW EXECUTE FUNCTION public.update_campaign_counts();

-- =====================================================
-- 5. Fix update_updated_at
-- =====================================================
DROP FUNCTION IF EXISTS public.update_updated_at() CASCADE;

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

-- Recreate triggers (dropped with CASCADE above)
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

-- =====================================================
-- Verification Query
-- Run this after to confirm search_path is set:
-- =====================================================
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
