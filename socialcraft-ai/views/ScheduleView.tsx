
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
    [Platform.Twitter]: 'bg-sky-500 text-white',
    [Platform.LinkedIn]: 'bg-blue-700 text-white',
    [Platform.Instagram]: 'bg-pink-600 text-white',
    [Platform.TikTok]: 'bg-black text-white',
    [Platform.Pinterest]: 'bg-red-600 text-white',
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
                <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
                    Content <span className="gradient-text-indigo">Schedule</span>
                </h1>
                <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-600">
                    Your content calendar. View, manage, and track all your scheduled and published posts.
                </p>
            </div>

            <div className="max-w-4xl mx-auto">
                {Object.keys(groupedPosts).length > 0 ? (
                    <div className="space-y-8">
                        {Object.entries(groupedPosts).map(([date, dayPosts]) => (
                            <div key={date}>
                                <h2 className="font-bold text-lg text-deep-charcoal pb-2 mb-4 border-b-2 border-[#C4A484]">{date}</h2>
                                <div className="space-y-4">
                                    {dayPosts.map(post => (
                                        <div key={post.id} className="glass-card rounded-lg p-4 flex items-start space-x-4">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${platformColors[post.content.platform]}`}>
                                                {platformIcons[post.content.platform]}
                                            </div>
                                            <div className="flex-grow">
                                                <p className="text-gray-700 text-sm">{post.content.primaryContent}</p>
                                                <div className="flex items-center text-xs text-gray-500 mt-2">
                                                    {post.status === 'scheduled' ? (
                                                        <Clock size={14} className="mr-1.5 text-yellow-600"/>
                                                    ) : (
                                                        <CheckCircle size={14} className="mr-1.5 text-green-600"/>
                                                    )}
                                                    <span className={`font-medium ${post.status === 'posted' ? 'text-green-700' : 'text-yellow-700'}`}>{post.status.charAt(0).toUpperCase() + post.status.slice(1)}</span>
                                                    <span className="mx-2">|</span>
                                                    <span>{new Date(post.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                </div>
                                            </div>
                                            {post.status === 'scheduled' && (
                                                <button onClick={() => handleDelete(post.id)} className="p-2 rounded-md hover:bg-red-100 text-red-500 transition-colors" title="Cancel Schedule">
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
                        <Calendar size={48} className="mx-auto text-gray-400" />
                        <h3 className="mt-4 text-xl font-semibold text-deep-charcoal">Your Schedule is Empty</h3>
                        <p className="mt-2 text-gray-500">
                            Generate some content and click the "Schedule" button to add posts to your calendar.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ScheduleView;
