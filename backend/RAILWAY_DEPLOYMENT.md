# Railway Deployment Guide - SocialCraft AI Backend

This guide walks you through deploying the SocialCraft AI Express.js backend to Railway using GitHub.

---

## ✨ Why Railway?

- ✅ **Simple deployment** - Deploy in 5 minutes
- ✅ **Auto-detects Dockerfile** - No configuration needed
- ✅ **Built-in CI/CD** - Auto-deploy on git push
- ✅ **Affordable** - ~$5-20/month (pay as you go)
- ✅ **HTTPS included** - SSL certificates automatic
- ✅ **No Kubernetes** - Simple infrastructure

---

## 🚀 Quick Start (Deploy from GitHub)

### Prerequisites

- ✅ Railway account ([Sign up free](https://railway.app/))
- ✅ GitHub account with this repository
- ✅ Supabase project credentials
- ✅ OAuth credentials (LinkedIn, Instagram, TikTok)
- ✅ Encryption key generated

---

## 📋 Step-by-Step Deployment

### Step 1: Sign Up for Railway

1. Go to [railway.app](https://railway.app/)
2. Click **"Login"** or **"Start a New Project"**
3. Sign in with **GitHub** (recommended)
4. Authorize Railway to access your GitHub account

---

### Step 2: Create New Project

1. Click **"New Project"**
2. Select **"Deploy from GitHub repo"**
3. Choose your repository: **`nivlewd1/SocialCraftAI`**
4. Railway will scan your repository

---

### Step 3: Configure Service

1. Railway auto-detects the Dockerfile ✅
2. **Set Root Directory:**
   - Click on your service
   - Go to **"Settings"** tab
   - Find **"Root Directory"**
   - Set to: `socialcraft-ai/backend`
   - Click **"Update"**

3. **Verify Build Settings:**
   - **Builder:** Docker (should auto-detect)
   - **Dockerfile Path:** `Dockerfile` (auto-detected)
   - **Build Command:** (leave empty - Docker handles it)

---

### Step 4: Add Environment Variables

1. Click on your service
2. Go to **"Variables"** tab
3. Click **"+ New Variable"**
4. Add each variable below:

```env
# ===================================
# REQUIRED - Supabase Configuration
# ===================================
SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.xxxxxxxxxxxxx

# ===================================
# REQUIRED - Server Configuration
# ===================================
NODE_ENV=production
PORT=3001

# ===================================
# REQUIRED - Security
# ===================================
# Generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
ENCRYPTION_KEY=your_64_character_hex_string_here

# ===================================
# IMPORTANT - Will update after first deploy
# ===================================
FRONTEND_URL=https://socialcraft-ai.vercel.app
BACKEND_URL=https://your-app.up.railway.app

# ===================================
# OAuth - LinkedIn
# ===================================
LINKEDIN_CLIENT_ID=your_linkedin_client_id
LINKEDIN_CLIENT_SECRET=your_linkedin_client_secret
LINKEDIN_REDIRECT_URI=https://your-app.up.railway.app/api/oauth/linkedin/callback

# ===================================
# OAuth - Instagram
# ===================================
INSTAGRAM_CLIENT_ID=your_instagram_app_id
INSTAGRAM_CLIENT_SECRET=your_instagram_app_secret
INSTAGRAM_REDIRECT_URI=https://your-app.up.railway.app/api/oauth/instagram/callback

# ===================================
# OAuth - TikTok
# ===================================
TIKTOK_CLIENT_KEY=your_tiktok_client_key
TIKTOK_CLIENT_SECRET=your_tiktok_client_secret
TIKTOK_REDIRECT_URI=https://your-app.up.railway.app/api/oauth/tiktok/callback
```

**Where to get these values:**
- **Supabase**: Dashboard → Settings → API
- **OAuth credentials**: LinkedIn/Instagram/TikTok developer consoles
- **Encryption key**: Run `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

---

### Step 5: Deploy!

1. Click **"Deploy"** (or it may auto-deploy)
2. Watch the build logs in real-time
3. Wait 2-5 minutes for first deployment

**Expected build output:**
```
Building Docker image...
[+] Building 45.2s (10/10) FINISHED
Successfully built image
Starting container...
Server is listening on port 3001
✅ Deployment successful
```

---

### Step 6: Get Your Railway URL

After deployment:

1. Go to **"Settings"** tab
2. Scroll to **"Domains"**
3. Copy your Railway domain (e.g., `your-app.up.railway.app`)

**OR generate custom domain:**
- Click **"Generate Domain"**
- Railway creates: `your-service-name.up.railway.app`

---

### Step 7: Update Environment Variables

Now that you have your Railway URL, update these variables:

1. Go back to **"Variables"** tab
2. Update:
   ```env
   BACKEND_URL=https://your-app.up.railway.app
   LINKEDIN_REDIRECT_URI=https://your-app.up.railway.app/api/oauth/linkedin/callback
   INSTAGRAM_REDIRECT_URI=https://your-app.up.railway.app/api/oauth/instagram/callback
   TIKTOK_REDIRECT_URI=https://your-app.up.railway.app/api/oauth/tiktok/callback
   ```
3. Service will **auto-restart** with new variables

---

### Step 8: Update OAuth Redirect URIs

**CRITICAL:** Update redirect URIs in each platform's developer console:

#### LinkedIn Developer Console
1. Go to [LinkedIn Developers](https://www.linkedin.com/developers/apps)
2. Select your app → **"Auth"** tab
3. Update **"Redirect URLs"**:
   ```
   https://your-app.up.railway.app/api/oauth/linkedin/callback
   ```
4. Click **"Update"**

#### Instagram/Facebook Developer Console
1. Go to [Meta for Developers](https://developers.facebook.com/apps)
2. Select your app → **"Instagram Basic Display"**
3. Update **"Valid OAuth Redirect URIs"**:
   ```
   https://your-app.up.railway.app/api/oauth/instagram/callback
   ```
4. Click **"Save Changes"**

#### TikTok Developer Console
1. Go to [TikTok Developers](https://developers.tiktok.com/)
2. Select your app → **"Login Kit"**
3. Update **"Redirect URLs"**:
   ```
   https://your-app.up.railway.app/api/oauth/tiktok/callback
   ```
4. Click **"Save"**

---

## ✅ Verify Deployment

### Test 1: Health Check
```bash
curl https://your-app.up.railway.app/
```
**Expected:** `"SocialCraft AI Backend is running!"`

### Test 2: OAuth Flow (Manual)
Visit: `https://your-app.up.railway.app/api/oauth/linkedin`

Should redirect to LinkedIn login.

### Test 3: Connected Accounts API
```bash
curl -H "Authorization: Bearer YOUR_SUPABASE_JWT" \
     https://your-app.up.railway.app/api/oauth/connected
```

---

## 🔄 Continuous Deployment

Railway automatically redeploys when you push to GitHub!

**To deploy changes:**
```bash
git add .
git commit -m "Update backend"
git push origin main
```

Railway detects the push and rebuilds automatically ✨

**To disable auto-deploy:**
- Service Settings → **"Build & Deploy"**
- Uncheck **"Automatic Deploys"**

---

## 📊 Monitoring & Logs

### View Logs
1. Click on your service
2. Go to **"Logs"** tab
3. See real-time logs from your application

### Metrics
1. Go to **"Metrics"** tab
2. Monitor:
   - CPU usage
   - Memory usage
   - Network usage
   - Request count

### Alerts
Set up alerts in Railway dashboard:
- High resource usage
- Deployment failures
- Service crashes

---

## 💰 Cost Estimation

**Railway Pricing (Pay-as-you-go):**

**Starter Plan (Recommended):**
- $5/month for 512MB RAM, 1 vCPU
- Includes $5 usage credit
- Additional usage: ~$0.000463/GB-hour RAM

**Pro Plan (for production):**
- $20/month
- Includes $20 usage credit
- Priority support
- Custom domains

**Estimated Monthly Cost for SocialCraft AI:**
```
Starter Plan:        $5-15/month
Pro Plan:            $20-40/month
```

**Usage included in plans covers most small-medium apps.**

---

## 🔧 Troubleshooting

### Issue 1: Build Failing

**Error:** `Cannot find Dockerfile`

**Solution:**
- Check Root Directory is set to `socialcraft-ai/backend`
- Verify Dockerfile exists in that path on GitHub

---

### Issue 2: Port Configuration Error

**Error:** `Application failed to respond`

**Solution:**
- Railway automatically sets `PORT` environment variable
- Our Dockerfile already uses `PORT=3001`
- Verify in Variables tab: `PORT=3001`

---

### Issue 3: Environment Variables Not Loading

**Error:** `Missing Supabase environment variables`

**Solution:**
- Check all required variables are set in Variables tab
- No quotes needed around values
- Click service restart after adding variables

---

### Issue 4: OAuth Callbacks Not Working

**Error:** `Redirect URI mismatch`

**Solution:**
- Verify Railway URL matches redirect URIs exactly
- No trailing slashes
- Must use HTTPS (Railway provides automatically)
- Check developer console settings for each platform

---

### Issue 5: Database Connection Issues

**Error:** `Error connecting to Supabase`

**Solution:**
- Verify `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`
- Check Supabase project is active
- Verify RLS policies allow service role access

---

## 🎛️ Advanced Configuration

### Custom Domain

1. Go to **"Settings"** → **"Domains"**
2. Click **"Custom Domain"**
3. Add your domain (e.g., `api.socialcraft.ai`)
4. Configure DNS records (Railway provides instructions)
5. SSL certificate auto-provisioned

### Health Checks

Railway automatically uses Docker `HEALTHCHECK`:
```dockerfile
HEALTHCHECK --interval=30s --timeout=3s --start-period=30s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/', ...);"
```

Already configured in your Dockerfile ✅

### Scaling

**Vertical Scaling (more resources):**
- Service Settings → **"Resources"**
- Adjust CPU/Memory sliders
- Pay-as-you-go pricing applies

**Horizontal Scaling (multiple instances):**
- Available on Pro plan
- Contact Railway support

---

## 🔐 Security Best Practices

1. ✅ **Secrets in Variables** - Never commit to GitHub
2. ✅ **HTTPS Only** - Railway provides by default
3. ✅ **Encryption Key** - Use strong random key
4. ✅ **Service Role Key** - Keep secret, don't share
5. ✅ **Rotate Keys** - Periodically update credentials
6. ✅ **Monitor Logs** - Watch for suspicious activity

---

## 🆚 Railway vs Northflank BYOC

| Feature | Railway | Northflank BYOC |
|---------|---------|-----------------|
| **Setup Time** | 5 minutes | Hours (cluster setup) |
| **Cost** | $5-40/month | $100-200+/month |
| **Complexity** | Beginner-friendly | Requires Kubernetes knowledge |
| **Infrastructure** | Railway-managed | Your cloud account |
| **Scaling** | Automatic | Manual configuration |
| **Best For** | Startups, MVPs | Enterprise, high-scale |

---

## 🚀 Next Steps After Deployment

1. ✅ **Update Frontend**
   - Set `VITE_BACKEND_URL` to Railway URL
   - Redeploy frontend to Vercel

2. ✅ **Test OAuth Flows**
   - Connect LinkedIn account
   - Connect Instagram account
   - Connect TikTok account

3. ✅ **Build Frontend Integration**
   - Create IntegrationsSettings.tsx
   - Add "Integrations" tab to Settings

4. ✅ **Add More Platforms**
   - Twitter OAuth routes
   - Pinterest OAuth routes

5. ✅ **Implement Publishing**
   - Direct post to social media
   - Scheduling with status tracking

---

## 📚 Resources

- [Railway Documentation](https://docs.railway.app/)
- [Railway Discord Community](https://discord.gg/railway)
- [Railway Status Page](https://status.railway.app/)

---

## 🆘 Need Help?

**Railway Support:**
- Help docs: https://docs.railway.app/
- Discord: https://discord.gg/railway
- Email: team@railway.app

**Project Issues:**
- GitHub Issues: `nivlewd1/SocialCraftAI/issues`

---

**Your backend is ready to deploy to Railway!** 🎉

The entire process takes about 10-15 minutes from start to finish.
