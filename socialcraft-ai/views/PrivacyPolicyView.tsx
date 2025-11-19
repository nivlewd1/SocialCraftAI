import React from 'react';
import { Shield, Calendar, Mail, Lock } from 'lucide-react';

const PrivacyPolicyView: React.FC = () => {
    return (
        <div className="max-w-4xl mx-auto space-y-8">
            {/* Header */}
            <div className="text-center space-y-4">
                <div className="flex justify-center">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-soft-blue to-sage-green flex items-center justify-center">
                        <Shield className="h-8 w-8 text-white" />
                    </div>
                </div>
                <h1 className="text-4xl md:text-5xl font-extrabold font-display tracking-tight text-deep-charcoal">
                    Privacy Policy
                </h1>
                <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
                    <Calendar className="h-4 w-4" />
                    <span>Last Updated: January 15, 2025</span>
                </div>
            </div>

            {/* Quick Summary Box */}
            <div className="glass-card rounded-2xl p-6 bg-soft-blue/10 border-2 border-soft-blue/30">
                <div className="flex items-start space-x-3">
                    <Lock className="h-6 w-6 text-soft-blue flex-shrink-0 mt-1" />
                    <div>
                        <h3 className="font-bold text-deep-charcoal mb-2">Privacy at a Glance</h3>
                        <ul className="text-sm text-gray-700 space-y-1">
                            <li>✓ We don't sell your data</li>
                            <li>✓ You own all your generated content</li>
                            <li>✓ We don't train AI on your private content</li>
                            <li>✓ Industry-standard encryption & security</li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Content - Similar structure to Terms of Service */}
            <div className="glass-card rounded-2xl p-8 md:p-12 space-y-8">
                <section>
                    <h2 className="text-2xl font-bold font-display text-deep-charcoal mb-4">1. Introduction</h2>
                    <p className="text-gray-700 leading-relaxed">
                        This Privacy Policy describes how SocialCraft AI ("we", "us", "our") collects, uses,
                        and shares your personal information when you use our service.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-bold font-display text-deep-charcoal mb-4">2. Information We Collect</h2>

                    <h3 className="text-xl font-semibold text-deep-charcoal mb-3 mt-4">2.1 Information You Provide</h3>
                    <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                        <li><strong>Account Information:</strong> Name, email address, password</li>
                        <li><strong>Profile Information:</strong> Company name, profile picture (optional)</li>
                        <li><strong>Payment Information:</strong> Processed by Stripe (we do not store card details)</li>
                        <li><strong>Content:</strong> Text prompts, generated content, saved drafts</li>
                    </ul>

                    <h3 className="text-xl font-semibold text-deep-charcoal mb-3 mt-4">2.2 Automatically Collected Information</h3>
                    <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                        <li><strong>Usage Data:</strong> Features used, generation counts, timestamps</li>
                        <li><strong>Device Information:</strong> IP address, browser type, operating system</li>
                        <li><strong>Cookies:</strong> Session management, analytics, preferences</li>
                    </ul>

                    <h3 className="text-xl font-semibold text-deep-charcoal mb-3 mt-4">2.3 Third-Party Information</h3>
                    <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                        <li><strong>OAuth Data:</strong> When connecting social media accounts (profile info, permissions)</li>
                        <li><strong>Analytics:</strong> Google Analytics, Supabase Analytics</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-2xl font-bold font-display text-deep-charcoal mb-4">3. How We Use Your Information</h2>
                    <p className="text-gray-700 mb-3">We use your information to:</p>
                    <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                        <li>Provide and improve our service</li>
                        <li>Process payments and manage subscriptions</li>
                        <li>Generate AI content based on your prompts</li>
                        <li>Send transactional emails (receipts, account updates)</li>
                        <li>Send marketing emails (with your consent - opt-out anytime)</li>
                        <li>Analyze usage patterns and improve features</li>
                        <li>Prevent fraud and abuse</li>
                        <li>Comply with legal obligations</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-2xl font-bold font-display text-deep-charcoal mb-4">4. How We Share Your Information</h2>
                    <p className="text-gray-700 mb-3">We share your information with:</p>

                    <h3 className="text-xl font-semibold text-deep-charcoal mb-3 mt-4">4.1 Service Providers</h3>
                    <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                        <li><strong>Stripe:</strong> Payment processing</li>
                        <li><strong>Supabase:</strong> Database and authentication</li>
                        <li><strong>Google Gemini:</strong> AI content generation</li>
                        <li><strong>SendGrid/Resend:</strong> Transactional emails</li>
                    </ul>

                    <h3 className="text-xl font-semibold text-deep-charcoal mb-3 mt-4">4.2 Legal Requirements</h3>
                     <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                        <li>When required by law or legal process</li>
                        <li>To protect our rights or property</li>
                        <li>To prevent illegal activity</li>
                    </ul>

                    <h3 className="text-xl font-semibold text-deep-charcoal mb-3 mt-4">4.3 Business Transfers</h3>
                     <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                        <li>In case of merger, acquisition, or sale of assets</li>
                    </ul>

                    <div className="bg-terracotta/10 border-l-4 border-terracotta p-6 rounded-r-lg mt-6">
                        <p className="text-gray-700 font-semibold mb-2">We DO NOT:</p>
                        <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                           <li>Sell your personal information</li>
                           <li>Share your content with third parties for their marketing</li>
                           <li>Train AI models on your private content without consent</li>
                        </ul>
                    </div>
                </section>

                <section>
                    <h2 className="text-2xl font-bold font-display text-deep-charcoal mb-4">5. Data Storage & Security</h2>

                    <h3 className="text-xl font-semibold text-deep-charcoal mb-3 mt-4">5.1 Storage Location</h3>
                    <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                        <li>Data stored on Supabase servers (AWS infrastructure)</li>
                        <li>Servers located in [Region - e.g., US-East]</li>
                        <li>Encrypted in transit (HTTPS) and at rest (AES-256)</li>
                    </ul>

                    <h3 className="text-xl font-semibold text-deep-charcoal mb-3 mt-4">5.2 Security Measures</h3>
                    <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                        <li>Industry-standard encryption</li>
                        <li>Regular security audits</li>
                        <li>Access controls and authentication</li>
                        <li>Secure API communications</li>
                    </ul>

                    <h3 className="text-xl font-semibold text-deep-charcoal mb-3 mt-4">5.3 Data Retention</h3>
                    <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                        <li>Active accounts: Data retained while account is active</li>
                        <li>Cancelled accounts: Data deleted after 30 days</li>
                        <li>Legal/accounting records: Retained as required by law</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-2xl font-bold font-display text-deep-charcoal mb-4">6. Your Rights</h2>

                    <h3 className="text-xl font-semibold text-deep-charcoal mb-3 mt-4">6.1 GDPR Rights (EU Users)</h3>
                    <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                        <li><strong>Access:</strong> Request a copy of your data</li>
                        <li><strong>Correction:</strong> Update inaccurate information</li>
                        <li><strong>Deletion:</strong> Request account and data deletion ("right to be forgotten")</li>
                        <li><strong>Portability:</strong> Export your data in machine-readable format</li>
                        <li><strong>Restriction:</strong> Limit how we process your data</li>
                        <li><strong>Objection:</strong> Object to data processing for marketing purposes</li>
                    </ul>

                    <h3 className="text-xl font-semibold text-deep-charcoal mb-3 mt-4">6.2 CCPA Rights (California Users)</h3>
                    <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                        <li>Know what personal information we collect</li>
                        <li>Know whether we sell or share your data (we don't)</li>
                        <li>Request deletion of your information</li>
                        <li>Opt-out of data sales (not applicable - we don't sell data)</li>
                        <li>Non-discrimination for exercising your rights</li>
                    </ul>

                    <h3 className="text-xl font-semibold text-deep-charcoal mb-3 mt-4">6.3 Exercising Your Rights</h3>
                    <p className="text-gray-700">Email: privacy@socialcraftai.com. We will respond within 30 days.</p>
                </section>

                <section>
                    <h2 className="text-2xl font-bold font-display text-deep-charcoal mb-4">7. Cookies & Tracking</h2>

                    <h3 className="text-xl font-semibold text-deep-charcoal mb-3 mt-4">7.1 Cookies We Use</h3>
                    <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                        <li><strong>Essential:</strong> Session management, authentication (required)</li>
                        <li><strong>Analytics:</strong> Google Analytics (optional - can be disabled)</li>
                        <li><strong>Preferences:</strong> UI settings, language preferences</li>
                    </ul>

                    <h3 className="text-xl font-semibold text-deep-charcoal mb-3 mt-4">7.2 Cookie Management</h3>
                    <p className="text-gray-700">You can control cookies through your browser settings. Disabling essential cookies may affect functionality.</p>
                </section>

                <section>
                    <h2 className="text-2xl font-bold font-display text-deep-charcoal mb-4">8. Third-Party Services</h2>
                    <p className="text-gray-700">Our service integrates with third-party platforms. Their privacy policies apply. You can find them on their respective websites.</p>
                </section>

                <section>
                    <h2 className="text-2xl font-bold font-display text-deep-charcoal mb-4">9. Children's Privacy</h2>
                    <p className="text-gray-700">Our service is not intended for users under 13 (or 16 in the EU). We do not knowingly collect information from children.</p>
                </section>

                <section>
                    <h2 className="text-2xl font-bold font-display text-deep-charcoal mb-4">10. International Users</h2>
                    <p className="text-gray-700">Our service is operated from [Your Country]. By using our service, you consent to transfer of your information to [Your Country].</p>
                </section>

                <section>
                    <h2 className="text-2xl font-bold font-display text-deep-charcoal mb-4">11. Changes to This Policy</h2>
                    <p className="text-gray-700">We may update this policy periodically. Material changes will be notified via email 30 days in advance.</p>
                </section>

                <section>
                    <h2 className="text-2xl font-bold font-display text-deep-charcoal mb-4">12. Contact Us</h2>
                    <div className="bg-sage-green/10 rounded-lg p-6 space-y-3">
                        <p className="text-gray-700">For privacy questions:</p>
                        <div className="space-y-2">
                            <div className="flex items-center space-x-2 text-gray-700">
                                <Mail className="h-4 w-4 text-sage-green" />
                                <span><strong>Email:</strong> privacy@socialcraftai.com</span>
                            </div>
                            <div className="flex items-center space-x-2 text-gray-700">
                                <Mail className="h-4 w-4 text-sage-green" />
                                <span><strong>Data Protection Officer:</strong> dpo@socialcraftai.com</span>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default PrivacyPolicyView;
