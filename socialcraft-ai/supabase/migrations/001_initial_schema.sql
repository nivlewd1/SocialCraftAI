-- =====================================================
-- SocialCraft AI - Initial Database Schema
-- =====================================================
-- Run this in your Supabase SQL Editor
-- Dashboard > SQL Editor > New Query > Paste & Run
-- =====================================================

-- =====================================================
-- 1. USER PROFILES TABLE
-- =====================================================
-- Extends Supabase auth.users with additional profile data
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  email text unique not null,
  full_name text,
  avatar_url text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Enable Row Level Security
alter table public.profiles enable row level security;

-- Policies: Users can read all profiles but only update their own
create policy "Public profiles are viewable by everyone"
  on public.profiles for select
  using (true);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Automatically create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- =====================================================
-- 2. DRAFTS TABLE
-- =====================================================
create table public.drafts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  source_content text,
  authors_voice text,
  platform_selections jsonb default '{}'::jsonb,
  tone text,
  search_intent text,
  results jsonb default '[]'::jsonb,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Indexes for performance
create index drafts_user_id_idx on public.drafts(user_id);
create index drafts_created_at_idx on public.drafts(created_at desc);

-- Enable Row Level Security
alter table public.drafts enable row level security;

-- Policies: Users can only access their own drafts
create policy "Users can view own drafts"
  on public.drafts for select
  using (auth.uid() = user_id);

create policy "Users can insert own drafts"
  on public.drafts for insert
  with check (auth.uid() = user_id);

create policy "Users can update own drafts"
  on public.drafts for update
  using (auth.uid() = user_id);

create policy "Users can delete own drafts"
  on public.drafts for delete
  using (auth.uid() = user_id);

-- Auto-update timestamp
create or replace function public.update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_drafts_updated_at
  before update on public.drafts
  for each row execute procedure public.update_updated_at();

-- =====================================================
-- 3. SCHEDULED POSTS TABLE
-- =====================================================
create table public.scheduled_posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  scheduled_at timestamp with time zone not null,
  status text check (status in ('scheduled', 'posted', 'failed')) default 'scheduled',
  content jsonb not null,
  platform text not null,
  error_message text,
  posted_at timestamp with time zone,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Indexes for performance
create index scheduled_posts_user_id_idx on public.scheduled_posts(user_id);
create index scheduled_posts_scheduled_at_idx on public.scheduled_posts(scheduled_at);
create index scheduled_posts_status_idx on public.scheduled_posts(status);

-- Enable Row Level Security
alter table public.scheduled_posts enable row level security;

-- Policies: Users can only access their own scheduled posts
create policy "Users can view own scheduled posts"
  on public.scheduled_posts for select
  using (auth.uid() = user_id);

create policy "Users can insert own scheduled posts"
  on public.scheduled_posts for insert
  with check (auth.uid() = user_id);

create policy "Users can update own scheduled posts"
  on public.scheduled_posts for update
  using (auth.uid() = user_id);

create policy "Users can delete own scheduled posts"
  on public.scheduled_posts for delete
  using (auth.uid() = user_id);

create trigger update_scheduled_posts_updated_at
  before update on public.scheduled_posts
  for each row execute procedure public.update_updated_at();

-- =====================================================
-- 4. MEDIA TABLE
-- =====================================================
-- Stores metadata for AI-generated images and videos
-- Actual files stored in Supabase Storage bucket: 'ai-media'
create table public.media (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  type text check (type in ('image', 'video')) not null,
  prompt text not null,
  storage_path text not null,
  public_url text,
  file_size bigint,
  mime_type text,
  metadata jsonb default '{}'::jsonb,
  created_at timestamp with time zone default now()
);

-- Indexes for performance
create index media_user_id_idx on public.media(user_id);
create index media_type_idx on public.media(type);
create index media_created_at_idx on public.media(created_at desc);

-- Enable Row Level Security
alter table public.media enable row level security;

-- Policies: Users can only access their own media
create policy "Users can view own media"
  on public.media for select
  using (auth.uid() = user_id);

