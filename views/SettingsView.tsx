import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSubscription } from '../contexts/SubscriptionContext';
import { PRICING_PLANS } from '../config/pricing';
import { openCustomerPortal } from '../utils/stripe';
import { User, Mail, Lock, Bell, Shield, CreditCard, Trash2, Download, Globe, CheckCircle, AlertTriangle, Sparkles, ArrowUpCircle, ExternalLink, Link2 } from 'lucide-react';
import IntegrationsSettings from '../components/IntegrationsSettings';

type SettingsTab = 'profile' | 'account' | 'notifications' | 'security' | 'billing' | 'integrations' | 'danger';

const SettingsView: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Profile state
  const [displayName, setDisplayName] = useState(user?.user_metadata?.full_name || '');
  const [email, setEmail] = useState(user?.email || '');

  // Account settings state
  const [timezone, setTimezone] = useState('America/New_York');
  const [language, setLanguage] = useState('en');

  // Notification settings state
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [weeklyReport, setWeeklyReport] = useState(true);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage({ type: 'success', text: 'Profile updated successfully!' });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage({ type: 'success', text: 'Password change email sent!' });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleSaveSettings = () => {
    setMessage({ type: 'success', text: 'Settings saved successfully!' });
    setTimeout(() => setMessage(null), 3000);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pt-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold font-display text-deep-charcoal mb-2">
          Account <span className="gradient-text">Settings</span>
        </h1>
        <p className="text-deep-charcoal">Manage your profile, preferences, and subscription</p>
      </div>

      {/* Toast Notification */}
      {message && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 animate-in slide-in-from-bottom-5 fade-in duration-300">
          <div
            className={`shadow-lg rounded-xl px-6 py-4 flex items-center space-x-3 ${
              message.type === 'success'
                ? 'bg-sage-green text-white'
                : 'bg-status-error text-white'
            }`}
          >
            {message.type === 'success' ? (
              <CheckCircle className="h-6 w-6 flex-shrink-0" />
            ) : (
              <AlertTriangle className="h-6 w-6 flex-shrink-0" />
            )}
            <span className="font-medium text-base">{message.text}</span>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Sidebar Navigation */}
        <div className="lg:col-span-1">
          <nav className="glass-card rounded-2xl p-4 space-y-1">
            <TabButton
              icon={<User size={18} />}
              label="Profile"
              active={activeTab === 'profile'}
              onClick={() => setActiveTab('profile')}
            />
            <TabButton
              icon={<Globe size={18} />}
              label="Account"
              active={activeTab === 'account'}
              onClick={() => setActiveTab('account')}
            />
            <TabButton
              icon={<Bell size={18} />}
              label="Notifications"
              active={activeTab === 'notifications'}
              onClick={() => setActiveTab('notifications')}
            />
            <TabButton
              icon={<Shield size={18} />}
              label="Security"
              active={activeTab === 'security'}
              onClick={() => setActiveTab('security')}
            />
            <TabButton
              icon={<CreditCard size={18} />}
              label="Billing"
              active={activeTab === 'billing'}
              onClick={() => setActiveTab('billing')}
            />
            <TabButton
              icon={<Link2 size={18} />}
              label="Integrations"
              active={activeTab === 'integrations'}
              onClick={() => setActiveTab('integrations')}
            />
            <TabButton
              icon={<Trash2 size={18} />}
              label="Danger Zone"
              active={activeTab === 'danger'}
              onClick={() => setActiveTab('danger')}
            />
          </nav>
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-3">
          <div className="glass-card rounded-2xl p-8">
            {activeTab === 'profile' && (
              <ProfileSettings
                displayName={displayName}
                setDisplayName={setDisplayName}
                email={email}
                setEmail={setEmail}
                onSubmit={handleUpdateProfile}
              />
            )}

            {activeTab === 'account' && (
              <AccountSettings
                timezone={timezone}
                setTimezone={setTimezone}
                language={language}
                setLanguage={setLanguage}
                onSave={handleSaveSettings}
              />
            )}

            {activeTab === 'notifications' && (
              <NotificationSettings
                emailNotifications={emailNotifications}
                setEmailNotifications={setEmailNotifications}
                pushNotifications={pushNotifications}
                setPushNotifications={setPushNotifications}
                weeklyReport={weeklyReport}
                setWeeklyReport={setWeeklyReport}
                onSave={handleSaveSettings}
              />
            )}

            {activeTab === 'security' && <SecuritySettings onSubmit={handleChangePassword} />}

            {activeTab === 'billing' && <BillingSettings />}

            {activeTab === 'integrations' && <IntegrationsSettings />}

            {activeTab === 'danger' && <DangerZone />}
          </div>
        </div>
      </div>
    </div>
  );
};

