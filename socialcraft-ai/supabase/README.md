# Supabase Database Setup

This directory contains the database schema and setup instructions for SocialCraft AI.

## Quick Start

### 1. Run the Initial Migration

1. Go to your [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Navigate to **SQL Editor** (left sidebar)
4. Click **New Query**
5. Copy the contents of `migrations/001_initial_schema.sql`
6. Paste into the SQL Editor
7. Click **Run** (or press Ctrl+Enter)

### 2. Verify the Setup

After running the migration, verify everything was created:

**Tables Created:**
- `profiles` - User profile information
- `drafts` - Saved content drafts
- `scheduled_posts` - Posts scheduled for future publishing
- `media` - AI-generated images and videos metadata
- `connected_accounts` - OAuth tokens for social platforms
- `analytics_cache` - Cached analytics data

**Check Tables:**
1. Dashboard > **Table Editor**
2. You should see all 6 tables listed

**Check Row Level Security (RLS):**
1. Dashboard > **Authentication** > **Policies**
2. Each table should have policies ensuring users can only access their own data

**Check Storage Bucket:**
1. Dashboard > **Storage**
2. You should see an `ai-media` bucket

### 3. Get Your Supabase Credentials

You'll need these for your frontend `.env` file:

1. Dashboard > **Settings** > **API**
2. Copy:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon/public key** (starts with `eyJ...`)

## Database Schema Overview

### User Flow

```
1. User Signs Up
   └─> auth.users (Supabase managed)
   └─> profiles (auto-created via trigger)

2. User Generates Content
   └─> drafts (saved for later)

3. User Generates Media
   └─> Upload to storage.objects (ai-media bucket)
   └─> metadata saved in media table

4. User Connects Social Accounts
   └─> OAuth flow via Express backend
   └─> Tokens stored in connected_accounts

5. User Schedules Post
   └─> scheduled_posts

6. Analytics Fetched
   └─> analytics_cache (reduces API calls)
```

### Row Level Security (RLS)

All tables have RLS enabled with policies that ensure:
- Users can **only** see their own data
- Even if someone bypasses the API, the database enforces security
- This is enforced at the PostgreSQL level

**Example:**
```sql
-- Users can only see their own drafts
create policy "Users can view own drafts"
  on public.drafts for select
  using (auth.uid() = user_id);
```

### Storage Structure

Media files are stored in the `ai-media` bucket with this structure:
```
ai-media/
├── {user_id}/
│   ├── {image_id}.png
│   ├── {video_id}.mp4
│   └── ...
```

## Next Steps

After running the migration:
1. ✅ Install Supabase client in frontend: `npm install @supabase/supabase-js`
2. ✅ Create `.env` file with Supabase credentials
3. ✅ Set up Supabase client configuration
4. ✅ Integrate authentication in frontend
5. ✅ Update backend to use Supabase for data storage

## Troubleshooting

**Error: storage buckets table doesn't exist**
- Create the `ai-media` bucket manually via Dashboard > Storage > New Bucket
- Make it public
- Then apply the storage policies from the migration

**Error: function already exists**
- The migration has already been run
- Check Dashboard > Table Editor to verify tables exist

**Tables created but no policies**
- Go to Dashboard > Authentication > Policies
- Verify each table has RLS enabled and policies applied

## Optional: Supabase CLI (Type Generation)

If you want auto-generated TypeScript types from your schema:

```bash
# Install Supabase CLI globally
npm install -g supabase

# Login to Supabase
supabase login

# Generate types
supabase gen types typescript --project-id your-project-id > types/database.types.ts
```

This is **optional** but provides excellent TypeScript DX!
