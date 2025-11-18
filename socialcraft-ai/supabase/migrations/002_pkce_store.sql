-- =====================================================
-- SocialCraft AI - PKCE Store Migration
-- =====================================================
-- Purpose: Store PKCE verification codes for Twitter OAuth
-- This allows the OAuth flow to survive server restarts
-- =====================================================

-- Create PKCE store table
create table public.pkce_store (
  id uuid primary key default gen_random_uuid(),
  pkce_key text unique not null,
  code_verifier text not null,
  expires_at timestamp with time zone not null,
  created_at timestamp with time zone default now()
);

-- Index for quick lookups by pkce_key
create index pkce_store_pkce_key_idx on public.pkce_store(pkce_key);

-- Index for cleaning up expired codes
create index pkce_store_expires_at_idx on public.pkce_store(expires_at);

-- No Row Level Security needed - this is internal backend storage
-- Service role key will handle access control
alter table public.pkce_store disable row level security;

-- Function to automatically delete expired PKCE codes
create or replace function public.delete_expired_pkce_codes()
returns void as $$
begin
  delete from public.pkce_store
  where expires_at < now();
end;
$$ language plpgsql security definer;

-- =====================================================
-- COMPLETE!
-- =====================================================
-- This table will be used by the backend to store
-- PKCE codes during Twitter OAuth flow, ensuring
-- the flow works even if the server restarts.
-- =====================================================
