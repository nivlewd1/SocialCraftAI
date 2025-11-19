
import React, { useState, useEffect } from 'react';
import { Calendar, Clock, CheckCircle, Trash2, Twitter, Linkedin, Instagram, Music, Pin, Layout, Filter, MoreHorizontal, Info } from 'lucide-react';
import { Platform, ScheduledPost } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../config/supabase';

const platformIcons: { [key in Platform]: React.ReactNode } = {
    [Platform.Twitter]: <Twitter size={18} />,
    [Platform.LinkedIn]: <Linkedin size={18} />,
    [Platform.Instagram]: <Instagram size={18} />,
    [Platform.TikTok]: <Music size={18} />,
    [Platform.Pinterest]: <Pin size={18} />,
};

const platformColors: Record<Platform, string> = {
    [Platform.Twitter]: 'bg-twitter text-white',
    [Platform.LinkedIn]: 'bg-linkedin text-white',
    [Platform.Instagram]: 'bg-instagram text-white',
    [Platform.TikTok]: 'bg-tiktok text-white',
    [Platform.Pinterest]: 'bg-terracotta text-white',
};

interface ScheduleViewProps {
    onOpenAuth: () => void;
}

const DEMO_SCHEDULE: ScheduledPost[] = [
    {
        id: 'demo-1',
        scheduledAt: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
        status: 'scheduled',
        content: {
            platform: Platform.LinkedIn,
            primaryContent: "Excited to announce our new sustainability initiative! 🌿 We're committing to 100% renewable energy by 2025. #Sustainability #GreenTech",
            engagementPotential: 85,
            analysis: { emotionalTriggers: [], viralPatterns: [], audienceValue: '' },
            hashtags: ['#Sustainability', '#GreenTech'],
            variations: [],
            optimizationTips: []
        }
    },
    {
        id: 'demo-2',
        scheduledAt: new Date(Date.now() + 172800000).toISOString(), // Day after tomorrow
        status: 'scheduled',
        content: {
            platform: Platform.Twitter,
            primaryContent: "What's your biggest challenge in adopting AI tools? Reply below! 👇 #AI #TechTrends",
            engagementPotential: 92,
            analysis: { emotionalTriggers: [], viralPatterns: [], audienceValue: '' },
            hashtags: ['#AI', '#TechTrends'],
            variations: [],
            optimizationTips: []
        }
    },
    {
        id: 'demo-3',
        scheduledAt: new Date(Date.now() - 86400000).toISOString(), // Yesterday
        status: 'posted',
        content: {
            platform: Platform.Instagram,
            primaryContent: "Behind the scenes at our annual retreat. 🏞️ Great vibes and even better ideas coming your way.",
            engagementPotential: 78,
            analysis: { emotionalTriggers: [], viralPatterns: [], audienceValue: '' },
            hashtags: ['#TeamBuilding', '#CompanyCulture'],
            variations: [],
            optimizationTips: []
        }
    }
];

