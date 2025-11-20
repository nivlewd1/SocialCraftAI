# Edge Functions Cron Jobs Setup Guide

This guide will help you set up automated cron jobs to run your Supabase Edge Functions on a schedule.

## Overview

Your SocialCraft AI application has three edge functions that need to run automatically:

1. **post-scheduler** - Publishes scheduled posts at their scheduled time (runs every 5 minutes)
2. **token-refresh** - Refreshes expiring OAuth tokens (runs daily at 2 AM UTC)
3. **analytics-fetcher** - Fetches engagement metrics for published posts (runs hourly)

## Prerequisites

- ✅ Supabase CLI installed and logged in
- ✅ Edge functions deployed (`post-scheduler`, `token-refresh`, `analytics-fetcher`)
- ✅ OAuth credentials set as Supabase secrets
- ✅ Local repository linked to Supabase project

## Step 1: Apply Database Schema Migration

First, apply the migration that updates the database schema and sets up cron jobs:

```bash
supabase db push
```

This migration will:
- Enable `pg_cron` and `pg_net` extensions
- Update the `scheduled_posts` table with required columns
- Add `is_active` column to `connected_accounts`
- Recreate `analytics_cache` table with the correct schema
- Set up cron jobs for all three edge functions

## Step 2: Configure Database Settings

The cron jobs need your Supabase URL and service role key to invoke edge functions. Set these as database settings:

### Option A: Via Supabase Dashboard (Recommended)

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Navigate to **Settings** → **Database** → **Configuration**
4. Scroll down to **Database Settings**
5. Add the following custom settings:

```sql
-- Run these in the SQL Editor (Dashboard > SQL Editor > New Query)
ALTER DATABASE postgres SET app.settings.supabase_url = 'https://YOUR_PROJECT_REF.supabase.co';
ALTER DATABASE postgres SET app.settings.supabase_service_role_key = 'YOUR_SERVICE_ROLE_KEY';
```

**To get your values:**
- **Supabase URL**: Dashboard → Settings → API → Project URL
- **Service Role Key**: Dashboard → Settings → API → Service Role Key (secret)

### Option B: Via Supabase CLI

```bash
# Get your project reference
supabase projects list

# Set the configuration via SQL
supabase db execute --file - <<SQL
ALTER DATABASE postgres SET app.settings.supabase_url = 'https://YOUR_PROJECT_REF.supabase.co';
ALTER DATABASE postgres SET app.settings.supabase_service_role_key = 'YOUR_SERVICE_ROLE_KEY';
SQL
```

## Step 3: Verify Cron Jobs are Scheduled

Run this SQL query to check if your cron jobs are scheduled:

```sql
-- Dashboard > SQL Editor > New Query
SELECT jobid, jobname, schedule, active, database
FROM cron.job
ORDER BY jobname;
```

You should see 4 jobs:
- `post-scheduler` (every 5 minutes: `*/5 * * * *`)
- `token-refresh` (daily at 2 AM: `0 2 * * *`)
- `analytics-fetcher` (hourly: `0 * * * *`)
- `cleanup-pkce-codes` (daily at 3 AM: `0 3 * * *`)

## Step 4: Monitor Cron Job Execution

To check if your cron jobs are running successfully:

```sql
-- View recent job runs
SELECT
  job.jobname,
  details.runid,
  details.status,
  details.start_time,
  details.end_time,
  details.return_message
FROM cron.job_run_details details
JOIN cron.job job ON details.jobid = job.jobid
ORDER BY details.start_time DESC
LIMIT 20;
```

## Step 5: Test Edge Functions Manually (Optional)

Before relying on cron jobs, test each edge function manually:

```bash
# Test post-scheduler
curl -X POST \
  "https://YOUR_PROJECT_REF.supabase.co/functions/v1/post-scheduler" \
  -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json"

# Test token-refresh
curl -X POST \
  "https://YOUR_PROJECT_REF.supabase.co/functions/v1/token-refresh" \
  -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json"

# Test analytics-fetcher
curl -X POST \
  "https://YOUR_PROJECT_REF.supabase.co/functions/v1/analytics-fetcher" \
  -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json"
```

## Troubleshooting

### Cron Jobs Not Running

If your cron jobs aren't running, check the following:

1. **Verify pg_cron is enabled:**
   ```sql
   SELECT * FROM pg_extension WHERE extname = 'pg_cron';
   ```

