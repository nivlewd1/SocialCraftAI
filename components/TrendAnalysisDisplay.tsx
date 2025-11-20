import React from 'react';
import { TrendAnalysisResult, Trend } from '../types';
import { TrendingUp, Link as LinkIcon, Lightbulb, Search, ExternalLink, ArrowRight } from 'lucide-react';

interface TrendAnalysisDisplayProps {
    results: TrendAnalysisResult;
    onUseTrend: (trend: Trend) => void;
}

const TrendAnalysisDisplay: React.FC<TrendAnalysisDisplayProps> = ({ results, onUseTrend }) => {
    return (
        <div className="max-w-4xl mx-auto mt-8 animate-fade-in space-y-8 glass-card rounded-lg p-8">
            <div className="text-center border-b pb-4 border-surface-100">
                 <h2 className="text-2xl font-bold font-display text-surface-900 flex items-center justify-center">
                    <TrendingUp className="mr-3 h-7 w-7 text-brand-primary" />
                    Trend Analysis Results
                 </h2>
            </div>
            {/* Overall Summary Card */}
            <div>
                 <h3 className="text-xl font-bold font-display text-surface-900 mb-2">Overall Summary</h3>
                 <p className="text-surface-900 leading-relaxed bg-surface-100/50 p-4 rounded-lg border border-surface-100">{results.overallSummary}</p>
            </div>

            {/* Identified Trends */}
            <div>
                 <h3 className="text-xl font-bold font-display text-surface-900 mb-4 flex items-center"><Lightbulb className="mr-2 h-5 w-5 text-brand-primary" />Identified Trends</h3>
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
                    <h3 className="text-xl font-bold font-display text-surface-900 mb-4 flex items-center"><Search className="mr-2 h-5 w-5 text-soft-blue"/>Related Keywords</h3>
                     <div className="flex flex-wrap gap-2">
                        {results.relatedKeywords.map((keyword, index) => (
                             <span key={index} className="px-2.5 py-1 text-sm font-medium text-white bg-soft-blue rounded-full">
                                {keyword}
                             </span>
                        ))}
                    </div>
                 </div>
                 <div>
                    <h3 className="text-xl font-bold font-display text-surface-900 mb-4 flex items-center"><LinkIcon className="mr-2 h-5 w-5 text-brand-primary"/>Sources</h3>
                     <ul className="space-y-2">
                         {results.sources.map((source) => (
// FIX: Removed duplicate 'key' attribute and used 'source.uri' as the unique key.
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
