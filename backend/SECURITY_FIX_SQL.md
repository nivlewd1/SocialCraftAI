# Security Fix for Database Function Search Path Warnings

This document contains SQL to fix the "Function Search Path Mutable" security warnings in Supabase.

## What's the Issue?

Functions without a fixed `search_path` are vulnerable to search path hijacking attacks. An attacker could potentially create malicious functions in their schema that override legitimate ones.

## Severity

**WARN** level - Should be fixed before production deployment.

---

## SQL Fixes to Run in Supabase SQL Editor

### 1. Fix encrypt_token and decrypt_token (Optional - only if you want database-level encryption)

**Note:** The backend already uses application-level encryption in `socialAuthService.js`. You only need these functions if you want **additional** database-level encryption.

```sql
-- Drop existing functions
DROP FUNCTION IF EXISTS public.encrypt_token(text);
DROP FUNCTION IF EXISTS public.decrypt_token(bytea);

-- Create secure versions with fixed search_path
CREATE OR REPLACE FUNCTION public.encrypt_token(token text)
RETURNS bytea AS $$
BEGIN
  RETURN pgp_sym_encrypt(token, current_setting('app.encryption_key'));
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp;

CREATE OR REPLACE FUNCTION public.decrypt_token(encrypted_token bytea)
RETURNS text AS $$
BEGIN
  RETURN pgp_sym_decrypt(encrypted_token, current_setting('app.encryption_key'));
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp;
```

---

### 2. Fix update_updated_at_column

```sql
-- Drop existing function
DROP FUNCTION IF EXISTS public.update_updated_at_column() CASCADE;

-- Recreate with fixed search_path
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql
SET search_path = public, pg_temp;

-- Recreate triggers that depend on this function
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

CREATE TRIGGER update_drafts_updated_at
  BEFORE UPDATE ON public.drafts
  FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

CREATE TRIGGER update_scheduled_posts_updated_at
  BEFORE UPDATE ON public.scheduled_posts
  FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

CREATE TRIGGER update_media_updated_at
  BEFORE UPDATE ON public.media
  FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

CREATE TRIGGER update_analytics_cache_updated_at
  BEFORE UPDATE ON public.analytics_cache
  FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();
```

---

### 3. Fix handle_new_user

```sql
-- Drop existing function and trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- Recreate with fixed search_path
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url, updated_at)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url',
    NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp;

-- Recreate trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
```

---

### 4. Fix update_updated_at

```sql
-- Drop existing function
DROP FUNCTION IF EXISTS public.update_updated_at() CASCADE;

-- Recreate with fixed search_path
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql
SET search_path = public, pg_temp;

-- Recreate trigger for connected_accounts
CREATE TRIGGER update_connected_accounts_updated_at
  BEFORE UPDATE ON public.connected_accounts
  FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at();
```

---

### 5. Fix delete_expired_analytics_cache

```sql
-- Drop existing function
DROP FUNCTION IF EXISTS public.delete_expired_analytics_cache() CASCADE;

-- Recreate with fixed search_path
CREATE OR REPLACE FUNCTION public.delete_expired_analytics_cache()
RETURNS void AS $$
BEGIN
  DELETE FROM public.analytics_cache
  WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp;
```

---

## How to Apply These Fixes

### Option 1: Run All Fixes at Once (Recommended)

Copy and paste all the SQL above into the Supabase SQL Editor and run it.

### Option 2: Run Individually

Run each section one at a time, starting with the most critical ones:
1. ✅ `update_updated_at` and `update_updated_at_column` (used by triggers)
2. ✅ `handle_new_user` (critical for new user creation)
3. ✅ `delete_expired_analytics_cache` (less critical, used for cleanup)
4. ⚠️  `encrypt_token` and `decrypt_token` (optional - only if using database-level encryption)

---

## After Running the Fixes

1. **Verify the warnings are gone:**
   - Go to Supabase Dashboard → Database → Reports → Linter
   - The warnings should disappear

2. **Test functionality:**
   - Create a new user account (tests `handle_new_user`)
   - Update a profile (tests `update_updated_at_column`)
   - Connect a social account (tests `update_updated_at`)

---

## Important Notes

### Application-Level vs Database-Level Encryption

**Your backend already has application-level encryption** in `socialAuthService.js`. This means:
- ✅ Tokens are encrypted before being saved to the database
- ✅ Tokens are decrypted when fetched from the database
- ✅ No database schema changes required
- ✅ No need to use `encrypt_token()` and `decrypt_token()` functions

**If you want to use database-level encryption instead:**
1. You would need to change the `access_token` column type from `text` to `bytea`
2. Update all queries to use `encrypt_token()` and `decrypt_token()`
3. This is **NOT recommended** - application-level encryption is simpler and sufficient

### Recommendation

**Only fix these functions:**
- ✅ `update_updated_at_column`
- ✅ `handle_new_user`
- ✅ `update_updated_at`
- ✅ `delete_expired_analytics_cache`

**Skip these (you don't need them):**
- ❌ `encrypt_token`
- ❌ `decrypt_token`

Then **drop the unused encryption functions:**

```sql
DROP FUNCTION IF EXISTS public.encrypt_token(text);
DROP FUNCTION IF EXISTS public.decrypt_token(bytea);
```

This will remove the warnings for those functions entirely since you're using application-level encryption instead.

---

## Summary

Run this minimal SQL to fix all warnings:

```sql
-- Fix update_updated_at_column
DROP FUNCTION IF EXISTS public.update_updated_at_column() CASCADE;
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public, pg_temp;

-- Recreate triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();
CREATE TRIGGER update_drafts_updated_at BEFORE UPDATE ON public.drafts FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();
CREATE TRIGGER update_scheduled_posts_updated_at BEFORE UPDATE ON public.scheduled_posts FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();
CREATE TRIGGER update_media_updated_at BEFORE UPDATE ON public.media FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();
CREATE TRIGGER update_analytics_cache_updated_at BEFORE UPDATE ON public.analytics_cache FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

-- Fix handle_new_user
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url, updated_at)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'avatar_url', NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Fix update_updated_at
DROP FUNCTION IF EXISTS public.update_updated_at() CASCADE;
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public, pg_temp;
CREATE TRIGGER update_connected_accounts_updated_at BEFORE UPDATE ON public.connected_accounts FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at();

-- Fix delete_expired_analytics_cache
DROP FUNCTION IF EXISTS public.delete_expired_analytics_cache() CASCADE;
CREATE OR REPLACE FUNCTION public.delete_expired_analytics_cache()
RETURNS void AS $$
BEGIN
  DELETE FROM public.analytics_cache WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

-- Drop unused database encryption functions (we use application-level encryption)
DROP FUNCTION IF EXISTS public.encrypt_token(text);
DROP FUNCTION IF EXISTS public.decrypt_token(bytea);
```

**This will resolve all 7 security warnings!** ✅
