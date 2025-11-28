import { Platform } from '../types';
import { getPlatformLimit, TwitterTier, getTwitterTierName } from './platformLimits';

export interface ValidationResult {
    isValid: boolean;
    characterCount: number;
    limit: number;
    exceeded: number;
    percentage: number;
    warnings: string[];
    suggestions: ContentSuggestion[];
}

export interface ContentSuggestion {
    type: 'truncate' | 'thread' | 'upgrade' | 'variation';
    label: string;
    description: string;
    action?: string;
}

/**
 * Validate content against platform character limits
 */
export const validateContent = (
    content: string,
    platform: Platform,
    tier: TwitterTier = 'FREE'
): ValidationResult => {
    const limit = getPlatformLimit(platform, tier);
    const count = content.length;
    const exceeded = Math.max(0, count - limit);
    const percentage = Math.round((count / limit) * 100);

    const result: ValidationResult = {
        isValid: count <= limit,
        characterCount: count,
        limit,
        exceeded,
        percentage,
        warnings: [],
        suggestions: []
    };

    if (!result.isValid) {
        // Add warning
        result.warnings.push(
            `Post exceeds ${platform} ${tier !== 'FREE' ? getTwitterTierName(tier) + ' ' : ''}limit by ${exceeded} characters`
        );

        // Add suggestions based on platform
        if (platform === Platform.Twitter) {
            addTwitterSuggestions(result, tier, count);
        } else {
            addGenericSuggestions(result);
        }
    } else if (percentage >= 90) {
        // Warning when close to limit
        result.warnings.push(
            `Post is ${percentage}% of character limit`
        );
    }

    return result;
};

/**
 * Add Twitter-specific suggestions
 */
const addTwitterSuggestions = (
    result: ValidationResult,
    tier: TwitterTier,
    count: number
): void => {
    // Suggest auto-truncate
    result.suggestions.push({
        type: 'truncate',
        label: 'Auto-Truncate',
        description: 'Smartly shorten post while preserving hashtags and key content',
        action: 'truncate'
    });

    // Suggest thread if content is long enough
    if (count > 280) {
        result.suggestions.push({
            type: 'thread',
            label: 'Create Thread',
            description: 'Split into multiple connected tweets',
            action: 'thread'
        });
    }

    // Suggest upgrade if on free tier
    if (tier === 'FREE' && count <= 4000) {
        result.suggestions.push({
            type: 'upgrade',
            label: 'Upgrade to Premium',
            description: `Get 4,000 character limit (current: ${count} chars)`,
            action: 'upgrade'
        });
    } else if (tier === 'PREMIUM' && count <= 25000) {
        result.suggestions.push({
            type: 'upgrade',
            label: 'Upgrade to Premium+',
            description: `Get 25,000 character limit (current: ${count} chars)`,
            action: 'upgrade'
        });
    }

    // Suggest variation if available
    result.suggestions.push({
        type: 'variation',
        label: 'Use Shorter Variation',
        description: 'Pick from generated content variations',
        action: 'variation'
    });
};

/**
 * Add generic platform suggestions
 */
const addGenericSuggestions = (result: ValidationResult): void => {
    result.suggestions.push({
        type: 'truncate',
        label: 'Shorten Content',
        description: 'Reduce content to fit within platform limits',
        action: 'truncate'
    });

    result.suggestions.push({
        type: 'variation',
        label: 'Use Shorter Variation',
        description: 'Select a different version of your content',
        action: 'variation'
    });
};

/**
 * Validate before scheduling - comprehensive check
 */
export const validateBeforeSchedule = (
    content: string,
    platform: Platform,
    tier: TwitterTier = 'FREE'
): { canSchedule: boolean; validation: ValidationResult } => {
    const validation = validateContent(content, platform, tier);

    return {
        canSchedule: validation.isValid,
        validation
    };
};

/**
 * Get validation status message
 */
export const getValidationMessage = (validation: ValidationResult): string => {
    if (validation.isValid) {
        if (validation.percentage >= 90) {
            return `${validation.characterCount} / ${validation.limit} characters (${validation.percentage}% - close to limit)`;
        }
        return `${validation.characterCount} / ${validation.limit} characters`;
    }
    return `${validation.characterCount} / ${validation.limit} characters (exceeds by ${validation.exceeded})`;
};
