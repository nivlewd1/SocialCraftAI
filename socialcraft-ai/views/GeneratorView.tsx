

import React, { useState, useCallback, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Platform, GeneratedContent, PlatformSelections, Tone, Draft, TrendAnalysisResult, Trend, SearchIntent } from '../types';
import { generateViralContent, findTrends } from '../services/geminiService';
import AdvancedPlatformSelector from '../components/AdvancedPlatformSelector';
import ToneSelector from '../components/ToneSelector';
import ResultsDisplay from '../components/ResultsDisplay';
import Spinner from '../components/Spinner';
import TrendAnalysisDisplay from '../components/TrendAnalysisDisplay';
import { Sparkles, TrendingUp, UserCheck } from 'lucide-react';
import SearchIntentSelector from '../components/SearchIntentSelector';

const GeneratorView: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    
    const [sourceContent, setSourceContent] = useState('');
    const [authorsVoice, setAuthorsVoice] = useState('');
    const [platformSelections, setPlatformSelections] = useState<PlatformSelections>({});
    const [tone, setTone] = useState<Tone>('Auto');
    const [searchIntent, setSearchIntent] = useState<SearchIntent>('Auto');
    const [generatedContent, setGeneratedContent] = useState<GeneratedContent[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [isFindingTrends, setIsFindingTrends] = useState(false);
    const [trendResults, setTrendResults] = useState<TrendAnalysisResult | null>(null);

    useEffect(() => {
        const state = location.state as { playbookContent?: string; draftToLoad?: Draft };
        if (state?.playbookContent) {
            setSourceContent(state.playbookContent);
            navigate('.', { replace: true, state: {} });
        } else if (state?.draftToLoad) {
            const draft = state.draftToLoad;
            setSourceContent(draft.sourceContent);
            setAuthorsVoice(draft.authorsVoice || '');
            setPlatformSelections(draft.platformSelections);
            setTone(draft.tone);
            setSearchIntent(draft.searchIntent || 'Auto');
            setGeneratedContent(draft.results);
            navigate('.', { replace: true, state: {} });
        }
    }, [location.state, navigate]);

    const handleFindTrends = useCallback(async () => {
        if (!sourceContent.trim()) {
            window.showNotification('Please provide a topic, text, or URL to research.', 'error');
            return;
        }

        setIsFindingTrends(true);
        setTrendError(null);
        setTrendResults(null);
        setError(null);

        try {
            const results = await findTrends(sourceContent);
            setTrendResults(results);
        } catch (err) {
            window.showNotification(err instanceof Error ? err.message : 'An unknown error occurred during trend analysis.', 'error');
        } finally {
            setIsFindingTrends(false);
        }
    }, [sourceContent]);

    const handleUseTrend = useCallback((trend: Trend) => {
        setSourceContent(`Topic: ${trend.trendTitle}\n\nDetails: ${trend.description}`);
        setTrendResults(null); // Hide the trend results after selection
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);

    const handleGenerate = useCallback(async () => {
        if (!sourceContent.trim() || Object.keys(platformSelections).length === 0) {
            window.showNotification('Please provide content and select at least one platform.', 'error');
            return;
        }

        setIsLoading(true);
        setError(null);
        setTrendError(null);
        setGeneratedContent([]);

        try {
            const results = await generateViralContent(sourceContent, platformSelections, 'general', tone, searchIntent, authorsVoice);
            setGeneratedContent(results);
        } catch (err) {
            window.showNotification(err instanceof Error ? err.message : 'An unknown error occurred.', 'error');
        } finally {
            setIsLoading(false);
        }
    }, [sourceContent, platformSelections, tone, searchIntent, authorsVoice]);

    return (
        <div className="space-y-8">
            <div className="text-center">
                <h1 className="text-4xl md:text-5xl font-extrabold font-display tracking-tight">
                    AI Content <span className="gradient-text">Generation Engine</span>
                </h1>
                <p className="mt-4 max-w-2xl mx-auto text-lg text-deep-charcoal">
                    Input any text or URL, research real-time trends, and let our AI craft posts engineered for maximum engagement.
                </p>
            </div>

            <div className="max-w-4xl mx-auto glass-card rounded-2xl p-8 space-y-6">
                 <div>
                    <label className="block text-sm font-medium text-deep-charcoal mb-2">1. Your Source Content:</label>
                    <textarea
                        value={sourceContent}
                        onChange={(e) => setSourceContent(e.target.value)}
                        placeholder="Paste your article, blog post, URL, or just a simple idea here..."
                        className="w-full placeholder-deep-charcoal resize-none input-field"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-deep-charcoal mb-2 flex items-center">
                        <UserCheck size={14} className="mr-2 text-green-600"/> 2. Author's Voice & Experience (Optional):
                    </label>
                     <textarea
                        value={authorsVoice}
                        onChange={(e) => setAuthorsVoice(e.target.value)}
                        placeholder="Add a personal anecdote, unique perspective, or a specific data point from your own experience to demonstrate E-E-A-T..."
                        className="w-full h-24 p-4 rounded-lg transition-all text-deep-charcoal placeholder-deep-charcoal resize-none input-field"
                    />
                     <p className="text-xs text-deep-charcoal mt-1">This helps the AI create more trustworthy, authoritative content that showcases your unique expertise.</p>
                </div>


                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-deep-charcoal mb-2">3. Select Platforms & Formats:</label>
                        <AdvancedPlatformSelector selections={platformSelections} onSelectionChange={setPlatformSelections} />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-deep-charcoal mb-2">4. Select a Tone (Optional):</label>
                        <ToneSelector selectedTone={tone} onToneChange={setTone} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-deep-charcoal mb-2">5. Optimize for Search Intent (Optional):</label>
                        <SearchIntentSelector selectedIntent={searchIntent} onIntentChange={setSearchIntent} />
                    </div>
                </div>
                
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-gray-200 pt-6">
                    <button
                        onClick={handleFindTrends}
                        disabled={isFindingTrends || isLoading}
                        className="w-full flex items-center justify-center py-3 px-6 rounded-lg shadow-sm text-base font-medium btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isFindingTrends ? (
                            <>
                                <Spinner />
                                <span>Finding Trends...</span>
                            </>
                        ) : (
                            <>
                               <TrendingUp className="mr-2 h-5 w-5" />
                               <span>Research Topic</span>
                            </>
                        )}
                    </button>
                    <button
                        onClick={handleGenerate}
                        disabled={isLoading || isFindingTrends}
                        className="w-full flex items-center justify-center py-3 px-6 rounded-lg shadow-sm text-base font-medium btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <>
                                <Spinner />
                                <span>Crafting Content...</span>
                            </>
                        ) : (
                            <>
                               <Sparkles className="mr-2 h-5 w-5" />
                               <span>Generate Posts</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
            
            
            {isFindingTrends && (
                 <div className="flex justify-center items-center h-60">
                    <Spinner />
                    <span className="ml-4 text-lg text-deep-charcoal">Analyzing live web data...</span>
                </div>
            )}

            {trendResults && (
                <TrendAnalysisDisplay
                    results={trendResults}
                    onUseTrend={handleUseTrend}
                />
            )}
            
            {generatedContent.length > 0 && (
                <ResultsDisplay 
                    results={generatedContent}
                    sourceContent={sourceContent}
                    authorsVoice={authorsVoice}
                    platformSelections={platformSelections}
                    tone={tone}
                    searchIntent={searchIntent}
                />
            )}
        </div>
    );
};

export default GeneratorView;