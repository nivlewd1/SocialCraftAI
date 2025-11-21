# Recurring Posts Feature

Automate your social media posting with recurring schedules. Set it once, post forever!

## Overview

Recurring posts allow users to set up automatic posting frequencies instead of manually scheduling each individual post. Perfect for:

- **Daily motivational quotes** (e.g., "Every day at 9 AM")
- **Weekly tips** (e.g., "Every Monday, Wednesday, Friday at 2 PM")
- **Monthly newsletters** (e.g., "1st and 15th of each month at 10 AM")
- **Regular content series** (e.g., "#ThrowbackThursday every Thursday at 3 PM")

## How It Works

### 1. User Creates a Recurring Post

Users define a content template and frequency:

```typescript
{
  title: "Daily Motivation",
  content: {
    text: "Start your day right! 💪 #Motivation #MondayVibes",
    // Optional: hashtags, image_url
  },
  frequency: "daily",  // or "weekly", "monthly"
  post_time: "09:00",  // UTC time
  platforms: ["twitter", "linkedin"],
  is_active: true
}
```

### 2. System Generates Scheduled Posts

The `recurring-post-generator` edge function runs daily at 1 AM UTC and:

1. Finds all active recurring posts
2. Generates `scheduled_posts` entries for the next 14 days
3. Avoids creating duplicates
4. Respects start/end dates

### 3. Posts Publish Automatically

The existing `post-scheduler` edge function (runs every 5 minutes) publishes the generated scheduled posts at their scheduled times.

## Database Schema

### `recurring_posts` Table

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `user_id` | UUID | User who created this |
| `title` | TEXT | Descriptive name (e.g., "Daily Tips") |
| `content` | JSONB | Post content (same format as `scheduled_posts.content`) |
| `frequency` | TEXT | `'daily'`, `'weekly'`, `'monthly'`, `'custom'` |
| `days_of_week` | INTEGER[] | For weekly: `[1, 3, 5]` = Mon, Wed, Fri (1=Mon, 7=Sun) |
| `days_of_month` | INTEGER[] | For monthly: `[1, 15]` = 1st and 15th |
| `post_time` | TIME | Time of day to post (UTC) |
| `platforms` | TEXT[] | Which platforms: `['twitter', 'linkedin', 'instagram']` |
| `is_active` | BOOLEAN | Enable/disable without deleting |
| `start_date` | DATE | Optional: When to start recurring schedule |
| `end_date` | DATE | Optional: When to stop recurring schedule |
| `last_generated_at` | TIMESTAMPTZ | When we last generated posts from this rule |
| `next_post_date` | TIMESTAMPTZ | Calculated next post date (for display) |

### `scheduled_posts` Addition

New column:
- `recurring_post_id` (UUID): Links back to the recurring post that generated this

## Creating Recurring Posts

### Example 1: Daily Posts

Post every day at 9 AM UTC:

```sql
INSERT INTO recurring_posts (
  user_id,
  title,
  content,
  frequency,
  post_time,
  platforms,
  is_active
) VALUES (
  'user-uuid-here',
  'Daily Motivation',
  '{"text": "Good morning! Start your day with purpose. #Motivation"}',
  'daily',
  '09:00',
  ARRAY['twitter', 'linkedin'],
  true
);
```

### Example 2: Weekly Posts (Mon, Wed, Fri)

Post every Monday, Wednesday, and Friday at 2 PM UTC:

```sql
INSERT INTO recurring_posts (
  user_id,
  title,
  content,
  frequency,
  days_of_week,
  post_time,
  platforms,
  is_active
) VALUES (
  'user-uuid-here',
  'Weekly Tips',
  '{"text": "Pro tip: Consistency beats perfection. #TipOfTheDay"}',
  'weekly',
  ARRAY[1, 3, 5],  -- 1=Monday, 3=Wednesday, 5=Friday
  '14:00',
  ARRAY['linkedin'],
  true
);
```

