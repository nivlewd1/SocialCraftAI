import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Users, Search, TrendingUp, TrendingDown, AlertTriangle, 
    CheckCircle, Lightbulb, RefreshCw, Lock, Clock, ExternalLink,
    ChevronDown, ChevronUp, Sparkles
} from 'lucide-react';
import { 
    CompetitorAnalysisResult, 
    CompetitorInsight,
    analyzeCompetitors 
} from '../services/performancePredictionService';
import { canUseCompetitorAnalysis, CREDIT_COSTS } from '../config/pricing';
import { useSubscription } from '../contexts/SubscriptionContext';
import Spinner from './Spinner';

interface CompetitorAnalysisPanelProps {
    campaignId: string;
    competitorHandles: string[];
    platform: string;
}

const CompetitorAnalysisPanel: React.FC<CompetitorAnalysisPanelProps> = ({
    campaignId,
    competitorHandles,
    platform,
}) => {
    const { subscription, deductCredits } = useSubscription();
    const [analysis, setAnalysis] = useState<CompetitorAnalysisResult | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const planId = subscription?.plan || 'free';
    const canAnalyze = canUseCompetitorAnalysis(planId);

    // Run analysis
    const handleRunAnalysis = async () => {
        if (!canAnalyze || competitorHandles.length === 0) return;

        setIsLoading(true);
        setError(null);

        try {
            // Deduct credits
            const result = await deductCredits('deep_analysis');
            if (!result.success) {
                setError('Insufficient credits for competitor analysis');
                return;
            }

            const analysisResult = await analyzeCompetitors(campaignId, competitorHandles, platform);
            setAnalysis(analysisResult);
            setIsExpanded(true);
        } catch (err) {
            setError('Failed to analyze competitors');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    // Check for cached analysis on mount
    useEffect(() => {
        // The service will return cached data if available
        if (canAnalyze && competitorHandles.length > 0) {
            analyzeCompetitors(campaignId, competitorHandles, platform)
                .then(result => {
                    setAnalysis(result);
                })
                .catch(() => {
                    // Ignore errors on initial load - user can manually trigger
                });
        }
    }, [campaignId]);

    // Render competitor card
    const renderCompetitorCard = (competitor: CompetitorInsight) => (
        <div key={competitor.handle} className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                        <Users className="w-4 h-4 text-gray-500" />
                    </div>
                    <div>
                        <p className="font-medium text-surface-900">{competitor.handle}</p>
                        <p className="text-xs text-gray-500">{competitor.postingFrequency}</p>
                    </div>
                </div>
                <a 
                    href={`https://${competitor.platform.toLowerCase()}.com/${competitor.handle.replace('@', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-gray-600"
                >
                    <ExternalLink className="w-4 h-4" />
                </a>
            </div>

            <div className="space-y-2 text-sm">
                <div>
                    <p className="text-xs font-medium text-gray-500 uppercase">Recent Topics</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                        {competitor.recentTopics.map((topic, i) => (
                            <span key={i} className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                                {topic}
                            </span>
                        ))}
                    </div>
                </div>

                <div>
                    <p className="text-xs font-medium text-gray-500 uppercase">Content Gaps</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                        {competitor.contentGaps.map((gap, i) => (
                            <span key={i} className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                                {gap}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );

    // No competitors configured
    if (competitorHandles.length === 0) {
        return (
            <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
                <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <h4 className="font-medium text-surface-900 mb-1">No Competitors Set</h4>
                <p className="text-sm text-gray-500">
                    Add competitor handles when creating your campaign to enable analysis.
                </p>
            </div>
        );
    }

    // Plan restriction
    if (!canAnalyze) {
        return (
            <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
                <Lock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <h4 className="font-medium text-surface-900 mb-1">Competitor Analysis</h4>
                <p className="text-sm text-gray-500 mb-4">
                    Available on Pro and Agency plans.
                </p>
                <a href="/pricing" className="text-brand-primary text-sm font-medium hover:underline">
                    Upgrade to unlock
                </a>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {/* Header */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                        <Search className="w-5 h-5 text-orange-600" />
                    </div>
                    <div className="text-left">
                        <h4 className="font-medium text-surface-900">Competitor Analysis</h4>
                        <p className="text-xs text-gray-500">
                            {competitorHandles.length} competitors • {platform}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {analysis && (
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(analysis.analyzedAt).toLocaleDateString()}
                        </span>
                    )}
                    {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </div>
            </button>

            {/* Content */}
            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="border-t border-gray-100 overflow-hidden"
                    >
                        {!analysis ? (
                            <div className="p-6 text-center">
                                <p className="text-gray-600 mb-4">
                                    Analyze competitor content to discover opportunities and gaps.
                                </p>
                                <button
                                    onClick={handleRunAnalysis}
                                    disabled={isLoading}
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-primary/90 disabled:opacity-50"
                                >
                                    {isLoading ? (
                                        <Spinner size="sm" />
                                    ) : (
                                        <>
                                            <Sparkles className="w-4 h-4" />
                                            Run Analysis
                                            <span className="text-xs bg-white/20 px-1.5 py-0.5 rounded">
                                                {CREDIT_COSTS.deep_analysis} credits
                                            </span>
                                        </>
                                    )}
                                </button>
                                {error && (
                                    <p className="text-sm text-red-500 mt-2">{error}</p>
                                )}
                            </div>
                        ) : (
                            <div className="p-4 space-y-4">
                                {/* Competitors */}
                                <div>
                                    <h5 className="text-sm font-bold text-gray-700 mb-3">Competitors</h5>
                                    <div className="grid gap-3">
                                        {analysis.competitors.map(renderCompetitorCard)}
                                    </div>
                                </div>

                                {/* Opportunities */}
                                <div>
                                    <h5 className="text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                                        <TrendingUp className="w-4 h-4 text-green-500" />
                                        Opportunities
                                    </h5>
                                    <ul className="space-y-2">
                                        {analysis.opportunities.map((opp, i) => (
                                            <li key={i} className="flex items-start gap-2 text-sm">
                                                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                                                <span className="text-gray-600">{opp}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Threats */}
                                <div>
                                    <h5 className="text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                                        <AlertTriangle className="w-4 h-4 text-orange-500" />
                                        Threats
                                    </h5>
                                    <ul className="space-y-2">
                                        {analysis.threats.map((threat, i) => (
                                            <li key={i} className="flex items-start gap-2 text-sm">
                                                <TrendingDown className="w-4 h-4 text-orange-500 mt-0.5" />
                                                <span className="text-gray-600">{threat}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Recommendations */}
                                <div>
                                    <h5 className="text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                                        <Lightbulb className="w-4 h-4 text-yellow-500" />
                                        Strategic Recommendations
                                    </h5>
                                    <ul className="space-y-2">
                                        {analysis.recommendations.map((rec, i) => (
                                            <li key={i} className="flex items-start gap-2 text-sm">
                                                <Sparkles className="w-4 h-4 text-brand-primary mt-0.5" />
                                                <span className="text-gray-600">{rec}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Refresh button */}
                                <div className="pt-3 border-t border-gray-100">
                                    <button
                                        onClick={handleRunAnalysis}
                                        disabled={isLoading}
                                        className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
                                    >
                                        <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                                        Refresh Analysis ({CREDIT_COSTS.deep_analysis} credits)
                                    </button>
                                </div>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default CompetitorAnalysisPanel;
