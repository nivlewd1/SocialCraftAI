const { TwitterApi } = require('twitter-api-v2');
const axios = require('axios');

const publishToPlatform = async (platform, content, token) => {
    switch (platform.toLowerCase()) {
        case 'twitter':
        case 'x (twitter)':
            return postToTwitter(content, token);
        case 'linkedin':
            return postToLinkedIn(content, token);
        default:
            throw new Error(`Platform ${platform} not supported yet`);
    }
};

// Twitter Logic
async function postToTwitter(content, token) {
    const client = new TwitterApi(token);
    const payload = { text: content.primaryContent || content.content }; // Handle both field names

    // If media exists (public Supabase URL), fetch and upload
    if (content.media && content.media.length > 0) {
        const mediaIds = [];
        for (const url of content.media) {
            const { data } = await axios.get(url, { responseType: 'arraybuffer' });
            const mediaId = await client.v1.uploadMedia(Buffer.from(data), { mimeType: 'image/png' });
            mediaIds.push(mediaId);
        }
        payload.media = { media_ids: mediaIds };
    }

    const { data } = await client.v2.tweet(payload);
    return { id: data.id };
}

// LinkedIn Logic
async function postToLinkedIn(content, token) {
    // Fetch User URN
    const me = await axios.get('https://api.linkedin.com/v2/me', {
        headers: { Authorization: `Bearer ${token}` }
    });

    const body = {
        author: `urn:li:person:${me.data.id}`,
        lifecycleState: 'PUBLISHED',
        specificContent: {
            'com.linkedin.ugc.ShareContent': {
                shareCommentary: { text: content.primaryContent || content.content },
                shareMediaCategory: 'NONE' // MVP: Text only first
            }
        },
        visibility: { 'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC' }
    };

    const { data } = await axios.post('https://api.linkedin.com/v2/ugcPosts', body, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return { id: data.id };
}

module.exports = { publishToPlatform };
