import React, { useState } from 'react';
import { Book, Search, ChevronRight, Home, Zap, Layers, HelpCircle, DollarSign, TrendingUp, Layout, Share2, ShieldCheck } from 'lucide-react';

type DocSection = 'getting-started' | 'features' | 'agentic-trends' | 'brand-amplifier' | 'publishing' | 'platforms' | 'billing' | 'faq';

const DocsView: React.FC = () => {
    const [activeSection, setActiveSection] = useState<DocSection>('getting-started');
    const [searchTerm, setSearchTerm] = useState('');

    const sections = [
        { id: 'getting-started' as DocSection, title: 'Getting Started', icon: Home },
        { id: 'features' as DocSection, title: 'Core Features', icon: Zap },
        { id: 'agentic-trends' as DocSection, title: 'Trend Scout Agent', icon: TrendingUp },
        { id: 'brand-amplifier' as DocSection, title: 'Brand Amplifier', icon: Layout },
        { id: 'publishing' as DocSection, title: 'Publishing Engine', icon: Share2 },
        { id: 'platforms' as DocSection, title: 'Platform Guides', icon: Layers },
        { id: 'billing' as DocSection, title: 'Billing & Plans', icon: DollarSign },
        { id: 'faq' as DocSection, title: 'FAQ', icon: HelpCircle },
    ];

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
                    <nav className="space-y-1">
                        {sections.map((section) => {
                            const Icon = section.icon;
                            return (
                                <button
                                    key={section.id}
                                    onClick={() => setActiveSection(section.id)}
                                    className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-left transition-all duration-200 ${activeSection === section.id
                                            ? 'bg-sage-green text-white shadow-md'
                                            : 'text-deep-charcoal hover:bg-warm-gray'
                                        }`}
                                >
                                    <div className="flex items-center space-x-3">
                                        <Icon className="h-5 w-5" />
                                        <span className="font-medium">{section.title}</span>
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
                <div className="glass-card rounded-2xl p-8 md:p-12 min-h-[80vh]">
                    {activeSection === 'getting-started' && <GettingStartedDocs />}
                    {activeSection === 'features' && <FeaturesDocs />}
                    {activeSection === 'agentic-trends' && <AgenticTrendsDocs />}
                    {activeSection === 'brand-amplifier' && <BrandAmplifierDocs />}
                    {activeSection === 'publishing' && <PublishingDocs />}
                    {activeSection === 'platforms' && <PlatformsDocs />}
                    {activeSection === 'billing' && <BillingDocs />}
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
            <h1 className="text-4xl font-bold font-display text-deep-charcoal mb-4">Getting Started</h1>
            <p className="text-xl text-gray-600 leading-relaxed">
                Welcome to SocialCraft AI. Your journey to effortless, algorithm-optimized content creation begins here.
            </p>
        </div>

        <section className="space-y-8">
            <div className="border-b border-gray-200 pb-4">
                <h2 className="text-2xl font-bold text-deep-charcoal mb-4">Quick Start Guide</h2>
            </div>

            <div className="grid gap-6">
                <StepCard
                    number={1}
                    title="Create Your Account"
                    description="Sign up using your email or connect instantly with Google or GitHub. Your 14-day free trial of the Pro plan starts automatically—no credit card required."
                />
                <StepCard
                    number={2}
                    title="Define Your Brand Persona"
                    description="Navigate to the Brand Amplifier to set up your unique brand voice. Upload a sample of your writing or describe your style, and our AI will learn to write exactly like you."
                />
                <StepCard
                    number={3}
                    title="Discover Trends"
                    description="Use the Trend Scout Agent to find real-time, high-engagement topics in your niche. The AI analyzes live web data to identify what's viral right now."
                />
                <StepCard
                    number={4}
                    title="Generate & Schedule"
                    description="Turn trends into posts with one click. Review the generated content, make any tweaks, and schedule it to publish automatically to all your connected platforms."
                />
            </div>
        </section>
    </div>
);

const StepCard = ({ number, title, description }: { number: number, title: string, description: string }) => (
    <div className="flex items-start p-6 bg-white/50 rounded-xl border border-white/40 shadow-sm hover:shadow-md transition-all">
        <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-gradient-to-br from-sage-green to-terracotta text-white rounded-full font-bold text-lg shadow-sm">
            {number}
        </div>
        <div className="ml-6">
            <h3 className="text-xl font-bold text-deep-charcoal mb-2">{title}</h3>
            <p className="text-gray-700 leading-relaxed">{description}</p>
        </div>
    </div>
);

const FeaturesDocs = () => (
    <div className="space-y-12 animate-fade-in">
        <div>
            <h1 className="text-4xl font-bold font-display text-deep-charcoal mb-4">Core Features</h1>
            <p className="text-xl text-gray-600">A detailed walkthrough of SocialCraft AI's powerful toolset.</p>
        </div>

        <section className="space-y-8">
            <h2 className="text-2xl font-bold text-deep-charcoal border-b border-terracotta/30 pb-2">The Content Generator</h2>
            <p className="text-gray-700 text-lg">
                The Content Generator is the heart of SocialCraft AI. It transforms ideas, URLs, or documents into optimized social media posts.
            </p>

            <div className="grid md:grid-cols-2 gap-6">
                <FeatureHighlight
                    title="Multi-Platform Support"
                    description="Generate content for Twitter, LinkedIn, Instagram, and TikTok simultaneously, with each post optimized for the specific platform's algorithm."
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
    </div>
);

const AgenticTrendsDocs = () => (
    <div className="space-y-12 animate-fade-in">
        <div>
            <h1 className="text-4xl font-bold font-display text-deep-charcoal mb-4">Trend Scout Agent</h1>
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-sage-green/10 text-sage-green text-sm font-medium mb-4">
                <Zap className="w-4 h-4 mr-2" /> New Agentic Feature
            </div>
            <p className="text-xl text-gray-600">
                Your autonomous research assistant that finds viral opportunities before they peak.
            </p>
        </div>

        <section className="space-y-6">
            <h2 className="text-2xl font-bold text-deep-charcoal">How It Works</h2>
            <p className="text-gray-700 leading-relaxed">
                The Trend Scout Agent uses advanced Google Search Grounding to scan the live web for emerging topics, news, and discussions in your specific niche. It doesn't just search; it analyzes sentiment, engagement potential, and relevance to your brand.
            </p>

            <div className="bg-white/60 rounded-xl p-6 border border-sage-green/20">
                <h3 className="font-bold text-lg mb-4">Workflow</h3>
                <ol className="list-decimal list-inside space-y-3 text-gray-700">
                    <li><strong>Input Niche:</strong> Enter your industry or topic (e.g., "SaaS Marketing", "Sustainable Fashion").</li>
                    <li><strong>Agent Analysis:</strong> The agent scans news sites, forums, and social signals.</li>
                    <li><strong>Report Generation:</strong> You receive a comprehensive Trend Report with 3-5 high-potential topics.</li>
                    <li><strong>Actionable Insights:</strong> Each trend comes with a "Why it matters" analysis and a "Content Angle" suggestion.</li>
                </ol>
            </div>
        </section>
    </div>
);

const BrandAmplifierDocs = () => (
    <div className="space-y-12 animate-fade-in">
        <div>
            <h1 className="text-4xl font-bold font-display text-deep-charcoal mb-4">Brand Amplifier</h1>
            <p className="text-xl text-gray-600">
                Scale your presence without losing your soul. The Brand Amplifier combines your unique voice with trending topics.
            </p>
        </div>

        <section className="space-y-6">
            <h2 className="text-2xl font-bold text-deep-charcoal">Brand Personas</h2>
            <p className="text-gray-700">
                Stop sounding like a robot. Brand Personas allow you to define exactly how the AI should write.
            </p>
            <ul className="grid gap-4 md:grid-cols-2">
                <li className="p-4 bg-white rounded-lg shadow-sm border border-gray-100">
                    <strong className="block text-sage-green mb-1">Voice Analysis</strong>
                    Upload sample posts, and the AI analyzes your sentence structure, vocabulary, and tone.
                </li>
                <li className="p-4 bg-white rounded-lg shadow-sm border border-gray-100">
                    <strong className="block text-sage-green mb-1">Multiple Personas</strong>
                    Create different personas for different channels (e.g., "Professional CEO" for LinkedIn, "Casual Behind-the-Scenes" for Twitter).
                </li>
            </ul>
        </section>

        <section className="space-y-6">
            <h2 className="text-2xl font-bold text-deep-charcoal">Campaign Generation</h2>
            <p className="text-gray-700">
                The Amplifier takes a Trend Report and your Brand Persona to generate a full week's worth of content in seconds.
            </p>
            <div className="p-4 bg-terracotta/10 rounded-lg border border-terracotta/20">
                <h4 className="font-bold text-terracotta mb-2">Pro Tip: The "Schedule All" Button</h4>
                <p className="text-sm text-deep-charcoal">
                    Once you've reviewed the generated campaign, hit "Schedule All" to automatically queue every post to your content calendar. The Publishing Engine handles the rest.
                </p>
            </div>
        </section>
    </div>
);

const PublishingDocs = () => (
    <div className="space-y-12 animate-fade-in">
        <div>
            <h1 className="text-4xl font-bold font-display text-deep-charcoal mb-4">Publishing Engine</h1>
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm font-medium mb-4">
                <ShieldCheck className="w-4 h-4 mr-2" /> Secure Server-Side
            </div>
            <p className="text-xl text-gray-600">
                Set it and forget it. Our server-side engine handles the actual posting to your social accounts.
            </p>
        </div>

        <section className="space-y-6">
            <h2 className="text-2xl font-bold text-deep-charcoal">How It Works</h2>
            <p className="text-gray-700">
                Unlike some tools that require your browser to be open, SocialCraft AI uses a dedicated backend scheduler.
            </p>
            <div className="grid gap-6 md:grid-cols-3">
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
                    <h3 className="font-bold mb-2">Publish</h3>
                    <p className="text-sm text-gray-600">Our server wakes up at the exact time and pushes the content to the API.</p>
                </div>
            </div>
        </section>

        <section className="space-y-6">
            <h2 className="text-2xl font-bold text-deep-charcoal">Security</h2>
            <p className="text-gray-700">
                We take security seriously. Your social media access tokens are encrypted at rest using AES-256 encryption. We never see your passwords, and you can revoke access at any time.
            </p>
        </section>
    </div>
);

const PlatformsDocs = () => (
    <div className="space-y-12 animate-fade-in">
        <div>
            <h1 className="text-4xl font-bold font-display text-deep-charcoal mb-4">Platform Guides</h1>
            <p className="text-xl text-gray-600">Master the nuances of each network.</p>
        </div>

        <div className="grid gap-8">
            <PlatformGuide
                name="Twitter/X"
                focus="Engagement & Virality"
                tips={[
                    "Use threads for deep dives.",
                    "Keep hooks under 50 characters.",
                    "Engage with replies in the first hour."
                ]}
            />
            <PlatformGuide
                name="LinkedIn"
                focus="Professional Authority"
                tips={[
                    "Focus on 'lessons learned' and personal stories.",
                    "Use carousels for step-by-step guides.",
                    "Avoid external links in the main post."
                ]}
            />
            <PlatformGuide
                name="Instagram"
                focus="Visual Storytelling"
                tips={[
                    "High-contrast visuals stop the scroll.",
                    "Use 3-5 relevant hashtags in the caption.",
                    "Stories are for behind-the-scenes."
                ]}
            />
            <PlatformGuide
                name="TikTok"
                focus="Short-form Video & Trends"
                tips={[
                    "Catchy hook in the first 3 seconds.",
                    "Use trending sounds.",
                    "Keep it raw and authentic."
                ]}
            />
            <PlatformGuide
                name="Pinterest"
                focus="Visual Discovery & Inspiration"
                tips={[
                    "Vertical images work best.",
                    "Keywords in descriptions for SEO.",
                    "Create boards for specific themes."
                ]}
            />
        </div>
    </div>
);

const PlatformGuide = ({ name, focus, tips }: { name: string, focus: string, tips: string[] }) => (
    <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-2xl font-bold text-deep-charcoal mb-2">{name}</h3>
        <p className="text-sage-green font-medium mb-4">Focus: {focus}</p>
        <ul className="space-y-2">
            {tips.map((tip, i) => (
                <li key={i} className="flex items-start text-gray-700">
                    <span className="mr-2 text-terracotta">•</span>
                    {tip}
                </li>
            ))}
        </ul>
    </div>
);

const BillingDocs = () => (
    <div className="space-y-8 animate-fade-in">
        <h1 className="text-4xl font-bold font-display text-deep-charcoal">Billing & Plans</h1>
        <div className="p-6 bg-gradient-to-r from-sage-green/10 to-terracotta/10 rounded-xl border border-sage-green/20">
            <h3 className="text-xl font-bold mb-2">Pro Plan (Most Popular)</h3>
            <p className="text-gray-700 mb-4">Everything you need to grow a personal brand.</p>
            <ul className="space-y-2 text-sm text-gray-700">
                <li>✅ Unlimited AI Generations</li>
                <li>✅ Trend Scout Agent Access</li>
                <li>✅ 3 Brand Personas</li>
                <li>✅ Auto-Scheduling</li>
            </ul>
        </div>
    </div>
);

const FAQDocs = () => (
    <div className="space-y-8 animate-fade-in">
        <h1 className="text-4xl font-bold font-display text-deep-charcoal">FAQ</h1>
        <div className="space-y-6">
            <FAQItem
                question="Do I need my own API keys?"
                answer="No! SocialCraft AI handles all the AI processing. You only need to connect your social media accounts."
            />
            <FAQItem
                question="Can I cancel anytime?"
                answer="Yes, you can cancel your subscription instantly from the Settings page. You'll keep access until the end of your billing period."
            />
            <FAQItem
                question="Is the content unique?"
                answer="Yes. Our AI generates fresh content every time based on your specific inputs and persona. We also include an Originality Review tool to help you add your personal touch."
            />
        </div>
    </div>
);

const FAQItem = ({ question, answer }: { question: string, answer: string }) => (
    <div className="border-b border-gray-200 pb-4">
        <h3 className="text-lg font-bold text-deep-charcoal mb-2">{question}</h3>
        <p className="text-gray-600">{answer}</p>
    </div>
);

const FeatureHighlight = ({ title, description }: { title: string, description: string }) => (
    <div className="p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-all">
        <h3 className="font-bold text-lg text-deep-charcoal mb-2">{title}</h3>
        <p className="text-sm text-gray-600 leading-relaxed">{description}</p>
    </div>
);

export default DocsView;
