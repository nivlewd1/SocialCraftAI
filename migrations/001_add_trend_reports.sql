-- =====================================================
-- Migration Script: Add trend_reports Table
-- =====================================================
-- Run this in Supabase SQL Editor (Production)
-- =====================================================

-- 1. Create trend_reports table
CREATE TABLE IF NOT EXISTS public.trend_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    niche TEXT NOT NULL,
    content TEXT NOT NULL,
    sources JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Add comment to table
COMMENT ON TABLE public.trend_reports IS 'Stores AI-generated trend analysis reports for users';

-- 3. Add comments to columns
COMMENT ON COLUMN public.trend_reports.niche IS 'The niche or topic that was analyzed';
COMMENT ON COLUMN public.trend_reports.content IS 'The full markdown content of the trend report';
COMMENT ON COLUMN public.trend_reports.sources IS 'Array of source URLs and titles used in the analysis';

-- 4. Enable Row Level Security
ALTER TABLE public.trend_reports ENABLE ROW LEVEL SECURITY;

-- 5. Create RLS Policies
CREATE POLICY "Users can view their own trend reports"
    ON public.trend_reports
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own trend reports"
    ON public.trend_reports
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own trend reports"
    ON public.trend_reports
    FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own trend reports"
    ON public.trend_reports
    FOR DELETE
    USING (auth.uid() = user_id);

-- 6. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_trend_reports_user_id 
    ON public.trend_reports(user_id);

CREATE INDEX IF NOT EXISTS idx_trend_reports_created_at 
    ON public.trend_reports(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_trend_reports_niche 
    ON public.trend_reports(niche);

-- 7. Create trigger function for updated_at (if it doesn't exist)
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 8. Create trigger for trend_reports
DROP TRIGGER IF EXISTS update_trend_reports_updated_at ON public.trend_reports;
CREATE TRIGGER update_trend_reports_updated_at
    BEFORE UPDATE ON public.trend_reports
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- 9. Grant permissions (adjust as needed for your setup)
-- GRANT ALL ON public.trend_reports TO authenticated;
-- GRANT ALL ON public.trend_reports TO service_role;

-- =====================================================
-- Verification Queries
-- =====================================================

-- Verify table was created
SELECT 
    table_name,
    table_type
FROM 
    information_schema.tables
WHERE 
    table_schema = 'public'
    AND table_name = 'trend_reports';

-- Verify columns
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM 
    information_schema.columns
WHERE 
    table_schema = 'public'
    AND table_name = 'trend_reports'
ORDER BY 
    ordinal_position;

-- Verify RLS is enabled
SELECT 
    tablename,
    rowsecurity
FROM 
    pg_tables
WHERE 
    schemaname = 'public'
    AND tablename = 'trend_reports';

-- Verify policies
SELECT
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM
    pg_policies
WHERE
    schemaname = 'public'
    AND tablename = 'trend_reports';

-- Verify indexes
SELECT
    indexname,
    indexdef
FROM
    pg_indexes
WHERE
    schemaname = 'public'
    AND tablename = 'trend_reports';

-- =====================================================
-- Rollback Script (if needed)
-- =====================================================
-- Uncomment and run if you need to rollback

-- DROP TRIGGER IF EXISTS update_trend_reports_updated_at ON public.trend_reports;
-- DROP TABLE IF EXISTS public.trend_reports CASCADE;
