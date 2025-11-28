import { Platform } from '../types';

// Twitter/X character limits by subscription tier
export const TWITTER_LIMITS = {
    FREE: 280,
    PREMIUM: 4000,
    PREMIUM_PLUS: 25000
} as const;

export type TwitterTier = keyof typeof TWITTER_LIMITS;

// LinkedIn character limits
export const LINKEDIN_LIMITS = {
    POST: 3000,
    ARTICLE: 110000
} as const;

// Instagram character limits
export const INSTAGRAM_LIMITS = {
    CAPTION: 2200,
    STORY: 2200,
    REEL: 2200
} as const;

// Platform-specific limits
export const PLATFORM_LIMITS = {
    [Platform.Twitter]: TWITTER_LIMITS.FREE, // Default to free tier
    [Platform.LinkedIn]: LINKEDIN_LIMITS.POST,
    [Platform.Instagram]: INSTAGRAM_LIMITS.CAPTION,
    [Platform.TikTok]: 2200,
    [Platform.Pinterest]: 500
} as const;

/**
 * Get character limit for a platform
 * @param platform - The social platform
 * @param tier - Twitter tier (only used for Twitter)
 */
export const getPlatformLimit = (
    platform: Platform,
    tier: TwitterTier = 'FREE'
): number => {
    if (platform === Platform.Twitter) {
        return TWITTER_LIMITS[tier];
    }
    return PLATFORM_LIMITS[platform] || 280;
};

/**
 * Get display name for Twitter tier
 */
export const getTwitterTierName = (tier: TwitterTier): string => {
    const names = {
        FREE: 'Free',
        PREMIUM: 'Premium',
        PREMIUM_PLUS: 'Premium+'
    };
    return names[tier];
};

/**
 * Calculate percentage of limit used
 */
export const getUsagePercentage = (
    content: string,
    limit: number
): number => {
    return Math.min(100, Math.round((content.length / limit) * 100));
};

/**
 * Get color code based on usage percentage
 */
export const getUsageColor = (percentage: number): {
    bg: string;
    text: string;
    border: string;
} => {
    if (percentage >= 100) {
        return {
            bg: 'bg-red-50',
            text: 'text-red-700',
            border: 'border-red-200'
        };
    } else if (percentage >= 90) {
        return {
            bg: 'bg-yellow-50',
            text: 'text-yellow-700',
            border: 'border-yellow-200'
        };
    } else if (percentage >= 75) {
        return {
            bg: 'bg-orange-50',
            text: 'text-orange-700',
            border: 'border-orange-200'
        };
    } else {
        return {
            bg: 'bg-green-50',
            text: 'text-green-700',
            border: 'border-green-200'
        };
    }
};