const ScheduleView: React.FC<ScheduleViewProps> = ({ onOpenAuth }) => {
    const { user } = useAuth();
    const [posts, setPosts] = useState<ScheduledPost[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (user) {
            fetchScheduledPosts();
        } else {
            // Load demo data for unauthenticated users
            setPosts(DEMO_SCHEDULE);
            setIsLoading(false);
        }
    }, [user]);

    const fetchScheduledPosts = async () => {
        setIsLoading(true);
        try {
            const { data: rawData, error } = await (supabase as any)
                .from('scheduled_posts')
                .select('*')
                .eq('user_id', user!.id)
                .order('scheduled_at', { ascending: false });

            if (error) throw error;

            const data = rawData as any[];

            const now = new Date();
            const updatedData = data.map(post => {
                if (post.status === 'scheduled' && new Date(post.scheduled_at) < now) {
                    return { ...post, status: 'posted' };
                }
                return post;
            });

            // Update status in DB if any posts were marked as 'posted'
            const postsToUpdate = updatedData.filter(post => post.status === 'posted' && data.find(d => d.id === post.id)?.status === 'scheduled');
            for (const post of postsToUpdate) {
                await (supabase as any)
                    .from('scheduled_posts')
                    .update({ status: 'posted' })
                    .eq('id', post.id);
            }

            const formattedPosts: ScheduledPost[] = updatedData.map(post => {
                // Extract text from Json content object
                const contentText = typeof post.content === 'object' && post.content !== null
                    ? (post.content as any).text || JSON.stringify(post.content)
                    : String(post.content);

                return {
                    id: post.id,
                    scheduledAt: post.scheduled_at,
                    status: post.status as 'scheduled' | 'posted',
                    content: {
                        platform: post.platform.charAt(0).toUpperCase() + post.platform.slice(1) as Platform,
                        primaryContent: contentText,
                        engagementPotential: 0,
                        analysis: {
                            emotionalTriggers: [],
                            viralPatterns: [],
                            audienceValue: ''
                        },
                        hashtags: [],
                        variations: [],
                        optimizationTips: []
                    }
                };
            });

            setPosts(formattedPosts);
        } catch (error) {
            console.error('Error fetching schedule:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (postId: string) => {
        if (!user) {
            onOpenAuth();
            return;
        }

        try {
            const { error } = await supabase
                .from('scheduled_posts')
                .delete()
                .eq('id', postId);

            if (error) throw error;

            setPosts(prevPosts => prevPosts.filter(post => post.id !== postId));
        } catch (error) {
            console.error('Error deleting post:', error);
        }
    };

    const getPlatformIcon = (platform: Platform) => {
        switch (platform) {
            case Platform.Twitter: return <Twitter className="w-5 h-5" />;
            case Platform.LinkedIn: return <Linkedin className="w-5 h-5" />;
            case Platform.Instagram: return <Instagram className="w-5 h-5" />;
            case Platform.TikTok: return <Music className="w-5 h-5" />;
            case Platform.Pinterest: return <Pin className="w-5 h-5" />;
            default: return <Layout className="w-5 h-5" />;
        }
    };

    const getPlatformColor = (platform: Platform) => {
        switch (platform) {
            case Platform.Twitter: return 'text-twitter bg-twitter/10';
            case Platform.LinkedIn: return 'text-linkedin bg-linkedin/10';
            case Platform.Instagram: return 'text-instagram bg-instagram/10';
            case Platform.TikTok: return 'text-tiktok bg-tiktok/10';
            case Platform.Pinterest: return 'text-terracotta bg-terracotta/10';
            default: return 'text-gray-600 bg-gray-100';
        }
    };

    return (
        <div className="space-y-8 pb-20 animate-fade-in">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-bold font-display text-deep-charcoal mb-2">Content Schedule</h1>
                    <p className="text-xl text-gray-600">Your upcoming posts and timeline.</p>
                </div>
                <div className="flex gap-3">
                    <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600">
                        <Filter className="w-5 h-5" />
                    </button>
                    <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600">
                        <MoreHorizontal className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {!user && (
                <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl flex items-start gap-3 mb-6">
                    <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                        <h4 className="text-sm font-bold text-blue-800">Demo Mode</h4>
                        <p className="text-xs text-blue-600 mt-1">
                            Viewing example schedule. <button onClick={onOpenAuth} className="underline font-semibold hover:text-blue-800">Sign in</button> to manage your real posts.
                        </p>
                    </div>
                </div>
            )}

            {isLoading ? (
                <div className="flex justify-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sage-green"></div>
                </div>
            ) : posts.length === 0 ? (
                <div className="text-center py-20 glass-card rounded-3xl">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Calendar className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900">No scheduled posts</h3>
                    <p className="text-gray-500 mt-2">Use the Brand Amplifier to generate and schedule content.</p>
                </div>
            ) : (
                <div className="grid gap-6">
                    <div className="space-y-4">
                        <h3 className="font-semibold text-gray-500 uppercase tracking-wider text-sm">Upcoming</h3>
                        {posts.map((post) => (
                            <div key={post.id} className="glass-card p-6 rounded-2xl hover:shadow-medium transition-all group">
                                <div className="flex items-start gap-4">
                                    <div className={`p-3 rounded-xl ${getPlatformColor(post.content.platform)}`}>
                                        {getPlatformIcon(post.content.platform)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="font-semibold text-deep-charcoal">{post.content.platform} Post</span>
                                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                                <Clock className="w-4 h-4" />
                                                {new Date(post.scheduledAt).toLocaleString()}
                                            </div>
                                        </div>
                                        <p className="text-gray-600 line-clamp-2 mb-3">{post.content.primaryContent}</p>
                                        <div className="flex items-center gap-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${post.status === 'posted' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                {post.status === 'posted' ? 'Posted' : 'Scheduled'}
                                            </span>
                                            {post.status === 'scheduled' && (
                                                <button onClick={() => handleDelete(post.id)} className="p-2 rounded-md hover:bg-status-error/10 text-status-error transition-colors" title="Cancel Schedule">
                                                    <Trash2 size={18} />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ScheduleView;
