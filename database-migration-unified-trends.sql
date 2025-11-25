-- ============================================
-- SOCIALCRAFT AI - UNIFIED TREND RESEARCH MIGRATION
-- ============================================
-- This migration extends the trend_reports table to support both:
-- 1. Quick research from GeneratorView ("Research Topic" button)
-- 2. Deep research from TrendsAgent ("Trend Scout")
--
-- Run this in Supabase SQL Editor

-- ============================================
-- 1. ADD NEW COLUMNS TO TREND_REPORTS
-- ============================================

-- source_type: Identifies where the research originated
-- 'quick' = GeneratorView Research Topic (uses findTrends)
-- 'deep' = Trend Scout Agent (uses fetchAgenticTrends)
ALTER TABLE public.trend_reports
ADD COLUMN IF NOT EXISTS source_type TEXT 
    CHECK (source_type IN ('quick', 'deep')) 
    DEFAULT 'deep';

-- identified_trends: Structured trend data for quick research
-- Array of {trendTitle: string, description: string}
ALTER TABLE public.trend_reports
ADD COLUMN IF NOT EXISTS identified_trends JSONB DEFAULT NULL;

-- related_keywords: Keywords extracted during quick research
-- Array of strings
ALTER TABLE public.trend_reports
ADD COLUMN IF NOT EXISTS related_keywords JSONB DEFAULT NULL;

-- overall_summary: Brief summary for quick research
ALTER TABLE public.trend_reports
ADD COLUMN IF NOT EXISTS overall_summary TEXT DEFAULT NULL;

-- ============================================
-- 2. MAKE CONTENT COLUMN NULLABLE
-- ============================================
-- Quick research doesn't generate full markdown content,
-- so we need to allow NULL values

ALTER TABLE public.trend_reports
ALTER COLUMN content DROP NOT NULL;

-- ============================================
-- 3. ADD INDEXES FOR PERFORMANCE
-- ============================================

-- Index for filtering by user and source type
CREATE INDEX IF NOT EXISTS idx_trend_reports_user_source_type 
ON public.trend_reports(user_id, source_type, created_at DESC);

-- Index for fetching recent reports by user
CREATE INDEX IF NOT EXISTS idx_trend_reports_user_created 
ON public.trend_reports(user_id, created_at DESC);

-- ============================================
-- 4. UPDATE EXISTING ROWS
-- ============================================
-- Set source_type to 'deep' for all existing rows (they came from Trend Scout)

UPDATE public.trend_reports
SET source_type = 'deep'
WHERE source_type IS NULL;

-- ============================================
-- 5. ADD ROW LEVEL SECURITY (if not already enabled)
-- ============================================

-- Enable RLS
ALTER TABLE public.trend_reports ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own reports
DROP POLICY IF EXISTS "Users can view own trend reports" ON public.trend_reports;
CREATE POLICY "Users can view own trend reports"
ON public.trend_reports
FOR SELECT
USING (auth.uid() = user_id);

-- Policy: Users can insert their own reports
DROP POLICY IF EXISTS "Users can insert own trend reports" ON public.trend_reports;
CREATE POLICY "Users can insert own trend reports"
ON public.trend_reports
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own reports
DROP POLICY IF EXISTS "Users can update own trend reports" ON public.trend_reports;
CREATE POLICY "Users can update own trend reports"
ON public.trend_reports
FOR UPDATE
USING (auth.uid() = user_id);

-- Policy: Users can delete their own reports
DROP POLICY IF EXISTS "Users can delete own trend reports" ON public.trend_reports;
CREATE POLICY "Users can delete own trend reports"
ON public.trend_reports
FOR DELETE
USING (auth.uid() = user_id);

-- ============================================
-- 6. CREATE HELPFUL VIEW FOR UNIFIED RESEARCH
-- ============================================

CREATE OR REPLACE VIEW unified_trend_research AS
SELECT
    id,
    user_id,
    niche as topic,
    source_type,
    CASE 
        WHEN source_type = 'quick' THEN overall_summary
        ELSE LEFT(content, 500)  -- First 500 chars of deep research
    END as summary_preview,
    CASE
        WHEN source_type = 'quick' THEN identified_trends
        ELSE NULL
    END as trends,
    CASE
        WHEN source_type = 'quick' THEN related_keywords
        ELSE NULL
    END as keywords,
    sources,
    content as full_content,
    created_at,
    CASE
        WHEN source_type = 'quick' THEN 'Generator Research'
        ELSE 'Trend Scout'
    END as source_label
FROM public.trend_reports
ORDER BY created_at DESC;

-- Grant access to the view
GRANT SELECT ON unified_trend_research TO authenticated;

-- ============================================
-- 7. VERIFICATION QUERIES
-- ============================================

-- Check that all new columns exist
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'trend_reports'
ORDER BY ordinal_position;

-- Check indexes
SELECT 
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename = 'trend_reports';

-- Sample data check (after migration)
SELECT 
    id,
    niche,
    source_type,
    LEFT(COALESCE(content, overall_summary, ''), 100) as content_preview,
    CASE WHEN identified_trends IS NOT NULL THEN 'Yes' ELSE 'No' END as has_trends,
    CASE WHEN related_keywords IS NOT NULL THEN 'Yes' ELSE 'No' END as has_keywords,
    created_at
FROM public.trend_reports
ORDER BY created_at DESC
LIMIT 10;

-- ============================================
-- MIGRATION COMPLETE
-- ============================================
-- 
-- Summary of changes:
-- ✅ Added source_type column ('quick' | 'deep')
-- ✅ Added identified_trends column (JSONB)
-- ✅ Added related_keywords column (JSONB)
-- ✅ Added overall_summary column (TEXT)
-- ✅ Made content column nullable
-- ✅ Added performance indexes
-- ✅ Updated existing rows to source_type = 'deep'
-- ✅ Created unified_trend_research view
-- ✅ Configured Row Level Security policies
