// Supabase Edge Function: Create Stripe Checkout Session
// This function creates a Stripe Checkout session for subscription payments

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import Stripe from 'https://esm.sh/stripe@14.11.0?target=deno';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';
import { corsHeaders, handleCors } from '../_shared/cors.ts';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2025-10-29.clover',
  httpClient: Stripe.createFetchHttpClient(),
});

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

interface CheckoutRequest {
  priceId: string;
  userId: string;
  userEmail: string;
  successUrl?: string;
  cancelUrl?: string;
}

serve(async (req: Request) => {
  // Handle CORS preflight
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    // Parse request body
    const { priceId, userId, userEmail, successUrl, cancelUrl }: CheckoutRequest = await req.json();

    // Validate required fields
    if (!priceId || !userId || !userEmail) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: priceId, userId, userEmail' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    console.log(`Creating checkout session for user ${userId} with price ${priceId}`);

    // Check if user has already used their trial
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('has_used_trial')
      .eq('user_id', userId)
      .single();

    const hasUsedTrial = subscription?.has_used_trial || false;
    console.log(`User ${userId} trial status: ${hasUsedTrial ? 'already used' : 'eligible'}`);

    // Create Stripe Checkout Session
    const sessionConfig: Stripe.Checkout.SessionCreateParams = {
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: successUrl || `${req.headers.get('origin')}/#/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl || `${req.headers.get('origin')}/#/checkout/cancel`,
      customer_email: userEmail,
      client_reference_id: userId,
      metadata: {
        userId: userId,
      },
    };

    // Only add trial if user hasn't used it before
    if (!hasUsedTrial) {
      sessionConfig.subscription_data = {
        trial_period_days: 14,
        metadata: {
          userId: userId,
        },
      };
    } else {
      sessionConfig.subscription_data = {
        metadata: {
          userId: userId,
        },
      };
    }

    const session = await stripe.checkout.sessions.create(sessionConfig);

    console.log(`Checkout session created: ${session.id}`);

    // Return session ID and URL
    return new Response(
      JSON.stringify({
        sessionId: session.id,
        url: session.url,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