2. **Check cron.job table:**
   ```sql
   SELECT * FROM cron.job;
   ```
   If empty, the migration didn't run. Try running it again.

3. **Check database logs:**
   Dashboard → Logs → Database Logs
   Look for errors related to cron jobs or edge function invocations.

### Edge Functions Not Receiving Requests

1. **Verify database settings:**
   ```sql
   SHOW app.settings.supabase_url;
   SHOW app.settings.supabase_service_role_key;
   ```

2. **Check pg_net requests:**
   ```sql
   SELECT * FROM net._http_response ORDER BY id DESC LIMIT 10;
   ```

3. **Test the invoke function manually:**
   ```sql
   SELECT invoke_edge_function('post-scheduler');
   ```

### Rate Limiting Issues

If you see "Rate limit exceeded" errors in scheduled posts:

1. Check the rate limits in `post-scheduler/index.ts`:
   - Twitter: 100 posts/24h (17 for free tier)
   - Instagram: 100 posts/24h
   - LinkedIn: 10 posts/24h (personal), 12 (company)

2. Adjust post schedules to stay within platform limits

3. The edge function will automatically skip posts that exceed rate limits and mark them as failed with a descriptive error message.

## Managing Cron Jobs

### Disable a Cron Job

```sql
-- Disable post-scheduler temporarily
SELECT cron.unschedule('post-scheduler');
```

### Re-enable a Cron Job

```sql
-- Re-enable post-scheduler
SELECT cron.schedule(
  'post-scheduler',
  '*/5 * * * *',
  $$SELECT invoke_edge_function('post-scheduler');$$
);
```

### Change Cron Schedule

```sql
-- Example: Change analytics-fetcher to run every 2 hours instead of every hour
SELECT cron.unschedule('analytics-fetcher');

SELECT cron.schedule(
  'analytics-fetcher',
  '0 */2 * * *',  -- Every 2 hours
  $$SELECT invoke_edge_function('analytics-fetcher');$$
);
```

## Alternative: GitHub Actions (Fallback)

If pg_cron is not available or you prefer an external scheduler, you can use GitHub Actions:

Create `.github/workflows/edge-functions-cron.yml`:

```yaml
name: Edge Functions Scheduler

on:
  schedule:
    # Post scheduler - every 5 minutes
    - cron: '*/5 * * * *'
    # Token refresh - daily at 2 AM UTC
    - cron: '0 2 * * *'
    # Analytics fetcher - hourly
    - cron: '0 * * * *'
  workflow_dispatch: # Allow manual trigger

jobs:
  invoke-edge-functions:
    runs-on: ubuntu-latest
    steps:
      - name: Invoke post-scheduler
        if: github.event.schedule == '*/5 * * * *' || github.event_name == 'workflow_dispatch'
        run: |
          curl -X POST \
            "${{ secrets.SUPABASE_URL }}/functions/v1/post-scheduler" \
            -H "Authorization: Bearer ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}"

      - name: Invoke token-refresh
        if: github.event.schedule == '0 2 * * *' || github.event_name == 'workflow_dispatch'
        run: |
          curl -X POST \
            "${{ secrets.SUPABASE_URL }}/functions/v1/token-refresh" \
            -H "Authorization: Bearer ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}"

      - name: Invoke analytics-fetcher
        if: github.event.schedule == '0 * * * *' || github.event_name == 'workflow_dispatch'
        run: |
          curl -X POST \
            "${{ secrets.SUPABASE_URL }}/functions/v1/analytics-fetcher" \
            -H "Authorization: Bearer ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}"
```

Then add secrets to your GitHub repository:
- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY`: Your service role key

## Summary

✅ **Migration Applied**: Database schema updated with cron jobs
✅ **Database Settings**: Supabase URL and service key configured
✅ **Cron Jobs Active**: Four jobs scheduled and running
✅ **Monitoring**: Job execution can be monitored via SQL queries

Your edge functions will now run automatically on their schedules!

## Next Steps

1. Monitor the first few runs to ensure everything works correctly
2. Check your scheduled posts are being published on time
3. Verify tokens are being refreshed before expiration
4. Confirm analytics are being fetched for published posts
5. Set up alerts for failed jobs (optional)

For more information, see the [Supabase pg_cron documentation](https://supabase.com/docs/guides/database/extensions/pg_cron).
