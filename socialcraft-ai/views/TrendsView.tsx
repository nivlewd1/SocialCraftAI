import React, { useState, useCallback } from 'react';
import { TrendAnalysisResult } from '../types';
import { findTrends } from '../services/geminiService';
import Spinner from '../components/Spinner';
import { TrendingUp, Link as LinkIcon, Lightbulb, Search, ExternalLink } from 'lucide-react';

const TrendsView: React.FC = () => {
    const [sourceContent, setSourceContent] = useState('');
    const [trendResults, setTrendResults] = useState<TrendAnalysisResult | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleFindTrends = useCallback(async () => {
        if (!sourceContent.trim()) {
            setError('Please provide a topic, text, or URL to analyze.');
            return;
        }

        setIsLoading(true);
        setError(null);
        setTrendResults(null);

        try {
            const results = await findTrends(sourceContent);
            setTrendResults(results);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    }, [sourceContent]);

    return (
        <div className="space-y-8">
            <div className="text-center">
                <h1 className="text-4xl md:text-5xl font-extrabold font-display tracking-tight">
                    Real-Time <span className="gradient-text">TrendSpotter</span>
                </h1>
                <p className="mt-4 max-w-2xl mx-auto text-lg text-deep-charcoal">
                    Analyze any topic, URL, or text to uncover current trends and insights from across the web.
                </p>
            </div>

            <div className="max-w-4xl mx-auto glass-card rounded-2xl p-8 space-y-6">
                <textarea
                    value={sourceContent}
                    onChange={(e) => setSourceContent(e.target.value)}
                    placeholder="Enter a topic (e.g., 'AI in marketing'), paste a URL, or some text to analyze for trends..."
                    className="w-full h-32 p-4 rounded-lg transition-all text-deep-charcoal placeholder-deep-charcoal resize-none input-field"
                />
                
                {error && <p className="text-status-error text-sm text-center">{error}</p>}

                <button
                    onClick={handleFindTrends}
                    disabled={isLoading}
                    className="w-full flex items-center justify-center py-3 px-6 rounded-lg shadow-sm text-base font-medium btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isLoading ? (
                        <>
                            <Spinner />
                            <span>Analyzing Web Trends...</span>
                        </>
                    ) : (
                        <>
                           <TrendingUp className="mr-2 h-5 w-5" />
                           <span>Find Trends</span>
                        </>
                    )}
                </button>
            </div>
            
            {trendResults && (
                <div className="max-w-4xl mx-auto mt-8 animate-fade-in space-y-8">
                    {/* Overall Summary Card */}
                    <div className="glass-card rounded-lg p-6">
                         <h3 className="text-xl font-bold font-display text-deep-charcoal mb-2">Overall Summary</h3>
                         <p className="text-deep-charcoal leading-relaxed">{trendResults.overallSummary}</p>
                    </div>

                    {/* Identified Trends */}
                    <div>
                         <h3 className="text-xl font-bold font-display text-deep-charcoal mb-4 flex items-center"><Lightbulb className="mr-2 h-5 w-5 text-terracotta" />Identified Trends</h3>
                         <div className="grid md:grid-cols-2 gap-4">
                            {trendResults.identifiedTrends.map((trend, index) => (
                                <div key={index} className="glass-card rounded-lg p-4">
                                     <h4 className="font-semibold text-deep-charcoal">{trend.trendTitle}</h4>
                                     <p className="text-sm text-deep-charcoal mt-1">{trend.description}</p>
                                </div>
                            ))}
                         </div>
                    </div>

                    {/* Related Keywords & Sources */}
                     <div className="grid md:grid-cols-2 gap-8">
                         <div>
                            <h3 className="text-xl font-bold font-display text-deep-charcoal mb-4 flex items-center"><Search className="mr-2 h-5 w-5 text-soft-blue"/>Related Keywords</h3>
                             <div className="flex flex-wrap gap-2">
                                {trendResults.relatedKeywords.map((keyword, index) => (
                                     <span key={index} className="px-2.5 py-1 text-sm font-medium text-white bg-soft-blue rounded-full">
                                        {keyword}
                                     </span>
                                ))}
                            </div>
                         </div>
                         <div>
                            <h3 className="text-xl font-bold font-display text-deep-charcoal mb-4 flex items-center"><LinkIcon className="mr-2 h-5 w-5 text-sage-green"/>Sources</h3>
                             <ul className="space-y-2">
                                 {trendResults.sources.map((source, index) => (
                                     <li key={index} className="text-sm">
                                         <a href={source.uri} target="_blank" rel="noopener noreferrer" className="text-sage-green hover:underline flex items-center group">
                                             <span className="truncate">{source.title || source.uri}</span>
                                             <ExternalLink size={14} className="ml-1.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                                         </a>
                                     </li>
                                 ))}
                             </ul>
                         </div>
                     </div>
                </div>
            )}
        </div>
    );
};

export default TrendsView;