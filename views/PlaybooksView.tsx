import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { BookOpen, Zap, ChevronRight } from 'lucide-react';

interface PlaybooksViewProps {
  onOpenAuth: () => void;
}

const PlaybooksView: React.FC<PlaybooksViewProps> = ({ onOpenAuth }) => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const playbooks = [
        {
            title: 'Problem/Agitate/Solve Thread',
            platform: 'Twitter/X',
            successRate: 94,
            description: 'A classic copywriting formula to hook your audience and present a solution.',
            content: `(Tweet 1/3)
Struggling with [Common Problem]? It's one of the most frustrating things for [Target Audience].

(Tweet 2/3)
The real issue is [Agitate the Problem]. This leads to [Negative Consequence 1] and [Negative Consequence 2], costing you time and money.

(Tweet 3/3)
We built [Product/Service] to solve this. It helps you [Benefit 1] and [Benefit 2] in minutes.
Learn more: [Link]

(✨ Pro-Tip: Our AI will also generate strategic replies to help you kickstart the conversation below!)`,
        },
        {
            title: 'Contrarian View Thread',
            platform: 'Twitter/X',
            successRate: 89,
            description: 'Challenge a popular belief in your niche to spark conversation.',
            content: `(Tweet 1/2)
Hot take: Everyone in [Your Industry] thinks [Common Belief], but they're missing the bigger picture.

(Tweet 2/2)
The reality is [Your Contrarian Viewpoint]. Why? Because of [Key Reason]. This changes how you should approach [Related Topic].
What are your thoughts on this?

(✨ Pro-Tip: Let our AI suggest some conversation starters to fuel the debate in the replies!)`,
        },
        {
            title: 'LinkedIn Carousel Deep Dive',
            platform: 'LinkedIn',
            successRate: 91,
            description: 'A 5-10 slide carousel that breaks down a complex topic into digestible insights.',
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
        },
        {
            title: 'Instagram Educational Carousel',
            platform: 'Instagram',
            successRate: 92,
            description: 'Teach your audience something valuable in a visually appealing carousel.',
            content: `Topic: [Your Main Topic]

Slide 1 (Hook): [Title of your carousel]
Slide 2: [Your first key tip or point]
Slide 3: [Your second key tip or point]
Slide 4: [A quick example or data point]
Slide 5: [Your final tip or summary]
Slide 6 (CTA): [Ask a question and remind them to SAVE this post!]

(✨ Pro-Tip: The AI will generate a compelling caption and hashtags to go with your carousel plan!)`,
        },
        {
            title: 'TikTok SEO Video Script',
            platform: 'TikTok',
            successRate: 85,
            description: 'A script optimized with keywords to rank in TikTok search results.',
            content: `Topic/Question to Answer: [e.g., "How to start investing with $100"]

Target Keywords: [e.g., "investing for beginners", "stock market 101", "how to invest"]

Key Points to Cover:
1. [First main point]
2. [Second main point]
3. [Third main point or a quick tip]

(✨ Pro-Tip: The AI will generate a full video script, SEO keywords, on-screen text suggestions, and an optimized caption based on this structure!)`,
        },
    ];

    const handleUsePlaybook = (content: string) => {
        if (user) {
            navigate('/generator', { state: { playbookContent: content } });
        } else {
            onOpenAuth();
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="text-center space-y-4">
                <div className="flex justify-center">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-primary to-soft-blue flex items-center justify-center">
                        <BookOpen className="h-8 w-8 text-white" />
                    </div>
                </div>
                <h1 className="text-4xl md:text-5xl font-extrabold font-display tracking-tight text-surface-900">
                    Playbooks
                </h1>
                <p className="text-lg text-gray-600">
                    Battle-tested content templates with proven success rates.
                </p>
            </div>

            <div className="space-y-6">
                {playbooks.map((playbook, index) => (
                    <div key={index} className="feature-card p-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <h2 className="text-xl font-bold font-display text-surface-900 mb-2">{playbook.title}</h2>
                                <div className="flex items-center space-x-4 text-sm text-gray-600 mb-4">
                                    <span className="font-medium">{playbook.platform}</span>
                                    <span className="flex items-center">
                                        <Zap className="h-4 w-4 text-brand-primary mr-1" />
                                        {playbook.successRate}% Success Rate
                                    </span>
                                </div>
                                <p className="text-gray-700">{playbook.description}</p>
                            </div>
                            <button 
                                onClick={() => handleUsePlaybook(playbook.content)}
                                className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-brand-primary text-white hover:bg-brand-primary/90 transition-colors"
                            >
                                <span>Use Playbook</span>
                                <ChevronRight className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PlaybooksView;
