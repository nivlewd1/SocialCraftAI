# Backend Migration Guide

## Migrating from Passport.js to Supabase Auth

This guide explains how to update your backend to use Supabase authentication.

---

## Changes Summary

**BEFORE (Passport.js):**
- Custom user management
- JWT signing/verification
- Password hashing
- OAuth strategies for Google/GitHub
- In-memory user storage

**AFTER (Supabase):**
- Supabase handles user management
- Supabase JWT verification
- Users stored in PostgreSQL
- OAuth managed by Supabase
- Backend only handles social media account connections

---

## Step 1: Update server.js

### Old Code (Remove):
```javascript
const passport = require('passport');
const authRoutes = require('./routes/auth');
const authMiddleware = require('./middleware/auth');

app.use(passport.initialize());
require('./config/passport')(passport);

app.use('/api/auth', authRoutes);
app.use('/api/oauth', authMiddleware, oauthRoutes);
app.use('/api/analytics', authMiddleware, analyticsRoutes);
```

### New Code (Replace with):
```javascript
const { verifySupabaseToken, requireConnectedAccount } = require('./middleware/supabaseAuth');

// Remove passport initialization - no longer needed

// OAuth routes now verify Supabase tokens instead of custom JWT
app.use('/api/oauth', verifySupabaseToken, oauthRoutes);
app.use('/api/analytics', verifySupabaseToken, analyticsRoutes);

// Remove /api/auth routes - Supabase handles this from frontend
```

---

## Step 2: Update OAuth Routes

Your OAuth routes need to store tokens in Supabase instead of in-memory.

### Example: LinkedIn Connection

**OLD (routes/oauth.js):**
```javascript
router.get('/linkedin/callback', async (req, res) => {
  // ... get access token from LinkedIn ...

  // Old: store in memory
  users[req.user.id].linkedinToken = accessToken;

  res.redirect(`${process.env.FRONTEND_URL}/settings?connected=linkedin`);
});
```

**NEW (routes/oauth.js):**
```javascript
const supabase = require('../config/supabase');

router.get('/linkedin/callback', async (req, res) => {
  // ... get access token from LinkedIn ...

  // New: store in Supabase
  const { error } = await supabase
    .from('connected_accounts')
    .upsert({
      user_id: req.user.id,
      platform: 'linkedin',
      access_token: accessToken,
      refresh_token: refreshToken,
      token_expires_at: expiresAt,
      platform_user_id: linkedinUserId,
      platform_username: linkedinUsername,
    }, {
      onConflict: 'user_id,platform'
    });

  if (error) {
    console.error('Error saving LinkedIn connection:', error);
    return res.redirect(`${process.env.FRONTEND_URL}/settings?error=connection_failed`);
  }

  res.redirect(`${process.env.FRONTEND_URL}/settings?connected=linkedin`);
});
```

---

## Step 3: Update Analytics Routes

When fetching analytics, get tokens from Supabase.

**OLD:**
```javascript
router.get('/linkedin', authMiddleware, async (req, res) => {
  const token = users[req.user.id].linkedinToken;
  // ... fetch analytics ...
});
```

**NEW:**
```javascript
const { verifySupabaseToken, requireConnectedAccount } = require('../middleware/supabaseAuth');

router.get('/linkedin',
  verifySupabaseToken,
  requireConnectedAccount('linkedin'),
  async (req, res) => {
    const token = req.connectedAccount.access_token;
    // ... fetch analytics ...
  }
);
```

---

## Step 4: Remove Old Files

You can now delete these files (no longer needed):

```
backend/
├── routes/auth.js          ❌ DELETE (Supabase handles auth)
├── middleware/auth.js      ❌ DELETE (replaced with supabaseAuth.js)
├── models/user.js          ❌ DELETE (users in Supabase database)
└── config/passport.js      ❌ DELETE (Supabase handles OAuth)
```

**Keep these:**
```
backend/
├── routes/oauth.js         ✅ KEEP (update to use Supabase)
├── routes/analytics.js     ✅ KEEP (update to use Supabase)
└── services/              ✅ KEEP (LinkedIn, Instagram, TikTok integrations)
```

---

## Step 5: Update Environment Variables

Create `backend/.env`:

```bash
# Supabase (NEW)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Remove these (no longer needed):
# JWT_SECRET
# GOOGLE_CLIENT_ID
# GOOGLE_CLIENT_SECRET
# GITHUB_CLIENT_ID
# GITHUB_CLIENT_SECRET

# Keep these (for social media posting):
LINKEDIN_CLIENT_ID=...
INSTAGRAM_CLIENT_ID=...
TIKTOK_CLIENT_KEY=...
```

---

## Step 6: Frontend API Calls

Update frontend to send Supabase token instead of custom JWT.

**OLD:**
```typescript
const token = localStorage.getItem('jwt');
fetch('/api/analytics/linkedin', {
  headers: { 'Authorization': `Bearer ${token}` }
});
```

**NEW:**
```typescript
import { supabase } from './config/supabase';

const { data: { session } } = await supabase.auth.getSession();
fetch('/api/analytics/linkedin', {
  headers: { 'Authorization': `Bearer ${session.access_token}` }
});
```

Or create a helper:
```typescript
// src/api/client.ts
import { supabase } from '../config/supabase';

export async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const { data: { session } } = await supabase.auth.getSession();

  return fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${session?.access_token}`,
    },
  });
}

// Usage:
const response = await fetchWithAuth('/api/analytics/linkedin');
```

---

## Step 7: Test

1. **Start services:**
   ```bash
   # Frontend
   npm run dev

   # Backend
   cd backend
   node server.js
   ```

2. **Test flow:**
   - Sign up with email/password → Should work via Supabase
   - Sign in with Google → Should work via Supabase
   - Connect LinkedIn account → Should save to Supabase database
   - Fetch analytics → Should retrieve token from Supabase

3. **Verify database:**
   - Supabase Dashboard > Table Editor > connected_accounts
   - Should see entries when you connect accounts

---

## Simplified Architecture

```
┌─────────────────────────────────────────────────┐
│           AUTHENTICATION (Supabase)             │
│  - Email/password                               │
│  - Google OAuth                                 │
│  - GitHub OAuth                                 │
│  - JWT token management                         │
└─────────────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────┐
│         EXPRESS BACKEND (Northflank)            │
│  - Verify Supabase JWT                          │
│  - Social media OAuth (LinkedIn, IG, TikTok)    │
│  - Store tokens in Supabase DB                  │
│  - Fetch/aggregate analytics                    │
└─────────────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────┐
│          SUPABASE DATABASE                      │
│  - users (managed by Supabase Auth)             │
│  - profiles                                     │
│  - connected_accounts                           │
│  - drafts                                       │
│  - scheduled_posts                              │
│  - media                                        │
└─────────────────────────────────────────────────┘
```

---

## Benefits

✅ Less code to maintain
✅ No password management
✅ No JWT signing/verification
✅ Built-in security best practices
✅ Automatic session management
✅ Admin dashboard for user management
✅ Row Level Security
✅ Audit logs

---

## Need Help?

Check the main `SETUP_GUIDE.md` for complete setup instructions!
