import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '../config/supabase';
import {
  PlanType,
  GenerationType,
  getPlanById,
  getCreditCost,
  hasEnoughCredits,
  canGenerateVideo,
  hasWatermark,
  CREDIT_COSTS,
} from '../config/pricing';

// =====================================================
// Types
// =====================================================
interface SubscriptionData {
  plan: PlanType;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  subscriptionStatus?: 'active' | 'canceled' | 'past_due' | 'trialing' | 'incomplete';
  currentPeriodEnd?: string;

  // Credit system
  subscriptionCredits: number;
  purchasedCredits: number;
  totalCredits: number;
  creditsResetAt?: string;

  // Plan limits
  monthlyCreditsLimit: number;
  seatsUsed: number;
  seatsLimit: number;

  // Feature flags
  canAccessVideo: boolean;
  hasWatermark: boolean;

  // Legacy (for migration)
  generationsUsed?: number;
  hasUsedTrial: boolean;
}

interface CreditCheckResult {
  hasCredits: boolean;
  subscriptionCredits: number;
  purchasedCredits: number;
  totalCredits: number;
  required: number;
  shortfall: number;
}

interface DeductResult {
  success: boolean;
  subscriptionCredits: number;
  purchasedCredits: number;
  totalCredits: number;
  deducted: number;
  error?: string;
}

interface SubscriptionContextType {
  subscription: SubscriptionData | null;
  loading: boolean;

  // Credit operations
  canAfford: (type: GenerationType) => boolean;
  deductCredits: (type: GenerationType) => Promise<DeductResult>;
  checkCredits: (amount: number) => Promise<CreditCheckResult>;

  // Feature checks
  canGenerate: boolean;
  canGenerateType: (type: GenerationType) => boolean;

  // Subscription management
  refreshSubscription: () => Promise<void>;

