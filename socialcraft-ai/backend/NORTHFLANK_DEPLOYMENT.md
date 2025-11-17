# Northflank Deployment Guide - SocialCraft AI Backend

This guide walks you through deploying the SocialCraft AI Express.js backend to Northflank using Docker.

---

## Prerequisites

- ✅ Northflank account ([Sign up](https://northflank.com/))
- ✅ GitHub account with this repository
- ✅ Supabase project set up
- ✅ OAuth credentials for LinkedIn, Instagram, TikTok (from their developer portals)
- ✅ Encryption key generated

---

## 📋 Quick Start

### 1. Test Docker Build Locally (Optional but Recommended)

Before deploying, test that your Docker image builds correctly:

```bash
cd backend

# Build the Docker image
docker build -t socialcraft-backend .

# Test run locally
docker run -p 3001:3001 --env-file .env socialcraft-backend

# OR use docker-compose
docker-compose up
```

Visit `http://localhost:3001` - you should see "SocialCraft AI Backend is running!"

---

### 2. Push Changes to GitHub

Make sure your Dockerfile is committed:

```bash
git add Dockerfile .dockerignore docker-compose.yml NORTHFLANK_DEPLOYMENT.md
git commit -m "Add Docker configuration for Northflank deployment"
git push
```

---

## 🚀 Deploying to Northflank

### Step 1: Create a New Project

1. Log into [Northflank](https://app.northflank.com/)
2. Click **"Create New Project"**
3. Name it: `SocialCraft AI`
4. Click **"Create Project"**

---

### Step 2: Create a Service

1. Inside your project, click **"Create Service"**
2. Select **"Combined Service"** (for both build and deploy)
3. Choose **"GitHub"** as the source
4. Authorize Northflank to access your GitHub repository
5. Select your repository: `nivlewd1/SocialCraftAI`
6. Set **Branch**: `main` (or your production branch)

---

### Step 3: Configure Build Settings

**Build Settings:**
- **Dockerfile Path**: `socialcraft-ai/backend/Dockerfile`
- **Build Context**: `socialcraft-ai/backend`
- **Build Arguments**: (none needed)

**OR if Northflank asks for build command:**
- **Build Command**: `docker build -t socialcraft-backend .`
- **Dockerfile**: `Dockerfile`

---

### Step 4: Configure Runtime Settings

**Port Configuration:**
- **Internal Port**: `3001`
- **Protocol**: `HTTP`
- **Public Port**: `443` (HTTPS)
- Enable **"Public Access"**

**Resources:**
- **CPU**: 0.2 vCPU (can increase later)
- **Memory**: 512 MB (can increase later)

**Health Check:**
- **Path**: `/`
- **Port**: `3001`
- **Initial Delay**: 30 seconds
- **Interval**: 30 seconds

---

### Step 5: Add Environment Variables

Click **"Environment"** tab and add these variables:

#### Required Variables:

```env
# Supabase Configuration
SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.xxxxxxxxxxxxx

# Server Configuration
NODE_ENV=production
PORT=3001

# IMPORTANT: Update these URLs to your Northflank deployment URL
# You'll get this after first deployment, then update and redeploy
FRONTEND_URL=https://socialcraft-ai.vercel.app
BACKEND_URL=https://your-app.northflank.app

# OAuth - LinkedIn
LINKEDIN_CLIENT_ID=your_linkedin_client_id
LINKEDIN_CLIENT_SECRET=your_linkedin_client_secret
LINKEDIN_REDIRECT_URI=https://your-app.northflank.app/api/oauth/linkedin/callback

# OAuth - Instagram
INSTAGRAM_CLIENT_ID=your_instagram_app_id
INSTAGRAM_CLIENT_SECRET=your_instagram_app_secret
INSTAGRAM_REDIRECT_URI=https://your-app.northflank.app/api/oauth/instagram/callback

# OAuth - TikTok
TIKTOK_CLIENT_KEY=your_tiktok_client_key
TIKTOK_CLIENT_SECRET=your_tiktok_client_secret
TIKTOK_REDIRECT_URI=https://your-app.northflank.app/api/oauth/tiktok/callback

# Security - Token Encryption
# Generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
ENCRYPTION_KEY=your_64_character_hex_string_here
```

**How to add in Northflank:**
1. Click **"+ Add Variable"** for each
2. Name: `SUPABASE_URL`, Value: `your_value`
3. For secrets (passwords, keys), toggle **"Secret"** to hide values
4. Mark `SUPABASE_SERVICE_ROLE_KEY`, `ENCRYPTION_KEY`, and all OAuth secrets as **Secret**

---

### Step 6: Deploy

1. Click **"Create Service"**
2. Northflank will:
   - Clone your repository
   - Build the Docker image
   - Deploy the container
   - Assign a public URL

**Initial deployment takes 2-5 minutes.**

---

### Step 7: Get Your Deployment URL

After deployment succeeds:

1. Go to **"Overview"** tab
2. Look for **"Public Domains"**
3. Copy the URL (e.g., `https://socialcraft-backend-abc123.northflank.app`)

---

### Step 8: Update OAuth Redirect URIs

**CRITICAL:** You must update the OAuth redirect URIs in each platform's developer console:

#### LinkedIn Developer Console
1. Go to [LinkedIn Developer Portal](https://www.linkedin.com/developers/apps)
2. Select your app
3. Go to **"Auth"** tab
4. Update **Redirect URLs**:
   ```
   https://your-app.northflank.app/api/oauth/linkedin/callback
   ```

#### Instagram/Facebook Developer Console
1. Go to [Meta for Developers](https://developers.facebook.com/apps)
2. Select your app
3. Go to **"Instagram Basic Display"** → **"Basic Display"**
4. Update **Valid OAuth Redirect URIs**:
   ```
   https://your-app.northflank.app/api/oauth/instagram/callback
   ```

#### TikTok Developer Console
1. Go to [TikTok for Developers](https://developers.tiktok.com/)
2. Select your app
3. Go to **"Login Kit"**
4. Update **Redirect URLs**:
   ```
   https://your-app.northflank.app/api/oauth/tiktok/callback
   ```

---

### Step 9: Update Environment Variables

After getting your deployment URL:

1. Go back to Northflank → Your Service → **"Environment"**
2. Update these variables:
   ```env
   BACKEND_URL=https://your-app.northflank.app
   LINKEDIN_REDIRECT_URI=https://your-app.northflank.app/api/oauth/linkedin/callback
   INSTAGRAM_REDIRECT_URI=https://your-app.northflank.app/api/oauth/instagram/callback
   TIKTOK_REDIRECT_URI=https://your-app.northflank.app/api/oauth/tiktok/callback
   ```
3. Click **"Save"**
4. Click **"Restart Service"**

---

### Step 10: Update Frontend Configuration

Update your frontend to point to the new backend URL:

**In your frontend `.env` or config:**
```env
VITE_BACKEND_URL=https://your-app.northflank.app
```

Update any API calls in your frontend code from `http://localhost:3001` to use the environment variable.

---

## ✅ Verify Deployment

### Test 1: Health Check
```bash
curl https://your-app.northflank.app/
```
**Expected:** `"SocialCraft AI Backend is running!"`

### Test 2: OAuth Flow (Manual)
1. Visit: `https://your-app.northflank.app/api/oauth/linkedin`
2. Should redirect to LinkedIn login
3. After authorizing, should show "LinkedIn connected successfully!"

### Test 3: API Endpoints (with JWT)
```bash
# Get connected accounts
curl -H "Authorization: Bearer YOUR_SUPABASE_JWT" \
     https://your-app.northflank.app/api/oauth/connected
```

---

## 🔧 Common Issues & Solutions

### Issue 1: "Cannot GET /"
**Problem:** Health check failing
**Solution:** Check logs in Northflank → Logs tab. Ensure PORT is 3001.

### Issue 2: OAuth Callback Not Working
**Problem:** "Redirect URI mismatch"
**Solution:**
- Double-check redirect URIs in LinkedIn/Instagram/TikTok developer consoles
- Ensure they match exactly (including https://)
- No trailing slashes

### Issue 3: Environment Variables Not Loading
**Problem:** `ENCRYPTION_KEY not set` in logs
**Solution:**
- Verify all environment variables are set in Northflank
- Restart the service after adding variables

### Issue 4: Build Failing
**Problem:** Docker build errors
**Solution:**
- Check **Build Logs** in Northflank
- Verify `Dockerfile` path is correct: `socialcraft-ai/backend/Dockerfile`
- Ensure `package.json` exists in backend directory

### Issue 5: Database Connection Issues
**Problem:** "Error connecting to Supabase"
**Solution:**
- Verify `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are correct
- Check Supabase dashboard → Settings → API for correct values
- Ensure RLS policies allow service role access

---

## 📊 Monitoring & Logs

### View Logs
1. Go to Northflank → Your Service → **"Logs"** tab
2. Filter by severity (Info, Warning, Error)
3. Search for specific errors

### Metrics
1. Go to **"Metrics"** tab
2. Monitor:
   - CPU usage
   - Memory usage
   - Request rate
   - Response time

### Alerts
Set up alerts for:
- High error rate
- High memory usage
- Service downtime

---

## 🔄 Continuous Deployment

**Northflank automatically redeploys when you push to GitHub!**

1. Make changes to your code
2. Commit and push to GitHub:
   ```bash
   git add .
   git commit -m "Update backend"
   git push
   ```
3. Northflank detects the push and rebuilds
4. New version deploys automatically

**To disable auto-deploy:**
- Go to Service Settings → **"Build & Deploy"**
- Disable **"Auto Deploy"**

---

## 💰 Cost Estimation

**Northflank Free Tier:**
- 2 services
- 0.2 vCPU per service
- 512 MB memory per service
- ✅ Sufficient for development/testing

**Paid Plans (if needed):**
- **Starter:** $20/month - 1 vCPU, 2 GB RAM
- **Pro:** $50/month - 2 vCPU, 4 GB RAM
- **Custom:** For production scale

**Recommendation for SocialCraft AI:**
- Start with **Free Tier** for testing
- Upgrade to **Starter** when launching
- Monitor usage in Northflank dashboard

---

## 🔐 Security Best Practices

1. ✅ **Never commit `.env` files** - Always use Northflank's environment variables
2. ✅ **Mark secrets as "Secret"** in Northflank - Hides values in UI/logs
3. ✅ **Rotate encryption keys** periodically
4. ✅ **Use HTTPS only** - Northflank provides this automatically
5. ✅ **Enable Northflank 2FA** - Protect your deployment account
6. ✅ **Restrict CORS** - Only allow your frontend domain
7. ✅ **Monitor logs** for suspicious activity

---

## 📚 Additional Resources

- [Northflank Documentation](https://northflank.com/docs)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [Node.js Dockerfile Best Practices](https://github.com/nodejs/docker-node/blob/main/docs/BestPractices.md)

---

## 🆘 Need Help?

**Northflank Support:**
- Live chat in dashboard
- Email: support@northflank.com
- Community Discord

**Project Issues:**
- GitHub Issues: `nivlewd1/SocialCraftAI/issues`

---

## ✨ Next Steps

After successful deployment:

1. ✅ Update frontend to use production backend URL
2. ✅ Test all OAuth flows end-to-end
3. ✅ Set up monitoring and alerts
4. ✅ Add Twitter and Pinterest OAuth routes
5. ✅ Implement direct publishing features

---

**Your backend is now live and ready to handle OAuth flows for social media integration!** 🎉
