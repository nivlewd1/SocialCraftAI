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

        // Efficient Query using the new Index
        const { data: posts, error } = await supabaseAdmin
            .from('scheduled_posts')
            .select(`
                *,
                connected_accounts!inner (
                    access_token,
                    platform,
                    token_expires_at
                )
            `)
            .eq('status', 'scheduled')
            .lte('scheduled_at', now)
            .eq('connected_accounts.platform', supabaseAdmin.raw('scheduled_posts.platform'))
            .limit(20); // Processing batch size

        if (error) {
            console.error('Worker Error:', error.message);
            return;
        }

        if (posts?.length > 0) {
            console.log(`⚡ Processing ${posts.length} due posts...`);
            await Promise.all(posts.map(processPost));
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

        // 4. Success
        await supabaseAdmin.from('scheduled_posts').update({
            status: 'posted',
            posted_at: new Date().toISOString(),
            metadata: { platform_id: result.id }
        }).eq('id', post.id);

    } catch (err) {
        console.error(`Failed post ${post.id}:`, err.message);
        await supabaseAdmin.from('scheduled_posts').update({
            status: 'failed',
            error_message: err.message
        }).eq('id', post.id);
    }
};

module.exports = { initScheduler };
