import { generateImage, generateVisualPrompt } from './geminiService';
import { mediaService } from './mediaService';
import { campaignService, CampaignPost } from './campaignService';
import { supabase } from '../config/supabase';
import type { GeneratedContent } from '../types';

// =====================================================
// Types
// =====================================================

export interface BatchGenerationProgress {
    current: number;
    total: number;
    currentPostId: string;
    status: 'generating_prompt' | 'generating_image' | 'saving' | 'complete' | 'error';
    error?: string;
}

export interface BatchGenerationResult {
    success: boolean;
    postId: string;
    mediaUrl?: string;
    error?: string;
}

export interface BatchGenerationOptions {
    postIds: string[];
    aspectRatio?: '1:1' | '16:9' | '9:16' | '4:3' | '3:4';
    onProgress?: (progress: BatchGenerationProgress) => void;
}

// =====================================================
// Campaign Media Service
// =====================================================

export const campaignMediaService = {
    /**
     * Generate images for multiple campaign posts in batch
     * Uses "generate visual prompt" → "generate image" → "save to storage" flow
     */
    async generateBatchImages(options: BatchGenerationOptions): Promise<BatchGenerationResult[]> {
        const { postIds, aspectRatio = '1:1', onProgress } = options;
        const results: BatchGenerationResult[] = [];

        for (let i = 0; i < postIds.length; i++) {
            const postId = postIds[i];

            try {
                // Update progress: generating prompt
                onProgress?.({
                    current: i + 1,
                    total: postIds.length,
                    currentPostId: postId,
                    status: 'generating_prompt',
                });

                // Get post content
                const { data: post, error: fetchError } = await supabase
                    .from('campaign_posts')
                    .select('*')
                    .eq('id', postId)
                    .single();

                if (fetchError || !post) {
                    results.push({
                        success: false,
                        postId,
                        error: 'Post not found',
                    });
                    continue;
                }

                // Skip if already has media
                if (post.has_media && post.media_url) {
                    results.push({
                        success: true,
                        postId,
                        mediaUrl: post.media_url,
                    });
                    continue;
                }

                // Generate visual prompt from post content
                const textContent = post.text_content as GeneratedContent | null;
                if (!textContent) {
                    results.push({
                        success: false,
                        postId,
                        error: 'Post has no text content',
                    });
                    continue;
                }

                const visualPrompt = await generateVisualPrompt(textContent);

                // Update progress: generating image
                onProgress?.({
                    current: i + 1,
                    total: postIds.length,
                    currentPostId: postId,
                    status: 'generating_image',
                });

                // Generate the image
                const imageDataUrl = await generateImage(visualPrompt, aspectRatio);

                // Update progress: saving
                onProgress?.({
                    current: i + 1,
                    total: postIds.length,
                    currentPostId: postId,
                    status: 'saving',
                });

                // Convert to blob and save
                const blob = dataUrlToBlob(imageDataUrl);
                const savedMedia = await mediaService.uploadMedia(blob, 'image', visualPrompt);

                // Update post with media info
                await supabase
                    .from('campaign_posts')
                    .update({
                        has_media: true,
                        media_type: 'image',
                        media_url: savedMedia.url,
                        media_prompt: visualPrompt,
                        status: 'visuals_generated',
                        media_credits_used: 15, // CREDIT_COSTS.image
                    })
                    .eq('id', postId);

                results.push({
                    success: true,
                    postId,
                    mediaUrl: savedMedia.url,
                });

                // Update progress: complete
                onProgress?.({
                    current: i + 1,
                    total: postIds.length,
                    currentPostId: postId,
                    status: 'complete',
                });

            } catch (error) {
                console.error(`Error generating image for post ${postId}:`, error);
                
                onProgress?.({
                    current: i + 1,
                    total: postIds.length,
                    currentPostId: postId,
                    status: 'error',
                    error: error instanceof Error ? error.message : 'Unknown error',
                });

                results.push({
                    success: false,
                    postId,
                    error: error instanceof Error ? error.message : 'Unknown error',
                });
            }
        }

        return results;
    },

    /**
     * Generate a single image for a campaign post
     */
    async generatePostImage(
        postId: string, 
        aspectRatio: '1:1' | '16:9' | '9:16' | '4:3' | '3:4' = '1:1'
    ): Promise<BatchGenerationResult> {
        const results = await this.generateBatchImages({
            postIds: [postId],
            aspectRatio,
        });
        return results[0];
    },

    /**
     * Remove media from a campaign post
     */
    async removePostMedia(postId: string): Promise<void> {
        const { data: post, error: fetchError } = await supabase
            .from('campaign_posts')
            .select('media_url')
            .eq('id', postId)
            .single();

        if (fetchError) {
            throw new Error('Failed to fetch post');
        }

        // Update post to remove media references
        const { error: updateError } = await supabase
            .from('campaign_posts')
            .update({
                has_media: false,
                media_type: null,
                media_url: null,
                media_prompt: null,
                status: 'text_generated',
            })
            .eq('id', postId);

        if (updateError) {
            throw new Error('Failed to update post');
        }
    },

    /**
     * Update campaign credits after media generation
     */
    async updateCampaignMediaCredits(campaignId: string, creditsUsed: number): Promise<void> {
        const { data: campaign, error: fetchError } = await supabase
            .from('campaigns')
            .select('credits_used')
            .eq('id', campaignId)
            .single();

        if (fetchError) {
            throw new Error('Failed to fetch campaign');
        }

        await supabase
            .from('campaigns')
            .update({
                credits_used: (campaign.credits_used || 0) + creditsUsed,
            })
            .eq('id', campaignId);
    },

    /**
     * Get the optimal aspect ratio for a platform
     */
    getOptimalAspectRatio(platform: string): '1:1' | '16:9' | '9:16' | '4:3' | '3:4' {
        const platformRatios: Record<string, '1:1' | '16:9' | '9:16' | '4:3' | '3:4'> = {
            Twitter: '16:9',
            LinkedIn: '1:1',
            Instagram: '1:1',
            TikTok: '9:16',
            Pinterest: '3:4',
        };
        return platformRatios[platform] || '1:1';
    },
};

// Helper function to convert base64 data URL to Blob
const dataUrlToBlob = (dataUrl: string): Blob => {
    const parts = dataUrl.split(',');
    const mimeMatch = parts[0].match(/:(.*?);/);
    const mime = mimeMatch ? mimeMatch[1] : 'image/png';
    const byteString = atob(parts[1]);
    const arrayBuffer = new ArrayBuffer(byteString.length);
    const intArray = new Uint8Array(arrayBuffer);
    for (let i = 0; i < byteString.length; i++) {
        intArray[i] = byteString.charCodeAt(i);
    }
    return new Blob([intArray], { type: mime });
};
