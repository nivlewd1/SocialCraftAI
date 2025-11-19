import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, BookOpen, MessageSquare, Image as ImageIcon, Twitter, Linkedin, Instagram } from 'lucide-react';

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

  // Configuration for orbiting platform icons
  const platformIcons = [
    { Icon: Twitter, color: '#1DA1F2', delay: 0 },
    { Icon: Instagram, color: '#E4405F', delay: 1 },
    { Icon: PinterestIcon, color: '#E60023', delay: 2 },
    { Icon: TikTokIcon, color: '#000000', delay: 3 },
    { Icon: Linkedin, color: '#0077B5', delay: 4 },
  ];

  return (
    <div className="min-h-screen overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative pt-32 pb-24 overflow-hidden bg-gradient-to-br from-[#f5f5f4] via-[#ffffff] to-[#e8e6e1]">
        
        {/* Visual Enhancement: Tech Grid Background Pattern */}
        <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none" 
             style={{ backgroundImage: 'radial-gradient(#2c3e50 1px, transparent 1px)', backgroundSize: '32px 32px' }}>
        </div>

        {/* Visual Enhancement: Ambient Aura to blend Globe with Light Background */}
        <div className="absolute right-0 top-1/4 w-[800px] h-[800px] bg-[#8B9A8B] rounded-full mix-blend-multiply filter blur-[128px] opacity-10 pointer-events-none translate-x-1/2"></div>

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
                <Sparkles className="h-4 w-4 text-[#C4A484] mr-2" />
                <span className="text-sm font-medium text-slate-800">Algorithm-Optimized Content Engine</span>
              </motion.div>

              <motion.h1 variants={itemVariants} className="text-5xl lg:text-7xl font-extrabold font-display text-slate-900 leading-tight tracking-tight">
                Create Content That{' '}
                <span className="relative inline-block">
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#7A897A] via-[#8B9A8B] to-[#C4A484]">Gets Discovered</span>
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
                        <stop offset="0%" stopColor="#8B9A8B" />
                        <stop offset="100%" stopColor="#C4A484" />
                      </linearGradient>
                    </defs>
                  </svg>
                </span>
              </motion.h1>

              <motion.p variants={itemVariants} className="text-xl text-slate-600 leading-relaxed max-w-xl font-light">
                Master every platform's algorithm with AI-powered content that maximizes visibility. Our intelligent system adapts your content to each platform's unique discovery patterns.
              </motion.p>

              <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 pt-2">
                <button
                  onClick={handleGetStarted}
                  className="px-8 py-4 rounded-2xl font-semibold text-lg text-white bg-slate-900 shadow-xl hover:shadow-2xl hover:bg-slate-800 hover:-translate-y-1 transition-all flex items-center justify-center group"
                >
                  Start Creating Content
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </button>
                <button
                  onClick={handleTryDemo}
                  className="px-8 py-4 rounded-2xl font-semibold text-lg text-slate-700 bg-white border border-stone-200 shadow-sm hover:border-stone-300 hover:shadow-md transition-all flex items-center justify-center"
                >
                  Try Demo
                </button>
              </motion.div>

              <motion.div variants={itemVariants} className="flex items-center space-x-8 pt-4">
                <div className="flex -space-x-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-12 h-12 rounded-full bg-gradient-to-br from-[#8B9A8B] to-[#C4A484] border-[3px] border-white flex items-center justify-center text-white text-sm font-bold shadow-sm">
                      {String.fromCharCode(64 + i)}
                    </div>
                  ))}
                </div>
                <div>
                  <div className="flex items-center text-[#C4A484] mb-1">
                    {'★★★★★'.split('').map((star, i) => <span key={i} className="text-lg">{star}</span>)}
                  </div>
                  <p className="text-sm text-slate-500">Trusted by <span className="font-bold text-slate-800">10,000+</span> creators</p>
                </div>
              </motion.div>
            </motion.div>

            {/* Right Column - Cohesive Photorealistic Globe */}
            <motion.div
              className="relative h-[650px] w-full flex items-center justify-center perspective-1000"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
                {/* 1. Backlighting Integration (The Bridge) */}
                {/* Using dark sage to bridge the black space globe to the light background */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-[#2C3E50] rounded-full blur-[80px] opacity-20 pointer-events-none mix-blend-multiply"></div>

                {/* 2. The Photorealistic Globe */}
                <div className="relative z-10 w-96 h-96 rounded-full group">
                    
                    <div className="absolute inset-0 rounded-full overflow-hidden shadow-[0_25px_60px_-15px_rgba(0,0,0,0.4)]">
                        {/* Texture Layer */}
                        <motion.div 
                            className="absolute inset-0 w-full h-full"
                            style={{
                                background: "url('https://upload.wikimedia.org/wikipedia/commons/b/ba/The_earth_at_night.jpg')",
                                backgroundSize: "210% 100%",
                                filter: "contrast(1.1) brightness(1.15) saturate(0.9)" // Slight desaturation to match earthy tones
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

                        {/* Inner Shading - Adjusted for Palette Harmony */}
                        <div className="absolute inset-0 rounded-full shadow-[inset_30px_0px_60px_0px_rgba(0,0,0,0.9),inset_-10px_0px_40px_0px_rgba(139,154,139,0.4)] pointer-events-none"></div>
                        
                        {/* Top Atmospheric Reflection */}
                        <div className="absolute -top-12 left-0 right-0 h-48 bg-gradient-to-b from-[#C4A484]/20 to-transparent blur-2xl pointer-events-none rounded-t-full"></div>
                    </div>
                </div>

                {/* 3. Orbiting Illuminated Icons System */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30">
                    {platformIcons.map((platform, index) => {
                    const totalIcons = platformIcons.length;
                    const duration = 30; 
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
                            className="absolute top-1/2 left-1/2 -ml-9 -mt-9"
                            style={{ transform: `translateX(${orbitRadius}px)` }}
                        >
                            <motion.div
                                // REFINED GLASS ICON STYLING
                                className="w-18 h-18 p-4 rounded-2xl flex items-center justify-center pointer-events-auto cursor-pointer bg-white/90 backdrop-blur-xl border border-white/50 transition-all duration-300"
                                style={{
                                    // Colored Shadow matching brand
                                    boxShadow: `0 8px 32px -8px ${platform.color}55`
                                }}
                                initial={{ rotate: -((index * 360) / totalIcons) }}
                                animate={{ rotate: -((index * 360) / totalIcons + 360) }}
                                transition={{
                                duration: duration,
                                repeat: Infinity,
                                ease: "linear",
                                }}
                                whileHover={{ scale: 1.15, boxShadow: `0 12px 40px -5px ${platform.color}88` }}
                            >
                                {/* Icon Itself */}
                                <platform.Icon 
                                    className="h-8 w-8 relative z-10" 
                                    style={{ color: platform.color }} 
                                />
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

      {/* Smart Content Analysis Section */}
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
              Algorithm-Powered <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#8B9A8B] to-[#C4A484]">Content Engine</span>
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
              Create content that every platform's algorithm loves. Our AI understands each platform's unique ranking factors.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            <FeatureCard
              icon={<BookOpen className="h-8 w-8" />}
              iconColor="from-[#8B9A8B] to-[#7A897A]"
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
              iconColor="from-[#C4A484] to-[#B39373]"
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

      {/* CTA Section */}
      <section id="pricing" className="py-24 bg-gradient-to-br from-[#8B9A8B] via-[#9CA99C] to-[#8B9A8B] relative overflow-hidden">
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
              Ready to Get Discovered on Every Platform?
            </h2>
            <p className="text-xl text-white/90 leading-relaxed">
              Join thousands of creators maximizing their social media visibility with algorithm-optimized content.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <button
                onClick={handleGetStarted}
                className="bg-white text-[#5A665A] px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-50 transition-all shadow-lg inline-flex items-center justify-center group"
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
    className="feature-card p-8 group bg-white rounded-3xl border border-stone-200 shadow-sm hover:shadow-xl transition-all duration-300"
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
            <span className="text-[#8B9A8B] mr-2 mt-1">•</span>
            <span>{feature}</span>
          </li>
        ))}
      </ul>
    )}
  </motion.div>
);

export default LandingView;