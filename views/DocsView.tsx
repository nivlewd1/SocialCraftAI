import React, { useState } from 'react';
import { Book, Search, ChevronRight, Home, Zap, Layers, HelpCircle, DollarSign, TrendingUp, Layout, Share2, ShieldCheck, Image, GraduationCap, Calendar, RefreshCw, BarChart3, Link2, Clock, AlertTriangle, Wrench } from 'lucide-react';

type DocSection = 'getting-started' | 'features' | 'agentic-trends' | 'brand-amplifier' | 'media-studio' | 'academic-mode' | 'scheduling' | 'recurring-posts' | 'publishing' | 'connected-accounts' | 'analytics' | 'platforms' | 'billing' | 'security' | 'troubleshooting' | 'faq';

const DocsView: React.FC = () => {
    const [activeSection, setActiveSection] = useState<DocSection>('getting-started');
    const [searchTerm, setSearchTerm] = useState('');

    const sections = [
        { id: 'getting-started' as DocSection, title: 'Getting Started', icon: Home },
        { id: 'features' as DocSection, title: 'Core Features', icon: Zap },
        { id: 'agentic-trends' as DocSection, title: 'Trend Scout Agent', icon: TrendingUp },
        { id: 'brand-amplifier' as DocSection, title: 'Brand Amplifier', icon: Layout },
        { id: 'media-studio' as DocSection, title: 'Media Studio', icon: Image },
        { id: 'academic-mode' as DocSection, title: 'Academic Mode', icon: GraduationCap },
        { id: 'scheduling' as DocSection, title: 'Content Scheduler', icon: Calendar },
        { id: 'recurring-posts' as DocSection, title: 'Recurring Posts', icon: RefreshCw },
        { id: 'publishing' as DocSection, title: 'Publishing Engine', icon: Share2 },
        { id: 'connected-accounts' as DocSection, title: 'Connected Accounts', icon: Link2 },
        { id: 'analytics' as DocSection, title: 'Analytics', icon: BarChart3 },
        { id: 'platforms' as DocSection, title: 'Platform Guides', icon: Layers },
        { id: 'security' as DocSection, title: 'Security', icon: ShieldCheck },
        { id: 'billing' as DocSection, title: 'Billing & Plans', icon: DollarSign },
        { id: 'troubleshooting' as DocSection, title: 'Troubleshooting', icon: Wrench },
        { id: 'faq' as DocSection, title: 'FAQ', icon: HelpCircle },
    ];

    const filteredSections = sections.filter(section =>
        section.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="flex flex-col lg:flex-row gap-8 max-w-7xl mx-auto">
            {/* Sidebar */}
            <div className="lg:w-72 flex-shrink-0">
                <div className="glass-card rounded-xl p-6 sticky top-24 space-y-6">
                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search docs..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 rounded-lg input-field text-sm"
                        />
                    </div>

                    {/* Navigation */}
                    <nav className="space-y-1 max-h-[60vh] overflow-y-auto">
                        {filteredSections.map((section) => {
                            const Icon = section.icon;
                            return (
                                <button
                                    key={section.id}
                                    onClick={() => setActiveSection(section.id)}
                                    className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-left transition-all duration-200 ${activeSection === section.id
                                            ? 'bg-brand-primary text-white shadow-md'
                                            : 'text-surface-900 hover:bg-surface-100'
                                        }`}
                                >
                                    <div className="flex items-center space-x-3">
                                        <Icon className="h-5 w-5" />
                                        <span className="font-medium text-sm">{section.title}</span>
                                    </div>
                                    {activeSection === section.id && <ChevronRight className="h-4 w-4" />}
                                </button>
                            );
                        })}
                    </nav>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
                <div className="glass-card rounded-lg p-8 md:p-12 min-h-[80vh]">
                    {activeSection === 'getting-started' && <GettingStartedDocs />}
                    {activeSection === 'features' && <FeaturesDocs />}
                    {activeSection === 'agentic-trends' && <AgenticTrendsDocs />}
                    {activeSection === 'brand-amplifier' && <BrandAmplifierDocs />}
                    {activeSection === 'media-studio' && <MediaStudioDocs />}
                    {activeSection === 'academic-mode' && <AcademicModeDocs />}
                    {activeSection === 'scheduling' && <SchedulingDocs />}
                    {activeSection === 'recurring-posts' && <RecurringPostsDocs />}
                    {activeSection === 'publishing' && <PublishingDocs />}
                    {activeSection === 'connected-accounts' && <ConnectedAccountsDocs />}
                    {activeSection === 'analytics' && <AnalyticsDocs />}
                    {activeSection === 'platforms' && <PlatformsDocs />}
                    {activeSection === 'security' && <SecurityDocs />}
                    {activeSection === 'billing' && <BillingDocs />}
                    {activeSection === 'troubleshooting' && <TroubleshootingDocs />}
                    {activeSection === 'faq' && <FAQDocs />}
                </div>
            </div>
        </div>
    );
};

// Sub-components for each section
const GettingStartedDocs = () => (
    <div className="space-y-8 animate-fade-in">
        <div>
            <h1 className="text-4xl font-bold font-display text-surface-900 mb-4">Getting Started</h1>
            <p className="text-xl text-gray-600 leading-relaxed">
                Welcome to SocialCraft AI. Your journey to effortless, algorithm-optimized content creation begins here.
            </p>
        </div>

        <section className="space-y-8">
            <div className="border-b border-gray-200 pb-4">
                <h2 className="text-2xl font-bold text-surface-900 mb-4">Quick Start Guide</h2>
            </div>

            <div className="grid gap-6">
                <StepCard
                    number={1}
                    title="Create Your Account"
                    description="Sign up using your email or connect instantly with Google or GitHub. Your 14-day free trial of the Pro plan starts automatically—no credit card required."
                />
                <StepCard
                    number={2}
                    title="Connect Your Social Accounts"
                    description="Navigate to Settings and connect your Twitter, LinkedIn, Instagram, TikTok, and Pinterest accounts. This enables automatic posting and analytics tracking."
                />
                <StepCard
                    number={3}
                    title="Define Your Brand Persona"
                    description="Navigate to the Brand Amplifier to set up your unique brand voice. Upload a sample of your writing or describe your style, and our AI will learn to write exactly like you."
                />
                <StepCard
                    number={4}
                    title="Discover Trends"
                    description="Use the Trend Scout Agent to find real-time, high-engagement topics in your niche. The AI analyzes live web data to identify what's viral right now."
                />
                <StepCard
                    number={5}
                    title="Generate & Schedule"
                    description="Turn trends into posts with one click. Review the generated content, make any tweaks, and schedule it to publish automatically to all your connected platforms."
                />
                <StepCard
                    number={6}
                    title="Set Up Recurring Posts"
                    description="For consistent posting, set up recurring schedules like 'Every Monday at 9 AM' or 'Daily at 2 PM'. The system will automatically generate and publish posts on your schedule."
                />
            </div>
        </section>

        <section className="space-y-4">
            <h2 className="text-2xl font-bold text-surface-900">Video Walkthrough</h2>
            <div className="bg-gray-100 rounded-xl aspect-video flex items-center justify-center">
                <p className="text-gray-500">Video tutorial coming soon</p>
            </div>
        </section>
    </div>
);

const StepCard = ({ number, title, description }: { number: number, title: string, description: string }) => (
    <div className="flex items-start p-6 bg-white/50 rounded-xl border border-white/40 shadow-sm hover:shadow-md transition-all">
        <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-gradient-to-br from-brand-primary to-brand-glow text-white rounded-full font-bold text-lg shadow-sm">
            {number}
        </div>
        <div className="ml-6">
            <h3 className="text-xl font-bold text-surface-900 mb-2">{title}</h3>
            <p className="text-gray-700 leading-relaxed">{description}</p>
        </div>
    </div>
);

const FeaturesDocs = () => (
    <div className="space-y-12 animate-fade-in">
        <div>
            <h1 className="text-4xl font-bold font-display text-surface-900 mb-4">Core Features</h1>
            <p className="text-xl text-gray-600">A detailed walkthrough of SocialCraft AI's powerful toolset.</p>
        </div>

        <section className="space-y-8">
            <h2 className="text-2xl font-bold text-surface-900 border-b border-brand-primary/30 pb-2">The Content Generator</h2>
            <p className="text-gray-700 text-lg">
                The Content Generator is the heart of SocialCraft AI. It transforms ideas, URLs, or documents into optimized social media posts.
            </p>

            <div className="grid md:grid-cols-2 gap-6">
                <FeatureHighlight
                    title="Multi-Platform Support"
                    description="Generate content for Twitter, LinkedIn, Instagram, TikTok, and Pinterest simultaneously, with each post optimized for the specific platform's algorithm."
                />
                <FeatureHighlight
                    title="Tone & Voice Control"
                    description="Select from predefined tones (Professional, Funny, Urgent) or use your custom Brand Persona to ensure consistency."
                />
                <FeatureHighlight
                    title="Search Intent Optimization"
                    description="Automatically aligns content with user intent (Informational, Transactional) to maximize SEO value and engagement."
                />
                <FeatureHighlight
                    title="Originality Review"
                    description="Built-in checklist to ensure your content adds unique value and isn't just generic AI output."
                />
            </div>
        </section>

        <section className="space-y-8">
            <h2 className="text-2xl font-bold text-surface-900 border-b border-brand-primary/30 pb-2">Feature Overview</h2>
            <div className="grid gap-4">
                <FeatureRow icon={<TrendingUp className="h-5 w-5" />} title="Trend Scout Agent" description="AI-powered trend discovery with real-time web analysis" />
                <FeatureRow icon={<Layout className="h-5 w-5" />} title="Brand Amplifier" description="Maintain consistent brand voice across all platforms" />
                <FeatureRow icon={<Image className="h-5 w-5" />} title="Media Studio" description="Generate images and videos with AI (Imagen & Veo)" />
                <FeatureRow icon={<GraduationCap className="h-5 w-5" />} title="Academic Mode" description="Translate complex research into accessible content" />
                <FeatureRow icon={<Calendar className="h-5 w-5" />} title="Content Scheduler" description="Schedule posts for optimal engagement times" />
                <FeatureRow icon={<RefreshCw className="h-5 w-5" />} title="Recurring Posts" description="Set up automatic posting frequencies (daily, weekly, monthly)" />
                <FeatureRow icon={<BarChart3 className="h-5 w-5" />} title="Analytics Dashboard" description="Track engagement metrics across all platforms" />
            </div>
        </section>
    </div>
);

const FeatureRow = ({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) => (
    <div className="flex items-center p-4 bg-white rounded-lg border border-gray-100 hover:shadow-sm transition-all">
        <div className="flex-shrink-0 w-10 h-10 bg-brand-primary/10 rounded-lg flex items-center justify-center text-brand-primary">
            {icon}
        </div>
        <div className="ml-4">
            <h3 className="font-bold text-surface-900">{title}</h3>
            <p className="text-sm text-gray-600">{description}</p>
        </div>
    </div>
);

const AgenticTrendsDocs = () => (
    <div className="space-y-12 animate-fade-in">
        <div>
            <h1 className="text-4xl font-bold font-display text-surface-900 mb-4">Trend Scout Agent</h1>
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-brand-primary/10 text-brand-primary text-sm font-medium mb-4">
                <Zap className="w-4 h-4 mr-2" /> AI-Powered Feature
            </div>
            <p className="text-xl text-gray-600">
                Your autonomous research assistant that finds viral opportunities before they peak.
            </p>
        </div>

        <section className="space-y-6">
            <h2 className="text-2xl font-bold text-surface-900">How It Works</h2>
            <p className="text-gray-700 leading-relaxed">
                The Trend Scout Agent uses advanced Google Search Grounding to scan the live web for emerging topics, news, and discussions in your specific niche. It doesn't just search; it analyzes sentiment, engagement potential, and relevance to your brand.
            </p>

            <div className="bg-white/60 rounded-xl p-6 border border-brand-primary/20">
                <h3 className="font-bold text-lg mb-4">Workflow</h3>
                <ol className="list-decimal list-inside space-y-3 text-gray-700">
                    <li><strong>Input Niche:</strong> Enter your industry or topic (e.g., "SaaS Marketing", "Sustainable Fashion").</li>
                    <li><strong>Agent Analysis:</strong> The agent scans news sites, forums, and social signals.</li>
                    <li><strong>Report Generation:</strong> You receive a comprehensive Trend Report with 3-5 high-potential topics.</li>
                    <li><strong>Actionable Insights:</strong> Each trend comes with a "Why it matters" analysis and a "Content Angle" suggestion.</li>
                    <li><strong>One-Click Generation:</strong> Turn any trend into a full post with a single click.</li>
                </ol>
            </div>
        </section>

        <section className="space-y-6">
            <h2 className="text-2xl font-bold text-surface-900">Best Practices</h2>
            <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <h4 className="font-bold text-green-800 mb-2">Do</h4>
                    <ul className="text-sm text-green-700 space-y-1">
                        <li>• Be specific with your niche</li>
                        <li>• Run daily for best results</li>
                        <li>• Act quickly on trending topics</li>
                    </ul>
                </div>
                <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                    <h4 className="font-bold text-red-800 mb-2">Don't</h4>
                    <ul className="text-sm text-red-700 space-y-1">
                        <li>• Use overly broad topics</li>
                        <li>• Ignore the "Why it matters" context</li>
                        <li>• Wait too long to post on trends</li>
                    </ul>
                </div>
            </div>
        </section>
    </div>
);

const BrandAmplifierDocs = () => (
    <div className="space-y-12 animate-fade-in">
        <div>
            <h1 className="text-4xl font-bold font-display text-surface-900 mb-4">Brand Amplifier</h1>
            <p className="text-xl text-gray-600">
                Scale your presence without losing your soul. The Brand Amplifier combines your unique voice with trending topics.
            </p>
        </div>

        <section className="space-y-6">
            <h2 className="text-2xl font-bold text-surface-900">Brand Personas</h2>
            <p className="text-gray-700">
                Stop sounding like a robot. Brand Personas allow you to define exactly how the AI should write.
            </p>
            <ul className="grid gap-4 md:grid-cols-2">
                <li className="p-4 bg-white rounded-lg shadow-sm border border-gray-100">
                    <strong className="block text-brand-primary mb-1">Voice Analysis</strong>
                    Upload sample posts, and the AI analyzes your sentence structure, vocabulary, and tone.
                </li>
                <li className="p-4 bg-white rounded-lg shadow-sm border border-gray-100">
                    <strong className="block text-brand-primary mb-1">Multiple Personas</strong>
                    Create different personas for different channels (e.g., "Professional CEO" for LinkedIn, "Casual Behind-the-Scenes" for Twitter).
                </li>
                <li className="p-4 bg-white rounded-lg shadow-sm border border-gray-100">
                    <strong className="block text-brand-primary mb-1">Industry Templates</strong>
                    Start with pre-built personas for common industries and customize from there.
                </li>
                <li className="p-4 bg-white rounded-lg shadow-sm border border-gray-100">
                    <strong className="block text-brand-primary mb-1">Tone Presets</strong>
                    Quick-select tones like Professional, Friendly, Witty, or Inspirational.
                </li>
            </ul>
        </section>

        <section className="space-y-6">
            <h2 className="text-2xl font-bold text-surface-900">Campaign Generation</h2>
            <p className="text-gray-700">
                The Amplifier takes a Trend Report and your Brand Persona to generate a full week's worth of content in seconds.
            </p>
            <div className="p-4 bg-brand-glow/10 rounded-lg border border-brand-glow/20">
                <h4 className="font-bold text-brand-primary mb-2">Pro Tip: The "Schedule All" Button</h4>
                <p className="text-sm text-surface-900">
                    Once you've reviewed the generated campaign, hit "Schedule All" to automatically queue every post to your content calendar. The Publishing Engine handles the rest.
                </p>
            </div>
        </section>
    </div>
);

const MediaStudioDocs = () => (
    <div className="space-y-12 animate-fade-in">
        <div>
            <h1 className="text-4xl font-bold font-display text-surface-900 mb-4">Media Studio</h1>
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-sm font-medium mb-4">
                <Image className="w-4 h-4 mr-2" /> AI-Generated Media
            </div>
            <p className="text-xl text-gray-600">
                Create stunning visuals and videos with Google's latest AI models.
            </p>
        </div>

        <section className="space-y-6">
            <h2 className="text-2xl font-bold text-surface-900">Image Generation (Imagen)</h2>
            <p className="text-gray-700">
                Generate high-quality images from text descriptions using Google's Imagen 4.0 model.
            </p>
            <div className="grid md:grid-cols-2 gap-6">
                <div className="p-6 bg-white rounded-xl shadow-sm">
                    <h3 className="font-bold mb-3">Supported Styles</h3>
                    <ul className="space-y-2 text-sm text-gray-700">
                        <li>• Photorealistic images</li>
                        <li>• Illustrations and artwork</li>
                        <li>• Product mockups</li>
                        <li>• Social media graphics</li>
                        <li>• Infographic elements</li>
                    </ul>
                </div>
                <div className="p-6 bg-white rounded-xl shadow-sm">
                    <h3 className="font-bold mb-3">Best Practices</h3>
                    <ul className="space-y-2 text-sm text-gray-700">
                        <li>• Be specific in your descriptions</li>
                        <li>• Include style references (e.g., "minimalist")</li>
                        <li>• Specify aspect ratios for platforms</li>
                        <li>• Use negative prompts to exclude elements</li>
                    </ul>
                </div>
            </div>
        </section>

        <section className="space-y-6">
            <h2 className="text-2xl font-bold text-surface-900">Video Generation (Veo)</h2>
            <p className="text-gray-700">
                Create short-form videos from text prompts using Google's Veo model.
            </p>
            <div className="bg-white/60 rounded-xl p-6 border border-purple-200">
                <h3 className="font-bold text-lg mb-4">Video Types</h3>
                <div className="grid gap-4 md:grid-cols-3">
                    <div className="text-center p-4">
                        <div className="text-3xl mb-2">🎬</div>
                        <h4 className="font-medium">Product Demos</h4>
                        <p className="text-xs text-gray-500">Showcase features</p>
                    </div>
                    <div className="text-center p-4">
                        <div className="text-3xl mb-2">📱</div>
                        <h4 className="font-medium">Social Clips</h4>
                        <p className="text-xs text-gray-500">TikTok & Reels</p>
                    </div>
                    <div className="text-center p-4">
                        <div className="text-3xl mb-2">💡</div>
                        <h4 className="font-medium">Explainers</h4>
                        <p className="text-xs text-gray-500">Educational content</p>
                    </div>
                </div>
            </div>
        </section>

        <section className="space-y-6">
            <h2 className="text-2xl font-bold text-surface-900">Media Library</h2>
            <p className="text-gray-700">
                All generated media is automatically saved to your Media Library for easy reuse.
            </p>
            <ul className="space-y-2 text-gray-700">
                <li>• <strong>Organize:</strong> Tag and categorize your media</li>
                <li>• <strong>Search:</strong> Find media by prompt or date</li>
                <li>• <strong>Reuse:</strong> Attach media to any scheduled post</li>
                <li>• <strong>Download:</strong> Export in multiple formats</li>
            </ul>
        </section>
    </div>
);

const AcademicModeDocs = () => (
    <div className="space-y-12 animate-fade-in">
        <div>
            <h1 className="text-4xl font-bold font-display text-surface-900 mb-4">Academic Mode</h1>
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm font-medium mb-4">
                <GraduationCap className="w-4 h-4 mr-2" /> For Researchers & Educators
            </div>
            <p className="text-xl text-gray-600">
                Translate complex research into accessible, engaging social media content.
            </p>
        </div>

        <section className="space-y-6">
            <h2 className="text-2xl font-bold text-surface-900">Who It's For</h2>
            <div className="grid md:grid-cols-3 gap-4">
                <div className="p-4 bg-white rounded-lg shadow-sm text-center">
                    <div className="text-3xl mb-2">🔬</div>
                    <h4 className="font-bold">Researchers</h4>
                    <p className="text-sm text-gray-600">Share findings with broader audiences</p>
                </div>
                <div className="p-4 bg-white rounded-lg shadow-sm text-center">
                    <div className="text-3xl mb-2">👩‍🏫</div>
                    <h4 className="font-bold">Educators</h4>
                    <p className="text-sm text-gray-600">Create engaging educational content</p>
                </div>
                <div className="p-4 bg-white rounded-lg shadow-sm text-center">
                    <div className="text-3xl mb-2">📰</div>
                    <h4 className="font-bold">Science Writers</h4>
                    <p className="text-sm text-gray-600">Simplify complex topics</p>
                </div>
            </div>
        </section>

        <section className="space-y-6">
            <h2 className="text-2xl font-bold text-surface-900">How It Works</h2>
            <div className="bg-white/60 rounded-xl p-6 border border-blue-200">
                <ol className="list-decimal list-inside space-y-3 text-gray-700">
                    <li><strong>Input Research:</strong> Paste your abstract, paper URL, or key findings.</li>
                    <li><strong>Select Audience:</strong> Choose from General Public, Industry Professionals, or Students.</li>
                    <li><strong>Set Complexity:</strong> Adjust the reading level (Elementary to Graduate).</li>
                    <li><strong>Generate:</strong> The AI creates platform-specific posts that explain your research.</li>
                    <li><strong>Review Citations:</strong> Ensure proper attribution is included.</li>
                </ol>
            </div>
        </section>

        <section className="space-y-6">
            <h2 className="text-2xl font-bold text-surface-900">Output Formats</h2>
            <ul className="grid gap-4 md:grid-cols-2">
                <li className="p-4 bg-white rounded-lg shadow-sm border border-gray-100">
                    <strong className="block text-blue-600 mb-1">Twitter Thread</strong>
                    Break down findings into digestible tweets with citations.
                </li>
                <li className="p-4 bg-white rounded-lg shadow-sm border border-gray-100">
                    <strong className="block text-blue-600 mb-1">LinkedIn Article</strong>
                    Professional long-form summary for academic networks.
                </li>
                <li className="p-4 bg-white rounded-lg shadow-sm border border-gray-100">
                    <strong className="block text-blue-600 mb-1">Instagram Carousel</strong>
                    Visual slide-by-slide explanation of key concepts.
                </li>
                <li className="p-4 bg-white rounded-lg shadow-sm border border-gray-100">
                    <strong className="block text-blue-600 mb-1">TikTok Script</strong>
                    Engaging video script for explaining research visually.
                </li>
            </ul>
        </section>
    </div>
);

const SchedulingDocs = () => (
    <div className="space-y-12 animate-fade-in">
        <div>
            <h1 className="text-4xl font-bold font-display text-surface-900 mb-4">Content Scheduler</h1>
            <p className="text-xl text-gray-600">
                Plan your content calendar and publish at optimal times.
            </p>
        </div>

        <section className="space-y-6">
            <h2 className="text-2xl font-bold text-surface-900">Scheduling Posts</h2>
            <p className="text-gray-700">
                Schedule individual posts to publish at specific dates and times.
            </p>
            <div className="grid md:grid-cols-3 gap-6">
                <div className="p-6 bg-white rounded-xl shadow-sm">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mb-4 font-bold text-gray-600">1</div>
                    <h3 className="font-bold mb-2">Create Content</h3>
                    <p className="text-sm text-gray-600">Generate or write your post in the Generator.</p>
                </div>
                <div className="p-6 bg-white rounded-xl shadow-sm">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mb-4 font-bold text-gray-600">2</div>
                    <h3 className="font-bold mb-2">Pick Date & Time</h3>
                    <p className="text-sm text-gray-600">Select when you want the post to go live.</p>
                </div>
                <div className="p-6 bg-white rounded-xl shadow-sm">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mb-4 font-bold text-gray-600">3</div>
                    <h3 className="font-bold mb-2">Automatic Publishing</h3>
                    <p className="text-sm text-gray-600">Our system publishes at the exact time you specified.</p>
                </div>
            </div>
        </section>

        <section className="space-y-6">
            <h2 className="text-2xl font-bold text-surface-900">Calendar View</h2>
            <p className="text-gray-700">
                Visualize your content schedule at a glance.
            </p>
            <ul className="space-y-2 text-gray-700">
                <li>• <strong>Month View:</strong> See all scheduled posts for the month</li>
                <li>• <strong>Week View:</strong> Detailed view of each day's posts</li>
                <li>• <strong>Drag & Drop:</strong> Easily reschedule posts by dragging them</li>
                <li>• <strong>Color Coding:</strong> Different colors for each platform</li>
                <li>• <strong>Status Indicators:</strong> Scheduled, Published, or Failed</li>
            </ul>
        </section>

        <section className="space-y-6">
            <h2 className="text-2xl font-bold text-surface-900">Optimal Timing</h2>
            <div className="p-4 bg-brand-glow/10 rounded-lg border border-brand-glow/20">
                <h4 className="font-bold text-brand-primary mb-2">Pro Tip: Best Times to Post</h4>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div>
                        <strong className="text-surface-900">Twitter:</strong>
                        <p className="text-gray-600">9-11 AM & 1-3 PM weekdays</p>
                    </div>
                    <div>
                        <strong className="text-surface-900">LinkedIn:</strong>
                        <p className="text-gray-600">Tuesday-Thursday, 9 AM-12 PM</p>
                    </div>
                    <div>
                        <strong className="text-surface-900">Instagram:</strong>
                        <p className="text-gray-600">11 AM-1 PM & 7-9 PM</p>
                    </div>
                    <div>
                        <strong className="text-surface-900">TikTok:</strong>
                        <p className="text-gray-600">7-9 PM, especially weekends</p>
                    </div>
                </div>
            </div>
        </section>
    </div>
);

const RecurringPostsDocs = () => (
    <div className="space-y-12 animate-fade-in">
        <div>
            <h1 className="text-4xl font-bold font-display text-surface-900 mb-4">Recurring Posts</h1>
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm font-medium mb-4">
                <RefreshCw className="w-4 h-4 mr-2" /> Automation Feature
            </div>
            <p className="text-xl text-gray-600">
                Set up automatic posting frequencies. Create once, post forever.
            </p>
        </div>

        <section className="space-y-6">
            <h2 className="text-2xl font-bold text-surface-900">What Are Recurring Posts?</h2>
            <p className="text-gray-700">
                Recurring posts allow you to set up automatic posting schedules instead of manually scheduling each individual post. Perfect for:
            </p>
            <ul className="grid gap-4 md:grid-cols-2">
                <li className="p-4 bg-white rounded-lg shadow-sm border border-gray-100">
                    <strong className="block text-green-600 mb-1">Daily Motivation</strong>
                    "Post every day at 9 AM"
                </li>
                <li className="p-4 bg-white rounded-lg shadow-sm border border-gray-100">
                    <strong className="block text-green-600 mb-1">Weekly Tips</strong>
                    "Post every Monday, Wednesday, Friday at 2 PM"
                </li>
                <li className="p-4 bg-white rounded-lg shadow-sm border border-gray-100">
                    <strong className="block text-green-600 mb-1">Monthly Newsletters</strong>
                    "Post on the 1st and 15th of each month"
                </li>
                <li className="p-4 bg-white rounded-lg shadow-sm border border-gray-100">
                    <strong className="block text-green-600 mb-1">Content Series</strong>
                    "#ThrowbackThursday every Thursday at 3 PM"
                </li>
            </ul>
        </section>

        <section className="space-y-6">
            <h2 className="text-2xl font-bold text-surface-900">Frequency Options</h2>
            <div className="bg-white/60 rounded-xl p-6 border border-green-200">
                <div className="grid gap-6 md:grid-cols-3">
                    <div>
                        <h3 className="font-bold text-lg mb-3 text-green-700">Daily</h3>
                        <p className="text-sm text-gray-600 mb-2">Post every day at a specified time.</p>
                        <code className="text-xs bg-gray-100 px-2 py-1 rounded">Every day at 9:00 AM</code>
                    </div>
                    <div>
                        <h3 className="font-bold text-lg mb-3 text-green-700">Weekly</h3>
                        <p className="text-sm text-gray-600 mb-2">Select specific days of the week.</p>
                        <code className="text-xs bg-gray-100 px-2 py-1 rounded">Mon, Wed, Fri at 2:00 PM</code>
                    </div>
                    <div>
                        <h3 className="font-bold text-lg mb-3 text-green-700">Monthly</h3>
                        <p className="text-sm text-gray-600 mb-2">Select specific dates of the month.</p>
                        <code className="text-xs bg-gray-100 px-2 py-1 rounded">1st & 15th at 10:00 AM</code>
                    </div>
                </div>
            </div>
        </section>

        <section className="space-y-6">
            <h2 className="text-2xl font-bold text-surface-900">How It Works</h2>
            <ol className="list-decimal list-inside space-y-3 text-gray-700">
                <li><strong>Create Template:</strong> Write your content template with any dynamic elements.</li>
                <li><strong>Set Frequency:</strong> Choose daily, weekly, or monthly schedule.</li>
                <li><strong>Select Platforms:</strong> Pick which platforms to post to.</li>
                <li><strong>Activate:</strong> The system automatically generates posts 14 days in advance.</li>
                <li><strong>Publishing:</strong> Posts are published automatically at the scheduled times.</li>
            </ol>
        </section>

        <section className="space-y-6">
            <h2 className="text-2xl font-bold text-surface-900">Managing Recurring Posts</h2>
            <div className="grid md:grid-cols-3 gap-4">
                <div className="p-4 bg-white rounded-lg shadow-sm">
                    <h4 className="font-bold mb-2">Pause</h4>
                    <p className="text-sm text-gray-600">Temporarily stop without deleting. Already scheduled posts remain.</p>
                </div>
                <div className="p-4 bg-white rounded-lg shadow-sm">
                    <h4 className="font-bold mb-2">Edit</h4>
                    <p className="text-sm text-gray-600">Changes apply to future posts only. Existing scheduled posts unchanged.</p>
                </div>
                <div className="p-4 bg-white rounded-lg shadow-sm">
                    <h4 className="font-bold mb-2">Delete</h4>
                    <p className="text-sm text-gray-600">Stops future generation. Already scheduled posts will still publish.</p>
                </div>
            </div>
        </section>
    </div>
);

const PublishingDocs = () => (
    <div className="space-y-12 animate-fade-in">
        <div>
            <h1 className="text-4xl font-bold font-display text-surface-900 mb-4">Publishing Engine</h1>
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm font-medium mb-4">
                <ShieldCheck className="w-4 h-4 mr-2" /> Secure Server-Side
            </div>
            <p className="text-xl text-gray-600">
                Set it and forget it. Our server-side engine handles the actual posting to your social accounts.
            </p>
        </div>

        <section className="space-y-6">
            <h2 className="text-2xl font-bold text-surface-900">How It Works</h2>
            <p className="text-gray-700">
                Unlike some tools that require your browser to be open, SocialCraft AI uses a dedicated backend scheduler powered by Supabase Edge Functions.
            </p>
            <div className="grid gap-6 md:grid-cols-4">
                <div className="p-6 bg-white rounded-xl shadow-sm">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mb-4 font-bold text-gray-600">1</div>
                    <h3 className="font-bold mb-2">Schedule</h3>
                    <p className="text-sm text-gray-600">You choose the date and time in the app.</p>
                </div>
                <div className="p-6 bg-white rounded-xl shadow-sm">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mb-4 font-bold text-gray-600">2</div>
                    <h3 className="font-bold mb-2">Queue</h3>
                    <p className="text-sm text-gray-600">The post is securely stored in our database.</p>
                </div>
                <div className="p-6 bg-white rounded-xl shadow-sm">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mb-4 font-bold text-gray-600">3</div>
                    <h3 className="font-bold mb-2">Check</h3>
                    <p className="text-sm text-gray-600">Our system checks every 5 minutes for posts due.</p>
                </div>
                <div className="p-6 bg-white rounded-xl shadow-sm">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mb-4 font-bold text-gray-600">4</div>
                    <h3 className="font-bold mb-2">Publish</h3>
                    <p className="text-sm text-gray-600">Posts are pushed to each platform's API.</p>
                </div>
            </div>
        </section>

        <section className="space-y-6">
            <h2 className="text-2xl font-bold text-surface-900">Rate Limiting</h2>
            <p className="text-gray-700">
                To protect your accounts from being flagged, we enforce platform-specific rate limits:
            </p>
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="bg-gray-50">
                            <th className="text-left p-3 font-bold">Platform</th>
                            <th className="text-left p-3 font-bold">Limit</th>
                            <th className="text-left p-3 font-bold">Notes</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr className="border-b"><td className="p-3">Twitter/X</td><td className="p-3">100/24h</td><td className="p-3 text-gray-500">17 for free tier</td></tr>
                        <tr className="border-b"><td className="p-3">LinkedIn</td><td className="p-3">10/24h</td><td className="p-3 text-gray-500">12 for company pages</td></tr>
                        <tr className="border-b"><td className="p-3">Instagram</td><td className="p-3">100/24h</td><td className="p-3 text-gray-500">All tiers</td></tr>
                        <tr className="border-b"><td className="p-3">TikTok</td><td className="p-3">15/24h</td><td className="p-3 text-gray-500">Conservative limit</td></tr>
                        <tr><td className="p-3">Pinterest</td><td className="p-3">12/24h</td><td className="p-3 text-gray-500">Conservative limit</td></tr>
                    </tbody>
                </table>
            </div>
            <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <div className="flex items-start">
                    <AlertTriangle className="w-5 h-5 text-yellow-600 mr-3 mt-0.5" />
                    <div>
                        <h4 className="font-bold text-yellow-800 mb-1">Rate Limit Exceeded?</h4>
                        <p className="text-sm text-yellow-700">If you exceed the limit, posts will be marked as "Failed" with an error message. They won't be retried automatically—you'll need to reschedule them.</p>
                    </div>
                </div>
            </div>
        </section>

        <section className="space-y-6">
            <h2 className="text-2xl font-bold text-surface-900">Post Statuses</h2>
            <div className="grid md:grid-cols-4 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h4 className="font-bold text-blue-800">Scheduled</h4>
                    <p className="text-sm text-blue-600">Waiting to be published</p>
                </div>
                <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                    <h4 className="font-bold text-yellow-800">Publishing</h4>
                    <p className="text-sm text-yellow-600">Currently being sent</p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <h4 className="font-bold text-green-800">Published</h4>
                    <p className="text-sm text-green-600">Successfully posted</p>
                </div>
                <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                    <h4 className="font-bold text-red-800">Failed</h4>
                    <p className="text-sm text-red-600">Error occurred</p>
                </div>
            </div>
        </section>
    </div>
);

const ConnectedAccountsDocs = () => (
    <div className="space-y-12 animate-fade-in">
        <div>
            <h1 className="text-4xl font-bold font-display text-surface-900 mb-4">Connected Accounts</h1>
            <p className="text-xl text-gray-600">
                Connect your social media accounts to enable automatic posting and analytics tracking.
            </p>
        </div>

        <section className="space-y-6">
            <h2 className="text-2xl font-bold text-surface-900">Supported Platforms</h2>
            <div className="grid md:grid-cols-3 gap-4">
                <div className="p-4 bg-white rounded-lg shadow-sm border border-gray-100">
                    <h3 className="font-bold mb-2">Twitter/X</h3>
                    <p className="text-sm text-gray-600">Post tweets and threads</p>
                </div>
                <div className="p-4 bg-white rounded-lg shadow-sm border border-gray-100">
                    <h3 className="font-bold mb-2">LinkedIn</h3>
                    <p className="text-sm text-gray-600">Share posts and articles</p>
                </div>
                <div className="p-4 bg-white rounded-lg shadow-sm border border-gray-100">
                    <h3 className="font-bold mb-2">Instagram</h3>
                    <p className="text-sm text-gray-600">Post images and carousels</p>
                </div>
                <div className="p-4 bg-white rounded-lg shadow-sm border border-gray-100">
                    <h3 className="font-bold mb-2">TikTok</h3>
                    <p className="text-sm text-gray-600">Share videos (coming soon)</p>
                </div>
                <div className="p-4 bg-white rounded-lg shadow-sm border border-gray-100">
                    <h3 className="font-bold mb-2">Pinterest</h3>
                    <p className="text-sm text-gray-600">Create pins and boards</p>
                </div>
            </div>
        </section>

        <section className="space-y-6">
            <h2 className="text-2xl font-bold text-surface-900">How to Connect</h2>
            <ol className="list-decimal list-inside space-y-3 text-gray-700">
                <li>Go to <strong>Settings</strong> in the navigation menu.</li>
                <li>Find the <strong>Connected Accounts</strong> section.</li>
                <li>Click <strong>Connect</strong> next to the platform you want to add.</li>
                <li>You'll be redirected to the platform to authorize SocialCraft AI.</li>
                <li>After authorizing, you'll be returned to SocialCraft AI.</li>
                <li>Your account is now connected and ready for posting!</li>
            </ol>
        </section>

        <section className="space-y-6">
            <h2 className="text-2xl font-bold text-surface-900">Token Management</h2>
            <p className="text-gray-700">
                OAuth tokens are automatically refreshed before they expire. Our system runs daily checks to ensure your connections stay active.
            </p>
            <div className="p-4 bg-brand-glow/10 rounded-lg border border-brand-glow/20">
                <h4 className="font-bold text-brand-primary mb-2">Automatic Token Refresh</h4>
                <p className="text-sm text-surface-900">
                    We check for expiring tokens daily at 2 AM UTC. Tokens expiring within 7 days are automatically refreshed. If a refresh fails, you'll be notified to reconnect the account.
                </p>
            </div>
        </section>

        <section className="space-y-6">
            <h2 className="text-2xl font-bold text-surface-900">Disconnecting Accounts</h2>
            <p className="text-gray-700">
                To disconnect an account:
            </p>
            <ol className="list-decimal list-inside space-y-2 text-gray-700">
                <li>Go to <strong>Settings → Connected Accounts</strong></li>
                <li>Click <strong>Disconnect</strong> next to the account</li>
                <li>Scheduled posts for that platform will remain but won't be able to publish</li>
            </ol>
        </section>
    </div>
);

const AnalyticsDocs = () => (
    <div className="space-y-12 animate-fade-in">
        <div>
            <h1 className="text-4xl font-bold font-display text-surface-900 mb-4">Analytics</h1>
            <p className="text-xl text-gray-600">
                Track your engagement metrics and understand what content performs best.
            </p>
        </div>

        <section className="space-y-6">
            <h2 className="text-2xl font-bold text-surface-900">Metrics Tracked</h2>
            <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 bg-white rounded-lg shadow-sm border border-gray-100">
                    <h3 className="font-bold text-brand-primary mb-2">Impressions</h3>
                    <p className="text-sm text-gray-600">How many times your post was shown to users.</p>
                </div>
                <div className="p-4 bg-white rounded-lg shadow-sm border border-gray-100">
                    <h3 className="font-bold text-brand-primary mb-2">Likes</h3>
                    <p className="text-sm text-gray-600">Number of likes, hearts, or reactions.</p>
                </div>
                <div className="p-4 bg-white rounded-lg shadow-sm border border-gray-100">
                    <h3 className="font-bold text-brand-primary mb-2">Comments</h3>
                    <p className="text-sm text-gray-600">Number of comments or replies.</p>
                </div>
                <div className="p-4 bg-white rounded-lg shadow-sm border border-gray-100">
                    <h3 className="font-bold text-brand-primary mb-2">Shares</h3>
                    <p className="text-sm text-gray-600">Retweets, reposts, and shares.</p>
                </div>
                <div className="p-4 bg-white rounded-lg shadow-sm border border-gray-100">
                    <h3 className="font-bold text-brand-primary mb-2">Engagement Rate</h3>
                    <p className="text-sm text-gray-600">Total engagements divided by impressions.</p>
                </div>
                <div className="p-4 bg-white rounded-lg shadow-sm border border-gray-100">
                    <h3 className="font-bold text-brand-primary mb-2">Click-Through Rate</h3>
                    <p className="text-sm text-gray-600">Link clicks divided by impressions.</p>
                </div>
            </div>
        </section>

        <section className="space-y-6">
            <h2 className="text-2xl font-bold text-surface-900">How Analytics Work</h2>
            <p className="text-gray-700">
                Our system automatically fetches analytics for your published posts:
            </p>
            <ul className="space-y-2 text-gray-700">
                <li>• <strong>Hourly Updates:</strong> Analytics are refreshed every hour.</li>
                <li>• <strong>30-Day History:</strong> We track metrics for posts from the last 30 days.</li>
                <li>• <strong>Cross-Platform:</strong> View metrics from all platforms in one dashboard.</li>
                <li>• <strong>Cached Data:</strong> Fast loading with intelligent caching.</li>
            </ul>
        </section>

        <section className="space-y-6">
            <h2 className="text-2xl font-bold text-surface-900">Understanding Your Data</h2>
            <div className="p-4 bg-brand-glow/10 rounded-lg border border-brand-glow/20">
                <h4 className="font-bold text-brand-primary mb-2">Pro Tip: Focus on Engagement Rate</h4>
                <p className="text-sm text-surface-900">
                    Raw numbers like impressions can be misleading. A post with 1,000 impressions and 100 engagements (10% rate) is performing better than a post with 10,000 impressions and 200 engagements (2% rate).
                </p>
            </div>
        </section>
    </div>
);

const PlatformsDocs = () => (
    <div className="space-y-12 animate-fade-in">
        <div>
            <h1 className="text-4xl font-bold font-display text-surface-900 mb-4">Platform Guides</h1>
            <p className="text-xl text-gray-600">Master the nuances of each network.</p>
        </div>

        <div className="grid gap-8">
            <PlatformGuide
                name="Twitter/X"
                focus="Engagement & Virality"
                tips={[
                    "Use threads for deep dives—they get 3x more engagement.",
                    "Keep hooks under 50 characters to stop the scroll.",
                    "Engage with replies in the first hour—it signals the algorithm.",
                    "Use 1-2 relevant hashtags, not more.",
                    "Post 3-5 times per day for optimal reach."
                ]}
            />
            <PlatformGuide
                name="LinkedIn"
                focus="Professional Authority"
                tips={[
                    "Focus on 'lessons learned' and personal stories.",
                    "Use carousels for step-by-step guides—they get 3x the reach.",
                    "NEVER put external links in the main post—use first comment.",
                    "Post during business hours (9 AM - 12 PM).",
                    "Engage with comments within 1 hour to boost visibility."
                ]}
            />
            <PlatformGuide
                name="Instagram"
                focus="Visual Storytelling"
                tips={[
                    "High-contrast visuals stop the scroll.",
                    "Use 3-5 relevant hashtags in the caption.",
                    "Stories are for behind-the-scenes content.",
                    "Reels get 2x the reach of static posts.",
                    "Post carousel slides to maximize saves."
                ]}
            />
            <PlatformGuide
                name="TikTok"
                focus="Short-form Video & Trends"
                tips={[
                    "Catchy hook in the first 3 seconds or lose them.",
                    "Use trending sounds to boost discoverability.",
                    "Keep it raw and authentic—polished feels corporate.",
                    "Add keywords in captions, on-screen text, AND spoken.",
                    "Videos over 1 minute get better distribution."
                ]}
            />
            <PlatformGuide
                name="Pinterest"
                focus="Visual Discovery & Inspiration"
                tips={[
                    "Vertical images (2:3 ratio) work best.",
                    "Keywords in descriptions are crucial for SEO.",
                    "Create boards for specific themes and topics.",
                    "Fresh pins (new images) are prioritized.",
                    "Include a clear call-to-action."
                ]}
            />
        </div>
    </div>
);

const PlatformGuide = ({ name, focus, tips }: { name: string, focus: string, tips: string[] }) => (
    <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-2xl font-bold text-surface-900 mb-2">{name}</h3>
        <p className="text-brand-primary font-medium mb-4">Focus: {focus}</p>
        <ul className="space-y-2">
            {tips.map((tip, i) => (
                <li key={i} className="flex items-start text-gray-700">
                    <span className="mr-2 text-brand-primary">•</span>
                    {tip}
                </li>
            ))}
        </ul>
    </div>
);

const SecurityDocs = () => (
    <div className="space-y-12 animate-fade-in">
        <div>
            <h1 className="text-4xl font-bold font-display text-surface-900 mb-4">Security</h1>
            <p className="text-xl text-gray-600">
                How we keep your data and accounts safe.
            </p>
        </div>

        <section className="space-y-6">
            <h2 className="text-2xl font-bold text-surface-900">Data Protection</h2>
            <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 bg-white rounded-lg shadow-sm border border-gray-100">
                    <h3 className="font-bold text-green-600 mb-2">Encrypted at Rest</h3>
                    <p className="text-sm text-gray-600">All sensitive data including OAuth tokens are encrypted using AES-256 encryption.</p>
                </div>
                <div className="p-4 bg-white rounded-lg shadow-sm border border-gray-100">
                    <h3 className="font-bold text-green-600 mb-2">Encrypted in Transit</h3>
                    <p className="text-sm text-gray-600">All communications use TLS 1.3 encryption.</p>
                </div>
                <div className="p-4 bg-white rounded-lg shadow-sm border border-gray-100">
                    <h3 className="font-bold text-green-600 mb-2">Row Level Security</h3>
                    <p className="text-sm text-gray-600">Database policies ensure you can only access your own data.</p>
                </div>
                <div className="p-4 bg-white rounded-lg shadow-sm border border-gray-100">
                    <h3 className="font-bold text-green-600 mb-2">No Password Storage</h3>
                    <p className="text-sm text-gray-600">We never see or store your social media passwords.</p>
                </div>
            </div>
        </section>

        <section className="space-y-6">
            <h2 className="text-2xl font-bold text-surface-900">OAuth Security</h2>
            <p className="text-gray-700">
                We use OAuth 2.0 with PKCE (Proof Key for Code Exchange) for the most secure authentication flow.
            </p>
            <div className="bg-white/60 rounded-xl p-6 border border-green-200">
                <h3 className="font-bold text-lg mb-4">What This Means</h3>
                <ul className="space-y-2 text-gray-700">
                    <li>• <strong>No passwords:</strong> You authorize directly with each platform.</li>
                    <li>• <strong>Limited scope:</strong> We only request the permissions we need.</li>
                    <li>• <strong>Revocable:</strong> You can disconnect anytime from Settings.</li>
                    <li>• <strong>PKCE protection:</strong> Prevents authorization code interception attacks.</li>
                </ul>
            </div>
        </section>

        <section className="space-y-6">
            <h2 className="text-2xl font-bold text-surface-900">Infrastructure</h2>
            <ul className="space-y-2 text-gray-700">
                <li>• <strong>Hosting:</strong> Supabase (built on AWS) with SOC 2 compliance</li>
                <li>• <strong>Database:</strong> PostgreSQL with automatic backups</li>
                <li>• <strong>Edge Functions:</strong> Isolated Deno runtime for each execution</li>
                <li>• <strong>CDN:</strong> Global edge network for fast, secure delivery</li>
            </ul>
        </section>

        <section className="space-y-6">
            <h2 className="text-2xl font-bold text-surface-900">Your Rights</h2>
            <ul className="space-y-2 text-gray-700">
                <li>• <strong>Data Export:</strong> Request a full export of your data anytime.</li>
                <li>• <strong>Data Deletion:</strong> Delete your account and all associated data.</li>
                <li>• <strong>Access Control:</strong> Revoke platform connections instantly.</li>
            </ul>
        </section>
    </div>
);

const BillingDocs = () => (
    <div className="space-y-12 animate-fade-in">
        <div>
            <h1 className="text-4xl font-bold font-display text-surface-900 mb-4">Billing & Plans</h1>
            <p className="text-xl text-gray-600">
                Choose the plan that fits your needs.
            </p>
        </div>

        <section className="space-y-6">
            <div className="grid gap-6 md:grid-cols-3">
                <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-200">
                    <h3 className="text-xl font-bold mb-2">Free</h3>
                    <p className="text-3xl font-bold mb-4">$0<span className="text-sm font-normal text-gray-500">/month</span></p>
                    <ul className="space-y-2 text-sm text-gray-700 mb-6">
                        <li>✓ 10 AI generations/month</li>
                        <li>✓ 1 connected account</li>
                        <li>✓ Basic scheduling</li>
                        <li>✗ Trend Scout Agent</li>
                        <li>✗ Recurring posts</li>
                    </ul>
                </div>

                <div className="p-6 bg-gradient-to-br from-brand-primary/10 to-brand-glow/10 rounded-xl border-2 border-brand-primary">
                    <div className="inline-flex items-center px-2 py-1 rounded-full bg-brand-primary text-white text-xs font-medium mb-2">
                        Most Popular
                    </div>
                    <h3 className="text-xl font-bold mb-2">Pro</h3>
                    <p className="text-3xl font-bold mb-4">$29<span className="text-sm font-normal text-gray-500">/month</span></p>
                    <ul className="space-y-2 text-sm text-gray-700 mb-6">
                        <li>✓ Unlimited AI generations</li>
                        <li>✓ 5 connected accounts</li>
                        <li>✓ Advanced scheduling</li>
                        <li>✓ Trend Scout Agent</li>
                        <li>✓ Recurring posts</li>
                        <li>✓ 3 Brand Personas</li>
                        <li>✓ Analytics dashboard</li>
                    </ul>
                </div>

                <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-200">
                    <h3 className="text-xl font-bold mb-2">Business</h3>
                    <p className="text-3xl font-bold mb-4">$99<span className="text-sm font-normal text-gray-500">/month</span></p>
                    <ul className="space-y-2 text-sm text-gray-700 mb-6">
                        <li>✓ Everything in Pro</li>
                        <li>✓ Unlimited connected accounts</li>
                        <li>✓ Unlimited Brand Personas</li>
                        <li>✓ Team collaboration</li>
                        <li>✓ Priority support</li>
                        <li>✓ API access</li>
                        <li>✓ White-label options</li>
                    </ul>
                </div>
            </div>
        </section>

        <section className="space-y-6">
            <h2 className="text-2xl font-bold text-surface-900">Managing Your Subscription</h2>
            <ul className="space-y-2 text-gray-700">
                <li>• <strong>Upgrade:</strong> Go to Settings → Billing → Choose new plan</li>
                <li>• <strong>Downgrade:</strong> Same process, effective at end of billing period</li>
                <li>• <strong>Cancel:</strong> Settings → Billing → Cancel subscription</li>
                <li>• <strong>Invoice History:</strong> Access all past invoices from the Billing page</li>
            </ul>
        </section>

        <section className="space-y-6">
            <h2 className="text-2xl font-bold text-surface-900">Payment Methods</h2>
            <p className="text-gray-700">
                We accept all major credit cards through Stripe:
            </p>
            <div className="flex space-x-4 text-2xl">
                <span>💳</span>
                <span>Visa</span>
                <span>Mastercard</span>
                <span>Amex</span>
            </div>
        </section>
    </div>
);

const TroubleshootingDocs = () => (
    <div className="space-y-12 animate-fade-in">
        <div>
            <h1 className="text-4xl font-bold font-display text-surface-900 mb-4">Troubleshooting</h1>
            <p className="text-xl text-gray-600">
                Common issues and how to resolve them quickly.
            </p>
        </div>

        <section className="space-y-6">
            <h2 className="text-2xl font-bold text-surface-900">Post Failed: "Access Token Expired"</h2>
            <div className="bg-orange-50 rounded-xl p-6 border border-orange-200">
                <div className="flex items-start">
                    <AlertTriangle className="w-6 h-6 text-orange-600 mr-3 mt-1 flex-shrink-0" />
                    <div className="flex-1">
                        <h3 className="font-bold text-orange-900 mb-3">What This Means</h3>
                        <p className="text-orange-800 mb-4">
                            Your connected social media account's access token has expired. This is normal and happens periodically for security reasons. You need to reconnect your account to resume posting.
                        </p>
                        <h4 className="font-bold text-orange-900 mb-2">How to Fix</h4>
                        <ol className="list-decimal list-inside space-y-2 text-orange-800">
                            <li>Click on <strong>Settings</strong> in the main navigation menu (top right corner)</li>
                            <li>Scroll down to the <strong>Connected Accounts</strong> section</li>
                            <li>Find the platform showing an error (usually marked with a warning icon)</li>
                            <li>Click <strong>Disconnect</strong> next to that platform</li>
                            <li>Click <strong>Connect</strong> to reconnect the account</li>
                            <li>Authorize SocialCraft AI when redirected to the platform</li>
                            <li>Return to the Schedule page and retry your failed posts</li>
                        </ol>
                    </div>
                </div>
            </div>
        </section>

        <section className="space-y-6">
            <h2 className="text-2xl font-bold text-surface-900">Finding the Integration/Settings Page</h2>
            <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100">
                <p className="text-gray-700 mb-4">
                    The Settings page is where you manage all your connected social media accounts, billing, and preferences.
                </p>
                <div className="grid md:grid-cols-2 gap-6">
                    <div className="p-4 bg-blue-50 rounded-lg">
                        <h4 className="font-bold text-blue-900 mb-2">Desktop/Web</h4>
                        <ul className="text-sm text-blue-800 space-y-1">
                            <li>• Look for the <strong>Settings</strong> link in the top navigation bar (usually top right)</li>
                            <li>• Or click on your profile picture/avatar and select Settings</li>
                            <li>• The Connected Accounts section is in the main settings page</li>
                        </ul>
                    </div>
                    <div className="p-4 bg-blue-50 rounded-lg">
                        <h4 className="font-bold text-blue-900 mb-2">Quick Navigation</h4>
                        <ul className="text-sm text-blue-800 space-y-1">
                            <li>• From any page, you can access Settings from the main menu</li>
                            <li>• Connected Accounts shows all linked platforms</li>
                            <li>• Green checkmark = Active connection</li>
                            <li>• Orange warning = Token needs refresh</li>
                        </ul>
                    </div>
                </div>
            </div>
        </section>

        <section className="space-y-6">
            <h2 className="text-2xl font-bold text-surface-900">Refreshing Expired Platform Tokens</h2>
            <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100">
                <p className="text-gray-700 mb-4">
                    OAuth tokens are automatically refreshed by our system daily. However, if a refresh fails or you see an expired token error:
                </p>
                <div className="bg-white/60 rounded-xl p-6 border border-blue-200">
                    <h3 className="font-bold text-lg mb-4">Step-by-Step Token Refresh</h3>
                    <ol className="list-decimal list-inside space-y-3 text-gray-700">
                        <li>
                            <strong>Navigate to Settings → Connected Accounts</strong>
                            <p className="ml-6 text-sm text-gray-600 mt-1">Find the account with an expired token (marked with a warning icon or error message)</p>
                        </li>
                        <li>
                            <strong>Disconnect the Account</strong>
                            <p className="ml-6 text-sm text-gray-600 mt-1">Click the "Disconnect" button next to the affected platform</p>
                        </li>
                        <li>
                            <strong>Reconnect Immediately</strong>
                            <p className="ml-6 text-sm text-gray-600 mt-1">Click "Connect" on the same platform - you'll be redirected to authorize</p>
                        </li>
                        <li>
                            <strong>Authorize Permissions</strong>
                            <p className="ml-6 text-sm text-gray-600 mt-1">Grant the necessary permissions on the platform's authorization page</p>
                        </li>
                        <li>
                            <strong>Verify Connection</strong>
                            <p className="ml-6 text-sm text-gray-600 mt-1">You should see a green checkmark and "Connected" status</p>
                        </li>
                        <li>
                            <strong>Retry Failed Posts</strong>
                            <p className="ml-6 text-sm text-gray-600 mt-1">Go to Schedule page, find failed posts (orange color), and click "Retry"</p>
                        </li>
                    </ol>
                </div>
            </div>
        </section>

        <section className="space-y-6">
            <h2 className="text-2xl font-bold text-surface-900">Post Shows "No Content"</h2>
            <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100">
                <p className="text-gray-700 mb-4">
                    This usually happens when content wasn't properly saved during scheduling.
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                        <h4 className="font-bold text-yellow-800 mb-2">Possible Causes</h4>
                        <ul className="text-sm text-yellow-700 space-y-1">
                            <li>• Content generator didn't complete</li>
                            <li>• Browser connection interrupted</li>
                            <li>• Content structure changed between versions</li>
                        </ul>
                    </div>
                    <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                        <h4 className="font-bold text-green-800 mb-2">How to Fix</h4>
                        <ul className="text-sm text-green-700 space-y-1">
                            <li>• Delete the empty post from Schedule page</li>
                            <li>• Generate new content in the Generator</li>
                            <li>• Schedule again with new content</li>
                        </ul>
                    </div>
                </div>
            </div>
        </section>

        <section className="space-y-6">
            <h2 className="text-2xl font-bold text-surface-900">Twitter Character Limit Exceeded</h2>
            <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100">
                <p className="text-gray-700 mb-4">
                    Twitter has different character limits based on your subscription tier.
                </p>
                <div className="bg-white/60 rounded-xl p-6 border border-sky-200">
                    <h3 className="font-bold text-lg mb-4">Character Limits by Tier</h3>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                            <span className="font-medium">Twitter Free</span>
                            <span className="text-gray-600">280 characters</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                            <span className="font-medium">Twitter Premium</span>
                            <span className="text-gray-600">4,000 characters</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                            <span className="font-medium">Twitter Premium+</span>
                            <span className="text-gray-600">25,000 characters</span>
                        </div>
                    </div>
                    <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                        <h4 className="font-bold text-blue-900 mb-2">Solutions When Exceeding Limit</h4>
                        <ul className="text-sm text-blue-800 space-y-2">
                            <li>• <strong>Use Variation:</strong> Auto-select a shorter AI-generated version</li>
                            <li>• <strong>Smart Truncate:</strong> Automatically shorten while preserving hashtags and mentions</li>
                            <li>• <strong>Create Thread:</strong> Split content into multiple connected tweets</li>
                            <li>• <strong>Edit Manually:</strong> Rewrite to fit within your tier's limit</li>
                        </ul>
                    </div>
                </div>
            </div>
        </section>

        <section className="space-y-6">
            <h2 className="text-2xl font-bold text-surface-900">Understanding Calendar Colors</h2>
            <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100">
                <p className="text-gray-700 mb-4">
                    The calendar uses different colors to indicate platforms and post statuses.
                </p>
                <div className="grid md:grid-cols-2 gap-6">
                    <div>
                        <h4 className="font-bold mb-3">Platform Colors</h4>
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 bg-sky-500 rounded" />
                                <span className="text-sm">Twitter/X (Sky Blue)</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 bg-blue-700 rounded" />
                                <span className="text-sm">LinkedIn (Dark Blue)</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 bg-gradient-to-br from-purple-500 to-pink-500 rounded" />
                                <span className="text-sm">Instagram (Purple-Pink)</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 bg-black rounded" />
                                <span className="text-sm">TikTok (Black)</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 bg-rose-600 rounded" />
                                <span className="text-sm">Pinterest (Rose)</span>
                            </div>
                        </div>
                    </div>
                    <div>
                        <h4 className="font-bold mb-3">Status Indicators</h4>
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 bg-orange-600 rounded" />
                                <span className="text-sm">Failed Post (Orange) - Needs attention</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 bg-gray-400 opacity-60 rounded" />
                                <span className="text-sm">Posted (Faded) - Successfully published</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 border-2 border-blue-500 rounded" />
                                <span className="text-sm">Today's Date (Blue outline)</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <section className="space-y-6">
            <h2 className="text-2xl font-bold text-surface-900">Need More Help?</h2>
            <div className="p-6 bg-brand-glow/10 rounded-xl border border-brand-glow/20">
                <h4 className="font-bold text-brand-primary mb-3">Contact Support</h4>
                <p className="text-surface-900 mb-4">
                    If you're still experiencing issues after trying these troubleshooting steps:
                </p>
                <ul className="space-y-2 text-surface-900">
                    <li>• <strong>Email:</strong> support@socialcraft.ai</li>
                    <li>• <strong>Response Time:</strong> Within 24 hours (Pro/Business: 4 hours)</li>
                    <li>• <strong>Include:</strong> Screenshots, error messages, and steps you've tried</li>
                </ul>
            </div>
        </section>
    </div>
);

const FAQDocs = () => (
    <div className="space-y-8 animate-fade-in">
        <h1 className="text-4xl font-bold font-display text-surface-900">Frequently Asked Questions</h1>
        <div className="space-y-6">
            <FAQItem
                question="Do I need my own API keys?"
                answer="No! SocialCraft AI handles all the AI processing. You only need to connect your social media accounts for posting."
            />
            <FAQItem
                question="Can I cancel anytime?"
                answer="Yes, you can cancel your subscription instantly from the Settings page. You'll keep access until the end of your billing period."
            />
            <FAQItem
                question="Is the content unique?"
                answer="Yes. Our AI generates fresh content every time based on your specific inputs and persona. We also include an Originality Review tool to help you add your personal touch."
            />
            <FAQItem
                question="How do recurring posts work?"
                answer="You create a content template and set a frequency (daily, weekly, monthly). Our system automatically generates and schedules posts based on your template, 14 days in advance."
            />
            <FAQItem
                question="What happens if a post fails?"
                answer="You'll be notified of the failure with an error message. Common causes include expired tokens (reconnect your account) or rate limits (wait 24 hours). Failed posts can be rescheduled."
            />
            <FAQItem
                question="Can I edit posts after scheduling?"
                answer="Yes! Go to the Schedule page, find your post, and click Edit. Changes are saved immediately. Note: you cannot edit posts that have already been published."
            />
            <FAQItem
                question="How accurate is the Trend Scout?"
                answer="The Trend Scout uses real-time Google Search data, so trends are current as of when you run the analysis. We recommend running it daily for the freshest insights."
            />
            <FAQItem
                question="Do you support team accounts?"
                answer="Yes! The Business plan includes team collaboration features. Multiple team members can manage the same connected accounts and content calendar."
            />
            <FAQItem
                question="What's the difference between scheduled and recurring posts?"
                answer="Scheduled posts are one-time posts set for a specific date/time. Recurring posts automatically repeat on a schedule (e.g., every Monday at 9 AM)."
            />
            <FAQItem
                question="How do I get support?"
                answer="Email us at support@socialcraft.ai or use the chat widget in the app. Pro and Business plans get priority support with faster response times."
            />
        </div>
    </div>
);

const FAQItem = ({ question, answer }: { question: string, answer: string }) => (
    <div className="border-b border-gray-200 pb-4">
        <h3 className="text-lg font-bold text-surface-900 mb-2">{question}</h3>
        <p className="text-gray-600">{answer}</p>
    </div>
);

const FeatureHighlight = ({ title, description }: { title: string, description: string }) => (
    <div className="p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-all">
        <h3 className="font-bold text-lg text-surface-900 mb-2">{title}</h3>
        <p className="text-sm text-gray-600 leading-relaxed">{description}</p>
    </div>
);

export default DocsView;
