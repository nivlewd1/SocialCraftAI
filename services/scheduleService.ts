import { supabase } from '../config/supabase';
import { Platform, GeneratedContent } from '../types';

// =====================================================
// Types
// =====================================================

export type ScheduleSource = 'quick_post' | 'campaign';
export type ScheduleStatus = 'scheduled' | 'posted' | 'failed';

export interface UnifiedScheduledPost {
    id: string;
    userId: string;
    source: ScheduleSource;
    sourceId?: string;              // campaign_id if from campaign
    sourceName?: string;            // campaign name if from campaign
    platform: Platform;
    content: GeneratedContent;
    scheduledAt: string;
    status: ScheduleStatus;
    hasMedia: boolean;
    mediaUrl?: string;
    mediaType?: 'image' | 'video';
    createdAt: string;
    updatedAt?: string;
}

export interface ScheduleFilters {
    platforms?: Platform[];
    status?: ScheduleStatus[];
    sources?: ScheduleSource[];
    dateFrom?: string;
    dateTo?: string;
}

export interface BulkRescheduleOptions {
    postIds: string[];
    newDate: string;            // ISO date string
    preserveTime?: boolean;     // Keep original time, just change date
}

export interface ScheduleStats {
    total: number;
    scheduled: number;
    posted: number;
    failed: number;
    byPlatform: Record<string, number>;
    bySource: Record<string, number>;
    thisWeek: number;
    today: number;
}

// =====================================================
// Unified Schedule Fetching
// =====================================================

/**
 * Fetch all scheduled content from both sources
 */
export const getUnifiedSchedule = async (
    userId: string,
    filters?: ScheduleFilters
): Promise<UnifiedScheduledPost[]> => {
    const posts: UnifiedScheduledPost[] = [];

    // Fetch from scheduled_posts table (quick posts from Generator)
    const { data: quickPosts, error: quickError } = await supabase
        .from('scheduled_posts')
        .select('*')
        .eq('user_id', userId)
        .order('scheduled_at', { ascending: true });

    if (quickError) {
        console.error('Error fetching scheduled_posts:', quickError);
    } else if (quickPosts) {
        for (const post of quickPosts) {
            // Parse content - handle both string and object formats
            let content: GeneratedContent;
            if (typeof post.content === 'string') {
                try {
                    content = JSON.parse(post.content);
                } catch {
                    content = {
                        platform: post.platform as Platform,
                        primaryContent: post.content,
                        engagementPotential: 0,
                        analysis: { emotionalTriggers: [], viralPatterns: [], audienceValue: '' },
                        hashtags: [],
                        variations: [],
                        optimizationTips: []
                    };
                }
            } else {
                content = post.content as GeneratedContent;
            }

            posts.push({
                id: post.id,
                userId: post.user_id,
                source: 'quick_post',
                platform: (post.platform?.charAt(0).toUpperCase() + post.platform?.slice(1)) as Platform,
                content,
                scheduledAt: post.scheduled_at,
                status: post.status as ScheduleStatus,
                hasMedia: !!post.media_url,
                mediaUrl: post.media_url,
                mediaType: post.media_type,
                createdAt: post.created_at,
                updatedAt: post.updated_at,
            });
        }
    }

    // Fetch from campaign_posts table (campaign posts with scheduled_at)
    const { data: campaignPosts, error: campaignError } = await supabase
        .from('campaign_posts')
        .select(`
            *,
            campaigns:campaign_id (
                id,
                name
            )
        `)
        .eq('user_id', userId)
        .not('scheduled_at', 'is', null)
        .order('scheduled_at', { ascending: true });

    if (campaignError) {
        console.error('Error fetching campaign_posts:', campaignError);
    } else if (campaignPosts) {
        for (const post of campaignPosts) {
            const textContent = post.text_content as GeneratedContent | null;
            
            // Create GeneratedContent from campaign post
            const content: GeneratedContent = textContent || {
                platform: post.platform as Platform,
                primaryContent: '',
                engagementPotential: 0,
                analysis: { emotionalTriggers: [], viralPatterns: [], audienceValue: '' },
                hashtags: [],
                variations: [],
                optimizationTips: []
            };

            // Map campaign post status to schedule status
            let status: ScheduleStatus = 'scheduled';
            if (post.status === 'published') status = 'posted';
            else if (post.status === 'failed') status = 'failed';

            const campaign = post.campaigns as { id: string; name: string } | null;

            posts.push({
                id: post.id,
                userId: post.user_id,
                source: 'campaign',
                sourceId: post.campaign_id,
                sourceName: campaign?.name || 'Unknown Campaign',
                platform: post.platform as Platform,
                content,
                scheduledAt: post.scheduled_at,
                status,
                hasMedia: post.has_media || false,
                mediaUrl: post.media_url,
                mediaType: post.media_type,
                createdAt: post.created_at,
                updatedAt: post.updated_at,
            });
        }
    }

    // Apply filters
    let filtered = posts;

    if (filters) {
        if (filters.platforms && filters.platforms.length > 0) {
            filtered = filtered.filter(p => filters.platforms!.includes(p.platform));
        }
        if (filters.status && filters.status.length > 0) {
            filtered = filtered.filter(p => filters.status!.includes(p.status));
        }
        if (filters.sources && filters.sources.length > 0) {
            filtered = filtered.filter(p => filters.sources!.includes(p.source));
        }
        if (filters.dateFrom) {
            filtered = filtered.filter(p => new Date(p.scheduledAt) >= new Date(filters.dateFrom!));
        }
        if (filters.dateTo) {
            filtered = filtered.filter(p => new Date(p.scheduledAt) <= new Date(filters.dateTo!));
        }
    }

    // Sort by scheduled date
    filtered.sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());

    return filtered;
};

