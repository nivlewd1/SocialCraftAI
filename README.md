
# SocialCraft AI: Algorithmic-Driven Content Generation

![SocialCraft AI Header](https://storage.googleapis.com/aistudio-ux-team-public/socialcraft_banner.png)

**SocialCraft AI** is an intelligent automation platform designed to generate and optimize social media content. It goes beyond simple text generation by incorporating a deep, strategic understanding of each platform's unique algorithmic priorities. By analyzing source content (text, URLs, ideas) and leveraging the power of the Google Gemini API, SocialCraft AI produces posts that are engineered for maximum engagement, reach, and value.

The platform also includes a specialized **"Academic Mode"** to translate complex research into accessible posts and a full **"Media Studio"** for generating compelling images and videos.

---

## ✨ Key Features

-   **Algorithmic Content Adaptation:** Generates content tailored to the specific ranking signals of Twitter/X, LinkedIn, Instagram, TikTok, and Pinterest.
-   **E-E-A-T Enhancements:** Integrates features to boost **E**xperience, **E**xpertise, **A**uthoritativeness, and **T**rustworthiness, aligning with "people-first" content principles.
-   **Advanced Format Generation:** Creates detailed plans for high-engagement formats like Twitter Threads, LinkedIn/Instagram Carousels, LinkedIn Polls, and SEO-optimized video scripts.
-   **Real-Time Trend Analysis:** Uses Google Search grounding to analyze any topic or URL and identify emerging trends, keywords, and insights.
-   **AI Media Studio:** Generates high-quality images (via Imagen) and videos (via Veo) from simple text prompts.
-   **Strategic Playbooks:** A library of proven templates for various marketing goals, from product launches to thought leadership.
-   **Content Library & Scheduler:** Save drafts, store generated media, and schedule posts for optimal times.
-   **Academic Mode:** A specialized workflow for science communicators to translate dense research into engaging public-facing content.

---

## 🧠 Core Philosophy: Adapting to Algorithmic Priorities

SocialCraft AI's primary innovation is its ability to generate content that respects and leverages the unique priorities of each platform's algorithm. This is achieved by dynamically adjusting the generation prompt sent to the Gemini API based on the selected platform and format.

Here’s a platform-by-platform breakdown:

### 🔵 **LinkedIn**

-   **Algorithm Snapshot:** LinkedIn prioritizes content that fosters professional conversations and maximizes "dwell time." It rewards native content (text, polls, carousels) and heavily penalizes posts with external links in the main body, as they take users off-platform.
-   **SocialCraft's Strategy:**
    -   **Format Specialization:** Generates detailed plans for **Carousels** and **Polls**, which are known for high engagement.
    -   **Link-in-Comment Strategy:** To preserve reach, the AI is explicitly instructed to place any essential external links in a suggested **`firstComment`**, along with a warning about their algorithmic impact.
    -   **Dwell Time Optimization:** Creates longer, value-driven text posts with thoughtful formatting to encourage users to spend more time reading.

### 🐦 **Twitter / X**

-   **Algorithm Snapshot:** The "For You" algorithm prioritizes conversations. Replies are the most heavily weighted engagement signal. Content that sparks debate, provides value within a thread, and keeps users engaged is amplified.
-   **SocialCraft's Strategy:**
    -   **Thread Generation:** Automatically breaks down complex topics into well-structured, numbered **`thread`** of 2-4 tweets.
    -   **Conversation Starting:** The AI generates a unique **`engagementStrategy`**—a list of 2-3 strategic replies for the user to post on their own tweet to kickstart conversation and signal engagement to the algorithm.

### 📸 **Instagram**

-   **Algorithm Snapshot:** Instagram's algorithm currently favors short-form video (**Reels**) and multi-slide **Carousels**. Key metrics are "saves," "shares," and "watch time." The platform also de-prioritizes content with visible watermarks from other apps (like TikTok).
-   **SocialCraft's Strategy:**
    -   **Reel Scripting:** Generates a complete **`reelScript`** with a strong hook, scene-by-scene descriptions, a clear call-to-action (CTA), and suggestions for trending audio types.
    -   **Carousel Planning:** Creates slide-by-slide content for educational or narrative carousels, designed to maximize saves and shares.
    -   **Optimization Tips:** Includes reminders to use high-quality, original visuals.

### 🎵 **TikTok**

-   **Algorithm Snapshot:** TikTok functions as a powerful **search engine**. Discoverability is driven by SEO. The algorithm prioritizes longer videos (over 1 minute) to maximize watch time and rewards the strategic use of keywords in the caption, on-screen text, and spoken dialogue.
-   **SocialCraft's Strategy:**
    -   **Full SEO Scripting:** The AI generates a comprehensive **`tiktokScript`** optimized for search.
    -   **Multi-Modal SEO:** This script includes a list of target **`seoKeywords`**, a suggestion for **`onScreenTextSuggestion`**, and a reminder for **`spokenKeywordsSuggestion`** to ensure keywords are present in every modality.
    -   **Watch Time Optimization:** Scripts are designed to be over one minute long with engaging hooks and scenes.

### 📌 **Pinterest**

-   **Algorithm Snapshot:** Pinterest is a **visual search engine**. The algorithm prioritizes "fresh pins" (new images), strong SEO in titles and descriptions, high-quality vertical visuals (2:3 ratio), and relevant outbound links.
-   **SocialCraft's Strategy:**
    -   **"Fresh Pin" Planning:** The AI generates a complete **`pinterestPin`** plan.
    -   **SEO-First Approach:** The plan includes a keyword-rich **`title`**, a detailed **`description`**, a list of target **`keywords`**, and a suggestion for an SEO-friendly **`boardName`**.
    -   **Visual Guidance:** Provides a **`visualSuggestion`** that emphasizes the correct aspect ratio and the use of text overlays for clarity.

---

## 🛡️ Responsible AI & "People-First" Content

In line with Google's guidance, SocialCraft AI is built to be a responsible partner, not a shortcut for low-quality content.

-   **Author's Voice & Experience:** An optional field allows users to add a personal anecdote or unique insight. The AI is instructed to seamlessly integrate this, helping to demonstrate first-hand **Experience (E-E-A-T)**.
-   **Engagement Potential Score:** The "Viral Score" was reframed to "Engagement Potential" to focus on value. The analysis now includes an **"Audience Value"** metric, reminding the user of the core problem their content solves.
-   **Originality Review:** A post-generation checklist prompts the user to review their content for originality, add their own insights, and ensure it provides unique value beyond a simple summary.
-   **Transparency Toggle:** A simple UI toggle allows users to automatically append an `#AIassisted` hashtag to their content, promoting transparency with their audience.

---

## 🛠️ Tech Stack

-   **Frontend:** React, TypeScript, Vite, Tailwind CSS
-   **AI/ML:** Google Gemini API (`gemini-2.5-flash`, `imagen-4.0-generate-001`, `veo-3.1-fast-generate-preview`)
-   **Routing:** React Router
-   **UI Components:** Lucide React (Icons), Recharts (Analytics)
-   **Backend (for Auth & API integrations):** Node.js, Express, JWT, **Passport.js**

---

## 🚀 Getting Started

### 1. Frontend
```bash
# In the root directory
npm install
npm run dev
```

### 2. Backend
Navigate to the `backend` directory to set up and run the server.

```bash
cd backend
npm install
node server.js
```

### Environment Variables
The backend relies on a `.env` file for configuration. Create a `.env` file in the `/backend` directory with the following variables.

**Required for Core Functionality:**
```
# JWT secret for signing authentication tokens
JWT_SECRET=your_super_secret_jwt_key

# The public URL of your frontend and backend (for OAuth redirects)
# During local development, these are typically:
FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:3001
```

**Required for Social Logins & API Connections:**
You will need to create developer applications on each platform to get these credentials.

```
# Google (for login)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# GitHub (for login)
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret

# LinkedIn (for login AND account connection)
LINKEDIN_CLIENT_ID=your_linkedin_client_id
LINKEDIN_CLIENT_SECRET=your_linkedin_client_secret
LINKEDIN_REDIRECT_URI=${BACKEND_URL}/api/oauth/linkedin/callback

# Instagram (for account connection)
INSTAGRAM_CLIENT_ID=your_instagram_app_id
INSTAGRAM_CLIENT_SECRET=your_instagram_app_secret
INSTAGRAM_REDIRECT_URI=${BACKEND_URL}/api/oauth/instagram/callback

# TikTok (for account connection)
TIKTOK_CLIENT_KEY=your_tiktok_client_key
TIKTOK_CLIENT_SECRET=your_tiktok_client_secret
TIKTOK_REDIRECT_URI=${BACKEND_URL}/api/oauth/tiktok/callback
```
**Note:** You must add all relevant callback URLs to your developer app settings on each platform. For example, for LinkedIn, you would need to register both `${BACKEND_URL}/api/auth/linkedin/callback` (for login) and `${BACKEND_URL}/api/oauth/linkedin/callback` (for account connection).

---

## 🏗️ Backend Architecture

The project includes a Node.js/Express backend to handle user authentication and social media API connections. It uses **Passport.js** for robust authentication, supporting both traditional email/password login and social sign-on (SSO) with Google, GitHub, and LinkedIn.

-   **Authentication**: User identity is managed via JSON Web Tokens (JWT). All protected API endpoints require a valid JWT.
-   **Social Sign-On (SSO)**: Users can register and log in seamlessly using their existing Google, GitHub, or LinkedIn accounts.
-   **Account Connections**: After logging in, users can connect their social media accounts (LinkedIn, Instagram, TikTok) via a secure OAuth 2.0 flow to grant the application permission to fetch analytics and post content.

### API Routes
-   `/api/auth`: Handles user registration, email/password login, and the entire social sign-on flow.
-   `/api/oauth`: Manages the OAuth flow for connecting external accounts *after* a user has logged in.
-   `/api/analytics`: A protected route that fetches and aggregates data from a user's connected platforms.

---

## 📄 License

This project is licensed under the MIT License.
