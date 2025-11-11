const express = require('express');
const axios = require('axios');
const router = express.Router();

// In-memory store for user tokens. Replace with a database in production.
const userTokens = {};

// --- LinkedIn OAuth ---
router.get('/linkedin', (req, res) => {
    const scope = 'openid profile w_member_social'; // Basic permissions
    const url = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${process.env.LINKEDIN_CLIENT_ID}&redirect_uri=${process.env.LINKEDIN_REDIRECT_URI}&scope=${scope}`;
    res.redirect(url);
});

router.get('/linkedin/callback', async (req, res) => {
    const { code } = req.query;
    const userId = req.user.id;
    try {
        const response = await axios.post('https://www.linkedin.com/oauth/v2/accessToken', null, {
            params: {
                grant_type: 'authorization_code',
                code,
                client_id: process.env.LINKEDIN_CLIENT_ID,
                client_secret: process.env.LINKEDIN_CLIENT_SECRET,
                redirect_uri: process.env.LINKEDIN_REDIRECT_URI
            }
        });
        userTokens[userId] = { ...userTokens[userId], linkedin: response.data.access_token };
        res.send('LinkedIn connected successfully! You can close this window.');
    } catch (error) {
        console.error('LinkedIn OAuth Error:', error.response?.data || error.message);
        res.status(500).send('Failed to connect LinkedIn account.');
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
        userTokens[userId] = { ...userTokens[userId], instagram: response.data.access_token };
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
        userTokens[userId] = { ...userTokens[userId], tiktok: response.data.access_token };
        res.send('TikTok connected successfully! You can close this window.');
    } catch (error) {
        console.error('TikTok OAuth Error:', error.response?.data || error.message);
        res.status(500).send('Failed to connect TikTok account.');
    }
});

module.exports = router;
