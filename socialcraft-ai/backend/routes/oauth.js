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
                        window.opener.postMessage({ type: 'oauth_success', platform: 'linkedin' }, '*');
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
                        window.opener.postMessage({ type: 'oauth_error', platform: 'linkedin', error: '${error.message}' }, '*');
                        setTimeout(() => window.close(), 3000);
                    </script>
                </body>
            </html>
        `);
    }
});

// --- Instagram OAuth ---
router.get('/instagram', (req, res) => {
    // Get JWT token from state parameter (passed from frontend)
    const { state } = req.query;

    // Include Facebook Page permissions needed to access Instagram Business accounts
    const scope = 'pages_show_list,pages_read_engagement,instagram_basic,instagram_content_publish';

    const url = `https://www.facebook.com/v18.0/dialog/oauth?client_id=${process.env.INSTAGRAM_CLIENT_ID}&redirect_uri=${encodeURIComponent(process.env.INSTAGRAM_REDIRECT_URI)}&scope=${scope}&response_type=code&state=${encodeURIComponent(state || '')}`;

    res.redirect(url);
});

router.get('/instagram/callback', async (req, res) => {
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
        const tokenUrl = 'https://graph.facebook.com/v18.0/oauth/access_token';
        const response = await axios.get(tokenUrl, {
            params: {
                client_id: process.env.INSTAGRAM_CLIENT_ID,
                client_secret: process.env.INSTAGRAM_CLIENT_SECRET,
                redirect_uri: process.env.INSTAGRAM_REDIRECT_URI,
                code: code
            }
        });

        const accessToken = response.data.access_token;

        // Get Instagram account info
        let instagramUserId = null;
        let instagramUsername = null;
        try {
            const accountsResponse = await axios.get('https://graph.facebook.com/v18.0/me/accounts', {
                params: {
                    access_token: accessToken,
                    fields: 'instagram_business_account'
                }
            });

            if (accountsResponse.data.data && accountsResponse.data.data.length > 0) {
                const igAccountId = accountsResponse.data.data[0].instagram_business_account?.id;
                if (igAccountId) {
                    const igResponse = await axios.get(`https://graph.facebook.com/v18.0/${igAccountId}`, {
                        params: {
                            access_token: accessToken,
                            fields: 'id,username'
                        }
                    });
                    instagramUserId = igResponse.data.id;
                    instagramUsername = igResponse.data.username;
                }
            }
        } catch (igError) {
            console.error('Error fetching Instagram account info:', igError.response?.data || igError.message);
        }

        // Save token to database
        await saveSocialToken(userId, 'instagram', {
            access_token: accessToken,
            refresh_token: null,
            platform_user_id: instagramUserId,
            platform_username: instagramUsername,
            expires_at: response.data.expires_in
                ? new Date(Date.now() + response.data.expires_in * 1000).toISOString()
                : null,
            scopes: ['instagram_business_basic', 'instagram_business_content_publish'],
            metadata: {
                token_type: response.data.token_type
            }
        });

        // Send success message and close popup
        res.send(`
            <html>
                <body>
                    <h2>Instagram connected successfully!</h2>
                    <p>You can close this window.</p>
                    <script>
                        window.opener.postMessage({ type: 'oauth_success', platform: 'instagram' }, '*');
                        setTimeout(() => window.close(), 1000);
                    </script>
                </body>
            </html>
        `);
    } catch (error) {
        console.error('Instagram OAuth Error:', error.response?.data || error.message);
        res.send(`
            <html>
                <body>
                    <h2>Failed to connect Instagram account</h2>
                    <p>Error: ${error.message}</p>
                    <p>You can close this window.</p>
                    <script>
                        window.opener.postMessage({ type: 'oauth_error', platform: 'instagram', error: '${error.message}' }, '*');
                        setTimeout(() => window.close(), 3000);
                    </script>
                </body>
            </html>
        `);
    }
});


