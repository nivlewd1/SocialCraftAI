# ⚡ Quick Setup: Add app.promptoptimizer.app to Vercel

## 🎯 Goal
Set up `app.promptoptimizer.app` as your production domain in Vercel.

---

## ✅ Step-by-Step (5 Minutes)

### 1️⃣ Add Domain in Vercel

1. Open: https://vercel.com/nivlewd1s-projects/social-craft-ai/settings/domains
2. Click **"Add Domain"** button
3. Type: `app.promptoptimizer.app`
4. Click **"Add"**
5. ✅ Leave **"Connect to an environment"** as **Production**
6. Click **"Save"**

**Result:** Vercel shows waiting for DNS configuration

---

### 2️⃣ Add DNS Record

**Go to your domain registrar** (where you bought promptoptimizer.app)

**Add this CNAME record:**

| Field | Value |
|-------|-------|
| **Type** | CNAME |
| **Name** | app |
| **Value** | cname.vercel-dns.com |
| **TTL** | Auto or 3600 |

**Common Registrars:**

<details>
<summary><b>Namecheap</b></summary>

1. Dashboard → Domain List → promptoptimizer.app → **Manage**
2. **Advanced DNS** tab
3. **Add New Record**
4. Type: `CNAME Record`
5. Host: `app`
6. Value: `cname.vercel-dns.com`
7. **Save**
</details>

<details>
<summary><b>GoDaddy</b></summary>

1. Dashboard → My Products → promptoptimizer.app → **DNS**
2. **Add** (under Records)
3. Type: `CNAME`
4. Name: `app`
5. Value: `cname.vercel-dns.com`
6. **Save**
</details>

<details>
<summary><b>Cloudflare</b></summary>

1. Dashboard → promptoptimizer.app → **DNS**
2. **Add record**
3. Type: `CNAME`
4. Name: `app`
5. Target: `cname.vercel-dns.com`
6. Proxy: **DNS only** (gray cloud)
7. **Save**
</details>

**⏱️ Wait:** 10-30 minutes for DNS to propagate

---

### 3️⃣ Verify in Vercel

1. Go back to: https://vercel.com/nivlewd1s-projects/social-craft-ai/settings/domains
2. **Refresh page** after 10 minutes
3. Look for **✅ Valid Configuration**
4. SSL certificate will be issued automatically

---

### 4️⃣ Update Supabase

1. Open: https://app.supabase.com/project/eymamgnykuavpnvudxxs/auth/url-configuration
2. **Site URL:**
   ```
   https://app.promptoptimizer.app
   ```
3. **Redirect URLs** - Click "Add URL" for each:
   ```
   https://app.promptoptimizer.app
   https://app.promptoptimizer.app/auth/callback
   https://app.promptoptimizer.app/**
   ```
4. **Save**

---

### 5️⃣ Add Environment Variables

1. Open: https://vercel.com/nivlewd1s-projects/social-craft-ai/settings/environment-variables
2. Add these variables (select **Production** environment):

```
VITE_SUPABASE_URL
Value: https://eymamgnykuavpnvudxxs.supabase.co

VITE_SUPABASE_ANON_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV5bWFtZ255a3VhdnBudnVkeHhzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI4MzgwNzcsImV4cCI6MjA3ODQxNDA3N30.w9vWIxhZ9VQXnuHVPvgI4ifuMdzgqQUUkHoL5otj52M

GEMINI_API_KEY
Value: AIzaSyCrCBuLRK8t24v7t5gqSj1OspdHLh0IykA

VITE_GEMINI_API_KEY
Value: AIzaSyCrCBuLRK8t24v7t5gqSj1OspdHLh0IykA
```

3. **Save** each one

---

### 6️⃣ Redeploy

1. Go to: https://vercel.com/nivlewd1s-projects/social-craft-ai/deployments
2. Click **⋮** on the latest deployment
3. Click **"Redeploy"**

**Or push code:**
```bash
git add .
git commit -m "Add production config"
git push origin main
```

---

### 7️⃣ Test Your Site

**Wait 2-3 minutes for deployment**, then visit:

🚀 **https://app.promptoptimizer.app**

**Test checklist:**
- [ ] Site loads
- [ ] Click "Sign In" - modal appears centered
- [ ] Try signing up with email
- [ ] Try Google login
- [ ] Generate AI content

---

## ✅ Done!

Your app is live at **https://app.promptoptimizer.app**! 🎉

---

## ⚠️ Troubleshooting

**Domain not working?**
- Wait 30 more minutes (DNS can be slow)
- Check DNS: https://dnschecker.org/?domain=app.promptoptimizer.app
- Try incognito window

**OAuth not working?**
- Double-check Supabase redirect URLs
- Make sure you added `https://app.promptoptimizer.app/auth/callback`

**Need help?**
See full guide: `DEPLOYMENT_GUIDE.md`
