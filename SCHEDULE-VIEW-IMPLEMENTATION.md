# SocialCraftAI - Enhanced Schedule View Implementation

## Overview

This document summarizes the implementation of the enhanced Schedule View with unified data sources, calendar view, filters, and bulk actions.

---

## Problem Statement

The original Schedule page had:
- Non-functional three-dot menu (no click handler)
- Non-functional filter button
- Only showed posts from `scheduled_posts` table
- No calendar view
- No bulk actions

---

## Solution: Unified Schedule View

### Architecture

```
Schedule Page
├── Unified Data (from 2 sources)
│   ├── scheduled_posts (Quick Posts from Generator)
│   └── campaign_posts (Campaign posts with scheduled_at)
├── Views
│   ├── List View (existing, enhanced)
│   └── Calendar View (new)
├── Filters
│   ├── By Platform
│   ├── By Status
│   └── By Source
└── Bulk Actions
    ├── Select All/None
    ├── Reschedule Selected
    ├── Delete Selected
    └── Export to CSV
```

---

## New Files

### 1. scheduleService.ts
**Location:** `services/scheduleService.ts`

**Types:**
```typescript
type ScheduleSource = 'quick_post' | 'campaign';
type ScheduleStatus = 'scheduled' | 'posted' | 'failed';

interface UnifiedScheduledPost {
    id: string;
    userId: string;
    source: ScheduleSource;
    sourceId?: string;          // campaign_id if from campaign
    sourceName?: string;        // campaign name
    platform: Platform;
    content: GeneratedContent;
    scheduledAt: string;
    status: ScheduleStatus;
    hasMedia: boolean;
    mediaUrl?: string;
    mediaType?: 'image' | 'video';
    createdAt: string;
    updatedAt?: string;
}

interface ScheduleFilters {
    platforms?: Platform[];
    status?: ScheduleStatus[];
    sources?: ScheduleSource[];
    dateFrom?: string;
    dateTo?: string;
}

interface ScheduleStats {
    total: number;
    scheduled: number;
    posted: number;
    failed: number;
    byPlatform: Record<string, number>;
    bySource: Record<string, number>;
    thisWeek: number;
    today: number;
}
```

**Functions:**
- `getUnifiedSchedule(userId, filters?)` - Fetch from both tables, merge, filter
- `getScheduleStats(userId)` - Get statistics
- `reschedulePost(postId, source, newDate)` - Reschedule single post
- `bulkReschedule(posts, options)` - Reschedule multiple posts
- `deleteScheduledPost(postId, source)` - Delete single post
- `bulkDeletePosts(posts)` - Delete multiple posts
- `updatePostStatus(postId, source, status)` - Mark as posted/failed
- `exportScheduleToCSV(posts)` - Generate CSV string
- `downloadScheduleCSV(posts, filename?)` - Trigger download

### 2. ScheduleCalendar.tsx
**Location:** `components/ScheduleCalendar.tsx`

Calendar component for schedule visualization:
- Month navigation (prev/next/today)
- Platform color coding
- Post pills with preview
- Campaign indicator (briefcase icon)
- Posted status (dimmed)
- Date selection
- Click handlers for posts and dates

### 3. ScheduleView.tsx (Updated)
**Location:** `views/ScheduleView.tsx`

Complete rewrite with:

**Stats Bar:**
- Total Scheduled
- Pending (scheduled status)
- Today's posts
- This week's posts

**Filter Panel:**
- Platform checkboxes (Twitter, LinkedIn, etc.)
- Status checkboxes (Scheduled, Posted, Failed)
- Source checkboxes (Quick Posts, Campaigns)
- Apply/Clear buttons

**Three-Dot Menu (Now Functional!):**
- Select All / Deselect All
- Reschedule Selected (opens modal)
- Delete Selected (opens modal)
- Export to CSV

**View Modes:**
- List View (default)
- Calendar View

**Post Cards:**
- Checkbox for selection
- Platform icon with color
- Campaign badge if from campaign
- Schedule date/time
- Content preview
- Status badge
- Media indicator
- Expand for more details
- "View Campaign" link if from campaign
- Delete button

**Modals:**
- Reschedule Modal: Date picker, optional time picker
- Delete Modal: Confirmation with count

---

