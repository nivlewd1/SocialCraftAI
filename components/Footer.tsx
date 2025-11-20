import React from 'react';
import { Link } from 'react-router-dom';
import { Twitter, Linkedin, Instagram, Mail } from 'lucide-react';

const Footer: React.FC = () => {
    return (
        <footer className="bg-surface-950 text-white mt-24">
            <div className="max-w-7xl mx-auto px-6 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Brand */}
                    <div className="space-y-4">
                        <h3 className="text-2xl font-bold font-display gradient-text">SocialCraft AI</h3>
                        <p className="text-gray-400 text-sm">
                            AI-powered social media content generation for creators, marketers, and businesses.
                        </p>
                        <div className="flex space-x-4">
                            <a href="https://x.com/Social_Craft_AI" target="_blank" rel="noopener noreferrer" className="hover:text-brand-primary transition-colors">
                                <Twitter className="h-5 w-5" />
                            </a>
                            <a href="https://www.linkedin.com/company/socialcraft-ai" target="_blank" rel="noopener noreferrer" className="hover:text-brand-primary transition-colors">
                                <Linkedin className="h-5 w-5" />
                            </a>
                            <a href="https://instagram.com/socialcraftai" target="_blank" rel="noopener noreferrer" className="hover:text-brand-primary transition-colors">
                                <Instagram className="h-5 w-5" />
                            </a>
                        </div>
                    </div>

                    {/* Product */}
                    <div>
                        <h4 className="font-bold mb-4">Product</h4>
                        <ul className="space-y-2 text-sm">
                            <li><Link to="/generator" className="text-gray-400 hover:text-white transition-colors">Generator</Link></li>
                            <li><Link to="/playbooks" className="text-gray-400 hover:text-white transition-colors">Playbooks</Link></li>
                            <li><Link to="/pricing" className="text-gray-400 hover:text-white transition-colors">Pricing</Link></li>
                            <li><Link to="/docs" className="text-gray-400 hover:text-white transition-colors">Documentation</Link></li>
                        </ul>
                    </div>

                    {/* Company */}
                    <div>
                        <h4 className="font-bold mb-4">Company</h4>
                        <ul className="space-y-2 text-sm">
                            <li><Link to="/about" className="text-gray-400 hover:text-white transition-colors">About Us</Link></li>
                            <li><a href="mailto:hello@socialcraftai.com" className="text-gray-400 hover:text-white transition-colors">Contact</a></li>
                            <li><a href="mailto:support@socialcraftai.com" className="text-gray-400 hover:text-white transition-colors">Support</a></li>
                        </ul>
                    </div>

                    {/* Legal */}
                    <div>
                        <h4 className="font-bold mb-4">Legal</h4>
                        <ul className="space-y-2 text-sm">
                            <li><Link to="/terms" className="text-gray-400 hover:text-white transition-colors">Terms of Service</Link></li>
                            <li><Link to="/privacy" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-gray-700 mt-8 pt-8 text-center text-sm text-gray-400">
                    <p>&copy; {new Date().getFullYear()} SocialCraft AI. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
