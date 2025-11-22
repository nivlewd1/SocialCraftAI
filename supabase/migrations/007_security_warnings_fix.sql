-- =====================================================
-- SocialCraft AI - Security Warnings Fix
-- =====================================================
-- Purpose: Fix remaining Supabase security linter warnings
--
-- Issues addressed:
-- 1. invoke_edge_function has mutable search_path
-- 2. pg_net extension is in public schema
-- 3. auth_leaked_password_protection (Dashboard setting - see notes)
-- =====================================================

-- =====================================================
-- 1. FIX invoke_edge_function SEARCH PATH
-- =====================================================
-- Drop the function if it exists - it's not used by the app
-- (Edge functions are invoked via HTTP from GitHub Actions)

DROP FUNCTION IF EXISTS public.invoke_edge_function CASCADE;

-- If you need this function, recreate it with fixed search_path:
-- CREATE OR REPLACE FUNCTION public.invoke_edge_function(function_name text)
-- RETURNS void
-- LANGUAGE plpgsql
-- SECURITY DEFINER
-- SET search_path = public
-- AS $$
-- BEGIN
--   -- Function body here
-- END;
-- $$;

-- =====================================================
-- 2. MOVE pg_net EXTENSION TO extensions SCHEMA
-- =====================================================
-- Note: This requires the extensions schema to exist
-- Supabase projects typically have this schema already

-- Create extensions schema if it doesn't exist
CREATE SCHEMA IF NOT EXISTS extensions;

-- Grant usage to necessary roles
GRANT USAGE ON SCHEMA extensions TO postgres, anon, authenticated, service_role;

-- Move pg_net to extensions schema
-- Note: This may fail if pg_net has dependencies. If so, run manually:
--   1. DROP EXTENSION pg_net CASCADE;
--   2. CREATE EXTENSION pg_net SCHEMA extensions;
ALTER EXTENSION pg_net SET SCHEMA extensions;

-- =====================================================
-- 3. LEAKED PASSWORD PROTECTION (Manual Step)
-- =====================================================
-- This is a Supabase Auth dashboard setting, not SQL.
--
-- To enable:
-- 1. Go to Supabase Dashboard
-- 2. Authentication > Providers > Email
-- 3. Enable "Leaked password protection"
--
-- This checks passwords against HaveIBeenPwned.org database
-- =====================================================

-- =====================================================
-- COMPLETE!
-- =====================================================
-- After running this migration:
-- 1. invoke_edge_function - DROPPED (not used)
-- 2. pg_net extension - Moved to extensions schema
-- 3. Leaked password protection - Enable in Dashboard manually
--
-- If ALTER EXTENSION fails, run these commands manually:
--   DROP EXTENSION pg_net CASCADE;
--   CREATE EXTENSION pg_net SCHEMA extensions;
-- =====================================================
