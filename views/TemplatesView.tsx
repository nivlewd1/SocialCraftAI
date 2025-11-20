import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Platform, Playbook, PlaybookCategory } from '../types';
import { Search, Rocket, Lightbulb, Building2, Calendar, MessageCircle, Twitter, Linkedin, Instagram, Music, LayoutList, Film, Layers, Pin } from 'lucide-react';

interface TemplatesViewProps {
  onOpenAuth: () => void;
}

const platformIcons: { [key in Platform]: React.ReactNode } = {
    [Platform.Twitter]: <Twitter size={16} className="text-surface-900" />,
    [Platform.LinkedIn]: <Linkedin size={16} className="text-surface-900" />,
    [Platform.Instagram]: <Instagram size={16} className="text-surface-900" />,
    [Platform.TikTok]: <Music size={16} className="text-surface-900" />,
    [Platform.Pinterest]: <Pin size={16} className="text-surface-900" />,
};

const playbooks: Playbook[] = [
    {
        title: "Problem/Agitate/Solve Thread",
        description: "A classic copywriting formula, now structured as a thread to grab attention and offer a solution.",
        platforms: [Platform.Twitter, Platform.LinkedIn],
        category: PlaybookCategory.ProductLaunch,
        content: `(Tweet 1/3)
Struggling with [Common Problem]? It's one of the most frustrating things for [Target Audience].

(Tweet 2/3)
The real issue is [Agitate the Problem]. This leads to [Negative Consequence 1] and [Negative Consequence 2], costing you time and money.

(Tweet 3/3)
We built [Product/Service] to solve this. It helps you [Benefit 1] and [Benefit 2] in minutes.
Learn more: [Link]

(✨ Pro-Tip: Our AI will also generate strategic replies to help you kickstart the conversation below!)`,
        icon: <Rocket className="text-white" />,
        successRate: 94,
    },
    {
        title: "Contrarian View Thread",
        description: "Challenge a common belief in your industry to spark debate, now formatted as a compelling thread.",
        platforms: [Platform.LinkedIn, Platform.Twitter],
        category: PlaybookCategory.ThoughtLeadership,
        content: `(Tweet 1/2)
Hot take: Everyone in [Your Industry] thinks [Common Belief], but they're missing the bigger picture.

(Tweet 2/2)
The reality is [Your Contrarian Viewpoint]. Why? Because of [Key Reason]. This changes how you should approach [Related Topic].
What are your thoughts on this?

(✨ Pro-Tip: Let our AI suggest some conversation starters to fuel the debate in the replies!)`,
        icon: <Lightbulb className="text-white" />,
        successRate: 89,
    },
     {
        title: "LinkedIn Carousel Deep Dive",
        description: "A detailed, 8-slide template to create a high-dwell-time carousel that tells a story and drives engagement.",
        platforms: [Platform.LinkedIn],
        category: PlaybookCategory.ThoughtLeadership,
        content: `Topic: [Your Main Topic]

Slide 1 (Hook): [A bold, attention-grabbing title]
Slide 2 (Agenda/Problem): [Briefly state the problem or what the reader will learn]
Slide 3 (Point 1): [Your first key insight or step]
Slide 4 (Point 2): [Your second key insight or step]
Slide 5 (Point 3): [Your third key insight, building on the previous ones]
Slide 6 (Example): [A quick, real-world example to illustrate your points]
Slide 7 (Summary): [Recap the 3 key takeaways in one concise slide]
Slide 8 (Call to Action): [Ask an engaging question and tell readers to comment their thoughts]

(✨ Pro-Tip: The AI will expand on these points to create a full, engaging carousel plan for you!)`,
        icon: <LayoutList className="text-white" />,
        successRate: 91,
    },
     {
        title: "Instagram Educational Carousel",
        description: "Plan a multi-slide post to teach your audience and maximize 'dwell time' on Instagram.",
        platforms: [Platform.Instagram],
        category: PlaybookCategory.ThoughtLeadership,
        content: `Topic: [Your Main Topic]

Slide 1 (Hook): [Title of your carousel]
Slide 2: [Your first key tip or point]
Slide 3: [Your second key tip or point]
Slide 4: [A quick example or data point]
Slide 5: [Your final tip or summary]
Slide 6 (CTA): [Ask a question and remind them to SAVE this post!]

(✨ Pro-Tip: The AI will generate a compelling caption and hashtags to go with your carousel plan!)`,
        icon: <Layers className="text-white" />,
        successRate: 92,
    },
    {
        title: "Viral Instagram Reel Script",
        description: "Get a complete script for a short-form video, including a hook, scenes, and audio ideas.",
        platforms: [Platform.Instagram],
        category: PlaybookCategory.Engagement,
        content: `Reel Topic: [e.g., "3 myths about X"]

Hook: [A short, surprising statement for the first 3 seconds]
Scene 1: [Visual for the first point/myth]
Scene 2: [Visual for the second point/myth]
Scene 3: [Visual for the third point/myth]
Call to Action: [e.g., "Which myth surprised you the most? Let me know in the comments!"]

(✨ Pro-Tip: The AI will flesh this out into a full script with an audio suggestion and an engagement-optimized caption.)`,
        icon: <Film className="text-white" />,
        successRate: 88,
    },
     {
        title: "TikTok SEO Video Script",
        description: "Create a script optimized for TikTok's search algorithm. Includes keywords and on-screen text ideas.",
        platforms: [Platform.TikTok],
        category: PlaybookCategory.Engagement,
        content: `Topic/Question to Answer: [e.g., "How to start investing with $100"]

Target Keywords: [e.g., "investing for beginners", "stock market 101", "how to invest"]

Key Points to Cover:
1. [First main point]
2. [Second main point]
3. [Third main point or a quick tip]

(✨ Pro-Tip: The AI will generate a full video script, SEO keywords, on-screen text suggestions, and an optimized caption based on this structure!)`,
        icon: <Search className="text-white" />,
        successRate: 85,
    },
    {
        title: "SEO-Optimized Pinterest Pin",
        description: "A template for creating a 'fresh pin' that is optimized for Pinterest's visual search engine.",
        platforms: [Platform.Pinterest],
        category: PlaybookCategory.Engagement,
        content: `Topic: [e.g., "DIY home office organization"]

Target Keywords: [e.g., "home office ideas", "small office organization", "desk setup", "productivity hacks"]

Pin Title: [A catchy, keyword-rich title for your pin]

Visual Idea: [Describe a high-quality vertical image with a text overlay. e.g., "A bright, clean desk with labeled organizers. Text overlay: 5 Genius Home Office Hacks"]

(✨ Pro-Tip: The AI will generate a full pin title, a detailed description, and a list of SEO keywords based on your topic.)`,
        icon: <Pin className="text-white" />,
        successRate: 83,
    },
    {
        title: "The Deep Dive Thread",
        description: "Break down a complex topic into an easy-to-understand thread. Perfect for establishing expertise.",
        platforms: [Platform.Twitter, Platform.LinkedIn],
        category: PlaybookCategory.ThoughtLeadership,
        content: `(Tweet 1/4)
Let's break down [Complex Topic]. Most people get it wrong, but it's simpler than you think. 🧵

(Tweet 2/4)
First, you need to understand [Core Concept 1]. Think of it like this: [Simple Analogy].

(Tweet 3/4)
Next, there's [Core Concept 2]. This is crucial because it affects [Key Outcome]. A common mistake is [Common Mistake].

(Tweet 4/4)
Finally, putting it all together means you can [Achieve Desired Result].
If this was helpful, repost it for others!

(✨ Pro-Tip: The AI will generate follow-up questions for you to post in the replies!)`,
        icon: <Lightbulb className="text-white" />,
        successRate: 87,
    },
    {
        title: "Behind-the-Scenes Update",
        description: "Give your audience a sneak peek into your company culture, product development, or daily operations.",
        platforms: [Platform.Instagram, Platform.LinkedIn],
        category: PlaybookCategory.CompanyNews,
        content: "A little behind-the-scenes look at how we [Action, e.g., 'prepare for a new product launch']! 🎬\n\nIt takes a team effort, a lot of coffee, and a passion for [Your Industry]. So proud of what we're building.\n\n#CompanyCulture #BehindTheScenes #[YourIndustry]",
        icon: <Building2 className="text-white" />,
        successRate: 79,
    },
    {
        title: "Upcoming Event Teaser",
        description: "Build hype for a webinar, conference, or online event with a compelling teaser.",
        platforms: [Platform.Twitter, Platform.LinkedIn, Platform.Instagram],
        category: PlaybookCategory.EventPromotion,
        content: "🗓️ Save the date! Something big is coming on [Date].\n\nWe're bringing together experts to discuss [Event Topic]. Get ready to learn, connect, and be inspired.\n\nRegistration opens soon. Drop a 🚀 if you're excited!",
        icon: <Calendar className="text-white" />,
        successRate: 81,
    },
    {
        title: "Two-Sided Question",
        description: "Ask a simple 'This or That?' question related to your industry to drive easy engagement.",
        platforms: [Platform.Twitter, Platform.TikTok, Platform.Instagram],
        category: PlaybookCategory.Engagement,
        content: "Quick poll for all the [Your Target Audience] out there:\n\nWhen it comes to [Topic], are you team:\n\n❤️ [Option A]\n🔁 [Option B]\n\nLet me know in the comments! 👇",
        icon: <MessageCircle className="text-white" />,
        successRate: 86,
    }
];

