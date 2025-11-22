
# SocialCraft AI: Algorithmic-Driven Content Generation & Automation

![SocialCraft AI Header](https://storage.googleapis.com/aistudio-ux-team-public/socialcraft_banner.png)

**SocialCraft AI** is an intelligent automation platform designed to generate, schedule, and automatically publish social media content. It goes beyond simple text generation by incorporating a deep, strategic understanding of each platform's unique algorithmic priorities. By analyzing source content (text, URLs, ideas) and leveraging the power of the Google Gemini API, SocialCraft AI produces posts that are engineered for maximum engagement, reach, and value.

The platform includes a specialized **"Academic Mode"** for translating complex research into accessible posts, a full **"Media Studio"** for generating compelling images and videos, and **automated publishing** with recurring post schedules.

---

## ✨ Key Features

### Content Generation
- **Algorithmic Content Adaptation:** Generates content tailored to the specific ranking signals of Twitter/X, LinkedIn, Instagram, TikTok, and Pinterest.
- **E-E-A-T Enhancements:** Integrates features to boost **E**xperience, **E**xpertise, **A**uthoritativeness, and **T**rustworthiness, aligning with "people-first" content principles.
- **Advanced Format Generation:** Creates detailed plans for high-engagement formats like Twitter Threads, LinkedIn/Instagram Carousels, LinkedIn Polls, and SEO-optimized video scripts.
- **Strategic Playbooks:** A library of proven templates for various marketing goals, from product launches to thought leadership.

### AI-Powered Tools
- **Trend Scout:** AI agent that analyzes real-time trends, discovers emerging topics, and provides actionable content insights using Google Search grounding.
- **Brand Amplifier:** Amplifies your brand messaging across platforms with consistent voice and optimized formatting.
- **AI Media Studio:** Generates high-quality images (via Imagen) and videos (via Veo) from simple text prompts.
- **Academic Mode:** A specialized workflow for science communicators to translate dense research into engaging public-facing content.

### Content Automation
- **Content Scheduler:** Schedule posts for optimal times with a visual calendar interface.
- **Recurring Posts:** Set up automatic posting frequencies (daily, weekly, monthly) - create once, post forever.
- **Multi-Platform Publishing:** Connect and publish to Twitter, LinkedIn, Instagram, TikTok, and Pinterest.
- **Rate Limiting:** Built-in protection against platform API rate limits.
- **Token Management:** Automatic OAuth token refresh to prevent authentication failures.
- **Analytics Tracking:** Fetch and display engagement metrics from all connected platforms.

### User Management
- **Authentication:** Secure sign-in with email/password or social SSO (Google, GitHub, LinkedIn).
- **Content Library:** Save drafts and store generated media.
- **Subscription Management:** Stripe-powered billing with multiple pricing tiers.

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        Frontend (React)                          │
│  Landing | Generator | Scheduler | Media Studio | Settings       │
└──────────────────────────┬──────────────────────────────────────┘
                           │
            ┌──────────────┼──────────────┐
            │              │              │
            ▼              ▼              ▼
┌───────────────┐  ┌─────────────┐  ┌────────────────┐
│   Supabase    │  │  Google AI  │  │  Social APIs   │
│  - Auth       │  │  - Gemini   │  │  - Twitter     │
│  - Database   │  │  - Imagen   │  │  - LinkedIn    │
│  - Storage    │  │  - Veo      │  │  - Instagram   │
│  - Edge Fn    │  └─────────────┘  │  - TikTok      │
└───────────────┘                   │  - Pinterest   │
        │                           └────────────────┘
        │
        ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Edge Functions (Deno)                         │
│  post-scheduler | token-refresh | analytics-fetcher              │
│  recurring-post-generator | stripe-webhooks                      │
└─────────────────────────────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────────────────────────────┐
│                  GitHub Actions (Scheduler)                      │
│  Triggers edge functions on cron schedule                        │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🧠 Core Philosophy: Adapting to Algorithmic Priorities

SocialCraft AI's primary innovation is its ability to generate content that respects and leverages the unique priorities of each platform's algorithm. This is achieved by dynamically adjusting the generation prompt sent to the Gemini API based on the selected platform and format.

### 🔵 **LinkedIn**

- **Algorithm Snapshot:** LinkedIn prioritizes content that fosters professional conversations and maximizes "dwell time." It rewards native content (text, polls, carousels) and heavily penalizes posts with external links in the main body.
- **SocialCraft's Strategy:**
  - **Format Specialization:** Generates detailed plans for **Carousels** and **Polls**, which are known for high engagement.
  - **Link-in-Comment Strategy:** Places any essential external links in a suggested **`firstComment`**, along with a warning about their algorithmic impact.
  - **Dwell Time Optimization:** Creates longer, value-driven text posts with thoughtful formatting.

### 🐦 **Twitter / X**

- **Algorithm Snapshot:** The "For You" algorithm prioritizes conversations. Replies are the most heavily weighted engagement signal.
- **SocialCraft's Strategy:**
  - **Thread Generation:** Automatically breaks down complex topics into well-structured, numbered **`thread`** of 2-4 tweets.
  - **Conversation Starting:** Generates a unique **`engagementStrategy`**—strategic replies to kickstart conversation.

### 📸 **Instagram**

- **Algorithm Snapshot:** Instagram's algorithm favors short-form video (**Reels**) and multi-slide **Carousels**. Key metrics are "saves," "shares," and "watch time."
- **SocialCraft's Strategy:**
  - **Reel Scripting:** Generates complete **`reelScript`** with hooks, scene descriptions, CTAs, and trending audio suggestions.
  - **Carousel Planning:** Creates slide-by-slide content for educational or narrative carousels.

### 🎵 **TikTok**

- **Algorithm Snapshot:** TikTok functions as a powerful **search engine**. Discoverability is driven by SEO.
- **SocialCraft's Strategy:**
  - **Full SEO Scripting:** Generates comprehensive **`tiktokScript`** optimized for search.
  - **Multi-Modal SEO:** Includes target **`seoKeywords`**, **`onScreenTextSuggestion`**, and **`spokenKeywordsSuggestion`**.

### 📌 **Pinterest**

- **Algorithm Snapshot:** Pinterest is a **visual search engine** prioritizing "fresh pins" and strong SEO.
- **SocialCraft's Strategy:**
  - **"Fresh Pin" Planning:** Generates complete **`pinterestPin`** plans with keyword-rich titles and descriptions.
  - **Visual Guidance:** Provides **`visualSuggestion`** emphasizing correct aspect ratios and text overlays.

---

## 🔁 Content Automation

### Scheduled Posts

Schedule individual posts to publish at specific times:

1. Create content in the Generator
2. Click "Schedule" and select date/time
3. Post automatically publishes at scheduled time

### Recurring Posts

Set up automatic posting frequencies:

- **Daily:** "Post every day at 9 AM"
- **Weekly:** "Post every Monday, Wednesday, Friday at 2 PM"
- **Monthly:** "Post on the 1st and 15th of each month at 10 AM"

The system automatically generates scheduled posts 14 days in advance from your recurring templates.

See [docs/RECURRING_POSTS.md](docs/RECURRING_POSTS.md) for detailed setup instructions.

### Automation Schedule

| Edge Function | Schedule | Purpose |
|---------------|----------|---------|
| `post-scheduler` | Every 5 minutes | Publishes scheduled posts at their time |
| `recurring-post-generator` | Daily at 1 AM UTC | Generates posts from recurring rules |
| `token-refresh` | Daily at 2 AM UTC | Refreshes expiring OAuth tokens |
| `analytics-fetcher` | Hourly | Fetches engagement metrics |

### Rate Limiting

Built-in protection for platform API limits:

| Platform | Limit | Notes |
|----------|-------|-------|
| Twitter | 100 posts/24h | 17 for free tier |
| LinkedIn | 10 posts/24h | 12 for company pages |
| Instagram | 100 posts/24h | All tiers |
| TikTok | 15 posts/24h | Conservative limit |
| Pinterest | 12 posts/24h | Conservative limit |

---

## 🛡️ Responsible AI & "People-First" Content

In line with Google's guidance, SocialCraft AI is built to be a responsible partner, not a shortcut for low-quality content.

- **Author's Voice & Experience:** Optional field to add personal anecdotes. The AI integrates this to demonstrate first-hand **Experience (E-E-A-T)**.
- **Engagement Potential Score:** Analysis includes an **"Audience Value"** metric, focusing on the value your content provides.
- **Originality Review:** Post-generation checklist prompts review for originality and unique insights.
- **Transparency Toggle:** Automatically append an `#AIassisted` hashtag to promote transparency.

---

## 🛠️ Tech Stack

### Frontend
- **Framework:** React 19, TypeScript, Vite
- **Styling:** Tailwind CSS
- **Animation:** Framer Motion
- **Icons:** Lucide React
- **Charts:** Recharts

### Backend & Infrastructure
- **Database:** Supabase (PostgreSQL)
- **Authentication:** Supabase Auth
- **Edge Functions:** Supabase Edge Functions (Deno)
- **Storage:** Supabase Storage
- **Payments:** Stripe

### AI/ML
- **Text Generation:** Google Gemini API (`gemini-2.5-flash`)
- **Image Generation:** Google Imagen (`imagen-4.0-generate-001`)
- **Video Generation:** Google Veo (`veo-3.1-fast-generate-preview`)

### Automation
- **Scheduler:** GitHub Actions
- **OAuth:** Passport.js, PKCE support

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account
- Google AI API key
- Social platform developer accounts (for OAuth)

### 1. Clone the Repository

```bash
git clone https://github.com/nivlewd1/SocialCraftAI.git
cd SocialCraftAI
```

### 2. Install Dependencies

```bash
# Frontend
npm install

# Backend
cd backend
npm install
```

### 3. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Run the database migrations:
   ```bash
   supabase link --project-ref YOUR_PROJECT_REF
   supabase db push
   ```
3. Deploy edge functions:
   ```bash
   supabase functions deploy post-scheduler --no-verify-jwt
   supabase functions deploy token-refresh --no-verify-jwt
   supabase functions deploy analytics-fetcher --no-verify-jwt
   supabase functions deploy recurring-post-generator --no-verify-jwt
   ```

### 4. Configure Environment Variables

Create `.env` files based on `.env.example`:

**Frontend (.env):**
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_GOOGLE_AI_API_KEY=your_gemini_api_key
```

**Backend (.env):**
```env
# Authentication
JWT_SECRET=your_super_secret_jwt_key
FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:3001

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Social OAuth (for login)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret

# Social OAuth (for account connection)
LINKEDIN_CLIENT_ID=your_linkedin_client_id
LINKEDIN_CLIENT_SECRET=your_linkedin_client_secret
TWITTER_CLIENT_ID=your_twitter_client_id
TWITTER_CLIENT_SECRET=your_twitter_client_secret
INSTAGRAM_CLIENT_ID=your_instagram_client_id
INSTAGRAM_CLIENT_SECRET=your_instagram_client_secret
TIKTOK_CLIENT_KEY=your_tiktok_client_key
TIKTOK_CLIENT_SECRET=your_tiktok_client_secret

# Stripe (optional)
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_webhook_secret
```

### 5. Set Up Supabase Edge Function Secrets

```bash
supabase secrets set TWITTER_CLIENT_ID=your_value
supabase secrets set TWITTER_CLIENT_SECRET=your_value
supabase secrets set LINKEDIN_CLIENT_ID=your_value
supabase secrets set LINKEDIN_CLIENT_SECRET=your_value
supabase secrets set INSTAGRAM_CLIENT_ID=your_value
supabase secrets set INSTAGRAM_CLIENT_SECRET=your_value
```

### 6. Configure GitHub Actions

Add repository secrets for automated scheduling:

1. Go to GitHub repo → Settings → Secrets and variables → Actions
2. Add:
   - `SUPABASE_URL`: Your Supabase project URL
   - `SUPABASE_SERVICE_ROLE_KEY`: Your service role key

See [.github/EDGE_FUNCTIONS_SETUP.md](.github/EDGE_FUNCTIONS_SETUP.md) for detailed instructions.

### 7. Run the Application

```bash
# Terminal 1: Frontend
npm run dev

# Terminal 2: Backend
cd backend
node server.js
```

Visit `http://localhost:5173` to access the application.

---

## 📁 Project Structure

```
SocialCraftAI/
├── .github/
│   ├── workflows/
│   │   └── edge-functions-scheduler.yml  # GitHub Actions cron jobs
│   └── EDGE_FUNCTIONS_SETUP.md           # Setup documentation
├── backend/                               # Node.js/Express backend
│   ├── routes/
│   ├── middleware/
│   └── server.js
├── components/                            # React components
├── contexts/                              # React contexts (Auth, etc.)
├── docs/
│   └── RECURRING_POSTS.md                 # Recurring posts documentation
├── services/                              # API service layers
├── supabase/
│   ├── functions/                         # Edge functions
│   │   ├── post-scheduler/
│   │   ├── token-refresh/
│   │   ├── analytics-fetcher/
│   │   ├── recurring-post-generator/
│   │   ├── stripe-webhooks/
│   │   ├── create-checkout-session/
│   │   └── create-portal-session/
│   └── migrations/                        # Database migrations
├── views/                                 # Page components
├── App.tsx                                # Main app component
├── index.tsx                              # Entry point
└── README.md
```

---

## 📊 Database Schema

### Core Tables

| Table | Purpose |
|-------|---------|
| `profiles` | User profile data (extends Supabase auth) |
| `drafts` | Saved content drafts |
| `scheduled_posts` | Posts scheduled for future publishing |
| `recurring_posts` | Recurring post templates and frequencies |
| `connected_accounts` | OAuth tokens for social platforms |
| `analytics_cache` | Cached engagement metrics |
| `media` | AI-generated images and videos |

See `supabase/migrations/` for complete schema definitions.

---

## 🏗️ Backend Architecture

The project includes a Node.js/Express backend to handle user authentication and social media API connections. It uses **Passport.js** for robust authentication, supporting both traditional email/password login and social sign-on (SSO) with Google, GitHub, and LinkedIn.

- **Authentication**: User identity is managed via JSON Web Tokens (JWT). All protected API endpoints require a valid JWT.
- **Social Sign-On (SSO)**: Users can register and log in seamlessly using their existing Google, GitHub, or LinkedIn accounts.
- **Account Connections**: After logging in, users can connect their social media accounts (LinkedIn, Instagram, TikTok, Twitter) via a secure OAuth 2.0 + PKCE flow.

### API Routes
- `/api/auth`: Handles user registration, email/password login, and the entire social sign-on flow.
- `/api/oauth`: Manages the OAuth flow for connecting external accounts *after* a user has logged in.
- `/api/analytics`: A protected route that fetches and aggregates data from a user's connected platforms.

---

## 🔐 Security

- **Row Level Security (RLS):** All database tables protected with RLS policies
- **OAuth 2.0 + PKCE:** Secure authentication flow for social platforms
- **JWT Authentication:** Secure API access with JSON Web Tokens
- **Service Role Separation:** Edge functions use service role for elevated operations
- **Encrypted Tokens:** OAuth tokens stored securely in database

---

## 📖 Documentation

| Document | Description |
|----------|-------------|
| [RECURRING_POSTS.md](docs/RECURRING_POSTS.md) | Complete guide to recurring posts feature |
| [EDGE_FUNCTIONS_SETUP.md](.github/EDGE_FUNCTIONS_SETUP.md) | GitHub Actions and edge function setup |
| [DEPLOYMENT-GUIDE.md](DEPLOYMENT-GUIDE.md) | Deployment instructions |
| [AUTOMATION-REQUIREMENTS.md](AUTOMATION-REQUIREMENTS.md) | Automation feature requirements |

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

## 🙏 Acknowledgments

- [Google Gemini](https://ai.google.dev/) for AI text generation
- [Supabase](https://supabase.com/) for backend infrastructure
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [Lucide](https://lucide.dev/) for icons
