// ============================================
// SUPABASE EDGE FUNCTION: post-scheduler
// ============================================
// Location: supabase/functions/post-scheduler/index.ts
//
// Deploy with:
// supabase functions deploy post-scheduler --no-verify-jwt
//
// Set up cron job in Supabase Dashboard:
// https://supabase.com/dashboard/project/YOUR_PROJECT/database/cron-jobs
// Schedule: */15 * * * * (every 15 minutes)
// ============================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

// Platform-specific posting functions (implement based on platform APIs)
interface PlatformPoster {
  linkedin: (content: any, credentials: any) => Promise<{ success: boolean; postId?: string; error?: string }>;
  twitter: (content: any, credentials: any) => Promise<{ success: boolean; postId?: string; error?: string }>;
  instagram: (content: any, credentials: any) => Promise<{ success: boolean; postId?: string; error?: string }>;
  tiktok: (content: any, credentials: any) => Promise<{ success: boolean; postId?: string; error?: string }>;
}

// ============================================
// LINKEDIN POSTING
// ============================================
async function postToLinkedIn(content: any, credentials: any) {
  const { access_token } = credentials;

  try {
    // Get user's LinkedIn profile ID
    const profileResponse = await fetch('https://api.linkedin.com/v2/me', {
      headers: {
        'Authorization': `Bearer ${access_token}`,
        'X-Restli-Protocol-Version': '2.0.0'
      }
    });

    if (!profileResponse.ok) {
      throw new Error('Failed to fetch LinkedIn profile');
    }

    const profile = await profileResponse.json();
    const author = `urn:li:person:${profile.id}`;

    // Create post (UGC Post API)
    const postData = {
      author: author,
      lifecycleState: 'PUBLISHED',
      specificContent: {
        'com.linkedin.ugc.ShareContent': {
          shareCommentary: {
            text: content.text
          },
          shareMediaCategory: 'NONE'
        }
      },
      visibility: {
        'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC'
      }
    };

    const postResponse = await fetch('https://api.linkedin.com/v2/ugcPosts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${access_token}`,
        'Content-Type': 'application/json',
        'X-Restli-Protocol-Version': '2.0.0'
      },
      body: JSON.stringify(postData)
    });

    if (!postResponse.ok) {
      const errorData = await postResponse.json();
      throw new Error(`LinkedIn API error: ${JSON.stringify(errorData)}`);
    }

    const result = await postResponse.json();
    const postId = result.id;

    return { success: true, postId };
  } catch (error) {
    console.error('LinkedIn posting error:', error);
    return { success: false, error: error.message };
  }
}

// ============================================
// TWITTER/X POSTING
// ============================================
async function postToTwitter(content: any, credentials: any) {
  const { access_token, access_token_secret } = credentials;

  try {
    // Twitter API v2 endpoint
    const response = await fetch('https://api.twitter.com/2/tweets', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${access_token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        text: content.text
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Twitter API error: ${JSON.stringify(errorData)}`);
    }

    const result = await response.json();
    const postId = result.data.id;

    return { success: true, postId };
  } catch (error) {
    console.error('Twitter posting error:', error);
    return { success: false, error: error.message };
  }
}

// ============================================
// INSTAGRAM POSTING (via Meta Graph API)
// ============================================
async function postToInstagram(content: any, credentials: any) {
  const { access_token, instagram_account_id } = credentials;

  try {
    // Note: Instagram posting requires image/video content
    // This is a simplified version - you'll need to handle media creation first

    // Create container
    const containerResponse = await fetch(
      `https://graph.facebook.com/v18.0/${instagram_account_id}/media`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          caption: content.text,
          image_url: content.image_url, // Required for Instagram
          access_token: access_token
        })
      }
    );

    if (!containerResponse.ok) {
      const errorData = await containerResponse.json();
      throw new Error(`Instagram container creation error: ${JSON.stringify(errorData)}`);
    }

    const container = await containerResponse.json();

    // Publish container
    const publishResponse = await fetch(
      `https://graph.facebook.com/v18.0/${instagram_account_id}/media_publish`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          creation_id: container.id,
          access_token: access_token
        })
      }
    );

    if (!publishResponse.ok) {
      const errorData = await publishResponse.json();
      throw new Error(`Instagram publish error: ${JSON.stringify(errorData)}`);
    }

    const result = await publishResponse.json();

    return { success: true, postId: result.id };
  } catch (error) {
    console.error('Instagram posting error:', error);
    return { success: false, error: error.message };
  }
}

