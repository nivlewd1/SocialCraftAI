const { TwitterApi } = require('twitter-api-v2');
const axios = require('axios');

// Twitter character limits by tier
const TWITTER_LIMITS = {
    FREE: 280,
    PREMIUM: 4000,
    PREMIUM_PLUS: 25000
};

/**
 * Detect Twitter tier by checking account capabilities
 */
async function detectTwitterTier(client) {
    try {
        // Get user info with subscription type
        const me = await client.v2.me({ 'user.fields': ['subscription_type'] });

        if (me.data.subscription_type) {
            const subType = me.data.subscription_type.toLowerCase();
            if (subType.includes('premium_plus') || subType.includes('premium+')) {
                return 'PREMIUM_PLUS';
            } else if (subType.includes('premium') || subType.includes('blue')) {
                return 'PREMIUM';
            }
        }
    } catch (err) {
        console.log('Could not detect Twitter tier, assuming FREE:', err.message);
    }

    return 'FREE';
}

/**
 * Smart truncate content while preserving hashtags
 */
function smartTruncate(content, limit) {
    if (content.length <= limit) return content;

    // Extract hashtags
    const hashtagRegex = /#[\w]+/g;
    const hashtags = content.match(hashtagRegex) || [];
    const hashtagText = hashtags.join(' ');

    // Remove hashtags from main content
    const mainContent = content.replace(hashtagRegex, '').replace(/\s+/g, ' ').trim();

    // Calculate available space
    const hashtagSpace = hashtagText.length + (hashtagText ? 4 : 0); // +4 for "... "
    const availableSpace = limit - hashtagSpace;

    if (availableSpace <= 0) {
        return content.substring(0, limit);
    }

    // Truncate main content at word boundary
    const words = mainContent.split(/\s+/);
    let truncated = '';

    for (const word of words) {
        const nextLength = truncated.length + (truncated ? 1 : 0) + word.length;
        if (nextLength > availableSpace) break;
        truncated += (truncated ? ' ' : '') + word;
    }

    // Reconstruct with hashtags
    return hashtagText
        ? `${truncated}... ${hashtagText}`
        : `${truncated}...`;
}

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

    // Extract text content - support multiple formats for backward compatibility
    let textContent = content.primaryContent || content.text || content.content || '';

    if (!textContent) {
        throw new Error('No text content found in post');
    }

    // Detect user's Twitter tier
    const tier = await detectTwitterTier(client);
    const limit = TWITTER_LIMITS[tier];

    console.log(`Twitter tier detected: ${tier} (${limit} char limit)`);

    // Validate and potentially truncate content
    let finalContent = textContent;
    let wasTruncated = false;

    if (textContent.length > limit) {
        console.warn(`Post exceeds ${limit} char limit (${textContent.length} chars). Auto-truncating...`);
        finalContent = smartTruncate(textContent, limit);
        wasTruncated = true;
    }

    const payload = { text: finalContent };

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

    return {
        id: data.id,
        tier,
        warning: wasTruncated
            ? `Post was auto-truncated from ${textContent.length} to ${finalContent.length} characters`
            : null
    };
}

// LinkedIn Logic
async function postToLinkedIn(content, token) {
    // Extract text content - support multiple formats for backward compatibility
    const textContent = content.primaryContent || content.text || content.content || '';

    if (!textContent) {
        throw new Error('No text content found in post');
    }

    // Fetch User URN
    const me = await axios.get('https://api.linkedin.com/v2/me', {
        headers: { Authorization: `Bearer ${token}` }
    });

    const body = {
        author: `urn:li:person:${me.data.id}`,
        lifecycleState: 'PUBLISHED',
        specificContent: {
            'com.linkedin.ugc.ShareContent': {
                shareCommentary: { text: textContent },
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
