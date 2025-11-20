# SocialCraft AI - Content Automation Requirements & Implementation Guide

## 📊 Current System Analysis

### Existing Edge Functions
1. **create-checkout-session** - Stripe payment initialization
2. **stripe-webhooks** - Handle Stripe payment events
3. **create-portal-session** - Customer billing portal access

### Missing Components for Full Automation
- [ ] **post-scheduler** edge function (publish scheduled posts)
- [ ] **analytics-fetcher** edge function (fetch post engagement data)
- [ ] **credential-refresh** edge function (refresh OAuth tokens)
- [ ] Platform API integrations
- [ ] User credential management UI
- [ ] Media upload/storage for images

---

## 🗄️ Database Inspection Steps

### Step 1: Run Inspection Script
1. Go to Supabase Dashboard → SQL Editor
2. Copy contents of `database-inspection.sql`
3. Run each query section and save results
4. Key things to check:
   - Does `scheduled_posts` table exist?
   - Does `trend_reports` table exist?
   - Does `user_api_credentials` table exist?
   - What RLS policies are in place?
   - Are there any scheduled posts ready to publish?

### Step 2: Create Missing Tables (if needed)
1. Review results from Step 1
2. If tables are missing, run `database-schema-missing-tables.sql`
3. Verify all tables were created successfully:
   ```sql
   SELECT table_name FROM information_schema.tables
   WHERE table_schema = 'public'
   ORDER BY table_name;
   ```

### Step 3: Verify Critical Data Flows
Run these queries to understand current state:

```sql
-- Check how many users have scheduled posts
SELECT COUNT(DISTINCT user_id) as users_with_scheduled_posts
FROM scheduled_posts;

-- Check posts by status
SELECT status, COUNT(*) as count
FROM scheduled_posts
GROUP BY status;

-- Check if any posts are overdue
SELECT COUNT(*) as overdue_posts
FROM scheduled_posts
WHERE status = 'scheduled'
  AND scheduled_at < NOW();

-- Check user activity
SELECT
    COUNT(DISTINCT tr.user_id) as users_with_reports,
    COUNT(tr.id) as total_reports,
    COUNT(DISTINCT sp.user_id) as users_with_posts,
    COUNT(sp.id) as total_posts
FROM trend_reports tr
FULL OUTER JOIN scheduled_posts sp ON tr.user_id = sp.user_id;
```

---

## 🔧 Implementation Roadmap

### Phase 1: Database Setup ✅
**Status:** Ready to verify

**Tasks:**
- [ ] Run `database-inspection.sql` to audit current schema
- [ ] Run `database-schema-missing-tables.sql` if tables are missing
- [ ] Verify RLS policies are active
- [ ] Test inserting sample scheduled_posts via frontend

**SQL to test insert:**
```sql
-- Insert a test scheduled post (as authenticated user)
INSERT INTO scheduled_posts (user_id, platform, content, scheduled_at)
VALUES (
    auth.uid(),
    'twitter',
    '{"text": "Test post", "hashtags": ["#test"], "image_prompt": null}'::jsonb,
    NOW() + INTERVAL '1 hour'
);
```

---

### Phase 2: Platform API Credentials Setup ⚠️
**Status:** Needs implementation

#### Required OAuth Apps

**LinkedIn OAuth App:**
- Create app: https://www.linkedin.com/developers/apps
- Permissions needed: `w_member_social`, `r_basicprofile`
- Redirect URI: `https://YOUR_PROJECT.supabase.co/auth/v1/callback`
- Save: Client ID, Client Secret

**Twitter/X OAuth App:**
- Create app: https://developer.twitter.com/en/portal/dashboard
- Permissions: Read and Write
- Authentication: OAuth 2.0
- Redirect URI: `https://YOUR_PROJECT.supabase.co/auth/v1/callback`
- Save: API Key, API Secret, Bearer Token

**Instagram Business Account:**
- Required: Facebook Business Page + Instagram Business Account
- Create app: https://developers.facebook.com/apps
- Add Instagram Basic Display API
- Permissions: `instagram_basic`, `instagram_content_publish`
- Save: App ID, App Secret, Access Token

