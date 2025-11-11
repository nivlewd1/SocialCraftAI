
import React, { useState } from 'react';
import { HashRouter, Routes, Route, NavLink } from 'react-router-dom';
import GeneratorView from './views/GeneratorView';
import AcademicModeView from './views/AcademicModeView';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import PlaybooksView from './views/TemplatesView';
import MediaStudioView from './views/MediaStudioView';
import DraftsView from './views/DraftsView';
import TrendsView from './views/TrendsView';
import ScheduleView from './views/ScheduleView';
import { BrainCircuit, BookOpen, BarChart3, LayoutGrid, Film, Library, TrendingUp, Calendar, User, LogOut } from 'lucide-react';
import { useAuth } from './contexts/AuthContext';
import { AuthModal } from './components/AuthModal';

const App: React.FC = () => {
    return (
        <HashRouter>
            <div className="min-h-screen flex flex-col">
                <Header />
                <main className="flex-grow container mx-auto p-4 sm:p-6 lg:p-8 mt-16">
                    <Routes>
                        <Route path="/" element={<GeneratorView />} />
                        <Route path="/academic" element={<AcademicModeView />} />
                        <Route path="/playbooks" element={<PlaybooksView />} />
                        <Route path="/media" element={<MediaStudioView />} />
                        <Route path="/analytics" element={<AnalyticsDashboard />} />
                        <Route path="/drafts" element={<DraftsView />} />
                        <Route path="/trends" element={<TrendsView />} />
                        <Route path="/schedule" element={<ScheduleView />} />
                    </Routes>
                </main>
                <Footer />
            </div>
        </HashRouter>
    );
};

const Header: React.FC = () => {
    const { user, signOut } = useAuth();
    const [showAuthModal, setShowAuthModal] = useState(false);

    return (
        <header className="glass-card fixed top-0 left-0 right-0 z-50">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center space-x-3">
                        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#8B9A8B] to-[#C4A484] flex items-center justify-center">
                           <span className="text-white font-bold text-base">SC</span>
                        </div>
                        <span className="text-xl font-bold text-deep-charcoal">
                            SocialCraft AI
                        </span>
                    </div>
                    <div className="flex items-center space-x-4">
                        <nav className="flex items-center space-x-1 overflow-x-auto md:space-x-2">
                            <NavItem to="/" icon={<BrainCircuit size={16}/>} label="AI Generator" />
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
                                        <User size={16} className="text-[#8B9A8B]" />
                                        <span className="text-deep-charcoal hidden sm:inline">
                                            {user.email}
                                        </span>
                                    </div>
                                    <button
                                        onClick={signOut}
                                        className="flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium text-deep-charcoal hover:bg-warm-gray/50 hover:text-[#8B9A8B] transition-colors"
                                    >
                                        <LogOut size={16} />
                                        <span className="hidden sm:inline">Sign Out</span>
                                    </button>
                                </div>
                            ) : (
                                <button
                                    onClick={() => setShowAuthModal(true)}
                                    className="px-4 py-2 rounded-md text-sm font-medium bg-gradient-to-br from-[#8B9A8B] to-[#C4A484] text-white hover:opacity-90 transition-opacity"
                                >
                                    Sign In
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
        </header>
    );
};


const NavItem: React.FC<{ to: string; icon: React.ReactNode; label: string }> = ({ to, icon, label }) => (
    <NavLink
        to={to}
        className={({ isActive }) =>
            `flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 whitespace-nowrap ${
            isActive
                ? 'text-[#8B9A8B] bg-[#8B9A8B]/10'
                : 'text-deep-charcoal hover:bg-warm-gray/50 hover:text-[#8B9A8B]'
            }`
        }
    >
        {icon}
        <span>{label}</span>
    </NavLink>
);


const Footer: React.FC = () => {
    return (
        <footer className="bg-deep-charcoal text-white">
            <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8 text-center text-sm text-gray-300">
                <p>&copy; {new Date().getFullYear()} SocialCraft AI. Algorithmic-Driven Social Media Automation.</p>
            </div>
        </footer>
    );
};


export default App;