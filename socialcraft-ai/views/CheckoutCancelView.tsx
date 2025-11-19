import React from 'react';
import { useNavigate } from 'react-router-dom';
import { XCircle, ArrowLeft, HelpCircle } from 'lucide-react';

const CheckoutCancelView: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="max-w-md w-full glass-card rounded-2xl p-8 text-center">
                {/* Cancel Icon */}
                <div className="w-20 h-20 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <XCircle className="h-12 w-12 text-white" />
                </div>

                {/* Cancel Message */}
                <h1 className="text-3xl font-bold text-deep-charcoal mb-4">
                    Checkout Canceled
                </h1>
                <p className="text-gray-600 mb-8">
                    No worries! Your payment was not processed. You can try again whenever you're ready.
                </p>

                {/* Why Subscribe? */}
                <div className="bg-warm-gray rounded-lg p-6 mb-8 text-left">
                    <h3 className="font-semibold text-deep-charcoal mb-3 flex items-center">
                        <HelpCircle className="h-5 w-5 text-sage-green mr-2" />
                        Why Subscribe?
                    </h3>
                    <ul className="space-y-2 text-sm text-gray-700">
                        <li>✨ Unlimited AI-powered content generation</li>
                        <li>🎯 Algorithm-optimized posts for every platform</li>
                        <li>📊 Advanced analytics and insights</li>
                        <li>🚀 Viral content playbooks and templates</li>
                        <li>⚡ Priority support from our team</li>
                    </ul>
                </div>

                {/* CTA Buttons */}
                <div className="space-y-3">
                    <button
                        onClick={() => navigate('/pricing')}
                        className="w-full btn-primary py-3 px-6 rounded-lg font-semibold flex items-center justify-center"
                    >
                        <ArrowLeft className="h-5 w-5 mr-2" />
                        Back to Pricing
                    </button>
                    <button
                        onClick={() => navigate('/generator')}
                        className="w-full bg-white text-sage-green border-2 border-sage-green py-3 px-6 rounded-lg font-semibold hover:bg-sage-green/10 transition-colors"
                    >
                        Try Free Plan
                    </button>
                </div>

                {/* Help Link */}
                <p className="text-sm text-gray-500 mt-6">
                    Need help?{' '}
                    <a
                        href="mailto:support@socialcraftai.com"
                        className="text-sage-green hover:underline font-medium"
                    >
                        Contact Support
                    </a>
                </p>
            </div>
        </div>
    );
};

export default CheckoutCancelView;