**TikTok Developer Account:**
- Apply: https://developers.tiktok.com/
- Content Posting API (requires approval)
- Permissions: `video.upload`, `user.info.basic`
- Note: Most restrictive platform, may not be worth implementing initially

#### Credential Storage Strategy

**Option A: Store in `user_api_credentials` table (Recommended)**
```typescript
// Frontend: After OAuth flow
await supabase
  .from('user_api_credentials')
  .upsert({
    user_id: user.id,
    platform: 'linkedin',
    credentials: {
      access_token: 'encrypted_token',
      refresh_token: 'encrypted_refresh',
      expires_at: '2025-12-31T23:59:59Z'
    },
    is_active: true
  });
```

**Option B: Use Supabase Vault (More secure)**
```sql
-- Store in Supabase Vault
SELECT vault.create_secret('user_123_linkedin_token', 'actual_token_value');
```

---

### Phase 3: Post-Scheduler Edge Function 🚀
**Status:** Template ready, needs deployment

#### Deployment Steps

**1. Install Supabase CLI:**
```bash
npm install -g supabase
supabase login
supabase link --project-ref YOUR_PROJECT_REF
```

**2. Create function directory:**
```bash
mkdir -p supabase/functions/post-scheduler
cp supabase-edge-function-template.ts supabase/functions/post-scheduler/index.ts
```

**3. Deploy function:**
```bash
supabase functions deploy post-scheduler --no-verify-jwt
```

**4. Set environment variables:**
```bash
supabase secrets set SUPABASE_URL=https://YOUR_PROJECT.supabase.co
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

**5. Set up Cron Job in Supabase Dashboard:**
- Go to Database → Cron Jobs
- Create new job:
  - Name: `process-scheduled-posts`
  - Schedule: `*/15 * * * *` (every 15 minutes)
  - Command:
    ```sql
    SELECT
      net.http_post(
          url:='https://YOUR_PROJECT.supabase.co/functions/v1/post-scheduler',
          headers:=jsonb_build_object(
            'Content-Type','application/json',
            'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key')
          ),
          body:='{}'::jsonb
      ) as request_id;
    ```

**6. Test manually:**
```bash
curl -X POST https://YOUR_PROJECT.supabase.co/functions/v1/post-scheduler \
  -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json"
```

---

### Phase 4: Credential Management UI 💻
**Status:** Not started

**Components to build:**

**1. Settings page for platform connections:**
```typescript
// views/IntegrationsView.tsx
const platforms = [
  { name: 'LinkedIn', icon: Linkedin, connected: false },
  { name: 'Twitter', icon: Twitter, connected: false },
  { name: 'Instagram', icon: Instagram, connected: false }
];

// OAuth flow
const handleConnect = async (platform: string) => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: platform.toLowerCase(),
    options: {
      redirectTo: `${window.location.origin}/settings/integrations`,
      scopes: getPlatformScopes(platform)
    }
  });
};
```

**2. Connected accounts display:**
- Show which platforms are connected
- Display connection status (active/expired)
- Allow reconnection if token expired
- Add disconnect button

**3. Test posting:**
- "Send Test Post" button for each connected platform
- Verifies credentials are working
- Posts to platform immediately (not scheduled)

---

### Phase 5: Monitoring & Analytics 📈
**Status:** Not started

**Required components:**

**1. Analytics Dashboard:**
- Total posts scheduled
- Posts published successfully
- Failed posts with error messages
- Success rate by platform
- Popular posting times

**2. Email notifications:**
- Daily digest of published posts
- Alerts for failed posts
- Weekly performance summary

**3. Admin view (for debugging):**
```sql
-- View all scheduled posts status
SELECT
    user_id,
    platform,
    status,
    scheduled_at,
    error_message,
    created_at
FROM scheduled_posts
ORDER BY created_at DESC
LIMIT 100;