### Example 3: Monthly Posts (1st and 15th)

Post on the 1st and 15th of each month at 10 AM UTC:

```sql
INSERT INTO recurring_posts (
  user_id,
  title,
  content,
  frequency,
  days_of_month,
  post_time,
  platforms,
  is_active
) VALUES (
  'user-uuid-here',
  'Monthly Newsletter',
  '{"text": "Our monthly newsletter is out! Check it out: [link] #Newsletter"}',
  'monthly',
  ARRAY[1, 15],  -- 1st and 15th
  '10:00',
  ARRAY['twitter', 'linkedin', 'instagram'],
  true
);
```

### Example 4: Time-Limited Recurring Posts

Post daily during a campaign (Jan 1 - Jan 31):

```sql
INSERT INTO recurring_posts (
  user_id,
  title,
  content,
  frequency,
  post_time,
  platforms,
  start_date,
  end_date,
  is_active
) VALUES (
  'user-uuid-here',
  'January Campaign',
  '{"text": "New Year, New Goals! Join our January challenge. #NewYear2025"}',
  'daily',
  '12:00',
  ARRAY['twitter'],
  '2025-01-01',
  '2025-01-31',
  true
);
```

## Day of Week Reference

For `days_of_week` array:

| Day | Value |
|-----|-------|
| Monday | 1 |
| Tuesday | 2 |
| Wednesday | 3 |
| Thursday | 4 |
| Friday | 5 |
| Saturday | 6 |
| Sunday | 7 |

Example: `[1, 2, 3, 4, 5]` = Weekdays (Mon-Fri)

## Managing Recurring Posts

### Pause a Recurring Post

```sql
UPDATE recurring_posts
SET is_active = false
WHERE id = 'recurring-post-uuid';
```

This stops generating new posts but doesn't delete already-scheduled posts.

### Resume a Recurring Post

```sql
UPDATE recurring_posts
SET is_active = true
WHERE id = 'recurring-post-uuid';
```

### Delete a Recurring Post

```sql
DELETE FROM recurring_posts
WHERE id = 'recurring-post-uuid';
```

**Note:** This will:
- Stop generating new posts
- Set `recurring_post_id = NULL` on already-scheduled posts
- Already-scheduled posts will still publish unless manually deleted

### Modify a Recurring Post

```sql
UPDATE recurring_posts
SET
  content = '{"text": "Updated content here"}',
  post_time = '15:00',
  platforms = ARRAY['linkedin', 'twitter']
WHERE id = 'recurring-post-uuid';
```

Changes apply to **future generated posts** only. Already-scheduled posts remain unchanged.

## Automation Schedule

| Edge Function | Schedule | Purpose |
|---------------|----------|---------|
| `recurring-post-generator` | Daily at 1 AM UTC | Generates scheduled posts for next 14 days |
| `post-scheduler` | Every 5 minutes | Publishes scheduled posts at their time |
| `token-refresh` | Daily at 2 AM UTC | Refreshes expiring OAuth tokens |
| `analytics-fetcher` | Hourly | Fetches engagement metrics |

## Frontend Integration

### Creating a Recurring Post (React Example)

```typescript
import { supabase } from './supabaseClient';

async function createRecurringPost(data) {
  const { data: recurringPost, error } = await supabase
    .from('recurring_posts')
    .insert({
      user_id: user.id,
      title: data.title,
      content: {
        text: data.text,
        hashtags: data.hashtags,
        image_url: data.imageUrl,
      },
      frequency: data.frequency, // 'daily', 'weekly', 'monthly'
      days_of_week: data.frequency === 'weekly' ? data.selectedDays : null,
      days_of_month: data.frequency === 'monthly' ? data.selectedDates : null,
      post_time: data.time, // '09:00'
      platforms: data.selectedPlatforms,
      start_date: data.startDate,
      end_date: data.endDate,
      is_active: true,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating recurring post:', error);
    return null;
  }

  return recurringPost;
}
```

