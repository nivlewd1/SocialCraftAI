
import React, { useState, useEffect } from 'react';
import { GeneratedContent, ScheduledPost, Platform } from '../types';
import { getOptimalTimeSlots } from '../utils/scheduling';
import { X, Calendar, Clock, Sparkles, AlertCircle, Scissors, List } from 'lucide-react';
import { supabase } from '../config/supabase';
import { useAuth } from '../contexts/AuthContext';
import { validateContent, ValidationResult, getValidationMessage } from '../utils/contentValidation';
import { smartTruncate, TruncationResult } from '../utils/contentTruncation';
import { createThread, ThreadResult, previewThread } from '../utils/twitterThreads';
import { getUsageColor, TwitterTier, TWITTER_LIMITS } from '../utils/platformLimits';

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

    // Character limit states
    const [userTier, setUserTier] = useState<TwitterTier>('FREE');
    const [validation, setValidation] = useState<ValidationResult | null>(null);
    const [showSolutions, setShowSolutions] = useState(false);
    const [selectedSolution, setSelectedSolution] = useState<'truncate' | 'thread' | null>(null);
    const [truncationPreview, setTruncationPreview] = useState<TruncationResult | null>(null);
    const [threadPreview, setThreadPreview] = useState<ThreadResult | null>(null);

    // Validate content on mount and when tier changes
    useEffect(() => {
        if (content.platform === Platform.Twitter) {
            const result = validateContent(content.primaryContent, content.platform, userTier);
            setValidation(result);

            if (!result.isValid) {
                setShowSolutions(true);
            }
        }
    }, [content, userTier]);

    // Fetch user's Twitter tier from connected account
    useEffect(() => {
        const fetchTwitterTier = async () => {
            if (!user || content.platform !== Platform.Twitter) return;

            const { data, error } = await supabase
                .from('connected_accounts')
                .select('twitter_tier')
                .eq('user_id', user.id)
                .eq('platform', 'twitter')
                .single();

            if (!error && data?.twitter_tier) {
                setUserTier(data.twitter_tier as TwitterTier);
            }
        };

        fetchTwitterTier();
    }, [user, content.platform]);

    // Auto-select shortest variation that fits
    const handleAutoSelectVariation = (): string | null => {
        if (!content.variations || content.variations.length === 0) return null;

        const limit = TWITTER_LIMITS[userTier];

        // Find variations that fit within limit, sorted by length (shortest first)
        const fittingVariations = content.variations
            .filter(v => v.length <= limit)
            .sort((a, b) => a.length - b.length);

        if (fittingVariations.length > 0) {
            return fittingVariations[0]; // Return shortest variation that fits
        }

        return null;
    };

    // Handle truncation
    const handleTruncate = () => {
        const result = smartTruncate(content.primaryContent, {
            limit: TWITTER_LIMITS[userTier],
            preserveHashtags: true,
            preserveMentions: true,
            addEllipsis: true,
            breakAtSentence: true
        });
        setTruncationPreview(result);
        setSelectedSolution('truncate');
    };

    // Handle threading
    const handleThread = () => {
        const result = createThread(content.primaryContent, {
            tier: userTier,
            addNumbering: true,
            preserveHashtags: true,
            breakAtParagraph: true,
            breakAtSentence: true
        });
        setThreadPreview(result);
        setSelectedSolution('thread');
    };

    const handleSchedule = async (time: Date) => {
        if (!user) {
            setError('Please sign in to schedule posts');
            return;
        }

        // Check character limit validation
        if (validation && !validation.isValid && !selectedSolution) {
            setError(`Post exceeds character limit. Please select a solution.`);
            setShowSolutions(true);
            return;
        }

        setIsScheduling(true);
        setError(null);

        try {
            // Determine final content to schedule
            let finalContent = content.primaryContent;
            let schedulingNote = '';

            if (selectedSolution === 'truncate' && truncationPreview) {
                finalContent = truncationPreview.truncated;
                schedulingNote = ` (auto-truncated from ${truncationPreview.original.length} to ${truncationPreview.truncated.length} chars)`;
            } else if (selectedSolution === 'thread' && threadPreview) {
                // For threading, we'll schedule the first tweet for now
                // TODO: Implement full thread scheduling in future
                finalContent = threadPreview.tweets[0].content;
                schedulingNote = ` (thread 1/${threadPreview.totalTweets})`;
                setError(`Note: Only first tweet of thread will be scheduled. Full thread support coming soon!`);
            }

            // Save to Supabase scheduled_posts table
            const { data, error: dbError } = await supabase
                .from('scheduled_posts')
                .insert({
                    user_id: user.id,
                    platform: content.platform.toLowerCase(),
                    content: {
                        platform: content.platform,
                        primaryContent: finalContent,
                        engagementPotential: content.engagementPotential || 0,
                        analysis: content.analysis || { emotionalTriggers: [], viralPatterns: [], audienceValue: '' },
                        hashtags: content.hashtags || [],
                        variations: content.variations || [],
                        optimizationTips: content.optimizationTips || [],
                        hook: content.hook || null,
                        cta: content.cta || null,
                        pinterestPin: content.pinterestPin || null,
                        schedulingNote: schedulingNote || undefined
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

                    <div className="bg-white rounded-lg p-3 border border-surface-100 max-h-32 overflow-y-auto mb-4">
                        <p className="text-surface-900 text-sm whitespace-pre-wrap font-sans">{content.primaryContent}</p>
                    </div>

                    {/* Character Count & Validation */}
                    {validation && content.platform === Platform.Twitter && (
                        <div className={`mb-4 p-3 rounded-md border ${getUsageColor(validation.percentage).bg} ${getUsageColor(validation.percentage).border}`}>
                            <div className="flex items-center justify-between mb-1">
                                <span className={`text-sm font-medium ${getUsageColor(validation.percentage).text}`}>
                                    {getValidationMessage(validation)}
                                </span>
                                {!validation.isValid && (
                                    <span className={`text-xs ${getUsageColor(validation.percentage).text}`}>
                                        -{validation.exceeded} chars
                                    </span>
                                )}
                            </div>

                            {/* Progress Bar */}
                            <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                                <div
                                    className={`h-1.5 rounded-full transition-all ${
                                        validation.percentage >= 100 ? 'bg-red-500' :
                                        validation.percentage >= 90 ? 'bg-yellow-500' :
                                        validation.percentage >= 75 ? 'bg-orange-500' :
                                        'bg-green-500'
                                    }`}
                                    style={{ width: `${Math.min(100, validation.percentage)}%` }}
                                />
                            </div>

                            {/* Warnings & Solutions */}
                            {!validation.isValid && showSolutions && (
                                <div className="mt-3 space-y-2">
                                    <p className="text-xs font-medium text-gray-700">Select a solution:</p>

                                    <div className="grid grid-cols-3 gap-2">
                                        {content.variations && content.variations.length > 0 && (
                                            <button
                                                onClick={() => {
                                                    const variation = handleAutoSelectVariation();
                                                    if (variation) {
                                                        setTruncationPreview({
                                                            truncated: variation,
                                                            original: content.primaryContent,
                                                            removed: content.primaryContent.length - variation.length,
                                                            preservedHashtags: [],
                                                            preservedMentions: []
                                                        });
                                                        setSelectedSolution('truncate');
                                                    } else {
                                                        setError('No variations fit within your character limit');
                                                    }
                                                }}
                                                className={`p-2 text-left rounded-md border-2 transition-all ${
                                                    selectedSolution === 'truncate' && truncationPreview && content.variations.includes(truncationPreview.truncated)
                                                        ? 'border-brand-primary bg-brand-primary/10'
                                                        : 'border-gray-200 hover:border-gray-300'
                                                }`}
                                            >
                                                <div className="flex items-center gap-2 mb-1">
                                                    <Sparkles className="w-4 h-4" />
                                                    <span className="text-sm font-medium">Variation</span>
                                                </div>
                                                <p className="text-xs text-gray-600">Use shorter AI version</p>
                                            </button>
                                        )}

                                        <button
                                            onClick={handleTruncate}
                                            className={`p-2 text-left rounded-md border-2 transition-all ${
                                                selectedSolution === 'truncate'
                                                    ? 'border-brand-primary bg-brand-primary/10'
                                                    : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                        >
                                            <div className="flex items-center gap-2 mb-1">
                                                <Scissors className="w-4 h-4" />
                                                <span className="text-sm font-medium">Truncate</span>
                                            </div>
                                            <p className="text-xs text-gray-600">Smart shorten</p>
                                        </button>

                                        <button
                                            onClick={handleThread}
                                            className={`p-2 text-left rounded-md border-2 transition-all ${
                                                selectedSolution === 'thread'
                                                    ? 'border-brand-primary bg-brand-primary/10'
                                                    : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                        >
                                            <div className="flex items-center gap-2 mb-1">
                                                <List className="w-4 h-4" />
                                                <span className="text-sm font-medium">Thread</span>
                                            </div>
                                            <p className="text-xs text-gray-600">{Math.ceil(validation.characterCount / TWITTER_LIMITS[userTier])} tweets</p>
                                        </button>
                                    </div>

                                    {/* Preview */}
                                    {selectedSolution === 'truncate' && truncationPreview && (
                                        <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded-md">
                                            <p className="text-xs font-medium text-blue-900 mb-1">Preview:</p>
                                            <p className="text-xs text-blue-800">{truncationPreview.truncated}</p>
                                            <p className="text-xs text-blue-600 mt-1">
                                                {truncationPreview.preservedHashtags.length > 0 && `✓ Hashtags preserved`}
                                            </p>
                                        </div>
                                    )}

                                    {selectedSolution === 'thread' && threadPreview && (
                                        <div className="mt-3 p-2 bg-purple-50 border border-purple-200 rounded-md max-h-40 overflow-y-auto">
                                            <p className="text-xs font-medium text-purple-900 mb-2">
                                                Thread Preview ({threadPreview.totalTweets} tweets):
                                            </p>
                                            {threadPreview.tweets.slice(0, 3).map((tweet, i) => (
                                                <div key={i} className="mb-2 pb-2 border-b border-purple-200 last:border-0">
                                                    <p className="text-xs text-purple-800">{tweet.content}</p>
                                                    <p className="text-xs text-purple-600 mt-1">{tweet.characterCount} chars</p>
                                                </div>
                                            ))}
                                            {threadPreview.totalTweets > 3 && (
                                                <p className="text-xs text-purple-600">... and {threadPreview.totalTweets - 3} more</p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

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
