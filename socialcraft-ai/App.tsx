import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, NavLink, useLocation } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';
import LandingView from './views/LandingView';
import GeneratorView from './views/GeneratorView';
import AcademicModeView from './views/AcademicModeView';
import TemplatesView from './views/TemplatesView';
import MediaStudioView from './views/MediaStudioView';
import DraftsView from './views/DraftsView';
import TrendsView from './views/TrendsView';
import ScheduleView from './views/ScheduleView';
import SettingsView from './views/SettingsView';
import PricingView from './views/PricingView';
import CheckoutSuccessView from './views/CheckoutSuccessView';
import CheckoutCancelView from './views/CheckoutCancelView';
import TermsOfServiceView from './views/TermsOfServiceView';
import PrivacyPolicyView from './views/PrivacyPolicyView';
import AboutView from './views/AboutView';
import DocsView from './views/DocsView';
import PlaybooksView from './views/PlaybooksView';
import { BrainCircuit, BookOpen, BarChart3, LayoutGrid, Film, Library, TrendingUp, Calendar, User, LogOut, Settings } from 'lucide-react';
import { useAuth } from './contexts/AuthContext';
import { AuthModal } from './components/AuthModal';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
import Footer from './components/Footer';

const AppContent: React.FC<{ onOpenAuth: () => void }> = ({ onOpenAuth }) => {
    const location = useLocation();
    const isLandingPage = location.pathname === '/';

    return (
        <>
            <LandingHeader onOpenAuth={onOpenAuth} isLandingPage={isLandingPage} />
            <main className={`flex-grow ${!isLandingPage ? 'container mx-auto p-4 sm:p-6 lg:p-8 mt-16' : ''}`}>
                <Routes>
                    <Route path="/" element={<LandingView onOpenAuth={onOpenAuth} />} />
                    <Route path="/generator" element={<GeneratorView />} />
                    <Route path="/academic" element={<AcademicModeView />} />
                    <Route path="/templates" element={<TemplatesView onOpenAuth={onOpenAuth} />} />
                    <Route path="/playbooks" element={<PlaybooksView onOpenAuth={onOpenAuth} />} />
                    <Route path="/media" element={<MediaStudioView />} />
                    <Route path="/analytics" element={<AnalyticsDashboard />} />
                    <Route path="/drafts" element={<DraftsView />} />
                    <Route path="/trends" element={<TrendsView />} />
                    <Route path="/schedule" element={<ScheduleView />} />
                    <Route path="/settings" element={<SettingsView />} />
                    <Route path="/pricing" element={<PricingView />} />
                    <Route path="/checkout/success" element={<CheckoutSuccessView />} />
                    <Route path="/checkout/cancel" element={<CheckoutCancelView />} />
                    <Route path="/terms" element={<TermsOfServiceView />} />
                    <Route path="/privacy" element={<PrivacyPolicyView />} />
                    <Route path="/about" element={<AboutView />} />
                    <Route path="/docs" element={<DocsView />} />
                </Routes>
            </main>
            <Footer />
        </>
    );
};

