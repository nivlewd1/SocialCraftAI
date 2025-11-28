/**
 * Smart content truncation utilities
 * Preserves hashtags, mentions, and sentence structure
 */

export interface TruncationOptions {
    limit: number;
    preserveHashtags?: boolean;
    preserveMentions?: boolean;
    addEllipsis?: boolean;
    breakAtSentence?: boolean;
}

export interface TruncationResult {
    truncated: string;
    original: string;
    removed: number;
    preservedHashtags: string[];
    preservedMentions: string[];
}

/**
 * Smart truncate content with preservation of important elements
 */
export const smartTruncate = (
    content: string,
    options: TruncationOptions
): TruncationResult => {
    const {
        limit,
        preserveHashtags = true,
        preserveMentions = true,
        addEllipsis = true,
        breakAtSentence = true
    } = options;

    if (content.length <= limit) {
        return {
            truncated: content,
            original: content,
            removed: 0,
            preservedHashtags: [],
            preservedMentions: []
        };
    }

    // Extract hashtags and mentions
    const hashtags = preserveHashtags ? extractHashtags(content) : [];
    const mentions = preserveMentions ? extractMentions(content) : [];

    // Calculate space needed for preserved elements
    const ellipsis = addEllipsis ? '...' : '';
    const preservedText = [
        ...hashtags,
        ...mentions
    ].join(' ');

    const preservedSpace = preservedText.length + (preservedText ? 1 : 0); // +1 for space
    const ellipsisSpace = ellipsis.length;
    const availableSpace = limit - preservedSpace - ellipsisSpace;

    if (availableSpace <= 0) {
        // Not enough space even for preserved elements
        return {
            truncated: content.substring(0, limit),
            original: content,
            removed: content.length - limit,
            preservedHashtags: [],
            preservedMentions: []
        };
    }

    // Get main content without hashtags/mentions
    const mainContent = removeHashtagsAndMentions(content);

    // Truncate main content
    let truncatedMain: string;
    if (breakAtSentence) {
        truncatedMain = truncateAtSentence(mainContent, availableSpace);
    } else {
        truncatedMain = truncateAtWord(mainContent, availableSpace);
    }

    // Reconstruct
    const parts = [truncatedMain.trim()];
    if (addEllipsis && truncatedMain.length < mainContent.length) {
        parts.push(ellipsis);
    }
    if (preservedText) {
        parts.push(preservedText);
    }

    const result = parts.join(' ');

    return {
        truncated: result,
        original: content,
        removed: content.length - result.length,
        preservedHashtags: hashtags,
        preservedMentions: mentions
    };
};

/**
 * Extract hashtags from content
 */
const extractHashtags = (content: string): string[] => {
    const hashtagRegex = /#[\w]+/g;
    return content.match(hashtagRegex) || [];
};

/**
 * Extract mentions from content
 */
const extractMentions = (content: string): string[] => {
    const mentionRegex = /@[\w]+/g;
    return content.match(mentionRegex) || [];
};

/**
 * Remove hashtags and mentions from content
 */
const removeHashtagsAndMentions = (content: string): string => {
    return content
        .replace(/#[\w]+/g, '')
        .replace(/@[\w]+/g, '')
        .replace(/\s+/g, ' ')
        .trim();
};

/**
 * Truncate at sentence boundary
 */
const truncateAtSentence = (text: string, maxLength: number): string => {
    if (text.length <= maxLength) return text;

    // Try to break at sentence end
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [];
    let result = '';

    for (const sentence of sentences) {
        if ((result + sentence).length > maxLength) break;
        result += sentence;
    }

    // If no complete sentence fits, break at word
    if (!result.trim()) {
        return truncateAtWord(text, maxLength);
    }

    return result.trim();
};

/**
 * Truncate at word boundary
 */
const truncateAtWord = (text: string, maxLength: number): string => {
    if (text.length <= maxLength) return text;

    const words = text.split(/\s+/);
    let result = '';

    for (const word of words) {
        const nextLength = result.length + (result ? 1 : 0) + word.length;
        if (nextLength > maxLength) break;
        result += (result ? ' ' : '') + word;
    }

    return result.trim();
};

/**
 * Preview truncation - show what will be removed
 */
export const previewTruncation = (
    content: string,
    options: TruncationOptions
): {
    kept: string;
    removed: string;
    result: TruncationResult;
} => {
    const result = smartTruncate(content, options);

    // Find what was removed (simplified)
    const mainContent = removeHashtagsAndMentions(content);
    const truncatedMain = removeHashtagsAndMentions(result.truncated);

    return {
        kept: result.truncated,
        removed: mainContent.substring(truncatedMain.length),
        result
    };
};

/**
 * Batch truncate variations
 */
export const truncateVariations = (
    variations: string[],
    options: TruncationOptions
): TruncationResult[] => {
    return variations.map(v => smartTruncate(v, options));
};
