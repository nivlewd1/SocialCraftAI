import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// =====================================================
// Credit Reset Edge Function
// =====================================================
// Resets monthly subscription credits for all eligible users
// Run daily - the database function handles the reset logic
// =====================================================

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client with service role key
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    console.log('Starting credit reset process...')

    // Call the database function to reset credits
    // This function handles:
    // 1. Finding subscriptions where credits_reset_at <= now()
    // 2. Resetting subscription_credits based on plan
    // 3. Setting new credits_reset_at date
    // 4. Logging transactions
    const { error } = await supabase.rpc('reset_subscription_credits')

    if (error) {
      console.error('Error resetting credits:', error)
      return new Response(
        JSON.stringify({ error: 'Failed to reset credits', details: error.message }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Get count of reset subscriptions for logging
    const { data: resetCount } = await supabase
      .from('credit_transactions')
      .select('id', { count: 'exact' })
      .eq('action_type', 'subscription_reset')
      .gte('created_at', new Date(Date.now() - 60000).toISOString()) // Last minute

    console.log(`Credit reset complete. ${resetCount?.length || 0} subscriptions processed.`)

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Credit reset completed',
        subscriptionsProcessed: resetCount?.length || 0,
        timestamp: new Date().toISOString(),
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  } catch (error) {
    console.error('Unexpected error in credit reset:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: String(error) }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})
