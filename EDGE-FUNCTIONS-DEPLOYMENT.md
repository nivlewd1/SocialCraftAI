# Edge Functions - Complete Deployment Guide

## 📦 Available Edge Functions

### 1. **post-scheduler** (Required)
Automatically publishes scheduled posts to social media platforms.
- **Location:** `supabase/functions/post-scheduler/index.ts`
- **Schedule:** Every 15 minutes
- **Purpose:** Process scheduled_posts and publish to platforms

### 2. **token-refresh** (Highly Recommended)
Automatically refreshes expiring OAuth tokens.
- **Location:** `supabase/functions/token-refresh/index.ts`
- **Schedule:** Daily at 3:00 AM
- **Purpose:** Keep OAuth tokens valid before they expire

### 3. **analytics-fetcher** (Optional)
Fetches engagement metrics from published posts.
- **Location:** `supabase/functions/analytics-fetcher/index.ts`
- **Schedule:** Daily at 6:00 AM
- **Purpose:** Collect likes, comments, shares, impressions

---

## 🚀 Quick Deployment (All Functions)

### Step 1: Install & Setup Supabase CLI

```bash
# Install globally
npm install -g supabase

# Login
supabase login

# Link to your project
cd /home/user/SocialCraftAI
supabase link --project-ref YOUR_PROJECT_REF
```

### Step 2: Deploy All Functions

```bash
# Deploy post-scheduler (required)
supabase functions deploy post-scheduler --no-verify-jwt

# Deploy token-refresh (recommended)
supabase functions deploy token-refresh --no-verify-jwt

# Deploy analytics-fetcher (optional)
supabase functions deploy analytics-fetcher --no-verify-jwt
```

### Step 3: Set Shared Secrets

```bash
# Required for all functions
supabase secrets set SUPABASE_URL=https://YOUR_PROJECT.supabase.co
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Required for token-refresh (get these from your OAuth app settings)
supabase secrets set LINKEDIN_CLIENT_ID=your_linkedin_client_id
supabase secrets set LINKEDIN_CLIENT_SECRET=your_linkedin_client_secret
supabase secrets set TWITTER_CLIENT_ID=your_twitter_client_id
supabase secrets set TWITTER_CLIENT_SECRET=your_twitter_client_secret

# Verify all secrets
supabase secrets list
```

**Get OAuth credentials from:**
- **LinkedIn:** https://www.linkedin.com/developers/apps → Your App → Auth
- **Twitter:** https://developer.twitter.com/en/portal/dashboard → Your App → Keys and tokens

---

## ⏰ Set Up Cron Jobs

### Cron Job 1: post-scheduler (Every 15 minutes)

**Dashboard → Database → Cron Jobs → Create:**

- **Name:** `process-scheduled-posts`
- **Schedule:** `*/15 * * * *`
- **Command:**
```sql
SELECT
  net.http_post(
      url:='https://YOUR_PROJECT.supabase.co/functions/v1/post-scheduler',
      headers:=jsonb_build_object(
        'Content-Type','application/json',
        'Authorization', 'Bearer YOUR_SERVICE_ROLE_KEY'
      ),
      body:='{}'::jsonb
  ) as request_id;
```

### Cron Job 2: token-refresh (Daily at 3:00 AM)

**Dashboard → Database → Cron Jobs → Create:**

- **Name:** `refresh-expiring-tokens`
- **Schedule:** `0 3 * * *`
- **Command:**
```sql
SELECT
  net.http_post(
      url:='https://YOUR_PROJECT.supabase.co/functions/v1/token-refresh',
      headers:=jsonb_build_object(
        'Content-Type','application/json',
        'Authorization', 'Bearer YOUR_SERVICE_ROLE_KEY'
      ),
      body:='{}'::jsonb
  ) as request_id;
```

### Cron Job 3: analytics-fetcher (Daily at 6:00 AM)

**Dashboard → Database → Cron Jobs → Create:**

- **Name:** `fetch-post-analytics`
- **Schedule:** `0 6 * * *`
- **Command:**
```sql
SELECT
  net.http_post(
      url:='https://YOUR_PROJECT.supabase.co/functions/v1/analytics-fetcher',
      headers:=jsonb_build_object(
        'Content-Type','application/json',
        'Authorization', 'Bearer YOUR_SERVICE_ROLE_KEY'
      ),
      body:='{}'::jsonb
  ) as request_id;
```

