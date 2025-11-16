import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, TrendingUp, BarChart3, Zap, Target, Brain, CheckCircle, ArrowRight, BookOpen, MessageSquare, Image as ImageIcon, Twitter, Linkedin, Instagram, Pin } from 'lucide-react';

// TikTok Logo Component
const TikTokIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
  </svg>
);

// Import images
import heroVisual from '../images/content-creation.png';
import analyticsImage from '../images/analytics-dashboard.png';
import platformsImage from '../images/platforms-visual.png';

interface LandingViewProps {
  onOpenAuth: () => void;
}

const LandingView: React.FC<LandingViewProps> = ({ onOpenAuth }) => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    onOpenAuth();
  };

  const handleTryDemo = () => {
    navigate('/generator');
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-32 pb-24 overflow-hidden bg-gradient-to-br from-warm-gray via-warm-white to-warm-gray">
        <div className="hero-bg"></div>
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left Column - Text Content */}
            <div className="space-y-8 reveal-element">
              <div className="inline-flex items-center px-4 py-2 bg-white rounded-full shadow-soft border border-sage-green/20">
                <Sparkles className="h-4 w-4 text-terracotta mr-2" />
                <span className="text-sm font-medium text-deep-charcoal">Algorithm-Optimized Content Engine</span>
              </div>

              <h1 className="text-5xl lg:text-7xl font-extrabold font-display text-deep-charcoal leading-tight">
                Create Content That{' '}
                <span className="relative inline-block">
                  <span className="gradient-text">Gets Discovered</span>
                  <svg className="absolute -bottom-2 left-0 w-full h-3" viewBox="0 0 300 12" fill="none">
                    <path d="M2 10C100 2 200 2 298 10" stroke="url(#gradient)" strokeWidth="3" strokeLinecap="round"/>
                    <defs>
                      <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#8B9A8B"/>
                        <stop offset="100%" stopColor="#C4A484"/>
                      </linearGradient>
                    </defs>
                  </svg>
                </span>
              </h1>

              <p className="text-xl text-deep-charcoal leading-relaxed max-w-xl">
                Master every platform's algorithm with AI-powered content that maximizes visibility and engagement. Our intelligent system adapts your content to each platform's unique discovery patterns—from Twitter's engagement signals to LinkedIn's dwell time, Instagram's visual appeal to TikTok's watch metrics.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={handleGetStarted}
                  className="btn-primary px-8 py-4 rounded-xl font-semibold text-lg shadow-elevated flex items-center justify-center group"
                >
                  Start Creating Content
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </button>
                <button
                  onClick={handleTryDemo}
                  className="btn-secondary px-8 py-4 rounded-xl font-semibold text-lg flex items-center justify-center"
                >
                  Try Demo
                </button>
              </div>

              <div className="flex items-center space-x-8 pt-4">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-10 h-10 rounded-full bg-gradient-to-br from-sage-green to-terracotta border-2 border-white flex items-center justify-center text-white text-sm font-bold">
                      {String.fromCharCode(64 + i)}
                    </div>
                  ))}
                </div>
                <div>
                  <div className="flex items-center text-terracotta mb-1">
                    {'★★★★★'.split('').map((star, i) => <span key={i} className="text-sm">{star}</span>)}
                  </div>
                  <p className="text-sm text-deep-charcoal">Trusted by <span className="font-semibold text-deep-charcoal">10,000+</span> creators</p>
                </div>
              </div>
            </div>

            {/* Right Column - Dynamic Symmetrical Platform Network */}
            <div className="reveal-element">
              <div className="relative w-full h-[500px] flex items-center justify-center bg-gradient-to-br from-[#c9c5b8] via-[#d4d0c3] to-[#c9c5b8] rounded-3xl overflow-hidden shadow-lg">

                {/* Animated Background Stars */}
                <div className="absolute inset-0">
                  {[...Array(40)].map((_, i) => {
                    const angle = (i / 40) * Math.PI * 2;
                    const radius = 30 + Math.random() * 60;
                    const x = 50 + Math.cos(angle) * radius;
                    const y = 50 + Math.sin(angle) * radius;
                    return (
                      <div
                        key={`star-${i}`}
                        className="absolute rounded-full bg-white animate-pulse"
                        style={{
                          left: `${x}%`,
                          top: `${y}%`,
                          width: `${Math.random() * 2 + 1}px`,
                          height: `${Math.random() * 2 + 1}px`,
                          opacity: Math.random() * 0.6 + 0.3,
                          animationDelay: `${Math.random() * 3}s`,
                          animationDuration: `${Math.random() * 2 + 2}s`
                        }}
                      />
                    );
                  })}
                </div>

                {/* Rotating Energy Rings */}
                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 500 500">
                  <defs>
                    <linearGradient id="ringGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#8B9A8B" stopOpacity="0.6" />
                      <stop offset="50%" stopColor="#C4A484" stopOpacity="0.8" />
                      <stop offset="100%" stopColor="#8B9A8B" stopOpacity="0.6" />
                    </linearGradient>
                    <linearGradient id="ringGrad2" x1="100%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#C4A484" stopOpacity="0.6" />
                      <stop offset="50%" stopColor="#8B9A8B" stopOpacity="0.8" />
                      <stop offset="100%" stopColor="#C4A484" stopOpacity="0.6" />
                    </linearGradient>
                    <filter id="glow">
                      <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
                      <feMerge>
                        <feMergeNode in="coloredBlur"/>
                        <feMergeNode in="SourceGraphic"/>
                      </feMerge>
                    </filter>
                  </defs>

                  {/* Outer rotating ring */}
                  <circle cx="250" cy="250" r="180" fill="none" stroke="url(#ringGrad1)" strokeWidth="2" opacity="0.4" strokeDasharray="20,10" filter="url(#glow)" className="animate-[spin_15s_linear_infinite]" style={{transformOrigin: '250px 250px'}} />

                  {/* Inner rotating ring (reverse) */}
                  <circle cx="250" cy="250" r="140" fill="none" stroke="url(#ringGrad2)" strokeWidth="2" opacity="0.5" strokeDasharray="15,8" filter="url(#glow)" className="animate-[spin_12s_linear_infinite_reverse]" style={{transformOrigin: '250px 250px'}} />

                  {/* Energy flow connections from center */}
                  <g>
                    {/* Twitter connection - Top */}
                    <path d="M 250 250 L 250 90" stroke="url(#ringGrad1)" strokeWidth="2" opacity="0.6" filter="url(#glow)" strokeDasharray="300" strokeDashoffset="0">
                      <animate attributeName="stroke-dashoffset" values="300;0" dur="2s" repeatCount="indefinite"/>
                    </path>

                    {/* Instagram connection - Right */}
                    <path d="M 250 250 L 390 250" stroke="url(#ringGrad2)" strokeWidth="2" opacity="0.6" filter="url(#glow)" strokeDasharray="300" strokeDashoffset="0">
                      <animate attributeName="stroke-dashoffset" values="300;0" dur="2.2s" repeatCount="indefinite"/>
                    </path>

                    {/* TikTok connection - Bottom */}
                    <path d="M 250 250 L 250 410" stroke="url(#ringGrad1)" strokeWidth="2" opacity="0.6" filter="url(#glow)" strokeDasharray="300" strokeDashoffset="0">
                      <animate attributeName="stroke-dashoffset" values="300;0" dur="1.8s" repeatCount="indefinite"/>
                    </path>

                    {/* LinkedIn connection - Left */}
                    <path d="M 250 250 L 110 250" stroke="url(#ringGrad2)" strokeWidth="2" opacity="0.6" filter="url(#glow)" strokeDasharray="300" strokeDashoffset="0">
                      <animate attributeName="stroke-dashoffset" values="300;0" dur="2.4s" repeatCount="indefinite"/>
                    </path>
                  </g>

                  {/* Liquid Blob Animation */}
                  <g>
                    {/* Main morphing blob */}
                    <path fill="url(#ringGrad1)" opacity="0.4" filter="url(#glow)">
                      <animate attributeName="d"
                        values="
                          M 250,220
                          C 270,220 280,230 280,250
                          C 280,270 270,280 250,280
                          C 230,280 220,270 220,250
                          C 220,230 230,220 250,220 Z;

                          M 250,215
                          C 275,215 285,225 285,250
                          C 285,275 275,285 250,285
                          C 225,285 215,275 215,250
                          C 215,225 225,215 250,215 Z;

                          M 250,218
                          C 268,218 282,232 282,250
                          C 282,268 268,282 250,282
                          C 232,282 218,268 218,250
                          C 218,232 232,218 250,218 Z;

                          M 250,220
                          C 270,220 280,230 280,250
                          C 280,270 270,280 250,280
                          C 230,280 220,270 220,250
                          C 220,230 230,220 250,220 Z"
                        dur="6s"
                        repeatCount="indefinite"/>
                    </path>

                    {/* Secondary blob layer */}
                    <path fill="url(#ringGrad2)" opacity="0.3" filter="url(#glow)">
                      <animate attributeName="d"
                        values="
                          M 250,225
                          C 265,225 275,235 275,250
                          C 275,265 265,275 250,275
                          C 235,275 225,265 225,250
                          C 225,235 235,225 250,225 Z;

                          M 250,222
                          C 268,222 278,232 278,250
                          C 278,268 268,278 250,278
                          C 232,278 222,268 222,250
                          C 222,232 232,222 250,222 Z;

                          M 250,227
                          C 263,227 273,237 273,250
                          C 273,263 263,273 250,273
                          C 237,273 227,263 227,250
                          C 227,237 237,227 250,227 Z;

                          M 250,225
                          C 265,225 275,235 275,250
                          C 275,265 265,275 250,275
                          C 235,275 225,265 225,250
                          C 225,235 235,225 250,225 Z"
                        dur="5s"
                        repeatCount="indefinite"/>
                    </path>

                    {/* Floating orbs inside blob */}
                    {[...Array(8)].map((_, i) => {
                      const angle = (i / 8) * Math.PI * 2;
                      const orbitRadius = 12;
                      return (
                        <circle
                          key={`orb-${i}`}
                          r="3"
                          fill={i % 2 === 0 ? "#8B9A8B" : "#C4A484"}
                          opacity="0.6"
                          filter="url(#glow)">
                          <animate
                            attributeName="cx"
                            values={`250;${250 + Math.cos(angle) * orbitRadius};${250 + Math.cos(angle + Math.PI) * orbitRadius};250`}
                            dur="8s"
                            begin={`${i * 0.5}s`}
                            repeatCount="indefinite"/>
                          <animate
                            attributeName="cy"
                            values={`250;${250 + Math.sin(angle) * orbitRadius};${250 + Math.sin(angle + Math.PI) * orbitRadius};250`}
                            dur="8s"
                            begin={`${i * 0.5}s`}
                            repeatCount="indefinite"/>
                        </circle>
                      );
                    })}
                  </g>
                </svg>

                {/* Symmetrically Positioned Platform Icons */}
                <div className="absolute inset-0 flex items-center justify-center">

                  {/* Twitter - Top (12 o'clock) */}
                  <div className="absolute top-[10%] left-1/2 -translate-x-1/2">
                    <div className="relative group animate-[float_3s_ease-in-out_infinite]">
                      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#8fa892] to-[#7a9880] shadow-2xl flex items-center justify-center border-2 border-[#8B9A8B]/40 hover:scale-110 transition-transform duration-300">
                        <Twitter className="h-9 w-9 text-white" />
                      </div>
                      <div className="absolute inset-0 rounded-full bg-[#8B9A8B]/30 blur-lg"></div>
                    </div>
                  </div>

                  {/* Instagram - Right (3 o'clock) */}
                  <div className="absolute right-[10%] top-1/2 -translate-y-1/2">
                    <div className="relative group animate-[float_3s_ease-in-out_infinite]" style={{animationDelay: '0.5s'}}>
                      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#d4a68a] to-[#c4967a] shadow-2xl flex items-center justify-center border-2 border-[#C4A484]/40 hover:scale-110 transition-transform duration-300">
                        <Instagram className="h-9 w-9 text-white" />
                      </div>
                      <div className="absolute inset-0 rounded-full bg-[#C4A484]/30 blur-lg"></div>
                    </div>
                  </div>

                  {/* TikTok - Bottom (6 o'clock) */}
                  <div className="absolute bottom-[10%] left-1/2 -translate-x-1/2">
                    <div className="relative group animate-[float_3s_ease-in-out_infinite]" style={{animationDelay: '1s'}}>
                      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#a8b8a8] to-[#98a898] shadow-2xl flex items-center justify-center border-2 border-[#8B9A8B]/40 hover:scale-110 transition-transform duration-300">
                        <TikTokIcon className="h-9 w-9 text-white" />
                      </div>
                      <div className="absolute inset-0 rounded-full bg-[#8B9A8B]/30 blur-lg"></div>
                    </div>
                  </div>

                  {/* LinkedIn - Left (9 o'clock) */}
                  <div className="absolute left-[10%] top-1/2 -translate-y-1/2">
                    <div className="relative group animate-[float_3s_ease-in-out_infinite]" style={{animationDelay: '1.5s'}}>
                      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-700 to-blue-600 shadow-2xl flex items-center justify-center border-2 border-blue-500/40 hover:scale-110 transition-transform duration-300">
                        <Linkedin className="h-10 w-10 text-white" />
                      </div>
                      <div className="absolute inset-0 rounded-full bg-blue-500/30 blur-lg"></div>
                    </div>
                  </div>
                </div>

                {/* Sparkle Effects - Bottom */}
                <div className="absolute bottom-0 left-0 right-0 h-32 overflow-hidden">
                  <div className="absolute inset-0 flex items-end justify-center">
                    {[...Array(50)].map((_, i) => (
                      <div
                        key={`sparkle-${i}`}
                        className="w-0.5 bg-gradient-to-t from-white/60 via-white/30 to-transparent rounded-full animate-pulse"
                        style={{
                          height: `${Math.random() * 50 + 15}px`,
                          marginLeft: `${i * 2}px`,
                          animationDelay: `${Math.random() * 3}s`,
                          animationDuration: `${Math.random() * 2 + 1.5}s`,
                          opacity: Math.random() * 0.6 + 0.2
                        }}
                      />
                    ))}
                  </div>
                </div>

                {/* Algorithm Badge */}
                <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 glass-card rounded-2xl px-6 py-3 bg-white shadow-elevated border-2 border-sage-green/20 whitespace-nowrap">
                  <div className="flex items-center space-x-2">
                    <Sparkles className="h-5 w-5 text-sage-green" />
                    <span className="text-sm font-semibold text-deep-charcoal">Algorithm-Optimized</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Smart Content Analysis Section */}
      <section id="features" className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-4xl lg:text-5xl font-bold font-display text-deep-charcoal">
              Algorithm-Powered <span className="gradient-text">Content Engine</span>
            </h2>
            <p className="text-xl text-deep-charcoal max-w-3xl mx-auto leading-relaxed">
              Create content that every platform's algorithm loves. Our AI understands each platform's unique ranking factors and optimizes your content for maximum visibility, reach, and engagement.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            <FeatureCard
              icon={<BookOpen className="h-8 w-8" />}
              iconColor="from-sage-green to-sage-green/80"
              title="Platform Algorithm Mastery"
              description="Our AI adapts your content to each platform's discovery algorithm—Twitter's engagement metrics, LinkedIn's dwell time, Instagram's visual signals, TikTok's watch patterns."
              features={[
                "Platform-specific optimization",
                "Algorithm ranking factor analysis",
                "Discoverability scoring",
                "Engagement signal optimization"
              ]}
            />

            <FeatureCard
              icon={<MessageSquare className="h-8 w-8" />}
              iconColor="from-terracotta to-terracotta/80"
              title="Viral Playbooks"
              description="Access proven content frameworks with 85-94% success rates, each optimized for platform algorithms and user behavior patterns."
              features={[
                "11+ algorithm-tested playbooks",
                "Platform-specific templates",
                "Discovery-optimized formatting",
                "Strategic engagement hooks"
              ]}
            />

            <FeatureCard
              icon={<ImageIcon className="h-8 w-8" />}
              iconColor="from-soft-blue to-soft-blue/80"
              title="AI Media Studio"
              description="Generate algorithm-friendly visuals that capture attention and boost content visibility across every platform."
              features={[
                "Platform-optimized image generation",
                "Video format adaptation",
                "Visual appeal scoring",
                "Attention-grabbing automation"
              ]}
            />
          </div>
        </div>
      </section>

      {/* Content Workflow Section */}
      <section className="py-24 bg-gradient-to-br from-warm-gray to-warm-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-4xl lg:text-5xl font-bold font-display text-deep-charcoal">
              From Idea to <span className="gradient-text">Maximum Visibility</span>
            </h2>
            <p className="text-xl text-deep-charcoal max-w-3xl mx-auto leading-relaxed">
              Our AI analyzes each platform's algorithm and transforms any content into discovery-optimized posts. Each piece is engineered for maximum reach, leveraging platform-specific ranking signals and engagement patterns.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto items-center">
            {/* Left Side - Visual */}
            <div className="space-y-6">
              <div className="glass-card rounded-2xl p-6 bg-white shadow-medium hover-lift">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-sage-green to-sage-green/80 flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl">✨</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold font-display text-deep-charcoal mb-2">Input: Any Content Source</h3>
                    <p className="text-sm text-deep-charcoal">URL, text, research paper, or product description</p>
                    <div className="mt-3 p-3 bg-warm-gray rounded-lg">
                      <p className="text-xs text-gray-700 line-clamp-3">Example: "Launching a new AI-powered project management tool that helps teams collaborate 3x faster..."</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-center py-4">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-sage-green rounded-full animate-pulse"></div>
                  <div className="w-2 h-2 bg-terracotta rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                  <div className="w-2 h-2 bg-soft-blue rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
                  <span className="text-sm font-medium text-deep-charcoal ml-2">AI Processing...</span>
                </div>
              </div>

              <div className="glass-card rounded-2xl p-6 bg-white shadow-medium hover-lift">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-terracotta to-terracotta/80 flex items-center justify-center flex-shrink-0">
                    <Sparkles className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold font-display text-deep-charcoal mb-2">Output: Algorithm-Optimized Content</h3>
                    <div className="space-y-2">
                      <div className="p-3 bg-soft-blue/10 rounded-lg border-l-4 border-soft-blue">
                        <p className="text-xs font-medium text-soft-blue/80">Twitter Thread (Engagement-optimized)</p>
                        <p className="text-xs text-soft-blue mt-1">🚀 Most PM tools slow you down. Here's why ours speeds you up 3x... [Format: Hook + Thread for max RT/engagement signals]</p>
                      </div>
                      <div className="p-3 bg-sage-green/10 rounded-lg border-l-4 border-sage-green">
                        <p className="text-xs font-medium text-sage-green/80">LinkedIn Post (Dwell time-optimized)</p>
                        <p className="text-xs text-sage-green mt-1">The future of PM is here. What took teams 3 weeks now takes 7 days... [Format: Storytelling + Visual for max dwell time]</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - Benefits List */}
            <div className="space-y-6">
              <BenefitItem
                icon={<Brain className="h-6 w-6 text-sage-green" />}
                title="Algorithm Intelligence"
                description="Our AI decodes each platform's ranking algorithm and optimizes your content for maximum discoverability. From Twitter's engagement signals to TikTok's watch patterns, we master them all."
              />
              <BenefitItem
                icon={<Target className="h-6 w-6 text-terracotta" />}
                title="Discovery-Optimized Playbooks"
                description="Access 11+ algorithm-tested templates with 85-94% success rates. Each playbook is engineered for platform-specific discovery and visibility patterns."
              />
              <BenefitItem
                icon={<TrendingUp className="h-6 w-6 text-soft-blue" />}
                title="Visibility Amplification"
                description="Leverage real-time trend analysis, optimal posting times, and algorithm-friendly scheduling to maximize your content's reach and discoverability across all platforms."
              />
              <BenefitItem
                icon={<Zap className="h-6 w-6 text-sage-green" />}
                title="End-to-End Discovery Engine"
                description="From algorithm-optimized visuals to performance analytics that reveal what gets discovered—our complete workflow is built for maximum visibility and reach."
              />
            </div>
          </div>
        </div>
      </section>

      {/* Viral Content Optimization Section */}
      <section id="platforms" className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-4xl lg:text-5xl font-bold font-display text-deep-charcoal">
              Master Every <span className="gradient-text">Platform Algorithm</span>
            </h2>
            <p className="text-xl text-deep-charcoal max-w-3xl mx-auto leading-relaxed">
              Each social platform uses unique algorithms to surface content. Our AI understands these discovery mechanisms and optimizes your content for maximum visibility on every platform.
            </p>
          </div>

          {/* Platform Visual */}
          <div className="flex justify-center mb-12">
            <img src={platformsImage} alt="Platform Icons" className="w-full max-w-md" />
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
            <PlatformCard
              platform="Twitter/X"
              color="bg-twitter"
              icon="𝕏"
              description="Optimize for Twitter's engagement-based algorithm that prioritizes retweets, replies, and dwell time."
              features={[
                "Engagement signal optimization",
                "Reply-worthy hooks",
                "Thread structure for max RT",
                "Algorithm-friendly timing"
              ]}
            />

            <PlatformCard
              platform="LinkedIn"
              color="bg-linkedin"
              icon="in"
              description="Master LinkedIn's dwell time algorithm that rewards meaningful engagement and professional value."
              features={[
                "Dwell time maximization",
                "Thought leadership signals",
                "Comment-worthy conclusions",
                "Network amplification triggers"
              ]}
            />

            <PlatformCard
              platform="Instagram"
              color="bg-instagram"
              icon="📷"
              description="Leverage Instagram's visual-first algorithm that prioritizes saves, shares, and watch time."
              features={[
                "Save rate optimization",
                "Explore page targeting",
                "Reel watch time patterns",
                "Visual appeal scoring"
              ]}
            />

            <PlatformCard
              platform="TikTok"
              color="bg-tiktok"
              icon="🎵"
              description="Crack TikTok's watch time algorithm that surfaces content based on completion and rewatch rates."
              features={[
                "Watch time maximization",
                "Rewatch trigger patterns",
                "FYP algorithm signals",
                "SEO keyword optimization"
              ]}
            />
          </div>
        </div>
      </section>

      {/* Complete Platform Features Section */}
      <section className="py-24 bg-gradient-to-br from-warm-gray to-warm-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-4xl lg:text-5xl font-bold font-display text-deep-charcoal">
              Complete <span className="gradient-text">Discovery Toolkit</span>
            </h2>
            <p className="text-xl text-deep-charcoal max-w-3xl mx-auto leading-relaxed">
              From algorithm-optimized creation to strategic scheduling and performance insights—everything you need to maximize content visibility and reach across all platforms.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <FeatureCard
              icon={<Brain className="h-8 w-8" />}
              iconColor="from-sage-green to-sage-green/80"
              title="Trend Intelligence"
              description="Ride algorithmic waves with real-time trend analysis. Create timely content that platforms prioritize, maximizing your visibility during peak discovery moments."
              features={[]}
            />

            <FeatureCard
              icon={<ImageIcon className="h-8 w-8" />}
              iconColor="from-terracotta to-terracotta/80"
              title="Algorithm-Timed Scheduling"
              description="Schedule posts when each platform's algorithm is most active. Our intelligent timing recommendations maximize your content's initial engagement and algorithmic boost."
              features={[]}
            />

            <FeatureCard
              icon={<BarChart3 className="h-8 w-8" />}
              iconColor="from-soft-blue to-soft-blue/80"
              title="Discovery Analytics"
              description="Track what content algorithms favor. Identify discovery patterns, understand visibility metrics, and optimize your strategy based on platform-specific performance data."
              features={[]}
            />
          </div>
        </div>
      </section>

      {/* Analytics Preview Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-4xl lg:text-5xl font-bold font-display text-deep-charcoal">
              Analyze <span className="gradient-text">Performance</span>
            </h2>
            <p className="text-xl text-deep-charcoal max-w-3xl mx-auto leading-relaxed">
              Track engagement, identify trends, and optimize your content strategy with powerful analytics.
            </p>
          </div>

          <div className="max-w-5xl mx-auto">
            {/* Clean Dashboard Visualization */}
            <div className="w-full rounded-2xl shadow-elevated bg-white p-8">
              <div className="grid grid-cols-3 gap-6 mb-8">
                {/* Metric Cards */}
                {[
                  { value: '847K', label: 'Total Reach', color: 'from-sage-green to-sage-green/80' },
                  { value: '12.4%', label: 'Engagement', color: 'from-terracotta to-terracotta/80' },
                  { value: '94%', label: 'Success Rate', color: 'from-soft-blue to-soft-blue/80' }
                ].map((metric, i) => (
                  <div key={i} className="glass-card rounded-xl p-6">
                    <div className={`text-4xl font-bold bg-gradient-to-br ${metric.color} bg-clip-text text-transparent mb-2`}>
                      {metric.value}
                    </div>
                    <div className="text-sm text-deep-charcoal/60">{metric.label}</div>
                  </div>
                ))}
              </div>

              {/* Chart Visualization */}
              <div className="glass-card rounded-xl p-8">
                <svg className="w-full h-64" viewBox="0 0 800 250">
                  <defs>
                    <linearGradient id="chartGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#8B9A8B" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#8B9A8B" stopOpacity="0" />
                    </linearGradient>
                    <linearGradient id="barGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#C4A484" stopOpacity="0.9" />
                      <stop offset="100%" stopColor="#8B9A8B" stopOpacity="0.9" />
                    </linearGradient>
                  </defs>

                  {/* Bar Chart Section */}
                  <g>
                    {[
                      { x: 50, height: 120 },
                      { x: 110, height: 160 },
                      { x: 170, height: 100 },
                      { x: 230, height: 190 },
                      { x: 290, height: 140 },
                      { x: 350, height: 175 }
                    ].map((bar, i) => (
                      <rect
                        key={i}
                        x={bar.x}
                        y={230 - bar.height}
                        width="40"
                        height={bar.height}
                        fill="url(#barGrad)"
                        rx="4"
                        className="transition-all hover:opacity-80"
                      />
                    ))}
                    <line x1="30" y1="230" x2="410" y2="230" stroke="#e5e7eb" strokeWidth="2"/>
                  </g>

                  {/* Line Chart Section */}
                  <g transform="translate(420, 0)">
                    {/* Grid lines */}
                    <line x1="0" y1="60" x2="360" y2="60" stroke="#f3f4f6" strokeWidth="1"/>
                    <line x1="0" y1="120" x2="360" y2="120" stroke="#f3f4f6" strokeWidth="1"/>
                    <line x1="0" y1="180" x2="360" y2="180" stroke="#f3f4f6" strokeWidth="1"/>

                    {/* Area fill */}
                    <path
                      d="M 0,140 L 60,110 L 120,125 L 180,85 L 240,95 L 300,55 L 360,70 L 360,230 L 0,230 Z"
                      fill="url(#chartGrad)"
                    />

                    {/* Line */}
                    <path
                      d="M 0,140 L 60,110 L 120,125 L 180,85 L 240,95 L 300,55 L 360,70"
                      fill="none"
                      stroke="#8B9A8B"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />

                    {/* Data points */}
                    {[
                      { x: 0, y: 140 },
                      { x: 60, y: 110 },
                      { x: 120, y: 125 },
                      { x: 180, y: 85 },
                      { x: 240, y: 95 },
                      { x: 300, y: 55 },
                      { x: 360, y: 70 }
                    ].map((point, i) => (
                      <circle
                        key={i}
                        cx={point.x}
                        cy={point.y}
                        r="5"
                        fill="#8B9A8B"
                        className="transition-all hover:r-7"
                      />
                    ))}

                    <line x1="0" y1="230" x2="360" y2="230" stroke="#e5e7eb" strokeWidth="2"/>
                  </g>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="pricing" className="py-24 bg-gradient-to-br from-sage-green via-sage-green/90 to-soft-blue relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        </div>
        <div className="container mx-auto px-6 text-center relative z-10">
          <div className="max-w-4xl mx-auto space-y-8">
            <h2 className="text-4xl lg:text-5xl font-bold font-display text-white">
              Ready to Get Discovered on Every Platform?
            </h2>
            <p className="text-xl text-white/90 leading-relaxed">
              Join thousands of creators, marketers, and researchers who are maximizing their social media visibility with algorithm-optimized content, proven discovery strategies, and complete workflow automation.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <button
                onClick={handleGetStarted}
                className="bg-white text-sage-green px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-100 transition-all shadow-elevated inline-flex items-center justify-center group"
              >
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={handleTryDemo}
                className="border-2 border-white text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white hover:text-sage-green transition-all inline-flex items-center justify-center"
              >
                Watch Demo
              </button>
            </div>
            <p className="text-sm text-white/80 pt-4">
              No credit card required • Cancel anytime • Free forever plan available
            </p>

            {/* Trust Badges */}
            <div className="grid md:grid-cols-3 gap-8 pt-12 max-w-3xl mx-auto">
              <div className="text-center">
                <div className="text-4xl font-bold text-white mb-2">10K+</div>
                <div className="text-white/80">Active Users</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-white mb-2">500K+</div>
                <div className="text-white/80">Posts Generated</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-white mb-2">5x</div>
                <div className="text-white/80">Faster Content</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