const App: React.FC = () => {
    const [showAuthModal, setShowAuthModal] = useState(false);

    return (
        <HashRouter>
            <div className="min-h-screen flex flex-col">
                <AppContent onOpenAuth={() => setShowAuthModal(true)} />
                {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
            </div>
            <Analytics />
        </HashRouter>
    );
};

// Landing Page Header
const LandingHeader: React.FC<{ onOpenAuth: () => void; isLandingPage: boolean }> = ({ onOpenAuth, isLandingPage }) => {
    const { user, signOut } = useAuth();

    // Show simple landing header only if on landing page AND not logged in
    if (isLandingPage && !user) {
        return (
            <header className="glass-card fixed top-0 left-0 right-0 z-50">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <NavLink to="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
                        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-sage-green to-terracotta flex items-center justify-center">
                               <span className="text-white font-bold text-base">SC</span>
                            </div>
                            <span className="text-xl font-bold font-display text-deep-charcoal">
                                SocialCraft AI
                            </span>
                        </NavLink>
                        <nav className="hidden md:flex items-center space-x-8">
                            <a href="#features" className="text-deep-charcoal hover:text-sage-green transition-colors font-medium underline-animation">Features</a>
                            <a href="#platforms" className="text-deep-charcoal hover:text-sage-green transition-colors font-medium underline-animation">Platforms</a>
                            <a href="#pricing" className="text-deep-charcoal hover:text-sage-green transition-colors font-medium underline-animation">Pricing</a>
                        </nav>
                        <button
                            onClick={onOpenAuth}
                            className="btn-primary px-6 py-2 rounded-lg font-medium"
                        >
                            Get Started
                        </button>
                    </div>
                </div>
            </header>
        );
    }

    return (
        <header className="glass-card fixed top-0 left-0 right-0 z-50">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <NavLink to="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
                        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-sage-green to-terracotta flex items-center justify-center">
                           <span className="text-white font-bold text-base">SC</span>
                        </div>
                        <span className="text-xl font-bold font-display text-deep-charcoal">
                            SocialCraft AI
                        </span>
                    </NavLink>
                    <div className="flex items-center space-x-4">
                        <nav className="flex items-center space-x-1 overflow-x-auto md:space-x-2">
                            <NavItem to="/generator" icon={<BrainCircuit size={16}/>} label="AI Generator" />
                            <NavItem to="/academic" icon={<BookOpen size={16}/>} label="Academic Mode" />
                            <NavItem to="/playbooks" icon={<LayoutGrid size={16}/>} label="Playbooks" />
                            <NavItem to="/trends" icon={<TrendingUp size={16}/>} label="Trends" />
                            <NavItem to="/media" icon={<Film size={16}/>} label="Media Studio" />
                            <NavItem to="/schedule" icon={<Calendar size={16}/>} label="Schedule" />
                            <NavItem to="/analytics" icon={<BarChart3 size={16}/>} label="Analytics" />
                            <NavItem to="/drafts" icon={<Library size={16}/>} label="Library" />
                        </nav>

                        {/* User Menu */}
                        <div className="flex items-center space-x-2 border-l border-warm-gray/30 pl-4">
                            {user ? (
                                <div className="flex items-center space-x-2">
                                    <div className="flex items-center space-x-2 text-sm">
                                        <User size={16} className="text-sage-green" />
                                        <span className="text-deep-charcoal hidden sm:inline">
                                            {user.email}
                                        </span>
                                    </div>
                                    <NavLink
                                        to="/settings"
                                        className="flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium text-deep-charcoal hover:bg-warm-gray/50 hover:text-sage-green transition-colors"
                                    >
                                        <Settings size={16} />
                                        <span className="hidden sm:inline">Settings</span>
                                    </NavLink>
                                    <button
                                        onClick={signOut}
                                        className="flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium text-deep-charcoal hover:bg-warm-gray/50 hover:text-sage-green transition-colors"
                                    >
                                        <LogOut size={16} />
                                        <span className="hidden sm:inline">Sign Out</span>
                                    </button>
                                </div>
                            ) : (
                                <button
                                    onClick={onOpenAuth}
                                    className="px-4 py-2 rounded-md text-sm font-medium bg-gradient-to-br from-sage-green to-terracotta text-white hover:opacity-90 transition-opacity"
                                >
                                    Sign In
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

const NavItem: React.FC<{ to: string; icon: React.ReactNode; label: string }> = ({ to, icon, label }) => (
    <NavLink
        to={to}
        className={({ isActive }) =>
            `flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 whitespace-nowrap underline-animation ${
            isActive
                ? 'text-sage-green bg-sage-green/10'
                : 'text-deep-charcoal hover:bg-warm-gray/50 hover:text-sage-green'
            }`
        }
    >
        {icon}
        <span>{label}</span>
    </NavLink>
);

export default App;