### Fetching User's Recurring Posts

```typescript
async function getUserRecurringPosts(userId) {
  const { data, error } = await supabase
    .from('recurring_posts')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  return data;
}
```

### Viewing Generated Posts

```typescript
async function getGeneratedPosts(recurringPostId) {
  const { data, error } = await supabase
    .from('scheduled_posts')
    .select('*')
    .eq('recurring_post_id', recurringPostId)
    .order('scheduled_at', { ascending: true });

  return data;
}
```

## Important Notes

### 1. Time Zone

- All times are stored in **UTC**
- Frontend should convert to user's local timezone for display
- Users should be aware their "9 AM" might mean "9 AM UTC", not local time

### 2. Generated Posts Are Independent

Once a `scheduled_post` is generated from a recurring rule:
- It can be edited independently
- It can be deleted independently
- Changing the recurring rule doesn't affect already-generated posts

### 3. Duplicate Prevention

The system automatically prevents creating duplicate posts for the same:
- `recurring_post_id`
- `scheduled_at` timestamp
- `platform`

### 4. 14-Day Generation Window

The generator creates posts 14 days in advance to ensure:
- Always have content queued
- Buffer for system downtime
- Users can review upcoming posts

### 5. Rate Limiting Still Applies

Even with recurring posts, platform rate limits are enforced:
- Twitter: 100 posts/24h (or 17 for free tier)
- LinkedIn: 10 posts/24h (personal)
- Instagram: 100 posts/24h

If you schedule too many posts, some will be marked as failed due to rate limits.

## Deployment

### 1. Apply Database Migration

```bash
# Apply the recurring_posts migration
supabase db push
```

### 2. Deploy Edge Function

```bash
# Deploy the recurring post generator
supabase functions deploy recurring-post-generator --no-verify-jwt
```

### 3. Verify GitHub Actions

The workflow has been updated to include the recurring post generator. It runs daily at 1 AM UTC.

Check: **Actions** tab → **Edge Functions Scheduler** → Should see "Recurring Post Generator" job

### 4. Test Manually

1. Create a test recurring post in the database
2. Go to **Actions** → **Edge Functions Scheduler** → **Run workflow**
3. Select "recurring-post-generator"
4. Check the logs to see posts being generated
5. Verify `scheduled_posts` table has new entries

## Troubleshooting

### No Posts Being Generated

**Check:**
1. Is `is_active = true`?
2. Is `end_date` in the future (or NULL)?
3. Does the frequency match days (weekly needs `days_of_week`, monthly needs `days_of_month`)?
4. Check edge function logs in Supabase Dashboard → Edge Functions → recurring-post-generator → Logs

### Posts Not Publishing

**Remember:** Generating posts and publishing posts are separate:
- `recurring-post-generator` creates `scheduled_posts` entries
- `post-scheduler` publishes those entries at their scheduled time

If posts are generated but not publishing, check the `post-scheduler` edge function.

### Too Many Posts Generated

Adjust the generation window in the edge function:
```typescript
// In recurring-post-generator/index.ts
calculateNextDates(..., 14); // Change from 14 to 7 days
```

## Future Enhancements

Possible improvements:
- **Content variations**: Rotate through multiple content templates
- **AI-generated content**: Use AI to create unique posts each time
- **Smart scheduling**: Optimal times based on engagement data
- **Conditional posting**: Skip holidays or specific dates
- **Multi-timezone support**: Schedule in user's local time

## Summary

✅ **Set it and forget it** - Create once, post automatically
✅ **Flexible frequencies** - Daily, weekly, monthly, or custom
✅ **Multi-platform** - Post to Twitter, LinkedIn, Instagram simultaneously
✅ **Full control** - Pause, resume, edit, or delete anytime
✅ **Independent posts** - Generated posts can be edited individually

Your social media automation just got a whole lot more powerful! 🚀