// Feature Card Component
const FeatureCard: React.FC<{
  icon: React.ReactNode;
  iconColor: string;
  title: string;
  description: string;
  features?: string[];
}> = ({ icon, iconColor, title, description, features = [] }) => (
  <div className="feature-card p-8 group">
    <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${iconColor} flex items-center justify-center mb-6 text-white shadow-medium group-hover:scale-110 transition-transform`}>
      {icon}
    </div>
    <h3 className="text-2xl font-bold font-display text-deep-charcoal mb-4">{title}</h3>
    <p className="text-deep-charcoal mb-6 leading-relaxed">{description}</p>
    {features.length > 0 && (
      <ul className="space-y-3">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start text-sm text-deep-charcoal">
            <span className="text-sage-green mr-2 mt-1">•</span>
            <span>{feature}</span>
          </li>
        ))}
      </ul>
    )}
  </div>
);

// Platform Card Component
const PlatformCard: React.FC<{
  platform: string;
  color: string;
  icon: string;
  description: string;
  features: string[];
}> = ({ platform, color, icon, description, features }) => (
  <div className="feature-card p-6 group">
    <div className={`w-14 h-14 ${color} rounded-xl flex items-center justify-center mb-6 text-white font-bold text-2xl shadow-medium group-hover:scale-110 transition-transform`}>
      {icon}
    </div>
    <h3 className="text-xl font-bold font-display text-deep-charcoal mb-3">{platform}</h3>
    <p className="text-sm text-deep-charcoal mb-6 leading-relaxed">{description}</p>
    <ul className="space-y-2">
      {features.map((feature, index) => (
        <li key={index} className="flex items-start text-xs text-deep-charcoal">
          <span className="text-sage-green mr-2">•</span>
          <span>{feature}</span>
        </li>
      ))}
    </ul>
  </div>
);

// Benefit Item Component
const BenefitItem: React.FC<{
  icon: React.ReactNode;
  title: string;
  description: string;
}> = ({ icon, title, description }) => (
  <div className="flex items-start space-x-4 p-6 feature-card">
    <div className="w-12 h-12 rounded-xl bg-warm-gray flex items-center justify-center flex-shrink-0">
      {icon}
    </div>
    <div>
      <h4 className="font-bold font-display text-deep-charcoal mb-2">{title}</h4>
      <p className="text-sm text-deep-charcoal leading-relaxed">{description}</p>
    </div>
  </div>
);

export default LandingView;