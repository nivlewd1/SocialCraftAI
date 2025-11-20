// ============================================
// SUPABASE EDGE FUNCTION: token-refresh
// ============================================
// Automatically refreshes expired OAuth tokens for connected accounts
//
// Runs on schedule to check for expiring tokens and refresh them
// before they expire to prevent posting failures
//
// Deploy with:
// supabase functions deploy token-refresh --no-verify-jwt
// ============================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

// ============================================
// PLATFORM TOKEN REFRESH FUNCTIONS
// ============================================

async function refreshLinkedInToken(refreshToken: string) {
  const clientId = Deno.env.get('LINKEDIN_CLIENT_ID');
  const clientSecret = Deno.env.get('LINKEDIN_CLIENT_SECRET');

  if (!clientId || !clientSecret) {
    throw new Error('LinkedIn OAuth credentials not configured');
  }

  try {
    const response = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_id: clientId,
        client_secret: clientSecret,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`LinkedIn token refresh failed: ${errorData}`);
    }

    const data = await response.json();

    return {
      access_token: data.access_token,
      refresh_token: data.refresh_token || refreshToken, // LinkedIn may not return new refresh token
      expires_in: data.expires_in,
      success: true,
    };
  } catch (error) {
    console.error('LinkedIn token refresh error:', error);
    return { success: false, error: error.message };
  }
}

async function refreshTwitterToken(refreshToken: string) {
  const clientId = Deno.env.get('TWITTER_CLIENT_ID');
  const clientSecret = Deno.env.get('TWITTER_CLIENT_SECRET');

  if (!clientId || !clientSecret) {
    throw new Error('Twitter OAuth credentials not configured');
  }

  try {
    // Twitter OAuth 2.0 token refresh
    const basicAuth = btoa(`${clientId}:${clientSecret}`);

    const response = await fetch('https://api.twitter.com/2/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${basicAuth}`,
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Twitter token refresh failed: ${errorData}`);
    }

    const data = await response.json();

    return {
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_in: data.expires_in,
      success: true,
    };
  } catch (error) {
    console.error('Twitter token refresh error:', error);
    return { success: false, error: error.message };
  }
}

async function refreshInstagramToken(accessToken: string) {
  try {
    // Instagram uses long-lived tokens that can be refreshed
    const response = await fetch(
      `https://graph.instagram.com/refresh_access_token?grant_type=ig_refresh_token&access_token=${accessToken}`
    );

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Instagram token refresh failed: ${errorData}`);
    }

    const data = await response.json();

    return {
      access_token: data.access_token,
      expires_in: data.expires_in,
      success: true,
    };
  } catch (error) {
    console.error('Instagram token refresh error:', error);
    return { success: false, error: error.message };
  }
}

// ============================================
// MAIN EDGE FUNCTION
// ============================================
serve(async (req) => {
  try {
    // Initialize Supabase client with service role
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('🔄 Token refresh starting...');

    // Find tokens that will expire within 7 days
    const expiringThreshold = new Date();
    expiringThreshold.setDate(expiringThreshold.getDate() + 7);

    const { data: expiringAccounts, error: fetchError } = await supabase
      .from('connected_accounts')
      .select('id, user_id, platform, access_token, refresh_token, token_expires_at')
      .lte('token_expires_at', expiringThreshold.toISOString())
      .eq('is_active', true)
      .not('refresh_token', 'is', null);

    if (fetchError) {
      console.error('❌ Error fetching accounts:', fetchError);
      throw fetchError;
    }

    if (!expiringAccounts || expiringAccounts.length === 0) {
      console.log('✓ No tokens need refreshing');
      return new Response(
        JSON.stringify({ message: 'No tokens need refreshing', refreshed: 0 }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    console.log(`📋 Found ${expiringAccounts.length} accounts with expiring tokens`);

    const results = {
      total: expiringAccounts.length,
      refreshed: 0,
      failed: 0,
      errors: [] as any[],
    };

    // Process each account
    for (const account of expiringAccounts) {
      try {
        console.log(`\n🔄 Refreshing ${account.platform} token for user ${account.user_id}...`);

        let refreshResult;

        switch (account.platform.toLowerCase()) {
          case 'linkedin':
            refreshResult = await refreshLinkedInToken(account.refresh_token);
            break;
          case 'twitter':
            refreshResult = await refreshTwitterToken(account.refresh_token);
            break;
          case 'instagram':
            refreshResult = await refreshInstagramToken(account.access_token);
            break;
          default:
            throw new Error(`Token refresh not supported for platform: ${account.platform}`);
        }

        if (refreshResult.success) {
          // Calculate new expiration date
          const expiresAt = new Date();
          expiresAt.setSeconds(expiresAt.getSeconds() + (refreshResult.expires_in || 7200));

          // Update database with new tokens
          const updateData: any = {
            access_token: refreshResult.access_token,
            token_expires_at: expiresAt.toISOString(),
            updated_at: new Date().toISOString(),
          };

          // Only update refresh_token if a new one was provided
          if (refreshResult.refresh_token) {
            updateData.refresh_token = refreshResult.refresh_token;
          }

          await supabase
            .from('connected_accounts')
            .update(updateData)
            .eq('id', account.id);

          results.refreshed++;
          console.log(`✅ Refreshed ${account.platform} token (expires: ${expiresAt.toISOString()})`);
        } else {
          throw new Error(refreshResult.error || 'Unknown refresh error');
        }
      } catch (error) {
        // Mark account as inactive if refresh failed
        await supabase
          .from('connected_accounts')
          .update({
            is_active: false,
            updated_at: new Date().toISOString(),
          })
          .eq('id', account.id);

        results.failed++;
        results.errors.push({
          accountId: account.id,
          platform: account.platform,
          userId: account.user_id,
          error: error.message,
        });

        console.error(`❌ Failed to refresh ${account.platform} token:`, error.message);
      }
    }

    console.log('\n📊 Refresh Summary:', results);

    return new Response(JSON.stringify(results), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('💥 Edge function error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});
