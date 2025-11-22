
import React, { useState } from 'react';
import { GeneratedContent, ScheduledPost } from '../types';
import { getOptimalTimeSlots } from '../utils/scheduling';
import { X, Calendar, Clock, Sparkles, AlertCircle } from 'lucide-react';
import { supabase } from '../config/supabase';
import { useAuth } from '../contexts/AuthContext';

interface SchedulingModalProps {
    content: GeneratedContent;
    onClose: () => void;
    onSchedule: (post: ScheduledPost) => void;
}

const SchedulingModal: React.FC<SchedulingModalProps> = ({ content, onClose, onSchedule }) => {
    const { user } = useAuth();
    const [scheduleTime, setScheduleTime] = useState('');
    const [isScheduling, setIsScheduling] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const optimalSlots = getOptimalTimeSlots(content.platform);

    const handleSchedule = async (time: Date) => {
        if (!user) {
            setError('Please sign in to schedule posts');
            return;
        }

        setIsScheduling(true);
        setError(null);

        try {
            // Save to Supabase scheduled_posts table
            const { data, error: dbError } = await supabase
                .from('scheduled_posts')
                .insert({
                    user_id: user.id,
                    platform: content.platform.toLowerCase(),
                    content: {
                        text: content.primaryContent,
                        hashtags: content.hashtags || [],
                        hook: content.hook || null,
                        cta: content.cta || null,
                        image_prompt: content.pinterestPin?.visualSuggestion || null
                    },
                    scheduled_at: time.toISOString(),
                    status: 'scheduled'
                })
                .select()
                .single();

            if (dbError) throw dbError;

            const newPost: ScheduledPost = {
                id: data.id,
                scheduledAt: time.toISOString(),
                status: 'scheduled',
                content: content,
            };

            onSchedule(newPost);
        } catch (err) {
            console.error('Failed to schedule post:', err);
            setError('Failed to schedule post. Please try again.');
        } finally {
            setIsScheduling(false);
        }
    };

    const handleCustomSchedule = () => {
        if (scheduleTime) {
            handleSchedule(new Date(scheduleTime));
        }
    };

    const formatDateTimeLocal = (date: Date) => {
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        return `${year}-${month}-${day}T${hours}:${minutes}`;
    }

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
            <div className="bg-surface-100 rounded-lg w-full max-w-lg shadow-2xl relative" onClick={(e) => e.stopPropagation()}>
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 rounded-full bg-surface-100 hover:bg-surface-100/80 text-surface-900 transition-colors z-10"
                    aria-label="Close"
                >
                    <X size={20} />
                </button>
                <div className="p-8">
                    <h2 className="text-2xl font-bold font-display text-surface-900 mb-2">Schedule Post</h2>
                    <p className="text-sm text-surface-900 mb-4">Add this content for {content.platform} to your calendar.</p>

                    <div className="bg-white rounded-lg p-3 border border-surface-100 max-h-32 overflow-y-auto mb-6">
                        <p className="text-surface-900 text-sm whitespace-pre-wrap font-sans">{content.primaryContent}</p>
                    </div>

                    {error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-center text-red-700 text-sm">
                            <AlertCircle size={16} className="mr-2 flex-shrink-0" />
                            {error}
                        </div>
                    )}

                    {isScheduling && (
                        <div className="mb-4 p-3 bg-brand-primary/10 border border-brand-primary/20 rounded-md text-brand-primary text-sm text-center">
                            Scheduling your post...
                        </div>
                    )}

                    <div>
                        <h3 className="text-md font-semibold font-display text-surface-900 mb-3 flex items-center">
                            <Sparkles size={16} className="mr-2 text-brand-primary" />
                            AI-Suggested Times
                        </h3>
                         <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-6">
                             {optimalSlots.map(slot => (
                                 <button
                                     key={slot.date.toISOString()}
                                     onClick={() => handleSchedule(slot.date)}
                                     disabled={isScheduling}
                                     className="p-2 text-center rounded-md bg-brand-primary/10 text-brand-primary hover:bg-brand-primary/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                 >
                                     <p className="font-semibold text-sm">{slot.date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</p>
                                     <p className="text-xs">{slot.label.split(',')[0]}</p>
                                 </button>
                             ))}
                         </div>
                    </div>
                     <div>
                        <h3 className="text-md font-semibold font-display text-surface-900 mb-3 flex items-center">
                             <Calendar size={16} className="mr-2 text-surface-900" />
                            Or Pick a Custom Time
                        </h3>
                        <div className="flex gap-2">
                             <input
                                type="datetime-local"
                                value={scheduleTime}
                                onChange={(e) => setScheduleTime(e.target.value)}
                                min={formatDateTimeLocal(new Date())}
                                className="input-field rounded-md w-full"
                                disabled={isScheduling}
                            />
                            <button
                                onClick={handleCustomSchedule}
                                disabled={!scheduleTime || isScheduling}
                                className="btn-primary px-4 rounded-md disabled:opacity-50"
                            >
                                {isScheduling ? 'Scheduling...' : 'Schedule'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SchedulingModal;
