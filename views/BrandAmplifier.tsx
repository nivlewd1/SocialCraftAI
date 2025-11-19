import React, { useState, useEffect } from 'react';
import { TrendReport, GeneratedPost, Platform, BrandPersona } from '../types';
import { generateBrandedContent } from '../services/geminiService';
import { IconZap, IconCopy, IconRefresh } from '../components/ui/Icons';
import { supabase } from '../config/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Calendar, Download, Copy, Check, Save, User, Sliders, FileText, Info } from 'lucide-react';
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

    // Determine if we are in demo mode
    const isDemoMode = !activeReport;
    const currentReport = activeReport || DEMO_REPORT;

    // Clear posts when the active trend report changes, or load demo posts
    useEffect(() => {
        if (isDemoMode) {
            setPosts(DEMO_POSTS);
        } else {
            setPosts([]);
        }
    }, [activeReport, isDemoMode]);

    const handleSavePersona = () => {
        localStorage.setItem('socialcraft_persona', JSON.stringify(persona));
        // Ideally use a toast here
        alert("Brand Persona saved to local storage.");
    };

    const handleGenerate = async () => {
        if (!user) {
            onOpenAuth();
            return;
        }
        if (!currentReport) return;
        setIsGenerating(true);
        try {
            const newPosts = await generateBrandedContent(
                currentReport.content,
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
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full pb-20">
            {/* Configuration Panel */}
            <div className="lg:col-span-4 space-y-6">
                <div className="glass-card p-6 rounded-2xl sticky top-24">
                    <div className="flex items-center gap-3 mb-6 border-b border-gray-100 pb-4">
                        <div className="p-2 bg-terracotta/10 rounded-lg">
                            <IconZap className="w-5 h-5 text-terracotta" />
                        </div>
                        <h2 className="text-xl font-bold text-deep-charcoal">Brand Amplifier</h2>
                    </div>

                    {isDemoMode && (
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

                    <div className="space-y-6">
                        {/* Persona Section */}
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                                    <User className="w-4 h-4 text-sage-green" />
                                    Brand Persona
                                </label>
                                <button
                                    onClick={handleSavePersona}
                                    className="flex items-center gap-1 text-xs font-medium text-sage-green hover:text-terracotta transition-colors"
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
                                    className="w-full bg-white border border-gray-200 text-deep-charcoal p-3 rounded-xl text-sm focus:ring-2 focus:ring-sage-green/20 focus:border-sage-green outline-none transition-all placeholder:text-gray-400"
                                    placeholder="Persona Name (e.g., Tech Visionary)"
                                />

                                <input
                                    value={persona.audience}
                                    onChange={(e) => setPersona({ ...persona, audience: e.target.value })}
                                    className="w-full bg-white border border-gray-200 text-deep-charcoal p-3 rounded-xl text-sm focus:ring-2 focus:ring-sage-green/20 focus:border-sage-green outline-none transition-all placeholder:text-gray-400"
                                    placeholder="Target Audience (e.g. CTOs, Gen Z)"
                                />

                                <textarea
                                    value={persona.tone}
                                    onChange={(e) => setPersona({ ...persona, tone: e.target.value })}
                                    className="w-full bg-white border border-gray-200 text-deep-charcoal p-3 rounded-xl text-sm h-24 resize-none focus:ring-2 focus:ring-sage-green/20 focus:border-sage-green outline-none transition-all placeholder:text-gray-400"
                                    placeholder="Define the tone..."
                                />
                            </div>
                        </div>

                        {/* Platform Section */}
                        <div className="space-y-3">
                            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                                <Sliders className="w-4 h-4 text-sage-green" />
                                Target Platform
                            </label>
                            <div className="grid grid-cols-2 gap-2">
                                {[Platform.LinkedIn, Platform.Twitter, Platform.Instagram, Platform.TikTok].map(p => (
                                    <button
                                        key={p}
                                        onClick={() => setPlatform(p)}
                                        className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${platform === p
                                            ? 'bg-deep-charcoal text-white shadow-md transform scale-[1.02]'
                                            : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200'
                                            }`}
                                    >
                                        {p}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Source Material Info */}
                        <div className="bg-sage-green/5 p-4 rounded-xl border border-sage-green/10">
                            <p className="text-xs font-semibold text-sage-green uppercase tracking-wider mb-1">Active Source</p>
                            <div className="flex items-center gap-2 text-deep-charcoal font-medium">
                                <FileText className="w-4 h-4 text-terracotta" />
                                <span className="truncate">{currentReport.niche} Briefing</span>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">{currentReport.date}</p>
                        </div>

                        <button
                            onClick={handleGenerate}
                            disabled={isGenerating}
                            className="w-full btn-primary py-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all disabled:opacity-70 disabled:transform-none disabled:cursor-not-allowed"
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
                            className="flex items-center gap-2 bg-white hover:bg-gray-50 border border-gray-200 text-deep-charcoal px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm hover:shadow-md disabled:opacity-50"
                        >
                            {isScheduling ? <IconRefresh className="animate-spin w-4 h-4" /> : <Calendar className="w-4 h-4 text-sage-green" />}
                            Schedule All
                        </button>
                        <button
                            onClick={handleExport}
                            className="flex items-center gap-2 bg-white hover:bg-gray-50 border border-gray-200 text-deep-charcoal px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm hover:shadow-md"
                        >
                            <Download className="w-4 h-4 text-terracotta" />
                            Export
                        </button>
                    </div>
                )}

                <div className="space-y-6">
                    {posts.length === 0 && !isGenerating ? (
                        <div className="flex flex-col items-center justify-center h-96 text-gray-400 border-2 border-dashed border-gray-200 rounded-3xl bg-gray-50/50">
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
                                className="glass-card rounded-2xl p-8 hover:shadow-elevated transition-all duration-300 border border-white/50"
                            >
                                <div className="flex justify-between items-start mb-6">
                                    <span className="bg-deep-charcoal text-white text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wide">
                                        {post.platform}
                                    </span>
                                    <button
                                        className="flex items-center gap-2 text-gray-500 hover:text-sage-green px-3 py-1.5 rounded-lg hover:bg-sage-green/5 transition-all"
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

                                <div className="whitespace-pre-wrap text-deep-charcoal mb-8 font-sans text-base leading-relaxed">
                                    {post.content}
                                </div>

                                {post.imagePrompt && (
                                    <div className="mb-6 p-4 bg-terracotta/5 border border-terracotta/20 rounded-xl">
                                        <span className="flex items-center gap-2 font-bold text-terracotta text-xs uppercase tracking-wider mb-2">
                                            <IconZap className="w-3 h-3" /> Suggested Image Prompt
                                        </span>
                                        <p className="text-sm text-gray-700 italic">
                                            "{post.imagePrompt}"
                                        </p>
                                    </div>
                                )}

                                <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-100">
                                    {post.hashtags.map((tag, i) => (
                                        <span key={i} className="text-sage-green text-sm font-medium hover:text-deep-charcoal cursor-pointer transition-colors">
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