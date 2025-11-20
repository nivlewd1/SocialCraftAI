import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import LandingView from './views/LandingView';
import GeneratorView from './views/GeneratorView';
import DocsView from './views/DocsView';
import TrendsView from "./views/TrendsView";
import PlaybooksView from "./views/PlaybooksView";
import ScheduleView from "./views/ScheduleView";
import SettingsView from "./views/SettingsView";
import MediaStudioView from "./views/MediaStudioView";
import DraftsView from "./views/DraftsView";
import PricingView from "./views/PricingView";
import AboutView from "./views/AboutView";
import PrivacyPolicyView from "./views/PrivacyPolicyView";
import TermsOfServiceView from "./views/TermsOfServiceView";
import CheckoutSuccessView from "./views/CheckoutSuccessView";
import CheckoutCancelView from "./views/CheckoutCancelView";
import TemplatesView from "./views/TemplatesView";
import AcademicModeView from "./views/AcademicModeView";
import { TrendsAgent } from "./views/TrendsAgent";
import { BrandAmplifier } from "./views/BrandAmplifier";
import { AuthModal } from './components/AuthModal';
import Footer from './components/Footer';
import { useAuth } from "./contexts/AuthContext";
import { Menu, X, Sparkles, Book, TrendingUp, Zap, LogOut, User, Layout, Calendar, Settings, Image } from 'lucide-react';

