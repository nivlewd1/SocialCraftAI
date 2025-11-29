import React, { useState, useEffect } from 'react';
import {
    LayoutList, Layers, Film, Music, Search, Pin, ClipboardList, Link as LinkIcon, Vote, MessageSquare, AlertTriangle, Lightbulb,
    Copy, Check, Share2, RefreshCw, Twitter, Linkedin, Instagram, Facebook, GripVertical
} from 'lucide-react';
import { Platform, GeneratedContent, PlatformSelections, Tone, SearchIntent } from '../types';
import QualityScoreCard from './QualityScoreCard';
import LinkPreviewCard from './LinkPreviewCard';
import { motion, Reorder, useDragControls } from 'framer-motion';

interface ResultsDisplayProps {
    results: GeneratedContent[];
    sourceContent: string;
    authorsVoice: string;
    platformSelections: PlatformSelections;
    tone: Tone;
    searchIntent: SearchIntent;
    onContentUpdate: (content: GeneratedContent) => void;
}

const PlatformIcon = ({ platform }: { platform: Platform }) => {
    switch (platform) {
        case Platform.Twitter: return <Twitter className="w-5 h-5 text-[#1DA1F2]" />;
        case Platform.LinkedIn: return <Linkedin className="w-5 h-5 text-[#0077B5]" />;
        case Platform.Instagram: return <Instagram className="w-5 h-5 text-[#E4405F]" />;
        case Platform.TikTok: return <span className="text-black font-bold text-xs">TikTok</span>; // Lucide doesn't have TikTok yet
        case Platform.Pinterest: return <span className="text-[#BD081C] font-bold text-xs">Pin</span>;
        default: return <Share2 className="w-5 h-5" />;
    }
};

