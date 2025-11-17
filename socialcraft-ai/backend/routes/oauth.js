const express = require('express');
const axios = require('axios');
const router = express.Router();
const { saveSocialToken, getAllSocialTokens, deleteSocialToken } = require('../services/socialAuthService');
const { verifySupabaseToken } = require('../middleware/supabaseAuth');

// --- LinkedIn OAuth ---
router.get('/linkedin', (req, res) => {
    // Get JWT token from state parameter (passed from frontend)
    const { state } = req.query;
    const scope = 'openid profile w_member_social'; // Basic permissions
    const url = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${process.env.LINKEDIN_CLIENT_ID}&redirect_uri=${process.env.LINKEDIN_REDIRECT_URI}&scope=${scope}&state=${encodeURIComponent(state || '')}`;
    res.redirect(url);
});

router.get('/linkedin/callback', async (req, res) => {
    const { code, state } = req.query;

    try {
        // Verify JWT token from state parameter
        const supabase = require('../config/supabase');
        const { data: { user }, error: authError } = await supabase.auth.getUser(state);

        if (authError || !user) {
            console.error('Authentication error:', authError);
            return res.status(401).send('Authentication failed. Please try connecting again.');
        }

        const userId = user.id;

        // Exchange authorization code for access token
        const response = await axios.post('https://www.linkedin.com/oauth/v2/accessToken', null, {
            params: {
                grant_type: 'authorization_code',
                code,
                client_id: process.env.LINKEDIN_CLIENT_ID,
                client_secret: process.env.LINKEDIN_CLIENT_SECRET,
                redirect_uri: process.env.LINKEDIN_REDIRECT_URI
            }
        });

        // Save token to database
        await saveSocialToken(userId, 'linkedin', {
            access_token: response.data.access_token,
            refresh_token: response.data.refresh_token || null,
            expires_at: response.data.expires_in
                ? new Date(Date.now() + response.data.expires_in * 1000).toISOString()
                : null,
            scopes: ['openid', 'profile', 'w_member_social']
        });

        // Send success message and close popup
        res.send(`
            <html>
                <body>
                    <h2>LinkedIn connected successfully!</h2>
                    <p>You can close this window.</p>
                    <script>
                        window.opener.postMessage({ type: 'oauth_success', platform: 'linkedin' }, window.location.origin);
                        setTimeout(() => window.close(), 1000);
                    </script>
                </body>
            </html>
        `);
    } catch (error) {
        console.error('LinkedIn OAuth Error:', error.response?.data || error.message);
        res.send(`
            <html>
                <body>
                    <h2>Failed to connect LinkedIn account</h2>
                    <p>Error: ${error.message}</p>
                    <p>You can close this window.</p>
                    <script>
                        window.opener.postMessage({ type: 'oauth_error', platform: 'linkedin', error: '${error.message}' }, window.location.origin);
                        setTimeout(() => window.close(), 3000);
                    </script>
                </body>
            </html>
        `);
    }
});

// --- Instagram OAuth ---
router.get('/instagram', (req, res) => {
    const scope = 'user_profile,user_media';
    const url = `https://api.instagram.com/oauth/authorize?client_id=${process.env.INSTAGRAM_CLIENT_ID}&redirect_uri=${process.env.INSTAGRAM_REDIRECT_URI}&scope=${scope}&response_type=code`;
    res.redirect(url);
});

router.get('/instagram/callback', async (req, res) => {
    const { code } = req.query;
    const userId = req.user.id;
    try {
        const params = new URLSearchParams();
        params.append('client_id', process.env.INSTAGRAM_CLIENT_ID);
        params.append('client_secret', process.env.INSTAGRAM_CLIENT_SECRET);
        params.append('grant_type', 'authorization_code');
        params.append('redirect_uri', process.env.INSTAGRAM_REDIRECT_URI);
        params.append('code', code);

        const response = await axios.post('https://api.instagram.com/oauth/access_token', params);

        // Save token to database
        await saveSocialToken(userId, 'instagram', {
            access_token: response.data.access_token,
            platform_user_id: response.data.user_id || null,
            expires_at: response.data.expires_in
                ? new Date(Date.now() + response.data.expires_in * 1000).toISOString()
                : null,
            scopes: ['user_profile', 'user_media'],
            metadata: {
                user_id: response.data.user_id
            }
        });

        res.send('Instagram connected successfully! You can close this window.');
    } catch (error) {
        console.error('Instagram OAuth Error:', error.response?.data || error.message);
        res.status(500).send('Failed to connect Instagram account.');
    }
});


