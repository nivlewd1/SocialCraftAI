const axios = require('axios');

const getInstagramData = async (accessToken) => {
    try {
        // 1. Get user's media
        const mediaUrl = `https://graph.instagram.com/me/media?fields=id,like_count,comments_count&access_token=${accessToken}`;
        const mediaResponse = await axios.get(mediaUrl);
        const media = mediaResponse.data.data;

        // 2. Aggregate engagement
        const totalEngagement = media.reduce((acc, post) => {
            return acc + (post.like_count || 0) + (post.comments_count || 0);
        }, 0);

        console.log(`Fetched Instagram data. Total engagement: ${totalEngagement}`);
        return { engagement: totalEngagement };
    } catch (error) {
        console.error('Instagram API Error:', error.response?.data || error.message);
        return { engagement: 0 };
    }
};

module.exports = { getInstagramData };
