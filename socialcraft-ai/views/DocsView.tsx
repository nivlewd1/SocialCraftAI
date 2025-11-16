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
    <div className="space-y-12">
        <div>
            <h1 className="text-4xl font-bold font-display text-deep-charcoal">Features Guide</h1>
            <p className="text-gray-600 mt-3 text-lg">A detailed walkthrough of SocialCraft AI's powerful toolset.</p>
        </div>

        {/* Content Generator */}
        <section>
            <h2 className="text-3xl font-bold text-deep-charcoal border-b-2 border-terracotta pb-3 mb-6">The Content Generator</h2>
            <div className="space-y-8">
                <p className="text-gray-700">The Content Generator is the core of SocialCraft AI, transforming your ideas, links, or existing content into engaging social media posts. Here’s how to use it step-by-step:</p>
                
                <div>
                    <h3 className="text-xl font-semibold text-deep-charcoal mb-2">Step 1: Provide Your Source Content</h3>
                    <p className="text-gray-700">
                        Start by entering your content into the "Your Source Content" text area. This can be:
                    </p>
                    <ul className="list-disc list-inside text-gray-600 mt-2 space-y-1 pl-4">
                        <li>A simple idea or topic (e.g., "the benefits of remote work").</li>
                        <li>A URL to a blog post, article, or product page.</li>
                        <li>The full text of an article or document you've written.</li>
                    </ul>
                </div>

                <div>
                    <h3 className="text-xl font-semibold text-deep-charcoal mb-2">Step 2: Add Your Author's Voice (Optional but Recommended)</h3>
                    <p className="text-gray-700">
                        This is where you can inject your unique expertise and personality. In the "Author's Voice & Experience" box, add a personal story, a specific data point you've found, or a unique perspective. This helps our AI demonstrate E-E-A-T (Experience, Expertise, Authoritativeness, and Trustworthiness), making your content more credible and engaging.
                    </p>
                </div>

                <div>
                    <h3 className="text-xl font-semibold text-deep-charcoal mb-2">Step 3: Select Platforms and Formats</h3>
                    <p className="text-gray-700">
                        Choose the social media platforms you want to generate content for. You can select one or more. For platforms like LinkedIn and Instagram, you can also specify a format, such as "Carousel" or "Reel," to get content tailored to that specific format. If you're not sure, just leave it as "Auto."
                    </p>
                </div>

                <div>
                    <h3 className="text-xl font-semibold text-deep-charcoal mb-2">Step 4: Choose a Tone and Search Intent</h3>
                    <p className="text-gray-700">
                        <strong>Tone:</strong> Select a tone that best matches your brand's voice and the message you want to convey. Our AI can generate content in various tones, including:
                    </p>
                    <ul className="list-disc list-inside text-gray-600 mt-2 space-y-1 pl-4">
                        <li><strong>Auto:</strong> Let the AI determine the most suitable tone based on your source content and platform selection.</li>
                        <li><strong>Professional:</strong> Formal and authoritative, ideal for business communications.</li>
                        <li><strong>Funny:</strong> Humorous and light-hearted, great for engaging a casual audience.</li>
                        <li><strong>Educational:</strong> Informative and clear, perfect for explaining complex topics.</li>
                        <li><strong>Inspirational:</strong> Uplifting and motivating, designed to encourage and empower.</li>
                        <li><strong>Conversational:</strong> Friendly and approachable, like talking to a friend.</li>
                        <li><strong>Authoritative:</strong> Confident and expert, establishing credibility.</li>
                        <li><strong>Urgent:</strong> Creates a sense of immediacy, often used for calls to action.</li>
                        <li><strong>Sentimental:</strong> Evokes emotions and personal connection.</li>
                        <li><strong>Crass:</strong> Edgy and provocative (use with caution and audience awareness).</li>
                        <li><strong>Novel:</strong> Unique and creative, for out-of-the-box content.</li>
                    </ul>
                    <p className="text-gray-700 mt-2">
                        <strong>Search Intent:</strong> Optimize your content for how users search online. This helps the AI tailor the message to meet specific audience needs:
                    </p>
                    <ul className="list-disc list-inside text-gray-600 mt-2 space-y-1 pl-4">
                        <li><strong>Auto-Detect:</strong> The AI will analyze your content to infer the most appropriate search intent.</li>
                        <li><strong>Informational:</strong> For content that aims to explain a topic, answer questions, or provide facts (e.g., "How to...").</li>
                        <li><strong>Commercial:</strong> For content where users are researching products or services with the intent to buy (e.g., "Best laptops for...").</li>
                        <li><strong>Transactional:</strong> For content designed to drive a specific action, like a purchase, sign-up, or download (e.g., "Buy now," "Sign up for free trial").</li>
                    </ul>
                </div>

                <div>
                    <h3 className="text-xl font-semibold text-deep-charcoal mb-2">Step 5: Research and Generate</h3>
                    <p className="text-gray-700">
                        You have two options:
                    </p>
                    <ul className="list-disc list-inside text-gray-600 mt-2 space-y-1 pl-4">
                        <li><strong>Research Topic:</strong> Click this to have the AI find trending topics, articles, and discussions related to your source content. You can then use these trends to create more relevant and timely posts.</li>
                        <li><strong>Generate Posts:</strong> When you're ready, click this button. The AI will take all your inputs and generate a set of social media posts for the platforms you selected.</li>
                    </ul>
                </div>

                <div>
                    <h3 className="text-xl font-semibold text-deep-charcoal mb-2">Step 6: Review and Use Your Content</h3>
                    <p className="text-gray-700">
                        The generated posts will appear in the "Results" section. From here, you can:
                    </p>
                    <ul className="list-disc list-inside text-gray-600 mt-2 space-y-1 pl-4">
                        <li>Edit the content directly.</li>
                        <li>Save the posts to your Drafts to work on later.</li>
                        <li>Schedule the posts to be published at a future date.</li>
                    </ul>
                </div>
            </div>
        </section>

        <section>
            <h2 className="text-3xl font-bold text-deep-charcoal border-b-2 border-terracotta pb-3 mb-6">The Content Library</h2>
            <div className="space-y-8">
                <p className="text-gray-700">The Content Library is your personal space to store and manage all your creative assets. It's divided into two sections: Content Drafts and Saved Media.</p>

                <div>
                    <h3 className="text-xl font-semibold text-deep-charcoal mb-2">Content Drafts</h3>
                    <p className="text-gray-700">
                        Never lose a great idea. When you generate content you like, click the "Save as Draft" button in the Results section. This will save the entire session—your source content, author's voice, platform selections, and the generated results—to your Content Drafts.
                    </p>
                    <p className="text-gray-700 mt-2">
                        From the Content Library, you can:
                    </p>
                    <ul className="list-disc list-inside text-gray-600 mt-2 space-y-1 pl-4">
                        <li><strong>View:</strong> Click the eye icon to open a preview of the draft, including all the original settings and results.</li>
                        <li><strong>Load:</strong> Click the pencil icon to load the draft back into the Content Generator. This is useful if you want to regenerate the content with different settings or make tweaks.</li>
                        <li><strong>Delete:</strong> Click the trash can icon to permanently remove the draft.</li>
                    </ul>
                </div>

                <div>
                    <h3 className="text-xl font-semibold text-deep-charcoal mb-2">Saved Media</h3>
                    <p className="text-gray-700">
                        In the Media Studio, you can generate images and videos. When you create something you want to keep, click "Save to Media." This will add it to your Saved Media library. You can then view your saved media and delete anything you no longer need.
                    </p>
                </div>
            </div>
        </section>

        <section>
            <h2 className="text-3xl font-bold text-deep-charcoal border-b-2 border-terracotta pb-3 mb-6">The Content Schedule</h2>
            <div className="space-y-8">
                <p className="text-gray-700">The Content Schedule is your command center for planning and automating your social media presence. It provides a clear calendar view of all your scheduled and published posts.</p>

                <div>
                    <h3 className="text-xl font-semibold text-deep-charcoal mb-2">How to Schedule a Post</h3>
                    <p className="text-gray-700">
                        After generating content, click the "Schedule" button on any post in the Results section. This will open the Scheduling Modal, where you have two options:
                    </p>
                    <ul className="list-disc list-inside text-gray-600 mt-2 space-y-1 pl-4">
                        <li><strong>AI-Suggested Times:</strong> Our AI analyzes your target platform and suggests optimal time slots for maximum engagement. Simply click on a suggested time to schedule your post.</li>
                        <li><strong>Custom Time:</strong> If you have a specific time in mind, use the date and time picker to select your desired publication time, then click "Schedule."</li>
                    </ul>
                </div>

                <div>
                    <h3 className="text-xl font-semibold text-deep-charcoal mb-2">Managing Your Calendar</h3>
                    <p className="text-gray-700">
                        Navigate to the "Schedule" page to see your full content calendar. Posts are grouped by date for clarity.
                    </p>
                    <ul className="list-disc list-inside text-gray-600 mt-2 space-y-1 pl-4">
                        <li><strong>Scheduled Posts:</strong> These posts are marked with a clock icon and are waiting to be "published." You can cancel a scheduled post by clicking the trash can icon.</li>
                        <li><strong>Posted Posts:</strong> Once the scheduled time passes, the post's status will automatically change to "Posted" and the icon will change to a checkmark. This creates a historical record of your content.</li>
                    </ul>
                    <p className="text-gray-700 mt-2">
                        <strong>Note:</strong> This is a simulation. The posts are not actually published to the social media platforms. This feature is for planning and organizational purposes.
                    </p>
                </div>
            </div>
        </section>

        <section>
            <h2 className="text-3xl font-bold text-deep-charcoal border-b-2 border-terracotta pb-3 mb-6">TrendSpotter</h2>
            <div className="space-y-4">
                <p className="text-gray-700">Stay ahead of the curve with TrendSpotter, our real-time trend analysis tool. You can access this feature in two ways:</p>
                <ul className="list-disc list-inside text-gray-600 mt-2 space-y-1 pl-4">
                    <li><strong>From the Generator:</strong> Click the "Research Topic" button to find trends related to your source content.</li>
                    <li><strong>From the Trends Page:</strong> Navigate to the "Trends" page for a dedicated trend analysis tool.</li>
                </ul>
                <p className="text-gray-700 mt-2">
                    Simply enter a topic, URL, or piece of text, and the AI will analyze live web data to provide you with:
                </p>
                <ul className="list-disc list-inside text-gray-600 mt-2 space-y-1 pl-4">
                    <li>An overall summary of the current conversation around your topic.</li>
                    <li>A list of specific, actionable trends with descriptions.</li>
                    <li>Related keywords to help you with SEO.</li>
                    <li>A list of the sources used for the analysis.</li>
                </ul>
                <p className="text-gray-700 mt-2">
                    From the Generator, you can click "Use Trend" to automatically populate your source content with the trend information, allowing you to quickly create relevant and timely posts.
                </p>
            </div>
        </section>

        <section>
            <h2 className="text-3xl font-bold text-deep-charcoal border-b-2 border-terracotta pb-3 mb-6">Analytics Dashboard</h2>
            <div className="space-y-4">
                <p className="text-gray-700">
                    Our Analytics Dashboard is currently in development. Soon, you'll be able to track the performance of your content, monitor engagement metrics, and gain valuable insights into your social media strategy—all without leaving SocialCraft AI.
                </p>
            </div>
        </section>

        <section>
            <h2 className="text-3xl font-bold text-deep-charcoal border-b-2 border-terracotta pb-3 mb-6">Media Studio</h2>
            <div className="space-y-8">
                <p className="text-gray-700">The Media Studio is your creative hub for generating and editing stunning visuals and videos. It's divided into two main sections: Image Generation & Editing and Video Generation.</p>

                <div>
                    <h3 className="text-xl font-semibold text-deep-charcoal mb-2">Image Generation & Editing</h3>
                    <p className="text-gray-700">
                        Create unique images from scratch or edit your own photos with the power of AI.
                    </p>
                    <ul className="list-disc list-inside text-gray-600 mt-2 space-y-1 pl-4">
                        <li><strong>To generate a new image:</strong> Enter a descriptive prompt (e.g., "A futuristic cityscape at sunset"), choose an aspect ratio, and click "Generate Image."</li>
                        <li><strong>To edit an existing image:</strong> Upload your image (JPEG, PNG, or WEBP, up to 5MB), then enter a prompt describing the changes you want to make (e.g., "make the sky look like a Van Gogh painting").</li>
                    </ul>
                    <p className="text-gray-700 mt-2">
                        Once your image is generated, you can download it or save it to your Content Library.
                    </p>
                </div>

                <div>
                    <h3 className="text-xl font-semibold text-deep-charcoal mb-2">Video Generation</h3>
                    <p className="text-gray-700">
                        Bring your ideas to life with AI-powered video generation.
                    </p>
                    <p className="text-gray-700 mt-2">
                        <strong>Important:</strong> Video generation is a powerful feature that requires a Google AI Studio API key with billing enabled. You will be prompted to select your key the first time you use this feature.
                    </p>
                    <ul className="list-disc list-inside text-gray-600 mt-2 space-y-1 pl-4">
                        <li><strong>From a prompt:</strong> Enter a descriptive prompt (e.g., "A high-speed chase through a neon-lit city"), choose an aspect ratio and resolution, and click "Generate Video."</li>
                        <li><strong>From images:</strong> Upload up to 5 reference images and provide a prompt to guide the video generation process. This is great for creating slideshows or animating a sequence of events.</li>
                    </ul>
                    <p className="text-gray-700 mt-2">
                        Video generation can take a few minutes. Once complete, you can download your video or save it to your Content Library.
                    </p>
                </div>
            </div>
        </section>

        <section>
            <h2 className="text-3xl font-bold text-deep-charcoal border-b-2 border-terracotta pb-3 mb-6">Playbooks</h2>
            <div className="space-y-4">
                <p className="text-gray-700">
                    Kickstart your content creation with Playbooks—proven, high-engagement templates for various platforms and goals.
                </p>
                <p className="text-gray-700 mt-2">
                    To use a playbook:
                </p>
                <ul className="list-disc list-inside text-gray-600 mt-2 space-y-1 pl-4">
                    <li>Navigate to the "Playbooks" page.</li>
                    <li>Browse the available playbooks, or use the search and filter options to find one that meets your needs.</li>
                    <li>Click "Use Playbook." This will take you to the Content Generator and pre-fill the source content with the playbook's template.</li>
                    <li>Fill in the bracketed information (e.g., "[Your Product]") in the source content, and then generate your posts as usual.</li>
                </ul>
            </div>
        </section>

        <section>
            <h2 className="text-3xl font-bold text-deep-charcoal border-b-2 border-terracotta pb-3 mb-6">Academic Mode</h2>
            <div className="space-y-4">
                <p className="text-gray-700">
                    The Academic Mode is a specialized tool designed to help researchers and academics translate complex papers into accessible social media content. It bridges the gap between scholarly work and public understanding, making your research more digestible and shareable.
                </p>
                <p className="text-gray-700 mt-2">
                    <strong>How to use Academic Mode:</strong>
                </p>
                <ul className="list-disc list-inside text-gray-600 mt-2 space-y-1 pl-4">
                    <li>Navigate to the <a href="/academic-mode" className="text-terracotta hover:underline">Academic Mode</a> page.</li>
                    <li><strong>Your Research Abstract/URL:</strong> In the designated text area, paste your arXiv URL or the full abstract of your academic paper. The AI will analyze this content to extract key findings and concepts.</li>
                    <li><strong>Researcher's Perspective (Optional):</strong> This crucial step allows you to inject your unique expertise and personal connection to the research. Add personal insights, the "aha!" moment of your discovery, or the real-world implications of your research. This helps humanize the content and demonstrates E-E-A-T (Experience, Expertise, Authoritativeness, and Trustworthiness), making your dissemination more impactful.</li>
                    <li><strong>Select Platforms & Formats:</strong> Choose the social media platforms (e.g., Twitter/X for concise summaries, LinkedIn for professional discussions) and desired formats for your content.</li>
                    <li><strong>Select Tone & Search Intent:</strong> The default tone is "Educational" and search intent is "Informational," which are typically ideal for academic dissemination. However, you can adjust these as needed to suit your specific communication goals.</li>
                    <li>Click "Analyze & Generate Posts." The AI will then craft social media content tailored for public dissemination, maintaining accuracy while enhancing accessibility.</li>
                </ul>
            </div>
        </section>

        <section>
            <h2 className="text-3xl font-bold text-deep-charcoal border-b-2 border-terracotta pb-3 mb-6">Originality Review</h2>
            <div className="space-y-4">
                <p className="text-gray-700">
                    While SocialCraft AI is a powerful tool for content generation, ensuring the originality and unique value of your posts is paramount. The Originality Review feature provides a user-guided checklist to help you critically assess your AI-assisted content.
                </p>
                <p className="text-gray-700 mt-2">
                    <strong>How to use Originality Review:</strong>
                </p>
                <ul className="list-disc list-inside text-gray-600 mt-2 space-y-1 pl-4">
                    <li>After generating content in the <a href="/generator" className="text-terracotta hover:underline">Content Generator</a> or <a href="/academic-mode" className="text-terracotta hover:underline">Academic Mode</a>, navigate to the "Results" section.</li>
                    <li>On each generated content card, you will find a "Review for Originality" button. Click this button to open the Originality Review modal.</li>
                    <li>The modal presents a checklist of questions designed to prompt your critical thinking. These questions encourage you to consider:
                        <ul className="list-disc list-inside text-gray-600 mt-1 space-y-1 pl-4">
                            <li>Whether the post offers a new perspective.</li>
                            <li>If you've added your own original analysis or insights.</li>
                            <li>If the content is significantly more than just a summary of the source.</li>
                            <li>If key facts have been verified.</li>
                            <li>If the content provides real value to your audience.</li>
                        </ul>
                    </li>
                    <li>Review each point carefully. This manual review process is essential for creating "people-first" content that is authentic, trustworthy, and truly valuable.</li>
                </ul>
            </div>
        </section>
    </div>
);