-- Failed posts summary
SELECT
    platform,
    COUNT(*) as failed_count,
    array_agg(DISTINCT error_message) as unique_errors
FROM scheduled_posts
WHERE status = 'failed'
  AND created_at >= NOW() - INTERVAL '7 days'
GROUP BY platform;
```

---

## 🔐 Security Considerations

### OAuth Token Security
1. **Never store tokens in localStorage** ✗
2. **Store encrypted in Supabase** ✓
3. **Use HTTPS only** ✓
4. **Implement token refresh logic** (needed)
5. **Add token expiration checks** (needed)

### Rate Limiting
Each platform has rate limits:
- **LinkedIn:** 100 posts/day per user
- **Twitter:** 300 posts/3 hours per app
- **Instagram:** 25 posts/day per user
- **TikTok:** Varies by account type

**Implement in edge function:**
```typescript
// Check rate limits before posting
const { count } = await supabase
  .from('scheduled_posts')
  .select('*', { count: 'exact' })
  .eq('user_id', userId)
  .eq('platform', 'linkedin')
  .eq('status', 'published')
  .gte('posted_at', new Date(Date.now() - 24*60*60*1000).toISOString());

if (count >= 100) {
  throw new Error('LinkedIn daily rate limit reached');
}
```

---

## 🧪 Testing Strategy

### Unit Tests
```typescript
// Test scheduled post creation
describe('Scheduled Posts', () => {
  it('should create scheduled post', async () => {
    const post = await createScheduledPost({
      platform: 'linkedin',
      content: { text: 'Test' },
      scheduledAt: new Date(Date.now() + 3600000)
    });
    expect(post.status).toBe('scheduled');
  });
});
```

### Integration Tests
1. **Test OAuth flows:** Can users connect accounts?
2. **Test scheduling:** Do posts save to database correctly?
3. **Test edge function:** Does post-scheduler process correctly?
4. **Test posting:** Can we actually post to platforms? (use test accounts)

### Manual Testing Checklist
- [ ] Schedule a post for 5 minutes from now
- [ ] Verify it appears in scheduled_posts table
- [ ] Wait for cron job to run (or trigger manually)
- [ ] Check post status changed to 'published'
- [ ] Verify post appeared on actual platform
- [ ] Check error handling (invalid credentials)
- [ ] Test rate limiting

---

## 📋 Implementation Priority

### High Priority (MVP)
1. ✅ Database schema verification
2. ⚠️ Twitter/X OAuth + posting (easiest to implement)
3. ⚠️ LinkedIn OAuth + posting (second easiest)
4. ⚠️ Deploy post-scheduler edge function
5. ⚠️ Build integrations settings page

### Medium Priority
6. Instagram OAuth + posting (requires Facebook setup)
7. Analytics fetching edge function
8. Failed post retry logic
9. Email notifications

### Low Priority
10. TikTok integration (complex approval process)
11. Advanced scheduling (time zone support, optimal posting times)
12. A/B testing for content variations
13. AI-powered scheduling suggestions

---

## 🚦 Next Steps

### Immediate Actions:
1. **Run `database-inspection.sql`** in Supabase SQL Editor
2. **Share results** so I can identify what's missing
3. **Run `database-schema-missing-tables.sql`** if needed
4. **Create Twitter OAuth app** (fastest to set up)
5. **Deploy post-scheduler edge function**

### Questions to Answer:
1. Do you have `scheduled_posts` and `trend_reports` tables already?
2. How many users currently have scheduled posts?
3. Which platform should we prioritize first? (recommend Twitter)
4. Do you have any existing OAuth apps set up?
5. What's your preferred testing timeline?

---

## 📞 Support Resources

- **Supabase Docs:** https://supabase.com/docs
- **LinkedIn API:** https://docs.microsoft.com/en-us/linkedin/
- **Twitter API:** https://developer.twitter.com/en/docs
- **Instagram API:** https://developers.facebook.com/docs/instagram-api
- **Edge Functions Guide:** https://supabase.com/docs/guides/functions
