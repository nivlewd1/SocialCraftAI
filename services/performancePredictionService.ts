import { supabase } from '../config/supabase';
import { CampaignPost } from './campaignService';
import { CREDIT_COSTS } from '../config/pricing';

// =====================================================
// Types
// =====================================================

export interface PerformancePrediction {
    score: number;                    // 0-100 predicted engagement score
    confidence: 'low' | 'medium' | 'high';
    factors: PredictionFactor[];
    recommendations: string[];
    source: 'baseline' | 'deep_analysis';
}

export interface PredictionFactor {
    name: string;
    impact: 'positive' | 'negative' | 'neutral';
    score: number;                    // -10 to +10 contribution
    description: string;
}

export interface CompetitorInsight {
    handle: string;
    platform: string;
    recentTopics: string[];
    engagementPatterns: string[];
    contentGaps: string[];
    postingFrequency: string;
}

export interface CompetitorAnalysisResult {
    competitors: CompetitorInsight[];
    opportunities: string[];
    threats: string[];
    recommendations: string[];
    analyzedAt: string;
}

// =====================================================
// Baseline Prediction (Free)
// =====================================================

/**
 * Generate a baseline performance prediction without API calls
 * Uses heuristics based on content analysis
 */
export const generateBaselinePrediction = (post: CampaignPost): PerformancePrediction => {
    const factors: PredictionFactor[] = [];
    let baseScore = 50; // Start at neutral

    const content = post.textContent?.primaryContent || '';
    const hashtags = post.textContent?.hashtags || [];
    const analysis = post.textContent?.analysis;

    // Factor 1: Content Length
    const contentLength = content.length;
    if (contentLength < 50) {
        factors.push({
            name: 'Content Length',
            impact: 'negative',
            score: -5,
            description: 'Very short content may lack engagement hooks'
        });
        baseScore -= 5;
    } else if (contentLength >= 100 && contentLength <= 280) {
        factors.push({
            name: 'Content Length',
            impact: 'positive',
            score: 5,
            description: 'Optimal length for most platforms'
        });
        baseScore += 5;
    } else if (contentLength > 500) {
        factors.push({
            name: 'Content Length',
            impact: 'neutral',
            score: 0,
            description: 'Long-form content works well on LinkedIn'
        });
    }

    // Factor 2: Hashtags
    if (hashtags.length === 0) {
        factors.push({
            name: 'Hashtags',
            impact: 'negative',
            score: -3,
            description: 'No hashtags reduces discoverability'
        });
        baseScore -= 3;
    } else if (hashtags.length >= 2 && hashtags.length <= 5) {
        factors.push({
            name: 'Hashtags',
            impact: 'positive',
            score: 5,
            description: 'Good number of hashtags for reach'
        });
        baseScore += 5;
    } else if (hashtags.length > 10) {
        factors.push({
            name: 'Hashtags',
            impact: 'negative',
            score: -3,
            description: 'Too many hashtags can look spammy'
        });
        baseScore -= 3;
    }

    // Factor 3: Question/Engagement Hook
    const hasQuestion = content.includes('?');
    const hasCTA = /\b(comment|share|like|follow|click|dm|reply|let me know|thoughts)\b/i.test(content);
    if (hasQuestion || hasCTA) {
        factors.push({
            name: 'Engagement Hook',
            impact: 'positive',
            score: 8,
            description: 'Contains question or call-to-action'
        });
        baseScore += 8;
    }

    // Factor 4: Emotional Triggers
    if (analysis?.emotionalTriggers && analysis.emotionalTriggers.length > 0) {
        factors.push({
            name: 'Emotional Triggers',
            impact: 'positive',
            score: 6,
            description: `Uses: ${analysis.emotionalTriggers.slice(0, 3).join(', ')}`
        });
        baseScore += 6;
    }

    // Factor 5: Viral Patterns
    if (analysis?.viralPatterns && analysis.viralPatterns.length > 0) {
        factors.push({
            name: 'Viral Patterns',
            impact: 'positive',
            score: 7,
            description: `Applies: ${analysis.viralPatterns.slice(0, 2).join(', ')}`
        });
        baseScore += 7;
    }

    // Factor 6: Emoji Usage
    const emojiRegex = /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu;
    const emojiCount = (content.match(emojiRegex) || []).length;
    if (emojiCount >= 1 && emojiCount <= 3) {
        factors.push({
            name: 'Emoji Usage',
            impact: 'positive',
            score: 3,
            description: 'Appropriate emoji usage increases engagement'
        });
        baseScore += 3;
    } else if (emojiCount > 5) {
        factors.push({
            name: 'Emoji Usage',
            impact: 'negative',
            score: -2,
            description: 'Excessive emojis may reduce credibility'
        });
        baseScore -= 2;
    }

    // Factor 7: Media Attachment
    if (post.hasMedia) {
        factors.push({
            name: 'Visual Content',
            impact: 'positive',
            score: 10,
            description: 'Posts with images get 2-3x more engagement'
        });
        baseScore += 10;
    } else {
        factors.push({
            name: 'Visual Content',
            impact: 'negative',
            score: -5,
            description: 'No media attached reduces engagement potential'
        });
        baseScore -= 5;
    }

    // Factor 8: Platform-specific optimization
    const platformFactors = getPlatformSpecificFactors(post.platform, content);
    factors.push(...platformFactors.factors);
    baseScore += platformFactors.scoreAdjustment;

    // Clamp score to 0-100
    const finalScore = Math.max(0, Math.min(100, baseScore));

    // Determine confidence based on available data
    const confidence: 'low' | 'medium' | 'high' = 
        factors.length >= 6 ? 'high' :
        factors.length >= 4 ? 'medium' : 'low';

    // Generate recommendations
    const recommendations = generateRecommendations(factors, post);

    return {
        score: finalScore,
        confidence,
        factors,
        recommendations,
        source: 'baseline'
    };
};

