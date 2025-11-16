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
    <div className="space-y-6">
        <div>
            <h1 className="text-3xl font-bold font-display text-deep-charcoal mb-2">Getting Started</h1>
            <p className="text-gray-600">Everything you need to start creating amazing content</p>
        </div>

        <section className="space-y-4">
            <h2 className="text-2xl font-bold text-deep-charcoal">Quick Start Guide</h2>
            <ol className="list-decimal list-inside space-y-3 text-gray-700 ml-4">
                <li className="pl-2">
                    <strong>Create Your Account</strong>
                    <p className="ml-6 mt-1">Sign up with email and password or use OAuth (Google, GitHub)</p>
                </li>
                <li className="pl-2">
                    <strong>Choose Your Plan</strong>
                    <p className="ml-6 mt-1">Start with Free tier (50 generations/month) or try a paid plan with 14-day trial</p>
                </li>
                <li className="pl-2">
                    <strong>Generate Your First Content</strong>
                    <p className="ml-6 mt-1">Navigate to Generator, select platform, enter topic, and click "Generate"</p>
                </li>
                <li className="pl-2">
                    <strong>Review & Use</strong>
                    <p className="ml-6 mt-1">Edit generated content, save to drafts, or post directly</p>
                </li>
            </ol>
        </section>
    </div>
);

const FeaturesDocs = () => (
    <div className="space-y-6">
        <h1 className="text-3xl font-bold font-display text-deep-charcoal">Features Guide</h1>
        <p className="text-gray-600">A deep dive into all of SocialCraft AI's powerful features.</p>

        <section className="space-y-4">
            <h2 className="text-2xl font-bold text-deep-charcoal">Content Generator</h2>
            <p className="text-gray-700">The core of our platform. Generate content for any social media platform in seconds.</p>
        </section>
    </div>
);

const PlatformsDocs = () => (
    <div className="space-y-6">
        <h1 className="text-3xl font-bold font-display text-deep-charcoal">Platform Guides</h1>
        <p className="text-gray-600">Best practices and tips for each social media platform.</p>

        <section className="space-y-4">
            <h2 className="text-2xl font-bold text-deep-charcoal">Twitter/X</h2>
            <p className="text-gray-700">Learn how to create engaging threads and viral tweets.</p>
        </section>
    </div>
);

const BillingDocs = () => (
    <div className="space-y-6">
        <h1 className="text-3xl font-bold font-display text-deep-charcoal">Billing & Subscriptions</h1>
        <p className="text-gray-600">Manage your subscription and billing information.</p>

        <section className="space-y-4">
            <h2 className="text-2xl font-bold text-deep-charcoal">Plans</h2>
            <p className="text-gray-700">We offer a variety of plans to fit your needs. You can upgrade or downgrade at any time.</p>
        </section>
    </div>
);

const FAQDocs = () => (
    <div className="space-y-6">
        <h1 className="text-3xl font-bold font-display text-deep-charcoal">Frequently Asked Questions</h1>
        <p className="text-gray-600">Answers to common questions about SocialCraft AI.</p>

        <section className="space-y-4">
            <h2 className="text-2xl font-bold text-deep-charcoal">General</h2>
            <p className="text-gray-700">Find answers to general questions about our platform.</p>
        </section>
    </div>
);

export default DocsView;