  // Legacy support (to be deprecated)
  incrementUsage: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType>({
  subscription: null,
  loading: true,
  canAfford: () => false,
  deductCredits: async () => ({ success: false, subscriptionCredits: 0, purchasedCredits: 0, totalCredits: 0, deducted: 0, error: 'Not initialized' }),
  checkCredits: async () => ({ hasCredits: false, subscriptionCredits: 0, purchasedCredits: 0, totalCredits: 0, required: 0, shortfall: 0 }),
  canGenerate: false,
  canGenerateType: () => false,
  refreshSubscription: async () => {},
  incrementUsage: async () => {},
});

export const useSubscription = () => useContext(SubscriptionContext);

export const SubscriptionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);

  // =====================================================
  // Fetch subscription data
  // =====================================================
  const fetchSubscription = useCallback(async () => {
    if (!user) {
      setSubscription(null);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching subscription:', error);
        await createDefaultSubscription();
        return;
      }

      if (!data) {
        await createDefaultSubscription();
        return;
      }

      const planInfo = getPlanById(data.plan_id as PlanType);
      const subscriptionCredits = data.subscription_credits ?? 0;
      const purchasedCredits = data.purchased_credits ?? 0;

      setSubscription({
        plan: data.plan_id as PlanType,
        stripeCustomerId: data.stripe_customer_id,
        stripeSubscriptionId: data.stripe_subscription_id,
        subscriptionStatus: data.subscription_status,
        currentPeriodEnd: data.current_period_end,

        // Credit system
        subscriptionCredits,
        purchasedCredits,
        totalCredits: subscriptionCredits + purchasedCredits,
        creditsResetAt: data.credits_reset_at,

        // Plan limits
        monthlyCreditsLimit: planInfo?.limits.monthlyCredits ?? 150,
        seatsUsed: data.seats_used ?? 1,
        seatsLimit: planInfo?.limits.seats ?? 1,

        // Feature flags
        canAccessVideo: canGenerateVideo(data.plan_id as PlanType),
        hasWatermark: hasWatermark(data.plan_id as PlanType),

        // Legacy
        generationsUsed: data.generations_used ?? 0,
        hasUsedTrial: data.has_used_trial ?? false,
      });
    } catch (err) {
      console.error('Error in fetchSubscription:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // =====================================================
  // Create default free subscription
  // =====================================================
  const createDefaultSubscription = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .insert({
          user_id: user.id,
          plan_id: 'free',
          subscription_credits: 150,
          purchased_credits: 0,
          credits_reset_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          subscription_status: 'active',
          seats_used: 1,
          seats_limit: 1,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating default subscription:', error);
        return;
      }

      setSubscription({
        plan: 'free',
        subscriptionCredits: 150,
        purchasedCredits: 0,
        totalCredits: 150,
        creditsResetAt: data.credits_reset_at,
        monthlyCreditsLimit: 150,
        seatsUsed: 1,
        seatsLimit: 1,
        canAccessVideo: false,
        hasWatermark: true,
        subscriptionStatus: 'active',
        hasUsedTrial: false,
      });
    } catch (err) {
      console.error('Error in createDefaultSubscription:', err);
    }
  };

  // =====================================================
  // Check if user can afford a generation type
  // =====================================================
  const canAfford = useCallback((type: GenerationType): boolean => {
    if (!subscription) return false;
    const cost = getCreditCost(type);
    return hasEnoughCredits(subscription.subscriptionCredits, subscription.purchasedCredits, cost);
  }, [subscription]);

  // =====================================================
  // Check if user can generate (any type)
  // =====================================================
  const canGenerate = React.useMemo(() => {
    if (!subscription) return false;
    if (subscription.subscriptionStatus === 'canceled' || subscription.subscriptionStatus === 'past_due') {
      return false;
    }
    // Can generate if they can afford at least text (1 credit)
    return subscription.totalCredits >= CREDIT_COSTS.text;
  }, [subscription]);

  // =====================================================
  // Check if user can generate specific type
  // =====================================================
  const canGenerateType = useCallback((type: GenerationType): boolean => {
    if (!subscription) return false;
    if (subscription.subscriptionStatus === 'canceled' || subscription.subscriptionStatus === 'past_due') {
      return false;
    }

    // Check video access restriction for free tier
    if (type === 'video' && !subscription.canAccessVideo) {
      return false;
    }

    return canAfford(type);
  }, [subscription, canAfford]);

  // =====================================================
  // Deduct credits (calls database function)
  // =====================================================
  const deductCredits = useCallback(async (type: GenerationType): Promise<DeductResult> => {
    if (!user || !subscription) {
      return {
        success: false,
        subscriptionCredits: 0,
        purchasedCredits: 0,
        totalCredits: 0,
        deducted: 0,
        error: 'Not authenticated',
      };
    }

    // Check video access for free tier
    if (type === 'video' && !subscription.canAccessVideo) {
      return {
        success: false,
        subscriptionCredits: subscription.subscriptionCredits,
        purchasedCredits: subscription.purchasedCredits,
        totalCredits: subscription.totalCredits,
        deducted: 0,
        error: 'Video generation requires Starter plan or higher',
      };
    }

    const cost = getCreditCost(type);
    const actionType = `${type}_generation`;

    try {
      const { data, error } = await supabase.rpc('deduct_credits', {
        p_user_id: user.id,
        p_amount: cost,
        p_action_type: actionType,
      });

      if (error) {
        console.error('Error deducting credits:', error);
        return {
          success: false,
          subscriptionCredits: subscription.subscriptionCredits,
          purchasedCredits: subscription.purchasedCredits,
          totalCredits: subscription.totalCredits,
          deducted: 0,
          error: error.message,
        };
      }

      const result = data as {
        success: boolean;
        subscription_credits?: number;
        purchased_credits?: number;
        total_credits?: number;
        deducted?: number;
        error?: string;
      };

      if (result.success) {
        // Update local state with new balances
        setSubscription(prev => prev ? {
          ...prev,
          subscriptionCredits: result.subscription_credits ?? 0,
          purchasedCredits: result.purchased_credits ?? 0,
          totalCredits: result.total_credits ?? 0,
        } : null);

        return {
          success: true,
          subscriptionCredits: result.subscription_credits ?? 0,
          purchasedCredits: result.purchased_credits ?? 0,
          totalCredits: result.total_credits ?? 0,
          deducted: result.deducted ?? cost,
        };
      } else {
        return {
          success: false,
          subscriptionCredits: subscription.subscriptionCredits,
          purchasedCredits: subscription.purchasedCredits,
          totalCredits: subscription.totalCredits,
          deducted: 0,
          error: result.error ?? 'Failed to deduct credits',
        };
      }
    } catch (err) {
      console.error('Error in deductCredits:', err);
      return {
        success: false,
        subscriptionCredits: subscription.subscriptionCredits,
        purchasedCredits: subscription.purchasedCredits,
        totalCredits: subscription.totalCredits,
        deducted: 0,
        error: 'Network error',
      };
    }
  }, [user, subscription]);

  // =====================================================
  // Check credits (for UI display)
  // =====================================================
  const checkCredits = useCallback(async (amount: number): Promise<CreditCheckResult> => {
    if (!user) {
      return {
        hasCredits: false,
        subscriptionCredits: 0,
        purchasedCredits: 0,
        totalCredits: 0,
        required: amount,
        shortfall: amount,
      };
    }

    try {
      const { data, error } = await supabase.rpc('check_credits', {
        p_user_id: user.id,
        p_required: amount,
      });

      if (error) {
        console.error('Error checking credits:', error);
        return {
          hasCredits: false,
          subscriptionCredits: subscription?.subscriptionCredits ?? 0,
          purchasedCredits: subscription?.purchasedCredits ?? 0,
          totalCredits: subscription?.totalCredits ?? 0,
          required: amount,
          shortfall: amount,
        };
      }

      return {
        hasCredits: data.has_credits,
        subscriptionCredits: data.subscription_credits,
        purchasedCredits: data.purchased_credits,
        totalCredits: data.total_credits,
        required: data.required,
        shortfall: data.shortfall,
      };
    } catch (err) {
      console.error('Error in checkCredits:', err);
      return {
        hasCredits: false,
        subscriptionCredits: subscription?.subscriptionCredits ?? 0,
        purchasedCredits: subscription?.purchasedCredits ?? 0,
        totalCredits: subscription?.totalCredits ?? 0,
        required: amount,
        shortfall: amount,
      };
    }
  }, [user, subscription]);

  // =====================================================
  // Legacy: Increment usage (for backward compatibility)
  // =====================================================
  const incrementUsage = useCallback(async () => {
    // This now calls deductCredits for text generation
    await deductCredits('text');
  }, [deductCredits]);

  // =====================================================
  // Refresh subscription
  // =====================================================
  const refreshSubscription = useCallback(async () => {
    setLoading(true);
    await fetchSubscription();
  }, [fetchSubscription]);

  // =====================================================
  // Effects
  // =====================================================
  useEffect(() => {
    fetchSubscription();
  }, [fetchSubscription]);

  // =====================================================
  // Context value
  // =====================================================
  const value: SubscriptionContextType = {
    subscription,
    loading,
    canAfford,
    deductCredits,
    checkCredits,
    canGenerate,
    canGenerateType,
    refreshSubscription,
    incrementUsage,
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
};
