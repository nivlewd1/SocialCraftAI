import React, { useState, useCallback, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Platform, GeneratedContent, PlatformSelections, Tone, Draft, TrendAnalysisResult, Trend, SearchIntent } from '../types';
import { generateViralContent, findTrends } from '../services/geminiService';
import AdvancedPlatformSelector from '../components/AdvancedPlatformSelector';
import ToneSelector from '../components/ToneSelector';
import ResultsDisplay from '../components/ResultsDisplay';
import Spinner from '../components/Spinner';
import TrendAnalysisDisplay from '../components/TrendAnalysisDisplay';
import { Sparkles, TrendingUp, UserCheck, ArrowRight, Zap, Globe, PenTool } from 'lucide-react';
import SearchIntentSelector from '../components/SearchIntentSelector';
import { useAuth } from '../contexts/AuthContext';

interface GeneratorViewProps {
    onOpenAuth: () => void;
}

const GeneratorView: React.FC<GeneratorViewProps> = ({ onOpenAuth }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user } = useAuth();

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
    const [trendError, setTrendError] = useState<string | null>(null);

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
            // Ideally use a toast notification here
            alert('Please provide a topic, text, or URL to research.');
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
            setTrendError(err instanceof Error ? err.message : 'An unknown error occurred during trend analysis.');
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
            alert('Please provide content and select at least one platform.');
            return;
        }

        // Check authentication
        if (!user) {
            onOpenAuth();
            return;
        }

        setIsLoading(true);
        setError(null);
        setTrendError(null);
        setGeneratedContent([]);

        try {
            const results = await generateViralContent(sourceContent, platformSelections, 'general', tone, searchIntent, authorsVoice);
            setGeneratedContent(results);
            // Scroll to results
            setTimeout(() => {
                const resultsElement = document.getElementById('results-section');
                if (resultsElement) {
                    resultsElement.scrollIntoView({ behavior: 'smooth' });
                }
            }, 100);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    }, [sourceContent, platformSelections, tone, searchIntent, authorsVoice]);

    const containerVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.5,
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 10 },
        visible: { opacity: 1, y: 0 }
    };

    return (
        <div className="space-y-12 pb-20">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center space-y-4"
            >
                <div className="inline-flex items-center justify-center p-2 bg-brand-primary/10 rounded-full mb-4">
                    <Zap className="w-5 h-5 text-brand-primary mr-2" />
                    <span className="text-sm font-medium text-brand-primary">AI-Powered Content Engine</span>
                </div>
                <h1 className="text-4xl md:text-6xl font-bold font-display tracking-tight text-surface-900">
                    Create <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-brand-glow">Engaging Content</span> in Seconds
                </h1>
                <p className="max-w-2xl mx-auto text-lg text-gray-600">
                    Transform your ideas, URLs, or rough notes into polished, platform-optimized social media posts tailored to your unique voice.
                </p>
            </motion.div>

            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="max-w-5xl mx-auto"
            >
                <div className="glass-card rounded-lg p-1 shadow-elevated overflow-hidden">
                    <div className="bg-white/50 backdrop-blur-sm p-6 md:p-10 rounded-lg space-y-8">

                        {/* Section 1: Input */}
                        <motion.div variants={itemVariants} className="space-y-4">
                            <div className="flex items-center space-x-3 mb-2">
                                <div className="w-8 h-8 rounded-full bg-brand-primary/20 flex items-center justify-center text-brand-primary font-bold">1</div>
                                <h3 className="text-xl font-semibold text-surface-900">What are we posting about?</h3>
                            </div>
                            <div className="relative group">
                                <textarea
                                    value={sourceContent}
                                    onChange={(e) => setSourceContent(e.target.value)}
                                    placeholder="Paste an article URL, a topic, or just dump your thoughts here..."
                                    className="w-full min-h-[160px] p-6 rounded-xl bg-white border-2 border-gray-100 focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 transition-all resize-none text-lg placeholder:text-gray-400 shadow-inner"
                                />
                                <div className="absolute bottom-4 right-4 flex space-x-2">
                                    <button
                                        onClick={handleFindTrends}
                                        disabled={isFindingTrends || !sourceContent.trim()}
                                        className="flex items-center space-x-2 px-4 py-2 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:text-brand-primary hover:border-brand-primary transition-colors shadow-sm disabled:opacity-50"
                                        title="Research this topic for trends"
                                    >
                                        {isFindingTrends ? <Spinner size="sm" /> : <Globe className="w-4 h-4" />}
                                        <span>Research Topic</span>
                                    </button>
                                </div>
                            </div>
                        </motion.div>

                        {/* Section 2: Author's Voice */}
                        <motion.div variants={itemVariants} className="space-y-4">
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center space-x-3">
                                    <div className="w-8 h-8 rounded-full bg-brand-primary/20 flex items-center justify-center text-brand-primary font-bold">2</div>
                                    <h3 className="text-xl font-semibold text-surface-900">Add your personal touch <span className="text-sm font-normal text-gray-400 ml-2">(Optional)</span></h3>
                                </div>
                                <div className="hidden md:flex items-center text-xs text-gray-500 bg-gray-50 px-3 py-1 rounded-full border border-gray-100">
                                    <UserCheck className="w-3 h-3 mr-1.5" />
                                    Boosts E-E-A-T Score
                                </div>
                            </div>
                            <div className="relative">
                                <textarea
                                    value={authorsVoice}
                                    onChange={(e) => setAuthorsVoice(e.target.value)}
                                    placeholder="Share a personal story, your specific expertise, or a unique perspective to make this content truly yours..."
                                    className="w-full h-24 p-4 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 transition-all resize-none text-base placeholder:text-gray-400"
                                />
                                <PenTool className="absolute top-4 right-4 w-4 h-4 text-gray-300" />
                            </div>
                        </motion.div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Section 3: Platforms */}
                            <motion.div variants={itemVariants} className="space-y-4">
                                <div className="flex items-center space-x-3 mb-2">
                                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">3</div>
                                    <h3 className="text-xl font-semibold text-surface-900">Select Platforms</h3>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                    <AdvancedPlatformSelector selections={platformSelections} onSelectionChange={setPlatformSelections} />
                                </div>
                            </motion.div>

                            {/* Section 4: Fine-tuning */}
                            <motion.div variants={itemVariants} className="space-y-6">
                                <div className="space-y-4">
                                    <div className="flex items-center space-x-3 mb-2">
                                        <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold">4</div>
                                        <h3 className="text-xl font-semibold text-surface-900">Fine-tune</h3>
                                    </div>

                                    <div className="space-y-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-600 mb-2">Tone of Voice</label>
                                            <ToneSelector selectedTone={tone} onToneChange={setTone} />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-600 mb-2">Search Intent Goal</label>
                                            <SearchIntentSelector selectedIntent={searchIntent} onIntentChange={setSearchIntent} />
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </div>

                        {/* Action Button */}
                        <motion.div variants={itemVariants} className="pt-4">
                            <button
                                onClick={handleGenerate}
                                disabled={isLoading || isFindingTrends}
                                className="relative w-full group overflow-hidden rounded-xl p-[2px] focus:outline-none focus:ring-4 focus:ring-brand-primary/30 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <span className="absolute inset-0 bg-gradient-to-r from-brand-primary via-brand-glow to-brand-primary opacity-100 group-hover:opacity-100 animate-gradient-x"></span>
                                <div className="relative flex items-center justify-center w-full bg-white rounded-lg px-8 py-4 transition-all group-hover:bg-opacity-90">
                                    {isLoading ? (
                                        <>
                                            <Spinner />
                                            <span className="ml-3 text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-brand-glow">Crafting Magic...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles className="w-6 h-6 text-brand-primary mr-3 group-hover:rotate-12 transition-transform" />
                                            <span className="text-lg font-bold text-surface-900 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-brand-primary group-hover:to-brand-glow transition-all">
                                                Generate High-Impact Posts
                                            </span>
                                            <ArrowRight className="w-5 h-5 text-gray-400 ml-3 group-hover:translate-x-1 transition-transform" />
                                        </>
                                    )}
                                </div>
                            </button>
                        </motion.div>

                    </div>
                </div>
            </motion.div>

            {/* Trend Results Section */}
            <AnimatePresence>
                {isFindingTrends && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="flex justify-center items-center py-12"
                    >
                        <div className="flex flex-col items-center space-y-4">
                            <Spinner size="lg" />
                            <span className="text-lg text-gray-500 animate-pulse">Scanning the web for real-time insights...</span>
                        </div>
                    </motion.div>
                )}

                {trendResults && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                    >
                        <TrendAnalysisDisplay
                            results={trendResults}
                            onUseTrend={handleUseTrend}
                        />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Generated Results Section */}
            <div id="results-section">
                <AnimatePresence>
                    {generatedContent.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 40 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, type: "spring" }}
                        >
                            <ResultsDisplay
                                results={generatedContent}
                                sourceContent={sourceContent}
                                authorsVoice={authorsVoice}
                                platformSelections={platformSelections}
                                tone={tone}
                                searchIntent={searchIntent}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default GeneratorView;