import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, BookOpen, MessageSquare, Image as ImageIcon, Twitter, Linkedin, Instagram, Calendar, RefreshCw, TrendingUp, Megaphone, BarChart3, Zap } from 'lucide-react';

// --- Custom Brand Icons ---

const TikTokIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
  </svg>
);

const PinterestIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.399.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.951-7.252 4.173 0 7.41 2.967 7.41 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.607 0 11.985-5.365 11.985-11.987C23.97 5.367 18.62 0 12.017 0z" />
  </svg>
);

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

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  // Configuration for orbiting platform icons with 3D sphere gradients
  const platformIcons = [
    { Icon: Twitter, color: '#fff', gradient: ['#6BB7F6', '#1DA1F2', '#0C68A6'], label: 'Twitter' },
    { Icon: Instagram, color: '#fff', gradient: ['#FF87A1', '#E4405F', '#8C1A30'], label: 'Instagram' },
    { Icon: PinterestIcon, color: '#fff', gradient: ['#FF6B6B', '#E60023', '#8C0015'], label: 'Pinterest' },
    { Icon: TikTokIcon, color: '#fff', gradient: ['#69C9D0', '#010101', '#000000'], label: 'TikTok' },
    { Icon: Linkedin, color: '#fff', gradient: ['#4A9FD8', '#0077B5', '#004B7A'], label: 'LinkedIn' },
  ];

  return (
    <div className="min-h-screen overflow-x-hidden bg-surface-50">
      {/* Hero Section */}
      <section className="relative pt-32 pb-24 overflow-hidden bg-surface-50">

        {/* Visual Enhancement: Tech Grid Background Pattern */}
        <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none"
             style={{ backgroundImage: 'radial-gradient(#2c3e50 1px, transparent 1px)', backgroundSize: '32px 32px' }}>
        </div>

        {/* Visual Enhancement: Ambient Aura to blend Globe with Light Background */}
        <div className="absolute right-0 top-1/4 w-[800px] h-[800px] bg-brand-primary rounded-full mix-blend-multiply filter blur-[128px] opacity-10 pointer-events-none translate-x-1/2"></div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left Column - Text Content */}
            <motion.div
              className="space-y-8 z-10"
              initial="hidden"
              animate="visible"
              variants={containerVariants}
            >
              <motion.div variants={itemVariants} className="inline-flex items-center px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full shadow-sm border border-stone-200">
                <Sparkles className="h-4 w-4 text-brand-glow mr-2" />
                <span className="text-sm font-medium text-slate-800">AI-Powered Content Automation Platform</span>
              </motion.div>

              <motion.h1 variants={itemVariants} className="text-5xl lg:text-7xl font-extrabold font-display text-slate-900 leading-tight tracking-tight">
                Content That{' '}
                <span className="relative inline-block">
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary via-indigo-500 to-brand-glow">Gets Discovered</span>
                  {/* Enhanced Underline Animation */}
                  <svg className="absolute -bottom-3 left-0 w-full h-3" viewBox="0 0 300 12" fill="none">
                    <motion.path
                      d="M2 10C100 2 200 2 298 10"
                      stroke="url(#gradient)"
                      strokeWidth="4"
                      strokeLinecap="round"
                      initial={{ pathLength: 0, opacity: 0 }}
                      animate={{ pathLength: 1, opacity: 1 }}
                      transition={{ duration: 1.5, delay: 0.5 }}
                    />
                    <defs>
                      <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#4F46E5" />
                        <stop offset="100%" stopColor="#a78bfa" />
                      </linearGradient>
                    </defs>
                  </svg>
                </span>
                <br />
                <span className="text-3xl lg:text-5xl">Created, Scheduled & Auto-Published</span>
              </motion.h1>

              <motion.p variants={itemVariants} className="text-xl text-slate-600 leading-relaxed max-w-xl font-light">
                Generate algorithm-optimized content, schedule posts, and publish automatically to all your social platforms. Set it once, grow forever.
              </motion.p>

              <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 pt-2">
                <button
                  onClick={handleGetStarted}
                  className="px-8 py-4 rounded-xl font-semibold text-lg text-white bg-slate-900 shadow-xl hover:shadow-2xl hover:bg-slate-800 hover:-translate-y-1 transition-all flex items-center justify-center group"
                >
                  Start Creating Content
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </button>
                <button
                  onClick={handleTryDemo}
                  className="px-8 py-4 rounded-xl font-semibold text-lg text-slate-700 bg-white border border-stone-200 shadow-sm hover:border-stone-300 hover:shadow-md transition-all flex items-center justify-center"
                >
                  Try Demo
                </button>
              </motion.div>

              <motion.div variants={itemVariants} className="flex items-center space-x-8 pt-4">
                <div className="flex -space-x-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-12 h-12 rounded-full bg-gradient-to-br from-brand-primary to-brand-glow border-[3px] border-white flex items-center justify-center text-white text-sm font-bold shadow-sm">
                      {String.fromCharCode(64 + i)}
                    </div>
                  ))}
                </div>
                <div>
                  <div className="flex items-center text-brand-glow mb-1">
                    {'★★★★★'.split('').map((star, i) => <span key={i} className="text-lg">{star}</span>)}
                  </div>
                  <p className="text-sm text-slate-500">Trusted by <span className="font-bold text-slate-800">10,000+</span> creators</p>
                </div>
              </motion.div>
            </motion.div>

            {/* Right Column - Enhanced Photorealistic Globe with 3D Spheres */}
            <motion.div
              className="relative h-[650px] w-full flex items-center justify-center perspective-1000"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
                {/* 1. Backlighting Integration (The Bridge) */}
                {/* Using dark surface to bridge the black space globe to the light background */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-surface-900 rounded-full blur-[80px] opacity-20 pointer-events-none mix-blend-multiply"></div>

                {/* 2. The Photorealistic Globe with Darker Atmosphere */}
                <div className="relative z-10 w-96 h-96 rounded-full group">

                    <div className="absolute inset-0 rounded-full overflow-hidden bg-[#000510]">
                        {/* Texture Layer with Enhanced Contrast */}
                        <motion.div
                            className="absolute inset-0 w-full h-full"
                            style={{
                                background: "url('https://upload.wikimedia.org/wikipedia/commons/b/ba/The_earth_at_night.jpg')",
                                backgroundSize: "210% 100%",
                                filter: "contrast(1.2) brightness(1.3) saturate(0.8)"
                            }}
                            animate={{
                                backgroundPosition: ["0% 0%", "-200% 0%"]
                            }}
                            transition={{
                                duration: 60,
                                repeat: Infinity,
                                ease: "linear"
                            }}
                        />

                        {/* Inner Shading - Enhanced for Premium Look */}
                        <div className="absolute inset-0 rounded-full shadow-[inset_40px_0px_70px_0px_rgba(0,0,0,0.95),inset_-15px_0px_50px_0px_rgba(79,70,229,0.5)] pointer-events-none"></div>

                        {/* Atmospheric Reflection with brand-glow */}
                        <div className="absolute -top-12 left-0 right-0 h-48 bg-gradient-to-b from-brand-glow/25 to-transparent blur-2xl pointer-events-none rounded-t-full"></div>

                        {/* Additional Rim Lighting */}
                        <div className="absolute inset-0 rounded-full shadow-[inset_0_0_40px_rgba(79,70,229,0.3)]"></div>
                    </div>
                </div>

                {/* 3. Orbiting 3D Sphere Icons System */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30">
                    {platformIcons.map((platform, index) => {
                    const totalIcons = platformIcons.length;
                    const duration = 40;
                    const orbitRadius = 280; // Increased radius for better spacing around larger globe

                    return (
                        <motion.div
                        key={index}
                        className="absolute inset-0"
                        initial={{ rotate: (index * 360) / totalIcons }}
                        animate={{ rotate: (index * 360) / totalIcons + 360 }}
                        transition={{
                            duration: duration,
                            repeat: Infinity,
                            ease: "linear",
                        }}
                        >
                        <div
                            className="absolute top-1/2 left-1/2 -ml-10 -mt-10"
                            style={{ transform: `translateX(${orbitRadius}px)` }}
                        >
                            <motion.div
                                initial={{ rotate: -((index * 360) / totalIcons) }}
                                animate={{ rotate: -((index * 360) / totalIcons + 360) }}
                                transition={{
                                duration: duration,
                                repeat: Infinity,
                                ease: "linear",
                                }}
                            >
                                {/* 3D Sphere with Radial Gradient */}
                                <motion.div
                                    className="w-20 h-20 rounded-full flex items-center justify-center pointer-events-auto cursor-pointer relative"
                                    style={{
                                        background: `radial-gradient(circle at 30% 30%, ${platform.gradient[0]}, ${platform.gradient[1]}, ${platform.gradient[2]})`,
                                        boxShadow: `
                                            inset 2px 2px 4px rgba(255,255,255,0.4),
                                            inset -4px -4px 10px rgba(0,0,0,0.4),
                                            0 10px 20px rgba(0,0,0,0.3)
                                        `,
                                    }}
                                    whileHover={{
                                        scale: 1.15,
                                        boxShadow: `
                                            inset 3px 3px 6px rgba(255,255,255,0.5),
                                            inset -5px -5px 12px rgba(0,0,0,0.5),
                                            0 15px 30px rgba(0,0,0,0.4)
                                        `
                                    }}
                                    transition={{ duration: 0.2 }}
                                >
                                    {/* Specular Highlight */}
                                    <div className="absolute top-3 left-3 w-6 h-4 bg-white/20 rounded-full blur-[2px] transform -rotate-45"></div>

                                    {/* Icon */}
                                    <platform.Icon
                                        className="h-8 w-8 relative z-10 drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]"
                                        style={{ color: '#FFFFFF' }}
                                    />
                                </motion.div>
                            </motion.div>
                        </div>
                        </motion.div>
                    );
                    })}
                </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Content Generation Section */}
      <section id="features" className="py-24 bg-white relative z-20">
        <div className="container mx-auto px-6">
          <motion.div
            className="text-center mb-16 space-y-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl lg:text-5xl font-bold font-display text-slate-900">
              Algorithm-Powered <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-brand-glow">Content Engine</span>
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
              Create content that every platform's algorithm loves. Our AI understands each platform's unique ranking factors.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            <FeatureCard
              icon={<BookOpen className="h-8 w-8" />}
              iconColor="from-brand-primary to-indigo-600"
              title="Platform Algorithm Mastery"
              description="Our AI adapts your content to each platform's discovery algorithm—Twitter's engagement metrics, LinkedIn's dwell time, Instagram's visual signals."
              features={[
                "Platform-specific optimization",
                "Algorithm ranking factor analysis",
                "Discoverability scoring",
                "Engagement signal optimization"
              ]}
              delay={0}
            />

            <FeatureCard
              icon={<MessageSquare className="h-8 w-8" />}
              iconColor="from-brand-glow to-purple-400"
              title="Viral Playbooks"
              description="Access proven content frameworks with 85-94% success rates, each optimized for platform algorithms and user behavior patterns."
              features={[
                "11+ algorithm-tested playbooks",
                "Platform-specific templates",
                "Discovery-optimized formatting",
                "Strategic engagement hooks"
              ]}
              delay={0.2}
            />

            <FeatureCard
              icon={<ImageIcon className="h-8 w-8" />}
              iconColor="from-slate-400 to-slate-500"
              title="AI Media Studio"
              description="Generate algorithm-friendly visuals that capture attention and boost content visibility across every platform."
              features={[
                "Platform-optimized image generation",
                "Video format adaptation",
                "Visual appeal scoring",
                "Attention-grabbing automation"
              ]}
              delay={0.4}
            />
          </div>
        </div>
      </section>

      {/* Automation Section */}
      <section className="py-24 bg-surface-50 relative z-20">
        <div className="container mx-auto px-6">
          <motion.div
            className="text-center mb-16 space-y-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl lg:text-5xl font-bold font-display text-slate-900">
              Complete <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-brand-glow">Automation</span>
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
              Schedule once, publish forever. Automate your entire social media workflow from content creation to publishing.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            <FeatureCard
              icon={<Calendar className="h-8 w-8" />}
              iconColor="from-emerald-500 to-teal-600"
              title="Smart Scheduling"
              description="Schedule posts for the perfect time with a visual calendar. Choose exact dates and times for each platform."
              features={[
                "Visual calendar interface",
                "Pick exact posting times",
                "Multi-platform scheduling",
                "Time zone support"
              ]}
              delay={0}
            />

            <FeatureCard
              icon={<RefreshCw className="h-8 w-8" />}
              iconColor="from-blue-500 to-cyan-600"
              title="Recurring Posts"
              description="Set automatic posting frequencies—daily, weekly, or monthly. Create once, let the system handle the rest."
              features={[
                "Daily, weekly, monthly schedules",
                "Custom day selection",
                "14-day advance generation",
                "Pause and resume anytime"
              ]}
              delay={0.2}
            />

            <FeatureCard
              icon={<Zap className="h-8 w-8" />}
              iconColor="from-amber-500 to-orange-600"
              title="Direct Publishing"
              description="Connect your accounts and publish directly to Twitter, LinkedIn, Instagram, TikTok, and Pinterest."
              features={[
                "5 platform integrations",
                "OAuth secure connections",
                "Automatic token refresh",
                "Rate limit protection"
              ]}
              delay={0.4}
            />
          </div>
        </div>
      </section>

      {/* AI Tools Section */}
      <section className="py-24 bg-white relative z-20">
        <div className="container mx-auto px-6">
          <motion.div
            className="text-center mb-16 space-y-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl lg:text-5xl font-bold font-display text-slate-900">
              AI-Powered <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-brand-glow">Tools</span>
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
              Discover trends, amplify your brand, and track performance with intelligent automation.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            <FeatureCard
              icon={<TrendingUp className="h-8 w-8" />}
              iconColor="from-rose-500 to-pink-600"
              title="Trend Scout"
              description="AI agent that analyzes real-time trends, discovers emerging topics, and provides actionable content insights."
              features={[
                "Real-time trend analysis",
                "Google Search grounding",
                "Emerging topic discovery",
                "Content opportunity alerts"
              ]}
              delay={0}
            />

            <FeatureCard
              icon={<Megaphone className="h-8 w-8" />}
              iconColor="from-violet-500 to-purple-600"
              title="Brand Amplifier"
              description="Amplify your brand messaging across platforms with consistent voice and optimized formatting."
              features={[
                "Brand voice consistency",
                "Cross-platform messaging",
                "Tone adaptation",
                "Message optimization"
              ]}
              delay={0.2}
            />

            <FeatureCard
              icon={<BarChart3 className="h-8 w-8" />}
              iconColor="from-sky-500 to-blue-600"
              title="Analytics Dashboard"
              description="Track engagement metrics from all connected platforms in one unified dashboard."
              features={[
                "Unified metrics view",
                "Engagement tracking",
                "Performance insights",
                "Hourly data refresh"
              ]}
              delay={0.4}
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="pricing" className="py-24 bg-gradient-to-br from-brand-primary via-indigo-500 to-brand-primary relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        </div>
        <div className="container mx-auto px-6 text-center relative z-10">
          <motion.div
            className="max-w-4xl mx-auto space-y-8"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl lg:text-5xl font-bold font-display text-white">
              Ready to Automate Your Social Growth?
            </h2>
            <p className="text-xl text-white/90 leading-relaxed">
              Join thousands of creators who generate, schedule, and auto-publish algorithm-optimized content across all platforms.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <button
                onClick={handleGetStarted}
                className="bg-white text-surface-900 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-50 transition-all shadow-lg inline-flex items-center justify-center group"
              >
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={handleTryDemo}
                className="border-2 border-white text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white/10 transition-all inline-flex items-center justify-center"
              >
                Watch Demo
              </button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

// Feature Card Component with Animation
const FeatureCard: React.FC<{
  icon: React.ReactNode;
  iconColor: string;
  title: string;
  description: string;
  features?: string[];
  delay?: number;
}> = ({ icon, iconColor, title, description, features = [], delay = 0 }) => (
  <motion.div
    className="feature-card p-8 group bg-white rounded-lg border border-stone-200 shadow-sm hover:shadow-xl transition-all duration-300"
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay }}
    whileHover={{ y: -10 }}
  >
    <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${iconColor} flex items-center justify-center mb-6 text-white shadow-lg group-hover:scale-110 transition-transform`}>
      {icon}
    </div>
    <h3 className="text-2xl font-bold font-display text-slate-900 mb-4">{title}</h3>
    <p className="text-slate-600 mb-6 leading-relaxed">{description}</p>
    {features.length > 0 && (
      <ul className="space-y-3">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start text-sm text-slate-600">
            <span className="text-brand-primary mr-2 mt-1">•</span>
            <span>{feature}</span>
          </li>
        ))}
      </ul>
    )}
  </motion.div>
);

export default LandingView;
