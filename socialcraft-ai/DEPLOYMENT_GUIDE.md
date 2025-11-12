# 🚀 SocialCraft AI - Deployment Guide

## Production Deployment to app.promptoptimizer.app

This guide walks you through deploying SocialCraft AI to your custom subdomain.

---

## 📋 Prerequisites

- ✅ Vercel account with SocialCraft AI project
- ✅ Access to `promptoptimizer.app` DNS settings
- ✅ Supabase project set up
- ✅ GitHub repository connected to Vercel

---

## Step 1: Add Custom Domain in Vercel

### 1.1 Navigate to Domain Settings

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your **social-craft-ai** project
3. Click **Settings** (top navigation)
4. Click **Domains** (left sidebar)

### 1.2 Add Subdomain

1. Click **Add Domain** button
2. Enter: `app.promptoptimizer.app`
3. Click **Add**

**Vercel will show:**
- ✅ Recommended configuration
- ⚠️ Waiting for DNS configuration

---

## Step 2: Configure DNS (Choose Your Registrar)

Vercel will display the DNS records you need. You'll add a **CNAME record**.

### If using Namecheap:

1. Go to [Namecheap Dashboard](https://www.namecheap.com/myaccount/login/)
2. Click **Domain List** → Find `promptoptimizer.app`
3. Click **Manage** → **Advanced DNS** tab
4. Click **Add New Record**
5. Fill in:
   ```
   Type: CNAME Record
   Host: app
   Value: cname.vercel-dns.com
   TTL: Automatic (or 300)
   ```
6. Click **Save Changes**

### If using GoDaddy:

1. Go to [GoDaddy DNS Management](https://dcc.godaddy.com/manage/dns)
2. Find `promptoptimizer.app` → Click **DNS**
3. Click **Add** under Records
4. Fill in:
   ```
   Type: CNAME
   Name: app
   Value: cname.vercel-dns.com
   TTL: 1 Hour
   ```
5. Click **Save**

### If using Cloudflare:

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Select `promptoptimizer.app`
3. Click **DNS** tab
4. Click **Add record**
5. Fill in:
   ```
   Type: CNAME
   Name: app
   Target: cname.vercel-dns.com
   Proxy status: DNS only (gray cloud)
   TTL: Auto
   ```
6. Click **Save**

**⏱️ Wait Time:** 5-60 minutes for DNS propagation

---

## Step 3: Verify Domain in Vercel

### 3.1 Check Status

1. Go back to Vercel → Settings → Domains
2. Refresh the page after 10 minutes
3. You should see:
   - ✅ **Valid Configuration** (green checkmark)
   - 🔒 SSL Certificate issued automatically

### 3.2 Set as Production Domain (Optional)

1. If you want `app.promptoptimizer.app` as the primary domain:
   - Click the **⋮** menu next to the domain
   - Select **Set as Primary Domain**

---

## Step 4: Update Environment Variables in Vercel

### 4.1 Add/Update Variables

1. Vercel → Settings → **Environment Variables**
2. Update or add these variables:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
GEMINI_API_KEY=your_gemini_api_key
VITE_GEMINI_API_KEY=your_gemini_api_key
```

**Get these values from:**
- Supabase: Dashboard → Settings → API
- Gemini: https://aistudio.google.com/app/apikey

3. Make sure to select **Production** environment
4. Click **Save**

---

## Step 5: Update Supabase Redirect URLs

### 5.1 Add Production URLs

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project → **Authentication**
3. Click **URL Configuration** (left sidebar)

### 5.2 Update Site URL

**Site URL:**
```
https://app.promptoptimizer.app
```

### 5.3 Add Redirect URLs

Click **Add URL** and add these one by one:

```
https://app.promptoptimizer.app
https://app.promptoptimizer.app/auth/callback
https://app.promptoptimizer.app/**
http://localhost:3000
http://localhost:3000/auth/callback
```

**Why multiple URLs?**
- Production: `app.promptoptimizer.app`
- Localhost: For local development
- Wildcards: Catch all auth routes

### 5.4 Save Changes

Click **Save** at the bottom

---

## Step 6: Update OAuth Providers in Supabase

If using Google/GitHub OAuth, update redirect URIs:

### Google OAuth:

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Select your project → **APIs & Services** → **Credentials**
3. Click your OAuth 2.0 Client ID
4. Under **Authorized redirect URIs**, add:
   ```
   https://eymamgnykuavpnvudxxs.supabase.co/auth/v1/callback
   ```
5. Save

### GitHub OAuth:

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click your OAuth App
3. Update **Authorization callback URL**:
   ```
   https://eymamgnykuavpnvudxxs.supabase.co/auth/v1/callback
   ```
4. Update

---

## Step 7: Deploy to Production

### 7.1 Commit Changes

```bash
cd C:\Users\nivle\SocialCraftAI\socialcraft-ai
git add vercel.json DEPLOYMENT_GUIDE.md
git commit -m "Add production configuration for app.promptoptimizer.app"
git push origin main
```

### 7.2 Trigger Deployment

Vercel will automatically deploy when you push to `main`.

**Or manually redeploy:**
1. Vercel → Deployments tab
2. Click **⋮** on latest deployment
3. Click **Redeploy**

---

## Step 8: Test Production Deployment

### 8.1 Wait for Deployment

- Check Vercel dashboard for deployment status
- Usually takes 2-3 minutes

### 8.2 Visit Your Site

Open: **https://app.promptoptimizer.app**

### 8.3 Test Checklist

**Basic Functionality:**
- [ ] Site loads without errors
- [ ] No console errors (F12 → Console)
- [ ] Styling looks correct

**Authentication:**
- [ ] Click "Sign In" button
- [ ] Modal appears centered
- [ ] Try email/password signup
- [ ] Check email for verification
- [ ] Try Google OAuth login
- [ ] Try GitHub OAuth login
- [ ] Verify you're logged in (email shows in header)

**Features:**
- [ ] AI Generator page works
- [ ] Can generate content with Gemini API
- [ ] Trends page loads
- [ ] Media Studio works
- [ ] Drafts save (check Supabase dashboard)

### 8.4 Check Supabase Users

1. Supabase Dashboard → **Authentication** → **Users**
2. You should see your test user(s)

---

## Step 9: Update Backend (Northflank)

If you haven't deployed the backend yet, you'll need to:

### 9.1 Set Backend Environment Variables

In Northflank (or wherever you host the backend):

```env
SUPABASE_URL=https://eymamgnykuavpnvudxxs.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
FRONTEND_URL=https://app.promptoptimizer.app
BACKEND_URL=https://your-backend.northflank.app

# Social Media OAuth (if using)
LINKEDIN_CLIENT_ID=...
INSTAGRAM_CLIENT_ID=...
TIKTOK_CLIENT_KEY=...
```

### 9.2 Update CORS

Make sure backend allows requests from your production domain.

---

## 🎉 Deployment Complete!

Your app is now live at: **https://app.promptoptimizer.app**

---

## 🔧 Troubleshooting

### Domain Not Working

**Problem:** `app.promptoptimizer.app` doesn't load

**Solutions:**
1. Check DNS propagation: https://dnschecker.org
2. Wait 30-60 minutes for DNS to propagate
3. Clear browser cache (Ctrl+Shift+Delete)
4. Try incognito/private window

### SSL Certificate Error

**Problem:** "Not Secure" warning

**Solutions:**
1. Vercel auto-issues SSL (takes 5-10 min after DNS is valid)
2. Check Vercel dashboard for SSL status
3. Wait and refresh

### OAuth Not Working

**Problem:** OAuth login fails or redirects incorrectly

**Solutions:**
1. Verify Supabase redirect URLs include production domain
2. Check Google/GitHub OAuth settings
3. Clear cookies and try again
4. Check browser console for errors

### "API Key Invalid" Error

**Problem:** Gemini API key not working

**Solutions:**
1. Verify environment variables in Vercel
2. Make sure both `GEMINI_API_KEY` and `VITE_GEMINI_API_KEY` are set
3. Redeploy after adding env vars
4. Get new API key if needed: https://aistudio.google.com/app/apikey

### Blank Page After Login

**Problem:** Page is blank or infinite loading

**Solutions:**
1. Check browser console (F12) for errors
2. Verify Supabase redirect URLs
3. Clear site data (F12 → Application → Clear storage)
4. Try signing out and back in

---

## 📊 Monitoring

### Check Deployment Logs

1. Vercel → Deployments → Click deployment
2. View **Build Logs** and **Function Logs**
3. Look for errors

### Check Analytics

1. Vercel → Analytics tab
2. Monitor traffic and errors

### Supabase Monitoring

1. Supabase → Settings → API
2. Check API usage
3. Monitor auth events

---

## 🔄 Updating the App

Whenever you make code changes:

```bash
git add .
git commit -m "Your changes"
git push origin main
```

Vercel automatically deploys! 🚀

---

## 📞 Need Help?

- Vercel Docs: https://vercel.com/docs
- Supabase Docs: https://supabase.com/docs
- DNS Checker: https://dnschecker.org

---

**Your production app:** https://app.promptoptimizer.app ✨
