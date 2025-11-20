import React, { useState, useCallback } from 'react';
import { Platform, GeneratedContent, PlatformSelections, Tone, SearchIntent } from '../types';
import { generateViralContent } from '../services/geminiService';
import AdvancedPlatformSelector from '../components/AdvancedPlatformSelector';
import ToneSelector from '../components/ToneSelector';
import ResultsDisplay from '../components/ResultsDisplay';
import Spinner from '../components/Spinner';
import { BookOpenCheck, UserCheck } from 'lucide-react';
import SearchIntentSelector from '../components/SearchIntentSelector';

const AcademicModeView: React.FC = () => {
    const [sourceContent, setSourceContent] = useState('');
    const [authorsVoice, setAuthorsVoice] = useState('');
    const [platformSelections, setPlatformSelections] = useState<PlatformSelections>({});
    const [tone, setTone] = useState<Tone>('Educational');
    const [searchIntent, setSearchIntent] = useState<SearchIntent>('Informational');
    const [generatedContent, setGeneratedContent] = useState<GeneratedContent[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const handleGenerate = useCallback(async () => {
        if (!sourceContent.trim() || Object.keys(platformSelections).length === 0) {
            window.showNotification('Please provide a paper abstract and select at least one platform.', 'error');
            return;
        }

        setIsLoading(true);
        setGeneratedContent([]);

        try {
            const results = await generateViralContent(sourceContent, platformSelections, 'academic', tone, searchIntent, authorsVoice);
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
                    Academic <span className="gradient-text">Dissemination Mode</span>
                </h1>
                <p className="mt-4 max-w-2xl mx-auto text-lg text-surface-900">
                    Translate dense research papers into accessible social media content. Bridge the gap between academia and the public.
                </p>
            </div>

            <div className="max-w-4xl mx-auto glass-card rounded-lg p-8 space-y-6">
                <div>
                    <label className="block text-sm font-medium text-surface-900 mb-2">1. Your Research Abstract/URL:</label>
                    <textarea
                        value={sourceContent}
                        onChange={(e) => setSourceContent(e.target.value)}
                        placeholder="Paste your arXiv URL or the full abstract of your academic paper here..."
                        className="w-full h-48 p-4 rounded-lg transition-all text-surface-900 placeholder-surface-700 resize-none input-field"
                    />
                </div>

                 <div>
                    <label className="block text-sm font-medium text-surface-900 mb-2 flex items-center">
                        <UserCheck size={14} className="mr-2 text-green-600"/> 2. Researcher's Perspective (Optional):
                    </label>
                     <textarea
                        value={authorsVoice}
                        onChange={(e) => setAuthorsVoice(e.target.value)}
                        placeholder="Add a personal insight, the 'aha!' moment of the discovery, or the real-world implication of this research..."
                        className="w-full h-24 p-4 rounded-lg transition-all text-surface-900 placeholder-surface-700 resize-none input-field"
                    />
                     <p className="text-xs text-surface-900 mt-1">This helps humanize your research and demonstrate first-hand experience (E-E-A-T).</p>
                </div>


                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-surface-900 mb-2">3. Select Platforms & Formats:</label>
                        <AdvancedPlatformSelector selections={platformSelections} onSelectionChange={setPlatformSelections} />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-surface-900 mb-2">4. Select a Tone (Optional):</label>
                        <ToneSelector selectedTone={tone} onToneChange={setTone} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-surface-900 mb-2">5. Optimize for Search Intent (Optional):</label>
                        <SearchIntentSelector selectedIntent={searchIntent} onIntentChange={setSearchIntent} />
                    </div>
                </div>
                
                <button
                    onClick={handleGenerate}
                    disabled={isLoading}
                    className="w-full flex items-center justify-center py-3 px-6 rounded-lg shadow-sm text-base font-medium btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isLoading ? (
                        <>
                            <Spinner />
                            <span>Translating Research...</span>
                        </>
                    ) : (
                       <>
                           <BookOpenCheck className="mr-2 h-5 w-5" />
                           <span>Analyze & Generate Posts</span>
                       </>
                    )}
                </button>
            </div>
            
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

export default AcademicModeView;