
import React, { useState, useEffect, useMemo } from 'react';
import { ScheduledPost, Platform } from '../types';
import { Calendar, Trash2, Clock, CheckCircle, Twitter, Linkedin, Instagram, Music, Pin } from 'lucide-react';

const platformIcons: { [key in Platform]: React.ReactNode } = {
    [Platform.Twitter]: <Twitter size={18} />,
    [Platform.LinkedIn]: <Linkedin size={18} />,
    [Platform.Instagram]: <Instagram size={18} />,
    [Platform.TikTok]: <Music size={18} />,
    [Platform.Pinterest]: <Pin size={18} />,
};

const platformColors: { [key in Platform]: string } = {
    [Platform.Twitter]: 'bg-twitter text-white',
    [Platform.LinkedIn]: 'bg-linkedin text-white',
    [Platform.Instagram]: 'bg-instagram text-white',
    [Platform.TikTok]: 'bg-tiktok text-white',
    [Platform.Pinterest]: 'bg-terracotta text-white',
};

const ScheduleView: React.FC = () => {
    const [posts, setPosts] = useState<ScheduledPost[]>([]);

    useEffect(() => {
        try {
            const storedSchedule: ScheduledPost[] = JSON.parse(localStorage.getItem('socialcraft_schedule') || '[]');
            const now = new Date();
            let needsUpdate = false;

            const updatedSchedule = storedSchedule.map(post => {
                if (post.status === 'scheduled' && new Date(post.scheduledAt) < now) {
                    needsUpdate = true;
                    return { ...post, status: 'posted' as const };
                }
                return post;
            });

            if (needsUpdate) {
                localStorage.setItem('socialcraft_schedule', JSON.stringify(updatedSchedule));
            }
            
            // Sort posts by date, descending
            updatedSchedule.sort((a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime());

            setPosts(updatedSchedule);
        } catch (error) {
            console.error("Failed to load schedule:", error);
            setPosts([]);
        }
    }, []);

    const handleDelete = (postId: string) => {
        const updatedPosts = posts.filter(post => post.id !== postId);
        setPosts(updatedPosts);
        localStorage.setItem('socialcraft_schedule', JSON.stringify(updatedPosts));
    };

    const groupedPosts = useMemo(() => {
        return posts.reduce((acc, post) => {
            const date = new Date(post.scheduledAt).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
            if (!acc[date]) {
                acc[date] = [];
            }
            acc[date].push(post);
            return acc;
        }, {} as Record<string, ScheduledPost[]>);
    }, [posts]);

    return (
        <div className="space-y-8">
            <div className="text-center">
                <h1 className="text-4xl md:text-5xl font-extrabold font-serif tracking-tight">
                    Content <span className="gradient-text">Schedule</span>
                </h1>
                <p className="mt-4 max-w-2xl mx-auto text-lg text-deep-charcoal">
                    Your content calendar. View, manage, and track all your scheduled and published posts.
                </p>
            </div>

            <div className="max-w-4xl mx-auto">
                {Object.keys(groupedPosts).length > 0 ? (
                    <div className="space-y-8">
                        {Object.entries(groupedPosts).map(([date, dayPosts]) => (
                            <div key={date}>
                                <h2 className="font-bold text-lg text-deep-charcoal pb-2 mb-4 border-b-2 border-terracotta">{date}</h2>
                                <div className="space-y-4">
                                    {dayPosts.map(post => (
                                        <div key={post.id} className="glass-card rounded-lg p-4 flex items-start space-x-4">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${platformColors[post.content.platform]}`}>
                                                {platformIcons[post.content.platform]}
                                            </div>
                                            <div className="flex-grow">
                                                <p className="text-deep-charcoal text-sm">{post.content.primaryContent}</p>
                                                <div className="flex items-center text-xs text-gray-500 mt-2">
                                                    {post.status === 'scheduled' ? (
                                                        <Clock size={14} className="mr-1.5 text-terracotta"/>
                                                    ) : (
                                                        <CheckCircle size={14} className="mr-1.5 text-sage-green"/>
                                                    )}
                                                    <span className={`font-medium ${post.status === 'posted' ? 'text-sage-green' : 'text-terracotta'}`}>{post.status.charAt(0).toUpperCase() + post.status.slice(1)}</span>
                                                    <span className="mx-2">|</span>
                                                    <span>{new Date(post.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                </div>
                                            </div>
                                            {post.status === 'scheduled' && (
                                                <button onClick={() => handleDelete(post.id)} className="p-2 rounded-md hover:bg-status-error/10 text-status-error transition-colors" title="Cancel Schedule">
                                                    <Trash2 size={18} />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16 px-6 glass-card rounded-lg">
                        <Calendar size={48} className="mx-auto text-deep-charcoal" />
                        <h3 className="mt-4 text-xl font-semibold text-deep-charcoal">Your Schedule is Empty</h3>
                        <p className="mt-2 text-deep-charcoal">
                            Generate some content and click the "Schedule" button to add posts to your calendar.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ScheduleView;
