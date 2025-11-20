import React from 'react';
import { FileText, Calendar, Mail } from 'lucide-react';

const TermsOfServiceView: React.FC = () => {
    return (
        <div className="max-w-4xl mx-auto space-y-8">
            {/* Header */}
            <div className="text-center space-y-4">
                <div className="flex justify-center">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-primary to-brand-glow flex items-center justify-center">
                        <FileText className="h-8 w-8 text-white" />
                    </div>
                </div>
                <h1 className="text-4xl md:text-5xl font-extrabold font-display tracking-tight text-surface-900">
                    Terms of Service
                </h1>
                <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
                    <Calendar className="h-4 w-4" />
                    <span>Last Updated: January 15, 2025</span>
                </div>
            </div>

            {/* Content */}
            <div className="glass-card rounded-lg p-8 md:p-12 space-y-8">
                {/* Section 1 */}
                <section>
                    <h2 className="text-2xl font-bold font-display text-surface-900 mb-4">1. Introduction</h2>
                    <p className="text-gray-700 leading-relaxed">
                        Welcome to SocialCraft AI ("Service", "we", "us", or "our"). By accessing or using our platform,
                        you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our service.
                    </p>
                </section>

                {/* Section 2 */}
                <section>
                    <h2 className="text-2xl font-bold font-display text-surface-900 mb-4">2. Service Description</h2>
                    <p className="text-gray-700 leading-relaxed">
                        SocialCraft AI is an AI-powered social media content generation platform that helps users create,
                        optimize, and schedule content across multiple platforms including Twitter, LinkedIn, Instagram, TikTok, and Pinterest.
                    </p>
                </section>

                {/* Section 3 - User Accounts */}
                <section>
                    <h2 className="text-2xl font-bold font-display text-surface-900 mb-4">3. User Accounts</h2>

                    <h3 className="text-xl font-semibold text-surface-900 mb-3 mt-4">3.1 Account Creation</h3>
                    <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                        <li>You must provide accurate and complete information</li>
                        <li>You must be at least 13 years old (or 16 in the EU)</li>
                        <li>One account per person</li>
                        <li>You are responsible for maintaining account security</li>
                    </ul>

                    <h3 className="text-xl font-semibold text-surface-900 mb-3 mt-4">3.2 Account Security</h3>
                    <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                        <li>Keep your password confidential</li>
                        <li>Notify us immediately of unauthorized access</li>
                        <li>You are liable for all activities under your account</li>
                    </ul>
                </section>

                {/* Section 4 - Subscription & Billing */}
                <section>
                    <h2 className="text-2xl font-bold font-display text-surface-900 mb-4">4. Subscription & Billing</h2>

                    <h3 className="text-xl font-semibold text-surface-900 mb-3 mt-4">4.1 Free Tier</h3>
                    <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                        <li>50 content generations per month</li>
                        <li>Access to basic features</li>
                        <li>Community support</li>
                    </ul>

                    <h3 className="text-xl font-semibold text-surface-900 mb-3 mt-4">4.2 Paid Plans</h3>
                    <div className="bg-surface-100 rounded-lg p-6 space-y-2">
                        <p className="text-gray-700"><strong>Starter:</strong> $19/month - 500 generations</p>
                        <p className="text-gray-700"><strong>Pro:</strong> $49/month - 3000 generations</p>
                        <p className="text-gray-700"><strong>Enterprise:</strong> Custom pricing - Unlimited generations</p>
                    </div>

                    <h3 className="text-xl font-semibold text-surface-900 mb-3 mt-4">4.3 Free Trial</h3>
                    <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                        <li>First-time users receive a 14-day free trial on paid plans</li>
                        <li>One trial per user (tracked per account)</li>
                        <li>Trial converts to paid subscription unless cancelled</li>
                        <li>No charges during trial period</li>
                    </ul>

                    <h3 className="text-xl font-semibold text-surface-900 mb-3 mt-4">4.4 Billing</h3>
                    <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                        <li>Billed monthly or annually (20% discount on annual)</li>
                        <li>Auto-renewal unless cancelled</li>
                        <li>Prices subject to change with 30 days notice</li>
                        <li>All payments processed via Stripe</li>
                    </ul>

                    <h3 className="text-xl font-semibold text-surface-900 mb-3 mt-4">4.5 Cancellation & Refunds</h3>
                    <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                        <li>Cancel anytime from your account settings</li>
                        <li>Access continues until end of billing period</li>
                        <li>14-day money-back guarantee on all paid plans</li>
                        <li>No refunds for partial months</li>
                    </ul>
                </section>

                {/* Section 5 - Acceptable Use */}
                <section>
                    <h2 className="text-2xl font-bold font-display text-surface-900 mb-4">5. Acceptable Use Policy</h2>
                    <p className="text-gray-700 mb-3">You agree NOT to:</p>
                    <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                        <li>Generate spam, malicious, or illegal content</li>
                        <li>Violate platform-specific content policies</li>
                        <li>Impersonate others or misrepresent affiliations</li>
                        <li>Attempt to circumvent usage limits</li>
                        <li>Reverse engineer or scrape our service</li>
                        <li>Use the service for automated/bot accounts</li>
                        <li>Generate content that violates intellectual property rights</li>
                        <li>Create harmful, discriminatory, or explicit content</li>
                    </ul>
                </section>

                {/* Section 6 - Intellectual Property */}
                <section>
                    <h2 className="text-2xl font-bold font-display text-surface-900 mb-4">6. Intellectual Property</h2>

                    <h3 className="text-xl font-semibold text-surface-900 mb-3 mt-4">6.1 Our IP</h3>
                    <p className="text-gray-700 leading-relaxed">
                        All SocialCraft AI branding, software, algorithms, and interfaces are our proprietary property.
                    </p>

                    <h3 className="text-xl font-semibold text-surface-900 mb-3 mt-4">6.2 Your Content</h3>
                    <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                        <li>You own all content you input into our service</li>
                        <li>You own all AI-generated content created by your prompts</li>
                        <li>You grant us a license to process your content to provide the service</li>
                        <li>We do not claim ownership of your generated content</li>
                    </ul>

                    <h3 className="text-xl font-semibold text-surface-900 mb-3 mt-4">6.3 AI-Generated Content</h3>
                    <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                        <li>You are responsible for reviewing and editing AI-generated content</li>
                        <li>We do not guarantee accuracy, originality, or platform compliance</li>
                        <li>You must ensure generated content complies with all applicable laws</li>
                    </ul>
                </section>

                {/* Section 7 - Third-Party Services */}
                <section>
                    <h2 className="text-2xl font-bold font-display text-surface-900 mb-4">7. Third-Party Services</h2>
                    <p className="text-gray-700 mb-3">Our service integrates with:</p>
                    <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                        <li><strong>Stripe:</strong> Payment processing (subject to Stripe's terms)</li>
                        <li><strong>Supabase:</strong> Data storage and authentication</li>
                        <li><strong>Google Gemini:</strong> AI content generation</li>
                        <li><strong>Social Media Platforms:</strong> Twitter, LinkedIn, Instagram, TikTok, Pinterest</li>
                    </ul>
                    <p className="text-gray-700 mt-3">Your use of these services is subject to their respective terms.</p>
                </section>

                {/* Section 8 - Limitation of Liability */}
                <section>
                    <h2 className="text-2xl font-bold font-display text-surface-900 mb-4">8. Limitation of Liability</h2>
                    <div className="bg-brand-glow/10 border-l-4 border-terracotta p-6 rounded-r-lg">
                        <p className="text-gray-700 font-semibold mb-2">TO THE MAXIMUM EXTENT PERMITTED BY LAW:</p>
                        <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                            <li>We provide the service "AS IS" without warranties</li>
                            <li>We are not liable for indirect, incidental, or consequential damages</li>
                            <li>Our total liability is limited to amounts paid by you in the last 12 months</li>
                            <li>We are not responsible for content generated by AI or posted by users</li>
                        </ul>
                    </div>
                </section>

                {/* Section 9 - Termination */}
                <section>
                    <h2 className="text-2xl font-bold font-display text-surface-900 mb-4">9. Termination</h2>

                    <h3 className="text-xl font-semibold text-surface-900 mb-3 mt-4">9.1 By You</h3>
                    <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                        <li>Cancel your subscription anytime</li>
                        <li>Account data retained for 30 days after cancellation</li>
                    </ul>

                    <h3 className="text-xl font-semibold text-surface-900 mb-3 mt-4">9.2 By Us</h3>
                    <p className="text-gray-700 mb-2">We may suspend or terminate your account for:</p>
                    <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                        <li>Violation of these terms</li>
                        <li>Fraudulent activity</li>
                        <li>Abusive behavior toward support staff</li>
                        <li>Non-payment</li>
                    </ul>
                </section>

                {/* Section 10 - Changes to Terms */}
                <section>
                    <h2 className="text-2xl font-bold font-display text-surface-900 mb-4">10. Changes to Terms</h2>
                    <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                        <li>We may modify these terms at any time</li>
                        <li>Material changes will be notified via email 30 days in advance</li>
                        <li>Continued use after changes constitutes acceptance</li>
                    </ul>
                </section>

                {/* Section 11 - Governing Law */}
                <section>
                    <h2 className="text-2xl font-bold font-display text-surface-900 mb-4">11. Governing Law</h2>
                    <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                        <li>These terms are governed by [Your State/Country] law</li>
                        <li>Disputes will be resolved in [Your Jurisdiction] courts</li>
                        <li>You agree to binding arbitration for disputes</li>
                    </ul>
                </section>

                {/* Section 12 - Contact */}
                <section>
                    <h2 className="text-2xl font-bold font-display text-surface-900 mb-4">12. Contact Us</h2>
                    <div className="bg-brand-primary/10 rounded-lg p-6 space-y-3">
                        <p className="text-gray-700">For questions about these terms:</p>
                        <div className="space-y-2">
                            <div className="flex items-center space-x-2 text-gray-700">
                                <Mail className="h-4 w-4 text-brand-primary" />
                                <span><strong>Legal:</strong> legal@socialcraftai.com</span>
                            </div>
                            <div className="flex items-center space-x-2 text-gray-700">
                                <Mail className="h-4 w-4 text-brand-primary" />
                                <span><strong>Support:</strong> support@socialcraftai.com</span>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default TermsOfServiceView;
