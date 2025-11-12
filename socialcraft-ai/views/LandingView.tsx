import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, TrendingUp, BarChart3, Zap, Target, Brain, CheckCircle } from 'lucide-react';

interface LandingViewProps {
  onOpenAuth: () => void;
}

const LandingView: React.FC<LandingViewProps> = ({ onOpenAuth }) => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    onOpenAuth();
  };

  const handleTryDemo = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen -mt-16">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="hero-bg"></div>
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="reveal-element">
              <h1 className="text-5xl lg:text-6xl font-extrabold text-deep-charcoal mb-6 leading-tight">
                Transform Your Content Into
                <span className="gradient-text"> Viral Social Media Posts</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                SocialCraft AI analyzes your content, researches real-time trends, and generates platform-optimized posts engineered for maximum engagement. Turn hours of work into minutes.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={handleGetStarted}
                  className="btn-primary px-8 py-4 rounded-lg font-semibold text-lg shadow-medium"
                >
                  <Sparkles className="inline mr-2 h-5 w-5" />
                  Get Started Free
                </button>
                <button
                  onClick={handleTryDemo}
                  className="btn-secondary px-8 py-4 rounded-lg font-semibold text-lg"
                >
                  Try Demo
                </button>
              </div>
              <p className="text-sm text-gray-500 mt-4">
                No credit card required • Free forever plan available
              </p>
            </div>
            <div className="reveal-element floating-element hidden lg:block">
              <div className="glass-card rounded-3xl p-8 shadow-elevated">
                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-sage-green to-soft-blue rounded-xl p-6 text-white">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm font-medium">Content Analysis</span>
                      <Brain className="h-5 w-5" />
                    </div>
                    <div className="text-2xl font-bold">98% Quality Score</div>
                    <p className="text-sm mt-2 opacity-90">Excellent engagement potential</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white rounded-lg p-4 border-2 border-sage-green">
                      <div className="text-3xl font-bold text-sage-green">5x</div>
                      <p className="text-xs text-gray-600 mt-1">Faster Creation</p>
                    </div>
                    <div className="bg-white rounded-lg p-4 border-2 border-terracotta">
                      <div className="text-3xl font-bold text-terracotta">92%</div>
                      <p className="text-xs text-gray-600 mt-1">Engagement Boost</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16 reveal-element">
            <h2 className="text-4xl font-bold text-deep-charcoal mb-4">
              Everything You Need to <span className="gradient-text">Dominate Social Media</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our AI-powered platform combines cutting-edge technology with proven marketing strategies to help you create content that converts.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Brain className="h-8 w-8 text-sage-green" />}
              title="AI Content Generation"
              description="Transform any text, URL, or idea into engaging social media posts optimized for each platform's algorithm."
              features={[
                "Multi-platform optimization",
                "Tone and style customization",
                "E-E-A-T compliance",
                "Hashtag recommendations"
              ]}
            />

            <FeatureCard
              icon={<TrendingUp className="h-8 w-8 text-terracotta" />}
              title="Real-Time Trend Research"
              description="Discover trending topics and viral content patterns to stay ahead of the curve and maximize reach."
              features={[
                "Live trend analysis",
                "Competitor insights",
                "Viral pattern detection",
                "Topic suggestions"
              ]}
            />

            <FeatureCard
              icon={<Target className="h-8 w-8 text-soft-blue" />}
              title="Platform Optimization"
              description="Content tailored for Twitter, LinkedIn, Instagram, and TikTok with platform-specific best practices."
              features={[
                "Character limit optimization",
                "Format recommendations",
                "Engagement predictions",
                "Posting time suggestions"
              ]}
            />

            <FeatureCard
              icon={<BarChart3 className="h-8 w-8 text-sage-green" />}
              title="Analytics Dashboard"
              description="Track performance metrics, engagement rates, and audience insights across all your social channels."
              features={[
                "Real-time analytics",
                "Engagement tracking",
                "Audience demographics",
                "ROI measurement"
              ]}
            />

            <FeatureCard
              icon={<Sparkles className="h-8 w-8 text-terracotta" />}
              title="Content Templates"
              description="Access hundreds of proven templates and playbooks for different industries and content types."
              features={[
                "Industry-specific templates",
                "Viral frameworks",
                "Storytelling structures",
                "Call-to-action formulas"
              ]}
            />

            <FeatureCard
              icon={<Zap className="h-8 w-8 text-soft-blue" />}
              title="Schedule & Automate"
              description="Plan your content calendar and schedule posts across multiple platforms from one dashboard."
              features={[
                "Multi-platform scheduling",
                "Optimal timing suggestions",
                "Content calendar",
                "Automated posting"
              ]}
            />
          </div>
        </div>
      </section>

      {/* Viral Content Optimization Section */}
      <section className="py-20 bg-gradient-to-br from-warm-gray to-warm-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16 reveal-element">
            <h2 className="text-4xl font-bold text-deep-charcoal mb-4">
              Platform-Specific <span className="gradient-text">Viral Optimization</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our AI understands the unique algorithms and engagement patterns of each social platform to maximize your content's viral potential.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <PlatformCard
              platform="Twitter/X"
              color="bg-blue-500"
              icon="𝕏"
              features={[
                "3-second hook optimization",
                "Thread viral potential scoring",
                "Trending hashtag integration",
                "Engagement rate prediction"
              ]}
            />

            <PlatformCard
              platform="LinkedIn"
              color="bg-blue-600"
              icon="in"
              features={[
                "Professional storytelling",
                "Thought leadership positioning",
                "15+ word comment optimization",
                "B2B engagement patterns"
              ]}
            />

            <PlatformCard
              platform="Instagram"
              color="bg-gradient-to-br from-purple-500 to-pink-500"
              icon="📷"
              features={[
                "75% completion rate optimization",
                "Reel viral potential analysis",
                "Save rate optimization",
                "Explore page targeting"
              ]}
            />

            <PlatformCard
              platform="TikTok"
              color="bg-black"
              icon="🎵"
              features={[
                "Pattern interrupt hooks",
                "Rewatch behavior triggers",
                "Trending sound integration",
                "Challenge participation"
              ]}
            />
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16 reveal-element">
            <h2 className="text-4xl font-bold text-deep-charcoal mb-4">
              Trusted by <span className="gradient-text">Marketing Teams</span> Worldwide
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Join thousands of marketers, content creators, and businesses using SocialCraft AI to scale their social media presence.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <StatCard
              number="10K+"
              label="Active Users"
              description="Content creators trust SocialCraft AI"
            />
            <StatCard
              number="500K+"
              label="Posts Generated"
              description="Viral content created monthly"
            />
            <StatCard
              number="5x"
              label="Faster Content"
              description="Average time savings reported"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-sage-green to-soft-blue">
        <div className="container mx-auto px-6 text-center">
          <div className="max-w-4xl mx-auto reveal-element">
            <h2 className="text-4xl font-bold text-white mb-6">
              Ready to Transform Your Social Media Strategy?
            </h2>
            <p className="text-xl text-white/90 mb-8">
              Join thousands of marketers who are already creating better content in less time with SocialCraft AI.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleGetStarted}
                className="bg-white text-sage-green px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-all shadow-elevated"
              >
                Start Free Trial
              </button>
              <button
                onClick={handleTryDemo}
                className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white hover:text-sage-green transition-all"
              >
                Watch Demo
              </button>
            </div>
            <p className="text-sm text-white/80 mt-6">
              No credit card required • Cancel anytime • Free forever plan
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

