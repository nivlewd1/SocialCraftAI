-- A. PERFORMANCE INDEX (Critical for Scheduler)
-- Ensures the backend worker can find pending posts instantly (O(log N))
CREATE INDEX IF NOT EXISTS idx_scheduled_posts_worker 
ON scheduled_posts (status, scheduled_at) 
WHERE status = 'scheduled';

-- B. BRAND PERSONAS TABLE (New)
-- Moves personas from LocalStorage to Cloud for cross-device access
create table public.brand_personas (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  name text not null,
  tone text not null,
  audience text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- C. TREND REPORTS TABLE (New)
-- Stores the expensive "Agentic Search" results so users don't lose research
create table public.trend_reports (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  niche text not null,
  content text not null, -- The markdown briefing
  sources jsonb not null, -- Array of source URLs
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- D. ENABLE RLS (Security)
alter table public.brand_personas enable row level security;
alter table public.trend_reports enable row level security;

create policy "Users can CRUD own personas" on public.brand_personas
  for all using (auth.uid() = user_id);

create policy "Users can CRUD own reports" on public.trend_reports
  for all using (auth.uid() = user_id);
