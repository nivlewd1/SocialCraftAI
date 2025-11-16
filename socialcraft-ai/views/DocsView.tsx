import React, { useState } from 'react';
import { Book, Search, ChevronRight, Home, Zap, Layers, HelpCircle, DollarSign } from 'lucide-react';

type DocSection = 'getting-started' | 'features' | 'platforms' | 'billing' | 'faq';

const DocsView: React.FC = () => {
    const [activeSection, setActiveSection] = useState<DocSection>('getting-started');
    const [searchTerm, setSearchTerm] = useState('');

    const sections = [
        { id: 'getting-started' as DocSection, title: 'Getting Started', icon: Home },
        { id: 'features' as DocSection, title: 'Features Guide', icon: Zap },
        { id: 'platforms' as DocSection, title: 'Platform Guides', icon: Layers },
        { id: 'billing' as DocSection, title: 'Billing & Plans', icon: DollarSign },
        { id: 'faq' as DocSection, title: 'FAQ', icon: HelpCircle },
    ];

    return (
        <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar */}
            <div className="lg:w-64 flex-shrink-0">
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
                    <nav className="space-y-2">
                        {sections.map((section) => {
                            const Icon = section.icon;
                            return (
                                <button
                                    key={section.id}
                                    onClick={() => setActiveSection(section.id)}
                                    className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-left transition-colors ${
                                        activeSection === section.id
                                            ? 'bg-sage-green text-white'
                                            : 'hover:bg-warm-gray text-deep-charcoal'
                                    }`}
                                >
                                    <div className="flex items-center space-x-3">
                                        <Icon className="h-5 w-5" />
                                        <span className="font-medium">{section.title}</span>
                                    </div>
                                    <ChevronRight className="h-4 w-4" />
                                </button>
                            );
                        })}
                    </nav>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 space-y-8">
                <div className="glass-card rounded-2xl p-8 md:p-12">
                    {activeSection === 'getting-started' && <GettingStartedDocs />}
                    {activeSection === 'features' && <FeaturesDocs />}
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
    <div className="space-y-8">
        <div>
            <h1 className="text-3xl font-bold font-display text-deep-charcoal">Getting Started</h1>
            <p className="text-gray-600 mt-2">Your journey to effortless content creation begins here. Follow these steps to get set up.</p>
        </div>

        <section className="space-y-6">
            <h2 className="text-2xl font-bold text-deep-charcoal border-b pb-2">Quick Start Guide</h2>
            <div className="space-y-4">
                <div className="flex items-start">
                    <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-sage-green text-white rounded-full font-bold">1</div>
                    <div className="ml-4">
                        <h3 className="text-xl font-semibold text-deep-charcoal">Create Your Account</h3>
                        <p className="text-gray-700 mt-1">
                            Begin by signing up. You can use your email and a secure password, or for faster access, connect with your Google or GitHub account via OAuth.
                        </p>
                    </div>
                </div>
                <div className="flex items-start">
                    <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-sage-green text-white rounded-full font-bold">2</div>
                    <div className="ml-4">
                        <h3 className="text-xl font-semibold text-deep-charcoal">Choose Your Plan</h3>
                        <p className="text-gray-700 mt-1">
                            Explore our plans on the <a href="/pricing" className="text-terracotta hover:underline">Pricing</a> page. Start with the Free tier to get a feel for our platform, or unlock advanced features with a Pro or Business plan—all available with a 14-day free trial.
                        </p>
                    </div>
                </div>
                <div className="flex items-start">
                    <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-sage-green text-white rounded-full font-bold">3</div>
                    <div className="ml-4">
                        <h3 className="text-xl font-semibold text-deep-charcoal">Generate Your First Post</h3>
                        <p className="text-gray-700 mt-1">
                            Navigate to the <a href="/generator" className="text-terracotta hover:underline">Generator</a>. Select a social media platform, enter a topic or keyword, choose a tone, and click "Generate." Our AI will create a post tailored to your specifications in moments.
                        </p>
                    </div>
                </div>
                <div className="flex items-start">
                    <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-sage-green text-white rounded-full font-bold">4</div>
                    <div className="ml-4">
                        <h3 className="text-xl font-semibold text-deep-charcoal">Review, Refine, and Use</h3>
                        <p className="text-gray-700 mt-1">
                            Your generated content will appear in the results area. You can edit the text directly, save it to your <a href="/drafts" className="text-terracotta hover:underline">Drafts</a> for later, or schedule it to be published at the perfect time.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    </div>
);

const FeaturesDocs = () => (
    <div className="space-y-8">
        <div>
            <h1 className="text-3xl font-bold font-display text-deep-charcoal">Features Guide</h1>
            <p className="text-gray-600 mt-2">A deep dive into all of SocialCraft AI's powerful features.</p>
        </div>

        {/* Core Features */}
        <section className="space-y-6">
            <h2 className="text-2xl font-bold text-deep-charcoal border-b pb-2">Core Features</h2>
            <div className="space-y-4">
                <div>
                    <h3 className="text-xl font-semibold text-deep-charcoal">Content Generator</h3>
                    <p className="text-gray-700 mt-1">
                        The heart of SocialCraft AI. Simply input a topic, choose your desired platform, tone, and intent, and our AI will craft compelling social media content in seconds.
                    </p>
                </div>
                <div>
                    <h3 className="text-xl font-semibold text-deep-charcoal">Platform Selector</h3>
                    <p className="text-gray-700 mt-1">
                        Tailor your content for specific platforms. Choose from a simple list or use the advanced selector to fine-tune settings for platforms like Twitter, LinkedIn, Instagram, and more.
                    </p>
                </div>
                <div>
                    <h3 className="text-xl font-semibold text-deep-charcoal">Tone Selector</h3>
                    <p className="text-gray-700 mt-1">
                        Match your brand's voice perfectly. Select from a wide range of tones, such as Professional, Casual, Humorous, or Enthusiastic, to ensure your message resonates with your audience.
                    </p>
                </div>
                <div>
                    <h3 className="text-xl font-semibold text-deep-charcoal">Search Intent Selector</h3>
                    <p className="text-gray-700 mt-1">
                        Optimize your content for search engines and user intent. Choose from intents like Informational, Commercial, or Transactional to align your content with your marketing goals.
                    </p>
                </div>
                <div>
                    <h3 className="text-xl font-semibold text-deep-charcoal">Drafts</h3>
                    <p className="text-gray-700 mt-1">
                        Never lose a great idea. Save your generated content to drafts, where you can review, edit, and organize your posts before scheduling or publishing them.
                    </p>
                </div>
            </div>
        </section>

        {/* Advanced Features */}
        <section className="space-y-6">
            <h2 className="text-2xl font-bold text-deep-charcoal border-b pb-2">Advanced Features</h2>
            <div className="space-y-4">
                <div>
                    <h3 className="text-xl font-semibold text-deep-charcoal">Analytics Dashboard</h3>
                    <p className="text-gray-700 mt-1">
                        Track your content's performance. Our analytics dashboard provides key metrics on engagement, reach, and other important KPIs to help you refine your social media strategy.
                    </p>
                </div>
                <div>
                    <h3 className="text-xl font-semibold text-deep-charcoal">Trend Analysis</h3>
                    <p className="text-gray-700 mt-1">
                        Stay ahead of the curve. Discover trending topics and hashtags relevant to your industry, allowing you to create timely and relevant content that captures audience attention.
                    </p>
                </div>
                <div>
                    <h3 className="text-xl font-semibold text-deep-charcoal">Media Studio</h3>
                    <p className="text-gray-700 mt-1">
                        Create stunning visuals for your posts. The Media Studio helps you design and generate images, videos, and other rich media to accompany your text-based content.
                    </p>
                </div>
                <div>
                    <h3 className="text-xl font-semibold text-deep-charcoal">Scheduling</h3>
                    <p className="text-gray-700 mt-1">
                        Plan your content calendar in advance. Schedule your posts to be published at optimal times, ensuring consistent engagement with your audience without the need for manual posting.
                    </p>
                </div>
                <div>
                    <h3 className="text-xl font-semibold text-deep-charcoal">Templates & Playbooks</h3>
                    <p className="text-gray-700 mt-1">
                        Streamline your content creation process. Use pre-built templates for common post types or create your own playbooks—strategic sequences of content—to automate your campaigns.
                    </p>
                </div>
                <div>
                    <h3 className="text-xl font-semibold text-deep-charcoal">Academic Mode</h3>
                    <p className="text-gray-700 mt-1">
                        Generate high-quality, well-researched content for academic or professional audiences. This mode ensures your content is formal, well-structured, and includes citations if needed.
                    </p>
                </div>
                <div>
                    <h3 className="text-xl font-semibold text-deep-charcoal">Originality Review</h3>
                    <p className="text-gray-700 mt-1">
                        Ensure your content is unique. Our originality checker scans your generated text for plagiarism, giving you confidence that your posts are authentic and original.
                    </p>
                </div>
            </div>
        </section>
    </div>
);

const PlatformsDocs = () => (
    <div className="space-y-8">
        <div>
            <h1 className="text-3xl font-bold font-display text-deep-charcoal">Platform Guides</h1>
            <p className="text-gray-600 mt-2">Best practices and tips for optimizing your content on each social media platform.</p>
        </div>

        <section className="space-y-6">
            <div className="p-6 rounded-lg border border-gray-200">
                <h3 className="text-xl font-semibold text-deep-charcoal">Twitter/X</h3>
                <p className="text-gray-700 mt-2">
                    Ideal for short, impactful updates, and engaging in real-time conversations.
                </p>
                <ul className="list-disc list-inside text-gray-600 mt-2 space-y-1">
                    <li>Keep tweets concise and focused (under 280 characters).</li>
                    <li>Use relevant hashtags to increase visibility.</li>
                    <li>Create threads for longer-form storytelling.</li>
                    <li>Engage with trending topics and conversations in your niche.</li>
                </ul>
            </div>

            <div className="p-6 rounded-lg border border-gray-200">
                <h3 className="text-xl font-semibold text-deep-charcoal">LinkedIn</h3>
                <p className="text-gray-700 mt-2">
                    The premier platform for professional networking, industry insights, and B2B marketing.
                </p>
                <ul className="list-disc list-inside text-gray-600 mt-2 space-y-1">
                    <li>Maintain a professional and authoritative tone.</li>
                    <li>Share valuable industry insights, case studies, and company news.</li>
                    <li>Use professional headshots and high-quality images.</li>
                    <li>Engage with comments to foster a professional community.</li>
                </ul>
            </div>

            <div className="p-6 rounded-lg border border-gray-200">
                <h3 className="text-xl font-semibold text-deep-charcoal">Instagram</h3>
                <p className="text-gray-700 mt-2">
                    A visual-first platform perfect for showcasing brand personality, products, and services.
                </p>
                <ul className="list-disc list-inside text-gray-600 mt-2 space-y-1">
                    <li>Focus on high-quality, visually appealing images and videos.</li>
                    <li>Utilize Stories and Reels for more dynamic and engaging content.</li>
                    <li>Write compelling captions that tell a story or ask a question.</li>
                    <li>Use a mix of popular and niche hashtags to expand your reach.</li>
                </ul>
            </div>

            <div className="p-6 rounded-lg border border-gray-200">
                <h3 className="text-xl font-semibold text-deep-charcoal">TikTok</h3>
                <p className="text-gray-700 mt-2">
                    Dominated by short-form video content, ideal for creative, entertaining, and trend-focused marketing.
                </p>
                <ul className="list-disc list-inside text-gray-600 mt-2 space-y-1">
                    <li>Create short, attention-grabbing videos (15-60 seconds).</li>
                    <li>Incorporate trending sounds and effects to boost visibility.</li>
                    <li>Be authentic, creative, and don't be afraid to show personality.</li>
                    <li>Engage with your audience through comments and duets.</li>
                </ul>
            </div>
        </section>
    </div>
);

const BillingDocs = () => (
    <div className="space-y-8">
        <div>
            <h1 className="text-3xl font-bold font-display text-deep-charcoal">Billing & Subscriptions</h1>
            <p className="text-gray-600 mt-2">Everything you need to know about managing your plan, payments, and subscription details.</p>
        </div>

        <section className="space-y-6">
            <h2 className="text-2xl font-bold text-deep-charcoal border-b pb-2">Our Plans</h2>
            <p className="text-gray-700">
                We offer a range of plans to suit every need, from individuals just starting out to large teams managing multiple brands. You can find a detailed comparison of all our plans on the <a href="/pricing" className="text-terracotta hover:underline">Pricing</a> page.
            </p>
            <ul className="list-disc list-inside text-gray-600 mt-2 space-y-1">
                <li><strong>Free Plan:</strong> Perfect for trying out our core features with a generous monthly generation limit.</li>
                <li><strong>Pro Plan:</strong> Ideal for professionals and small businesses, offering higher limits and access to advanced features like Trend Analysis and Scheduling.</li>
                <li><strong>Business Plan:</strong> Our most comprehensive plan, designed for teams and agencies, with the highest limits, priority support, and team management features.</li>
            </ul>
        </section>

        <section className="space-y-6">
            <h2 className="text-2xl font-bold text-deep-charcoal border-b pb-2">Managing Your Subscription</h2>
            <div className="space-y-4">
                <div>
                    <h3 className="text-xl font-semibold text-deep-charcoal">Upgrading or Downgrading</h3>
                    <p className="text-gray-700 mt-1">
                        You can change your plan at any time from your <a href="/settings" className="text-terracotta hover:underline">Settings</a> page. When you upgrade, you'll be charged a prorated amount for the remainder of the current billing cycle. Downgrades will take effect at the end of your current cycle.
                    </p>
                </div>
                <div>
                    <h3 className="text-xl font-semibold text-deep-charcoal">Updating Payment Information</h3>
                    <p className="text-gray-700 mt-1">
                        Securely manage your payment methods in the billing section of your <a href="/settings" className="text-terracotta hover:underline">Settings</a> page. Our payment processing is handled by Stripe, ensuring your information is always safe.
                    </p>
                </div>
                <div>
                    <h3 className="text-xl font-semibold text-deep-charcoal">Canceling Your Subscription</h3>
                    <p className="text-gray-700 mt-1">
                        We're sorry to see you go! You can cancel your subscription at any time from your <a href="/settings" className="text-terracotta hover:underline">Settings</a> page. Your plan will remain active until the end of the current billing period.
                    </p>
                </div>
            </div>
        </section>
    </div>
);

const FAQDocs = () => (
    <div className="space-y-8">
        <div>
            <h1 className="text-3xl font-bold font-display text-deep-charcoal">Frequently Asked Questions</h1>
            <p className="text-gray-600 mt-2">Find quick answers to common questions about SocialCraft AI.</p>
        </div>

        <div className="space-y-6">
            <div className="border-b pb-4">
                <h3 className="text-lg font-semibold text-deep-charcoal">How does the 14-day free trial work?</h3>
                <p className="text-gray-700 mt-2">
                    When you sign up for a paid plan, you get a 14-day free trial to explore all the features. You can cancel at any time before the trial ends, and you won't be charged. If you continue after the trial, your subscription will begin automatically.
                </p>
            </div>
            <div className="border-b pb-4">
                <h3 className="text-lg font-semibold text-deep-charcoal">Is my data secure?</h3>
                <p className="text-gray-700 mt-2">
                    Absolutely. We prioritize your privacy and security. All your data, including your generated content and personal information, is encrypted and stored securely. We never share your data with third parties.
                </p>
            </div>
            <div className="border-b pb-4">
                <h3 className="text-lg font-semibold text-deep-charcoal">Can I use SocialCraft AI for multiple brands or clients?</h3>
                <p className="text-gray-700 mt-2">
                    Yes! Our Business plan is specifically designed for agencies and social media managers handling multiple clients. It offers higher generation limits and team management features to streamline your workflow.
                </p>
            </div>
            <div className="border-b pb-4">
                <h3 className="text-lg font-semibold text-deep-charcoal">What if I'm not satisfied with the generated content?</h3>
                <p className="text-gray-700 mt-2">
                    Our AI is constantly learning, but if a generation doesn't meet your expectations, you can easily regenerate it. You can also refine your input by adjusting the topic, tone, or platform settings to get a better result. We don't charge for generations that you are not happy with.
                </p>
            </div>
            <div className="border-b pb-4">
                <h3 className="text-lg font-semibold text-deep-charcoal">Do you offer support if I need help?</h3>
                <p className="text-gray-700 mt-2">
                    Yes! We offer email support to all our users. Subscribers to our Pro and Business plans receive priority support for faster assistance. You can contact us through the "Help" link in the footer.
                </p>
            </div>
        </div>
    </div>
);

export default DocsView;