**Verify cron jobs:**
```sql
SELECT jobname, schedule, active FROM cron.job ORDER BY jobid DESC;
```

---

## 🧪 Testing Each Function

### Test 1: post-scheduler

```bash
# Create a test post first (in SQL Editor)
INSERT INTO scheduled_posts (user_id, platform, content, scheduled_at, status)
VALUES (
    (SELECT id FROM auth.users LIMIT 1),
    'linkedin',
    '{"text": "Test post from SocialCraft AI 🚀"}'::jsonb,
    NOW() - INTERVAL '1 minute',
    'scheduled'
);

# Trigger function manually
curl -X POST https://YOUR_PROJECT.supabase.co/functions/v1/post-scheduler \
  -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json"

# Expected response:
# {"total": 1, "published": 1, "failed": 0, "errors": []}

# Verify in database
SELECT id, status, posted_at, platform_post_id FROM scheduled_posts
WHERE status = 'published' ORDER BY posted_at DESC LIMIT 1;
```

### Test 2: token-refresh

```bash
# Trigger function manually
curl -X POST https://YOUR_PROJECT.supabase.co/functions/v1/token-refresh \
  -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json"

# Expected response:
# {"total": X, "refreshed": X, "failed": 0, "errors": []}

# Verify tokens were refreshed
SELECT platform, token_expires_at, updated_at
FROM connected_accounts
WHERE is_active = true
ORDER BY updated_at DESC;
```

### Test 3: analytics-fetcher

```bash
# First, make sure you have published posts
SELECT COUNT(*) FROM scheduled_posts WHERE status = 'published';

# Trigger function manually
curl -X POST https://YOUR_PROJECT.supabase.co/functions/v1/analytics-fetcher \
  -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json"

# Expected response:
# {"total": X, "fetched": X, "failed": 0, "errors": []}

# Verify analytics were stored
SELECT * FROM analytics_cache ORDER BY fetched_at DESC LIMIT 5;
```

---

## 📊 Monitoring

### View Function Logs

```bash
# Watch logs in real-time
supabase functions logs post-scheduler --follow
supabase functions logs token-refresh --follow
supabase functions logs analytics-fetcher --follow

# View recent logs
supabase functions logs post-scheduler
```

### Check Function Status

**Dashboard → Edge Functions:**
- Click each function
- View "Invocations" chart
- Check "Logs" tab for errors
- Monitor "Response time"

### Monitor Cron Job Execution

```sql
-- Check when cron jobs last ran
SELECT
    jobname,
    last_run_start_time,
    last_run_end_time,
    last_run_status
FROM cron.job_run_details
ORDER BY last_run_start_time DESC
LIMIT 10;
```

---

## 🔧 Troubleshooting

### Issue: "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY"

**Solution:**
```bash
# Set the secrets
supabase secrets set SUPABASE_URL=https://YOUR_PROJECT.supabase.co
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Redeploy the function
supabase functions deploy post-scheduler --no-verify-jwt
```

### Issue: "LinkedIn/Twitter token refresh failed"

**Solution:**
```bash
# Ensure OAuth credentials are set
supabase secrets set LINKEDIN_CLIENT_ID=your_client_id
supabase secrets set LINKEDIN_CLIENT_SECRET=your_client_secret
supabase secrets set TWITTER_CLIENT_ID=your_client_id
supabase secrets set TWITTER_CLIENT_SECRET=your_client_secret

# Redeploy token-refresh
supabase functions deploy token-refresh --no-verify-jwt
```

### Issue: "Function times out"

**Solution:**
1. Reduce batch size in function code
2. Check if API endpoints are slow
3. Increase function timeout (Dashboard → Edge Functions → Settings)

### Issue: "No posts to publish" but posts exist

**Check:**
```sql
-- Are there scheduled posts ready?
SELECT * FROM posts_ready_to_publish;

-- Are connected accounts active?
SELECT * FROM connected_accounts_summary;

-- Are tokens expired?
SELECT platform, token_expires_at, token_expires_at < NOW() as is_expired
FROM connected_accounts;
```

