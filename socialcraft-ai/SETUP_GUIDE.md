# SocialCraft AI - Supabase Setup Guide

## Phase 1 Implementation Complete! ✅

This guide will walk you through completing the Supabase integration.

---

## Step 1: Run Database Migration in Supabase

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your SocialCraft AI project
3. Navigate to **SQL Editor** (left sidebar)
4. Click **New Query**
5. Open `supabase/migrations/001_initial_schema.sql`
6. Copy the entire contents
7. Paste into the SQL Editor
8. Click **Run** (or Ctrl+Enter)

**Verify:**
- Dashboard > Table Editor - should see 6 tables
- Dashboard > Authentication > Policies - should see RLS policies
- Dashboard > Storage - should see `ai-media` bucket

---

## Step 2: Get Supabase Credentials

1. Dashboard > **Settings** > **API**
2. Copy these values:

```
Project URL: https://xxxxx.supabase.co
anon/public key: eyJhbGci...
```

---

## Step 3: Create Frontend .env File

Create `.env` in the project root:

```bash
# Copy from .env.example
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.your-key-here

# Optional: Gemini API if using from frontend
VITE_GEMINI_API_KEY=your_gemini_api_key
```

---

## Step 4: Update App.tsx to Use AuthProvider

Update `src/index.tsx` or `src/App.tsx` to wrap your app with `AuthProvider`:

```tsx
import { AuthProvider } from './contexts/AuthContext';

function App() {
  return (
    <AuthProvider>
      {/* Your existing app code */}
    </AuthProvider>
  );
}
```

---

## Step 5: Test Authentication

Add an auth button to your UI:

```tsx
import { useAuth } from './contexts/AuthContext';
import { AuthModal } from './components/AuthModal';
import { useState } from 'react';

function YourComponent() {
  const { user, signOut } = useAuth();
  const [showAuth, setShowAuth] = useState(false);

  return (
    <div>
      {user ? (
        <>
          <p>Welcome, {user.email}!</p>
          <button onClick={signOut}>Sign Out</button>
        </>
      ) : (
        <button onClick={() => setShowAuth(true)}>Sign In</button>
      )}

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </div>
  );
}
```

---

## Step 6: Migrate Drafts to Use Supabase

Replace localStorage drafts with Supabase:

**Old way (localStorage):**
```tsx
const drafts = JSON.parse(localStorage.getItem('drafts') || '[]');
```

**New way (Supabase):**
```tsx
import { draftsService } from './services/draftsService';
import { useEffect, useState } from 'react';

function DraftsView() {
  const [drafts, setDrafts] = useState([]);

  useEffect(() => {
    draftsService.getAllDrafts().then(setDrafts);
  }, []);

  const saveDraft = async (draft) => {
    await draftsService.createDraft(draft);
    // Refresh list
    const updated = await draftsService.getAllDrafts();
    setDrafts(updated);
  };

  return (
    // Your draft UI
  );
}
```

---

## Step 7: Update Backend (Northflank)

### Install Dependencies

In `backend/`:
```bash
npm install @supabase/supabase-js dotenv
```

### Update backend/.env

```bash
# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key  # From Dashboard > Settings > API

# Keep existing OAuth credentials
LINKEDIN_CLIENT_ID=...
INSTAGRAM_CLIENT_ID=...
TIKTOK_CLIENT_KEY=...
```

### Create Supabase Middleware

Create `backend/src/middleware/supabaseAuth.ts`:

```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const verifySupabaseToken = async (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const { data: { user }, error } = await supabase.auth.getUser(token);

  if (error || !user) {
    return res.status(401).json({ error: 'Invalid token' });
  }

  req.user = user;
  next();
};
```

### Update Routes

Replace the old auth middleware with Supabase:

```javascript
// backend/src/server.js
const { verifySupabaseToken } = require('./middleware/supabaseAuth');

// Protected routes now use Supabase token verification
app.use('/api/oauth', verifySupabaseToken, oauthRoutes);
app.use('/api/analytics', verifySupabaseToken, analyticsRoutes);
```

---

## Step 8: Deploy to Northflank & Vercel

### Northflank (Backend)
1. Add environment variables:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - Keep existing OAuth credentials

### Vercel (Frontend)
1. Add environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
2. Redeploy

---

## What You Get

✅ **Authentication**
- Email/password login
- Google OAuth
- GitHub OAuth
- Automatic profile creation

✅ **Persistent Data**
- Drafts saved to PostgreSQL
- Scheduled posts stored
- Media files in Supabase Storage

✅ **Security**
- Row Level Security (RLS)
- Users can only access their own data
- JWT-based authentication

✅ **Type Safety**
- Auto-generated TypeScript types
- Type-safe database queries
- Compile-time error checking

✅ **Real-time (Optional)**
- Live updates when drafts change
- Collaborative features ready

---

## Optional: Auto-Generate Types

Install Supabase CLI globally:

```bash
npm install -g supabase
```

Generate types from your database:

```bash
supabase login
supabase gen types typescript --project-id your-project-id > src/types/database.types.ts
```

This keeps your TypeScript types in sync with your database schema!

---

## Troubleshooting

**"Missing environment variables" error:**
- Check `.env` file exists and has correct values
- Restart dev server after creating `.env`

**"No auth providers enabled" error:**
- Enable Email auth in Supabase Dashboard > Authentication > Providers
- Enable Google/GitHub OAuth with your credentials

**Storage upload fails:**
- Check `ai-media` bucket exists and is public
- Verify storage policies were created in migration

**Backend can't verify tokens:**
- Use `SUPABASE_SERVICE_ROLE_KEY`, not anon key
- Check token is sent in `Authorization: Bearer <token>` header

---

## Next Steps

1. ✅ Run database migration
2. ✅ Set up environment variables
3. ✅ Wrap app with AuthProvider
4. ✅ Test login/signup
5. 🔄 Migrate drafts/media to Supabase
6. 🔄 Update backend auth middleware
7. 🔄 Deploy to production

Need help? Check `supabase/README.md` for more details!
