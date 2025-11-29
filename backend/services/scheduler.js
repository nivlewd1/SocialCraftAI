const cron = require('node-cron');
const { createClient } = require('@supabase/supabase-js');
const { publishToPlatform } = require('./publisher');
const { decryptToken } = require('./socialAuthService');
const axios = require('axios');

// ⚠️ CRITICAL: Uses Service Role Key to bypass RLS
const supabaseAdmin = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

const initScheduler = () => {
    console.log('⏰ Publishing Engine Online');

    // Heartbeat: Every 60 seconds
    cron.schedule('* * * * *', async () => {
        const now = new Date().toISOString();

        // Fetch due posts
        const { data: posts, error } = await supabaseAdmin
            .from('scheduled_posts')
            .select('*')
            .eq('status', 'scheduled')
            .lte('scheduled_at', now)
            .limit(20); // Processing batch size

        if (error) {
            console.error('Worker Error:', error.message);
            return;
        }

        if (posts?.length > 0) {
            console.log(`⚡ Processing ${posts.length} due posts...`);

            // Fetch connected accounts for these posts
            const userIds = [...new Set(posts.map(p => p.user_id))];
            const { data: accounts, error: accountsError } = await supabaseAdmin
                .from('connected_accounts')
                .select('*')
                .in('user_id', userIds);

            if (accountsError) {
                console.error('Failed to fetch connected accounts:', accountsError.message);
                return;
            }

            // Match posts with their connected accounts
            const postsWithAccounts = posts.map(post => {
                const account = accounts?.find(acc =>
                    acc.user_id === post.user_id &&
                    acc.platform === post.platform
                );
                return { ...post, connected_accounts: account };
            }).filter(post => post.connected_accounts); // Only process posts with connected accounts

            if (postsWithAccounts.length > 0) {
                await Promise.all(postsWithAccounts.map(processPost));
            } else {
                console.log('No posts with matching connected accounts found');
            }
        }
    });
};

const processPost = async (post) => {
    // 1. Lock Row
    await supabaseAdmin.from('scheduled_posts').update({ status: 'processing' }).eq('id', post.id);

    try {
        // 2. Decrypt Token
        const accessToken = decryptToken(post.connected_accounts.access_token);

        // 3. Publish via Router
        const result = await publishToPlatform(post.platform, post.content, accessToken);

        // 4. Store detected Twitter tier if available
        if (result.tier && post.platform === 'twitter') {
            await supabaseAdmin.from('connected_accounts').update({
                twitter_tier: result.tier
            }).eq('id', post.connected_accounts.id);
        }

        // 5. Success
        const updateData = {
            status: 'posted',
            posted_at: new Date().toISOString(),
            metadata: { platform_id: result.id }
        };

        // Add warning if content was truncated
        if (result.warning) {
            updateData.error_message = result.warning; // Store as warning, not error
        }

        await supabaseAdmin.from('scheduled_posts').update(updateData).eq('id', post.id);

    } catch (err) {
        console.error(`Failed post ${post.id}:`, err.message);
        await supabaseAdmin.from('scheduled_posts').update({
            status: 'failed',
            error_message: err.message
        }).eq('id', post.id);

        // Send email notification if enabled
        await sendFailedPostNotification(post, err.message);
    }
};

/**
 * Send email notification for failed post
 */
const sendFailedPostNotification = async (post, errorMessage) => {
    try {
        // Get user's email notification settings
        const { data: settings } = await supabaseAdmin
            .from('email_notification_settings')
            .select('*')
            .eq('user_id', post.user_id)
            .single();

        // Check if user has email notifications enabled for failed posts
        if (!settings || !settings.failed_posts_enabled || !settings.email) {
            return; // User has disabled notifications or no email set
        }

        // Get user email from auth if not in settings
        const { data: { user } } = await supabaseAdmin.auth.admin.getUserById(post.user_id);
        const userEmail = settings.email || user?.email;

        if (!userEmail) {
            console.log('No email found for user:', post.user_id);
            return;
        }

        // Extract content text
        let contentText = 'No content';
        if (post.content) {
            if (typeof post.content === 'string') {
                contentText = post.content;
            } else if (post.content.primaryContent) {
                contentText = post.content.primaryContent;
            } else if (post.content.text) {
                contentText = post.content.text;
            }
        }

        // Send email notification via API
        await axios.post(`http://localhost:${process.env.PORT || 3001}/api/notifications/failed-post`, {
            postId: post.id,
            platform: post.platform,
            content: contentText,
            scheduledAt: post.scheduled_at,
            errorMessage: errorMessage,
            userEmail: userEmail,
        }).catch(emailErr => {
            console.error('Failed to send email notification:', emailErr.message);
        });

        console.log(`📧 Email notification sent to ${userEmail} for failed post ${post.id}`);
    } catch (err) {
        // Don't fail the entire process if email notification fails
        console.error('Error sending failed post notification:', err.message);
    }
};

module.exports = { initScheduler };
