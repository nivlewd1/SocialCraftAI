import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Platform, GeneratedContent, PlatformSelections, Tone, SearchIntent } from '../types';
import { generateViralContent } from '../services/geminiService';
import AdvancedPlatformSelector from '../components/AdvancedPlatformSelector';
import ToneSelector from '../components/ToneSelector';
import ResultsDisplay from '../components/ResultsDisplay';
import Spinner from '../components/Spinner';
import { BookOpenCheck, UserCheck } from 'lucide-react';
import SearchIntentSelector from '../components/SearchIntentSelector';
import { useAuth } from '../contexts/AuthContext';
import { useSubscription } from '../contexts/SubscriptionContext';
import { CreditBadge } from '../components/WatermarkOverlay';

declare global {
    interface Window {
        showNotification: (message: string, type: 'success' | 'error' | 'info') => void;
    }
}

interface AcademicModeViewProps {
    onOpenAuth: () => void;
}

const AcademicModeView: React.FC<AcademicModeViewProps> = ({ onOpenAuth }) => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { subscription, canGenerateType, deductCredits } = useSubscription();

    const [sourceContent, setSourceContent] = useState('');
    const [authorsVoice, setAuthorsVoice] = useState('');
    const [platformSelections, setPlatformSelections] = useState<PlatformSelections>({
        twitter: true,
        linkedin: true,
        instagram: false,
        tiktok: false,
        pinterest: false,
    });
    const [tone, setTone] = useState<Tone>('professional');
    const [searchIntent, setSearchIntent] = useState<SearchIntent>('informational');
    const [isGenerating, setIsGenerating] = useState(false);
    const [results, setResults] = useState<GeneratedContent | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [creditError, setCreditError] = useState<string | null>(null);

    const handleGenerate = async () => {
        if (!user) {
            onOpenAuth();
            return;
        }

        if (!sourceContent.trim()) {
            setError('Please enter some academic content to transform.');
            return;
        }

        // Check if user can afford text generation
        if (!canGenerateType('text')) {
            if (confirm('Insufficient credits for text generation. Would you like to view pricing plans?')) {
                navigate('/pricing');
            } else {
                setCreditError('Insufficient credits for text generation. Please top up your credits.');
            }
            return;
        }

        setIsGenerating(true);
        setError(null);
        setCreditError(null);
        setResults(null);

        try {
            // Deduct credits before generation
            const deductResult = await deductCredits('text');
            if (!deductResult.success) {
                setCreditError(deductResult.error || 'Failed to deduct credits');
                setIsGenerating(false);
                return;
            }

            const selectedPlatforms = Object.entries(platformSelections)
                .filter(([_, isSelected]) => isSelected)
                .map(([platform]) => platform as Platform);

            if (selectedPlatforms.length === 0) {
                setError('Please select at least one platform.');
                setIsGenerating(false);
                return;
            }

            const generatedContent = await generateViralContent(
                sourceContent,
                selectedPlatforms,
                tone,
                authorsVoice,
                searchIntent
            );

            setResults(generatedContent);
            if (window.showNotification) {
                window.showNotification('Content generated successfully!', 'success');
            }
        } catch (err) {
            console.error("Generation error:", err);
            setError(err instanceof Error ? err.message : 'An error occurred while generating content.');
            if (window.showNotification) {
                window.showNotification('Failed to generate content.', 'error');
            }
        } finally {
            setIsGenerating(false);
        }
    };

    const handlePlatformChange = useCallback((platform: Platform) => {
        setPlatformSelections(prev => ({
            ...prev,
            [platform]: !prev[platform]
        }));
    }, []);

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
            <div className="text-center space-y-4">
                <div className="inline-flex items-center justify-center p-3 bg-brand-primary/10 rounded-full mb-4">
                    <BookOpenCheck className="w-8 h-8 text-brand-primary" />
                </div>
                <h1 className="text-4xl md:text-5xl font-extrabold font-display tracking-tight text-surface-900">
                    Academic <span className="gradient-text">Mode</span>
                </h1>
                <p className="text-xl text-surface-600 max-w-2xl mx-auto">
                    Transform complex academic papers, research, and technical documents into engaging social media content.
                </p>
            </div>

            <div className="glass-card p-8 rounded-2xl shadow-xl border border-white/20">
                <div className="space-y-8">
                    {/* Input Section */}
                    <div className="space-y-4">
                        <label className="block text-sm font-medium text-surface-700">
                            Academic Content / Abstract
                        </label>
                        <textarea
                            value={sourceContent}
                            onChange={(e) => setSourceContent(e.target.value)}
                            placeholder="Paste your abstract, research summary, or technical paper here..."
                            className="w-full h-48 p-4 rounded-xl border border-surface-200 bg-surface-50 focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all resize-none text-surface-800 placeholder:text-surface-400"
                        />
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="space-y-6">
                            <AdvancedPlatformSelector
                                selections={platformSelections}
                                onToggle={handlePlatformChange}
                            />
                            <SearchIntentSelector
                                value={searchIntent}
                                onChange={setSearchIntent}
                            />
                        </div>
                        <div className="space-y-6">
                            <ToneSelector
                                value={tone}
                                onChange={setTone}
                            />
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-surface-700">
                                    Author's Voice (Optional)
                                </label>
                                <div className="relative">
                                    <UserCheck className="absolute left-3 top-3 w-5 h-5 text-surface-400" />
                                    <input
                                        type="text"
                                        value={authorsVoice}
                                        onChange={(e) => setAuthorsVoice(e.target.value)}
                                        placeholder="e.g., Prof. Feynman, Carl Sagan..."
                                        className="w-full pl-10 p-3 rounded-xl border border-surface-200 bg-surface-50 focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {error && (
                        <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm font-medium text-center animate-shake">
                            {error}
                        </div>
                    )}

                    {creditError && (
                        <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm font-medium text-center animate-shake">
                            {creditError}
                            <button
                                onClick={() => navigate('/pricing')}
                                className="ml-2 underline hover:text-red-800"
                            >
                                View Pricing
                            </button>
                        </div>
                    )}

                    {/* Credit cost and balance */}
                    <div className="flex items-center justify-between py-2 border-t border-gray-200">
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-500">Credit cost:</span>
                            <CreditBadge type="text" />
                        </div>
                        {subscription && (
                            <span className="text-sm text-gray-500">
                                Balance: {subscription.totalCredits.toLocaleString()} credits
                            </span>
                        )}
                    </div>

                    <button
                        onClick={handleGenerate}
                        disabled={isGenerating || !sourceContent.trim()}
                        className={`
                            w-full py-4 px-6 rounded-xl text-white font-bold text-lg shadow-lg
                            transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]
                            ${isGenerating || !sourceContent.trim()
                                ? 'bg-surface-300 cursor-not-allowed'
                                : 'bg-gradient-to-r from-brand-primary to-brand-secondary hover:shadow-brand-primary/25'
                            }
                        `}
                    >
                        {isGenerating ? (
                            <span className="flex items-center justify-center gap-2">
                                <Spinner className="w-6 h-6 text-white" />
                                Analyzing Research...
                            </span>
                        ) : (
                            'Generate Social Content'
                        )}
                    </button>
                </div>
            </div>

            {results && (
                <ResultsDisplay
                    results={results}
                    sourceContent={sourceContent}
                    authorsVoice={authorsVoice}
                    platformSelections={platformSelections}
                    tone={tone}
                    searchIntent={searchIntent}
                    onContentUpdate={(updatedContent) => setResults(updatedContent)}
                />
            )}
        </div>
    );
};

export default AcademicModeView;