// =====================================================
// SocialCraft AI - Credit-Based Pricing Configuration
// =====================================================
// Credit Exchange Rates:
// - Text Generation: 1 credit
// - Image Generation: 15 credits
// - Video Generation: 150 credits
// =====================================================

export type PlanType = 'free' | 'starter' | 'pro' | 'agency';

// Credit costs for different generation types
export const CREDIT_COSTS = {
  text: 1,
  image: 15,
  video: 150,
} as const;

export type GenerationType = keyof typeof CREDIT_COSTS;

export interface PricingPlan {
  id: PlanType;
  name: string;
  description: string;
  price: number;
  priceId?: string; // Stripe Price ID
  interval: 'month' | 'year';
  features: string[];
  limits: {
    monthlyCredits: number;
    profiles: number;
    seats: number;
    analytics: 'basic' | 'advanced' | 'enterprise';
    support: 'community' | 'email' | 'priority';
    videoAccess: boolean;
    watermark: boolean;
  };
  cta: string;
  popular?: boolean;
}

export interface TopUpPack {
  id: string;
  name: string;
  credits: number;
  price: number; // In dollars
  priceId?: string; // Stripe Price ID
  savings?: string; // e.g., "Save 44%"
}

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: 'free',
    name: 'Free',
    description: 'Explore SocialCraft AI with limited features',
    price: 0,
    interval: 'month',
    features: [
      '150 credits/month',
      'Text & image generation',
      '1 social profile',
      'Basic analytics',
      'Community support',
      'CSS watermark on exports'
    ],
    limits: {
      monthlyCredits: 150,
      profiles: 1,
      seats: 1,
      analytics: 'basic',
      support: 'community',
      videoAccess: false,
      watermark: true,
    },
    cta: 'Get Started Free'
  },
  {
    id: 'starter',
    name: 'Starter',
    description: 'For solopreneurs and content creators',
    price: 19,
    priceId: import.meta.env.VITE_STRIPE_PRICE_STARTER,
    interval: 'month',
    features: [
      '2,500 credits/month',
      'Full access (text, image, video)',
      '3 social profiles',
      'Advanced analytics',
      'Email support',
      'Trend research',
      'Schedule & auto-publish',
      'No watermarks'
    ],
    limits: {
      monthlyCredits: 2500,
      profiles: 3,
      seats: 1,
      analytics: 'advanced',
      support: 'email',
      videoAccess: true,
      watermark: false,
    },
    cta: 'Start 14-Day Trial'
  },
  {
    id: 'pro',
    name: 'Pro',
    description: 'For agencies and growing businesses',
    price: 59,
    priceId: import.meta.env.VITE_STRIPE_PRICE_PRO,
    interval: 'month',
    popular: true,
    features: [
      '10,000 credits/month',
      'Everything in Starter',
      '10 social profiles',
      '3 team seats',
      'Client portal access',
      'Priority generation queue',
      'E-E-A-T optimization',
      'Viral playbooks',
      'Media studio'
    ],
    limits: {
      monthlyCredits: 10000,
      profiles: 10,
      seats: 3,
      analytics: 'advanced',
      support: 'email',
      videoAccess: true,
      watermark: false,
    },
    cta: 'Start 14-Day Trial'
  },
  {
    id: 'agency',
    name: 'Agency',
    description: 'For large agencies and brands',
    price: 199,
    priceId: import.meta.env.VITE_STRIPE_PRICE_AGENCY,
    interval: 'month',
    features: [
      '50,000 credits/month',
      'Everything in Pro',
      '25 social profiles',
      '10 team seats',
      'White-label options',
      'API access',
      'Enterprise analytics',
      'Priority support',
      'Custom playbooks',
      'Dedicated account manager'
    ],
    limits: {
      monthlyCredits: 50000,
      profiles: 25,
      seats: 10,
      analytics: 'enterprise',
      support: 'priority',
      videoAccess: true,
      watermark: false,
    },
    cta: 'Contact Sales'
  }
];

// Top-up credit packs
export const TOPUP_PACKS: TopUpPack[] = [
  {
    id: 'topup_small',
    name: 'Starter Pack',
    credits: 500,
    price: 9,
    priceId: import.meta.env.VITE_STRIPE_PRICE_TOPUP_SMALL,
  },
  {
    id: 'topup_medium',
    name: 'Growth Pack',
    credits: 2500,
    price: 25,
    priceId: import.meta.env.VITE_STRIPE_PRICE_TOPUP_MEDIUM,
    savings: 'Save 44%',
  },
  {
    id: 'topup_large',
    name: 'Bulk Pack',
    credits: 6000,
    price: 49,
    priceId: import.meta.env.VITE_STRIPE_PRICE_TOPUP_LARGE,
    savings: 'Save 54%',
  }
];

// Helper function to get plan by ID
export const getPlanById = (planId: PlanType): PricingPlan | undefined => {
  return PRICING_PLANS.find(plan => plan.id === planId);
};

// Helper function to get credit cost for generation type
export const getCreditCost = (type: GenerationType): number => {
  return CREDIT_COSTS[type];
};

// Helper function to check if user has enough credits
export const hasEnoughCredits = (
  subscriptionCredits: number,
  purchasedCredits: number,
  requiredCredits: number
): boolean => {
  return (subscriptionCredits + purchasedCredits) >= requiredCredits;
};

// Helper function to check if plan allows video generation
export const canGenerateVideo = (planId: PlanType): boolean => {
  const plan = getPlanById(planId);
  return plan?.limits.videoAccess ?? false;
};

// Helper function to check if plan has watermarks
export const hasWatermark = (planId: PlanType): boolean => {
  const plan = getPlanById(planId);
  return plan?.limits.watermark ?? true;
};

// Calculate what user can generate with their credits
export const calculatePotentialGenerations = (totalCredits: number) => {
  return {
    text: Math.floor(totalCredits / CREDIT_COSTS.text),
    image: Math.floor(totalCredits / CREDIT_COSTS.image),
    video: Math.floor(totalCredits / CREDIT_COSTS.video),
  };
};

// Format credits for display
export const formatCredits = (credits: number): string => {
  if (credits >= 1000) {
    return `${(credits / 1000).toFixed(1).replace(/\.0$/, '')}k`;
  }
  return credits.toLocaleString();
};

// Credit exchange rate explanation for UI
export const CREDIT_EXCHANGE_INFO = {
  text: {
    cost: CREDIT_COSTS.text,
    description: 'AI-generated social post draft',
    icon: 'FileText',
  },
  image: {
    cost: CREDIT_COSTS.image,
    description: 'AI-generated image',
    icon: 'Image',
  },
  video: {
    cost: CREDIT_COSTS.video,
    description: 'AI-generated video clip',
    icon: 'Video',
  },
};

// Stripe configuration
export const STRIPE_CONFIG = {
  publishableKey: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '',
  testCards: {
    success: '4242424242424242',
    decline: '4000000000000002',
    requiresAuth: '4000002500003155'
  }
};

// Margin analysis constants (internal use)
export const MARGIN_ANALYSIS = {
  apiCosts: {
    text: 0.001,   // ~$0.001 per text generation (Gemini Flash)
    image: 0.04,   // ~$0.04 per image (Imagen 4.0)
    video: 0.50,   // ~$0.50 per video (Veo 3.1)
  },
  lowestBulkRate: 0.008, // $0.008 per credit at bulk pricing
  targetMargin: 0.58,    // 58% target margin
};
