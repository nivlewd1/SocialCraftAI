# Post-Scheduler Edge Function Deployment Guide

## Prerequisites
- Supabase CLI installed
- Project linked to Supabase
- OAuth apps created (Twitter, LinkedIn, Instagram) ✅

---

## Step 1: Install Supabase CLI

```bash
npm install -g supabase
```

Verify installation:
```bash
supabase --version
```

---

## Step 2: Login and Link Project

```bash
# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref YOUR_PROJECT_REF
```

**Find your project ref:**
- Go to: https://supabase.com/dashboard/project/YOUR_PROJECT/settings/general
- Copy the "Reference ID"

---

## Step 3: Deploy Edge Function

```bash
# Deploy the post-scheduler function
supabase functions deploy post-scheduler --no-verify-jwt

# You should see:
# ✓ Deployed Function post-scheduler
```

---

## Step 4: Set Environment Variables

The edge function needs these secrets:

```bash
# Get your service role key from:
# https://supabase.com/dashboard/project/YOUR_PROJECT/settings/api

# Set the secrets
supabase secrets set SUPABASE_URL=https://YOUR_PROJECT.supabase.co
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

**Verify secrets:**
```bash
supabase secrets list
```

---

## Step 5: Test Manually

Create a test scheduled post:

```sql
-- Run in Supabase SQL Editor
INSERT INTO scheduled_posts (
    user_id,
    platform,
    content,
    scheduled_at,
    status
) VALUES (
    (SELECT id FROM auth.users LIMIT 1),
    'twitter',
    '{"text": "🚀 Testing automated posting from SocialCraft AI! This is a test post. #automation #ai"}'::jsonb,
    NOW() + INTERVAL '5 minutes',
    'scheduled'
);
```

**Trigger the edge function manually:**

```bash
curl -X POST https://YOUR_PROJECT.supabase.co/functions/v1/post-scheduler \
  -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json"
```

**Expected response:**
```json
{
  "total": 1,
  "published": 1,
  "failed": 0,
  "errors": []
}
```

---

## Step 6: Set Up Cron Job

### Option A: Supabase pg_cron (Recommended)

1. Go to: Database → Cron Jobs in Supabase Dashboard
2. Click "Create new cron job"
3. Configure:
   - **Name:** `process-scheduled-posts`
   - **Schedule:** `*/15 * * * *` (every 15 minutes)
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
4. Click "Create"

**Verify cron job:**
```sql
SELECT * FROM cron.job;
```

### Option B: External Cron Service

Use a service like:
- **Cron-job.org** (free, simple)
- **EasyCron** (free tier available)
- **Your own server cron**

Configure to hit:
```
POST https://YOUR_PROJECT.supabase.co/functions/v1/post-scheduler
Authorization: Bearer YOUR_SERVICE_ROLE_KEY
```

---

## Step 7: Monitor Function Logs

**View logs in real-time:**
```bash
supabase functions logs post-scheduler --follow
```

**Or in Supabase Dashboard:**
- Go to: Edge Functions → post-scheduler → Logs

**Look for:**
- `🚀 Post-scheduler starting...`
- `📬 Found X posts to publish`
- `✅ Published post [id] to [platform]`
- `❌ Failed post [id]: [error]`

---

## Troubleshooting

### Issue: "No connected account found"

**Check connected_accounts table:**
```sql
SELECT
    user_id,
    platform,
    is_active,
    CASE
        WHEN credentials IS NOT NULL THEN 'Has credentials'
        ELSE 'Missing credentials'
    END as status
FROM connected_accounts;
```

**If empty:** Users need to connect their social media accounts first (build OAuth UI)

---

### Issue: "LinkedIn/Twitter API error"

**Verify OAuth credentials in connected_accounts:**
```sql
SELECT
    platform,
    credentials->>'access_token' IS NOT NULL as has_token,
    credentials->>'expires_at' as expires_at
FROM connected_accounts
WHERE user_id = 'YOUR_USER_ID';
```

**Common causes:**
1. **Token expired** - Need to implement refresh logic
2. **Invalid scope** - Check OAuth app permissions
3. **Rate limit** - Too many posts too quickly

---

### Issue: "Function times out"

**Reduce batch size:**

Edit `index.ts` line 194:
```typescript
.limit(50);  // Change to 10 for testing
```

Redeploy:
```bash
supabase functions deploy post-scheduler --no-verify-jwt
```

---

## Rate Limits & Best Practices

### Platform Limits:
- **Twitter:** 300 posts per 3 hours (app-level)
- **LinkedIn:** ~100 posts per day (user-level)
- **Instagram:** 25 posts per day (user-level)
- **TikTok:** Varies by account type

### Recommended Cron Schedule:

**Light usage (< 10 posts/day):**
- `0 9,12,15,18 * * *` (4 times daily at 9am, 12pm, 3pm, 6pm)

**Medium usage (10-50 posts/day):**
- `*/30 * * * *` (every 30 minutes)

**Heavy usage (50+ posts/day):**
- `*/15 * * * *` (every 15 minutes)

---

## Security Checklist

- [ ] Service role key stored in Supabase secrets (not hardcoded)
- [ ] RLS policies enabled on all tables
- [ ] OAuth tokens encrypted in connected_accounts
- [ ] HTTPS only for all API calls
- [ ] Cron job uses secure authorization header
- [ ] Function logs don't expose tokens

---

## Next Steps After Deployment

1. **Build OAuth Connection UI** (urgent)
   - Settings page with "Connect [Platform]" buttons
   - OAuth callback handling
   - Display connection status

2. **Add Token Refresh Logic** (important)
   - Most tokens expire in 2-24 hours
   - Edge function to refresh tokens before expiry
   - Update connected_accounts.credentials

3. **Add Analytics** (nice-to-have)
   - Track success/failure rates
   - Monitor posting times
   - Platform performance comparison

4. **User Notifications** (nice-to-have)
   - Email when posts publish successfully
   - Alert when posts fail
   - Weekly digest

---

## Testing Checklist

After deployment, test:

- [ ] Edge function deploys without errors
- [ ] Manual trigger via curl works
- [ ] Cron job runs on schedule
- [ ] Test post publishes to Twitter
- [ ] Test post publishes to LinkedIn
- [ ] Test post publishes to Instagram
- [ ] Failed post updates status correctly
- [ ] Error messages are informative
- [ ] Logs show in Supabase dashboard

---

## Support

**Supabase Docs:**
- Edge Functions: https://supabase.com/docs/guides/functions
- Cron Jobs: https://supabase.com/docs/guides/database/extensions/pg_cron

**Platform API Docs:**
- Twitter API: https://developer.twitter.com/en/docs
- LinkedIn API: https://learn.microsoft.com/en-us/linkedin/
- Instagram API: https://developers.facebook.com/docs/instagram-api

**SocialCraft AI Files:**
- `database-inspection.sql` - Audit database
- `supabase/functions/post-scheduler/index.ts` - Edge function code
- `AUTOMATION-REQUIREMENTS.md` - Full technical spec