const categoryColors: { [key in PlaybookCategory]: string } = {
    [PlaybookCategory.ProductLaunch]: 'bg-soft-blue/20 text-soft-blue',
    [PlaybookCategory.ThoughtLeadership]: 'bg-brand-primary/20 text-brand-primary',
    [PlaybookCategory.CompanyNews]: 'bg-surface-100 text-surface-900',
    [PlaybookCategory.EventPromotion]: 'bg-brand-glow/20 text-brand-primary',
    [PlaybookCategory.Engagement]: 'bg-soft-blue/20 text-soft-blue',
}

const categoryIcons: { [key in PlaybookCategory]: { icon: React.ReactNode; bg: string } } = {
    [PlaybookCategory.ProductLaunch]: { icon: <Rocket size={18} className="text-white" />, bg: "bg-soft-blue"},
    [PlaybookCategory.ThoughtLeadership]: { icon: <Lightbulb size={18} className="text-white" />, bg: "bg-brand-primary"},
    [PlaybookCategory.CompanyNews]: { icon: <Building2 size={18} className="text-surface-900" />, bg: "bg-surface-100"},
    [PlaybookCategory.EventPromotion]: { icon: <Calendar size={18} className="text-white" />, bg: "bg-brand-glow"},
    [PlaybookCategory.Engagement]: { icon: <MessageCircle size={18} className="text-white" />, bg: "bg-soft-blue"},
}