function App() {
    const [isAuthOpen, setIsAuthOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { user, signOut } = useAuth();
    const location = useLocation();

    // Close mobile menu on route change
    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [location.pathname]);

    const handleSignOut = async () => {
        await signOut();
    };

    return (
        <div className="min-h-screen bg-warm-gray font-sans text-deep-charcoal">
            {/* Navigation */}
            <nav className="fixed w-full z-50 bg-white/80 backdrop-blur-md border-b border-white/20 shadow-soft">
                <div className="container mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        {/* Logo */}
                        <a href="/" className="flex items-center space-x-2 group">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sage-green to-terracotta flex items-center justify-center shadow-md group-hover:shadow-lg transition-all duration-300">
                                <Sparkles className="h-6 w-6 text-white" />
                            </div>
                            <span className="text-xl font-bold font-display text-deep-charcoal tracking-tight">
                                SocialCraft <span className="text-sage-green">AI</span>
                            </span>
                        </a>

                        {/* Desktop Navigation */}
                        <div className="hidden md:flex items-center space-x-8">
                            <NavLink href="/generator" icon={<Zap className="w-4 h-4" />} label="Generator" active={location.pathname === '/generator'} />
                            <NavLink href="/trends-agent" icon={<TrendingUp className="w-4 h-4" />} label="Trend Scout" active={location.pathname === '/trends-agent'} />
                            <NavLink href="/amplifier" icon={<Layout className="w-4 h-4" />} label="Amplifier" active={location.pathname === '/amplifier'} />
                            <NavLink href="/media-studio" icon={<Image className="w-4 h-4" />} label="Media" active={location.pathname === '/media-studio'} />
                            <NavLink href="/schedule" icon={<Calendar className="w-4 h-4" />} label="Schedule" active={location.pathname === '/schedule'} />
                            <NavLink href="/drafts" icon={<Book className="w-4 h-4" />} label="Drafts" active={location.pathname === '/drafts'} />
                        </div>

                        {/* Auth Buttons */}
                        <div className="hidden md:flex items-center space-x-4">
                            {user ? (
                                <div className="flex items-center space-x-4">
                                    <a
                                        href="/settings"
                                        className="flex items-center space-x-2 px-3 py-1.5 bg-sage-green/10 rounded-full hover:bg-sage-green/20 transition-colors"
                                        title="Settings"
                                    >
                                        <User className="h-4 w-4 text-sage-green" />
                                        <span className="text-sm font-medium text-sage-green truncate max-w-[150px]">{user.email}</span>
                                    </a>
                                    <button
                                        onClick={handleSignOut}
                                        className="p-2 text-gray-500 hover:text-terracotta transition-colors"
                                        title="Sign Out"
                                    >
                                        <LogOut className="h-5 w-5" />
                                    </button>
                                </div>
                            ) : (
                                <button
                                    onClick={() => setIsAuthOpen(true)}
                                    className="btn-primary px-6 py-2.5 rounded-lg font-medium shadow-md hover:shadow-lg text-sm"
                                >
                                    Sign In
                                </button>
                            )}
                        </div>

                        {/* Mobile Menu Button */}
                        <button
                            className="md:hidden p-2 text-deep-charcoal"
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        >
                            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {isMobileMenuOpen && (
                    <div className="md:hidden absolute top-full left-0 w-full bg-white border-b border-gray-100 shadow-lg py-4 px-6 flex flex-col space-y-4">
                        <MobileNavLink href="/generator" icon={<Zap className="w-4 h-4" />} label="Generator" />
                        <MobileNavLink href="/trends-agent" icon={<TrendingUp className="w-4 h-4" />} label="Trend Scout" />
                        <MobileNavLink href="/amplifier" icon={<Layout className="w-4 h-4" />} label="Amplifier" />
                        <MobileNavLink href="/media-studio" icon={<Image className="w-4 h-4" />} label="Media Studio" />
                        <MobileNavLink href="/schedule" icon={<Calendar className="w-4 h-4" />} label="Schedule" />
                        <MobileNavLink href="/drafts" icon={<Book className="w-4 h-4" />} label="Drafts" />
                        <div className="pt-4 border-t border-gray-100">
                            {user ? (
                                <div className="space-y-4">
                                    <a href="/settings" className="flex items-center space-x-2 text-sm font-medium text-sage-green hover:text-terracotta">
                                        <Settings className="h-4 w-4" />
                                        <span>Settings</span>
                                    </a>
                                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                                        <User className="h-4 w-4" />
                                        <span>{user.email}</span>
                                    </div>
                                    <button
                                        onClick={handleSignOut}
                                        className="flex items-center space-x-2 text-gray-500 hover:text-terracotta w-full"
                                    >
                                        <LogOut className="h-4 w-4" />
                                        <span>Sign Out</span>
                                    </button>
                                </div>
                            ) : (
                                <button
                                    onClick={() => setIsAuthOpen(true)}
                                    className="btn-primary w-full py-3 rounded-lg font-medium shadow-md"
                                >
                                    Sign In
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </nav>

            {/* Main Content */}
            <main className="pt-24 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                <AnimatePresence mode="wait">
                    <Routes location={location} key={location.pathname}>
                        <Route path="/" element={<LandingView onOpenAuth={() => setIsAuthOpen(true)} />} />
                        <Route path="/generator" element={<GeneratorView onOpenAuth={() => setIsAuthOpen(true)} />} />
                        <Route path="/docs" element={<DocsView />} />
                        <Route path="/trends" element={<TrendsView />} />
                        <Route path="/playbooks" element={<PlaybooksView onOpenAuth={() => setIsAuthOpen(true)} />} />
                        <Route path="/trends-agent" element={<TrendsAgent onTrendsFound={() => { }} onOpenAuth={() => setIsAuthOpen(true)} />} />
                        <Route path="/amplifier" element={<BrandAmplifier activeReport={null} onOpenAuth={() => setIsAuthOpen(true)} />} />
                        <Route path="/schedule" element={<ScheduleView onOpenAuth={() => setIsAuthOpen(true)} />} />
                        <Route path="/settings" element={<SettingsView />} />
                        <Route path="/media-studio" element={<MediaStudioView onOpenAuth={() => setIsAuthOpen(true)} />} />
                        <Route path="/drafts" element={<DraftsView onOpenAuth={() => setIsAuthOpen(true)} />} />
                        <Route path="/pricing" element={<PricingView />} />
                        <Route path="/about" element={<AboutView />} />
                        <Route path="/privacy" element={<PrivacyPolicyView />} />
                        <Route path="/terms" element={<TermsOfServiceView />} />
                        <Route path="/checkout/success" element={<CheckoutSuccessView />} />
                        <Route path="/checkout/cancel" element={<CheckoutCancelView />} />
                        <Route path="/templates" element={<TemplatesView onOpenAuth={() => setIsAuthOpen(true)} />} />
                        <Route path="/academic" element={<AcademicModeView onOpenAuth={() => setIsAuthOpen(true)} />} />
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </AnimatePresence>
            </main>

            {/* Footer */}
            <Footer />

            {/* Auth Modal */}
            {isAuthOpen && <AuthModal onClose={() => setIsAuthOpen(false)} />}
        </div>
    );
}

// Nav Link Component
const NavLink = ({ href, icon, label, active }: { href: string; icon: React.ReactNode; label: string; active: boolean }) => (
    <a
        href={href}
        className={`flex items-center space-x-2 text-sm font-medium transition-colors ${active ? 'text-sage-green' : 'text-deep-charcoal hover:text-sage-green'
            }`}
    >
        {icon}
        <span>{label}</span>
    </a>
);

// Mobile Nav Link Component
const MobileNavLink = ({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) => (
    <a
        href={href}
        className="flex items-center space-x-3 p-2 rounded-lg hover:bg-warm-gray text-deep-charcoal transition-colors"
    >
        <div className="text-sage-green">{icon}</div>
        <span className="font-medium">{label}</span>
    </a>
);

export default App;