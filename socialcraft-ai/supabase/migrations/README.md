# Database Migrations

This directory contains SQL migration files for the SocialCraft AI database.

## How to Apply Migrations

### Via Supabase Dashboard

1. Go to your [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Navigate to **SQL Editor** (left sidebar)
4. Click **New Query**
5. Copy the contents of the migration file
6. Paste into the editor
7. Click **Run** or press `Ctrl+Enter` (Cmd+Enter on Mac)

### Via Supabase CLI

```bash
# Login to Supabase
supabase login

# Link your project
supabase link --project-ref your-project-ref

# Apply migrations
supabase db push
```

## Migration Files

### `001_initial_schema.sql`
Creates the initial database schema including:
- User profiles
- Drafts
- Scheduled posts
- Media storage
- Connected accounts (OAuth tokens)
- Analytics cache
- Storage buckets and policies

**Status**: Should already be applied to your database

### `002_pkce_store.sql`
Creates the PKCE store table for Twitter OAuth.

**Purpose**: Stores PKCE verification codes to handle server restarts during OAuth flow.

**Required**: Yes - needed for Twitter OAuth to work reliably

**To Apply**: Run this migration in your Supabase SQL editor

```sql
-- Copy and paste the contents of 002_pkce_store.sql
-- into the SQL Editor and run it
```

## Verification

After applying migrations, verify the tables exist:

1. Go to **Table Editor** in Supabase Dashboard
2. Check for these tables:
   - `profiles`
   - `drafts`
   - `scheduled_posts`
   - `media`
   - `connected_accounts`
   - `analytics_cache`
   - `pkce_store` (new)

## Rollback

If you need to rollback a migration:

```sql
-- For 002_pkce_store.sql
DROP TABLE IF EXISTS public.pkce_store;
DROP FUNCTION IF EXISTS public.delete_expired_pkce_codes();
```

## Notes

- Migrations should be applied in order (001, 002, etc.)
- Always backup your database before applying migrations
- Test migrations in a development environment first