## User Flows

### Viewing the Schedule

```
Open Schedule Page
→ See stats (Total, Pending, Today, This Week)
→ Toggle between List and Calendar views
→ Click date in calendar to filter to that day
→ Click post in calendar to see details
```

### Filtering Posts

```
Click Filter icon (funnel)
→ Filter panel expands
→ Check platforms (e.g., Twitter, LinkedIn)
→ Check status (e.g., Scheduled)
→ Check source (e.g., Campaigns only)
→ Click "Apply Filters"
→ List shows filtered results
→ Purple badge shows "Filters active"
→ Click X to clear filters
```

### Bulk Reschedule

```
Select posts (click checkboxes or use "Select All")
→ Click three-dot menu
→ Click "Reschedule Selected"
→ Modal opens
→ Pick new date
→ Optionally pick new time (leave blank to keep original times)
→ Click "Reschedule"
→ Posts updated, list refreshes
```

### Bulk Delete

```
Select posts
→ Click three-dot menu
→ Click "Delete Selected"
→ Confirmation modal shows count
→ Click "Delete"
→ Posts removed from both tables as needed
```

### Export Schedule

```
(Optional) Select specific posts
→ Click three-dot menu
→ Click "Export to CSV"
→ CSV file downloads
→ Contains: Platform, Content, Scheduled At, Status, Source, Has Media
```

---

## Integration with Campaigns

Campaign posts are seamlessly integrated:

| Feature | Quick Posts | Campaign Posts |
|---------|-------------|----------------|
| Source badge | None | "Campaign: [Name]" |
| View link | None | "View Campaign" button |
| Delete | Removes from scheduled_posts | Removes from campaign_posts |
| Reschedule | Updates scheduled_posts | Updates campaign_posts.scheduled_at |

---

## Database Queries

**Quick Posts Query:**
```sql
SELECT * FROM scheduled_posts
WHERE user_id = $1
ORDER BY scheduled_at ASC
```

**Campaign Posts Query:**
```sql
SELECT cp.*, c.id, c.name
FROM campaign_posts cp
LEFT JOIN campaigns c ON cp.campaign_id = c.id
WHERE cp.user_id = $1
AND cp.scheduled_at IS NOT NULL
ORDER BY cp.scheduled_at ASC
```

---

## File Summary

| File | Type | Description |
|------|------|-------------|
| `services/scheduleService.ts` | Service | Unified schedule data + bulk operations |
| `components/ScheduleCalendar.tsx` | Component | Calendar visualization |
| `views/ScheduleView.tsx` | View | Complete Schedule page |
| `services/index.ts` | Index | Added scheduleService export |

---

## Testing Checklist

### Basic Functionality
- [ ] Page loads without errors
- [ ] Stats display correctly
- [ ] Posts from scheduled_posts appear
- [ ] Posts from campaign_posts appear
- [ ] Campaign badge shows on campaign posts

### View Modes
- [ ] List view shows all posts
- [ ] Calendar view shows posts on correct dates
- [ ] Toggle between views works
- [ ] Click post in calendar → shows in list

### Filters
- [ ] Filter panel opens/closes
- [ ] Platform filter works
- [ ] Status filter works
- [ ] Source filter works
- [ ] Clear filters works
- [ ] Filter badge shows when active

### Selection
- [ ] Click checkbox selects post
- [ ] "Select All" selects all visible
- [ ] Selection count shows

### Bulk Actions
- [ ] Three-dot menu opens
- [ ] Reschedule modal opens
- [ ] Date picker works
- [ ] Reschedule updates posts
- [ ] Delete modal opens
- [ ] Delete removes posts
- [ ] Export CSV downloads file

### Navigation
- [ ] "View Campaign" link works
- [ ] "Create Content" button works
- [ ] "View Campaigns" button works
- [ ] Refresh button reloads data

---

## Implementation Complete ✅

The Schedule page now has:
1. ✅ Unified data from both post sources
2. ✅ Functional three-dot menu with bulk actions
3. ✅ Functional filter button with platform/status/source filters
4. ✅ Calendar view toggle
5. ✅ Export to CSV
6. ✅ Reschedule selected posts
7. ✅ Delete selected posts
8. ✅ Campaign integration with "View Campaign" links