// --- TikTok OAuth ---
router.get('/tiktok', (req, res) => {
    // Get JWT token from state parameter (passed from frontend)
    const { state } = req.query;

    // TikTok scopes for user info and video publishing
    const scope = 'user.info.basic,video.publish,video.list';

    const url = `https://www.tiktok.com/v2/auth/authorize/?client_key=${process.env.TIKTOK_CLIENT_KEY}&scope=${scope}&response_type=code&redirect_uri=${encodeURIComponent(process.env.TIKTOK_REDIRECT_URI)}&state=${encodeURIComponent(state || '')}`;

    res.redirect(url);
});

router.get('/tiktok/callback', async (req, res) => {
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
        const tokenResponse = await axios.post('https://open.tiktokapis.com/v2/oauth/token/',
            new URLSearchParams({
                client_key: process.env.TIKTOK_CLIENT_KEY,
                client_secret: process.env.TIKTOK_CLIENT_SECRET,
                code: code,
                grant_type: 'authorization_code',
                redirect_uri: process.env.TIKTOK_REDIRECT_URI
            }),
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }
        );

        const accessToken = tokenResponse.data.access_token;
        const openId = tokenResponse.data.open_id;

        // Get TikTok user info
        let tiktokUsername = null;
        try {
            const userInfoResponse = await axios.get('https://open.tiktokapis.com/v2/user/info/', {
                params: {
                    fields: 'open_id,union_id,avatar_url,display_name'
                },
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });

            if (userInfoResponse.data?.data?.user) {
                tiktokUsername = userInfoResponse.data.data.user.display_name;
            }
        } catch (userInfoError) {
            console.error('Error fetching TikTok user info:', userInfoError.response?.data || userInfoError.message);
        }

        // Save token to database
        await saveSocialToken(userId, 'tiktok', {
            access_token: accessToken,
            refresh_token: tokenResponse.data.refresh_token || null,
            platform_user_id: openId,
            platform_username: tiktokUsername,
            expires_at: tokenResponse.data.expires_in
                ? new Date(Date.now() + tokenResponse.data.expires_in * 1000).toISOString()
                : null,
            scopes: tokenResponse.data.scope ? tokenResponse.data.scope.split(',') : ['user.info.basic', 'video.publish', 'video.list'],
            metadata: {
                open_id: openId,
                token_type: tokenResponse.data.token_type
            }
        });

        // Send success message and close popup
        res.send(`
            <html>
                <body>
                    <h2>TikTok connected successfully!</h2>
                    <p>You can close this window.</p>
                    <script>
                        window.opener.postMessage({ type: 'oauth_success', platform: 'tiktok' }, '*');
                        setTimeout(() => window.close(), 1000);
                    </script>
                </body>
            </html>
        `);
    } catch (error) {
        console.error('TikTok OAuth Error:', error.response?.data || error.message);
        res.send(`
            <html>
                <body>
                    <h2>Failed to connect TikTok account</h2>
                    <p>Error: ${error.message}</p>
                    <p>You can close this window.</p>
                    <script>
                        window.opener.postMessage({ type: 'oauth_error', platform: 'tiktok', error: '${error.message}' }, '*');
                        setTimeout(() => window.close(), 3000);
                    </script>
                </body>
            </html>
        `);
    }
});

// --- Twitter (X) OAuth ---
// X uses OAuth 2.0 with PKCE (Proof Key for Code Exchange)
// Store code_verifier temporarily for PKCE flow
const pkceStore = new Map();

// Helper function to generate PKCE code_verifier and code_challenge
function generatePKCE() {
    const crypto = require('crypto');
    const code_verifier = crypto.randomBytes(32).toString('base64url');
    const code_challenge = crypto.createHash('sha256').update(code_verifier).digest('base64url');
    return { code_verifier, code_challenge };
}

