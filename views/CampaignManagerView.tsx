import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutGrid, Plus, Calendar, TrendingUp, Users, Zap, ChevronRight,
    Play, Pause, Archive, Trash2, Edit2, Eye, Clock, Target, BarChart3,
    CheckCircle, AlertCircle, Sparkles, FileText, Image, Video, Lock
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useSubscription } from '../contexts/SubscriptionContext';
import { supabase } from '../config/supabase';
import { BrandPersona, brandPersonaService } from '../services/brandPersonaService';
import { getPlanById, getMaxCampaigns, getMaxPostsPerCampaign, canUseCompetitorAnalysis, estimateCampaignCredits, CREDIT_COSTS } from '../config/pricing';
import Spinner from '../components/Spinner';

// Types
interface Campaign {
    id: string;
    name: string;
    description?: string;
    status: 'draft' | 'active' | 'paused' | 'completed' | 'archived';
    themeGoal: string;
    contentMix: { educational: number; promotional: number; engagement: number };
    targetPlatforms: string[];
    brandPersonaId?: string;
    dateRangeStart: string;
    dateRangeEnd: string;
    postingFrequency: 'daily' | 'every_other_day' | 'twice_weekly' | 'weekly';
    competitorHandles: string[];
    competitorAnalysisJson?: any;
    totalPosts: number;
    postsPublished: number;
    estimatedCredits: number;
    creditsUsed: number;
    createdAt: string;
    personaName?: string;
}

interface CampaignNavigationState {
    fromGenerator?: boolean;
    generatedContent?: any[];
    sourceContent?: string;
    persona?: BrandPersona | null;
    trendData?: {
        topic: string;
        trends: any[];
        keywords: string[];
        summary: string;
    };
}

interface CampaignManagerViewProps {
    onOpenAuth: () => void;
}

// Content mix presets
const CONTENT_MIX_PRESETS = [
    { name: 'Balanced', mix: { educational: 33, promotional: 34, engagement: 33 } },
    { name: 'Authority Builder', mix: { educational: 50, promotional: 20, engagement: 30 } },
    { name: 'Sales Focus', mix: { educational: 20, promotional: 50, engagement: 30 } },
    { name: 'Community First', mix: { educational: 25, promotional: 15, engagement: 60 } },
];

const POSTING_FREQUENCIES = [
    { value: 'daily', label: 'Daily', postsPerWeek: 7 },
    { value: 'every_other_day', label: 'Every Other Day', postsPerWeek: 3.5 },
    { value: 'twice_weekly', label: 'Twice Weekly', postsPerWeek: 2 },
    { value: 'weekly', label: 'Weekly', postsPerWeek: 1 },
];

const PLATFORMS = ['Twitter', 'LinkedIn', 'Instagram', 'TikTok', 'Pinterest'];

