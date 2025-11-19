import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, ArrowRight } from 'lucide-react';
import { useSubscription } from '../contexts/SubscriptionContext';

const CheckoutSuccessView: React.FC = () => {
    const navigate = useNavigate();
    const { refreshSubscription } = useSubscription();

    useEffect(() => {
        // Refresh subscription data when landing on success page
        refreshSubscription();
    }, []);

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="max-w-md w-full glass-card rounded-2xl p-8 text-center">
                {/* Success Icon */}
                <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="h-12 w-12 text-white" />
                </div>

                {/* Success Message */}
                <h1 className="text-3xl font-bold text-deep-charcoal mb-4">
                    Payment Successful!
                </h1>
                <p className="text-gray-600 mb-8">
                    Thank you for subscribing to SocialCraft AI. Your subscription is now active and you have full access to all features.
                </p>

                {/* What's Next */}
                <div className="bg-warm-gray rounded-lg p-6 mb-8 text-left">
                    <h3 className="font-semibold text-deep-charcoal mb-3">What's Next?</h3>
                    <ul className="space-y-2 text-sm text-gray-700">
                        <li className="flex items-start">
                            <ArrowRight className="h-4 w-4 text-sage-green mr-2 mt-0.5 flex-shrink-0" />
                            <span>Access all AI-powered content generation tools</span>
                        </li>
                        <li className="flex items-start">
                            <ArrowRight className="h-4 w-4 text-sage-green mr-2 mt-0.5 flex-shrink-0" />
                            <span>Create algorithm-optimized content for all platforms</span>
                        </li>
                        <li className="flex items-start">
                            <ArrowRight className="h-4 w-4 text-sage-green mr-2 mt-0.5 flex-shrink-0" />
                            <span>Use viral playbooks and templates</span>
                        </li>
                        <li className="flex items-start">
                            <ArrowRight className="h-4 w-4 text-sage-green mr-2 mt-0.5 flex-shrink-0" />
                            <span>Manage your subscription in Settings</span>
                        </li>
                    </ul>
                </div>

                {/* CTA Buttons */}
                <div className="space-y-3">
                    <button
                        onClick={() => navigate('/generator')}
                        className="w-full btn-primary py-3 px-6 rounded-lg font-semibold"
                    >
                        Start Creating Content
                    </button>
                    <button
                        onClick={() => navigate('/settings')}
                        className="w-full bg-white text-sage-green border-2 border-sage-green py-3 px-6 rounded-lg font-semibold hover:bg-sage-green/10 transition-colors"
                    >
                        View Subscription Details
                    </button>
                </div>

                {/* Note */}
                <p className="text-xs text-gray-500 mt-6">
                    You'll receive a confirmation email with your invoice shortly.
                </p>
            </div>
        </div>
    );
};

export default CheckoutSuccessView;
