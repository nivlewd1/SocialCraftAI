// Supabase Edge Function: Stripe Webhooks Handler
// ------------------------------------------------
// The update below removes the problematic `expand: ['items']` call on
// `stripe.subscriptions.retrieve`.  Instead we fetch the core subscription
// object and then request the first subscription item via
// `stripe.subscriptionItems.list`.  This avoids the historic bug that
// caused Stripe’s SDK to attempt to construct a **Date** from a Unix‑epoch
// integer (seconds) and throw “Invalid time value”.

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import Stripe from 'https://esm.sh/stripe@14.11.0?target=deno';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';

function toIsoUtc(seconds?: number | null): string {
  if (typeof seconds !== 'number' || Number.isNaN(seconds)) {
    return new Date().toISOString();
  }
  return new Date(seconds * 1000).toISOString();
}

// Helper: fetch the first subscription item (price + period info)
// ---------------------------------------------------------------
async function getFirstItem(stripe: Stripe, subscriptionId: string) {
  const items = await stripe.subscriptionItems.list({
    subscription: subscriptionId,
    limit: 1,
  });
  return items.data[0];
}

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2025-10-29.clover',
  httpClient: Stripe.createFetchHttpClient(),
});

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')!;

serve(async (req: Request) => {
  const signature = req.headers.get('stripe-signature');

  if (!signature) {
    return new Response(
      JSON.stringify({ error: 'Missing stripe-signature header' }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  }

  try {
    const body = await req.text();
    const event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);

    console.log(`Processing webhook event: ${event.type}`);

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        console.log(`Checkout session completed: ${session.id}, mode: ${session.mode}`);

        const userId = session.client_reference_id ?? session.metadata?.userId;
        if (!userId) {
          console.error('No user ID found in session metadata');
          break;
        }

        const customerId = session.customer as string;

        // Handle one-time payments (top-ups)
        if (session.mode === 'payment') {
          console.log('Processing one-time payment (top-up)');

          // Get the price ID from the line items
          const lineItems = await stripe.checkout.sessions.listLineItems(session.id, { limit: 1 });
          const priceId = lineItems.data[0]?.price?.id;

          // Map price IDs to credit amounts
          const topupCredits: Record<string, number> = {
            [Deno.env.get('VITE_STRIPE_PRICE_TOPUP_SMALL') ?? '']: 500,
            [Deno.env.get('VITE_STRIPE_PRICE_TOPUP_MEDIUM') ?? '']: 2500,
            [Deno.env.get('VITE_STRIPE_PRICE_TOPUP_LARGE') ?? '']: 6000,
          };

          const creditsToAdd = priceId ? topupCredits[priceId] : 0;

          if (creditsToAdd > 0) {
            // Add purchased credits using the database function
            const { data: result, error: addError } = await supabase.rpc('add_credits', {
              p_user_id: userId,
              p_amount: creditsToAdd,
              p_credit_type: 'purchased',
              p_action_type: 'topup_purchase',
            });

            if (addError) {
              console.error('Error adding top-up credits:', addError);
            } else {
              console.log(`Added ${creditsToAdd} purchased credits for user ${userId}`, result);
            }
          } else {
            console.warn('Unknown top-up price ID:', priceId);
          }
          break;
        }

        // Handle subscription payments
        const subscriptionId = session.subscription as string;
        if (!subscriptionId) {
          console.error('Missing subscription ID in checkout session');
          break;
        }

        // Retrieve core subscription
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);

        // Pull the first subscription item (price + period)
        const item = await getFirstItem(stripe, subscriptionId);
        if (!item) {
          console.error('No subscription items found');
          break;
        }

        const priceId = item.price.id;
        const planIdEnv = {
          starter: Deno.env.get('VITE_STRIPE_PRICE_STARTER') ?? '',
          pro: Deno.env.get('VITE_STRIPE_PRICE_PRO') ?? '',
          agency: Deno.env.get('VITE_STRIPE_PRICE_AGENCY') ?? '',
        };

        // Plan credit allocations
        const planCredits: Record<string, number> = {
          free: 150,
          starter: 2500,
          pro: 10000,
          agency: 35000,
        };

        // Plan seat limits (-1 = unlimited)
        const planSeats: Record<string, number> = {
          free: 1,
          starter: 1,
          pro: 3,
          agency: -1,
        };

        let planId = 'starter';
        if (priceId === planIdEnv.pro) planId = 'pro';
        else if (priceId === planIdEnv.agency) planId = 'agency';

        const { error } = await supabase
          .from('subscriptions')
          .upsert(
            {
              user_id: userId,
              plan_id: planId,
              stripe_customer_id: customerId,
              stripe_subscription_id: subscriptionId,
              subscription_status: subscription.status,
              current_period_end: toIsoUtc(subscription.current_period_end),
              subscription_credits: planCredits[planId], // Set credits based on plan
              seats_limit: planSeats[planId], // Set seat limit based on plan
              credits_reset_at: toIsoUtc(subscription.current_period_end), // Reset when period ends
              has_used_trial: true,
              updated_at: new Date().toISOString(),
            },
            { onConflict: 'user_id' },
          );

        if (error) {
          console.error('Error upserting subscription:', error);
        } else {
          console.log(`Subscription created/updated for user ${userId} with plan ${planId} (${planCredits[planId]} credits)`);
        }
        break;
      }

      case 'invoice.paid': {
        const invoice = event.data.object as Stripe.Invoice;
        console.log(`Invoice paid: ${invoice.id}`);

        const subscriptionId = invoice.subscription as string;
        if (subscriptionId) {
          const { error } = await supabase
            .from('subscriptions')
            .update({
              subscription_status: 'active',
              updated_at: new Date().toISOString(),
            })
            .eq('stripe_subscription_id', subscriptionId);

          if (error) {
            console.error('Error updating subscription on invoice paid:', error);
          }
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        console.log(`Invoice payment failed: ${invoice.id}`);

        const subscriptionId = invoice.subscription as string;
        if (subscriptionId) {
          const { error } = await supabase
            .from('subscriptions')
            .update({
              subscription_status: 'past_due',
              updated_at: new Date().toISOString(),
            })
            .eq('stripe_subscription_id', subscriptionId);

          if (error) {
            console.error('Error updating subscription on payment failure:', error);
          }
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        console.log(`Subscription updated: ${subscription.id}`);

        const subscriptionId = subscription.id;

        // Retrieve new subscription details
        const sub = await stripe.subscriptions.retrieve(subscriptionId);
        const subItem = await getFirstItem(stripe, subscriptionId);

        const priceId = subItem.price.id;
        const planIdEnv = {
          starter: Deno.env.get('VITE_STRIPE_PRICE_STARTER') ?? '',
          pro: Deno.env.get('VITE_STRIPE_PRICE_PRO') ?? '',
          agency: Deno.env.get('VITE_STRIPE_PRICE_AGENCY') ?? '',
        };

        // Plan credit allocations
        const planCredits: Record<string, number> = {
          free: 150,
          starter: 2500,
          pro: 10000,
          agency: 35000,
        };

        // Plan seat limits (-1 = unlimited)
        const planSeats: Record<string, number> = {
          free: 1,
          starter: 1,
          pro: 3,
          agency: -1,
        };

        let planId = 'starter';
        if (priceId === planIdEnv.pro) planId = 'pro';
        else if (priceId === planIdEnv.agency) planId = 'agency';

        const { error } = await supabase
          .from('subscriptions')
          .update({
            plan_id: planId,
            subscription_status: sub.status,
            subscription_credits: planCredits[planId], // Update credits on plan change
            seats_limit: planSeats[planId], // Update seats on plan change
            current_period_end: toIsoUtc(sub.current_period_end),
            updated_at: new Date().toISOString(),
          })
          .eq('stripe_subscription_id', subscriptionId);

        if (error) {
          console.error('Error updating subscription:', error);
        } else {
          console.log(`Subscription updated to ${planId} with ${planCredits[planId]} credits`);
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        console.log(`Subscription deleted: ${subscription.id}`);

        const subscriptionId = subscription.id;
        const sub = await stripe.subscriptions.retrieve(subscriptionId);
        const subItem = await getFirstItem(stripe, subscriptionId);

        const { error } = await supabase
          .from('subscriptions')
          .update({
            plan_id: 'free',
            subscription_status: 'canceled',
            current_period_end: toIsoUtc(sub.current_period_end),
            updated_at: new Date().toISOString(),
          })
          .eq('stripe_subscription_id', subscriptionId);

        if (error) {
          console.error('Error canceling subscription:', error);
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return new Response(
      JSON.stringify({ received: true }),
      { status: 200, headers: { 'Content-Type': 'application/json' } },
    );
  } catch (error) {
    console.error('Webhook error:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Webhook processing failed',
      }),
      { status: 400, headers: { 'Content-Type': 'application/json' } },
    );
  }
});