/**
 * Get schedule statistics
 */
export const getScheduleStats = async (userId: string): Promise<ScheduleStats> => {
    const posts = await getUnifiedSchedule(userId);
    
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(startOfToday);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(endOfWeek.getDate() + 7);

    const stats: ScheduleStats = {
        total: posts.length,
        scheduled: posts.filter(p => p.status === 'scheduled').length,
        posted: posts.filter(p => p.status === 'posted').length,
        failed: posts.filter(p => p.status === 'failed').length,
        byPlatform: {},
        bySource: {},
        thisWeek: posts.filter(p => {
            const date = new Date(p.scheduledAt);
            return date >= startOfWeek && date < endOfWeek;
        }).length,
        today: posts.filter(p => {
            const date = new Date(p.scheduledAt);
            return date >= startOfToday && date < new Date(startOfToday.getTime() + 86400000);
        }).length,
    };

    // Count by platform
    for (const post of posts) {
        stats.byPlatform[post.platform] = (stats.byPlatform[post.platform] || 0) + 1;
    }

    // Count by source
    for (const post of posts) {
        const sourceKey = post.source === 'campaign' ? 'Campaigns' : 'Quick Posts';
        stats.bySource[sourceKey] = (stats.bySource[sourceKey] || 0) + 1;
    }

    return stats;
};

// =====================================================
// Post Management
// =====================================================

/**
 * Reschedule a single post
 */
export const reschedulePost = async (
    postId: string,
    source: ScheduleSource,
    newScheduledAt: string
): Promise<boolean> => {
    const table = source === 'campaign' ? 'campaign_posts' : 'scheduled_posts';
    const column = source === 'campaign' ? 'scheduled_at' : 'scheduled_at';

    const { error } = await supabase
        .from(table)
        .update({ [column]: newScheduledAt, updated_at: new Date().toISOString() })
        .eq('id', postId);

    if (error) {
        console.error('Error rescheduling post:', error);
        return false;
    }

    return true;
};

/**
 * Bulk reschedule posts
 */
export const bulkReschedule = async (
    posts: { id: string; source: ScheduleSource; currentScheduledAt: string }[],
    options: BulkRescheduleOptions
): Promise<{ success: number; failed: number }> => {
    let success = 0;
    let failed = 0;

    const newDate = new Date(options.newDate);

    for (const post of posts) {
        let newScheduledAt: string;

        if (options.preserveTime) {
            // Keep original time, just change the date
            const originalTime = new Date(post.currentScheduledAt);
            newScheduledAt = new Date(
                newDate.getFullYear(),
                newDate.getMonth(),
                newDate.getDate(),
                originalTime.getHours(),
                originalTime.getMinutes(),
                originalTime.getSeconds()
            ).toISOString();
        } else {
            newScheduledAt = options.newDate;
        }

        const result = await reschedulePost(post.id, post.source, newScheduledAt);
        if (result) {
            success++;
        } else {
            failed++;
        }
    }

    return { success, failed };
};

/**
 * Delete a scheduled post
 */
export const deleteScheduledPost = async (
    postId: string,
    source: ScheduleSource
): Promise<boolean> => {
    const table = source === 'campaign' ? 'campaign_posts' : 'scheduled_posts';

    const { error } = await supabase
        .from(table)
        .delete()
        .eq('id', postId);

    if (error) {
        console.error('Error deleting post:', error);
        return false;
    }

    return true;
};

/**
 * Bulk delete posts
 */
export const bulkDeletePosts = async (
    posts: { id: string; source: ScheduleSource }[]
): Promise<{ success: number; failed: number }> => {
    let success = 0;
    let failed = 0;

    for (const post of posts) {
        const result = await deleteScheduledPost(post.id, post.source);
        if (result) {
            success++;
        } else {
            failed++;
        }
    }

    return { success, failed };
};

/**
 * Update post status (mark as posted/failed)
 */
export const updatePostStatus = async (
    postId: string,
    source: ScheduleSource,
    status: ScheduleStatus
): Promise<boolean> => {
    const table = source === 'campaign' ? 'campaign_posts' : 'scheduled_posts';
    
    const updateData: Record<string, any> = {
        status: source === 'campaign' 
            ? (status === 'posted' ? 'published' : status)
            : status,
        updated_at: new Date().toISOString()
    };

    if (status === 'posted' && source === 'campaign') {
        updateData.published_at = new Date().toISOString();
    }

    const { error } = await supabase
        .from(table)
        .update(updateData)
        .eq('id', postId);

    if (error) {
        console.error('Error updating post status:', error);
        return false;
    }

    return true;
};

/**
 * Export schedule to CSV
 */
export const exportScheduleToCSV = (posts: UnifiedScheduledPost[]): string => {
    const headers = ['Platform', 'Content', 'Scheduled At', 'Status', 'Source', 'Has Media'];
    const rows = posts.map(post => [
        post.platform,
        `"${post.content.primaryContent.replace(/"/g, '""')}"`,
        new Date(post.scheduledAt).toLocaleString(),
        post.status,
        post.source === 'campaign' ? `Campaign: ${post.sourceName}` : 'Quick Post',
        post.hasMedia ? 'Yes' : 'No'
    ]);

    return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
};

/**
 * Download CSV file
 */
export const downloadScheduleCSV = (posts: UnifiedScheduledPost[], filename?: string) => {
    const csv = exportScheduleToCSV(posts);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename || `schedule-export-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

export const scheduleService = {
    getUnifiedSchedule,
    getScheduleStats,
    reschedulePost,
    bulkReschedule,
    deleteScheduledPost,
    bulkDeletePosts,
    updatePostStatus,
    exportScheduleToCSV,
    downloadScheduleCSV,
};