const ThreadEditor = ({
    thread,
    onUpdate
}: {
    thread: string[],
    onUpdate: (newThread: string[]) => void
}) => {
    const [items, setItems] = useState(thread);

    useEffect(() => {
        setItems(thread);
    }, [thread]);

    const handleReorder = (newOrder: string[]) => {
        setItems(newOrder);
        onUpdate(newOrder);
    };

    return (
        <div className="space-y-4">
            <h4 className="font-semibold text-gray-800 flex items-center">
                <LayoutList className="h-4 w-4 mr-2 text-sky-500" />
                Thread (Drag to Reorder)
            </h4>
            <Reorder.Group axis="y" values={items} onReorder={handleReorder} className="space-y-3">
                {items.map((tweet, index) => (
                    <Reorder.Item key={tweet} value={tweet}>
                        <div className="flex items-start gap-3 bg-white p-3 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow cursor-move group">
                            <div className="mt-1 text-gray-400 group-hover:text-gray-600">
                                <GripVertical className="w-5 h-5" />
                            </div>
                            <div className="flex-1">
                                <div className="text-xs font-bold text-gray-400 mb-1">Tweet {index + 1}</div>
                                <p className="text-sm text-gray-800 whitespace-pre-wrap">{tweet}</p>
                            </div>
                        </div>
                    </Reorder.Item>
                ))}
            </Reorder.Group>
        </div>
    );
};

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ results, onContentUpdate }) => {
    const [copiedId, setCopiedId] = useState<string | null>(null);

    const handleCopy = (text: string, id: string) => {
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const handleThreadUpdate = (index: number, newThread: string[]) => {
        const updatedContent = { ...results[index], thread: newThread };
        // If the primary content was just a concatenation of the thread, we might want to update it too,
        // but usually primaryContent is the "main" post or a summary.
        // For now, we just update the thread array.
        onContentUpdate(updatedContent);
    };

    // Helper to extract URL from content
    const extractUrl = (text: string): string | null => {
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        const match = text.match(urlRegex);
        return match ? match[0] : null;
    };

    if (!results || results.length === 0) return null;

    return (
        <div className="space-y-8">
            {results.map((content, idx) => {
                const isInstagramCarousel = content.platform === Platform.Instagram && content.carouselSlides && content.carouselSlides.length > 0;
                const isLinkedInCarousel = content.platform === Platform.LinkedIn && content.carouselSlides && content.carouselSlides.length > 0;
                const isInstagramReel = content.platform === Platform.Instagram && content.reelScript;
                const isTikTokScript = content.platform === Platform.TikTok && content.tiktokScript;
                const isPinterestPin = content.platform === Platform.Pinterest && content.pinterestPin;
                const isLinkedInPoll = content.platform === Platform.LinkedIn && content.poll;
                const isTwitterThread = content.platform === Platform.Twitter && content.thread && content.thread.length > 0;

                const detectedUrl = extractUrl(content.primaryContent);

                return (
                    <motion.div
                        key={`${content.platform}-${idx}`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden"
                    >
                        {/* Header */}
                        <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <PlatformIcon platform={content.platform} />
                                <h3 className="font-bold text-gray-800">{content.platform} Post</h3>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleCopy(content.primaryContent, `${content.platform}-${idx}`)}
                                    className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-600"
                                    title="Copy Content"
                                >
                                    {copiedId === `${content.platform}-${idx}` ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Main Content Column */}
                            <div className="lg:col-span-2 space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-500 mb-2">Primary Content</label>
                                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 text-gray-800 whitespace-pre-wrap font-medium">
                                        {content.primaryContent}
                                    </div>

                                    {/* Link Preview */}
                                    {detectedUrl && (
                                        <div className="mt-4">
                                            <label className="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-wider">Link Preview</label>
                                            <LinkPreviewCard url={detectedUrl} />
                                        </div>
                                    )}
                                </div>

                                {/* Platform Specifics */}
                                {isTwitterThread && (
                                    <ThreadEditor
                                        thread={content.thread!}
                                        onUpdate={(newThread) => handleThreadUpdate(idx, newThread)}
                                    />
                                )}

                                {(isInstagramCarousel || isLinkedInCarousel) && (
                                    <div>
                                        <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                                            {isInstagramCarousel ? <Layers className="h-4 w-4 mr-2 text-pink-600" /> : <LayoutList className="h-4 w-4 mr-2 text-blue-600" />}
                                            Carousel Slides
                                        </h4>
                                        <div className="space-y-2">
                                            {content.carouselSlides?.map((slide, index) => (
                                                <div key={index} className="flex items-start gap-3">
                                                    <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-1">{index + 1}</div>
                                                    <p className="text-sm p-3 bg-gray-50 rounded-md border border-gray-200 w-full">{slide}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {isInstagramReel && (
                                    <div>
                                        <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                                            <Film className="h-4 w-4 mr-2 text-pink-600" />
                                            Reel Script
                                        </h4>
                                        <div className="space-y-4 bg-pink-50 p-4 rounded-lg border border-pink-100">
                                            <div><span className="font-bold text-sm">Hook:</span> <span className="text-sm">{content.reelScript?.hook}</span></div>
                                            <div>
                                                <span className="font-bold text-sm">Scenes:</span>
                                                <ul className="list-disc list-inside text-sm mt-1">
                                                    {content.reelScript?.scenes.map((s, i) => <li key={i}>{s}</li>)}
                                                </ul>
                                            </div>
                                            <div><span className="font-bold text-sm">CTA:</span> <span className="text-sm">{content.reelScript?.cta}</span></div>
                                            <div><span className="font-bold text-sm">Audio:</span> <span className="text-sm">{content.reelScript?.audioSuggestion}</span></div>
                                        </div>
                                    </div>
                                )}

                                {isTikTokScript && (
                                    <div>
                                        <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                                            <Film className="h-4 w-4 mr-2 text-black" />
                                            TikTok Script
                                        </h4>
                                        <div className="space-y-4 bg-gray-100 p-4 rounded-lg border border-gray-200">
                                            <div><span className="font-bold text-sm">Hook:</span> <span className="text-sm">{content.tiktokScript?.hook}</span></div>
                                            <div>
                                                <span className="font-bold text-sm">Scenes:</span>
                                                <ul className="list-disc list-inside text-sm mt-1">
                                                    {content.tiktokScript?.scenes.map((s, i) => <li key={i}>{s}</li>)}
                                                </ul>
                                            </div>
                                            <div><span className="font-bold text-sm">CTA:</span> <span className="text-sm">{content.tiktokScript?.cta}</span></div>
                                            <div><span className="font-bold text-sm">SEO Keywords:</span> <span className="text-sm">{content.tiktokScript?.seoKeywords.join(', ')}</span></div>
                                        </div>
                                    </div>
                                )}

                                {isPinterestPin && (
                                    <div>
                                        <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                                            <Pin className="h-4 w-4 mr-2 text-red-600" />
                                            Pinterest Pin
                                        </h4>
                                        <div className="space-y-4 bg-red-50 p-4 rounded-lg border border-red-100">
                                            <div><span className="font-bold text-sm">Title:</span> <span className="text-sm">{content.pinterestPin?.title}</span></div>
                                            <div><span className="font-bold text-sm">Description:</span> <span className="text-sm">{content.pinterestPin?.description}</span></div>
                                            <div><span className="font-bold text-sm">Visual:</span> <span className="text-sm">{content.pinterestPin?.visualSuggestion}</span></div>
                                        </div>
                                    </div>
                                )}

                                {isLinkedInPoll && (
                                    <div>
                                        <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                                            <Vote className="h-4 w-4 mr-2 text-blue-600" />
                                            Poll
                                        </h4>
                                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                                            <p className="font-bold mb-2">{content.poll?.question}</p>
                                            <ul className="space-y-2">
                                                {content.poll?.options.map((opt, i) => (
                                                    <li key={i} className="bg-white p-2 rounded border border-blue-100 text-sm">{opt}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                )}

                                {/* Hashtags */}
                                <div>
                                    <h4 className="font-semibold text-gray-800 mb-2">Hashtags</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {content.hashtags.map((tag, i) => (
                                            <span key={i} className="px-2 py-1 bg-blue-50 text-blue-600 text-sm rounded-full font-medium">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Sidebar Column (Quality & Tips) */}
                            <div className="space-y-6">
                                {/* Quality Score Card */}
                                <QualityScoreCard content={content.primaryContent} platform={content.platform} />

                                {/* Optimization Tips */}
                                <div className="bg-yellow-50 p-5 rounded-xl border border-yellow-100">
                                    <h4 className="font-semibold text-yellow-800 mb-3 flex items-center">
                                        <Lightbulb className="h-4 w-4 mr-2" />
                                        Optimization Tips
                                    </h4>
                                    <ul className="space-y-3">
                                        {content.optimizationTips.map((tip, i) => (
                                            <li key={i} className="text-sm text-yellow-900 flex items-start gap-2">
                                                <span className="text-yellow-600 mt-1">›</span>
                                                {tip}
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Engagement Strategy (Twitter/LinkedIn) */}
                                {content.engagementStrategy && content.engagementStrategy.length > 0 && (
                                    <div className="bg-purple-50 p-5 rounded-xl border border-purple-100">
                                        <h4 className="font-semibold text-purple-800 mb-3 flex items-center">
                                            <MessageSquare className="h-4 w-4 mr-2" />
                                            Engagement Strategy
                                        </h4>
                                        <ul className="space-y-3">
                                            {content.engagementStrategy.map((strat, i) => (
                                                <li key={i} className="text-sm text-purple-900 flex items-start gap-2">
                                                    <span className="text-purple-600 mt-1">•</span>
                                                    {strat}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                );
            })}
        </div>
    );
};

export default ResultsDisplay;