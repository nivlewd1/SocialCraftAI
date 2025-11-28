import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeft, Calendar, Users, Zap, Play, Pause, Archive, Trash2, 
    Edit2, Eye, Clock, Target, BarChart3, CheckCircle, AlertCircle, 
    Sparkles, FileText, Image, Video, ChevronDown, ChevronUp, Copy,
    RefreshCw, Send, MoreVertical, Filter, Grid, List, X, Check,
    Download, ExternalLink, Search
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useSubscription } from '../contexts/SubscriptionContext';
import { supabase } from '../config/supabase';
import { campaignService, Campaign, CampaignPost } from '../services/campaignService';
import { campaignMediaService, BatchGenerationProgress } from '../services/campaignMediaService';
import { brandPersonaService, BrandPersona } from '../services/brandPersonaService';
import { generateBaselinePrediction } from '../services/performancePredictionService';
import { CREDIT_COSTS, canUseCompetitorAnalysis } from '../config/pricing';
import Spinner from '../components/Spinner';
import CampaignCalendar from '../components/CampaignCalendar';
import PerformancePredictionPanel, { PredictionBadge } from '../components/PerformancePredictionPanel';
import CompetitorAnalysisPanel from '../components/CompetitorAnalysisPanel';

interface CampaignDetailNavigationState {
    newCampaign?: boolean;
    estimates?: {
        basePosts: number;
        textCredits: number;
        imageCredits: number;
        videoCredits: number;
        total: number;
    };
    includeVariations?: boolean;
    includeImages?: boolean;
    includeVideo?: boolean;
}

interface CampaignDetailViewProps {
    onOpenAuth: () => void;
}

