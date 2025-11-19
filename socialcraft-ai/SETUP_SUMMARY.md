# 🎯 Simple Setup Summary - app.promptoptimizer.app

## What You Need to Do (Choose One)

### Option 1: Quick Setup (Recommended)
📄 **Follow:** `VERCEL_QUICK_SETUP.md`
- Simple checklist format
- Takes 5-10 minutes
- Perfect for quick deployment

### Option 2: Detailed Setup
📄 **Follow:** `DEPLOYMENT_GUIDE.md`
- Complete step-by-step guide
- Includes troubleshooting
- Explains everything in detail

---

## 📝 Vercel Console Actions (Manual Steps)

Here's exactly what you need to do in Vercel:

### Step 1: Add Domain
**Where:** https://vercel.com/nivlewd1s-projects/social-craft-ai/settings/domains

**Action:**
1. Click "Add Domain"
2. Enter: `app.promptoptimizer.app`
3. Click "Add"

### Step 2: Add Environment Variables
**Where:** https://vercel.com/nivlewd1s-projects/social-craft-ai/settings/environment-variables

**Action:** Click "Add" for each variable, select "Production" environment:

```
Name: VITE_SUPABASE_URL
Value: [Your Supabase Project URL]

Name: VITE_SUPABASE_ANON_KEY
Value: [Your Supabase Anon Key]

Name: GEMINI_API_KEY
Value: [Your Gemini API Key]

Name: VITE_GEMINI_API_KEY
Value: [Your Gemini API Key]
```

**Get your values from:**
- Supabase: https://app.supabase.com/project/_/settings/api
- Gemini: https://aistudio.google.com/app/apikey

### Step 3: Redeploy
**Where:** https://vercel.com/nivlewd1s-projects/social-craft-ai/deployments

**Action:**
1. Click ⋮ (three dots) on latest deployment
2. Click "Redeploy"

---

## 🌐 DNS Configuration (Your Domain Registrar)

**You need to add this CNAME record in your domain's DNS settings:**

```
Type: CNAME
Host: app
Value: cname.vercel-dns.com
TTL: Auto or 3600
```

**Where to do this depends on your domain registrar** (see guides for specific instructions)

---

## 🔧 Supabase Configuration

**Where:** Supabase Dashboard → Your Project → Authentication → URL Configuration

**Actions:**

1. **Site URL:** Change to `https://app.promptoptimizer.app`

2. **Redirect URLs:** Add these:
   - `https://app.promptoptimizer.app`
   - `https://app.promptoptimizer.app/auth/callback`
   - `https://app.promptoptimizer.app/**`

3. Click "Save"

---

## ✅ Verification Checklist

After completing the above:

- [ ] Domain added in Vercel
- [ ] DNS CNAME record added
- [ ] Environment variables added in Vercel
- [ ] Supabase redirect URLs updated
- [ ] Redeployed in Vercel
- [ ] Waited 10-30 minutes for DNS
- [ ] Visited https://app.promptoptimizer.app
- [ ] Tested sign in/sign up

---

## 🎉 Success!

Once DNS propagates and deployment completes:

**Your app:** https://app.promptoptimizer.app

**Local dev still works:** http://localhost:3000

---

## 🆘 Quick Troubleshooting

**Domain not working?**
- Wait longer (DNS can take up to 1 hour)
- Check: https://dnschecker.org/?domain=app.promptoptimizer.app

**Sign in broken?**
- Check Supabase redirect URLs
- Try incognito window
- Clear browser cache

**Still having issues?**
- See detailed troubleshooting in `DEPLOYMENT_GUIDE.md`

---

## 📚 Files Reference

| File | Purpose |
|------|---------|
| `VERCEL_QUICK_SETUP.md` | Quick checklist (5 min setup) |
| `DEPLOYMENT_GUIDE.md` | Detailed step-by-step guide |
| `SETUP_SUMMARY.md` | This file - quick overview |
| `vercel.json` | Production config (auto-used) |

---

**Ready to deploy? Start with `VERCEL_QUICK_SETUP.md`!** 🚀
