import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '../config/supabase';
import { PlanType, getPlanById, hasReachedGenerationLimit } from '../config/pricing';

interface SubscriptionData {
  plan: PlanType;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  subscriptionStatus?: 'active' | 'canceled' | 'past_due' | 'trialing' | 'incomplete';
  currentPeriodEnd?: string;
  generationsUsed: number;
  generationsLimit: number | 'unlimited';
  hasUsedTrial: boolean;
}

interface SubscriptionContextType {
  subscription: SubscriptionData | null;
  loading: boolean;
  canGenerate: boolean;
  incrementUsage: () => Promise<void>;
  refreshSubscription: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType>({
  subscription: null,
  loading: true,
  canGenerate: false,
  incrementUsage: async () => {},
  refreshSubscription: async () => {},
});

export const useSubscription = () => useContext(SubscriptionContext);

export const SubscriptionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch subscription data from Supabase
  const fetchSubscription = async () => {
    if (!user) {
      setSubscription(null);
      setLoading(false);
      return;
    }

    try {
      // Fetch user's subscription from Supabase
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        // PGRST116 = no rows returned (user has no subscription yet)
        console.error('Error fetching subscription:', error);

        // Create default free subscription
        await createDefaultSubscription();
        return;
      }

      if (!data) {
        // No subscription exists, create free tier
        await createDefaultSubscription();
        return;
      }

      // Set subscription data
      const planInfo = getPlanById(data.plan_id as PlanType);
      setSubscription({
        plan: data.plan_id as PlanType,
        stripeCustomerId: data.stripe_customer_id,
        stripeSubscriptionId: data.stripe_subscription_id,
        subscriptionStatus: data.subscription_status,
        currentPeriodEnd: data.current_period_end,
        generationsUsed: data.generations_used || 0,
        generationsLimit: planInfo?.limits.generations || 50,
        hasUsedTrial: data.has_used_trial || false,
      });
    } catch (err) {
      console.error('Error in fetchSubscription:', err);
    } finally {
      setLoading(false);
    }
  };

  // Create default free subscription for new users
  const createDefaultSubscription = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .insert({
          user_id: user.id,
          plan_id: 'free',
          generations_used: 0,
          subscription_status: 'active',
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating default subscription:', error);
        return;
      }

      setSubscription({
        plan: 'free',
        generationsUsed: 0,
        generationsLimit: 50,
        subscriptionStatus: 'active',
        hasUsedTrial: false,
      });
    } catch (err) {
      console.error('Error in createDefaultSubscription:', err);
    }
  };

  // Check if user can generate content
  const canGenerate = React.useMemo(() => {
    if (!subscription) return false;
    if (subscription.subscriptionStatus === 'canceled' || subscription.subscriptionStatus === 'past_due') {
      return false;
    }
    return !hasReachedGenerationLimit(subscription.generationsUsed, subscription.plan);
  }, [subscription]);

  // Increment usage count
  const incrementUsage = async () => {
    if (!user || !subscription) return;

    try {
      const newUsage = subscription.generationsUsed + 1;

      const { error } = await supabase
        .from('subscriptions')
        .update({ generations_used: newUsage })
        .eq('user_id', user.id);

      if (error) {
        console.error('Error incrementing usage:', error);
        return;
      }

      setSubscription({
        ...subscription,
        generationsUsed: newUsage,
      });
    } catch (err) {
      console.error('Error in incrementUsage:', err);
    }
  };

  // Refresh subscription data
  const refreshSubscription = async () => {
    setLoading(true);
    await fetchSubscription();
  };

  // Fetch subscription on mount and when user changes
  useEffect(() => {
    fetchSubscription();
  }, [user?.id]);

  const value: SubscriptionContextType = {
    subscription,
    loading,
    canGenerate,
    incrementUsage,
    refreshSubscription,
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
};