router.get('/twitter', (req, res) => {
    // Get JWT token from state parameter (passed from frontend)
    const { state } = req.query;

    // Generate PKCE parameters
    const { code_verifier, code_challenge } = generatePKCE();

    // Store code_verifier temporarily (expires in 10 minutes)
    const pkceKey = crypto.randomBytes(16).toString('hex');
    pkceStore.set(pkceKey, code_verifier);
    setTimeout(() => pkceStore.delete(pkceKey), 10 * 60 * 1000);

    // Combine state and PKCE key
    const combinedState = `${state}|${pkceKey}`;

    // X OAuth 2.0 scopes
    const scope = 'tweet.read tweet.write users.read offline.access';

    const url = `https://twitter.com/i/oauth2/authorize?response_type=code&client_id=${process.env.TWITTER_CLIENT_ID}&redirect_uri=${encodeURIComponent(process.env.TWITTER_REDIRECT_URI)}&scope=${encodeURIComponent(scope)}&state=${encodeURIComponent(combinedState)}&code_challenge=${code_challenge}&code_challenge_method=S256`;

    res.redirect(url);
});

router.get('/twitter/callback', async (req, res) => {
    const { code, state } = req.query;

    try {
        // Split combined state to get JWT and PKCE key
        const [jwtToken, pkceKey] = state.split('|');

        // Verify JWT token from state parameter
        const supabase = require('../config/supabase');
        const { data: { user }, error: authError } = await supabase.auth.getUser(jwtToken);

        if (authError || !user) {
            console.error('Authentication error:', authError);
            return res.status(401).send('Authentication failed. Please try connecting again.');
        }

        const userId = user.id;

        // Retrieve code_verifier for PKCE
        const code_verifier = pkceStore.get(pkceKey);
        if (!code_verifier) {
            throw new Error('PKCE verification failed or expired');
        }

        // Clean up PKCE store
        pkceStore.delete(pkceKey);

        // Exchange authorization code for access token
        const tokenResponse = await axios.post('https://api.twitter.com/2/oauth2/token',
            new URLSearchParams({
                code: code,
                grant_type: 'authorization_code',
                client_id: process.env.TWITTER_CLIENT_ID,
                redirect_uri: process.env.TWITTER_REDIRECT_URI,
                code_verifier: code_verifier
            }),
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': `Basic ${Buffer.from(`${process.env.TWITTER_CLIENT_ID}:${process.env.TWITTER_CLIENT_SECRET}`).toString('base64')}`
                }
            }
        );

        const accessToken = tokenResponse.data.access_token;

        // Get Twitter user info
        let twitterUsername = null;
        let twitterUserId = null;
        try {
            const userInfoResponse = await axios.get('https://api.twitter.com/2/users/me', {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });

            if (userInfoResponse.data?.data) {
                twitterUserId = userInfoResponse.data.data.id;
                twitterUsername = userInfoResponse.data.data.username;
            }
        } catch (userInfoError) {
            console.error('Error fetching Twitter user info:', userInfoError.response?.data || userInfoError.message);
        }

        // Save token to database
        await saveSocialToken(userId, 'twitter', {
            access_token: accessToken,
            refresh_token: tokenResponse.data.refresh_token || null,
            platform_user_id: twitterUserId,
            platform_username: twitterUsername,
            expires_at: tokenResponse.data.expires_in
                ? new Date(Date.now() + tokenResponse.data.expires_in * 1000).toISOString()
                : null,
            scopes: tokenResponse.data.scope ? tokenResponse.data.scope.split(' ') : ['tweet.read', 'tweet.write', 'users.read', 'offline.access'],
            metadata: {
                token_type: tokenResponse.data.token_type
            }
        });

        // Send success message and close popup
        res.send(`
            <html>
                <body>
                    <h2>Twitter connected successfully!</h2>
                    <p>You can close this window.</p>
                    <script>
                        window.opener.postMessage({ type: 'oauth_success', platform: 'twitter' }, '*');
                        setTimeout(() => window.close(), 1000);
                    </script>
                </body>
            </html>
        `);
    } catch (error) {
        console.error('Twitter OAuth Error:', error.response?.data || error.message);
        res.send(`
            <html>
                <body>
                    <h2>Failed to connect Twitter account</h2>
                    <p>Error: ${error.message}</p>
                    <p>You can close this window.</p>
                    <script>
                        window.opener.postMessage({ type: 'oauth_error', platform: 'twitter', error: '${error.message}' }, '*');
                        setTimeout(() => window.close(), 3000);
                    </script>
                </body>
            </html>
        `);
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
