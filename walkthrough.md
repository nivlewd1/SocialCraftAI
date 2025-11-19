# SocialCraft AI - UI/UX Redesign & Feature Walkthrough

## Overview
This update brings a significant visual overhaul to SocialCraft AI, introducing a modern, glassmorphic design system with a "Sage Green & Terracotta" palette. It also integrates the new "Trend Scout Agent" and "Brand Amplifier" features, along with a comprehensive documentation update.

## Key Changes

### 1. Visual Overhaul
- **Design System:** Implemented a new design system in `index.css` featuring:
    - **Colors:** Sage Green (`#8B9A8B`), Terracotta (`#C4A484`), Warm Gray (`#F8F6F3`), Deep Charcoal (`#2C2C2C`).
    - **Typography:** Inter (Sans) and Manrope (Display).
    - **Glassmorphism:** `glass-card` and `glass-panel` utility classes for a premium feel.
    - **Animations:** `animate-float`, `animate-fade-in`, and smooth transitions using `framer-motion`.
- **Layout:** Updated `App.tsx` with `AnimatePresence` for smooth page transitions.
- **Components:**
    - **GeneratorView:** Completely redesigned with a step-by-step flow, micro-interactions, and animated transitions.
    - **BrandAmplifier:** Updated with the new design system and "Schedule All" functionality.
    - **DocsView:** Comprehensive, easy-to-navigate documentation with a sidebar and search.

### 2. New Features
- **Trend Scout Agent:** (`/trends-agent`)
    - Research real-time trends for a specific niche.
    - Generates a `TrendReport` using Google Gemini.
- **Brand Amplifier:** (`/amplifier`)
    - Takes a `TrendReport` and a `BrandPersona`.
    - Generates platform-specific content (LinkedIn, Twitter, etc.).
    - **Schedule All:** New button to save generated posts to the `scheduled_posts` table in Supabase.
- **Publishing Engine:** (`backend/services/scheduler.js`, `publisher.js`)
    - Cron job to check for scheduled posts and publish them to external platforms (Twitter, LinkedIn).
    - **Decryption:** Implemented token decryption logic in `socialAuthService.js`.

## Verification Steps

### 1. Visual Inspection
- **Navigation:** Verify smooth transitions between pages.
- **Generator:** Go to `/generator`. Check the new layout, hover effects, and animations.
- **Docs:** Go to `/docs`. Check the sidebar navigation and content readability.

### 2. Functional Testing
#### Trend Scout & Brand Amplifier Flow
1.  Navigate to **Trend Scout** (`/trends-agent`).
2.  Enter a niche (e.g., "AI in Marketing") and click **Run Agent**.
3.  Wait for the report to generate.
4.  Click **Amplify this Report**. You should be redirected to the **Brand Amplifier**.
5.  In Brand Amplifier:
    - Configure your **Brand Persona**.
    - Select a **Platform** (e.g., LinkedIn).
    - Click **Amplify & Generate**.
6.  Once posts are generated:
    - Click **Schedule All**.
    - Verify the success alert.
    - (Optional) Check Supabase `scheduled_posts` table to confirm insertion.

#### Generator Flow
1.  Navigate to **Generator** (`/generator`).
2.  Enter source content (e.g., a URL or text).
3.  Select a platform.
4.  Click **Generate Posts**.
5.  Verify the loading state and the display of results.

### 3. Backend Verification
- **Scheduler:** The scheduler runs every minute (`* * * * *`).
- **Decryption:** The `decryptToken` function in `socialAuthService.js` handles token decryption.

## Troubleshooting
- **Lint Errors:** You may see lint errors in the editor regarding missing types or modules. These are often due to the environment setup and should not affect the runtime if the build succeeds.
- **Supabase Connection:** Ensure `SUPABASE_URL` and `SUPABASE_ANON_KEY` are set in your `.env` file.
- **Gemini API:** Ensure `GEMINI_API_KEY` is valid for content generation.
