import { supabase } from '../config/supabase';
import { generateViralContent } from './geminiService';
import { brandPersonaService, BrandPersona } from './brandPersonaService';
import type { Database, CampaignStatus, CampaignPostStatus, ContentMixType, VariationType, PostingFrequency } from '../database.types';
import type { PlatformSelections, GeneratedContent, Tone } from '../types';

type CampaignRow = Database['public']['Tables']['campaigns']['Row'];
type CampaignInsert = Database['public']['Tables']['campaigns']['Insert'];
type CampaignPostRow = Database['public']['Tables']['campaign_posts']['Row'];
type CampaignPostInsert = Database['public']['Tables']['campaign_posts']['Insert'];

// =====================================================
// Types
// =====================================================

export interface Campaign {
    id: string;
    userId: string;
    name: string;
    description?: string;
    status: CampaignStatus;
    themeGoal: string;
    contentMix: { educational: number; promotional: number; engagement: number };
    targetPlatforms: string[];
    brandPersonaId?: string;
    dateRangeStart: string;
    dateRangeEnd: string;
    postingFrequency: PostingFrequency;
    competitorHandles: string[];
    competitorAnalysisJson?: any;
    competitorAnalysisUpdatedAt?: string;
    sourceTrendReportId?: string;
    sourceContent?: string;
    totalPosts: number;
    postsPublished: number;
    estimatedCredits: number;
    creditsUsed: number;
    createdAt: string;
    updatedAt?: string;
}

export interface CampaignPost {
    id: string;
    campaignId: string;
    userId: string;
    platform: string;
    contentType: ContentMixType;
    status: CampaignPostStatus;
    textContent?: GeneratedContent;
    variationType: VariationType;
    variationGroup?: string;
    variationChanges?: { hook?: boolean; cta?: boolean; tone?: boolean; format?: boolean };
    hasMedia: boolean;
    mediaType?: 'image' | 'video' | 'carousel';
    mediaUrl?: string;
    mediaPrompt?: string;
    scheduledAt?: string;
    scheduledPostId?: string;
    predictedEngagementScore?: number;
    predictionFactors?: any;
    predictionSource?: 'baseline' | 'deep_analysis';
    actualEngagementScore?: number;
    actualMetrics?: any;
    textCreditsUsed: number;
    mediaCreditsUsed: number;
    createdAt: string;
    updatedAt?: string;
    publishedAt?: string;
}

export interface GenerateCampaignPostsOptions {
    campaignId: string;
    includeVariations: boolean;
    onProgress?: (current: number, total: number, platform: string) => void;
}

export interface GeneratePostVisualsOptions {
    postIds: string[];
    onProgress?: (current: number, total: number) => void;
}

// =====================================================
// Campaign Service
// =====================================================

