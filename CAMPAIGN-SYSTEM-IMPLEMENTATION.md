# SocialCraftAI - Campaign System Implementation

## Overview

This document summarizes the complete implementation of the unified Campaign Management system, consolidating Generator's output capabilities with a new Campaign Manager for multi-post planning, scheduling, and A/B testing.

---

## Phase 1: Foundation (Completed)

### Database Migration
**File:** `database-migration-phase1-campaigns.sql`

Created tables:
- **`brand_personas`** - Enhanced with `forbidden_words`, `example_posts`, `description`, `is_default`
- **`trend_cache`** - 24-hour cache for Grounding API results (saves $35/1000 requests)
- **`campaigns`** - Full campaign configuration with competitor analysis storage
- **`campaign_posts`** - Individual posts with A/B variation support

### Services Created
- **`brandPersonaService.ts`** - CRUD + prompt generation for personas
- **`trendCacheService.ts`** - Cache management for Trend Scout cost optimization
- **`geminiService.ts`** - Updated with Brand Persona and cache integration

### Components Created
- **`BrandPersonaSelector.tsx`** - Collapsible UI for persona selection/creation

### Configuration Updated
- **`pricing.ts`** - Added `trend_research`, `deep_analysis`, campaign limits per tier

---

## Phase 2: Generator + Campaign Manager (Completed)

### Files Modified

#### GeneratorView.tsx
- Added Brand Persona selector (collapsible, optional)
- Passes `selectedPersona` to `generateViralContent()`
- Shows active persona indicator when selected
- Added "Plan a Campaign" button in post-generation actions
- Passes trend data and persona to Campaign Manager via navigation

#### App.tsx
- Added Campaign Manager route (`/campaigns`, `/campaigns/:id`)
- Added Campaigns to navigation (desktop + mobile)
- Replaced Amplifier with Campaigns in primary nav
- Moved Academic Mode and Amplifier to secondary nav

### Files Created

#### CampaignManagerView.tsx
Complete campaign management interface with:

**Campaign List**
- Grid view of all campaigns with status badges
- Progress bars showing posts published
- Platform tags and date ranges
- Quick actions (View, Play, Pause, Archive)

**Create Campaign Wizard (3 Steps)**

*Step 1: Basic Info*
- Campaign name and theme/goal
- Content mix presets (Balanced, Authority Builder, Sales Focus, Community First)
- Brand persona selection

*Step 2: Platforms & Schedule*
- Multi-platform selection (Twitter, LinkedIn, Instagram, TikTok, Pinterest)
- Date range picker (start/end)
- Posting frequency (Daily, Every Other Day, Twice Weekly, Weekly)
- Competitor handles input (Pro+ only, gated)

*Step 3: Media & Review*
- A/B Variations toggle (2x posts)
- AI Images toggle (15 credits each)
- AI Video toggle (Pro+ only, 150 credits each)
- Cost estimate breakdown
- "Text First" notice explaining workflow
- Insufficient credits warning

**Plan Limits Enforced**
- Free: 1 campaign, 5 posts max
- Starter: 3 campaigns, 15 posts max
- Pro: 10 campaigns, 30 posts max, competitor analysis
- Agency: Unlimited campaigns, 100 posts max

#### campaignService.ts
Backend service for campaign operations:

**Campaign CRUD**
- `getAll()`, `getById()`, `create()`, `update()`, `delete()`
- `updateStatus()` for lifecycle management

**Post Management**
- `getPosts()`, `getPostsGrouped()` (by variation)
- `createPost()`, `updatePost()`, `deletePost()`, `deletePosts()`

**Text First Generation**
- `generateCampaignText()` - Generates all text content first
- `calculatePostSchedule()` - Distributes posts across dates/platforms
- `buildContentSource()` - Creates prompts based on content type
- `buildVariationSource()` - Creates A/B variation prompts

**Content Type Distribution**
- Educational, Promotional, Engagement percentages
- Automatically distributed across campaign duration

---

## User Flow

