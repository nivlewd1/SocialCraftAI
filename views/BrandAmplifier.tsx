import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendReport, GeneratedPost, Platform, BrandPersona } from '../types';
import { generateBrandedContent } from '../services/geminiService';
import { IconZap, IconCopy, IconRefresh } from '../components/ui/Icons';
import { supabase } from '../config/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Calendar, Download, Copy, Check, Save, User, Sliders, FileText, Info, AlertCircle, Search, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

interface BrandAmplifierProps {
    activeReport: TrendReport | null;
    onOpenAuth: () => void;
}

const DEMO_REPORT: TrendReport = {
    id: 'demo-report',
    date: new Date().toLocaleDateString(),
    niche: 'Sustainable Fashion',
    content: `## The Rise of "Quiet Luxury" in Eco-Fashion

**Executive Summary:**
Consumers are shifting away from loud logos and fast fashion towards high-quality, sustainable basics. This trend, often dubbed "Quiet Luxury," emphasizes materials, craftsmanship, and ethical production over conspicuous consumption.

**Key Insights:**
*   **Material Matters:** Surge in search volume for "organic cotton," "hemp," and "recycled wool."
*   **Transparency:** Buyers demand supply chain visibility.
*   **Longevity:** Focus on "capsule wardrobes" and "investment pieces."`,
    sources: [
        { title: 'Vogue Business: Sustainability Report', url: '#' },
        { title: 'The Business of Fashion: Consumer Shifts', url: '#' }
    ]
};

const DEMO_POSTS: GeneratedPost[] = [
    {
        platform: Platform.LinkedIn,
        content: "The most sustainable garment is the one that lasts a lifetime. 🌿\n\nAt [Brand Name], we're embracing the 'Quiet Luxury' movement not as a trend, but as a philosophy. It's about stripping away the excess to focus on what truly matters: exceptional materials, ethical craftsmanship, and timeless design.\n\nWe believe true luxury lies in transparency. Knowing where your clothes come from shouldn't be a privilege—it should be the standard.\n\n#SustainableFashion #QuietLuxury #EthicalBusiness #SlowFashion",
        hashtags: ["#SustainableFashion", "#QuietLuxury", "#EthicalBusiness", "#SlowFashion"],
        imagePrompt: "A minimalist, high-quality photo of a textured organic cotton fabric draped elegantly, soft natural lighting, neutral earth tones, conveying a sense of premium quality and sustainability."
    },
    {
        platform: Platform.Twitter,
        content: "Loud logos are out. Quality is in. ✨\n\nWe're doubling down on 'Quiet Luxury'—focusing on premium, sustainable materials that speak for themselves. \n\nBecause the future of fashion isn't about showing off. It's about showing up for the planet. 🌍\n\n#SustainableFashion #EcoFriendly",
        hashtags: ["#SustainableFashion", "#EcoFriendly"],
        imagePrompt: "Close-up shot of stitching details on a high-quality garment, emphasizing craftsmanship."
    }
];

