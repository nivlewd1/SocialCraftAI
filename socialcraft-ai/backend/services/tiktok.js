const axios = require('axios');

const getTikTokData = async (accessToken) => {
    try {
        // 1. Get user's videos
        const fields = "id,like_count,comment_count,share_count";
        const videoUrl = `https://open.tiktokapis.com/v2/video/list/?fields=${fields}`;
        
        const videoResponse = await axios.post(videoUrl, {}, {
            headers: { 
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
             }
        });
        
        const videos = videoResponse.data.data.videos;
        if (!videos) {
             return { engagement: 0 };
        }

        // 2. Aggregate engagement
        const totalEngagement = videos.reduce((acc, video) => {
            return acc + (video.like_count || 0) + (video.comment_count || 0) + (video.share_count || 0);
        }, 0);
        
        console.log(`Fetched TikTok data. Total engagement: ${totalEngagement}`);
        return { engagement: totalEngagement };

    } catch (error) {
        console.error('TikTok API Error:', error.response?.data || error.message);
        return { engagement: 0 };
    }
};

module.exports = { getTikTokData };
