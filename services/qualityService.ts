export interface QualityScore {
    score: number; // 0-100
    readability: 'Easy' | 'Medium' | 'Hard';
    sentiment: 'Positive' | 'Neutral' | 'Negative';
    suggestions: string[];
}

export const qualityService = {
    analyzeContent(content: string): QualityScore {
        const suggestions: string[] = [];
        let score = 100;

        // Basic Readability (Flesch-Kincaid simplified)
        const words = content.trim().split(/\s+/).length;
        const sentences = content.split(/[.!?]+/).length;
        const avgWordsPerSentence = words / (sentences || 1);

        let readability: 'Easy' | 'Medium' | 'Hard' = 'Easy';
        if (avgWordsPerSentence > 20) {
            readability = 'Hard';
            score -= 10;
            suggestions.push('Sentences are too long. Try shortening them for better readability.');
        } else if (avgWordsPerSentence > 14) {
            readability = 'Medium';
        }

        // Length check (too short?)
        if (words < 5) {
            score -= 20;
            suggestions.push('Content is very short. Consider adding more detail.');
        }

        // Engagement checks
        if (!content.includes('?')) {
            score -= 5;
            suggestions.push('Consider adding a question to drive engagement.');
        }

        // Call to action
        const ctaKeywords = ['click', 'link', 'bio', 'check', 'visit', 'sign up', 'read'];
        const hasCTA = ctaKeywords.some(keyword => content.toLowerCase().includes(keyword));
        if (!hasCTA) {
            suggestions.push('Consider adding a Call to Action (CTA).');
        } else {
            score += 5; // Bonus for CTA
        }

        // Sentiment (Very basic keyword matching for demo)
        const positiveWords = ['great', 'amazing', 'love', 'excited', 'happy', 'best', 'new'];
        const negativeWords = ['bad', 'hate', 'worst', 'sad', 'angry', 'fail'];

        let sentimentScore = 0;
        positiveWords.forEach(w => { if (content.toLowerCase().includes(w)) sentimentScore++; });
        negativeWords.forEach(w => { if (content.toLowerCase().includes(w)) sentimentScore--; });

        let sentiment: 'Positive' | 'Neutral' | 'Negative' = 'Neutral';
        if (sentimentScore > 0) sentiment = 'Positive';
        if (sentimentScore < 0) sentiment = 'Negative';

        // Cap score
        score = Math.max(0, Math.min(100, score));

        return {
            score,
            readability,
            sentiment,
            suggestions
        };
    }
};
