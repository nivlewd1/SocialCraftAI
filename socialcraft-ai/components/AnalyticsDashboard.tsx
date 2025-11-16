import React from 'react';
import analyticsImage from '../images/analytics-dashboard.png';

export const AnalyticsDashboard: React.FC = () => {
    return (
        <div className="space-y-8">
            <div className="text-center">
                <h1 className="text-4xl md:text-5xl font-extrabold font-display tracking-tight">
                    Analytics <span className="gradient-text">Dashboard</span>
                </h1>
                <p className="mt-4 max-w-2xl mx-auto text-lg text-deep-charcoal">
                    Track your content performance and gain insights into your social media strategy.
                </p>
            </div>
            
            <div className="max-w-6xl mx-auto">
                <img src={analyticsImage} alt="Analytics Dashboard" className="w-full rounded-2xl shadow-elevated" />
            </div>

            {/* Key Metrics Grid */}
            <div className="grid md:grid-cols-4 gap-6 max-w-6xl mx-auto">
                <MetricCard title="Total Posts" value="1,247" change="+12%" color="from-sage-green to-soft-blue" />
                <MetricCard title="Avg. Engagement" value="8.3%" change="+23%" color="from-terracotta to-sage-green" />
                <MetricCard title="Follower Growth" value="+2,847" change="+18%" color="from-soft-blue to-terracotta" />
                <MetricCard title="Conversion Rate" value="4.2%" change="+7%" color="from-terracotta to-soft-blue" />
            </div>
        </div>
    );
};

const MetricCard: React.FC<{
    title: string;
    value: string;
    change: string;
    color: string;
}> = ({ title, value, change, color }) => (
    <div className="glass-card rounded-2xl p-6 text-center hover-lift">
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} mx-auto mb-4`}></div>
        <h3 className="text-sm font-medium text-deep-charcoal mb-1">{title}</h3>
        <p className="text-3xl font-bold text-deep-charcoal mb-2">{value}</p>
        <p className="text-sm font-semibold text-sage-green">{change}</p>
    </div>
);