// Feature Card Component
const FeatureCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  description: string;
  features: string[];
}> = ({ icon, title, description, features }) => (
  <div className="content-card glass-card rounded-2xl p-6 hover-lift">
    <div className="w-12 h-12 rounded-lg bg-warm-gray flex items-center justify-center mb-4">
      {icon}
    </div>
    <h3 className="text-xl font-semibold text-deep-charcoal mb-3">{title}</h3>
    <p className="text-gray-600 mb-4">{description}</p>
    <ul className="space-y-2">
      {features.map((feature, index) => (
        <li key={index} className="flex items-start text-sm text-gray-500">
          <CheckCircle className="h-4 w-4 text-sage-green mr-2 flex-shrink-0 mt-0.5" />
          <span>{feature}</span>
        </li>
      ))}
    </ul>
  </div>
);

// Platform Card Component
const PlatformCard: React.FC<{
  platform: string;
  color: string;
  icon: string;
  features: string[];
}> = ({ platform, color, icon, features }) => (
  <div className="content-card glass-card rounded-2xl p-6">
    <div className={`w-12 h-12 ${color} rounded-lg flex items-center justify-center mb-4`}>
      <span className="text-white font-bold text-xl">{icon}</span>
    </div>
    <h3 className="text-xl font-semibold text-deep-charcoal mb-3">{platform}</h3>
    <ul className="space-y-2">
      {features.map((feature, index) => (
        <li key={index} className="flex items-start text-sm text-gray-500">
          <span className="text-sage-green mr-2">•</span>
          <span>{feature}</span>
        </li>
      ))}
    </ul>
  </div>
);

// Stat Card Component
const StatCard: React.FC<{
  number: string;
  label: string;
  description: string;
}> = ({ number, label, description }) => (
  <div className="glass-card rounded-2xl p-8 text-center hover-lift">
    <div className="text-4xl font-bold gradient-text mb-2">{number}</div>
    <div className="text-xl font-semibold text-deep-charcoal mb-2">{label}</div>
    <p className="text-sm text-gray-600">{description}</p>
  </div>
);

export default LandingView;