const CampaignDetailView: React.FC<CampaignDetailViewProps> = ({ onOpenAuth }) => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();
    const { subscription, deductCredits, canGenerateType } = useSubscription();

    // State
    const [campaign, setCampaign] = useState<Campaign | null>(null);
    const [posts, setPosts] = useState<CampaignPost[]>([]);
    const [persona, setPersona] = useState<BrandPersona | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isGeneratingText, setIsGeneratingText] = useState(false);
    const [isGeneratingImages, setIsGeneratingImages] = useState(false);
    const [textProgress, setTextProgress] = useState({ current: 0, total: 0, platform: '' });
    const [imageProgress, setImageProgress] = useState<BatchGenerationProgress | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [selectedPosts, setSelectedPosts] = useState<Set<string>>(new Set());
    const [viewMode, setViewMode] = useState<'grid' | 'list' | 'calendar'>('grid');
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [expandedPost, setExpandedPost] = useState<string | null>(null);
    const [selectedPostForPrediction, setSelectedPostForPrediction] = useState<CampaignPost | null>(null);
    
    // Modal states
    const [showImageConfirmModal, setShowImageConfirmModal] = useState(false);
    const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
    const [showPredictionModal, setShowPredictionModal] = useState(false);

    // Navigation state for new campaigns
    const navState = location.state as CampaignDetailNavigationState | null;

    // Load campaign data
    useEffect(() => {
        const loadCampaign = async () => {
            if (!id || !user) {
                setIsLoading(false);
                return;
            }

            try {
                const loadedCampaign = await campaignService.getById(id);
                if (!loadedCampaign) {
                    setError('Campaign not found');
                    return;
                }
                setCampaign(loadedCampaign);

                // Load posts
                const loadedPosts = await campaignService.getPosts(id);
                setPosts(loadedPosts);

                // Load persona if set
                if (loadedCampaign.brandPersonaId) {
                    const loadedPersona = await brandPersonaService.getById(loadedCampaign.brandPersonaId);
                    setPersona(loadedPersona);
                }

                // Auto-generate if new campaign
                if (navState?.newCampaign && loadedPosts.length === 0) {
                    handleGenerateText(navState.includeVariations || false);
                }

            } catch (err) {
                console.error('Error loading campaign:', err);
                setError('Failed to load campaign');
            } finally {
                setIsLoading(false);
            }
        };

        loadCampaign();
    }, [id, user]);

    // Generate text content for campaign
    const handleGenerateText = async (includeVariations: boolean) => {
        if (!campaign || !user) return;

        setIsGeneratingText(true);
        setError(null);

        try {
            const newPosts = await campaignService.generateCampaignText({
                campaignId: campaign.id,
                includeVariations,
                onProgress: (current, total, platform) => {
                    setTextProgress({ current, total, platform });
                },
            });

            setPosts(newPosts);

            // Refresh campaign to get updated counts
            const refreshedCampaign = await campaignService.getById(campaign.id);
            if (refreshedCampaign) {
                setCampaign(refreshedCampaign);
            }

        } catch (err) {
            console.error('Error generating content:', err);
            setError('Failed to generate content. Please try again.');
        } finally {
            setIsGeneratingText(false);
            setTextProgress({ current: 0, total: 0, platform: '' });
        }
    };

    // Generate images for selected posts
    const handleGenerateImages = async () => {
        if (selectedPosts.size === 0 || !campaign) return;

        setShowImageConfirmModal(false);

        if (!canGenerateType('image')) {
            setError('Insufficient credits for image generation.');
            return;
        }

        setIsGeneratingImages(true);
        setError(null);

        try {
            for (let i = 0; i < selectedPosts.size; i++) {
                const result = await deductCredits('image');
                if (!result.success) {
                    setError(`Failed to deduct credits after ${i} images. Stopping.`);
                    break;
                }
            }
            
            const results = await campaignMediaService.generateBatchImages({
                postIds: Array.from(selectedPosts),
                aspectRatio: '1:1',
                onProgress: (progress) => {
                    setImageProgress(progress);
                },
            });

            const updatedPosts = posts.map(post => {
                const result = results.find(r => r.postId === post.id);
                if (result?.success && result.mediaUrl) {
                    return {
                        ...post,
                        hasMedia: true,
                        mediaType: 'image' as const,
                        mediaUrl: result.mediaUrl,
                        status: 'visuals_generated' as const,
                    };
                }
                return post;
            });

            setPosts(updatedPosts);
            setSelectedPosts(new Set());

            const successCount = results.filter(r => r.success).length;
            await campaignMediaService.updateCampaignMediaCredits(campaign.id, successCount * CREDIT_COSTS.image);

            const refreshedCampaign = await campaignService.getById(campaign.id);
            if (refreshedCampaign) {
                setCampaign(refreshedCampaign);
            }

            const errors = results.filter(r => !r.success);
            if (errors.length > 0) {
                setError(`Generated ${successCount} images. ${errors.length} failed.`);
            }

        } catch (err) {
            console.error('Error generating images:', err);
            setError('Failed to generate images. Please try again.');
        } finally {
            setIsGeneratingImages(false);
            setImageProgress(null);
        }
    };

    // Delete selected posts
    const handleDeleteSelected = async () => {
        if (selectedPosts.size === 0) return;

        setShowDeleteConfirmModal(false);

        try {
            await campaignService.deletePosts(Array.from(selectedPosts));
            setPosts(prev => prev.filter(p => !selectedPosts.has(p.id)));
            setSelectedPosts(new Set());

            if (campaign) {
                const refreshedCampaign = await campaignService.getById(campaign.id);
                if (refreshedCampaign) {
                    setCampaign(refreshedCampaign);
                }
            }
        } catch (err) {
            console.error('Error deleting posts:', err);
            setError('Failed to delete posts');
        }
    };

    const togglePostSelection = (postId: string) => {
        setSelectedPosts(prev => {
            const next = new Set(prev);
            if (next.has(postId)) {
                next.delete(postId);
            } else {
                next.add(postId);
            }
            return next;
        });
    };

    const selectAllPosts = () => {
        const filteredPosts = getFilteredPosts();
        if (selectedPosts.size === filteredPosts.length) {
            setSelectedPosts(new Set());
        } else {
            setSelectedPosts(new Set(filteredPosts.map(p => p.id)));
        }
    };

    const selectPostsWithoutMedia = () => {
        const postsWithoutMedia = posts.filter(p => !p.hasMedia);
        setSelectedPosts(new Set(postsWithoutMedia.map(p => p.id)));
    };

    const getFilteredPosts = () => {
        if (filterStatus === 'all') return posts;
        return posts.filter(p => p.status === filterStatus);
    };

    const copyPostContent = (post: CampaignPost) => {
        if (post.textContent?.primaryContent) {
            navigator.clipboard.writeText(post.textContent.primaryContent);
        }
    };

    // Handle calendar post click
    const handleCalendarPostClick = (post: CampaignPost) => {
        setExpandedPost(post.id);
        setViewMode('grid');
    };

    // Get prediction score for a post
    const getPredictionScore = (post: CampaignPost): number | null => {
        if (post.predictedEngagementScore) return post.predictedEngagementScore;
        if (post.textContent) {
            const prediction = generateBaselinePrediction(post);
            return prediction.score;
        }
        return null;
    };

    // Render post card
    const renderPostCard = (post: CampaignPost) => {
        const isSelected = selectedPosts.has(post.id);
        const isExpanded = expandedPost === post.id;
        const predictionScore = getPredictionScore(post);

        const statusColors: Record<string, string> = {
            draft: 'bg-gray-100 text-gray-700',
            text_generated: 'bg-blue-100 text-blue-700',
            visuals_generated: 'bg-purple-100 text-purple-700',
            scheduled: 'bg-yellow-100 text-yellow-700',
            published: 'bg-green-100 text-green-700',
            failed: 'bg-red-100 text-red-700',
        };

        const contentTypeColors: Record<string, string> = {
            educational: 'bg-blue-500',
            promotional: 'bg-green-500',
            engagement: 'bg-purple-500',
        };

        return (
            <motion.div
                key={post.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`bg-white rounded-xl border-2 transition-all ${
                    isSelected ? 'border-brand-primary shadow-lg' : 'border-gray-200 hover:border-gray-300'
                }`}
            >
                {/* Media Preview */}
                {post.hasMedia && post.mediaUrl && (
                    <div className="relative h-40 overflow-hidden rounded-t-lg">
                        <img src={post.mediaUrl} alt="Post media" className="w-full h-full object-cover" />
                        <div className="absolute top-2 right-2">
                            <span className="bg-purple-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                                <Image className="w-3 h-3" />
                                AI Image
                            </span>
                        </div>
                    </div>
                )}

                {/* Header */}
                <div className="p-4 border-b border-gray-100">
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                            <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => togglePostSelection(post.id)}
                                className="w-4 h-4 text-brand-primary rounded"
                            />
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="font-medium text-surface-900">{post.platform}</span>
                                    <span className={`w-2 h-2 rounded-full ${contentTypeColors[post.contentType]}`} title={post.contentType} />
                                    {post.variationType !== 'original' && (
                                        <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded">
                                            {post.variationType === 'variation_a' ? 'A' : 'B'}
                                        </span>
                                    )}
                                    {predictionScore !== null && (
                                        <PredictionBadge score={predictionScore} />
                                    )}
                                </div>
                                <div className="text-xs text-gray-500 mt-0.5">
                                    {post.scheduledAt ? new Date(post.scheduledAt).toLocaleDateString() : 'Not scheduled'}
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${statusColors[post.status]}`}>
                                {post.status.replace('_', ' ')}
                            </span>
                            <button onClick={() => setExpandedPost(isExpanded ? null : post.id)} className="p-1 hover:bg-gray-100 rounded">
                                {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Content Preview */}
                <div className="p-4">
                    <p className={`text-sm text-gray-700 ${isExpanded ? '' : 'line-clamp-3'}`}>
                        {post.textContent?.primaryContent || 'No content generated yet'}
                    </p>
                </div>

                {/* Expanded Details */}
                <AnimatePresence>
                    {isExpanded && post.textContent && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="border-t border-gray-100 overflow-hidden"
                        >
                            <div className="p-4 space-y-4">
                                {/* Hashtags */}
                                {post.textContent.hashtags && post.textContent.hashtags.length > 0 && (
                                    <div>
                                        <label className="text-xs font-medium text-gray-500 uppercase">Hashtags</label>
                                        <div className="flex flex-wrap gap-1 mt-1">
                                            {post.textContent.hashtags.map((tag, i) => (
                                                <span key={i} className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded">{tag}</span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Analysis */}
                                {post.textContent.analysis && (
                                    <div>
                                        <label className="text-xs font-medium text-gray-500 uppercase">Analysis</label>
                                        <div className="mt-1 text-xs text-gray-600">
                                            <p><strong>Emotional Triggers:</strong> {post.textContent.analysis.emotionalTriggers?.join(', ')}</p>
                                            <p><strong>Viral Patterns:</strong> {post.textContent.analysis.viralPatterns?.join(', ')}</p>
                                        </div>
                                    </div>
                                )}

                                {/* Media Prompt */}
                                {post.mediaPrompt && (
                                    <div>
                                        <label className="text-xs font-medium text-gray-500 uppercase">Image Prompt</label>
                                        <p className="mt-1 text-xs text-gray-600 italic">"{post.mediaPrompt}"</p>
                                    </div>
                                )}

                                {/* Actions */}
                                <div className="flex items-center gap-2 pt-2 border-t border-gray-100 flex-wrap">
                                    <button onClick={() => copyPostContent(post)} className="flex items-center gap-1 px-3 py-1.5 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200">
                                        <Copy className="w-3 h-3" /> Copy
                                    </button>
                                    <button
                                        onClick={() => { setSelectedPostForPrediction(post); setShowPredictionModal(true); }}
                                        className="flex items-center gap-1 px-3 py-1.5 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                                    >
                                        <BarChart3 className="w-3 h-3" /> Analyze
                                    </button>
                                    {!post.hasMedia && (
                                        <button
                                            onClick={() => { setSelectedPosts(new Set([post.id])); setShowImageConfirmModal(true); }}
                                            className="flex items-center gap-1 px-3 py-1.5 text-xs bg-purple-100 text-purple-700 rounded hover:bg-purple-200"
                                        >
                                            <Image className="w-3 h-3" /> Generate Image
                                        </button>
                                    )}
                                    {post.hasMedia && post.mediaUrl && (
                                        <a href={post.mediaUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 px-3 py-1.5 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200">
                                            <ExternalLink className="w-3 h-3" /> View Image
                                        </a>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        );
    };

    // Image Generation Confirmation Modal
    const renderImageConfirmModal = () => {
        const postCount = selectedPosts.size;
        const totalCredits = postCount * CREDIT_COSTS.image;
        const hasEnoughCredits = subscription && subscription.totalCredits >= totalCredits;

        return (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
                onClick={() => setShowImageConfirmModal(false)}
            >
                <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                    className="bg-white rounded-2xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}
                >
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                            <Image className="w-6 h-6 text-purple-600" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-surface-900">Generate Images</h3>
                            <p className="text-sm text-gray-500">Confirm credit usage</p>
                        </div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                        <div className="flex justify-between mb-2"><span className="text-gray-600">Posts selected:</span><span className="font-medium">{postCount}</span></div>
                        <div className="flex justify-between mb-2"><span className="text-gray-600">Credits per image:</span><span className="font-medium">{CREDIT_COSTS.image}</span></div>
                        <div className="flex justify-between pt-2 border-t border-gray-200"><span className="font-medium text-surface-900">Total credits:</span><span className="font-bold text-brand-primary">{totalCredits}</span></div>
                    </div>
                    {!hasEnoughCredits && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                            <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
                            <div className="text-sm"><p className="font-medium text-red-700">Insufficient credits</p><p className="text-red-600">You have {subscription?.totalCredits || 0} credits. Need {totalCredits}.</p></div>
                        </div>
                    )}
                    <div className="flex items-center gap-3">
                        <button onClick={() => setShowImageConfirmModal(false)} className="flex-1 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50">Cancel</button>
                        <button onClick={handleGenerateImages} disabled={!hasEnoughCredits} className="flex-1 px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                            <Sparkles className="w-4 h-4" /> Generate
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        );
    };

    // Delete Confirmation Modal
    const renderDeleteConfirmModal = () => (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setShowDeleteConfirmModal(false)}
        >
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white rounded-2xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center"><Trash2 className="w-6 h-6 text-red-600" /></div>
                    <div><h3 className="text-lg font-bold text-surface-900">Delete Posts</h3><p className="text-sm text-gray-500">This action cannot be undone</p></div>
                </div>
                <p className="text-gray-600 mb-4">Are you sure you want to delete {selectedPosts.size} post{selectedPosts.size > 1 ? 's' : ''}? Any generated media will also be removed.</p>
                <div className="flex items-center gap-3">
                    <button onClick={() => setShowDeleteConfirmModal(false)} className="flex-1 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50">Cancel</button>
                    <button onClick={handleDeleteSelected} className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center justify-center gap-2"><Trash2 className="w-4 h-4" /> Delete</button>
                </div>
            </motion.div>
        </motion.div>
    );

    // Prediction Modal
    const renderPredictionModal = () => {
        if (!selectedPostForPrediction) return null;
        return (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setShowPredictionModal(false)}
            >
                <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                    className="bg-white rounded-2xl max-w-lg w-full max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}
                >
                    <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                        <h3 className="text-lg font-bold text-surface-900">Performance Analysis</h3>
                        <button onClick={() => setShowPredictionModal(false)} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
                    </div>
                    <div className="p-4">
                        <PerformancePredictionPanel post={selectedPostForPrediction} />
                    </div>
                </motion.div>
            </motion.div>
        );
    };

    // Loading state
    if (isLoading) {
        return <div className="flex items-center justify-center py-20"><Spinner size="lg" /></div>;
    }

    // Error state
    if (error && !campaign) {
        return (
            <div className="text-center py-20">
                <AlertCircle className="w-16 h-16 text-red-300 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-surface-900 mb-2">Error</h2>
                <p className="text-gray-500 mb-6">{error}</p>
                <button onClick={() => navigate('/campaigns')} className="px-6 py-3 bg-brand-primary text-white rounded-lg hover:bg-brand-primary/90">Back to Campaigns</button>
            </div>
        );
    }

    if (!campaign) return null;

    const filteredPosts = getFilteredPosts();
    const statusCounts = {
        all: posts.length,
        text_generated: posts.filter(p => p.status === 'text_generated').length,
        visuals_generated: posts.filter(p => p.status === 'visuals_generated').length,
        scheduled: posts.filter(p => p.status === 'scheduled').length,
        published: posts.filter(p => p.status === 'published').length,
    };
    const postsWithoutMedia = posts.filter(p => !p.hasMedia).length;
    const planId = subscription?.plan || 'free';

    return (
        <div className="space-y-6 pb-20">
            {/* Header */}
            <div className="flex items-center gap-4">
                <button onClick={() => navigate('/campaigns')} className="p-2 hover:bg-gray-100 rounded-lg"><ArrowLeft className="w-5 h-5" /></button>
                <div className="flex-1">
                    <h1 className="text-2xl font-bold text-surface-900">{campaign.name}</h1>
                    <p className="text-gray-500 text-sm">{campaign.themeGoal}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    campaign.status === 'active' ? 'bg-green-100 text-green-700' :
                    campaign.status === 'paused' ? 'bg-yellow-100 text-yellow-700' :
                    campaign.status === 'draft' ? 'bg-gray-100 text-gray-700' : 'bg-blue-100 text-blue-700'
                }`}>{campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}</span>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                    <div className="flex items-center gap-2 text-gray-500 text-sm mb-1"><FileText className="w-4 h-4" />Total Posts</div>
                    <div className="text-2xl font-bold text-surface-900">{campaign.totalPosts}</div>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                    <div className="flex items-center gap-2 text-gray-500 text-sm mb-1"><Image className="w-4 h-4" />With Media</div>
                    <div className="text-2xl font-bold text-purple-600">{posts.filter(p => p.hasMedia).length}</div>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                    <div className="flex items-center gap-2 text-gray-500 text-sm mb-1"><CheckCircle className="w-4 h-4" />Published</div>
                    <div className="text-2xl font-bold text-green-600">{campaign.postsPublished}</div>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                    <div className="flex items-center gap-2 text-gray-500 text-sm mb-1"><Zap className="w-4 h-4" />Credits Used</div>
                    <div className="text-2xl font-bold text-surface-900">{campaign.creditsUsed}</div>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                    <div className="flex items-center gap-2 text-gray-500 text-sm mb-1"><Calendar className="w-4 h-4" />Duration</div>
                    <div className="text-sm font-bold text-surface-900">{new Date(campaign.dateRangeStart).toLocaleDateString()} - {new Date(campaign.dateRangeEnd).toLocaleDateString()}</div>
                </div>
            </div>

            {/* Progress Indicators */}
            <AnimatePresence>
                {isGeneratingText && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                        <div className="flex items-center gap-3">
                            <Spinner size="sm" />
                            <div className="flex-1">
                                <p className="font-medium text-blue-900">Generating text content... ({textProgress.current}/{textProgress.total})</p>
                                <p className="text-sm text-blue-700">Currently generating for {textProgress.platform}</p>
                            </div>
                        </div>
                        <div className="mt-3 h-2 bg-blue-100 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-500 transition-all" style={{ width: `${(textProgress.current / textProgress.total) * 100}%` }} />
                        </div>
                    </motion.div>
                )}
                {isGeneratingImages && imageProgress && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="bg-purple-50 border border-purple-200 rounded-xl p-4">
                        <div className="flex items-center gap-3">
                            <Spinner size="sm" />
                            <div className="flex-1">
                                <p className="font-medium text-purple-900">Generating images... ({imageProgress.current}/{imageProgress.total})</p>
                                <p className="text-sm text-purple-700 capitalize">{imageProgress.status.replace('_', ' ')}</p>
                            </div>
                        </div>
                        <div className="mt-3 h-2 bg-purple-100 rounded-full overflow-hidden">
                            <div className="h-full bg-purple-500 transition-all" style={{ width: `${(imageProgress.current / imageProgress.total) * 100}%` }} />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Error */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
                    <div className="flex-1">
                        <p className="font-medium text-red-900">{error}</p>
                        <button onClick={() => setError(null)} className="text-sm text-red-700 underline mt-1">Dismiss</button>
                    </div>
                </div>
            )}

            {/* Competitor Analysis Panel (Pro+) */}
            {campaign.competitorHandles && campaign.competitorHandles.length > 0 && (
                <CompetitorAnalysisPanel
                    campaignId={campaign.id}
                    competitorHandles={campaign.competitorHandles}
                    platform={campaign.targetPlatforms[0] || 'Twitter'}
                />
            )}

            {/* Actions Bar */}
            <div className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-2">
                        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-lg text-sm">
                            <option value="all">All Posts ({statusCounts.all})</option>
                            <option value="text_generated">Text Generated ({statusCounts.text_generated})</option>
                            <option value="visuals_generated">With Visuals ({statusCounts.visuals_generated})</option>
                            <option value="scheduled">Scheduled ({statusCounts.scheduled})</option>
                            <option value="published">Published ({statusCounts.published})</option>
                        </select>
                        <div className="flex items-center border border-gray-200 rounded-lg">
                            <button onClick={() => setViewMode('grid')} className={`p-2 ${viewMode === 'grid' ? 'bg-gray-100' : ''}`}><Grid className="w-4 h-4" /></button>
                            <button onClick={() => setViewMode('list')} className={`p-2 ${viewMode === 'list' ? 'bg-gray-100' : ''}`}><List className="w-4 h-4" /></button>
                            <button onClick={() => setViewMode('calendar')} className={`p-2 ${viewMode === 'calendar' ? 'bg-gray-100' : ''}`}><Calendar className="w-4 h-4" /></button>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                        <button onClick={selectAllPosts} className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900">{selectedPosts.size === filteredPosts.length ? 'Deselect All' : 'Select All'}</button>
                        {postsWithoutMedia > 0 && <button onClick={selectPostsWithoutMedia} className="px-3 py-2 text-sm text-purple-600 hover:text-purple-800">Select Without Media ({postsWithoutMedia})</button>}
                        {selectedPosts.size > 0 && (
                            <>
                                <span className="text-sm text-gray-500 px-2">{selectedPosts.size} selected</span>
                                <button onClick={() => setShowImageConfirmModal(true)} disabled={isGeneratingImages} className="flex items-center gap-2 px-3 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 text-sm disabled:opacity-50">
                                    <Image className="w-4 h-4" /> Generate Images ({selectedPosts.size * CREDIT_COSTS.image} cr)
                                </button>
                                <button onClick={() => setShowDeleteConfirmModal(true)} className="flex items-center gap-2 px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 text-sm">
                                    <Trash2 className="w-4 h-4" /> Delete
                                </button>
                            </>
                        )}
                        {posts.length === 0 && (
                            <button onClick={() => handleGenerateText(true)} disabled={isGeneratingText} className="flex items-center gap-2 px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-primary/90 disabled:opacity-50">
                                <Sparkles className="w-4 h-4" /> Generate Content
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Calendar View */}
            {viewMode === 'calendar' && posts.length > 0 && (
                <CampaignCalendar
                    posts={posts}
                    startDate={campaign.dateRangeStart}
                    endDate={campaign.dateRangeEnd}
                    onPostClick={handleCalendarPostClick}
                />
            )}

            {/* Posts Grid/List */}
            {viewMode !== 'calendar' && posts.length > 0 && (
                <div className={`grid gap-4 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
                    {filteredPosts.map(renderPostCard)}
                </div>
            )}

            {/* Empty State */}
            {posts.length === 0 && (
                <div className="text-center py-16 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                    <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-surface-900 mb-2">No posts yet</h3>
                    <p className="text-gray-500 mb-6 max-w-sm mx-auto">Generate content for this campaign to get started.</p>
                    <button onClick={() => handleGenerateText(true)} disabled={isGeneratingText} className="px-6 py-3 bg-brand-primary text-white rounded-lg hover:bg-brand-primary/90 disabled:opacity-50 inline-flex items-center gap-2">
                        <Sparkles className="w-4 h-4" /> Generate Campaign Content
                    </button>
                </div>
            )}

            {/* Campaign Details */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="font-bold text-surface-900 mb-4">Campaign Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                    <div>
                        <label className="text-gray-500">Platforms</label>
                        <div className="flex flex-wrap gap-1 mt-1">
                            {campaign.targetPlatforms.map(p => <span key={p} className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-xs">{p}</span>)}
                        </div>
                    </div>
                    <div><label className="text-gray-500">Posting Frequency</label><p className="font-medium capitalize">{campaign.postingFrequency.replace('_', ' ')}</p></div>
                    <div>
                        <label className="text-gray-500">Content Mix</label>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs">Edu: {campaign.contentMix.educational}%</span>
                            <span className="text-xs">Promo: {campaign.contentMix.promotional}%</span>
                            <span className="text-xs">Engage: {campaign.contentMix.engagement}%</span>
                        </div>
                    </div>
                    {persona && <div><label className="text-gray-500">Brand Persona</label><p className="font-medium">{persona.name}</p></div>}
                </div>
            </div>

            {/* Modals */}
            <AnimatePresence>
                {showImageConfirmModal && renderImageConfirmModal()}
                {showDeleteConfirmModal && renderDeleteConfirmModal()}
                {showPredictionModal && renderPredictionModal()}
            </AnimatePresence>
        </div>
    );
};

export default CampaignDetailView;