const PlatformsDocs = () => (
    <div className="space-y-12">
        <div>
            <h1 className="text-4xl font-bold font-display text-deep-charcoal">Platform Guides</h1>
            <p className="text-gray-600 mt-3 text-lg">Master each social media platform with tailored strategies and SocialCraft AI features.</p>
        </div>

        <section>
            <h2 className="text-3xl font-bold text-deep-charcoal border-b-2 border-terracotta pb-3 mb-6">Twitter/X</h2>
            <div className="space-y-4">
                <p className="text-gray-700">Twitter/X thrives on concise, impactful messages and real-time engagement. Use SocialCraft AI to craft viral tweets and engaging threads.</p>
                <ul className="list-disc list-inside text-gray-600 mt-2 space-y-1 pl-4">
                    <li><strong>Content Generator:</strong> Input a topic and select "Twitter/X" to generate short, punchy tweets or multi-part threads. Experiment with "Urgent" or "Funny" tones.</li>
                    <li><strong>Playbooks:</strong> Explore playbooks like "Problem/Agitate/Solve Thread" or "Contrarian View Thread" to structure compelling narratives that capture attention.</li>
                    <li><strong>TrendSpotter:</strong> Use the TrendSpotter to identify trending hashtags and topics, then generate content around them for maximum visibility.</li>
                </ul>
            </div>
        </section>

        <section>
            <h2 className="text-3xl font-bold text-deep-charcoal border-b-2 border-terracotta pb-3 mb-6">LinkedIn</h2>
            <div className="space-y-4">
                <p className="text-gray-700">LinkedIn is your professional stage. Use SocialCraft AI to establish thought leadership, share industry insights, and connect with peers.</p>
                <ul className="list-disc list-inside text-gray-600 mt-2 space-y-1 pl-4">
                    <li><strong>Content Generator:</strong> Select "LinkedIn" and choose formats like "Text" for articles or "Carousel" for detailed reports. Opt for a "Professional" or "Authoritative" tone.</li>
                    <li><strong>Playbooks:</strong> Leverage playbooks such as "LinkedIn Carousel Deep Dive" or "The Deep Dive Thread" to break down complex topics and showcase your expertise.</li>
                    <li><strong>Media Studio:</strong> Generate professional images or infographics in the Media Studio to accompany your LinkedIn posts, enhancing visual appeal.</li>
                </ul>
            </div>
        </section>

        <section>
            <h2 className="text-3xl font-bold text-deep-charcoal border-b-2 border-terracotta pb-3 mb-6">Instagram</h2>
            <div className="space-y-4">
                <p className="text-gray-700">Instagram is all about visual storytelling. SocialCraft AI helps you create captivating images, engaging videos, and compelling captions.</p>
                <ul className="list-disc list-inside text-gray-600 mt-2 space-y-1 pl-4">
                    <li><strong>Media Studio:</strong> Design stunning images or short videos directly within the Media Studio. Experiment with different aspect ratios for posts, Stories, or Reels.</li>
                    <li><strong>Content Generator:</strong> Generate creative captions for your visuals by selecting "Instagram." Use "Inspirational" or "Conversational" tones.</li>
                    <li><strong>Playbooks:</strong> Utilize playbooks like "Instagram Educational Carousel" or "Viral Instagram Reel Script" to plan your visual content strategy and maximize engagement.</li>
                </ul>
            </div>
        </section>

        <section>
            <h2 className="text-3xl font-bold text-deep-charcoal border-b-2 border-terracotta pb-3 mb-6">TikTok</h2>
            <div className="space-y-4">
                <p className="text-gray-700">TikTok is the platform for short, entertaining, and trend-driven video content. SocialCraft AI helps you tap into viral trends and create engaging scripts.</p>
                <ul className="list-disc list-inside text-gray-600 mt-2 space-y-1 pl-4">
                    <li><strong>Media Studio:</strong> Generate short, dynamic videos using the Video Generator, perfect for TikTok's fast-paced environment.</li>
                    <li><strong>Content Generator:</strong> Input your video idea and select "TikTok" to get script suggestions, catchy hooks, and relevant hashtags.</li>
                    <li><strong>Playbooks:</strong> Use the "TikTok SEO Video Script" playbook to optimize your content for TikTok's search algorithm and increase discoverability.</li>
                    <li><strong>TrendSpotter:</strong> Quickly identify audio trends and challenges to integrate into your TikTok content for higher reach.</li>
                </ul>
            </div>
        </section>

        <section>
            <h2 className="text-3xl font-bold text-deep-charcoal border-b-2 border-terracotta pb-3 mb-6">Pinterest</h2>
            <div className="space-y-4">
                <p className="text-gray-700">Pinterest acts as a visual search engine, where users discover ideas and inspiration. Optimize your pins for discoverability with SocialCraft AI.</p>
                <ul className="list-disc list-inside text-gray-600 mt-2 space-y-1 pl-4">
                    <li><strong>Media Studio:</strong> Create visually appealing "Idea Pins" or "Standard Pins" with the Image Generator, focusing on high-quality, vertical imagery.</li>
                    <li><strong>Content Generator:</strong> Select "Pinterest" to generate keyword-rich titles and descriptions that improve your pin's search ranking.</li>
                    <li><strong>Playbooks:</strong> Use the "SEO-Optimized Pinterest Pin" playbook to structure your pins for maximum visibility and traffic.</li>
                    <li><strong>TrendSpotter:</strong> Research popular topics and keywords on Pinterest to inform your pin creation and attract a wider audience.</li>
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
