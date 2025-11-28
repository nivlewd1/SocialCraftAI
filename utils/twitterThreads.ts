/**
 * Twitter thread creation utilities
 * Splits long content into multiple connected tweets
 */

import { TWITTER_LIMITS, TwitterTier } from './platformLimits';

export interface ThreadTweet {
    content: string;
    index: number;
    total: number;
    characterCount: number;
}

export interface ThreadOptions {
    tier?: TwitterTier;
    addNumbering?: boolean;
    preserveHashtags?: boolean;
    breakAtParagraph?: boolean;
    breakAtSentence?: boolean;
}

export interface ThreadResult {
    tweets: ThreadTweet[];
    totalTweets: number;
    originalLength: number;
    averageTweetLength: number;
}

/**
 * Split content into Twitter thread
 */
export const createThread = (
    content: string,
    options: ThreadOptions = {}
): ThreadResult => {
    const {
        tier = 'FREE',
        addNumbering = true,
        preserveHashtags = true,
        breakAtParagraph = true,
        breakAtSentence = true
    } = options;

    const limit = TWITTER_LIMITS[tier];

    // Extract hashtags if preserving
    const hashtags = preserveHashtags ? extractHashtags(content) : [];
    const hashtagText = hashtags.join(' ');
    const mainContent = preserveHashtags ? removeHashtags(content) : content;

    // Reserve space for numbering and hashtags
    const numberingSpace = addNumbering ? ' (1/N)'.length : 0;
    const hashtagSpace = hashtagText ? hashtagText.length + 1 : 0;
    const availableSpace = limit - numberingSpace - hashtagSpace;

    // Split content
    let chunks: string[];
    if (breakAtParagraph) {
        chunks = splitAtParagraphs(mainContent, availableSpace);
    } else if (breakAtSentence) {
        chunks = splitAtSentences(mainContent, availableSpace);
    } else {
        chunks = splitAtWords(mainContent, availableSpace);
    }

    // Create tweets
    const totalTweets = chunks.length;
    const tweets: ThreadTweet[] = chunks.map((chunk, index) => {
        let tweetContent = chunk.trim();

        // Add numbering
        if (addNumbering) {
            tweetContent = `${tweetContent} (${index + 1}/${totalTweets})`;
        }

        // Add hashtags to last tweet
        if (preserveHashtags && hashtagText && index === chunks.length - 1) {
            tweetContent = `${tweetContent} ${hashtagText}`;
        }

        return {
            content: tweetContent,
            index: index + 1,
            total: totalTweets,
            characterCount: tweetContent.length
        };
    });

    const averageLength = tweets.reduce((sum, t) => sum + t.characterCount, 0) / tweets.length;

    return {
        tweets,
        totalTweets,
        originalLength: content.length,
        averageTweetLength: Math.round(averageLength)
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
 * Remove hashtags from content
 */
const removeHashtags = (content: string): string => {
    return content
        .replace(/#[\w]+/g, '')
        .replace(/\s+/g, ' ')
        .trim();
};

/**
 * Split at paragraph boundaries
 */
const splitAtParagraphs = (content: string, maxLength: number): string[] => {
    const paragraphs = content.split(/\n\n+/).filter(p => p.trim());
    const chunks: string[] = [];
    let currentChunk = '';

    for (const paragraph of paragraphs) {
        const trimmedPara = paragraph.trim();

        // If paragraph itself is too long, split it further
        if (trimmedPara.length > maxLength) {
            if (currentChunk) {
                chunks.push(currentChunk.trim());
                currentChunk = '';
            }
            chunks.push(...splitAtSentences(trimmedPara, maxLength));
            continue;
        }

        // Try to add paragraph to current chunk
        const combined = currentChunk
            ? `${currentChunk}\n\n${trimmedPara}`
            : trimmedPara;

        if (combined.length <= maxLength) {
            currentChunk = combined;
        } else {
            // Current chunk is full, start new one
            if (currentChunk) {
                chunks.push(currentChunk.trim());
            }
            currentChunk = trimmedPara;
        }
    }

    if (currentChunk) {
        chunks.push(currentChunk.trim());
    }

    return chunks.length > 0 ? chunks : [content];
};

/**
 * Split at sentence boundaries
 */
const splitAtSentences = (content: string, maxLength: number): string[] => {
    const sentences = content.match(/[^.!?]+[.!?]+/g) || [content];
    const chunks: string[] = [];
    let currentChunk = '';

    for (const sentence of sentences) {
        const trimmedSentence = sentence.trim();

        // If sentence itself is too long, split at words
        if (trimmedSentence.length > maxLength) {
            if (currentChunk) {
                chunks.push(currentChunk.trim());
                currentChunk = '';
            }
            chunks.push(...splitAtWords(trimmedSentence, maxLength));
            continue;
        }

        // Try to add sentence to current chunk
        const combined = currentChunk
            ? `${currentChunk} ${trimmedSentence}`
            : trimmedSentence;

        if (combined.length <= maxLength) {
            currentChunk = combined;
        } else {
            // Current chunk is full, start new one
            if (currentChunk) {
                chunks.push(currentChunk.trim());
            }
            currentChunk = trimmedSentence;
        }
    }

    if (currentChunk) {
        chunks.push(currentChunk.trim());
    }

    return chunks.length > 0 ? chunks : [content];
};

/**
 * Split at word boundaries
 */
const splitAtWords = (content: string, maxLength: number): string[] => {
    const words = content.split(/\s+/);
    const chunks: string[] = [];
    let currentChunk = '';

    for (const word of words) {
        const combined = currentChunk
            ? `${currentChunk} ${word}`
            : word;

        if (combined.length <= maxLength) {
            currentChunk = combined;
        } else {
            if (currentChunk) {
                chunks.push(currentChunk.trim());
            }
            // If single word is too long, truncate it
            currentChunk = word.length > maxLength
                ? word.substring(0, maxLength)
                : word;
        }
    }

    if (currentChunk) {
        chunks.push(currentChunk.trim());
    }

    return chunks.length > 0 ? chunks : [content];
};

/**
 * Preview thread - get formatted display
 */
export const previewThread = (threadResult: ThreadResult): string => {
    return threadResult.tweets
        .map(tweet => `Tweet ${tweet.index}/${tweet.total} (${tweet.characterCount} chars):\n${tweet.content}`)
        .join('\n\n---\n\n');
};

/**
 * Estimate thread length
 */
export const estimateThreadLength = (
    content: string,
    tier: TwitterTier = 'FREE'
): number => {
    const limit = TWITTER_LIMITS[tier];
    return Math.ceil(content.length / limit);
};

/**
 * Check if content needs threading
 */
export const needsThread = (
    content: string,
    tier: TwitterTier = 'FREE'
): boolean => {
    return content.length > TWITTER_LIMITS[tier];
};
