-- =====================================================
-- SocialCraft AI - Security Warnings Fix
-- =====================================================
-- Purpose: Fix remaining Supabase security linter warnings
--
-- Issues addressed:
-- 1. invoke_edge_function has mutable search_path - FIXED (dropped)
-- 2. pg_net extension in public schema - CANNOT FIX (see notes)
-- 3. auth_leaked_password_protection - Dashboard setting
-- =====================================================

-- =====================================================
-- 1. FIX invoke_edge_function SEARCH PATH
-- =====================================================
-- Drop the function if it exists - it's not used by the app
-- (Edge functions are invoked via HTTP from GitHub Actions)

DROP FUNCTION IF EXISTS public.invoke_edge_function CASCADE;

-- =====================================================
-- 2. pg_net EXTENSION WARNING (Cannot Fix)
-- =====================================================
-- The pg_net extension does NOT support SET SCHEMA.
-- This is a known limitation and the warning can be safely ignored.
--
-- pg_net in public schema is:
-- - How Supabase installs it by default
-- - Required for HTTP requests from database
-- - Safe to leave as-is (WARN level, not ERROR)
--
-- If you want to eliminate this warning, you would need to:
-- 1. Drop all dependent objects
-- 2. DROP EXTENSION pg_net;
-- 3. CREATE EXTENSION pg_net SCHEMA extensions;
-- 4. Recreate dependent objects
--
-- This is NOT recommended as it may break Supabase functionality.

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
-- 1. invoke_edge_function - DROPPED
-- 2. pg_net extension - Cannot move (safe to ignore warning)
-- 3. Leaked password protection - Enable in Dashboard manually
-- =====================================================
