import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GeneratedContent, Platform, Draft, PlatformSelections, Tone, ScheduledPost, SearchIntent } from '../types';
import { Twitter, Linkedin, Instagram, Music, Lightbulb, MessageSquare, Copy, Check, AlertTriangle, LayoutList, Vote, Film, Layers, Search, Save, Pin, ClipboardList, Link, Sparkles, Image as ImageIcon, Clapperboard, CalendarPlus, ShieldCheck, Info } from 'lucide-react';
import SchedulingModal from './SchedulingModal';
import OriginalityReviewModal from './OriginalityReviewModal';
import { generateVisualPrompt } from '../services/geminiService';
import { draftsService } from '../services/draftsService';
import Spinner from './Spinner';

interface ResultsDisplayProps {
    results: GeneratedContent[];
    sourceContent: string;
    authorsVoice?: string;
    platformSelections: PlatformSelections;
    tone: Tone;
    searchIntent: SearchIntent;
    showSaveButton?: boolean;
}

const platformIcons: { [key in Platform]: React.ReactNode } = {
    [Platform.Twitter]: <Twitter className="h-5 w-5 text-surface-900" />,
    [Platform.LinkedIn]: <Linkedin className="h-5 w-5 text-surface-900" />,
    [Platform.Instagram]: <Instagram className="h-5 w-5 text-surface-900" />,
    [Platform.TikTok]: <Music className="h-5 w-5 text-surface-900" />,
    [Platform.Pinterest]: <Pin className="h-5 w-5 text-surface-900" />,
};

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ results, sourceContent, authorsVoice, platformSelections, tone, searchIntent, showSaveButton = true }) => {
    const [activeTab, setActiveTab] = useState<Platform | null>(null);
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
    const [schedulingContent, setSchedulingContent] = useState<GeneratedContent | null>(null);
    const [scheduledPosts, setScheduledPosts] = useState<string[]>([]); // Store IDs of scheduled content
    const [isOriginalityModalOpen, setIsOriginalityModalOpen] = useState(false);

    useEffect(() => {
        if (results.length > 0) {
            setActiveTab(results[0].platform);
        }
    }, [results]);

    const handleSaveDraft = async () => {
        setSaveStatus('saving');

        try {
            await draftsService.createDraft({
                title: sourceContent.substring(0, 50) || 'Untitled Draft',
                sourceContent,
                authorsVoice,
                platformSelections,
                tone,
                searchIntent,
                results,
            });
            setSaveStatus('saved');
        } catch (error) {
            console.error("Failed to save draft:", error);
            setSaveStatus('idle');
        } finally {
            setTimeout(() => setSaveStatus('idle'), 2000);
        }
    };

    const handleScheduleSuccess = (post: ScheduledPost) => {
        setScheduledPosts(prev => [...prev, post.content.primaryContent]); // Use content as a unique-ish ID for this session
        setSchedulingContent(null);
    };
    
    if (!activeTab) return null;

    const activeResult = results.find(r => r.platform === activeTab);

    return (
        <div className="w-full max-w-4xl mx-auto mt-8">
            <div className="flex justify-between items-center border-b border-gray-300">
                <nav className="-mb-px flex space-x-4" aria-label="Tabs">
                    {results.map((result) => (
                        <button
                            key={result.platform}
                            onClick={() => setActiveTab(result.platform)}
                            className={`whitespace-nowrap flex items-center py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                                activeTab === result.platform
                                    ? 'border-brand-primary text-brand-primary'
                                    : 'border-transparent text-surface-900 hover:text-brand-primary hover:border-surface-100'
                            }`}
                        >
                            {platformIcons[result.platform]}
                            <span className="ml-2">{result.platform}</span>
                        </button>
                    ))}
                </nav>
                 {showSaveButton && (
                    <button
                        onClick={handleSaveDraft}
                        disabled={saveStatus !== 'idle'}
                        className="flex items-center space-x-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors duration-200 text-surface-900 hover:bg-surface-100/50 hover:text-brand-primary"
                    >
                        {saveStatus === 'saved' ? (
                            <>
                                <Check size={16} className="text-brand-primary" />
                                <span>Saved!</span>
                            </>
                        ) : (
                            <>
                                <Save size={16} />
                                <span>Save as Draft</span>
                            </>
                        )}
                    </button>
                 )}
            </div>


            <div className="mt-6">
                {activeResult && (
                    <ContentCard
                        content={activeResult}
                        onSchedule={() => setSchedulingContent(activeResult)}
                        onReviewOriginality={() => setIsOriginalityModalOpen(true)}
                        isScheduled={scheduledPosts.includes(activeResult.primaryContent)}
                    />
                )}
            </div>
            <div className="mt-8">
                {activeResult && <MediaSuggestionCard content={activeResult} />}
            </div>
            {schedulingContent && (
                <SchedulingModal
                    content={schedulingContent}
                    onClose={() => setSchedulingContent(null)}
                    onSchedule={handleScheduleSuccess}
                />
            )}
            <OriginalityReviewModal
                isOpen={isOriginalityModalOpen}
                onClose={() => setIsOriginalityModalOpen(false)}
            />
        </div>
    );
};