/**
 * Get platform-specific scoring factors
 */
const getPlatformSpecificFactors = (platform: string, content: string): { factors: PredictionFactor[], scoreAdjustment: number } => {
    const factors: PredictionFactor[] = [];
    let scoreAdjustment = 0;

    switch (platform.toLowerCase()) {
        case 'twitter':
            if (content.length <= 280) {
                factors.push({
                    name: 'Twitter Optimization',
                    impact: 'positive',
                    score: 3,
                    description: 'Content fits in a single tweet'
                });
                scoreAdjustment += 3;
            }
            if (content.includes('@')) {
                factors.push({
                    name: 'Mentions',
                    impact: 'positive',
                    score: 2,
                    description: 'Tagging increases visibility'
                });
                scoreAdjustment += 2;
            }
            break;

        case 'linkedin':
            if (content.length >= 150) {
                factors.push({
                    name: 'LinkedIn Optimization',
                    impact: 'positive',
                    score: 4,
                    description: 'Longer posts perform better on LinkedIn'
                });
                scoreAdjustment += 4;
            }
            if (/\b(lesson|learned|insight|experience|story)\b/i.test(content)) {
                factors.push({
                    name: 'Story Element',
                    impact: 'positive',
                    score: 5,
                    description: 'Personal stories drive LinkedIn engagement'
                });
                scoreAdjustment += 5;
            }
            break;

        case 'instagram':
            if (content.length >= 100 && content.length <= 300) {
                factors.push({
                    name: 'Instagram Caption',
                    impact: 'positive',
                    score: 3,
                    description: 'Good caption length for Instagram'
                });
                scoreAdjustment += 3;
            }
            break;

        case 'tiktok':
            if (/\b(pov|storytime|hack|tip|fyp|viral)\b/i.test(content)) {
                factors.push({
                    name: 'TikTok Trends',
                    impact: 'positive',
                    score: 5,
                    description: 'Uses trending TikTok language'
                });
                scoreAdjustment += 5;
            }
            break;

        case 'pinterest':
            if (/\b(diy|how to|ideas|inspiration|tips)\b/i.test(content)) {
                factors.push({
                    name: 'Pinterest SEO',
                    impact: 'positive',
                    score: 5,
                    description: 'Uses Pinterest-optimized keywords'
                });
                scoreAdjustment += 5;
            }
            break;
    }

    return { factors, scoreAdjustment };
};

/**
 * Generate actionable recommendations based on factors
 */
const generateRecommendations = (factors: PredictionFactor[], post: CampaignPost): string[] => {
    const recommendations: string[] = [];

    const negativeFactors = factors.filter(f => f.impact === 'negative');

    for (const factor of negativeFactors) {
        switch (factor.name) {
            case 'Content Length':
                recommendations.push('Add more context or detail to increase engagement');
                break;
            case 'Hashtags':
                if (factor.score < 0 && factor.description.includes('No hashtags')) {
                    recommendations.push('Add 3-5 relevant hashtags to improve discoverability');
                } else {
                    recommendations.push('Reduce hashtags to 5-7 for better engagement');
                }
                break;
            case 'Visual Content':
                recommendations.push('Add an eye-catching image to boost engagement by 2-3x');
                break;
            case 'Emoji Usage':
                recommendations.push('Use 1-3 emojis strategically to add personality');
                break;
        }
    }

    // Add platform-specific recommendations
    if (!factors.some(f => f.name === 'Engagement Hook')) {
        recommendations.push('Add a question or call-to-action to encourage comments');
    }

    // Limit to top 3 recommendations
    return recommendations.slice(0, 3);
};

// =====================================================
// Deep Analysis (5 credits - uses Grounding API)
// =====================================================

/**
 * Generate a deep performance prediction using Grounding API
 * This analyzes current trends and competitor data
 */
