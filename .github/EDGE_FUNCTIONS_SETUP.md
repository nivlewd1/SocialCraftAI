# Edge Functions Automated Scheduling Setup

This guide will help you set up automated scheduling for your Supabase Edge Functions using GitHub Actions.

## Overview

Your SocialCraft AI application has three edge functions that run automatically:

1. **post-scheduler** - Publishes scheduled posts at their scheduled time (runs every 5 minutes)
2. **token-refresh** - Refreshes expiring OAuth tokens (runs daily at 2 AM UTC)
3. **analytics-fetcher** - Fetches engagement metrics for published posts (runs hourly)

These are scheduled via **GitHub Actions** instead of database cron jobs for easier setup and better visibility.

## Setup Instructions

### Step 1: Add GitHub Secrets

1. Go to your GitHub repository: https://github.com/nivlewd1/SocialCraftAI
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret** and add:

**Secret 1: SUPABASE_URL**
- Name: `SUPABASE_URL`
- Value: Your Supabase project URL (e.g., `https://eymamgnykuavpnvudxxs.supabase.co`)
- Get from: Supabase Dashboard → Settings → API → Project URL

**Secret 2: SUPABASE_SERVICE_ROLE_KEY**
- Name: `SUPABASE_SERVICE_ROLE_KEY`
- Value: Your Supabase service role key (starts with `eyJ...`)
- Get from: Supabase Dashboard → Settings → API → Service Role Key (click "Reveal")

### Step 2: Verify Workflow is Active

1. Go to **Actions** tab in your GitHub repository
2. You should see "Edge Functions Scheduler" in the workflows list
3. The workflow will automatically run on schedule:
   - **post-scheduler**: Every 5 minutes
   - **token-refresh**: Daily at 2 AM UTC
   - **analytics-fetcher**: Every hour

### Step 3: Test Manually (Optional)

To test the edge functions before waiting for the scheduled run:

1. Go to **Actions** → **Edge Functions Scheduler**
2. Click **Run workflow** (on the right)
3. Select which function to run (or "all")
4. Click **Run workflow**
5. Watch the logs to ensure it completes successfully

## Monitoring

### View Workflow Runs

1. Go to **Actions** tab
2. Click **Edge Functions Scheduler**
3. See all recent runs with their status (✅ success or ❌ failure)

### Check Logs

1. Click on any workflow run
2. Click on the job name (e.g., "Post Scheduler")
3. Expand the step to see detailed logs including:
   - HTTP response from edge function
   - Number of posts processed
   - Any errors encountered

## Schedule Details

| Function | Schedule | Description |
|----------|----------|-------------|
| post-scheduler | `*/5 * * * *` | Every 5 minutes - Publishes posts due now |
| token-refresh | `0 2 * * *` | Daily at 2 AM UTC - Refreshes expiring tokens |
| analytics-fetcher | `0 * * * *` | Every hour - Fetches metrics for published posts |

## Troubleshooting

### Workflow Not Running

**Issue**: Workflows don't appear in Actions tab

**Solution**:
- Ensure the workflow file exists at `.github/workflows/edge-functions-scheduler.yml`
- Make sure you've pushed the file to the `main` branch (or your default branch)
- Check that Actions are enabled: Settings → Actions → General → Allow all actions

### Edge Function Returns Error

**Issue**: Workflow runs but edge function returns 4xx or 5xx error

**Solution**:
1. Check the workflow logs for the HTTP response
2. Verify your secrets are set correctly
3. Test the edge function manually using curl:
   ```bash
   curl -X POST \
     "https://YOUR_PROJECT.supabase.co/functions/v1/post-scheduler" \
     -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY" \
     -H "Content-Type: application/json"
   ```
4. Check edge function logs in Supabase Dashboard → Edge Functions → Select function → Logs

### Secrets Not Working

**Issue**: "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY" error

**Solution**:
1. Go to Settings → Secrets and variables → Actions
2. Verify both secrets are listed
3. Re-create the secrets if needed (delete and add again)
4. Ensure the secret names match exactly (case-sensitive):
   - `SUPABASE_URL` (not `SUPABASE_PROJECT_URL`)
   - `SUPABASE_SERVICE_ROLE_KEY` (not `SERVICE_KEY`)

## Modifying Schedules

To change how often the functions run, edit `.github/workflows/edge-functions-scheduler.yml`:

```yaml
on:
  schedule:
    # Change these cron expressions
    - cron: '*/5 * * * *'  # post-scheduler (every 5 minutes)
    - cron: '0 2 * * *'    # token-refresh (daily at 2 AM UTC)
    - cron: '0 * * * *'    # analytics-fetcher (hourly)
```

**Cron syntax:**
- `*/5 * * * *` = Every 5 minutes
- `0 * * * *` = Every hour at minute 0
- `0 2 * * *` = Daily at 2:00 AM UTC
- `0 */2 * * *` = Every 2 hours

Use [crontab.guru](https://crontab.guru/) to build custom schedules.

## GitHub Actions Usage Limits

- **Public repos**: Unlimited workflow minutes
- **Private repos**: 2,000 minutes/month (free tier)

Your current usage (post-scheduler every 5 minutes):
- ~288 runs/day × 30 seconds each = ~144 minutes/day
- ~4,320 minutes/month

If you hit limits, you can:
1. Reduce frequency (e.g., every 10 minutes instead of 5)
2. Upgrade to GitHub Pro for more minutes
3. Use Supabase pg_cron (requires more complex setup)

## What Happens Next

Once you add the GitHub Secrets:

✅ **Automated post publishing** - Posts scheduled in your app will automatically publish at their scheduled time
✅ **Token management** - OAuth tokens refresh automatically before expiring
✅ **Analytics tracking** - Engagement metrics fetch automatically for all published posts

Your SocialCraft AI automation is now fully operational!

## Need Help?

- Check workflow logs in the Actions tab
- Review edge function logs in Supabase Dashboard
- Test edge functions manually using the "Run workflow" button
- Verify database schema was updated (migration 004)

For more details on the edge functions themselves, see:
- `supabase/functions/post-scheduler/index.ts`
- `supabase/functions/token-refresh/index.ts`
- `supabase/functions/analytics-fetcher/index.ts`