const customIcons: { [title: string]: { icon: React.ReactNode; bg: string } } = {
    "LinkedIn Carousel Deep Dive": { icon: <LayoutList size={18} className="text-white" />, bg: "bg-brand-primary" },
    "Instagram Educational Carousel": { icon: <Layers size={18} className="text-white" />, bg: "bg-brand-primary" },
    "Viral Instagram Reel Script": { icon: <Film size={18} className="text-white" />, bg: "bg-soft-blue" },
    "TikTok SEO Video Script": { icon: <Search size={18} className="text-white" />, bg: "bg-brand-glow" },
    "SEO-Optimized Pinterest Pin": { icon: <Pin size={18} className="text-white" />, bg: "bg-brand-glow" },
};

const TemplatesView: React.FC<TemplatesViewProps> = ({ onOpenAuth }) => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [platformFilter, setPlatformFilter] = useState<Platform | 'All'>('All');
    const [categoryFilter, setCategoryFilter] = useState<PlaybookCategory | 'All'>('All');
    const [searchTerm, setSearchTerm] = useState('');

    const filteredPlaybooks = useMemo(() => {
        return playbooks.filter(playbook => {
            const matchesPlatform = platformFilter === 'All' || playbook.platforms.includes(platformFilter);
            const matchesCategory = categoryFilter === 'All' || playbook.category === categoryFilter;
            const matchesSearch = searchTerm === '' ||
                                  playbook.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                  playbook.description.toLowerCase().includes(searchTerm.toLowerCase());
            return matchesPlatform && matchesCategory && matchesSearch;
        }).sort((a, b) => {
            const aRate = a.successRate || 0;
            const bRate = b.successRate || 0;
            return bRate - aRate;
        });
    }, [platformFilter, categoryFilter, searchTerm]);

    const handleUsePlaybook = (content: string) => {
        if (user) {
            navigate('/generator', { state: { playbookContent: content } });
        } else {
            onOpenAuth();
        }
    };

    const allCategories = ['All', ...Object.values(PlaybookCategory)];
    const allPlatforms = ['All', ...Object.values(Platform)];

    return (
        <div className="space-y-8">
            <div className="text-center">
                <h1 className="text-4xl md:text-5xl font-extrabold font-display tracking-tight">
                    Viral Content <span className="gradient-text">Playbooks</span>
                </h1>
                <p className="mt-4 max-w-2xl mx-auto text-lg text-surface-900">
                    Kickstart your content creation with proven, high-engagement playbooks for every platform and goal.
                </p>
            </div>

            <div className="sticky top-16 z-10 bg-[#F8F6F3]/80 backdrop-blur-sm py-4">
              <div className="max-w-5xl mx-auto space-y-4">
                  <div className="relative">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-surface-900" />
                      <input
                          type="text"
                          placeholder="Search playbooks by title or description..."
                          value={searchTerm}
                          onChange={e => setSearchTerm(e.target.value)}
                          className="w-full pl-12 pr-4 py-3 rounded-lg input-field"
                      />
                  </div>
                  <div className="flex flex-wrap gap-2">
                       <span className="text-sm font-semibold self-center pr-2">Category:</span>
                       {allCategories.map(cat => (
                           <button key={cat} onClick={() => setCategoryFilter(cat as any)} className={`px-3 py-1 text-sm font-medium rounded-full transition-colors ${categoryFilter === cat ? 'bg-brand-primary text-white' : 'bg-white hover:bg-surface-100'}`}>
                               {cat}
                           </button>
                       ))}
                  </div>
                  <div className="flex flex-wrap gap-2">
                       <span className="text-sm font-semibold self-center pr-2">Platform:</span>
                       {allPlatforms.map(platform => (
                           <button key={platform} onClick={() => setPlatformFilter(platform as any)} className={`px-3 py-1 text-sm font-medium rounded-full transition-colors ${platformFilter === platform ? 'bg-brand-primary text-white' : 'bg-white hover:bg-surface-100'}`}>
                               {platform}
                           </button>
                       ))}
                  </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPlaybooks.map((playbook) => {
                    const iconInfo = customIcons[playbook.title] || categoryIcons[playbook.category];
                    return (
                        <div key={playbook.title} className="glass-card rounded-xl p-6 flex flex-col justify-between hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                            <div>
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-4 ${iconInfo.bg}`}>
                                    {iconInfo.icon}
                                </div>
                                <h3 className="font-bold font-display text-lg text-surface-900 mb-2">{playbook.title}</h3>
                                <p className="text-surface-900 text-sm mb-4">{playbook.description}</p>
                            </div>
                            <div className="mt-auto">
                                <div className="flex justify-between items-center mb-3">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-md ${categoryColors[playbook.category]}`}>{playbook.category}</span>
                                        {playbook.successRate && (
                                            <span className="flex items-center text-xs font-semibold text-brand-primary">
                                                <span className="w-2 h-2 bg-brand-primary rounded-full mr-1.5"></span>
                                                {playbook.successRate}% success
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="flex justify-between items-center">
                                    <div className="flex space-x-2">
                                        {playbook.platforms.map(p => <span key={p} title={p}>{platformIcons[p]}</span>)}
                                    </div>
                                    <button onClick={() => handleUsePlaybook(playbook.content)} className="text-sm font-semibold text-brand-primary hover:text-brand-primary">
                                        Use Playbook
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
            {filteredPlaybooks.length === 0 && (
                <div className="text-center py-12 text-surface-900">
                    <p className="font-semibold">No playbooks found.</p>
                    <p>Try adjusting your search or filters.</p>
                </div>
            )}
        </div>
    );
};

export default TemplatesView;
