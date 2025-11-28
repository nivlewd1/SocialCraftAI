const cron = require('node-cron');
const { createClient } = require('@supabase/supabase-js');
const { publishToPlatform } = require('./publisher');
const { decryptToken } = require('./socialAuthService');

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
    }
};

module.exports = { initScheduler };