export const campaignService = {
    // =====================================================
    // Campaign CRUD
    // =====================================================

    /**
     * Get all campaigns for the current user
     */
    async getAll(): Promise<Campaign[]> {
        const { data, error } = await supabase
            .from('campaigns')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching campaigns:', error);
            throw error;
        }

        return (data || []).map(row => this.dbToCampaign(row));
    },

    /**
     * Get a single campaign by ID
     */
    async getById(id: string): Promise<Campaign | null> {
        const { data, error } = await supabase
            .from('campaigns')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null;
            console.error('Error fetching campaign:', error);
            throw error;
        }

        return this.dbToCampaign(data);
    },

    /**
     * Create a new campaign
     */
    async create(input: Omit<CampaignInsert, 'user_id'>): Promise<Campaign> {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
            throw new Error('User not authenticated');
        }

        const { data, error } = await supabase
            .from('campaigns')
            .insert({
                ...input,
                user_id: user.id,
            })
            .select()
            .single();

        if (error) {
            console.error('Error creating campaign:', error);
            throw error;
        }

        return this.dbToCampaign(data);
    },

    /**
     * Update a campaign
     */
    async update(id: string, updates: Partial<CampaignInsert>): Promise<Campaign> {
        const { data, error } = await supabase
            .from('campaigns')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('Error updating campaign:', error);
            throw error;
        }

        return this.dbToCampaign(data);
    },

    /**
     * Update campaign status
     */
    async updateStatus(id: string, status: CampaignStatus): Promise<Campaign> {
        return this.update(id, { status });
    },

    /**
     * Delete a campaign
     */
    async delete(id: string): Promise<void> {
        const { error } = await supabase
            .from('campaigns')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error deleting campaign:', error);
            throw error;
        }
    },

    // =====================================================
    // Campaign Posts CRUD
    // =====================================================

    /**
     * Get all posts for a campaign
     */
    async getPosts(campaignId: string): Promise<CampaignPost[]> {
        const { data, error } = await supabase
            .from('campaign_posts')
            .select('*')
            .eq('campaign_id', campaignId)
            .order('scheduled_at', { ascending: true });

        if (error) {
            console.error('Error fetching campaign posts:', error);
            throw error;
        }

        return (data || []).map(row => this.dbToPost(row));
    },

    /**
     * Get posts grouped by variation
     */
    async getPostsGrouped(campaignId: string): Promise<Map<string, CampaignPost[]>> {
        const posts = await this.getPosts(campaignId);
        const grouped = new Map<string, CampaignPost[]>();

        posts.forEach(post => {
            const key = post.variationGroup || post.id;
            const existing = grouped.get(key) || [];
            grouped.set(key, [...existing, post]);
        });

        return grouped;
    },

    /**
     * Update a campaign post
     */
    async updatePost(id: string, updates: Partial<CampaignPostInsert>): Promise<CampaignPost> {
        const { data, error } = await supabase
            .from('campaign_posts')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('Error updating post:', error);
            throw error;
        }

        return this.dbToPost(data);
    },

    /**
     * Delete a campaign post
     */
    async deletePost(id: string): Promise<void> {
        const { error } = await supabase
            .from('campaign_posts')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error deleting post:', error);
            throw error;
        }
    },

    /**
     * Delete multiple posts
     */
    async deletePosts(ids: string[]): Promise<void> {
        const { error } = await supabase
            .from('campaign_posts')
            .delete()
            .in('id', ids);

        if (error) {
            console.error('Error deleting posts:', error);
            throw error;
        }
    },

    // =====================================================
    // Text Generation (Text First Approach)
    // =====================================================

    /**
     * Generate text content for all campaign posts
     * This is the "Text First" step - no media generation yet
     */
    async generateCampaignText(options: GenerateCampaignPostsOptions): Promise<CampaignPost[]> {
        const { campaignId, includeVariations, onProgress } = options;

        // Get campaign details
        const campaign = await this.getById(campaignId);
        if (!campaign) {
            throw new Error('Campaign not found');
        }

        // Get brand persona if set
        let persona: BrandPersona | null = null;
        if (campaign.brandPersonaId) {
            persona = await brandPersonaService.getById(campaign.brandPersonaId);
        }

        // Calculate post schedule
        const schedule = this.calculatePostSchedule(campaign);

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            throw new Error('User not authenticated');
        }

        const createdPosts: CampaignPost[] = [];
        let current = 0;
        const total = schedule.length * (includeVariations ? 2 : 1);

        for (const slot of schedule) {
            onProgress?.(current, total, slot.platform);

            // Build platform selections for this post
            const platformSelections: PlatformSelections = {
                [slot.platform]: { format: 'Auto' }
            };

            // Build content source from campaign theme + content type
            const contentSource = this.buildContentSource(campaign, slot.contentType);

            try {
                // Generate original content
                const results = await generateViralContent(
                    contentSource,
                    platformSelections,
                    'general',
                    'Auto' as Tone,
                    'Auto',
                    undefined,
                    persona
                );

                if (results.length > 0) {
                    const variationGroup = crypto.randomUUID();

                    // Create original post
                    const originalPost = await this.createPost({
                        campaign_id: campaignId,
                        user_id: user.id,
                        platform: slot.platform,
                        content_type: slot.contentType,
                        status: 'text_generated',
                        text_content: results[0] as any,
                        variation_type: 'original',
                        variation_group: variationGroup,
                        scheduled_at: slot.scheduledAt,
                        text_credits_used: 1,
                    });
                    createdPosts.push(originalPost);
                    current++;

                    // Generate variation if requested
                    if (includeVariations) {
                        onProgress?.(current, total, `${slot.platform} (variation)`);

                        // Generate variation with modified prompt
                        const variationSource = this.buildVariationSource(contentSource, results[0]);
                        const variationResults = await generateViralContent(
                            variationSource,
                            platformSelections,
                            'general',
                            'Auto' as Tone,
                            'Auto',
                            undefined,
                            persona
                        );

                        if (variationResults.length > 0) {
                            const variationPost = await this.createPost({
                                campaign_id: campaignId,
                                user_id: user.id,
                                platform: slot.platform,
                                content_type: slot.contentType,
                                status: 'text_generated',
                                text_content: variationResults[0] as any,
                                variation_type: 'variation_a',
                                variation_group: variationGroup,
                                variation_changes: { hook: true, cta: true },
                                scheduled_at: slot.scheduledAt,
                                text_credits_used: 1,
                            });
                            createdPosts.push(variationPost);
                        }
                        current++;
                    }
                }
            } catch (error) {
                console.error(`Error generating post for ${slot.platform}:`, error);
                // Continue with other posts
            }
        }

        // Update campaign credits used
        const totalCredits = createdPosts.reduce((sum, p) => sum + p.textCreditsUsed, 0);
        await this.update(campaignId, {
            credits_used: (campaign.creditsUsed || 0) + totalCredits,
        });

        return createdPosts;
    },

    /**
     * Create a campaign post
     */
    async createPost(input: CampaignPostInsert): Promise<CampaignPost> {
        const { data, error } = await supabase
            .from('campaign_posts')
            .insert(input)
            .select()
            .single();

        if (error) {
            console.error('Error creating post:', error);
            throw error;
        }

        return this.dbToPost(data);
    },

    // =====================================================
    // Helper Methods
    // =====================================================

    /**
     * Calculate post schedule based on campaign settings
     */
    calculatePostSchedule(campaign: Campaign): Array<{
        platform: string;
        contentType: ContentMixType;
        scheduledAt: string;
    }> {
        const schedule: Array<{
            platform: string;
            contentType: ContentMixType;
            scheduledAt: string;
        }> = [];

        const startDate = new Date(campaign.dateRangeStart);
        const endDate = new Date(campaign.dateRangeEnd);
        
        // Calculate days between posts based on frequency
        const frequencyDays: Record<PostingFrequency, number> = {
            daily: 1,
            every_other_day: 2,
            twice_weekly: 3.5,
            weekly: 7,
        };
        const daysBetween = frequencyDays[campaign.postingFrequency];

        // Calculate total posts
        const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
        const postsPerPlatform = Math.floor(totalDays / daysBetween);

        // Create content type distribution
        const contentTypes: ContentMixType[] = [];
        const { educational, promotional, engagement } = campaign.contentMix;
        const total = educational + promotional + engagement;

        for (let i = 0; i < Math.ceil(postsPerPlatform * (educational / total)); i++) {
            contentTypes.push('educational');
        }
        for (let i = 0; i < Math.ceil(postsPerPlatform * (promotional / total)); i++) {
            contentTypes.push('promotional');
        }
        for (let i = 0; i < Math.ceil(postsPerPlatform * (engagement / total)); i++) {
            contentTypes.push('engagement');
        }

        // Distribute across platforms and dates
        campaign.targetPlatforms.forEach(platform => {
            let currentDate = new Date(startDate);
            let contentIndex = 0;

            while (currentDate <= endDate && contentIndex < contentTypes.length) {
                schedule.push({
                    platform,
                    contentType: contentTypes[contentIndex % contentTypes.length],
                    scheduledAt: currentDate.toISOString(),
                });

                currentDate.setDate(currentDate.getDate() + daysBetween);
                contentIndex++;
            }
        });

        // Sort by date
        schedule.sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());

        return schedule;
    },

    /**
     * Build content source for generation based on content type
     */
    buildContentSource(campaign: Campaign, contentType: ContentMixType): string {
        const typeInstructions: Record<ContentMixType, string> = {
            educational: 'Create an educational post that teaches something valuable about',
            promotional: 'Create a promotional post that highlights the benefits of',
            engagement: 'Create an engaging post that sparks conversation about',
        };

        return `${typeInstructions[contentType]} the following topic:

Campaign Theme: ${campaign.themeGoal}

${campaign.sourceContent ? `Additional Context:\n${campaign.sourceContent}` : ''}

Make it authentic, valuable, and aligned with the campaign's overall message.`;
    },

    /**
     * Build variation source for A/B testing
     */
    buildVariationSource(originalSource: string, originalResult: GeneratedContent): string {
        return `${originalSource}

IMPORTANT: This is for A/B testing. Create a DIFFERENT version with:
- A different hook/opening line
- A different call-to-action
- Keep the same core message but present it differently

The original version started with: "${originalResult.primaryContent.substring(0, 100)}..."

Create something distinctly different while maintaining quality.`;
    },

    /**
     * Convert database row to Campaign type
     */
    dbToCampaign(row: CampaignRow): Campaign {
        return {
            id: row.id,
            userId: row.user_id,
            name: row.name,
            description: row.description || undefined,
            status: row.status || 'draft',
            themeGoal: row.theme_goal,
            contentMix: (row.content_mix as any) || { educational: 33, promotional: 34, engagement: 33 },
            targetPlatforms: row.target_platforms || [],
            brandPersonaId: row.brand_persona_id || undefined,
            dateRangeStart: row.date_range_start,
            dateRangeEnd: row.date_range_end,
            postingFrequency: row.posting_frequency || 'daily',
            competitorHandles: row.competitor_handles || [],
            competitorAnalysisJson: row.competitor_analysis_json,
            competitorAnalysisUpdatedAt: row.competitor_analysis_updated_at || undefined,
            sourceTrendReportId: row.source_trend_report_id || undefined,
            sourceContent: row.source_content || undefined,
            totalPosts: row.total_posts || 0,
            postsPublished: row.posts_published || 0,
            estimatedCredits: row.estimated_credits || 0,
            creditsUsed: row.credits_used || 0,
            createdAt: row.created_at,
            updatedAt: row.updated_at || undefined,
        };
    },

    /**
     * Convert database row to CampaignPost type
     */
    dbToPost(row: CampaignPostRow): CampaignPost {
        return {
            id: row.id,
            campaignId: row.campaign_id,
            userId: row.user_id,
            platform: row.platform,
            contentType: row.content_type || 'promotional',
            status: row.status || 'draft',
            textContent: row.text_content as GeneratedContent | undefined,
            variationType: row.variation_type || 'original',
            variationGroup: row.variation_group || undefined,
            variationChanges: row.variation_changes as any,
            hasMedia: row.has_media || false,
            mediaType: row.media_type || undefined,
            mediaUrl: row.media_url || undefined,
            mediaPrompt: row.media_prompt || undefined,
            scheduledAt: row.scheduled_at || undefined,
            scheduledPostId: row.scheduled_post_id || undefined,
            predictedEngagementScore: row.predicted_engagement_score || undefined,
            predictionFactors: row.prediction_factors,
            predictionSource: row.prediction_source || undefined,
            actualEngagementScore: row.actual_engagement_score || undefined,
            actualMetrics: row.actual_metrics,
            textCreditsUsed: row.text_credits_used || 0,
            mediaCreditsUsed: row.media_credits_used || 0,
            createdAt: row.created_at,
            updatedAt: row.updated_at || undefined,
            publishedAt: row.published_at || undefined,
        };
    },
};
