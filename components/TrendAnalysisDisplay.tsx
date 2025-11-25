import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendAnalysisResult, Trend, TrendReport } from '../types';
import { TrendingUp, Link as LinkIcon, Lightbulb, Search, ExternalLink, ArrowRight, Zap, Layout, Save, CheckCircle } from 'lucide-react';
import { trendResearchService } from '../services/trendResearchService';
import { useAuth } from '../contexts/AuthContext';
import Spinner from './Spinner';

interface TrendAnalysisDisplayProps {
    results: TrendAnalysisResult;
    sourceTopic: string;
    onUseTrend: (trend: Trend) => void;
    onOpenAuth?: () => void;
}

const TrendAnalysisDisplay: React.FC<TrendAnalysisDisplayProps> = ({ 
    results, 
    sourceTopic,
    onUseTrend,
    onOpenAuth 
}) => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [isSaving, setIsSaving] = useState(false);
    const [savedReport, setSavedReport] = useState<TrendReport | null>(null);
    const [saveError, setSaveError] = useState<string | null>(null);

    // Save research and navigate to Amplifier
    const handleGoToAmplifier = async () => {
        if (!user) {
            onOpenAuth?.();
            return;
        }

        setIsSaving(true);
        setSaveError(null);

        try {
            // Save the research first
            const report = await trendResearchService.saveQuickResearch(sourceTopic, results);
            setSavedReport(report);
            
            // Navigate to Amplifier with the saved report
            navigate('/amplifier', { 
                state: { 
                    report,
                    fromGenerator: true 
                } 
            });
        } catch (error) {
            console.error('Error saving research:', error);
            setSaveError('Failed to save research. Please try again.');
            setIsSaving(false);
        }
    };

    // Navigate to Trend Scout with the research data for deeper analysis
    const handleGoDeeper = async () => {
        if (!user) {
            onOpenAuth?.();
            return;
        }

        // Save the quick research first (optional, for history)
        try {
            await trendResearchService.saveQuickResearch(sourceTopic, results);
        } catch (error) {
            console.warn('Could not save quick research:', error);
            // Continue anyway - the navigation is more important
        }

        // Navigate to Trend Scout with the topic pre-filled
        navigate('/trends-agent', { 
            state: { 
                initialTopic: sourceTopic,
                quickResearch: results
            } 
        });
    };

    // Save research without navigating (for reference later)
    const handleSaveForLater = async () => {
        if (!user) {
            onOpenAuth?.();
            return;
        }

        setIsSaving(true);
        setSaveError(null);

        try {
            const report = await trendResearchService.saveQuickResearch(sourceTopic, results);
            setSavedReport(report);
        } catch (error) {
            console.error('Error saving research:', error);
            setSaveError('Failed to save research. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto mt-8 animate-fade-in space-y-8 glass-card rounded-lg p-8">
            <div className="text-center border-b pb-4 border-surface-100">
                <h2 className="text-2xl font-bold font-display text-surface-900 flex items-center justify-center">
                    <TrendingUp className="mr-3 h-7 w-7 text-brand-primary" />
                    Trend Analysis Results
                </h2>
                <p className="text-sm text-gray-500 mt-1">Research for: {sourceTopic}</p>
            </div>

            {/* Action Buttons - Primary CTAs */}
            <div className="bg-gradient-to-r from-brand-primary/5 to-brand-glow/5 p-6 rounded-xl border border-brand-primary/20">
                <h3 className="text-sm font-bold text-surface-900 uppercase tracking-wider mb-4 flex items-center">
                    <Zap className="w-4 h-4 mr-2 text-brand-primary" />
                    What would you like to do next?
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Option 1: Generate content on this page */}
                    <div className="bg-white p-4 rounded-lg border border-gray-200 hover:border-brand-primary hover:shadow-md transition-all">
                        <h4 className="font-semibold text-surface-900 mb-2">Generate Now</h4>
                        <p className="text-xs text-gray-500 mb-3">
                            Select a trend below and create posts immediately on this page.
                        </p>
                        <div className="text-xs text-brand-primary font-medium">
                            ↓ Select a trend below
                        </div>
                    </div>

                    {/* Option 2: Go to Amplifier */}
                    <button
                        onClick={handleGoToAmplifier}
                        disabled={isSaving}
                        className="bg-white p-4 rounded-lg border border-gray-200 hover:border-purple-500 hover:shadow-md transition-all text-left group disabled:opacity-50"
                    >
                        <h4 className="font-semibold text-surface-900 mb-2 flex items-center">
                            <Layout className="w-4 h-4 mr-2 text-purple-600" />
                            Brand Amplifier
                        </h4>
                        <p className="text-xs text-gray-500 mb-3">
                            Apply your brand voice and create a content campaign.
                        </p>
                        <div className="flex items-center text-xs text-purple-600 font-medium group-hover:translate-x-1 transition-transform">
                            {isSaving ? (
                                <>
                                    <Spinner size="sm" /> 
                                    <span className="ml-2">Saving...</span>
                                </>
                            ) : (
                                <>
                                    Go to Amplifier <ArrowRight className="w-3 h-3 ml-1" />
                                </>
                            )}
                        </div>
                    </button>

                    {/* Option 3: Go deeper with Trend Scout */}
                    <button
                        onClick={handleGoDeeper}
                        className="bg-white p-4 rounded-lg border border-gray-200 hover:border-blue-500 hover:shadow-md transition-all text-left group"
                    >
                        <h4 className="font-semibold text-surface-900 mb-2 flex items-center">
                            <TrendingUp className="w-4 h-4 mr-2 text-blue-600" />
                            Go Deeper
                        </h4>
                        <p className="text-xs text-gray-500 mb-3">
                            Run Trend Scout for comprehensive market analysis.
                        </p>
                        <div className="flex items-center text-xs text-blue-600 font-medium group-hover:translate-x-1 transition-transform">
                            Open Trend Scout <ArrowRight className="w-3 h-3 ml-1" />
                        </div>
                    </button>
                </div>

                {/* Save for Later (subtle option) */}
                <div className="mt-4 flex items-center justify-between">
                    {savedReport ? (
                        <div className="flex items-center text-sm text-green-600">
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Research saved to your history
                        </div>
                    ) : (
                        <button
                            onClick={handleSaveForLater}
                            disabled={isSaving || !user}
                            className="flex items-center text-sm text-gray-500 hover:text-brand-primary transition-colors disabled:opacity-50"
                        >
                            <Save className="w-4 h-4 mr-2" />
                            {user ? 'Save to history' : 'Sign in to save'}
                        </button>
                    )}
                    
                    {saveError && (
                        <p className="text-sm text-red-500">{saveError}</p>
                    )}
                </div>
            </div>

            {/* Overall Summary Card */}
            <div>
                <h3 className="text-xl font-bold font-display text-surface-900 mb-2">Overall Summary</h3>
                <p className="text-surface-900 leading-relaxed bg-surface-100/50 p-4 rounded-lg border border-surface-100">
                    {results.overallSummary}
                </p>
            </div>

            {/* Identified Trends */}
            <div>
                <h3 className="text-xl font-bold font-display text-surface-900 mb-4 flex items-center">
                    <Lightbulb className="mr-2 h-5 w-5 text-brand-primary" />
                    Identified Trends
                </h3>
                <div className="space-y-4">
                    {results.identifiedTrends.map((trend, index) => (
                        <div key={index} className="glass-card rounded-lg p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div className="flex-grow">
                                <h4 className="font-semibold font-display text-surface-900">{trend.trendTitle}</h4>
                                <p className="text-sm text-surface-900 mt-1">{trend.description}</p>
                            </div>
                            <button
                                onClick={() => onUseTrend(trend)}
                                className="flex-shrink-0 flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium btn-primary w-full sm:w-auto"
                                title="Use this trend to generate posts"
                            >
                                <span>Use Trend</span>
                                <ArrowRight size={16} />
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Related Keywords & Sources */}
            <div className="grid md:grid-cols-2 gap-8">
                <div>
                    <h3 className="text-xl font-bold font-display text-surface-900 mb-4 flex items-center">
                        <Search className="mr-2 h-5 w-5 text-soft-blue"/>
                        Related Keywords
                    </h3>
                    <div className="flex flex-wrap gap-2">
                        {results.relatedKeywords.map((keyword, index) => (
                            <span key={index} className="px-2.5 py-1 text-sm font-medium text-white bg-soft-blue rounded-full">
                                {keyword}
                            </span>
                        ))}
                    </div>
                </div>
                <div>
                    <h3 className="text-xl font-bold font-display text-surface-900 mb-4 flex items-center">
                        <LinkIcon className="mr-2 h-5 w-5 text-brand-primary"/>
                        Sources
                    </h3>
                    <ul className="space-y-2">
                        {results.sources.map((source) => (
                            <li key={source.uri} className="text-sm">
                                <a href={source.uri} target="_blank" rel="noopener noreferrer" className="text-brand-primary hover:underline flex items-center group">
                                    <span className="truncate">{source.title || source.uri}</span>
                                    <ExternalLink size={14} className="ml-1.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default TrendAnalysisDisplay;
