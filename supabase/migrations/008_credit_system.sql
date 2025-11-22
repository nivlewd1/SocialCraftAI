-- =====================================================
-- SocialCraft AI - Credit-Based Pricing System Migration
-- =====================================================
-- Implements dual credit system:
-- - Subscription credits (reset monthly)
-- - Purchased credits (never expire)
-- Credit costs: Text=1, Image=15, Video=150
--
-- Plan Credit Allocations:
-- - Free ($0):    150 credits/month, 1 seat
-- - Starter ($19): 2,500 credits/month, 1 seat
-- - Pro ($59):     10,000 credits/month, 3 seats
-- - Agency ($249): 35,000 credits/month, unlimited seats (-1)
-- =====================================================

-- =====================================================
-- 1. CREATE SUBSCRIPTIONS TABLE (if not exists)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  plan_id text CHECK (plan_id IN ('free', 'starter', 'pro', 'agency')) DEFAULT 'free',
  stripe_customer_id text,
  stripe_subscription_id text,
  subscription_status text CHECK (subscription_status IN ('active', 'canceled', 'past_due', 'trialing', 'incomplete')) DEFAULT 'active',
  current_period_start timestamp with time zone DEFAULT now(),
  current_period_end timestamp with time zone,

  -- Credit system columns
  subscription_credits integer DEFAULT 150, -- Monthly allocation based on plan
  purchased_credits integer DEFAULT 0,      -- Purchased credits (never expire)
  credits_reset_at timestamp with time zone DEFAULT now(),

  -- Legacy column for migration (will be deprecated)
  generations_used integer DEFAULT 0,

  -- Trial tracking
  has_used_trial boolean DEFAULT false,

  -- Seat management for Pro/Agency tiers
  seats_used integer DEFAULT 1,
  seats_limit integer DEFAULT 1,

  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS subscriptions_user_id_idx ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS subscriptions_plan_id_idx ON public.subscriptions(plan_id);
CREATE INDEX IF NOT EXISTS subscriptions_stripe_customer_id_idx ON public.subscriptions(stripe_customer_id);

-- Enable RLS
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for re-running migration)
DROP POLICY IF EXISTS "Users can view own subscription" ON public.subscriptions;
DROP POLICY IF EXISTS "Users can insert own subscription" ON public.subscriptions;
DROP POLICY IF EXISTS "Users can update own subscription" ON public.subscriptions;
DROP POLICY IF EXISTS "Service role full access to subscriptions" ON public.subscriptions;

-- RLS Policies
CREATE POLICY "Users can view own subscription"
  ON public.subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own subscription"
  ON public.subscriptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own subscription"
  ON public.subscriptions FOR UPDATE
  USING (auth.uid() = user_id);

-- Service role needs full access for Stripe webhooks
CREATE POLICY "Service role full access to subscriptions"
  ON public.subscriptions FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- =====================================================
-- 2. ADD CREDIT COLUMNS TO EXISTING SUBSCRIPTIONS TABLE
-- =====================================================
-- (Safe to run multiple times - IF NOT EXISTS pattern)

DO $$
BEGIN
  -- Add subscription_credits column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'subscriptions' AND column_name = 'subscription_credits') THEN
    ALTER TABLE public.subscriptions ADD COLUMN subscription_credits integer DEFAULT 150;
  END IF;

  -- Add purchased_credits column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'subscriptions' AND column_name = 'purchased_credits') THEN
    ALTER TABLE public.subscriptions ADD COLUMN purchased_credits integer DEFAULT 0;
  END IF;

  -- Add credits_reset_at column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'subscriptions' AND column_name = 'credits_reset_at') THEN
    ALTER TABLE public.subscriptions ADD COLUMN credits_reset_at timestamp with time zone DEFAULT now();
  END IF;

  -- Add seats columns
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'subscriptions' AND column_name = 'seats_used') THEN
    ALTER TABLE public.subscriptions ADD COLUMN seats_used integer DEFAULT 1;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'subscriptions' AND column_name = 'seats_limit') THEN
    ALTER TABLE public.subscriptions ADD COLUMN seats_limit integer DEFAULT 1;
  END IF;
END $$;

-- =====================================================
-- 3. CREDIT TRANSACTIONS TABLE (Audit Trail)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.credit_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

  -- Transaction details
  amount integer NOT NULL, -- positive = add, negative = deduct
  credit_type text CHECK (credit_type IN ('subscription', 'purchased')) NOT NULL,
  action_type text CHECK (action_type IN (
    'text_generation',
    'image_generation',
    'video_generation',
    'subscription_reset',
    'topup_purchase',
    'plan_upgrade',
    'plan_downgrade',
    'refund',
    'manual_adjustment'
  )) NOT NULL,

  -- Balance snapshot
  subscription_balance_after integer NOT NULL,
  purchased_balance_after integer NOT NULL,

  -- Metadata for debugging/auditing
  metadata jsonb DEFAULT '{}'::jsonb,

  created_at timestamp with time zone DEFAULT now()
);

