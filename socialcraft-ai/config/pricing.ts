export type PlanType = 'free' | 'starter' | 'pro' | 'enterprise';

export interface PricingPlan {
  id: PlanType;
  name: string;
  description: string;
  price: number;
  priceId?: string; // Stripe Price ID (set this after creating in Stripe Dashboard)
  interval: 'month' | 'year';
  features: string[];
  limits: {
    generations: number | 'unlimited';
    profiles: number;
    teamMembers: number;
    analytics: 'basic' | 'advanced' | 'enterprise';
    support: 'community' | 'email' | 'priority';
  };
  cta: string;
  popular?: boolean;
}

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: 'free',
    name: 'Free',
    description: 'Perfect for trying out SocialCraft AI',
    price: 0,
    interval: 'month',
    features: [
      '50 AI generations per month',
      '1 social profile',
      'Standard content formats',
      'Basic analytics',
      'Community support'
    ],
    limits: {
      generations: 50,
      profiles: 1,
      teamMembers: 1,
      analytics: 'basic',
      support: 'community'
    },
    cta: 'Get Started Free'
  },
  {
    id: 'starter',
    name: 'Starter',
    description: 'For solopreneurs and content creators',
    price: 19,
    priceId: import.meta.env.VITE_STRIPE_PRICE_STARTER, // TEST Price ID from .env
    interval: 'month',
    features: [
      '200 AI generations per month',
      '3 social profiles',
      'All platform formats',
      'Advanced analytics',
      'Email support',
      'Trend research',
      'Schedule posts'
    ],
    limits: {
      generations: 200,
      profiles: 3,
      teamMembers: 1,
      analytics: 'advanced',
      support: 'email'
    },
    cta: 'Start 14-Day Trial'
  },
  {
    id: 'pro',
    name: 'Pro',
    description: 'For agencies and growing businesses',
    price: 49,
    priceId: import.meta.env.VITE_STRIPE_PRICE_PRO, // TEST Price ID from .env
    interval: 'month',
    popular: true,
    features: [
      'Unlimited AI generations*',
      '10 social profiles',
      'E-E-A-T optimization',
      'Search intent targeting',
      'Advanced analytics',
      'Priority email support',
      '3 team members',
      'Viral playbooks',
      'Media studio'
    ],
    limits: {
      generations: 'unlimited',
      profiles: 10,
      teamMembers: 3,
      analytics: 'advanced',
      support: 'email'
    },
    cta: 'Start 14-Day Trial'
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'For large agencies and brands',
    price: 149,
    priceId: import.meta.env.VITE_STRIPE_PRICE_ENTERPRISE, // TEST Price ID from .env
    interval: 'month',
    features: [
      'Unlimited AI generations*',
      '25 social profiles',
      'Everything in Pro',
      'White-label options',
      'API access',
      'Enterprise analytics',
      'Priority support',
      '10 team members',
      'Custom playbooks',
      'Dedicated account manager'
    ],
    limits: {
      generations: 'unlimited',
      profiles: 25,
      teamMembers: 10,
      analytics: 'enterprise',
      support: 'priority'
    },
    cta: 'Contact Sales'
  }
];

// Helper function to get plan by ID
export const getPlanById = (planId: PlanType): PricingPlan | undefined => {
  return PRICING_PLANS.find(plan => plan.id === planId);
};

// Helper function to check if user has reached generation limit
export const hasReachedGenerationLimit = (
  currentUsage: number,
  planId: PlanType
): boolean => {
  const plan = getPlanById(planId);
  if (!plan) return true;

  if (plan.limits.generations === 'unlimited') {
    // Fair use policy: 1000 generations/month
    return currentUsage >= 1000;
  }

  return currentUsage >= plan.limits.generations;
};

// Stripe configuration
// All values loaded from .env (TEST mode)
export const STRIPE_CONFIG = {
  // Stripe publishable key from .env (TEST mode: pk_test_...)
  publishableKey: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '',
  // Test mode credit cards for testing checkout flow
  testCards: {
    success: '4242424242424242',
    decline: '4000000000000002',
    requiresAuth: '4000002500003155'
  }
};

// Fair use policy note
export const FAIR_USE_NOTE = '* Fair use policy: Unlimited plans are capped at 1,000 generations per month. Contact us if you need more.';