// --- TikTok OAuth ---
router.get('/tiktok', (req, res) => {
    const scope = 'user.info.basic,video.list';
    const csrfState = Math.random().toString(36).substring(2);
    res.cookie('csrfState', csrfState, { maxAge: 60000 });
    const url = `https://www.tiktok.com/v2/auth/authorize/?client_key=${process.env.TIKTOK_CLIENT_KEY}&scope=${scope}&response_type=code&redirect_uri=${process.env.TIKTOK_REDIRECT_URI}&state=${csrfState}`;
    res.redirect(url);
});

router.get('/tiktok/callback', async (req, res) => {
    const { code } = req.query;
    const userId = req.user.id;
    try {
        const response = await axios.post('https://open.tiktokapis.com/v2/oauth/token/', null, {
            params: {
                client_key: process.env.TIKTOK_CLIENT_KEY,
                client_secret: process.env.TIKTOK_CLIENT_SECRET,
                code,
                grant_type: 'authorization_code',
                redirect_uri: process.env.TIKTOK_REDIRECT_URI
            }
        });

        // Save token to database
        await saveSocialToken(userId, 'tiktok', {
            access_token: response.data.access_token,
            refresh_token: response.data.refresh_token || null,
            expires_at: response.data.expires_in
                ? new Date(Date.now() + response.data.expires_in * 1000).toISOString()
                : null,
            scopes: response.data.scope ? response.data.scope.split(',') : ['user.info.basic', 'video.list'],
            metadata: {
                open_id: response.data.open_id,
                token_type: response.data.token_type
            }
        });

        res.send('TikTok connected successfully! You can close this window.');
    } catch (error) {
        console.error('TikTok OAuth Error:', error.response?.data || error.message);
        res.status(500).send('Failed to connect TikTok account.');
    }
});

// --- API Endpoints for Managing Connected Accounts ---

/**
 * GET /api/oauth/connected
 * List all connected social media accounts for the authenticated user
 * PROTECTED ROUTE - requires authentication
 */
router.get('/connected', verifySupabaseToken, async (req, res) => {
    const userId = req.user.id;
    try {
        const accounts = await getAllSocialTokens(userId);

        // Don't send actual tokens to frontend - only metadata
        const safeAccounts = accounts.map(acc => ({
            id: acc.id,
            user_id: acc.user_id,
            platform: acc.platform,
            platform_username: acc.platform_username,
            platform_user_id: acc.platform_user_id,
            created_at: acc.created_at,
            updated_at: acc.updated_at,
            token_expires_at: acc.token_expires_at,
            scopes: acc.scopes
        }));

        res.json({ accounts: safeAccounts });
    } catch (error) {
        console.error('Error fetching connected accounts:', error);
        res.status(500).json({ message: 'Failed to fetch connected accounts' });
    }
});

/**
 * DELETE /api/oauth/:platform
 * Disconnect a social media account
 * PROTECTED ROUTE - requires authentication
 */
router.delete('/:platform', verifySupabaseToken, async (req, res) => {
    const userId = req.user.id;
    const { platform } = req.params;

    // Validate platform
    const validPlatforms = ['linkedin', 'instagram', 'tiktok', 'twitter', 'pinterest'];
    if (!validPlatforms.includes(platform)) {
        return res.status(400).json({ message: 'Invalid platform' });
    }

    try {
        await deleteSocialToken(userId, platform);
        res.json({ message: `${platform} disconnected successfully` });
    } catch (error) {
        console.error('Error disconnecting account:', error);
        res.status(500).json({ message: 'Failed to disconnect account' });
    }
});

module.exports = router;