-- Indexes for performance and querying
CREATE INDEX IF NOT EXISTS credit_transactions_user_id_idx ON public.credit_transactions(user_id);
CREATE INDEX IF NOT EXISTS credit_transactions_created_at_idx ON public.credit_transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS credit_transactions_action_type_idx ON public.credit_transactions(action_type);

-- Enable RLS
ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own transactions" ON public.credit_transactions;
DROP POLICY IF EXISTS "Service role full access to transactions" ON public.credit_transactions;

-- RLS Policies (read-only for users, service role can insert)
CREATE POLICY "Users can view own transactions"
  ON public.credit_transactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service role full access to transactions"
  ON public.credit_transactions FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- =====================================================
-- 4. CREDIT DEDUCTION FUNCTION
-- =====================================================
-- Atomic function to deduct credits with proper priority:
-- 1. Subscription credits first (they expire)
-- 2. Purchased credits second (never expire)

CREATE OR REPLACE FUNCTION public.deduct_credits(
  p_user_id uuid,
  p_amount integer,
  p_action_type text
) RETURNS jsonb AS $$
DECLARE
  v_subscription_credits integer;
  v_purchased_credits integer;
  v_remaining integer;
  v_deducted_from_subscription integer := 0;
  v_deducted_from_purchased integer := 0;
  v_result jsonb;
BEGIN
  -- Validate amount
  IF p_amount <= 0 THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Amount must be positive'
    );
  END IF;

  -- Get current credits with row lock to prevent race conditions
  SELECT subscription_credits, purchased_credits
  INTO v_subscription_credits, v_purchased_credits
  FROM public.subscriptions
  WHERE user_id = p_user_id
  FOR UPDATE;

  -- Check if subscription exists
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'No subscription found for user'
    );
  END IF;

  -- Check if enough total credits
  IF (v_subscription_credits + v_purchased_credits) < p_amount THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Insufficient credits',
      'required', p_amount,
      'available', v_subscription_credits + v_purchased_credits
    );
  END IF;

  v_remaining := p_amount;

  -- Deduct from subscription credits first (they expire monthly)
  IF v_subscription_credits >= v_remaining THEN
    v_deducted_from_subscription := v_remaining;
    v_subscription_credits := v_subscription_credits - v_remaining;
    v_remaining := 0;
  ELSE
    v_deducted_from_subscription := v_subscription_credits;
    v_remaining := v_remaining - v_subscription_credits;
    v_subscription_credits := 0;
  END IF;

  -- Deduct remainder from purchased credits
  IF v_remaining > 0 THEN
    v_deducted_from_purchased := v_remaining;
    v_purchased_credits := v_purchased_credits - v_remaining;
  END IF;

  -- Update subscription with new balances
  UPDATE public.subscriptions
  SET
    subscription_credits = v_subscription_credits,
    purchased_credits = v_purchased_credits,
    updated_at = now()
  WHERE user_id = p_user_id;

  -- Log transaction
  INSERT INTO public.credit_transactions (
    user_id,
    amount,
    credit_type,
    action_type,
    subscription_balance_after,
    purchased_balance_after,
    metadata
  )
  VALUES (
    p_user_id,
    -p_amount,
    CASE WHEN v_deducted_from_subscription > 0 THEN 'subscription' ELSE 'purchased' END,
    p_action_type,
    v_subscription_credits,
    v_purchased_credits,
    jsonb_build_object(
      'deducted_from_subscription', v_deducted_from_subscription,
      'deducted_from_purchased', v_deducted_from_purchased
    )
  );

  -- Return success with new balances
  RETURN jsonb_build_object(
    'success', true,
    'subscription_credits', v_subscription_credits,
    'purchased_credits', v_purchased_credits,
    'total_credits', v_subscription_credits + v_purchased_credits,
    'deducted', p_amount
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 5. ADD CREDITS FUNCTION (for purchases and resets)
-- =====================================================
CREATE OR REPLACE FUNCTION public.add_credits(
  p_user_id uuid,
  p_amount integer,
  p_credit_type text, -- 'subscription' or 'purchased'
  p_action_type text
) RETURNS jsonb AS $$
DECLARE
  v_subscription_credits integer;
  v_purchased_credits integer;
BEGIN
  -- Validate inputs
  IF p_amount <= 0 THEN
    RETURN jsonb_build_object('success', false, 'error', 'Amount must be positive');
  END IF;

  IF p_credit_type NOT IN ('subscription', 'purchased') THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid credit type');
  END IF;

  -- Get current credits with lock
  SELECT subscription_credits, purchased_credits
  INTO v_subscription_credits, v_purchased_credits
  FROM public.subscriptions
  WHERE user_id = p_user_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'No subscription found');
  END IF;

  -- Add credits to appropriate pool
  IF p_credit_type = 'subscription' THEN
    v_subscription_credits := v_subscription_credits + p_amount;
  ELSE
    v_purchased_credits := v_purchased_credits + p_amount;
  END IF;

  -- Update subscription
  UPDATE public.subscriptions
  SET
    subscription_credits = v_subscription_credits,
    purchased_credits = v_purchased_credits,
    updated_at = now()
  WHERE user_id = p_user_id;

  -- Log transaction
  INSERT INTO public.credit_transactions (
    user_id, amount, credit_type, action_type,
    subscription_balance_after, purchased_balance_after
  )
  VALUES (
    p_user_id, p_amount, p_credit_type, p_action_type,
    v_subscription_credits, v_purchased_credits
  );

  RETURN jsonb_build_object(
    'success', true,
    'subscription_credits', v_subscription_credits,
    'purchased_credits', v_purchased_credits,
    'total_credits', v_subscription_credits + v_purchased_credits
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 6. MONTHLY CREDIT RESET FUNCTION
-- =====================================================
-- Called by cron job to reset subscription credits monthly
CREATE OR REPLACE FUNCTION public.reset_subscription_credits()
RETURNS void AS $$
DECLARE
  v_plan_credits jsonb := '{
    "free": 150,
    "starter": 2500,
    "pro": 10000,
    "agency": 35000
  }'::jsonb;
