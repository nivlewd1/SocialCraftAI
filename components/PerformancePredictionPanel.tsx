import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    BarChart3, TrendingUp, TrendingDown, Minus, AlertCircle, 
    Sparkles, ChevronDown, ChevronUp, Zap, Lock, RefreshCw,
    CheckCircle, XCircle, Info
} from 'lucide-react';
import { CampaignPost } from '../services/campaignService';
import { 
    PerformancePrediction, 
    PredictionFactor,
    generateBaselinePrediction 
} from '../services/performancePredictionService';
import { CREDIT_COSTS, canUseDeepAnalysis } from '../config/pricing';
import { useSubscription } from '../contexts/SubscriptionContext';
import Spinner from './Spinner';

interface PerformancePredictionPanelProps {
    post: CampaignPost;
    onRequestDeepAnalysis?: () => void;
}

const PerformancePredictionPanel: React.FC<PerformancePredictionPanelProps> = ({
    post,
    onRequestDeepAnalysis,
}) => {
    const { subscription } = useSubscription();
    const [prediction, setPrediction] = useState<PerformancePrediction | null>(null);
    const [isExpanded, setIsExpanded] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const planId = subscription?.plan || 'free';
    const canDeepAnalyze = canUseDeepAnalysis(planId);

    // Generate prediction on mount
    useEffect(() => {
        if (post.textContent) {
            const basePrediction = generateBaselinePrediction(post);
            setPrediction(basePrediction);
        }
    }, [post]);

    if (!prediction) return null;

    // Get score color
    const getScoreColor = (score: number): string => {
        if (score >= 70) return 'text-green-600';
        if (score >= 50) return 'text-yellow-600';
        return 'text-red-500';
    };

    const getScoreBgColor = (score: number): string => {
        if (score >= 70) return 'bg-green-100';
        if (score >= 50) return 'bg-yellow-100';
        return 'bg-red-100';
    };

    // Get impact icon
    const getImpactIcon = (impact: 'positive' | 'negative' | 'neutral') => {
        switch (impact) {
            case 'positive':
                return <TrendingUp className="w-4 h-4 text-green-500" />;
            case 'negative':
                return <TrendingDown className="w-4 h-4 text-red-500" />;
            default:
                return <Minus className="w-4 h-4 text-gray-400" />;
        }
    };

    // Render factor bar
    const renderFactorBar = (factor: PredictionFactor) => {
        const absScore = Math.abs(factor.score);
        const maxScore = 10;
        const width = (absScore / maxScore) * 100;
        const isPositive = factor.impact === 'positive';

        return (
            <div key={factor.name} className="py-2">
                <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                        {getImpactIcon(factor.impact)}
                        <span className="text-sm font-medium text-gray-700">{factor.name}</span>
                    </div>
                    <span className={`text-sm font-bold ${
                        isPositive ? 'text-green-600' : factor.impact === 'negative' ? 'text-red-500' : 'text-gray-500'
                    }`}>
                        {factor.score > 0 ? '+' : ''}{factor.score}
                    </span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                        className={`h-full rounded-full transition-all ${
                            isPositive ? 'bg-green-500' : factor.impact === 'negative' ? 'bg-red-400' : 'bg-gray-400'
                        }`}
                        style={{ width: `${width}%` }}
                    />
                </div>
                <p className="text-xs text-gray-500 mt-1">{factor.description}</p>
            </div>
        );
    };

    return (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {/* Header - always visible */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
                <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${getScoreBgColor(prediction.score)}`}>
                        <span className={`text-lg font-bold ${getScoreColor(prediction.score)}`}>
                            {prediction.score}
                        </span>
                    </div>
                    <div className="text-left">
                        <h4 className="font-medium text-surface-900">Predicted Performance</h4>
                        <p className="text-xs text-gray-500">
                            {prediction.confidence} confidence • {prediction.source === 'deep_analysis' ? 'Deep Analysis' : 'Baseline'}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {prediction.source === 'baseline' && (
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                            Free
                        </span>
                    )}
                    {prediction.source === 'deep_analysis' && (
                        <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded flex items-center gap-1">
                            <Sparkles className="w-3 h-3" />
                            AI Enhanced
                        </span>
                    )}
                    {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </div>
            </button>

            {/* Expanded details */}
            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="border-t border-gray-100 overflow-hidden"
                    >
                        <div className="p-4 space-y-4">
                            {/* Score interpretation */}
                            <div className={`p-3 rounded-lg ${getScoreBgColor(prediction.score)}`}>
                                <p className={`text-sm font-medium ${getScoreColor(prediction.score)}`}>
                                    {prediction.score >= 70 
                                        ? '🔥 High engagement potential! This post is well-optimized.'
                                        : prediction.score >= 50
                                        ? '👍 Decent engagement potential. Consider the recommendations below.'
                                        : '⚠️ Low engagement potential. Improvements needed.'}
                                </p>
                            </div>

                            {/* Factors breakdown */}
                            <div>
                                <h5 className="text-sm font-bold text-gray-700 mb-2">Score Factors</h5>
                                <div className="space-y-1">
                                    {prediction.factors.map(renderFactorBar)}
                                </div>
                            </div>

                            {/* Recommendations */}
                            {prediction.recommendations.length > 0 && (
                                <div>
                                    <h5 className="text-sm font-bold text-gray-700 mb-2">Recommendations</h5>
                                    <ul className="space-y-2">
                                        {prediction.recommendations.map((rec, index) => (
                                            <li key={index} className="flex items-start gap-2 text-sm">
                                                <CheckCircle className="w-4 h-4 text-brand-primary mt-0.5 flex-shrink-0" />
                                                <span className="text-gray-600">{rec}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Deep Analysis CTA */}
                            {prediction.source === 'baseline' && (
                                <div className="pt-3 border-t border-gray-100">
                                    {canDeepAnalyze ? (
                                        <button
                                            onClick={onRequestDeepAnalysis}
                                            disabled={isLoading}
                                            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors disabled:opacity-50"
                                        >
                                            {isLoading ? (
                                                <Spinner size="sm" />
                                            ) : (
                                                <>
                                                    <Sparkles className="w-4 h-4" />
                                                    Run Deep Analysis
                                                    <span className="text-xs bg-purple-200 px-1.5 py-0.5 rounded">
                                                        {CREDIT_COSTS.deep_analysis} credits
                                                    </span>
                                                </>
                                            )}
                                        </button>
                                    ) : (
                                        <div className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-500 rounded-lg">
                                            <Lock className="w-4 h-4" />
                                            <span className="text-sm">Deep Analysis available on Pro+</span>
                                        </div>
                                    )}
                                    <p className="text-xs text-gray-500 text-center mt-2">
                                        Deep analysis uses real-time trend data for more accurate predictions
                                    </p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

// Compact version for post cards
export const PredictionBadge: React.FC<{ score: number; className?: string }> = ({ score, className = '' }) => {
    const getColor = () => {
        if (score >= 70) return 'bg-green-100 text-green-700';
        if (score >= 50) return 'bg-yellow-100 text-yellow-700';
        return 'bg-red-100 text-red-700';
    };

    return (
        <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getColor()} ${className}`}>
            <BarChart3 className="w-3 h-3" />
            <span>{score}</span>
        </div>
    );
};

export default PerformancePredictionPanel;
