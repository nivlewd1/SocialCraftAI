-- =====================================================
-- SocialCraft AI - PKCE Store Migration: Add original_state
-- =====================================================
-- Purpose: Store the original JWT state alongside PKCE verifier
-- This allows us to send only a short session ID to Twitter
-- (avoiding URL length issues with long JWT tokens)
-- =====================================================

-- Add original_state column to store JWT during OAuth flow
ALTER TABLE public.pkce_store ADD COLUMN IF NOT EXISTS original_state TEXT;

-- =====================================================
-- COMPLETE!
-- =====================================================
-- After applying this migration, the pkce_store table will have:
-- - pkce_key: Session ID (32 chars)
-- - code_verifier: PKCE code for token exchange
-- - original_state: Original JWT from frontend
-- - expires_at: When this session expires
-- =====================================================