### Generator Flow
```
User enters content → (Optional) Selects Brand Persona → Configures platforms/tone
→ Generates content → Post-generation actions:
   - Plan a Campaign (navigates with data)
   - Refine in Amplifier
   - Create Visuals
```

### Campaign Flow
```
User clicks "New Campaign" → Wizard Step 1 (Name, Theme, Mix, Persona)
→ Step 2 (Platforms, Dates, Frequency, Competitors)
→ Step 3 (Variations, Images, Video, Cost Review)
→ "Create & Generate Text" → Text generated for all posts
→ User reviews/edits text → "Generate Visuals" for selected posts
→ Schedule/Publish
```

---

## Cost Controls Implemented

### Trend Cache (Phase 1)
- 24-hour TTL
- Query hash-based lookup
- Saves $0.035 per duplicate search

### Text First Workflow (Phase 2)
- Text generated first (~1 credit each)
- User reviews before committing to images
- Explicit cost confirmation before visual generation

### Tier-Based Gating
- Video locked for Free/Starter
- Competitor analysis locked for Free/Starter
- Campaign/post limits enforced per plan

### Cost Estimation UI
- Shows text/image/video credit breakdown
- Warns when estimated cost exceeds available credits
- Displays "Text First" notice for user education

---

## Navigation Structure

### Desktop Nav (Updated)
1. Generator
2. **Campaigns** (NEW)
3. Trend Scout
4. Media
5. Schedule
6. Drafts

### Mobile Nav (Updated)
Same order plus:
- Amplifier (secondary)
- Academic Mode (secondary)

---

## Database Schema Summary

### campaigns
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | Owner |
| name | TEXT | Campaign name |
| theme_goal | TEXT | Main message/goal |
| content_mix | JSONB | {educational, promotional, engagement} |
| target_platforms | TEXT[] | Selected platforms |
| brand_persona_id | UUID | FK to brand_personas |
| date_range_start | DATE | Campaign start |
| date_range_end | DATE | Campaign end |
| posting_frequency | TEXT | daily/every_other_day/twice_weekly/weekly |
| competitor_handles | TEXT[] | @handles for analysis |
| competitor_analysis_json | JSONB | Cached analysis |
| estimated_credits | INT | Pre-calculated cost |
| credits_used | INT | Actual spend |
| status | TEXT | draft/active/paused/completed/archived |

### campaign_posts
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| campaign_id | UUID | FK to campaigns |
| platform | TEXT | Target platform |
| content_type | TEXT | educational/promotional/engagement |
| status | TEXT | draft/text_generated/visuals_generated/scheduled/published |
| text_content | JSONB | GeneratedContent object |
| variation_type | TEXT | original/variation_a/variation_b |
| variation_group | UUID | Groups A/B variants |
| has_media | BOOLEAN | Whether media was generated |
| media_type | TEXT | image/video/carousel |
| scheduled_at | TIMESTAMPTZ | Planned publish time |
| predicted_engagement_score | INT | 0-100 prediction |
| text_credits_used | INT | Credits for text |
| media_credits_used | INT | Credits for visuals |

---

## Next Steps (Phase 3)

### Campaign Detail View
- Calendar visualization
- Post editing interface
- Bulk visual generation
- A/B performance comparison

### Performance Prediction
- Baseline predictions from training data (free)
- Deep analysis via Grounding (5 credits)

### Competitor Analysis
- Web search for competitor content
- Strategy recommendations
- Gap analysis

---

## Testing Instructions

1. **Run SQL Migration**
   ```
   Execute database-migration-phase1-campaigns.sql in Supabase
   ```

2. **Test Generator + Persona**
   - Open Generator
   - Expand "Brand Voice" section
   - Create a new persona
   - Generate content
   - Verify persona tone in output

3. **Test Campaign Creation**
   - Navigate to /campaigns
   - Click "New Campaign"
   - Complete all 3 wizard steps
   - Verify cost estimation
   - Create campaign (text will generate)

4. **Test Trend Caching**
   - Search a topic in Generator
   - Note console log "[TrendCache] Cache MISS"
   - Search same topic again
   - Note console log "[TrendCache] Cache HIT"
