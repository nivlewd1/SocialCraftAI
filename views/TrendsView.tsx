import React, { useState, useCallback } from 'react';
import { TrendAnalysisResult } from '../types';
import { findTrends } from '../services/geminiService';
import Spinner from '../components/Spinner';
import { TrendingUp, Link as LinkIcon, Lightbulb, Search, ExternalLink, BarChart2, Activity } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, AreaChart, Area } from 'recharts';
import { schedulerService } from '../services/schedulerService';
import { Platform } from '../types';

const TrendsView: React.FC = () => {
    const [sourceContent, setSourceContent] = useState('');
    const [trendResults, setTrendResults] = useState<TrendAnalysisResult | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedPlatform, setSelectedPlatform] = useState<Platform>(Platform.Twitter);
    const [optimalTimes, setOptimalTimes] = useState<any[]>([]);
    const [historicalData, setHistoricalData] = useState<any[]>([]);

    React.useEffect(() => {
        const times = schedulerService.getOptimalPostingTimes(selectedPlatform);
        setOptimalTimes(times);
        const history = schedulerService.getHistoricalPerformance(selectedPlatform);
        setHistoricalData(history);
    }, [selectedPlatform]);

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
                <p className="mt-4 max-w-2xl mx-auto text-lg text-surface-900">
                    Analyze any topic, URL, or text to uncover current trends and insights from across the web.
                </p>
            </div>

            <div className="max-w-4xl mx-auto glass-card rounded-lg p-8 space-y-6">
                <textarea
                    value={sourceContent}
                    onChange={(e) => setSourceContent(e.target.value)}
                    placeholder="Enter a topic (e.g., 'AI in marketing'), paste a URL, or some text to analyze for trends..."
                    className="w-full h-32 p-4 rounded-lg transition-all text-surface-900 placeholder-surface-700 resize-none input-field"
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

            {/* Best Time to Post Chart */}
            <div className="max-w-4xl mx-auto glass-card rounded-lg p-6">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold font-display text-surface-900 flex items-center">
                        <BarChart2 className="mr-2 h-5 w-5 text-brand-primary" />
                        Best Time to Post
                    </h3>
                    <div className="flex gap-2">
                        {Object.values(Platform).map((p) => (
                            <button
                                key={p}
                                onClick={() => setSelectedPlatform(p)}
                                className={`px-3 py-1 text-xs rounded-full transition-colors ${selectedPlatform === p
                                        ? 'bg-brand-primary text-white'
                                        : 'bg-surface-100 text-surface-600 hover:bg-surface-200'
                                    }`}
                            >
                                {p}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={optimalTimes}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                            <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} />
                            <YAxis hide />
                            <Tooltip
                                cursor={{ fill: '#F3F4F6' }}
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                            />
                            <Bar dataKey="score" radius={[4, 4, 0, 0]}>
                                {optimalTimes.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.score > 90 ? '#8B5CF6' : '#A78BFA'} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-4">
                    {optimalTimes.map((time, i) => (
                        <div key={i} className="text-center p-2 bg-surface-50 rounded-lg">
                            <div className="text-xs text-surface-500">{time.day}</div>
                            <div className="font-bold text-brand-primary">{time.time}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Historical Performance Chart */}
            <div className="max-w-4xl mx-auto glass-card rounded-lg p-6">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold font-display text-surface-900 flex items-center">
                        <Activity className="mr-2 h-5 w-5 text-brand-primary" />
                        Historical Performance
                    </h3>
                </div>
                <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={historicalData}>
                            <defs>
                                <linearGradient id="colorEngagement" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="colorReach" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                            <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} />
                            <YAxis hide />
                            <Tooltip
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                            />
                            <Area type="monotone" dataKey="engagement" stroke="#8B5CF6" fillOpacity={1} fill="url(#colorEngagement)" name="Engagement" />
                            <Area type="monotone" dataKey="reach" stroke="#10B981" fillOpacity={1} fill="url(#colorReach)" name="Reach" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {trendResults && (
                <div className="max-w-4xl mx-auto mt-8 animate-fade-in space-y-8">
                    {/* Overall Summary Card */}
                    <div className="glass-card rounded-lg p-6">
                        <h3 className="text-xl font-bold font-display text-surface-900 mb-2">Overall Summary</h3>
                        <p className="text-surface-900 leading-relaxed">{trendResults.overallSummary}</p>
                    </div>

                    {/* Identified Trends */}
                    <div>
                        <h3 className="text-xl font-bold font-display text-surface-900 mb-4 flex items-center"><Lightbulb className="mr-2 h-5 w-5 text-brand-primary" />Identified Trends</h3>
                        <div className="grid md:grid-cols-2 gap-4">
                            {trendResults.identifiedTrends.map((trend, index) => (
                                <div key={index} className="glass-card rounded-lg p-4">
                                    <h4 className="font-semibold text-surface-900">{trend.trendTitle}</h4>
                                    <p className="text-sm text-surface-900 mt-1">{trend.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Related Keywords & Sources */}
                    <div className="grid md:grid-cols-2 gap-8">
                        <div>
                            <h3 className="text-xl font-bold font-display text-surface-900 mb-4 flex items-center"><Search className="mr-2 h-5 w-5 text-soft-blue" />Related Keywords</h3>
                            <div className="flex flex-wrap gap-2">
                                {trendResults.relatedKeywords.map((keyword, index) => (
                                    <span key={index} className="px-2.5 py-1 text-sm font-medium text-white bg-soft-blue rounded-full">
                                        {keyword}
                                    </span>
                                ))}
                            </div>
                        </div>
                        <div>
                            <h3 className="text-xl font-bold font-display text-surface-900 mb-4 flex items-center"><LinkIcon className="mr-2 h-5 w-5 text-brand-primary" />Sources</h3>
                            <ul className="space-y-2">
                                {trendResults.sources.map((source, index) => (
                                    <li key={index} className="text-sm">
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
            )}
        </div>
    );
};

export default TrendsView;