---

## 📈 Performance Optimization

### Recommended Schedules by Usage:

**Light usage (< 10 posts/day):**
- post-scheduler: `0 9,12,15,18 * * *` (4x daily)
- token-refresh: `0 3 * * *` (daily)
- analytics-fetcher: `0 6 * * 1` (weekly)

**Medium usage (10-50 posts/day):**
- post-scheduler: `*/30 * * * *` (every 30 min)
- token-refresh: `0 3 * * *` (daily)
- analytics-fetcher: `0 6 * * *` (daily)

**Heavy usage (50+ posts/day):**
- post-scheduler: `*/15 * * * *` (every 15 min)
- token-refresh: `0 */12 * * *` (every 12 hours)
- analytics-fetcher: `0 */6 * * *` (every 6 hours)

### Reduce Costs:

1. **Disable analytics-fetcher** if you don't need metrics
2. **Increase post-scheduler interval** during low-traffic hours
3. **Use on-demand triggers** instead of cron (call via API when needed)

---

## 🔒 Security Best Practices

- ✅ All secrets stored in Supabase Secrets (not hardcoded)
- ✅ Service role key never exposed to frontend
- ✅ Functions use `--no-verify-jwt` (internal cron only)
- ✅ OAuth tokens encrypted at rest in database
- ✅ RLS policies enabled on all tables
- ✅ HTTPS-only communication with platform APIs

---

## 📋 Deployment Checklist

### Required (for automated posting):
- [ ] Database migrations run (`platform_post_id`, `is_active` added)
- [ ] post-scheduler deployed
- [ ] SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY set
- [ ] post-scheduler cron job created (every 15 min)
- [ ] At least one OAuth connection active (LinkedIn/Twitter/Instagram)
- [ ] Test post successfully published

### Recommended (for reliability):
- [ ] token-refresh deployed
- [ ] LinkedIn and Twitter OAuth credentials set
- [ ] token-refresh cron job created (daily)
- [ ] Token refresh tested successfully

### Optional (for analytics):
- [ ] analytics_cache table exists
- [ ] analytics-fetcher deployed
- [ ] analytics-fetcher cron job created (daily)
- [ ] Analytics data being collected

---

## 🎯 Success Metrics

After deployment, monitor:

- **Posting Success Rate:** Should be > 95%
  ```sql
  SELECT
      COUNT(*) FILTER (WHERE status = 'published') * 100.0 / COUNT(*) as success_rate
  FROM scheduled_posts
  WHERE created_at >= NOW() - INTERVAL '7 days';
  ```

- **Token Refresh Rate:** Should be 100%
  ```sql
  SELECT COUNT(*) as active_tokens
  FROM connected_accounts
  WHERE is_active = true AND token_expires_at > NOW();
  ```

- **Analytics Coverage:** Percentage of posts with metrics
  ```sql
  SELECT
      COUNT(DISTINCT ac.scheduled_post_id) * 100.0 / COUNT(DISTINCT sp.id) as coverage
  FROM scheduled_posts sp
  LEFT JOIN analytics_cache ac ON sp.id = ac.scheduled_post_id
  WHERE sp.status = 'published'
    AND sp.posted_at >= NOW() - INTERVAL '7 days';
  ```

---

## 📞 Support

**Documentation:**
- Edge Functions: https://supabase.com/docs/guides/functions
- Cron Jobs: https://supabase.com/docs/guides/database/extensions/pg_cron
- OAuth Setup: See `AUTOMATION-REQUIREMENTS.md`

**SocialCraft AI Files:**
- `supabase/functions/post-scheduler/index.ts`
- `supabase/functions/token-refresh/index.ts`
- `supabase/functions/analytics-fetcher/index.ts`
- `database-migrations.sql`
- `DEPLOYMENT-GUIDE.md`

**Common Commands:**
```bash
# View all functions
supabase functions list

# View function details
supabase functions inspect post-scheduler

# Delete a function
supabase functions delete analytics-fetcher

# View all secrets
supabase secrets list

# Delete a secret
supabase secrets unset OLD_SECRET_NAME
```
