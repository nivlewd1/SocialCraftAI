// ============================================
// SUPABASE EDGE FUNCTION: analytics-fetcher
// ============================================
// Fetches engagement metrics for published posts
//
// Retrieves likes, comments, shares, impressions from platform APIs
// and stores them in analytics_cache table
//
// Deploy with:
// supabase functions deploy analytics-fetcher --no-verify-jwt
// ============================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

// ============================================
// PLATFORM ANALYTICS FUNCTIONS
// ============================================

async function fetchLinkedInAnalytics(postId: string, accessToken: string) {
  try {
    // LinkedIn UGC Post Analytics
    const response = await fetch(
      `https://api.linkedin.com/v2/socialActions/${postId}`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'X-Restli-Protocol-Version': '2.0.0',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`LinkedIn API error: ${response.status}`);
    }

    const data = await response.json();

    return {
      success: true,
      metrics: {
        likes: data.likesSummary?.totalLikes || 0,
        comments: data.commentsSummary?.totalComments || 0,
        shares: data.sharesSummary?.totalShares || 0,
        impressions: 0, // Not available in basic API
        engagement_rate: 0,
      },
    };
  } catch (error) {
    console.error('LinkedIn analytics error:', error);
    return { success: false, error: error.message };
  }
}

async function fetchTwitterAnalytics(postId: string, accessToken: string) {
  try {
    // Twitter API v2 - Tweet metrics
    const response = await fetch(
      `https://api.twitter.com/2/tweets/${postId}?tweet.fields=public_metrics`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Twitter API error: ${response.status}`);
    }

    const data = await response.json();
    const metrics = data.data?.public_metrics || {};

    const totalEngagements =
      (metrics.like_count || 0) +
      (metrics.reply_count || 0) +
      (metrics.retweet_count || 0) +
      (metrics.quote_count || 0);

    const engagementRate = metrics.impression_count
      ? (totalEngagements / metrics.impression_count) * 100
      : 0;

    return {
      success: true,
      metrics: {
        likes: metrics.like_count || 0,
        comments: metrics.reply_count || 0,
        shares: metrics.retweet_count || 0,
        impressions: metrics.impression_count || 0,
        engagement_rate: parseFloat(engagementRate.toFixed(2)),
      },
    };
  } catch (error) {
    console.error('Twitter analytics error:', error);
    return { success: false, error: error.message };
  }
}

async function fetchInstagramAnalytics(postId: string, accessToken: string) {
  try {
    // Instagram Insights API
    const response = await fetch(
      `https://graph.facebook.com/v18.0/${postId}/insights?metric=impressions,reach,engagement,likes,comments,shares&access_token=${accessToken}`
    );

    if (!response.ok) {
      throw new Error(`Instagram API error: ${response.status}`);
    }

    const data = await response.json();
    const insights: Record<string, number> = {};

    data.data?.forEach((metric: any) => {
      insights[metric.name] = metric.values?.[0]?.value || 0;
    });

    const totalEngagement = (insights.engagement || 0);
    const engagementRate = insights.impressions
      ? (totalEngagement / insights.impressions) * 100
      : 0;

    return {
      success: true,
      metrics: {
        likes: insights.likes || 0,
        comments: insights.comments || 0,
        shares: insights.shares || 0,
        impressions: insights.impressions || 0,
        engagement_rate: parseFloat(engagementRate.toFixed(2)),
      },
    };
  } catch (error) {
    console.error('Instagram analytics error:', error);
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

    console.log('📊 Analytics fetcher starting...');

    // Fetch published posts from the last 30 days that need analytics update
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: publishedPosts, error: fetchError } = await supabase
      .from('scheduled_posts')
      .select('id, user_id, platform, platform_post_id, posted_at')
      .eq('status', 'published')
      .not('platform_post_id', 'is', null)
      .gte('posted_at', thirtyDaysAgo.toISOString())
      .order('posted_at', { ascending: false })
      .limit(100); // Process max 100 posts per run

    if (fetchError) {
      console.error('❌ Error fetching posts:', fetchError);
      throw fetchError;
    }

    if (!publishedPosts || publishedPosts.length === 0) {
      console.log('✓ No published posts to fetch analytics for');
      return new Response(
        JSON.stringify({ message: 'No posts to analyze', processed: 0 }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    console.log(`📬 Found ${publishedPosts.length} published posts`);

    const results = {
      total: publishedPosts.length,
      fetched: 0,
      failed: 0,
      errors: [] as any[],
    };

    // Process each post
    for (const post of publishedPosts) {
      try {
        console.log(`\n📊 Fetching analytics for ${post.platform} post ${post.id}...`);

        // Get user's access token for this platform
        const { data: connectedAccount, error: credError } = await supabase
          .from('connected_accounts')
          .select('access_token')
          .eq('user_id', post.user_id)
          .eq('platform', post.platform)
          .eq('is_active', true)
          .single();

        if (credError || !connectedAccount) {
          throw new Error(`No active connected account for ${post.platform}`);
        }

        // Fetch analytics from platform
        let analyticsResult;

        switch (post.platform.toLowerCase()) {
          case 'linkedin':
            analyticsResult = await fetchLinkedInAnalytics(
              post.platform_post_id,
              connectedAccount.access_token
            );
            break;
          case 'twitter':
            analyticsResult = await fetchTwitterAnalytics(
              post.platform_post_id,
              connectedAccount.access_token
            );
            break;
          case 'instagram':
            analyticsResult = await fetchInstagramAnalytics(
              post.platform_post_id,
              connectedAccount.access_token
            );
            break;
          default:
            throw new Error(`Analytics not supported for platform: ${post.platform}`);
        }

        if (analyticsResult.success) {
          // Store analytics in analytics_cache table
          await supabase.from('analytics_cache').upsert(
            {
              scheduled_post_id: post.id,
              user_id: post.user_id,
              platform: post.platform,
              impressions: analyticsResult.metrics.impressions,
              likes: analyticsResult.metrics.likes,
              comments: analyticsResult.metrics.comments,
              shares: analyticsResult.metrics.shares,
              engagement_rate: analyticsResult.metrics.engagement_rate,
              fetched_at: new Date().toISOString(),
            },
            { onConflict: 'scheduled_post_id' }
          );

          results.fetched++;
          console.log(
            `✅ Fetched analytics: ${analyticsResult.metrics.likes} likes, ` +
              `${analyticsResult.metrics.comments} comments, ` +
              `${analyticsResult.metrics.shares} shares, ` +
              `${analyticsResult.metrics.impressions} impressions`
          );
        } else {
          throw new Error(analyticsResult.error || 'Unknown analytics error');
        }
      } catch (error) {
        results.failed++;
        results.errors.push({
          postId: post.id,
          platform: post.platform,
          error: error.message,
        });

        console.error(`❌ Failed to fetch analytics for post ${post.id}:`, error.message);
      }
    }

    console.log('\n📊 Analytics Summary:', results);

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