export const BrandAmplifier: React.FC<BrandAmplifierProps> = ({ activeReport, onOpenAuth }) => {
    const { user } = useAuth();
    const navigate = useNavigate();
    // Initialize from localStorage or use default
    const [persona, setPersona] = useState<BrandPersona>(() => {
        const saved = localStorage.getItem('socialcraft_persona');
        return saved ? JSON.parse(saved) : {
            name: 'Tech Visionary',
            tone: 'Professional, insightful, slightly provocative',
            audience: 'CTOs, Founders, and Developers'
        };
    });

    const [platform, setPlatform] = useState<Platform>(Platform.LinkedIn);
    const [posts, setPosts] = useState<GeneratedPost[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isScheduling, setIsScheduling] = useState(false);
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

    // New state for enhanced functionality
    const [previousReports, setPreviousReports] = useState<TrendReport[]>([]);
    const [isLoadingReports, setIsLoadingReports] = useState(false);
    const [manualTopic, setManualTopic] = useState('');
    const [useManualTopic, setUseManualTopic] = useState(false);

    // Better demo mode detection
    const showDemo = !activeReport && !user;  // Demo only for guests
    const showEmptyState = !activeReport && user && !useManualTopic;  // CTA for authenticated users
    const currentReport = activeReport || (showDemo ? DEMO_REPORT : null);

    // Clear posts when the active trend report changes, or load demo posts
    useEffect(() => {
        if (showDemo) {
            setPosts(DEMO_POSTS);
        } else {
            setPosts([]);
        }
    }, [activeReport, showDemo]);

    // Fetch previous reports for authenticated users
    useEffect(() => {
        const fetchPreviousReports = async () => {
            if (!user) return;

            setIsLoadingReports(true);
            try {
                const { data, error } = await (supabase as any)
                    .from('trend_reports')
                    .select('*')
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: false })
                    .limit(10);

                if (error) throw error;

                const reports: TrendReport[] = (data || []).map((item: any) => ({
                    id: item.id,
                    date: new Date(item.created_at).toLocaleDateString(),
                    niche: item.niche,
                    content: item.content,
                    sources: item.sources || []
                }));

                setPreviousReports(reports);
            } catch (error) {
                console.error('Error fetching previous reports:', error);
            } finally {
                setIsLoadingReports(false);
            }
        };

        fetchPreviousReports();
    }, [user]);

    const handleSavePersona = () => {
        localStorage.setItem('socialcraft_persona', JSON.stringify(persona));
        // Ideally use a toast here
        alert("Brand Persona saved to local storage.");
    };

    // Handler to select a previous report
    const handleSelectReport = (report: TrendReport) => {
        setUseManualTopic(false);
        setManualTopic('');
        // Navigate to amplifier with the selected report in state
        navigate('/amplifier', { state: { report } });
    };

    // Handler for manual topic generation
    const handleGenerateFromTopic = async () => {
        if (!user) {
            onOpenAuth();
            return;
        }
        if (!manualTopic.trim()) return;

        setIsGenerating(true);
        try {
            // Generate content directly from the manual topic
            const topicContext = `Topic: ${manualTopic}\n\nCreate engaging social media content about this topic.`;
            const newPosts = await generateBrandedContent(
                topicContext,
                persona,
                platform
            );
            setPosts(newPosts);
            setUseManualTopic(true);
        } catch (error) {
            console.error(error);
            alert("Failed to generate content. Ensure API Key is valid.");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleGenerate = async () => {
        if (!user) {
            onOpenAuth();
            return;
        }

        // Allow generation if we have a report OR manual topic
        if (!currentReport && !useManualTopic) return;

        setIsGenerating(true);
        try {
            const contextToUse = currentReport?.content || `Topic: ${manualTopic}`;
            const newPosts = await generateBrandedContent(
                contextToUse,
                persona,
                platform
            );
            setPosts(newPosts);
        } catch (error) {
            console.error(error);
            alert("Failed to generate content. Ensure API Key is valid.");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleExport = () => {
        if (posts.length === 0) return;

        const exportText = posts.map((post, index) => {
            return `POST ${index + 1} (${post.platform})
----------------------------------------
CONTENT:
${post.content}

HASHTAGS:
${post.hashtags.join(' ')}

${post.imagePrompt ? `IMAGE PROMPT:
${post.imagePrompt}` : ''}
----------------------------------------
\n`;
        }).join('\n');

        const blob = new Blob([exportText], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `socialcraft-export-${new Date().toISOString().slice(0, 10)}.txt`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const handleScheduleAll = async () => {
        if (!user) {
            onOpenAuth();
            return;
        }
        if (posts.length === 0) return;

        setIsScheduling(true);
        try {
            const scheduledPosts = posts.map(post => ({
                user_id: user.id,
                platform: post.platform.toLowerCase(),
                content: {
                    text: post.content,
                    hashtags: post.hashtags || [],
                    image_prompt: post.imagePrompt || null
                },
                scheduled_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Default to 24h from now
                status: 'scheduled',
                error_message: null,
                posted_at: null
            }));

            const { error } = await (supabase as any)
                .from('scheduled_posts')
                .insert(scheduledPosts);

            if (error) throw error;

            alert("All posts have been scheduled successfully!");
        } catch (error) {
            console.error('Error scheduling posts:', error);
            alert("Failed to schedule posts. Please try again.");
        } finally {
            setIsScheduling(false);
        }
    };

    const copyToClipboard = (text: string, index: number) => {
        navigator.clipboard.writeText(text);
        setCopiedIndex(index);
        setTimeout(() => setCopiedIndex(null), 2000);
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pb-32">
            {/* Configuration Panel */}
            <div className="lg:col-span-4 space-y-6">
                <div className="glass-card p-6 rounded-lg sticky top-24">
                    <div className="flex items-center gap-3 mb-6 border-b border-gray-100 pb-4">
                        <div className="p-2 bg-brand-primary/10 rounded-lg">
                            <IconZap className="w-5 h-5 text-brand-primary" />
                        </div>
                        <h2 className="text-xl font-bold text-surface-900">Brand Amplifier</h2>
                    </div>

                    {/* Demo mode for unauthenticated users */}
                    {showDemo && (
                        <div className="mb-6 p-4 bg-blue-50 border border-blue-100 rounded-xl flex items-start gap-3">
                            <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                            <div>
                                <h4 className="text-sm font-bold text-blue-800">Demo Mode</h4>
                                <p className="text-xs text-blue-600 mt-1">
                                    Viewing example data. <button onClick={onOpenAuth} className="underline font-semibold hover:text-blue-800">Sign in</button> to generate your own content.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Empty state for authenticated users without a report */}
                    {showEmptyState && (
                        <div className="mb-6 space-y-4">
                            {/* Previous Reports Section */}
                            {previousReports.length > 0 && (
                                <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                                    <h4 className="text-sm font-bold text-surface-900 mb-3 flex items-center gap-2">
                                        <FileText className="w-4 h-4 text-brand-primary" />
                                        Your Previous Reports
                                    </h4>
                                    <div className="space-y-2 max-h-32 overflow-y-auto">
                                        {previousReports.map((report) => (
                                            <button
                                                key={report.id}
                                                onClick={() => handleSelectReport(report)}
                                                className="w-full text-left p-3 bg-white border border-gray-200 rounded-lg hover:border-brand-primary hover:bg-brand-primary/5 transition-all flex justify-between items-center group"
                                            >
                                                <div>
                                                    <span className="text-sm font-medium text-surface-900">{report.niche}</span>
                                                    <span className="text-xs text-gray-500 ml-2">{report.date}</span>
                                                </div>
                                                <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-brand-primary transition-colors" />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Manual Topic Input */}
                            <div className="p-4 bg-purple-50 border border-purple-100 rounded-lg">
                                <h4 className="text-sm font-bold text-purple-800 mb-2 flex items-center gap-2">
                                    <Search className="w-4 h-4" />
                                    Quick Generate
                                </h4>
                                <p className="text-xs text-purple-600 mb-3">
                                    Enter a topic to generate content directly, or run the Trend Scout for deeper insights.
                                </p>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={manualTopic}
                                        onChange={(e) => setManualTopic(e.target.value)}
                                        placeholder="e.g., AI productivity tools"
                                        className="flex-1 px-3 py-2 text-sm border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none"
                                    />
                                    <button
                                        onClick={handleGenerateFromTopic}
                                        disabled={!manualTopic.trim() || isGenerating}
                                        className="px-4 py-2 bg-purple-600 text-white text-sm font-bold rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        Generate
                                    </button>
                                </div>
                            </div>

                            {/* Run Trend Scout CTA */}
                            <div className="p-4 bg-amber-50 border border-amber-100 rounded-lg flex items-start gap-3">
                                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                                <div>
                                    <h4 className="text-sm font-bold text-amber-800">No Active Trend Report</h4>
                                    <p className="text-xs text-amber-600 mt-1">
                                        For best results, run the{' '}
                                        <button
                                            onClick={() => window.location.href = '/trends-agent'}
                                            className="underline font-semibold hover:text-amber-800"
                                        >
                                            Trend Scout Agent
                                        </button>
                                        {' '}to discover what's trending in your niche.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="space-y-6">
                        {/* Persona Section */}
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                                    <User className="w-4 h-4 text-brand-primary" />
                                    Brand Persona
                                </label>
                                <button
                                    onClick={handleSavePersona}
                                    className="flex items-center gap-1 text-xs font-medium text-brand-primary hover:text-brand-glow transition-colors"
                                    title="Save to browser storage"
                                >
                                    <Save className="w-3 h-3" />
                                    Save
                                </button>
                            </div>

                            <div className="space-y-3">
                                <input
                                    value={persona.name}
                                    onChange={(e) => setPersona({ ...persona, name: e.target.value })}
                                    className="w-full bg-white border border-gray-200 text-surface-900 p-3 rounded-lg text-sm focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none transition-all placeholder:text-gray-400"
                                    placeholder="Persona Name (e.g., Tech Visionary)"
                                />

                                <input
                                    value={persona.audience}
                                    onChange={(e) => setPersona({ ...persona, audience: e.target.value })}
                                    className="w-full bg-white border border-gray-200 text-surface-900 p-3 rounded-lg text-sm focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none transition-all placeholder:text-gray-400"
                                    placeholder="Target Audience (e.g. CTOs, Gen Z)"
                                />

                                <textarea
                                    value={persona.tone}
                                    onChange={(e) => setPersona({ ...persona, tone: e.target.value })}
                                    className="w-full bg-white border border-gray-200 text-surface-900 p-3 rounded-lg text-sm h-24 resize-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none transition-all placeholder:text-gray-400"
                                    placeholder="Define the tone..."
                                />
                            </div>
                        </div>

                        {/* Platform Section */}
                        <div className="space-y-3">
                            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                                <Sliders className="w-4 h-4 text-brand-primary" />
                                Target Platform
                            </label>
                            <div className="grid grid-cols-2 gap-2">
                                {[Platform.LinkedIn, Platform.Twitter, Platform.Instagram, Platform.TikTok].map(p => (
                                    <button
                                        key={p}
                                        onClick={() => setPlatform(p)}
                                        className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${platform === p
                                            ? 'bg-surface-950 text-white shadow-md transform scale-[1.02]'
                                            : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200'
                                            }`}
                                    >
                                        {p}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Source Material Info */}
                        {(currentReport || useManualTopic) && (
                            <div className="bg-brand-primary/5 p-4 rounded-lg border border-brand-primary/10">
                                <p className="text-xs font-semibold text-brand-primary uppercase tracking-wider mb-1">Active Source</p>
                                <div className="flex items-center gap-2 text-surface-900 font-medium">
                                    <FileText className="w-4 h-4 text-brand-primary" />
                                    <span className="truncate">
                                        {useManualTopic ? `Topic: ${manualTopic}` : `${currentReport?.niche} Briefing`}
                                    </span>
                                </div>
                                {currentReport && !useManualTopic && (
                                    <p className="text-xs text-gray-500 mt-1">{currentReport.date}</p>
                                )}
                            </div>
                        )}

                        <button
                            onClick={handleGenerate}
                            disabled={isGenerating}
                            className="w-full btn-primary py-4 rounded-lg font-bold flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all disabled:opacity-70 disabled:transform-none disabled:cursor-not-allowed"
                        >
                            {isGenerating ? (
                                <>
                                    <IconRefresh className="animate-spin w-5 h-5" /> Amplifying...
                                </>
                            ) : (
                                <>
                                    <IconZap className="w-5 h-5" /> Amplify & Generate
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Results Panel */}
            <div className="lg:col-span-8">
                {posts.length > 0 && (
                    <div className="flex justify-end gap-3 mb-6">
                        <button
                            onClick={handleScheduleAll}
                            disabled={isScheduling}
                            className="flex items-center gap-2 bg-white hover:bg-gray-50 border border-gray-200 text-surface-900 px-5 py-2.5 rounded-lg text-sm font-bold transition-all shadow-sm hover:shadow-md disabled:opacity-50"
                        >
                            {isScheduling ? <IconRefresh className="animate-spin w-4 h-4" /> : <Calendar className="w-4 h-4 text-brand-primary" />}
                            Schedule All
                        </button>
                        <button
                            onClick={handleExport}
                            className="flex items-center gap-2 bg-white hover:bg-gray-50 border border-gray-200 text-surface-900 px-5 py-2.5 rounded-lg text-sm font-bold transition-all shadow-sm hover:shadow-md"
                        >
                            <Download className="w-4 h-4 text-brand-primary" />
                            Export
                        </button>
                    </div>
                )}

                <div className="space-y-6">
                    {posts.length === 0 && !isGenerating ? (
                        <div className="flex flex-col items-center justify-center h-96 text-gray-400 border-2 border-dashed border-gray-200 rounded-lg bg-gray-50/50">
                            <IconZap className="w-12 h-12 mb-4 opacity-20" />
                            <p className="text-lg font-medium">Generated content cards will appear here.</p>
                        </div>
                    ) : (
                        posts.map((post, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className="glass-card rounded-lg p-8 hover:shadow-elevated transition-all duration-300 border border-white/50"
                            >
                                <div className="flex justify-between items-start mb-6">
                                    <span className="bg-surface-950 text-white text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wide">
                                        {post.platform}
                                    </span>
                                    <button
                                        className="flex items-center gap-2 text-gray-500 hover:text-brand-primary px-3 py-1.5 rounded-lg hover:bg-brand-primary/5 transition-all"
                                        onClick={() => copyToClipboard(post.content, idx)}
                                        title="Copy content"
                                    >
                                        {copiedIndex === idx ? (
                                            <>
                                                <Check className="w-4 h-4" />
                                                <span className="text-xs font-bold">Copied!</span>
                                            </>
                                        ) : (
                                            <>
                                                <Copy className="w-4 h-4" />
                                                <span className="text-xs font-bold">Copy</span>
                                            </>
                                        )}
                                    </button>
                                </div>

                                <div className="whitespace-pre-wrap text-surface-900 mb-8 font-sans text-base leading-relaxed">
                                    {post.content}
                                </div>

                                {post.imagePrompt && (
                                    <div className="mb-6 p-4 bg-brand-primary/5 border border-brand-primary/20 rounded-lg">
                                        <span className="flex items-center gap-2 font-bold text-brand-primary text-xs uppercase tracking-wider mb-2">
                                            <IconZap className="w-3 h-3" /> Suggested Image Prompt
                                        </span>
                                        <p className="text-sm text-gray-700 italic">
                                            "{post.imagePrompt}"
                                        </p>
                                    </div>
                                )}

                                <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-100">
                                    {post.hashtags.map((tag, i) => (
                                        <span key={i} className="text-brand-primary text-sm font-medium hover:text-surface-900 cursor-pointer transition-colors">
                                            #{tag.replace('#', '')}
                                        </span>
                                    ))}
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};