const CampaignManagerView: React.FC<CampaignManagerViewProps> = ({ onOpenAuth }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { subscription } = useSubscription();

    // State
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showCreateWizard, setShowCreateWizard] = useState(false);
    const [wizardStep, setWizardStep] = useState(1);
    const [personas, setPersonas] = useState<BrandPersona[]>([]);

    // Navigation state from Generator
    const [navState, setNavState] = useState<CampaignNavigationState | null>(null);

    // Plan limits
    const planId = subscription?.plan || 'free';
    const maxCampaigns = getMaxCampaigns(planId);
    const maxPostsPerCampaign = getMaxPostsPerCampaign(planId);
    const canUseCompetitor = canUseCompetitorAnalysis(planId);
    const canAccessVideo = subscription?.canAccessVideo || false;

    // New campaign form state
    const [newCampaign, setNewCampaign] = useState({
        name: '',
        description: '',
        themeGoal: '',
        contentMix: { educational: 33, promotional: 34, engagement: 33 },
        targetPlatforms: [] as string[],
        brandPersonaId: '',
        dateRangeStart: new Date().toISOString().split('T')[0],
        dateRangeEnd: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        postingFrequency: 'daily' as const,
        competitorHandles: [] as string[],
        includeVariations: true,
        includeImages: true,
        includeVideo: false,
    });

    // Calculate estimated posts and credits
    const calculateEstimates = useCallback(() => {
        const startDate = new Date(newCampaign.dateRangeStart);
        const endDate = new Date(newCampaign.dateRangeEnd);
        const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
        
        const frequency = POSTING_FREQUENCIES.find(f => f.value === newCampaign.postingFrequency);
        const postsPerDay = (frequency?.postsPerWeek || 7) / 7;
        const basePosts = Math.min(Math.floor(days * postsPerDay * newCampaign.targetPlatforms.length), maxPostsPerCampaign);
        
        const estimate = estimateCampaignCredits({
            postCount: basePosts,
            withVariations: newCampaign.includeVariations,
            withImages: newCampaign.includeImages,
            withVideo: newCampaign.includeVideo && canAccessVideo,
            videoCount: newCampaign.includeVideo ? Math.min(basePosts, 5) : 0,
        });

        return { basePosts, ...estimate };
    }, [newCampaign, maxPostsPerCampaign, canAccessVideo]);

    // Load campaigns and personas
    useEffect(() => {
        const loadData = async () => {
            if (!user) {
                setIsLoading(false);
                return;
            }

            try {
                // Load campaigns
                const { data: campaignsData, error: campaignsError } = await supabase
                    .from('campaign_overview')
                    .select('*')
                    .order('created_at', { ascending: false });

                if (campaignsError) throw campaignsError;

                setCampaigns((campaignsData || []).map(c => ({
                    id: c.id,
                    name: c.name,
                    status: c.status,
                    themeGoal: c.theme_goal,
                    contentMix: { educational: 33, promotional: 34, engagement: 33 },
                    targetPlatforms: c.target_platforms || [],
                    dateRangeStart: c.date_range_start,
                    dateRangeEnd: c.date_range_end,
                    postingFrequency: 'daily',
                    competitorHandles: [],
                    totalPosts: c.total_posts || 0,
                    postsPublished: c.posts_published || 0,
                    estimatedCredits: c.estimated_credits || 0,
                    creditsUsed: c.credits_used || 0,
                    createdAt: c.created_at,
                    personaName: c.persona_name,
                })));

                // Load personas
                const loadedPersonas = await brandPersonaService.getAll();
                setPersonas(loadedPersonas);

            } catch (error) {
                console.error('Error loading data:', error);
            } finally {
                setIsLoading(false);
            }
        };

        loadData();
    }, [user]);

    // Handle navigation state from Generator
    useEffect(() => {
        const state = location.state as CampaignNavigationState | null;
        if (state?.fromGenerator) {
            setNavState(state);
            setShowCreateWizard(true);
            
            // Pre-fill from navigation state
            if (state.trendData) {
                setNewCampaign(prev => ({
                    ...prev,
                    themeGoal: state.trendData?.topic || '',
                    name: `${state.trendData?.topic} Campaign`,
                }));
            }
            if (state.persona) {
                setNewCampaign(prev => ({
                    ...prev,
                    brandPersonaId: state.persona?.id || '',
                }));
            }

            // Clear navigation state
            navigate('.', { replace: true, state: {} });
        }
    }, [location.state, navigate]);

    // Create campaign
    const handleCreateCampaign = async () => {
        if (!user) {
            onOpenAuth();
            return;
        }

        const estimates = calculateEstimates();

        try {
            const { data, error } = await supabase
                .from('campaigns')
                .insert({
                    user_id: user.id,
                    name: newCampaign.name,
                    description: newCampaign.description,
                    theme_goal: newCampaign.themeGoal,
                    content_mix: newCampaign.contentMix,
                    target_platforms: newCampaign.targetPlatforms,
                    brand_persona_id: newCampaign.brandPersonaId || null,
                    date_range_start: newCampaign.dateRangeStart,
                    date_range_end: newCampaign.dateRangeEnd,
                    posting_frequency: newCampaign.postingFrequency,
                    competitor_handles: newCampaign.competitorHandles,
                    estimated_credits: estimates.total,
                    status: 'draft',
                })
                .select()
                .single();

            if (error) throw error;

            // Navigate to campaign detail for text generation
            navigate(`/campaigns/${data.id}`, { 
                state: { 
                    newCampaign: true,
                    estimates,
                    includeVariations: newCampaign.includeVariations,
                    includeImages: newCampaign.includeImages,
                    includeVideo: newCampaign.includeVideo,
                }
            });

        } catch (error) {
            console.error('Error creating campaign:', error);
        }
    };

    // Campaign status actions
    const handleStatusChange = async (campaignId: string, newStatus: Campaign['status']) => {
        try {
            const { error } = await supabase
                .from('campaigns')
                .update({ status: newStatus })
                .eq('id', campaignId);

            if (error) throw error;

            setCampaigns(prev => prev.map(c => 
                c.id === campaignId ? { ...c, status: newStatus } : c
            ));
        } catch (error) {
            console.error('Error updating campaign status:', error);
        }
    };

    // Render campaign card
    const renderCampaignCard = (campaign: Campaign) => {
        const statusColors = {
            draft: 'bg-gray-100 text-gray-700',
            active: 'bg-green-100 text-green-700',
            paused: 'bg-yellow-100 text-yellow-700',
            completed: 'bg-blue-100 text-blue-700',
            archived: 'bg-gray-200 text-gray-500',
        };

        const progress = campaign.totalPosts > 0 
            ? Math.round((campaign.postsPublished / campaign.totalPosts) * 100) 
            : 0;

        return (
            <motion.div
                key={campaign.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow"
            >
                <div className="flex items-start justify-between mb-4">
                    <div>
                        <h3 className="text-lg font-bold text-surface-900">{campaign.name}</h3>
                        <p className="text-sm text-gray-500 mt-1">{campaign.themeGoal}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[campaign.status]}`}>
                        {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                    </span>
                </div>

                {/* Progress bar */}
                <div className="mb-4">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>{campaign.postsPublished} / {campaign.totalPosts} posts</span>
                        <span>{progress}%</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div 
                            className="h-full bg-gradient-to-r from-brand-primary to-brand-glow transition-all"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>

                {/* Platforms */}
                <div className="flex items-center gap-2 mb-4">
                    {campaign.targetPlatforms.map(platform => (
                        <span key={platform} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                            {platform}
                        </span>
                    ))}
                </div>

                {/* Meta info */}
                <div className="flex items-center justify-between text-xs text-gray-400 mb-4">
                    <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>{new Date(campaign.dateRangeStart).toLocaleDateString()} - {new Date(campaign.dateRangeEnd).toLocaleDateString()}</span>
                    </div>
                    {campaign.personaName && (
                        <div className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            <span>{campaign.personaName}</span>
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-4 border-t border-gray-100">
                    <button
                        onClick={() => navigate(`/campaigns/${campaign.id}`)}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-brand-primary/10 text-brand-primary rounded-lg hover:bg-brand-primary/20 transition-colors text-sm font-medium"
                    >
                        <Eye className="w-4 h-4" />
                        View
                    </button>
                    
                    {campaign.status === 'draft' && (
                        <button
                            onClick={() => handleStatusChange(campaign.id, 'active')}
                            className="flex items-center justify-center gap-2 px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm font-medium"
                        >
                            <Play className="w-4 h-4" />
                        </button>
                    )}
                    
                    {campaign.status === 'active' && (
                        <button
                            onClick={() => handleStatusChange(campaign.id, 'paused')}
                            className="flex items-center justify-center gap-2 px-3 py-2 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 transition-colors text-sm font-medium"
                        >
                            <Pause className="w-4 h-4" />
                        </button>
                    )}
                    
                    {campaign.status === 'paused' && (
                        <button
                            onClick={() => handleStatusChange(campaign.id, 'active')}
                            className="flex items-center justify-center gap-2 px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm font-medium"
                        >
                            <Play className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </motion.div>
        );
    };

    // Render create wizard
    const renderCreateWizard = () => {
        const estimates = calculateEstimates();

        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
                onClick={() => setShowCreateWizard(false)}
            >
                <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="p-6 border-b border-gray-100">
                        <h2 className="text-2xl font-bold text-surface-900">Create New Campaign</h2>
                        <p className="text-gray-500 mt-1">Plan and schedule your content strategy</p>
                        
                        {/* Step indicator */}
                        <div className="flex items-center gap-2 mt-4">
                            {[1, 2, 3].map(step => (
                                <div key={step} className="flex items-center">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                                        wizardStep >= step 
                                            ? 'bg-brand-primary text-white' 
                                            : 'bg-gray-100 text-gray-400'
                                    }`}>
                                        {step}
                                    </div>
                                    {step < 3 && (
                                        <div className={`w-12 h-1 mx-1 ${
                                            wizardStep > step ? 'bg-brand-primary' : 'bg-gray-100'
                                        }`} />
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Body */}
                    <div className="p-6 space-y-6">
                        {/* Step 1: Basic Info */}
                        {wizardStep === 1 && (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Campaign Name *
                                    </label>
                                    <input
                                        type="text"
                                        value={newCampaign.name}
                                        onChange={(e) => setNewCampaign({ ...newCampaign, name: e.target.value })}
                                        placeholder="e.g., Black Friday Sale 2024"
                                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Campaign Goal / Theme *
                                    </label>
                                    <textarea
                                        value={newCampaign.themeGoal}
                                        onChange={(e) => setNewCampaign({ ...newCampaign, themeGoal: e.target.value })}
                                        placeholder="What's the main message or goal of this campaign?"
                                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none resize-none h-24"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Content Mix
                                    </label>
                                    <div className="grid grid-cols-4 gap-2">
                                        {CONTENT_MIX_PRESETS.map(preset => (
                                            <button
                                                key={preset.name}
                                                onClick={() => setNewCampaign({ ...newCampaign, contentMix: preset.mix })}
                                                className={`p-3 rounded-lg border text-center transition-colors ${
                                                    JSON.stringify(newCampaign.contentMix) === JSON.stringify(preset.mix)
                                                        ? 'border-brand-primary bg-brand-primary/5'
                                                        : 'border-gray-200 hover:border-gray-300'
                                                }`}
                                            >
                                                <span className="text-sm font-medium">{preset.name}</span>
                                            </button>
                                        ))}
                                    </div>
                                    <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                                        <span className="flex items-center gap-1">
                                            <div className="w-2 h-2 rounded-full bg-blue-500" />
                                            Educational {newCampaign.contentMix.educational}%
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <div className="w-2 h-2 rounded-full bg-green-500" />
                                            Promotional {newCampaign.contentMix.promotional}%
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <div className="w-2 h-2 rounded-full bg-purple-500" />
                                            Engagement {newCampaign.contentMix.engagement}%
                                        </span>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Brand Persona (Optional)
                                    </label>
                                    <select
                                        value={newCampaign.brandPersonaId}
                                        onChange={(e) => setNewCampaign({ ...newCampaign, brandPersonaId: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none"
                                    >
                                        <option value="">No persona (default voice)</option>
                                        {personas.map(p => (
                                            <option key={p.id} value={p.id}>{p.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        )}

                        {/* Step 2: Platforms & Schedule */}
                        {wizardStep === 2 && (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Target Platforms *
                                    </label>
                                    <div className="grid grid-cols-5 gap-2">
                                        {PLATFORMS.map(platform => (
                                            <button
                                                key={platform}
                                                onClick={() => {
                                                    const platforms = newCampaign.targetPlatforms.includes(platform)
                                                        ? newCampaign.targetPlatforms.filter(p => p !== platform)
                                                        : [...newCampaign.targetPlatforms, platform];
                                                    setNewCampaign({ ...newCampaign, targetPlatforms: platforms });
                                                }}
                                                className={`p-3 rounded-lg border text-center transition-colors ${
                                                    newCampaign.targetPlatforms.includes(platform)
                                                        ? 'border-brand-primary bg-brand-primary/5'
                                                        : 'border-gray-200 hover:border-gray-300'
                                                }`}
                                            >
                                                <span className="text-sm">{platform}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Start Date
                                        </label>
                                        <input
                                            type="date"
                                            value={newCampaign.dateRangeStart}
                                            onChange={(e) => setNewCampaign({ ...newCampaign, dateRangeStart: e.target.value })}
                                            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            End Date
                                        </label>
                                        <input
                                            type="date"
                                            value={newCampaign.dateRangeEnd}
                                            onChange={(e) => setNewCampaign({ ...newCampaign, dateRangeEnd: e.target.value })}
                                            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Posting Frequency
                                    </label>
                                    <div className="grid grid-cols-4 gap-2">
                                        {POSTING_FREQUENCIES.map(freq => (
                                            <button
                                                key={freq.value}
                                                onClick={() => setNewCampaign({ ...newCampaign, postingFrequency: freq.value as any })}
                                                className={`p-3 rounded-lg border text-center transition-colors ${
                                                    newCampaign.postingFrequency === freq.value
                                                        ? 'border-brand-primary bg-brand-primary/5'
                                                        : 'border-gray-200 hover:border-gray-300'
                                                }`}
                                            >
                                                <span className="text-sm font-medium">{freq.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Competitor Analysis (Pro+) */}
                                <div className={!canUseCompetitor ? 'opacity-50' : ''}>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Competitor Handles 
                                        {!canUseCompetitor && (
                                            <span className="ml-2 text-xs text-orange-600 flex items-center gap-1">
                                                <Lock className="w-3 h-3" /> Pro+ only
                                            </span>
                                        )}
                                    </label>
                                    <input
                                        type="text"
                                        disabled={!canUseCompetitor}
                                        placeholder="@competitor1, @competitor2"
                                        onChange={(e) => setNewCampaign({ 
                                            ...newCampaign, 
                                            competitorHandles: e.target.value.split(',').map(h => h.trim()).filter(Boolean)
                                        })}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none disabled:bg-gray-50"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Step 3: Media & Review */}
                        {wizardStep === 3 && (
                            <div className="space-y-6">
                                {/* Media options */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Content Options
                                    </label>
                                    <div className="space-y-3">
                                        <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                                            <input
                                                type="checkbox"
                                                checked={newCampaign.includeVariations}
                                                onChange={(e) => setNewCampaign({ ...newCampaign, includeVariations: e.target.checked })}
                                                className="w-4 h-4 text-brand-primary"
                                            />
                                            <div className="flex-1">
                                                <span className="font-medium">A/B Variations</span>
                                                <p className="text-xs text-gray-500">Generate 2 versions of each post for testing</p>
                                            </div>
                                            <span className="text-xs text-gray-400">2x posts</span>
                                        </label>

                                        <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                                            <input
                                                type="checkbox"
                                                checked={newCampaign.includeImages}
                                                onChange={(e) => setNewCampaign({ ...newCampaign, includeImages: e.target.checked })}
                                                className="w-4 h-4 text-brand-primary"
                                            />
                                            <div className="flex-1">
                                                <span className="font-medium flex items-center gap-2">
                                                    <Image className="w-4 h-4" /> AI Images
                                                </span>
                                                <p className="text-xs text-gray-500">Generate images for each post</p>
                                            </div>
                                            <span className="text-xs text-gray-400">{CREDIT_COSTS.image} credits each</span>
                                        </label>

                                        <label className={`flex items-center gap-3 p-3 border border-gray-200 rounded-lg ${
                                            canAccessVideo ? 'cursor-pointer hover:bg-gray-50' : 'opacity-50 cursor-not-allowed'
                                        }`}>
                                            <input
                                                type="checkbox"
                                                checked={newCampaign.includeVideo && canAccessVideo}
                                                onChange={(e) => setNewCampaign({ ...newCampaign, includeVideo: e.target.checked })}
                                                disabled={!canAccessVideo}
                                                className="w-4 h-4 text-brand-primary"
                                            />
                                            <div className="flex-1">
                                                <span className="font-medium flex items-center gap-2">
                                                    <Video className="w-4 h-4" /> AI Video
                                                    {!canAccessVideo && (
                                                        <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded">Pro+</span>
                                                    )}
                                                </span>
                                                <p className="text-xs text-gray-500">Generate video clips (up to 5 per campaign)</p>
                                            </div>
                                            <span className="text-xs text-gray-400">{CREDIT_COSTS.video} credits each</span>
                                        </label>
                                    </div>
                                </div>

                                {/* Cost estimate */}
                                <div className="bg-gray-50 rounded-xl p-4">
                                    <h4 className="font-medium text-surface-900 mb-3">Campaign Summary</h4>
                                    
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Platforms:</span>
                                            <span className="font-medium">{newCampaign.targetPlatforms.join(', ') || 'None selected'}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Duration:</span>
                                            <span className="font-medium">
                                                {Math.ceil((new Date(newCampaign.dateRangeEnd).getTime() - new Date(newCampaign.dateRangeStart).getTime()) / (1000 * 60 * 60 * 24)) + 1} days
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Estimated Posts:</span>
                                            <span className="font-medium">{estimates.basePosts}</span>
                                        </div>
                                        <div className="border-t border-gray-200 pt-2 mt-2">
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Text Generation:</span>
                                                <span className="font-medium">{estimates.textCredits} credits</span>
                                            </div>
                                            {newCampaign.includeImages && (
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Image Generation:</span>
                                                    <span className="font-medium">{estimates.imageCredits} credits</span>
                                                </div>
                                            )}
                                            {newCampaign.includeVideo && canAccessVideo && (
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Video Generation:</span>
                                                    <span className="font-medium">{estimates.videoCredits} credits</span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="border-t border-gray-200 pt-2 mt-2">
                                            <div className="flex justify-between text-lg">
                                                <span className="font-bold text-surface-900">Total Estimated:</span>
                                                <span className="font-bold text-brand-primary">{estimates.total} credits</span>
                                            </div>
                                        </div>
                                    </div>

                                    {subscription && estimates.total > subscription.totalCredits && (
                                        <div className="mt-3 p-3 bg-orange-50 border border-orange-200 rounded-lg flex items-start gap-2">
                                            <AlertCircle className="w-4 h-4 text-orange-500 mt-0.5" />
                                            <div className="text-sm">
                                                <p className="font-medium text-orange-700">Insufficient credits</p>
                                                <p className="text-orange-600">
                                                    You have {subscription.totalCredits} credits. Consider reducing posts or skipping media generation.
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Text First notice */}
                                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-2">
                                    <FileText className="w-4 h-4 text-blue-500 mt-0.5" />
                                    <div className="text-sm">
                                        <p className="font-medium text-blue-700">"Text First" Generation</p>
                                        <p className="text-blue-600">
                                            Text drafts will be generated first (~{estimates.textCredits} credits). 
                                            After reviewing, you can generate visuals for selected posts.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="p-6 border-t border-gray-100 flex items-center justify-between">
                        <button
                            onClick={() => wizardStep > 1 ? setWizardStep(wizardStep - 1) : setShowCreateWizard(false)}
                            className="px-4 py-2 text-gray-600 hover:text-gray-800"
                        >
                            {wizardStep > 1 ? 'Back' : 'Cancel'}
                        </button>

                        {wizardStep < 3 ? (
                            <button
                                onClick={() => setWizardStep(wizardStep + 1)}
                                disabled={
                                    (wizardStep === 1 && (!newCampaign.name || !newCampaign.themeGoal)) ||
                                    (wizardStep === 2 && newCampaign.targetPlatforms.length === 0)
                                }
                                className="px-6 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                Continue
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        ) : (
                            <button
                                onClick={handleCreateCampaign}
                                disabled={!user}
                                className="px-6 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                <Sparkles className="w-4 h-4" />
                                Create & Generate Text
                            </button>
                        )}
                    </div>
                </motion.div>
            </motion.div>
        );
    };

    // Not authenticated
    if (!user) {
        return (
            <div className="text-center py-20">
                <LayoutGrid className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-surface-900 mb-2">Campaign Manager</h2>
                <p className="text-gray-500 mb-6">Plan, schedule, and manage multi-post campaigns with A/B testing.</p>
                <button
                    onClick={onOpenAuth}
                    className="px-6 py-3 bg-brand-primary text-white rounded-lg hover:bg-brand-primary/90"
                >
                    Sign in to get started
                </button>
            </div>
        );
    }

    // Loading state
    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Spinner size="lg" />
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-20">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-surface-900">Campaign Manager</h1>
                    <p className="text-gray-500 mt-1">
                        Plan and schedule multi-post campaigns with A/B testing
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-500">
                        {campaigns.length} / {maxCampaigns === -1 ? '∞' : maxCampaigns} campaigns
                    </span>
                    <button
                        onClick={() => {
                            setWizardStep(1);
                            setShowCreateWizard(true);
                        }}
                        disabled={maxCampaigns !== -1 && campaigns.length >= maxCampaigns}
                        className="flex items-center gap-2 px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Plus className="w-4 h-4" />
                        New Campaign
                    </button>
                </div>
            </div>

            {/* Campaign grid */}
            {campaigns.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {campaigns.map(renderCampaignCard)}
                </div>
            ) : (
                <div className="text-center py-16 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                    <LayoutGrid className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-surface-900 mb-2">No campaigns yet</h3>
                    <p className="text-gray-500 mb-6 max-w-sm mx-auto">
                        Create your first campaign to plan and schedule multiple posts with consistent messaging.
                    </p>
                    <button
                        onClick={() => {
                            setWizardStep(1);
                            setShowCreateWizard(true);
                        }}
                        className="px-6 py-3 bg-brand-primary text-white rounded-lg hover:bg-brand-primary/90 inline-flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" />
                        Create Your First Campaign
                    </button>
                </div>
            )}

            {/* Create wizard modal */}
            <AnimatePresence>
                {showCreateWizard && renderCreateWizard()}
            </AnimatePresence>
        </div>
    );
};

export default CampaignManagerView;
