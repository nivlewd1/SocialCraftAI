import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Users, Target, Zap, Shield, TrendingUp, Mail } from 'lucide-react';

const AboutView: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="space-y-16">
            {/* Hero Section */}
            <div className="text-center space-y-6">
                <div className="flex justify-center">
                    <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-brand-primary via-brand-glow to-indigo-400 flex items-center justify-center animate-pulse">
                        <Heart className="h-10 w-10 text-white" />
                    </div>
                </div>
                <h1 className="text-5xl md:text-6xl font-extrabold font-display tracking-tight text-surface-900">
                    About <span className="gradient-text">SocialCraft AI</span>
                </h1>
                <p className="text-xl md:text-2xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
                    Empowering creators, marketers, and businesses to craft viral-worthy social media content
                    with the power of AI - because your ideas deserve to be seen.
                </p>
            </div>

            {/* Mission Statement */}
            <div className="glass-card rounded-lg p-12 bg-gradient-to-br from-brand-primary/10 to-brand-glow/10 border border-brand-primary/20">
                <div className="max-w-3xl mx-auto text-center space-y-4">
                    <Target className="h-12 w-12 text-brand-primary mx-auto" />
                    <h2 className="text-3xl font-bold font-display text-surface-900">Our Mission</h2>
                    <p className="text-lg text-gray-700 leading-relaxed">
                        To democratize professional-grade social media content creation, making it accessible,
                        affordable, and effective for everyone - from solo creators to enterprise teams.
                    </p>
                </div>
            </div>

            {/* Our Story */}
            <div className="max-w-4xl mx-auto space-y-6">
                <h2 className="text-3xl font-bold font-display text-surface-900">Our Story</h2>
                <div className="space-y-4 text-gray-700 leading-relaxed">
                    <p>
                        SocialCraft AI was born from a simple observation: creating engaging social media content
                        is time-consuming, expensive, and overwhelming.
                    </p>
                    <p>
                        In 2024, we recognized that while AI had the potential to revolutionize content creation,
                        existing tools were either too generic, too expensive, or lacked the strategic depth that
                        modern social media demands.
                    </p>
                    <p>
                        We set out to build something different - a platform that combines cutting-edge AI with
                        proven content strategies, making professional-grade content creation accessible to everyone.
                    </p>
                </div>
            </div>

            {/* What We Do */}
            <div className="space-y-8">
                <h2 className="text-3xl font-bold font-display text-surface-900 text-center">What We Do</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="glass-card rounded-xl p-6 hover:shadow-xl transition-all">
                        <div className="w-12 h-12 rounded-lg bg-soft-blue flex items-center justify-center mb-4">
                            <Zap className="h-6 w-6 text-white" />
                        </div>
                        <h3 className="text-xl font-bold text-surface-900 mb-2">Platform-Optimized Content</h3>
                        <p className="text-gray-700">
                            Create content tailored for Twitter/X, LinkedIn, Instagram, TikTok, and Pinterest -
                            all optimized for each platform's unique algorithm.
                        </p>
                    </div>

                    <div className="glass-card rounded-xl p-6 hover:shadow-xl transition-all">
                        <div className="w-12 h-12 rounded-lg bg-brand-primary flex items-center justify-center mb-4">
                            <Target className="h-6 w-6 text-white" />
                        </div>
                        <h3 className="text-xl font-bold text-surface-900 mb-2">Proven Playbooks</h3>
                        <p className="text-gray-700">
                            Access battle-tested content templates with 79-94% success rates, based on real
                            performance data from thousands of posts.
                        </p>
                    </div>

                    <div className="glass-card rounded-xl p-6 hover:shadow-xl transition-all">
                        <div className="w-12 h-12 rounded-lg bg-brand-glow flex items-center justify-center mb-4">
                            <TrendingUp className="h-6 w-6 text-white" />
                        </div>
                        <h3 className="text-xl font-bold text-surface-900 mb-2">Algorithm Optimization</h3>
                        <p className="text-gray-700">
                            Our AI understands what makes content perform on each platform, incorporating
                            best practices for maximum reach and engagement.
                        </p>
                    </div>

                    <div className="glass-card rounded-xl p-6 hover:shadow-xl transition-all">
                        <div className="w-12 h-12 rounded-lg bg-soft-blue flex items-center justify-center mb-4">
                            <Users className="h-6 w-6 text-white" />
                        </div>
                        <h3 className="text-xl font-bold text-surface-900 mb-2">Your Voice, Amplified</h3>
                        <p className="text-gray-700">
                            Customize tone, style, and brand personality to ensure every piece of content
                            sounds authentically you.
                        </p>
                    </div>
                </div>
            </div>

            {/* Our Values */}
            <div className="glass-card rounded-lg p-12 space-y-8">
                <h2 className="text-3xl font-bold font-display text-surface-900 text-center">Our Values</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                        <h3 className="text-xl font-bold text-surface-900 mb-2 flex items-center space-x-2">
                            <span className="w-8 h-8 rounded-full bg-brand-primary text-white flex items-center justify-center text-sm font-bold">1</span>
                            <span>Quality Over Quantity</span>
                        </h3>
                        <p className="text-gray-700 ml-10">
                            We believe in creating content that resonates, not just fills a calendar.
                        </p>
                    </div>

                    <div>
                        <h3 className="text-xl font-bold text-surface-900 mb-2 flex items-center space-x-2">
                            <span className="w-8 h-8 rounded-full bg-brand-primary text-white flex items-center justify-center text-sm font-bold">2</span>
                            <span>Transparency</span>
                        </h3>
                        <p className="text-gray-700 ml-10">
                            No hidden fees, no data selling, no surprises. What you see is what you get.
                        </p>
                    </div>

                    <div>
                        <h3 className="text-xl font-bold text-surface-900 mb-2 flex items-center space-x-2">
                            <span className="w-8 h-8 rounded-full bg-brand-primary text-white flex items-center justify-center text-sm font-bold">3</span>
                            <span>Empowerment</span>
                        </h3>
                        <p className="text-gray-700 ml-10">
                            We give you the tools and knowledge to succeed on your own terms.
                        </p>
                    </div>

                    <div>
                        <h3 className="text-xl font-bold text-surface-900 mb-2 flex items-center space-x-2">
                            <span className="w-8 h-8 rounded-full bg-brand-primary text-white flex items-center justify-center text-sm font-bold">4</span>
                            <span>User Privacy</span>
                        </h3>
                        <p className="text-gray-700 ml-10">
                            Your content is yours. We don't train models on your data or share it with third parties.
                        </p>
                    </div>
                </div>
            </div>

            {/* CTA Section */}
            <div className="glass-card rounded-lg p-12 text-center bg-gradient-to-br from-brand-primary/10 to-brand-glow/10 border border-brand-primary/20 space-y-6">
                <h2 className="text-3xl font-bold font-display text-surface-900">
                    Ready to Transform Your Social Media?
                </h2>
                <p className="text-lg text-gray-700 max-w-2xl mx-auto">
                    Join thousands of creators, marketers, and businesses using SocialCraft AI to craft viral-worthy content.
                </p>
                <div className="flex justify-center space-x-4">
                    <button onClick={() => navigate('/generator')} className="btn-primary px-8 py-3 rounded-lg font-semibold">
                        Get Started Free
                    </button>
                    <button onClick={() => navigate('/pricing')} className="px-8 py-3 rounded-lg font-semibold bg-white text-brand-primary border-2 border-brand-primary hover:bg-brand-primary/10 transition-colors">
                        View Pricing
                    </button>
                </div>
            </div>

            {/* Contact Section */}
            <div className="max-w-2xl mx-auto text-center space-y-4">
                <Mail className="h-12 w-12 text-brand-primary mx-auto" />
                <h2 className="text-2xl font-bold font-display text-surface-900">Get in Touch</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700">
                    <div>
                        <p className="font-semibold">General Inquiries</p>
                        <a href="mailto:hello@socialcraftai.com" className="text-brand-primary hover:text-brand-primary">
                            hello@socialcraftai.com
                        </a>
                    </div>
                    <div>
                        <p className="font-semibold">Support</p>
                        <a href="mailto:support@socialcraftai.com" className="text-brand-primary hover:text-brand-primary">
                            support@socialcraftai.com
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AboutView;