// ============================================
// TIKTOK POSTING
// ============================================
async function postToTikTok(content: any, credentials: any) {
  // TikTok Content Posting API is more complex and requires video content
  // This is a placeholder - implementation depends on your use case

  return { success: false, error: 'TikTok posting not yet implemented' };
}

// ============================================
// MAIN EDGE FUNCTION
// ============================================
serve(async (req) => {
  try {
    // Verify this is a cron job request (optional but recommended)
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.includes(Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '')) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase client with service role
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch posts that are ready to be published
    const { data: postsToPublish, error: fetchError } = await supabase
      .from('scheduled_posts')
      .select(`
        id,
        user_id,
        platform,
        content,
        scheduled_at
      `)
      .eq('status', 'scheduled')
      .lte('scheduled_at', new Date().toISOString())
      .order('scheduled_at', { ascending: true })
      .limit(50); // Process max 50 posts per run

    if (fetchError) {
      console.error('Error fetching posts:', fetchError);
      throw fetchError;
    }

    if (!postsToPublish || postsToPublish.length === 0) {
      console.log('No posts to publish');
      return new Response(
        JSON.stringify({ message: 'No posts to publish', processed: 0 }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Found ${postsToPublish.length} posts to publish`);

    const results = {
      total: postsToPublish.length,
      published: 0,
      failed: 0,
      errors: [] as any[]
    };

    // Process each post
    for (const post of postsToPublish) {
      try {
        // Mark as "publishing" to prevent duplicate processing
        await supabase
          .from('scheduled_posts')
          .update({ status: 'publishing' })
          .eq('id', post.id);

        // Fetch user's API credentials for this platform
        const { data: credentials, error: credError } = await supabase
          .from('user_api_credentials')
          .select('credentials')
          .eq('user_id', post.user_id)
          .eq('platform', post.platform)
          .eq('is_active', true)
          .single();

        if (credError || !credentials) {
          throw new Error(`No active credentials found for platform: ${post.platform}`);
        }

        // Post to the appropriate platform
        let result;
        switch (post.platform) {
          case 'linkedin':
            result = await postToLinkedIn(post.content, credentials.credentials);
            break;
          case 'twitter':
            result = await postToTwitter(post.content, credentials.credentials);
            break;
          case 'instagram':
            result = await postToInstagram(post.content, credentials.credentials);
            break;
          case 'tiktok':
            result = await postToTikTok(post.content, credentials.credentials);
            break;
          default:
            throw new Error(`Unsupported platform: ${post.platform}`);
        }

        // Update post status based on result
        if (result.success) {
          await supabase
            .from('scheduled_posts')
            .update({
              status: 'published',
              posted_at: new Date().toISOString(),
              platform_post_id: result.postId,
              error_message: null
            })
            .eq('id', post.id);

          results.published++;
          console.log(`✓ Published post ${post.id} to ${post.platform}`);
        } else {
          throw new Error(result.error || 'Unknown error');
        }
      } catch (error) {
        // Mark as failed and store error
        await supabase
          .from('scheduled_posts')
          .update({
            status: 'failed',
            error_message: error.message
          })
          .eq('id', post.id);

        results.failed++;
        results.errors.push({
          postId: post.id,
          platform: post.platform,
          error: error.message
        });

        console.error(`✗ Failed to publish post ${post.id}:`, error);
      }
    }

    console.log('Processing complete:', results);

    return new Response(
      JSON.stringify(results),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Edge function error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});