const MediaSuggestionCard: React.FC<{ content: GeneratedContent }> = ({ content }) => {
    const navigate = useNavigate();
    const [suggestedPrompt, setSuggestedPrompt] = useState<string>('');
    const [isPromptLoading, setIsPromptLoading] = useState<boolean>(true);

    useEffect(() => {
        const getVisualPrompt = async () => {
            if (!content) return;
            setIsPromptLoading(true);
            try {
                // If a visual suggestion already exists (e.g., from Pinterest), use it directly.
                if (content.pinterestPin?.visualSuggestion) {
                    setSuggestedPrompt(content.pinterestPin.visualSuggestion);
                    return; // Exit early
                }
                
                // Otherwise, generate a new one.
                const prompt = await generateVisualPrompt(content);
                setSuggestedPrompt(prompt);
            } catch (error) {
                console.error("Failed to generate visual prompt:", error);
                // Fallback to a simple prompt if the API fails
                const fallback = content.primaryContent.split('.').slice(0, 2).join('.').trim();
                setSuggestedPrompt(fallback.length > 10 ? `A visual representation of: ${fallback}.` : `A high quality visual for: ${content.primaryContent.substring(0, 150)}`);
            } finally {
                setIsPromptLoading(false);
            }
        };

        getVisualPrompt();
    }, [content]);


    const handleCreate = (tab: 'image' | 'video') => {
        navigate('/media-studio', { state: { prompt: suggestedPrompt, tab } });
    };

    return (
        <div className="w-full mx-auto animate-fade-in glass-card rounded-lg p-6 border-l-4 border-[#8B9A8B]">
            <div className="flex items-center mb-3">
                <Sparkles className="h-6 w-6 text-[#8B9A8B] mr-3" />
                <h3 className="text-xl font-bold text-surface-900">Next Step: Create Media</h3>
            </div>
            <p className="text-gray-600 mb-4">Our AI has analyzed your content and generated a tailored visual prompt to kickstart your creative process:</p>

            {isPromptLoading ? (
                 <div className="bg-surface-100/60 p-3 rounded-md text-sm text-surface-900 italic border border-gray-200 mb-4 flex items-center">
                    <Spinner />
                    <span className="ml-2">Generating creative prompt...</span>
                </div>
            ) : (
                <p className="bg-surface-100/60 p-3 rounded-md text-sm text-surface-900 italic border border-gray-200 mb-4">"{suggestedPrompt}"</p>
            )}
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button 
                    onClick={() => handleCreate('image')} 
                    disabled={isPromptLoading} 
                    className="flex items-center justify-center py-2.5 px-5 rounded-lg shadow-sm text-base font-medium text-white bg-[#A8B8C8] hover:bg-[#97a6b6] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                >
                    <ImageIcon className="mr-2 h-5 w-5" /> Create Image
                </button>
                 <button 
                    onClick={() => handleCreate('video')} 
                    disabled={isPromptLoading} 
                    className="flex items-center justify-center py-2.5 px-5 rounded-lg shadow-sm text-base font-medium text-white bg-[#A8B8C8] hover:bg-[#97a6b6] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                >
                    <Clapperboard className="mr-2 h-5 w-5" /> Create Video
                </button>
            </div>
        </div>
    );
};