BEGIN
  -- Reset credits for subscriptions where:
  -- 1. Status is active
  -- 2. Reset date has passed
  UPDATE public.subscriptions
  SET
    subscription_credits = (v_plan_credits->>plan_id)::integer,
    credits_reset_at = now() + interval '1 month',
    updated_at = now()
  WHERE
    subscription_status = 'active'
    AND credits_reset_at <= now();

  -- Log all resets
  INSERT INTO public.credit_transactions (
    user_id, amount, credit_type, action_type,
    subscription_balance_after, purchased_balance_after, metadata
  )
  SELECT
    user_id,
    (v_plan_credits->>plan_id)::integer,
    'subscription',
    'subscription_reset',
    subscription_credits,
    purchased_credits,
    jsonb_build_object('plan', plan_id)
  FROM public.subscriptions
  WHERE
    subscription_status = 'active'
    AND credits_reset_at <= now() + interval '1 second'; -- Just reset
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 7. CHECK CREDITS FUNCTION (for frontend)
-- =====================================================
CREATE OR REPLACE FUNCTION public.check_credits(
  p_user_id uuid,
  p_required integer
) RETURNS jsonb AS $$
DECLARE
  v_subscription_credits integer;
  v_purchased_credits integer;
  v_total integer;
BEGIN
  SELECT subscription_credits, purchased_credits
  INTO v_subscription_credits, v_purchased_credits
  FROM public.subscriptions
  WHERE user_id = p_user_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'has_credits', false,
      'error', 'No subscription found'
    );
  END IF;

  v_total := v_subscription_credits + v_purchased_credits;

  RETURN jsonb_build_object(
    'has_credits', v_total >= p_required,
    'subscription_credits', v_subscription_credits,
    'purchased_credits', v_purchased_credits,
    'total_credits', v_total,
    'required', p_required,
    'shortfall', GREATEST(0, p_required - v_total)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 8. TOP-UP PACKS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.topup_packs (
  id text PRIMARY KEY,
  name text NOT NULL,
  credits integer NOT NULL,
  price_cents integer NOT NULL, -- Price in cents ($9 = 900)
  stripe_price_id text,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now()
);

-- Insert default top-up packs
INSERT INTO public.topup_packs (id, name, credits, price_cents) VALUES
  ('topup_small', 'Starter Pack', 500, 900),
  ('topup_medium', 'Growth Pack', 2500, 2500),
  ('topup_large', 'Bulk Pack', 6000, 4900)
ON CONFLICT (id) DO UPDATE SET
  credits = EXCLUDED.credits,
  price_cents = EXCLUDED.price_cents;

-- =====================================================
-- 9. UPDATE HANDLE_NEW_USER TRIGGER
-- =====================================================
-- Automatically create subscription with free tier credits
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- Create profile
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );

  -- Create free subscription with initial credits
  INSERT INTO public.subscriptions (
    user_id,
    plan_id,
    subscription_credits,
    purchased_credits,
    credits_reset_at,
    subscription_status
  )
  VALUES (
    new.id,
    'free',
    150,  -- Free tier monthly credits
    0,
    now() + interval '1 month',
    'active'
  );

  -- Log initial credit grant
  INSERT INTO public.credit_transactions (
    user_id, amount, credit_type, action_type,
    subscription_balance_after, purchased_balance_after,
    metadata
  )
  VALUES (
    new.id, 150, 'subscription', 'subscription_reset',
    150, 0,
    '{"event": "new_user_signup", "plan": "free"}'::jsonb
  );

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 10. GRANT EXECUTE PERMISSIONS
-- =====================================================
GRANT EXECUTE ON FUNCTION public.deduct_credits(uuid, integer, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.add_credits(uuid, integer, text, text) TO service_role;
GRANT EXECUTE ON FUNCTION public.check_credits(uuid, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.reset_subscription_credits() TO service_role;

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================
-- Next steps:
-- 1. Update Stripe products/prices for new tiers
-- 2. Configure Stripe webhooks for subscription events
-- 3. Add cron job for monthly credit resets
-- =====================================================
