// ============================================
// SUPABASE EDGE FUNCTION: post-scheduler
// ============================================
// Schema Requirements:
//
// connected_accounts:
//   - access_token (TEXT) - OAuth access token
//   - refresh_token (TEXT) - OAuth refresh token
//   - token_expires_at (TIMESTAMPTZ) - Token expiration
//   - platform_user_id (TEXT) - User's ID on platform
//   - metadata (JSONB) - Platform-specific data (e.g., instagram_account_id)
//
// scheduled_posts:
//   - platform (TEXT) - 'linkedin', 'twitter', 'instagram', 'tiktok'
//   - content (JSONB) - { text, hashtags, image_url }
//   - scheduled_at (TIMESTAMPTZ) - When to post
//   - status (TEXT) - 'scheduled', 'publishing', 'published', 'failed'
//   - platform_post_id (TEXT) - ID from platform after posting
//   - error_message (TEXT) - Error details if failed
//
// Deploy with:
// supabase functions deploy post-scheduler --no-verify-jwt
// ============================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

// ============================================
// PLATFORM POSTING FUNCTIONS
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
      const error = await profileResponse.text();
      throw new Error(`LinkedIn profile fetch failed: ${error}`);
    }

    const profile = await profileResponse.json();
    const author = `urn:li:person:${profile.id}`;

    // Create UGC Post
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
    return { success: true, postId: result.id };
  } catch (error) {
    console.error('LinkedIn posting error:', error);
    return { success: false, error: error.message };
  }
}

async function postToTwitter(content: any, credentials: any) {
  const { access_token } = credentials;

  try {
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
    return { success: true, postId: result.data.id };
  } catch (error) {
    console.error('Twitter posting error:', error);
    return { success: false, error: error.message };
  }
}

async function postToInstagram(content: any, credentials: any) {
  const { access_token, instagram_account_id } = credentials;

  try {
    if (!content.image_url) {
      throw new Error('Instagram requires image_url in content');
    }

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
          image_url: content.image_url,
          access_token: access_token
        })
      }
    );

    if (!containerResponse.ok) {
      const errorData = await containerResponse.json();
      throw new Error(`Instagram container error: ${JSON.stringify(errorData)}`);
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

async function postToTikTok(content: any, credentials: any) {
  return { success: false, error: 'TikTok posting pending API approval' };
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

    console.log('🚀 Post-scheduler starting...');

    // Fetch posts ready to publish
    const { data: postsToPublish, error: fetchError } = await supabase
      .from('scheduled_posts')
      .select('id, user_id, platform, content, scheduled_at')
      .eq('status', 'scheduled')
      .lte('scheduled_at', new Date().toISOString())
      .order('scheduled_at', { ascending: true })
      .limit(50);

    if (fetchError) {
      console.error('❌ Error fetching posts:', fetchError);
      throw fetchError;
    }

    if (!postsToPublish || postsToPublish.length === 0) {
      console.log('✓ No posts to publish');
      return new Response(
        JSON.stringify({ message: 'No posts to publish', processed: 0 }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    console.log(`📬 Found ${postsToPublish.length} posts to publish`);

    const results = {
      total: postsToPublish.length,
      published: 0,
      failed: 0,
      errors: [] as any[]
    };

    // Process each post
    for (const post of postsToPublish) {
      try {
        console.log(`\n📝 Processing post ${post.id} (${post.platform})...`);

        // Mark as "publishing" to prevent duplicate processing
        await supabase
          .from('scheduled_posts')
          .update({ status: 'publishing', updated_at: new Date().toISOString() })
          .eq('id', post.id);

        // Fetch connected account credentials (FLAT structure - not credentials JSONB)
        const { data: connectedAccount, error: credError } = await supabase
          .from('connected_accounts')
          .select('access_token, refresh_token, token_expires_at, platform_user_id, metadata')
          .eq('user_id', post.user_id)
          .eq('platform', post.platform)
          .single();

        if (credError || !connectedAccount) {
          throw new Error(`No connected account found for ${post.platform}`);
        }

        // Check if token is expired
        if (connectedAccount.token_expires_at) {
          const expiresAt = new Date(connectedAccount.token_expires_at);
          if (expiresAt <= new Date()) {
            throw new Error(`Access token expired for ${post.platform}. User needs to reconnect.`);
          }
        }

        // Build credentials object from flat structure
        const credentials = {
          access_token: connectedAccount.access_token,
          refresh_token: connectedAccount.refresh_token,
          // Instagram needs instagram_account_id from metadata
          instagram_account_id: connectedAccount.metadata?.instagram_account_id
        };

        // Post to platform
        let result;
        switch (post.platform.toLowerCase()) {
          case 'linkedin':
            result = await postToLinkedIn(post.content, credentials);
            break;
          case 'twitter':
            result = await postToTwitter(post.content, credentials);
            break;
          case 'instagram':
            result = await postToInstagram(post.content, credentials);
            break;
          case 'tiktok':
            result = await postToTikTok(post.content, credentials);
            break;
          default:
            throw new Error(`Unsupported platform: ${post.platform}`);
        }

        // Update post status
        if (result.success) {
          await supabase
            .from('scheduled_posts')
            .update({
              status: 'published',
              posted_at: new Date().toISOString(),
              platform_post_id: result.postId,
              error_message: null,
              updated_at: new Date().toISOString()
            })
            .eq('id', post.id);

          results.published++;
          console.log(`✅ Published post ${post.id} to ${post.platform} (ID: ${result.postId})`);
        } else {
          throw new Error(result.error || 'Unknown error');
        }
      } catch (error) {
        // Mark as failed
        await supabase
          .from('scheduled_posts')
          .update({
            status: 'failed',
            error_message: error.message,
            updated_at: new Date().toISOString()
          })
          .eq('id', post.id);

        results.failed++;
        results.errors.push({
          postId: post.id,
          platform: post.platform,
          error: error.message
        });

        console.error(`❌ Failed post ${post.id}:`, error.message);
      }
    }

    console.log('\n📊 Summary:', results);

    return new Response(
      JSON.stringify(results),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('💥 Edge function error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});