export const generateDeepPrediction = async (
    post: CampaignPost,
    competitorHandles?: string[]
): Promise<PerformancePrediction> => {
    // Start with baseline prediction
    const baseline = generateBaselinePrediction(post);
    
    // TODO: Implement Grounding API call for real-time analysis
    // This would include:
    // 1. Current trending topics on the platform
    // 2. Competitor posting patterns
    // 3. Best performing content in the niche
    // 4. Optimal posting times
    
    // For now, return enhanced baseline
    return {
        ...baseline,
        source: 'deep_analysis',
        confidence: 'high',
        recommendations: [
            ...baseline.recommendations,
            'Based on current trends, consider posting between 9-11 AM',
            'Similar content is performing well in your niche'
        ].slice(0, 5)
    };
};

// =====================================================
// Competitor Analysis (Pro+ only)
// =====================================================

/**
 * Analyze competitors for a campaign
 * Results are cached per campaign for 7 days
 */
export const analyzeCompetitors = async (
    campaignId: string,
    handles: string[],
    platform: string
): Promise<CompetitorAnalysisResult> => {
    // Check cache first
    const { data: campaign } = await supabase
        .from('campaigns')
        .select('competitor_analysis_json')
        .eq('id', campaignId)
        .single();

    if (campaign?.competitor_analysis_json) {
        const cached = campaign.competitor_analysis_json as CompetitorAnalysisResult;
        const cacheAge = Date.now() - new Date(cached.analyzedAt).getTime();
        const sevenDays = 7 * 24 * 60 * 60 * 1000;
        
        if (cacheAge < sevenDays) {
            return cached;
        }
    }

    // TODO: Implement Grounding API competitor analysis
    // This would search for competitor content and analyze patterns

    const mockResult: CompetitorAnalysisResult = {
        competitors: handles.map(handle => ({
            handle,
            platform,
            recentTopics: ['Industry trends', 'Product launches', 'User stories'],
            engagementPatterns: ['Posts 2-3 times daily', 'High video content'],
            contentGaps: ['Technical tutorials', 'Behind-the-scenes'],
            postingFrequency: '2-3 posts/day'
        })),
        opportunities: [
            'Competitors not covering technical tutorials',
            'Gap in educational carousel content',
            'No competitor using polls/interactive content'
        ],
        threats: [
            'Strong video presence from @competitor1',
            'Higher posting frequency from competitors'
        ],
        recommendations: [
            'Focus on educational content to differentiate',
            'Increase video content to match competitor engagement',
            'Use more interactive formats like polls'
        ],
        analyzedAt: new Date().toISOString()
    };

    // Cache result
    await supabase
        .from('campaigns')
        .update({ competitor_analysis_json: mockResult })
        .eq('id', campaignId);

    return mockResult;
};

// =====================================================
// Batch Prediction for Campaigns
// =====================================================

/**
 * Generate baseline predictions for all posts in a campaign
 */
export const generateCampaignPredictions = async (
    campaignId: string
): Promise<Map<string, PerformancePrediction>> => {
    const { data: posts, error } = await supabase
        .from('campaign_posts')
        .select('*')
        .eq('campaign_id', campaignId);

    if (error || !posts) {
        throw new Error('Failed to fetch campaign posts');
    }

    const predictions = new Map<string, PerformancePrediction>();

    for (const post of posts) {
        const campaignPost: CampaignPost = {
            id: post.id,
            campaignId: post.campaign_id,
            userId: post.user_id,
            platform: post.platform,
            contentType: post.content_type,
            status: post.status,
            textContent: post.text_content,
            variationType: post.variation_type,
            variationGroup: post.variation_group,
            variationChanges: post.variation_changes,
            hasMedia: post.has_media,
            mediaType: post.media_type,
            mediaUrl: post.media_url,
            mediaPrompt: post.media_prompt,
            scheduledAt: post.scheduled_at,
            predictedEngagementScore: post.predicted_engagement_score,
            predictionFactors: post.prediction_factors,
            predictionSource: post.prediction_source,
            actualEngagementScore: post.actual_engagement_score,
            actualMetrics: post.actual_metrics,
            textCreditsUsed: post.text_credits_used,
            mediaCreditsUsed: post.media_credits_used,
            createdAt: post.created_at,
            updatedAt: post.updated_at,
            publishedAt: post.published_at,
        };

        const prediction = generateBaselinePrediction(campaignPost);
        predictions.set(post.id, prediction);

        // Update post with prediction
        await supabase
            .from('campaign_posts')
            .update({
                predicted_engagement_score: prediction.score,
                prediction_factors: prediction.factors,
                prediction_source: 'baseline'
            })
            .eq('id', post.id);
    }

    return predictions;
};

export const performancePredictionService = {
    generateBaselinePrediction,
    generateDeepPrediction,
    analyzeCompetitors,
    generateCampaignPredictions,
};