const ContentCard: React.FC<{ content: GeneratedContent, onSchedule: () => void, onReviewOriginality: () => void, isScheduled: boolean }> = ({ content, onSchedule, onReviewOriginality, isScheduled }) => {
    const [copied, setCopied] = useState(false);
    const [discloseAI, setDiscloseAI] = useState(false);

    const handleCopy = () => {
        let textToCopy = content.primaryContent;
        if (discloseAI) {
            textToCopy += '\n\n#AIassisted';
        }
        navigator.clipboard.writeText(textToCopy);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };
    
    const isTwitterThread = content.platform === Platform.Twitter && content.thread && content.thread.length > 0;
    const isLinkedInCarousel = content.platform === Platform.LinkedIn && content.carouselSlides && content.carouselSlides.length > 0;
    const isLinkedInPoll = content.platform === Platform.LinkedIn && content.poll;
    const isInstagramReel = content.platform === Platform.Instagram && content.reelScript;
    const isInstagramCarousel = content.platform === Platform.Instagram && content.carouselSlides && content.carouselSlides.length > 0;
    const isTikTokScript = content.platform === Platform.TikTok && content.tiktokScript;
    const isPinterestPin = content.platform === Platform.Pinterest && content.pinterestPin;


    const getTitle = () => {
        switch (content.platform) {
            case Platform.Twitter:
                return isTwitterThread ? `Generated Thread for ${content.platform}` : `Primary post for ${content.platform}`;
            case Platform.LinkedIn:
                 if (isLinkedInCarousel) return `Generated Carousel Plan for ${content.platform}`;
                 if (isLinkedInPoll) return `Generated Poll for ${content.platform}`;
                 return `Primary post optimized for ${content.platform}`;
            case Platform.Instagram:
                if (isInstagramReel) return `Generated Reel Script for ${content.platform}`;
                if (isInstagramCarousel) return `Generated Carousel Plan for ${content.platform}`;
                return `Post caption optimized for ${content.platform}`;
            case Platform.TikTok:
                return `Generated SEO Video Script for ${content.platform}`;
            case Platform.Pinterest:
                return `Generated Pin Plan for ${content.platform}`;
            default:
                return `Primary content for ${content.platform}`;
        }
    };

    return (
        <div className="glass-card rounded-lg p-6 animate-fade-in space-y-6">
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="text-xl font-bold text-surface-900">Generated Content</h3>
                    <p className="text-sm text-gray-500">{getTitle()}</p>
                </div>
                <div className="text-center">
                    <div className="w-16 h-16 rounded-full flex items-center justify-center font-bold text-lg text-white bg-gradient-to-br from-brand-primary to-brand-glow mx-auto">
                        {content.engagementPotential}
                    </div>
                    <p className="text-xs font-semibold text-surface-900 mt-1">Engagement Potential</p>
                </div>
            </div>

            {/* Main Content Display */}
            <div className="relative bg-surface-100/50 rounded-lg p-4 border border-l-4 border-l-brand-primary border-surface-100">
                 <div className="absolute top-2 right-2 flex space-x-2">
                    <button
                        onClick={onSchedule}
                        className={`p-1.5 rounded-md transition-colors ${isScheduled ? 'bg-brand-primary/10 text-brand-primary cursor-not-allowed' : 'bg-surface-100 hover:bg-surface-100/80 text-surface-900'}`}
                        aria-label={isScheduled ? "Content is scheduled" : "Schedule content"}
                        title={isScheduled ? "Content is scheduled" : "Schedule content"}
                        disabled={isScheduled}
                    >
                        {isScheduled ? <Check className="h-4 w-4" /> : <CalendarPlus className="h-4 w-4" />}
                    </button>
                    <button
                        onClick={handleCopy}
                        className="p-1.5 rounded-md bg-surface-100 hover:bg-surface-100/80 text-surface-900 transition-colors"
                        aria-label="Copy content"
                        title="Copy content"
                    >
                        {copied ? <Check className="h-4 w-4 text-brand-primary" /> : <Copy className="h-4 w-4" />}
                    </button>
                </div>
                <p className="text-surface-900 whitespace-pre-wrap font-sans text-base leading-relaxed pr-20">
                    {content.primaryContent}
                </p>
                {discloseAI && (
                     <p className="text-surface-900 text-sm mt-3 italic animate-fade-in">#AIassisted</p>
                )}
            </div>
            
            <div className="flex items-center justify-between gap-4 flex-wrap">
                 <button
                    onClick={onReviewOriginality}
                    className="flex items-center space-x-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors duration-200 text-surface-900 bg-surface-100/50 hover:bg-surface-100/80 border border-surface-100"
                >
                    <ShieldCheck size={16} className="text-brand-primary"/>
                    <span>Review for Originality</span>
                </button>
                 <div className="flex items-center space-x-2">
                    <label htmlFor="disclose-ai" className="text-sm text-surface-900">Disclose AI Assistance:</label>
                    <button
                        id="disclose-ai"
                        role="switch"
                        aria-checked={discloseAI}
                        onClick={() => setDiscloseAI(!discloseAI)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${discloseAI ? 'bg-brand-primary' : 'bg-surface-100'}`}
                    >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${discloseAI ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                </div>
            </div>

             {/* E-E-A-T Analysis */}
            <div>
                <h4 className="font-semibold font-display text-surface-900 mb-2 flex items-center"><Info className="h-4 w-4 mr-2 text-soft-blue" />Content Analysis</h4>
                <div className="bg-soft-blue/10 p-4 rounded-lg border border-soft-blue/20 space-y-3">
                    <div>
                        <p className="font-bold text-surface-900 text-sm">Audience Value:</p>
                        <p className="text-sm text-surface-900">{content.analysis.audienceValue}</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <div>
                            <p className="font-bold text-surface-900 text-sm">Emotional Triggers:</p>
                            <div className="flex flex-wrap gap-1.5 mt-1">
                                {content.analysis.emotionalTriggers.map((trigger, index) => (
                                    <span key={index} className="px-2 py-0.5 text-xs font-medium text-surface-900 bg-soft-blue/20 rounded-full">{trigger}</span>
                                ))}
                            </div>
                        </div>
                         <div>
                            <p className="font-bold text-surface-900 text-sm">Viral Patterns:</p>
                             <div className="flex flex-wrap gap-1.5 mt-1">
                                {content.analysis.viralPatterns.map((pattern, index) => (
                                    <span key={index} className="px-2 py-0.5 text-xs font-medium text-surface-900 bg-soft-blue/20 rounded-full">{pattern}</span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>


            {/* Twitter Thread */}
            {isTwitterThread && (
                <div className="space-y-2">
                    {content.thread?.map((tweet, index) => (
                        <div key={index} className="flex">
                            <div className="flex flex-col items-center mr-4">
                                <div className="w-6 h-6 rounded-full bg-surface-100 text-surface-900 flex items-center justify-center text-xs font-bold">{index + 1}</div>
                                {index < content.thread!.length - 1 && <div className="w-px h-full bg-surface-100"></div>}
                            </div>
                            <div className="relative w-full bg-surface-100/50 rounded-lg p-4 border border-surface-100">
                                 <p className="text-surface-900 whitespace-pre-wrap font-sans text-base leading-relaxed">
                                    {tweet}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            
            {/* LinkedIn Carousel */}
            {isLinkedInCarousel && (
                 <div>
                    <h4 className="font-semibold font-display text-surface-900 mb-3 flex items-center">
                        <LayoutList className="h-4 w-4 mr-2 text-soft-blue" />
                        Carousel Slides
                    </h4>
                    <div className="space-y-2">
                        {content.carouselSlides?.map((slide, index) => (
                             <div key={index} className="flex items-start">
                                <div className="w-6 h-6 rounded-full bg-soft-blue/10 text-soft-blue flex items-center justify-center text-xs font-bold mr-3 flex-shrink-0 mt-1">{index + 1}</div>
                                <p className="text-sm p-3 bg-soft-blue/10 rounded-md border border-soft-blue/20 text-surface-900 w-full">
                                   {slide}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Instagram Carousel */}
            {isInstagramCarousel && (
                 <div>
                    <h4 className="font-semibold font-display text-surface-900 mb-3 flex items-center">
                        <Layers className="h-4 w-4 mr-2 text-brand-primary" />
                        Carousel Slides
                    </h4>
                    <div className="space-y-2">
                        {content.carouselSlides?.map((slide, index) => (
                             <div key={index} className="flex items-start">
                                <div className="w-6 h-6 rounded-full bg-brand-glow/10 text-brand-primary flex items-center justify-center text-xs font-bold mr-3 flex-shrink-0 mt-1">{index + 1}</div>
                                <p className="text-sm p-3 bg-brand-glow/10 rounded-md border border-brand-glow/20 text-surface-900 w-full">
                                   {slide}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            
             {/* Instagram Reel Script */}
                         {isInstagramReel && (
                             <div>
                                <h4 className="font-semibold font-display text-surface-900 mb-3 flex items-center">
                                    <Film className="h-4 w-4 mr-2 text-brand-primary" />
                                    Reel Script
                                </h4>
                                <div className="space-y-4 bg-brand-primary/10 p-4 rounded-lg border border-brand-primary/20">
                                   <div>
                                        <p className="font-bold text-surface-900 text-sm">Hook (First 3s):</p>
                                        <p className="text-sm text-surface-900">{content.reelScript?.hook}</p>
                                   </div>
                                    <div>
                                        <p className="font-bold text-surface-900 text-sm">Scenes:</p>
                                         <ul className="space-y-1 mt-1">
                                            {content.reelScript?.scenes.map((scene, index) => (
                                                <li key={index} className="text-sm text-surface-900 list-disc list-inside">
                                                    {scene}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                     <div>
                                        <p className="font-bold text-surface-900 text-sm">Call to Action:</p>
                                        <p className="text-sm text-surface-900">{content.reelScript?.cta}</p>
                                   </div>
                                    <div>
                                        <p className="font-bold text-surface-900 text-sm flex items-center"><Music size={12} className="mr-1.5"/>Audio Suggestion:</p>
                                        <p className="text-sm text-surface-900">{content.reelScript?.audioSuggestion}</p>
                                   </div>
                                </div>
                            </div>
                        )}
            {/* TikTok Script */}
            {isTikTokScript && (
                <div>
                    <h4 className="font-semibold font-display text-surface-900 mb-3 flex items-center">
                        <Film className="h-4 w-4 mr-2 text-soft-blue" />
                        TikTok Video Script
                    </h4>
                    <div className="space-y-4 bg-surface-100/50 p-4 rounded-lg border border-surface-100">
                       <div>
                            <p className="font-bold text-surface-900 text-sm">Hook (First 3s):</p>
                            <p className="text-sm text-surface-900">{content.tiktokScript?.hook}</p>
                       </div>
                        <div>
                            <p className="font-bold text-surface-900 text-sm">Scenes (Aim for 1 min+):</p>
                             <ul className="space-y-1 mt-1">
                                {content.tiktokScript?.scenes.map((scene, index) => (
                                    <li key={index} className="text-sm text-surface-900 list-disc list-inside">
                                        {scene}
                                    </li>
                                ))}
                            </ul>
                        </div>
                         <div>
                            <p className="font-bold text-surface-900 text-sm">Call to Action (for Shares/Comments):</p>
                            <p className="text-sm text-surface-900">{content.tiktokScript?.cta}</p>
                       </div>
                        <div>
                            <p className="font-bold text-surface-900 text-sm flex items-center"><Music size={12} className="mr-1.5"/>Audio Suggestion:</p>
                            <p className="text-sm text-surface-900">{content.tiktokScript?.audioSuggestion}</p>
                       </div>
                    </div>

                    <div className="mt-6">
                         <h4 className="font-semibold font-display text-surface-900 mb-3 flex items-center">
                            <Search className="h-4 w-4 mr-2 text-soft-blue" />
                            TikTok SEO Strategy
                        </h4>
                        <div className="space-y-4 bg-soft-blue/10 p-4 rounded-lg border border-soft-blue/20">
                            <div>
                                <p className="font-bold text-surface-900 text-sm">Target SEO Keywords:</p>
                                <div className="flex flex-wrap gap-2 mt-1">
                                    {content.tiktokScript?.seoKeywords.map((keyword, index) => (
                                         <span key={index} className="px-2 py-0.5 text-xs font-medium text-surface-900 bg-soft-blue/20 rounded-full">
                                            {keyword}
                                         </span>
                                    ))}
                                </div>
                            </div>
                             <div>
                                <p className="font-bold text-surface-900 text-sm">On-Screen Text Suggestion:</p>
                                <p className="text-sm text-surface-900 italic">"{content.tiktokScript?.onScreenTextSuggestion}"</p>
                           </div>
                            <div>
                                <p className="font-bold text-surface-900 text-sm">Spoken Keywords Reminder:</p>
                                <p className="text-sm text-surface-900">{content.tiktokScript?.spokenKeywordsSuggestion}</p>
                           </div>
                        </div>
                    </div>
                </div>
            )}
            
            {/* Pinterest Pin Plan */}
            {isPinterestPin && (
                <div>
                    <h4 className="font-semibold font-display text-surface-900 mb-3 flex items-center">
                        <Pin className="h-4 w-4 mr-2 text-brand-primary" />
                        Pinterest Pin Plan
                    </h4>
                    <div className="space-y-4 bg-brand-glow/10 p-4 rounded-lg border border-brand-glow/20">
                       <div>
                            <p className="font-bold text-surface-900 text-sm">Pin Title (SEO Optimized):</p>
                            <p className="text-sm text-surface-900">{content.pinterestPin?.title}</p>
                       </div>
                        <div>
                            <p className="font-bold text-surface-900 text-sm">Pin Description (SEO Optimized):</p>
                             <p className="text-sm text-surface-900 whitespace-pre-wrap">{content.pinterestPin?.description}</p>
                        </div>
                        <div>
                            <p className="font-bold text-surface-900 text-sm flex items-center"><ClipboardList size={12} className="mr-1.5"/>Suggested Board:</p>
                            <p className="text-sm text-surface-900">{content.pinterestPin?.boardName}</p>
                       </div>
                        <div>
                            <p className="font-bold text-surface-900 text-sm flex items-center"><Link size={12} className="mr-1.5"/>Outbound Link Suggestion:</p>
                            <p className="text-sm text-surface-900">{content.pinterestPin?.outboundLinkSuggestion}</p>
                       </div>
                         <div>
                            <p className="font-bold text-surface-900 text-sm">Visual Suggestion (2:3 Ratio):</p>
                            <p className="text-sm text-surface-900">{content.pinterestPin?.visualSuggestion}</p>
                       </div>
                       <div>
                            <p className="font-bold text-surface-900 text-sm flex items-center"><Search size={12} className="mr-1.5"/>Target Keywords:</p>
                            <div className="flex flex-wrap gap-2 mt-1">
                                {content.pinterestPin?.keywords.map((keyword, index) => (
                                     <span key={index} className="px-2 py-0.5 text-xs font-medium text-surface-900 bg-brand-glow/20 rounded-full">
                                        {keyword}
                                     </span>
                                ))}
                            </div>
                       </div>
                    </div>
                </div>
            )}

            {/* LinkedIn Poll */}
            {isLinkedInPoll && (
                 <div>
                    <h4 className="font-semibold font-display text-surface-900 mb-3 flex items-center">
                        <Vote className="h-4 w-4 mr-2 text-soft-blue" />
                        Poll Details
                    </h4>
                    <div className="space-y-3 bg-soft-blue/10 p-4 rounded-lg border border-soft-blue/20">
                        <p className="font-medium text-surface-900">Question: {content.poll?.question}</p>
                        <ul className="space-y-2">
                             {content.poll?.options.map((option, index) => (
                                <li key={index} className="text-sm text-surface-900 list-disc list-inside">
                                    {option}
                                </li>
                             ))}
                        </ul>
                    </div>
                </div>
            )}

            {/* Twitter Engagement Strategy */}
            {content.platform === Platform.Twitter && content.engagementStrategy && content.engagementStrategy.length > 0 && (
                 <div>
                    <h4 className="font-semibold font-display text-surface-900 mb-2 flex items-center">
                        <MessageSquare className="h-4 w-4 mr-2 text-soft-blue" />
                        Conversation Starter <span className="text-xs font-medium text-white bg-soft-blue px-2 py-0.5 ml-2 rounded-full">NEW</span>
                    </h4>
                     <p className="text-sm text-surface-900 mb-3">Replies are the #1 signal for the X algorithm. Post these as replies to your own tweet to spark conversation.</p>
                    <div className="space-y-3">
                        {content.engagementStrategy.map((strategy, index) => (
                            <p key={index} className="text-sm p-3 bg-soft-blue/10 rounded-md border border-soft-blue/20 text-surface-900">
                               {strategy}
                            </p>
                        ))}
                    </div>
                </div>
            )}

            {/* LinkedIn Engagement & Link Strategy */}
            {content.platform === Platform.LinkedIn && content.firstComment && (
                <div>
                   <h4 className="font-semibold font-display text-surface-900 mb-2 flex items-center">
                       <MessageSquare className="h-4 w-4 mr-2 text-soft-blue" />
                       Engagement & Link Strategy
                   </h4>
                    <div className="bg-brand-glow/10 border-l-4 border-brand-glow/20 p-4 rounded-r-lg mb-3">
                         <div className="flex">
                            <div className="flex-shrink-0">
                                <AlertTriangle className="h-5 w-5 text-brand-primary" aria-hidden="true" />
                            </div>
                            <div className="ml-3">
                                <p className="text-sm text-surface-900">
                                    <span className="font-bold">Algorithm Warning:</span> LinkedIn heavily penalizes external links to keep users on the platform. Even in comments, links can reduce your post's reach. Use them sparingly.
                                </p>
                            </div>
                        </div>
                    </div>
                   <div className="space-y-3">
                       <p className="text-sm p-3 bg-soft-blue/10 rounded-md border border-soft-blue/20 text-surface-900">
                          <span className="font-semibold block mb-1">Suggested Comment:</span>
                          {content.firstComment}
                       </p>
                   </div>
               </div>
            )}
            
            <div className="grid md:grid-cols-2 gap-6">
                 <div>
                    <h4 className="font-semibold font-display text-surface-900 mb-2">Variations</h4>
                    <div className="space-y-3">
                        {content.variations.map((variation, index) => (
                            <p key={index} className="text-sm p-3 bg-surface-100/50 rounded-md border border-surface-100 text-surface-900">
                               {variation}
                            </p>
                        ))}
                    </div>
                </div>

                <div>
                    <h4 className="font-semibold font-display text-surface-900 mb-2">Hashtags</h4>
                    <div className="flex flex-wrap gap-2">
                        {content.hashtags.map((tag, index) => (
                            <span key={index} className="px-2.5 py-1 text-sm text-white bg-brand-primary rounded-full">
                                {tag}
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            <div>
                <h4 className="font-semibold font-display text-surface-900 mb-2 flex items-center"><Lightbulb className="h-4 w-4 mr-2 text-brand-primary" />Optimization Tips</h4>
                <ul className="space-y-2 list-inside">
                    {content.optimizationTips.map((tip, index) => (
                        <li key={index} className="text-sm text-surface-900 flex">
                            <span className="text-brand-primary mr-2">›</span>{tip}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};


export default ResultsDisplay;