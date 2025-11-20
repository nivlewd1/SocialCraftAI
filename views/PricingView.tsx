import React, { useState } from 'react';
import { Check, Sparkles, Zap, Crown, Rocket } from 'lucide-react';
import { PRICING_PLANS, FAIR_USE_NOTE, type PlanType } from '../config/pricing';
import { useAuth } from '../contexts/AuthContext';
import { useSubscription } from '../contexts/SubscriptionContext';
import { useNavigate } from 'react-router-dom';
import { redirectToCheckout } from '../utils/stripe';

const PricingView: React.FC = () => {
    const { user } = useAuth();
    const { subscription } = useSubscription();
    const navigate = useNavigate();
    const [billingInterval, setBillingInterval] = useState<'month' | 'year'>('month');

    const handleSelectPlan = async (planId: PlanType) => {
        if (!user) {
            // Redirect to auth if not logged in
            navigate('/', { state: { openAuth: true } });
            return;
        }

        if (planId === 'free') {
            // Free plan - just navigate to generator
            navigate('/generator');
            return;
        }

        if (planId === 'enterprise') {
            // Enterprise - open contact form or email
            window.location.href = 'mailto:sales@socialcraftai.com?subject=Enterprise Plan Inquiry';
            return;
        }

        // Check if user has already used their trial
        if (subscription?.hasUsedTrial && subscription.plan === 'free') {
            // User has used trial before, ask for confirmation
            const confirmed = confirm(
                'You\'ve already used your 14-day free trial. Subscribing now will start your paid subscription immediately. Continue?'
            );
            if (!confirmed) return;
        }

        // For paid plans - redirect to Stripe Checkout
        const plan = PRICING_PLANS.find(p => p.id === planId);
        if (!plan?.priceId) {
            alert('Price ID not configured for this plan');
            return;
        }

        try {
            await redirectToCheckout({
                priceId: plan.priceId,
                userId: user.id,
                userEmail: user.email || '',
            });
        } catch (error) {
            console.error('Checkout error:', error);
            alert('Failed to start checkout. Please try again.');
        }
    };

    // Determine button text and state for each plan
    const getButtonConfig = (planId: PlanType) => {
        // Not logged in
        if (!user || !subscription) {
            return {
                text: planId === 'free' ? 'Get Started' : planId === 'enterprise' ? 'Contact Sales' : 'Start 14-Day Trial',
                disabled: false,
            };
        }

        // Current plan
        if (subscription.plan === planId) {
            return {
                text: 'Current Plan',
                disabled: true,
            };
        }

        // Free plan button
        if (planId === 'free') {
            return {
                text: 'Get Started',
                disabled: false,
            };
        }

        // Enterprise plan
        if (planId === 'enterprise') {
            return {
                text: 'Contact Sales',
                disabled: false,
            };
        }

        // Paid plans - check if user has used trial
        if (subscription.hasUsedTrial || subscription.plan !== 'free') {
            return {
                text: 'Subscribe Now',
                disabled: false,
            };
        }

        // User hasn't used trial yet
        return {
            text: 'Start 14-Day Trial',
            disabled: false,
        };
    };

    const getPlanIcon = (planId: PlanType) => {
        switch (planId) {
            case 'free':
                return <Sparkles className="h-6 w-6" />;
            case 'starter':
                return <Rocket className="h-6 w-6" />;
            case 'pro':
                return <Zap className="h-6 w-6" />;
            case 'enterprise':
                return <Crown className="h-6 w-6" />;
        }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-12">
            {/* Header */}
            <div className="text-center space-y-4">
                <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-surface-900">
                    Choose Your <span className="gradient-text-indigo">Perfect Plan</span>
                </h1>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                    Start free, upgrade as you grow. All plans include our AI-powered algorithm optimization.
                </p>
            </div>

            {/* Billing Toggle */}
            <div className="flex justify-center items-center space-x-4">
                <span className={`text-sm font-medium ${billingInterval === 'month' ? 'text-surface-900' : 'text-gray-400'}`}>
                    Monthly
                </span>
                <button
                    onClick={() => setBillingInterval(billingInterval === 'month' ? 'year' : 'month')}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        billingInterval === 'year' ? 'bg-brand-primary' : 'bg-gray-300'
                    }`}
                >
                    <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            billingInterval === 'year' ? 'translate-x-6' : 'translate-x-1'
                        }`}
                    />
                </button>
                <span className={`text-sm font-medium ${billingInterval === 'year' ? 'text-surface-900' : 'text-gray-400'}`}>
                    Yearly
                    <span className="ml-2 text-xs font-semibold text-brand-primary bg-brand-primary/10 px-2 py-1 rounded-full">
                        Save 20%
                    </span>
                </span>
            </div>

            {/* Pricing Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {PRICING_PLANS.map((plan) => {
                    const yearlyPrice = billingInterval === 'year' ? Math.floor(plan.price * 12 * 0.8) : plan.price;
                    const displayPrice = billingInterval === 'year' ? yearlyPrice / 12 : plan.price;

                    return (
                        <div
                            key={plan.id}
                            className={`relative rounded-2xl p-8 flex flex-col ${
                                plan.popular
                                    ? 'glass-card border-2 border-brand-primary shadow-2xl transform scale-105'
                                    : 'glass-card border border-surface-200/30 hover:shadow-xl hover:-translate-y-1 transition-all duration-300'
                            }`}
                        >
                            {/* Popular Badge */}
                            {plan.popular && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-brand-primary to-brand-glow text-white px-4 py-1 rounded-full text-sm font-semibold shadow-lg">
                                    Most Popular
                                </div>
                            )}

                            {/* Icon */}
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
                                plan.popular
                                    ? 'bg-gradient-to-br from-brand-primary to-brand-glow text-white'
                                    : 'bg-surface-100 text-brand-primary'
                            }`}>
                                {getPlanIcon(plan.id)}
                            </div>

                            {/* Plan Name */}
                            <h3 className="text-2xl font-bold text-surface-900 mb-2">
                                {plan.name}
                            </h3>

                            {/* Description */}
                            <p className="text-sm text-gray-600 mb-6 flex-grow">
                                {plan.description}
                            </p>

                            {/* Price */}
                            <div className="mb-6">
                                <div className="flex items-baseline">
                                    <span className="text-4xl font-extrabold text-surface-900">
                                        ${displayPrice.toFixed(0)}
                                    </span>
                                    <span className="text-gray-600 ml-2">
                                        /{billingInterval === 'year' ? 'mo' : 'month'}
                                    </span>
                                </div>
                                {billingInterval === 'year' && plan.price > 0 && (
                                    <p className="text-sm text-brand-primary mt-1">
                                        ${yearlyPrice}/year, billed annually
                                    </p>
                                )}
                            </div>

                            {/* CTA Button */}
                            <button
                                onClick={() => handleSelectPlan(plan.id)}
                                disabled={getButtonConfig(plan.id).disabled}
                                className={`w-full py-3 px-6 rounded-lg font-semibold transition-all duration-200 ${
                                    getButtonConfig(plan.id).disabled
                                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                        : plan.popular
                                        ? 'bg-gradient-to-r from-brand-primary to-brand-glow text-white hover:opacity-90 hover:shadow-lg'
                                        : plan.id === 'free'
                                        ? 'bg-surface-100 text-surface-900 hover:bg-gray-300'
                                        : 'btn-primary'
                                }`}
                            >
                                {getButtonConfig(plan.id).text}
                            </button>

                            {/* Features List */}
                            <div className="mt-8 space-y-3">
                                {plan.features.map((feature, idx) => (
                                    <div key={idx} className="flex items-start space-x-2">
                                        <Check className="h-5 w-5 text-brand-primary flex-shrink-0 mt-0.5" />
                                        <span className="text-sm text-gray-700">{feature}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Fair Use Note */}
            <div className="text-center text-sm text-gray-500 max-w-3xl mx-auto">
                {FAIR_USE_NOTE}
            </div>

            {/* FAQ Section */}
            <div className="max-w-3xl mx-auto mt-16 space-y-8">
                <h2 className="text-3xl font-bold text-center text-surface-900 mb-8">
                    Frequently Asked Questions
                </h2>

                <div className="space-y-6">
                    <div className="glass-card rounded-xl p-6">
                        <h3 className="text-lg font-semibold text-surface-900 mb-2">
                            What happens when I reach my generation limit?
                        </h3>
                        <p className="text-gray-600">
                            You'll receive a notification when you're approaching your limit. You can upgrade to a higher plan at any time to get more generations. Unused generations don't roll over to the next month.
                        </p>
                    </div>

                    <div className="glass-card rounded-xl p-6">
                        <h3 className="text-lg font-semibold text-surface-900 mb-2">
                            Can I cancel anytime?
                        </h3>
                        <p className="text-gray-600">
                            Yes! All plans can be canceled anytime. You'll retain access to your plan features until the end of your current billing period.
                        </p>
                    </div>

                    <div className="glass-card rounded-xl p-6">
                        <h3 className="text-lg font-semibold text-surface-900 mb-2">
                            Do you offer refunds?
                        </h3>
                        <p className="text-gray-600">
                            We offer a 14-day money-back guarantee on all paid plans. If you're not satisfied, contact us within 14 days of your purchase for a full refund.
                        </p>
                    </div>

                    <div className="glass-card rounded-xl p-6">
                        <h3 className="text-lg font-semibold text-surface-900 mb-2">
                            What payment methods do you accept?
                        </h3>
                        <p className="text-gray-600">
                            We accept all major credit cards (Visa, MasterCard, American Express) and debit cards through our secure payment processor, Stripe.
                        </p>
                    </div>

                    <div className="glass-card rounded-xl p-6">
                        <h3 className="text-lg font-semibold text-surface-900 mb-2">
                            Can I upgrade or downgrade my plan?
                        </h3>
                        <p className="text-gray-600">
                            Yes! You can upgrade or downgrade at any time. Upgrades take effect immediately, and downgrades take effect at the start of your next billing cycle.
                        </p>
                    </div>
                </div>
            </div>

            {/* CTA Section */}
            <div className="glass-card rounded-lg p-12 text-center bg-gradient-to-br from-brand-primary/10 to-brand-glow/10 border border-brand-primary/20">
                <h2 className="text-3xl font-bold text-surface-900 mb-4">
                    Still have questions?
                </h2>
                <p className="text-lg text-gray-600 mb-6">
                    Our team is here to help. Reach out anytime.
                </p>
                <div className="flex justify-center space-x-4">
                    <a
                        href="mailto:support@socialcraftai.com"
                        className="btn-primary px-8 py-3 rounded-lg font-semibold"
                    >
                        Contact Support
                    </a>
                    <button
                        onClick={() => navigate('/generator')}
                        className="px-8 py-3 rounded-lg font-semibold bg-white text-brand-primary border-2 border-brand-primary hover:bg-brand-primary/10 transition-colors"
                    >
                        Try Free Plan
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PricingView;
