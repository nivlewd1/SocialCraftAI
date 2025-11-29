import { Platform } from '../types';

export interface ComplianceRule {
    maxCharacters: number;
    maxHashtags: number;
    allowedMediaTypes: string[];
    maxMediaCount: number;
}

export const PLATFORM_RULES: Record<Platform, ComplianceRule> = {
    [Platform.Twitter]: {
        maxCharacters: 280,
        maxHashtags: 30, // Soft limit, but good for quality
        allowedMediaTypes: ['image/jpeg', 'image/png', 'image/gif', 'video/mp4'],
        maxMediaCount: 4
    },
    [Platform.LinkedIn]: {
        maxCharacters: 3000,
        maxHashtags: 30,
        allowedMediaTypes: ['image/jpeg', 'image/png', 'image/gif', 'video/mp4', 'application/pdf'],
        maxMediaCount: 9
    },
    [Platform.Instagram]: {
        maxCharacters: 2200,
        maxHashtags: 30,
        allowedMediaTypes: ['image/jpeg', 'image/png', 'video/mp4'],
        maxMediaCount: 10
    },
    [Platform.TikTok]: {
        maxCharacters: 2200,
        maxHashtags: 30,
        allowedMediaTypes: ['video/mp4'],
        maxMediaCount: 1
    },
    [Platform.Pinterest]: {
        maxCharacters: 500,
        maxHashtags: 20,
        allowedMediaTypes: ['image/jpeg', 'image/png', 'video/mp4'],
        maxMediaCount: 1
    }
};

export interface ComplianceResult {
    isValid: boolean;
    errors: string[];
    warnings: string[];
}

export const complianceService = {
    validateContent(content: string, platform: Platform, mediaCount: number = 0): ComplianceResult {
        const rules = PLATFORM_RULES[platform];
        const errors: string[] = [];
        const warnings: string[] = [];

        // Character count
        if (content.length > rules.maxCharacters) {
            errors.push(`Content exceeds ${platform} character limit of ${rules.maxCharacters} (current: ${content.length})`);
        }

        // Hashtag count
        const hashtags = (content.match(/#[a-zA-Z0-9_]+/g) || []);
        if (hashtags.length > rules.maxHashtags) {
            warnings.push(`Too many hashtags. Recommended max for ${platform} is ${rules.maxHashtags}`);
        }

        // Media count
        if (mediaCount > rules.maxMediaCount) {
            errors.push(`Too many media items. Max for ${platform} is ${rules.maxMediaCount}`);
        }

        return {
            isValid: errors.length === 0,
            errors,
            warnings
        };
    },

    getRules(platform: Platform): ComplianceRule {
        return PLATFORM_RULES[platform];
    }
};
