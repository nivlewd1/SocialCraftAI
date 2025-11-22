import { loadStripe } from '@stripe/stripe-js';
import { STRIPE_CONFIG } from '../config/pricing';
import { supabase } from '../config/supabase';

// Initialize Stripe
const stripePromise = loadStripe(STRIPE_CONFIG.publishableKey);

// Supabase Edge Functions URL
const FUNCTIONS_URL = import.meta.env.VITE_SUPABASE_URL + '/functions/v1';

export interface CheckoutOptions {
  priceId: string;
  userId: string;
  userEmail: string;
  successUrl?: string;
  cancelUrl?: string;
  mode?: 'subscription' | 'payment'; // 'subscription' for recurring, 'payment' for one-time (top-ups)
}

/**
 * Redirect to Stripe Checkout for subscription purchase
 * Calls Supabase Edge Function to create checkout session
 */
export const redirectToCheckout = async (options: CheckoutOptions) => {
  const { priceId, userId, userEmail, successUrl, cancelUrl, mode = 'subscription' } = options;

  console.log('Creating checkout session...', { mode });

  try {
    // Call Supabase Edge Function to create checkout session
    const response = await fetch(`${FUNCTIONS_URL}/create-checkout-session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        priceId,
        userId,
        userEmail,
        mode, // 'subscription' or 'payment' (for top-ups)
        successUrl: successUrl || `${window.location.origin}/#/checkout/success`,
        cancelUrl: cancelUrl || `${window.location.origin}/#/checkout/cancel`,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create checkout session');
    }

    const { sessionId, url } = await response.json();

    // Redirect to Stripe Checkout using the session URL
    if (url) {
      window.location.href = url;
    } else if (sessionId) {
      // Fallback: use sessionId with Stripe.js
      const stripe = await stripePromise;
      if (!stripe) throw new Error('Stripe failed to load');

      const { error } = await stripe.redirectToCheckout({ sessionId });
      if (error) throw error;
    } else {
      throw new Error('No checkout URL or session ID returned');
    }
  } catch (error) {
    console.error('Checkout error:', error);
    throw error;
  }
};

/**
 * Open Stripe Customer Portal for subscription management
 * Calls Supabase Edge Function to create portal session
 */
export const openCustomerPortal = async (userId: string) => {
  console.log('Opening customer portal for user:', userId);

  try {
    // Get the current user's session for authentication
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      throw new Error('You must be logged in to access the customer portal');
    }

    // Call Supabase Edge Function to create portal session
    const response = await fetch(`${FUNCTIONS_URL}/create-portal-session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({
        userId,
        returnUrl: window.location.origin + '/#/settings',
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create portal session');
    }

    const { url } = await response.json();

    // Redirect to Stripe Customer Portal
    window.location.href = url;
  } catch (error) {
    console.error('Customer portal error:', error);
    throw error;
  }
};