// Tab Button Component
const TabButton: React.FC<{
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}> = ({ icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
      active
        ? 'bg-sage-green text-white shadow-medium'
        : 'text-deep-charcoal hover:bg-warm-gray'
    }`}
  >
    {icon}
    <span>{label}</span>
  </button>
);

// Profile Settings Component
const ProfileSettings: React.FC<{
  displayName: string;
  setDisplayName: (name: string) => void;
  email: string;
  setEmail: (email: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}> = ({ displayName, setDisplayName, email, setEmail, onSubmit }) => (
  <div className="space-y-6">
    <div>
      <h2 className="text-2xl font-bold font-display text-deep-charcoal mb-2">Profile Information</h2>
      <p className="text-deep-charcoal">Update your profile details and avatar</p>
    </div>

    <form onSubmit={onSubmit} className="space-y-6">
      {/* Avatar Upload */}
      <div>
        <label className="block text-sm font-medium text-deep-charcoal mb-3">Profile Picture</label>
        <div className="flex items-center space-x-4">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-sage-green to-terracotta flex items-center justify-center text-white text-2xl font-bold">
            {displayName?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div>
            <button type="button" className="btn-secondary px-4 py-2 rounded-lg text-sm">
              Upload New
            </button>
            <p className="text-xs text-deep-charcoal mt-2">JPG, PNG or GIF. Max 2MB.</p>
          </div>
        </div>
      </div>

      {/* Display Name */}
      <div>
        <label className="block text-sm font-medium text-deep-charcoal mb-2">Display Name</label>
        <input
          type="text"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          className="input-field w-full px-4 py-3 rounded-lg"
          placeholder="Your full name"
        />
      </div>

      {/* Email */}
      <div>
        <label className="block text-sm font-medium text-deep-charcoal mb-2">Email Address</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="input-field w-full px-4 py-3 rounded-lg"
          placeholder="your.email@example.com"
        />
        <p className="text-xs text-deep-charcoal mt-1">This email is used for sign in and notifications</p>
      </div>

      {/* Bio */}
      <div>
        <label className="block text-sm font-medium text-deep-charcoal mb-2">Bio</label>
        <textarea
          rows={4}
          className="input-field w-full px-4 py-3 rounded-lg resize-none"
          placeholder="Tell us about yourself..."
        />
        <p className="text-xs text-deep-charcoal mt-1">Brief description for your profile. Max 200 characters.</p>
      </div>

      <button type="submit" className="btn-primary px-6 py-3 rounded-lg">
        Save Changes
      </button>
    </form>
  </div>
);

// Account Settings Component
const AccountSettings: React.FC<{
  timezone: string;
  setTimezone: (tz: string) => void;
  language: string;
  setLanguage: (lang: string) => void;
  onSave: () => void;
}> = ({ timezone, setTimezone, language, setLanguage, onSave }) => (
  <div className="space-y-6">
    <div>
      <h2 className="text-2xl font-bold font-display text-deep-charcoal mb-2">Account Preferences</h2>
      <p className="text-deep-charcoal">Manage your regional and display preferences</p>
    </div>

    <div className="space-y-6">
      {/* Timezone */}
      <div>
        <label className="block text-sm font-medium text-deep-charcoal mb-2">Timezone</label>
        <select
          value={timezone}
          onChange={(e) => setTimezone(e.target.value)}
          className="input-field w-full px-4 py-3 rounded-lg"
        >
          <option value="America/New_York">Eastern Time (ET)</option>
          <option value="America/Chicago">Central Time (CT)</option>
          <option value="America/Denver">Mountain Time (MT)</option>
          <option value="America/Los_Angeles">Pacific Time (PT)</option>
          <option value="UTC">UTC</option>
        </select>
      </div>

      {/* Language */}
      <div>
        <label className="block text-sm font-medium text-deep-charcoal mb-2">Language</label>
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="input-field w-full px-4 py-3 rounded-lg"
        >
          <option value="en">English</option>
          <option value="es">Español</option>
          <option value="fr">Français</option>
          <option value="de">Deutsch</option>
        </select>
      </div>

      {/* Privacy Settings */}
      <div className="border-t border-warm-gray pt-6">
        <h3 className="text-lg font-semibold text-deep-charcoal mb-4">Privacy</h3>
        <div className="space-y-3">
          <ToggleSetting label="Make profile public" description="Allow others to see your profile" />
          <ToggleSetting label="Show activity status" description="Let others know when you're active" />
          <ToggleSetting label="Allow analytics cookies" description="Help us improve your experience" />
        </div>
      </div>

      <button onClick={onSave} className="btn-primary px-6 py-3 rounded-lg">
        Save Preferences
      </button>
    </div>
  </div>
);

// Notification Settings Component
const NotificationSettings: React.FC<{
  emailNotifications: boolean;
  setEmailNotifications: (value: boolean) => void;
  pushNotifications: boolean;
  setPushNotifications: (value: boolean) => void;
  weeklyReport: boolean;
  setWeeklyReport: (value: boolean) => void;
  onSave: () => void;
}> = ({
  emailNotifications,
  setEmailNotifications,
  pushNotifications,
  setPushNotifications,
  weeklyReport,
  setWeeklyReport,
  onSave
}) => (
  <div className="space-y-6">
    <div>
      <h2 className="text-2xl font-bold font-display text-deep-charcoal mb-2">Notification Preferences</h2>
      <p className="text-deep-charcoal">Manage how you receive updates and alerts</p>
    </div>

    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-deep-charcoal mb-4">Email Notifications</h3>
        <div className="space-y-3">
          <ToggleSetting
            label="Email notifications"
            description="Receive email updates about your account activity"
            checked={emailNotifications}
            onChange={setEmailNotifications}
          />
          <ToggleSetting
            label="Weekly performance report"
            description="Get a summary of your content performance every week"
            checked={weeklyReport}
            onChange={setWeeklyReport}
          />
          <ToggleSetting label="Product updates" description="Learn about new features and improvements" />
          <ToggleSetting label="Marketing emails" description="Receive tips and best practices" />
        </div>
      </div>

      <div className="border-t border-warm-gray pt-6">
        <h3 className="text-lg font-semibold text-deep-charcoal mb-4">Push Notifications</h3>
        <div className="space-y-3">
          <ToggleSetting
            label="Push notifications"
            description="Receive push notifications in your browser"
            checked={pushNotifications}
            onChange={setPushNotifications}
          />
          <ToggleSetting label="Content published" description="Notify when scheduled content is published" />
          <ToggleSetting label="Performance alerts" description="Get alerts for high-performing content" />
        </div>
      </div>

      <button onClick={onSave} className="btn-primary px-6 py-3 rounded-lg">
        Save Notification Settings
      </button>
    </div>
  </div>
);

// Security Settings Component
const SecuritySettings: React.FC<{
  onSubmit: (e: React.FormEvent) => void;
}> = ({ onSubmit }) => (
  <div className="space-y-6">
    <div>
      <h2 className="text-2xl font-bold font-display text-deep-charcoal mb-2">Security Settings</h2>
      <p className="text-deep-charcoal">Manage your password and security preferences</p>
    </div>

    <form onSubmit={onSubmit} className="space-y-6">
      {/* Change Password */}
      <div className="glass-card bg-warm-gray rounded-xl p-6">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold text-deep-charcoal mb-2">Change Password</h3>
            <p className="text-sm text-deep-charcoal mb-4">
              We'll send you an email with instructions to reset your password
            </p>
          </div>
          <Lock className="h-6 w-6 text-sage-green" />
        </div>
        <button type="submit" className="btn-secondary px-6 py-2 rounded-lg">
          Send Password Reset Email
        </button>
      </div>

      {/* Two-Factor Authentication */}
      <div className="glass-card bg-warm-gray rounded-xl p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-deep-charcoal mb-2">Two-Factor Authentication</h3>
            <p className="text-sm text-deep-charcoal">Add an extra layer of security to your account</p>
          </div>
          <Shield className="h-6 w-6 text-sage-green" />
        </div>
        <button type="button" className="btn-secondary px-6 py-2 rounded-lg">
          Enable 2FA
        </button>
      </div>

      {/* Active Sessions */}
      <div>
        <h3 className="text-lg font-semibold text-deep-charcoal mb-4">Active Sessions</h3>
        <div className="glass-card bg-warm-gray rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="font-medium text-deep-charcoal flex items-center">
                Current Browser Session
                <span className="ml-2 px-2 py-0.5 bg-sage-green text-white text-xs rounded-full">Active</span>
              </div>
              <div className="text-sm text-deep-charcoal mt-1">You are currently signed in</div>
            </div>
          </div>
          <p className="text-sm text-deep-charcoal">
            Advanced session management (view all devices, remote sign out) will be available in a future update.
          </p>
        </div>
      </div>
    </form>
  </div>
);

// Billing Settings Component
const BillingSettings: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { subscription, loading } = useSubscription();
  const [portalLoading, setPortalLoading] = useState(false);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sage-green"></div>
      </div>
    );
  }

  if (!subscription) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 mb-4">Unable to load subscription data</p>
        <button
          onClick={() => navigate('/pricing')}
          className="btn-primary px-6 py-3 rounded-lg"
        >
          View Pricing Plans
        </button>
      </div>
    );
  }

  const currentPlan = PRICING_PLANS.find(p => p.id === subscription.plan);
  const isFreePlan = subscription.plan === 'free';
  const isPaidPlan = !isFreePlan && subscription.plan !== 'enterprise';
  const isEnterprise = subscription.plan === 'enterprise';

  // Calculate usage percentage
  const generationsLimit = subscription.generationsLimit === 'unlimited' ? 1000 : subscription.generationsLimit;
  const usagePercentage = (subscription.generationsUsed / generationsLimit) * 100;
  const remaining = generationsLimit - subscription.generationsUsed;

  // Format period end date
  const periodEndDate = subscription.currentPeriodEnd
    ? new Date(subscription.currentPeriodEnd).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      })
    : null;

  // Get status badge color
  const getStatusColor = () => {
    switch (subscription.subscriptionStatus) {
      case 'active':
      case 'trialing':
        return 'bg-green-500';
      case 'past_due':
        return 'bg-yellow-500';
      case 'canceled':
        return 'bg-status-error';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusText = () => {
    switch (subscription.subscriptionStatus) {
      case 'active':
        return 'Active';
      case 'trialing':
        return 'Trial';
      case 'past_due':
        return 'Past Due';
      case 'canceled':
        return 'Canceled';
      case 'incomplete':
        return 'Incomplete';
      default:
        return subscription.subscriptionStatus || 'Active';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold font-display text-deep-charcoal mb-2">Billing & Subscription</h2>
        <p className="text-deep-charcoal">Manage your subscription and payment methods</p>
      </div>

      {/* Current Plan Card */}
      <div className={`glass-card rounded-2xl p-8 text-white ${
        isFreePlan
          ? 'bg-gradient-to-br from-gray-600 to-gray-700'
          : 'bg-gradient-to-br from-sage-green to-soft-blue'
      }`}>
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <h3 className="text-2xl font-bold">{currentPlan?.name || 'Unknown Plan'}</h3>
              {!isFreePlan && (
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor()} text-white`}>
                  {getStatusText()}
                </span>
              )}
            </div>
            <p className="text-white/90">
              {isFreePlan ? 'Free forever plan' : currentPlan?.description || 'Professional plan'}
            </p>
            {!isFreePlan && periodEndDate && subscription.subscriptionStatus !== 'canceled' && (
              <p className="text-sm text-white/80 mt-2">
                {subscription.subscriptionStatus === 'trialing' ? 'Trial ends' : 'Next billing'}: {periodEndDate}
              </p>
            )}
            {subscription.subscriptionStatus === 'canceled' && periodEndDate && (
              <p className="text-sm text-white/80 mt-2">
                Access until: {periodEndDate}
              </p>
            )}
          </div>
          <CreditCard className="h-8 w-8" />
        </div>

        {/* Usage Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div>
            <div className="text-3xl font-bold">
              {subscription.generationsLimit === 'unlimited' ? '∞' : generationsLimit}
            </div>
            <div className="text-sm text-white/80">Generations/month</div>
          </div>
          <div>
            <div className="text-3xl font-bold">{subscription.generationsUsed}</div>
            <div className="text-sm text-white/80">Used this month</div>
          </div>
          <div>
            <div className="text-3xl font-bold">
              {subscription.generationsLimit === 'unlimited' ? '∞' : remaining}
            </div>
            <div className="text-sm text-white/80">Remaining</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="w-full bg-white/20 rounded-full h-3">
            <div
              className="bg-white h-3 rounded-full transition-all"
              style={{ width: `${Math.min(usagePercentage, 100)}%` }}
            ></div>
          </div>
          <p className="text-xs text-white/70 mt-2">
            {usagePercentage.toFixed(0)}% of monthly limit used
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3">
          {isFreePlan && (
            <button
              onClick={() => navigate('/pricing')}
              className="bg-white text-sage-green px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-all flex items-center space-x-2"
            >
              <ArrowUpCircle className="h-5 w-5" />
              <span>Upgrade to Pro</span>
            </button>
          )}
          {isPaidPlan && (
            <>
              <button
                onClick={async () => {
                  if (!user) return;
                  setPortalLoading(true);
                  try {
                    await openCustomerPortal(user.id);
                  } catch (error) {
                    console.error('Portal error:', error);
                    alert(error instanceof Error ? error.message : 'Failed to open customer portal');
                  } finally {
                    setPortalLoading(false);
                  }
                }}
                disabled={portalLoading}
                className="bg-white text-sage-green px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-all flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <CreditCard className="h-5 w-5" />
                <span>{portalLoading ? 'Loading...' : 'Manage Subscription'}</span>
              </button>
              <button
                onClick={() => navigate('/pricing')}
                className="bg-white/20 text-white px-6 py-3 rounded-lg font-semibold hover:bg-white/30 transition-all flex items-center space-x-2"
              >
                <Sparkles className="h-5 w-5" />
                <span>View All Plans</span>
              </button>
            </>
          )}
          {isEnterprise && (
            <button
              onClick={() => window.location.href = 'mailto:sales@socialcraftai.com?subject=Enterprise Support'}
              className="bg-white text-sage-green px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-all flex items-center space-x-2"
            >
              <ExternalLink className="h-5 w-5" />
              <span>Contact Support</span>
            </button>
          )}
        </div>
      </div>

      {/* Plan Features */}
      {currentPlan && (
        <div>
          <h3 className="text-lg font-semibold text-deep-charcoal mb-4">Your Plan Includes</h3>
          <div className="grid md:grid-cols-2 gap-3">
            {currentPlan.features.map((feature, idx) => (
              <div key={idx} className="flex items-start space-x-2 text-sm">
                <CheckCircle className="h-5 w-5 text-sage-green flex-shrink-0 mt-0.5" />
                <span className="text-gray-700">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Payment Method (Phase 2) */}
      {isPaidPlan && (
        <div>
          <h3 className="text-lg font-semibold text-deep-charcoal mb-4">Payment Method</h3>
          <div className="glass-card bg-warm-gray rounded-xl p-6">
            {subscription.stripeCustomerId ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <CreditCard className="h-5 w-5 text-sage-green" />
                  <div>
                    <p className="font-medium text-deep-charcoal">Card on file</p>
                    <p className="text-sm text-gray-600">Manage via Stripe Customer Portal</p>
                  </div>
                </div>
                <button
                  onClick={async () => {
                    if (!user) return;
                    setPortalLoading(true);
                    try {
                      await openCustomerPortal(user.id);
                    } catch (error) {
                      console.error('Portal error:', error);
                      alert(error instanceof Error ? error.message : 'Failed to open customer portal');
                    } finally {
                      setPortalLoading(false);
                    }
                  }}
                  disabled={portalLoading}
                  className="btn-secondary px-4 py-2 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {portalLoading ? 'Loading...' : 'Update'}
                </button>
              </div>
            ) : (
              <>
                <p className="text-gray-600 mb-4">No payment method on file</p>
                <button className="btn-secondary px-6 py-2 rounded-lg">
                  Add Payment Method
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Billing History (Phase 2) */}
      {isPaidPlan && (
        <div>
          <h3 className="text-lg font-semibold text-deep-charcoal mb-4">Billing History</h3>
          <div className="glass-card bg-warm-gray rounded-xl p-6">
            <p className="text-gray-600 text-sm">
              Billing history will be available in Phase 2 via Stripe Customer Portal
            </p>
          </div>
        </div>
      )}

      {/* Upgrade CTA for Free Users */}
      {isFreePlan && (
        <div className="glass-card rounded-2xl p-8 bg-gradient-to-br from-sage-green/10 to-terracotta/10 border border-sage-green/20">
          <div className="flex items-start space-x-4">
            <Sparkles className="h-8 w-8 text-sage-green flex-shrink-0" />
            <div className="flex-grow">
              <h3 className="text-xl font-bold text-deep-charcoal mb-2">
                Unlock More with Pro
              </h3>
              <p className="text-gray-700 mb-4">
                Get 200 generations per month, advanced analytics, priority support, and more!
              </p>
              <button
                onClick={() => navigate('/pricing')}
                className="btn-primary px-6 py-3 rounded-lg"
              >
                View Pro Plans
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Danger Zone Component
const DangerZone: React.FC = () => (
  <div className="space-y-6">
    <div>
      <h2 className="text-2xl font-bold font-display text-deep-charcoal mb-2">Danger Zone</h2>
      <p className="text-deep-charcoal">Irreversible actions that affect your account</p>
    </div>

    <div className="space-y-4">
      {/* Export Data */}
      <div className="border-2 border-warm-gray rounded-xl p-6">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold text-deep-charcoal mb-2 flex items-center">
              <Download className="h-5 w-5 mr-2 text-soft-blue" />
              Export Your Data
            </h3>
            <p className="text-sm text-deep-charcoal mb-4">
              Download all your content, drafts, and analytics in a portable format
            </p>
            <button className="btn-secondary px-6 py-2 rounded-lg">
              Request Data Export
            </button>
          </div>
        </div>
      </div>

      {/* Delete Account */}
      <div className="border-2 border-status-error/20 bg-status-error/10 rounded-xl p-6">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold text-status-error mb-2 flex items-center">
              <Trash2 className="h-5 w-5 mr-2" />
              Delete Account
            </h3>
            <p className="text-sm text-status-error mb-4">
              Permanently delete your account and all associated data. This action cannot be undone.
            </p>
            <button className="bg-status-error text-white px-6 py-2 rounded-lg font-semibold hover:bg-status-error/80 transition-all">
              Delete My Account
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// Toggle Setting Component
const ToggleSetting: React.FC<{
  label: string;
  description: string;
  checked?: boolean;
  onChange?: (value: boolean) => void;
}> = ({ label, description, checked = false, onChange }) => (
  <div className="flex items-center justify-between p-4 glass-card bg-warm-gray rounded-lg">
    <div>
      <div className="font-medium text-deep-charcoal">{label}</div>
      <div className="text-sm text-deep-charcoal">{description}</div>
    </div>
    <label className="relative inline-flex items-center cursor-pointer">
      <input
        type="checkbox"
        className="sr-only peer"
        checked={checked}
        onChange={(e) => onChange?.(e.target.checked)}
      />
      <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-sage-green rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sage-green"></div>
    </label>
  </div>
);

// Session Card Component
const SessionCard: React.FC<{
  device: string;
  location: string;
  lastActive: string;
  current?: boolean;
}> = ({ device, location, lastActive, current }) => (
  <div className="flex items-center justify-between p-4 glass-card bg-warm-gray rounded-lg">
    <div>
      <div className="font-medium text-deep-charcoal flex items-center">
        {device}
        {current && <span className="ml-2 px-2 py-0.5 bg-sage-green text-white text-xs rounded-full">Current</span>}
      </div>
      <div className="text-sm text-deep-charcoal">{location} • {lastActive}</div>
    </div>
    {!current && (
      <button className="text-sm text-status-error hover:text-status-error/80 font-medium">
        Revoke
      </button>
    )}
  </div>
);

// Usage Card Component
const UsageCard: React.FC<{
  label: string;
  value: string;
  max: string;
}> = ({ label, value, max }) => {
  const percentage = (parseInt(value) / parseInt(max)) * 100;

  return (
    <div className="glass-card rounded-xl p-4">
      <div className="text-sm text-deep-charcoal mb-2">{label}</div>
      <div className="text-2xl font-bold text-deep-charcoal mb-2">
        {value} <span className="text-sm font-normal text-deep-charcoal">/ {max}</span>
      </div>
      <div className="w-full bg-warm-gray rounded-full h-2">
        <div
          className="bg-gradient-to-r from-sage-green to-terracotta h-2 rounded-full transition-all"
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
};

export default SettingsView;