create policy "Users can insert own media"
  on public.media for insert
  with check (auth.uid() = user_id);

create policy "Users can delete own media"
  on public.media for delete
  using (auth.uid() = user_id);

-- =====================================================
-- 5. CONNECTED ACCOUNTS TABLE
-- =====================================================
-- Stores OAuth tokens for LinkedIn, Instagram, TikTok
-- IMPORTANT: Tokens should be encrypted at rest in production
create table public.connected_accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  platform text check (platform in ('linkedin', 'instagram', 'tiktok', 'pinterest', 'twitter')) not null,
  platform_user_id text,
  platform_username text,
  access_token text not null,
  refresh_token text,
  token_expires_at timestamp with time zone,
  scopes text[],
  metadata jsonb default '{}'::jsonb,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),

  -- Each user can only connect one account per platform
  unique(user_id, platform)
);

-- Indexes for performance
create index connected_accounts_user_id_idx on public.connected_accounts(user_id);
create index connected_accounts_platform_idx on public.connected_accounts(platform);

-- Enable Row Level Security
alter table public.connected_accounts enable row level security;

-- Policies: Users can only access their own connected accounts
create policy "Users can view own connected accounts"
  on public.connected_accounts for select
  using (auth.uid() = user_id);

create policy "Users can insert own connected accounts"
  on public.connected_accounts for insert
  with check (auth.uid() = user_id);

create policy "Users can update own connected accounts"
  on public.connected_accounts for update
  using (auth.uid() = user_id);

create policy "Users can delete own connected accounts"
  on public.connected_accounts for delete
  using (auth.uid() = user_id);

create trigger update_connected_accounts_updated_at
  before update on public.connected_accounts
  for each row execute procedure public.update_updated_at();

-- =====================================================
-- 6. ANALYTICS CACHE TABLE (Optional)
-- =====================================================
-- Cache analytics data from social platforms to reduce API calls
create table public.analytics_cache (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  platform text not null,
  metric_type text not null,
  data jsonb not null,
  cached_at timestamp with time zone default now(),
  expires_at timestamp with time zone not null
);

-- Indexes for performance
create index analytics_cache_user_id_platform_idx on public.analytics_cache(user_id, platform);
create index analytics_cache_expires_at_idx on public.analytics_cache(expires_at);

-- Enable Row Level Security
alter table public.analytics_cache enable row level security;

-- Policies: Users can only access their own analytics cache
create policy "Users can view own analytics cache"
  on public.analytics_cache for select
  using (auth.uid() = user_id);

create policy "Users can insert own analytics cache"
  on public.analytics_cache for insert
  with check (auth.uid() = user_id);

create policy "Users can delete own analytics cache"
  on public.analytics_cache for delete
  using (auth.uid() = user_id);

-- Auto-delete expired cache entries (run daily)
create or replace function public.delete_expired_analytics_cache()
returns void as $$
begin
  delete from public.analytics_cache
  where expires_at < now();
end;
$$ language plpgsql security definer;

-- =====================================================
-- 7. STORAGE BUCKETS
-- =====================================================
-- Create storage bucket for AI-generated media
-- Note: This may need to be done via Supabase Dashboard if SQL creation fails
insert into storage.buckets (id, name, public)
values ('ai-media', 'ai-media', true)
on conflict (id) do nothing;

-- Storage policies: Users can only access their own media files
create policy "Users can upload own media"
  on storage.objects for insert
  with check (
    bucket_id = 'ai-media' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can view own media"
  on storage.objects for select
  using (
    bucket_id = 'ai-media' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can delete own media"
  on storage.objects for delete
  using (
    bucket_id = 'ai-media' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- =====================================================
-- COMPLETE!
-- =====================================================
-- Next steps:
-- 1. Verify all tables created: Dashboard > Table Editor
-- 2. Check RLS policies: Dashboard > Authentication > Policies
-- 3. Verify storage bucket: Dashboard > Storage
-- 4. Test with sample data
-- =====================================================
