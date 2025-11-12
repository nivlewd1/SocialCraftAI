import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { User, Mail, Lock, Bell, Shield, CreditCard, Trash2, Download, Globe, CheckCircle, AlertTriangle } from 'lucide-react';

type SettingsTab = 'profile' | 'account' | 'notifications' | 'security' | 'billing' | 'danger';

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
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-deep-charcoal mb-2">
          Account <span className="gradient-text">Settings</span>
        </h1>
        <p className="text-gray-600">Manage your profile, preferences, and subscription</p>
      </div>

      {/* Message Alert */}
      {message && (
        <div
          className={`glass-card rounded-lg p-4 flex items-center ${
            message.type === 'success' ? 'bg-green-50 border-2 border-green-200' : 'bg-red-50 border-2 border-red-200'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
          ) : (
            <AlertTriangle className="h-5 w-5 text-red-600 mr-3" />
          )}
          <span className={message.type === 'success' ? 'text-green-800' : 'text-red-800'}>{message.text}</span>
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
      <h2 className="text-2xl font-bold text-deep-charcoal mb-2">Profile Information</h2>
      <p className="text-gray-600">Update your profile details and avatar</p>
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
            <p className="text-xs text-gray-500 mt-2">JPG, PNG or GIF. Max 2MB.</p>
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
        <p className="text-xs text-gray-500 mt-1">This email is used for sign in and notifications</p>
      </div>

      {/* Bio */}
      <div>
        <label className="block text-sm font-medium text-deep-charcoal mb-2">Bio</label>
        <textarea
          rows={4}
          className="input-field w-full px-4 py-3 rounded-lg resize-none"
          placeholder="Tell us about yourself..."
        />
        <p className="text-xs text-gray-500 mt-1">Brief description for your profile. Max 200 characters.</p>
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
      <h2 className="text-2xl font-bold text-deep-charcoal mb-2">Account Preferences</h2>
      <p className="text-gray-600">Manage your regional and display preferences</p>
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
      <h2 className="text-2xl font-bold text-deep-charcoal mb-2">Notification Preferences</h2>
      <p className="text-gray-600">Manage how you receive updates and alerts</p>
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
      <h2 className="text-2xl font-bold text-deep-charcoal mb-2">Security Settings</h2>
      <p className="text-gray-600">Manage your password and security preferences</p>
    </div>

    <form onSubmit={onSubmit} className="space-y-6">
      {/* Change Password */}
      <div className="glass-card bg-warm-gray rounded-xl p-6">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold text-deep-charcoal mb-2">Change Password</h3>
            <p className="text-sm text-gray-600 mb-4">
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
            <p className="text-sm text-gray-600">Add an extra layer of security to your account</p>
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
        <div className="space-y-3">
          <SessionCard
            device="Chrome on Windows"
            location="New York, USA"
            lastActive="Current session"
            current
          />
          <SessionCard
            device="Safari on iPhone"
            location="New York, USA"
            lastActive="2 hours ago"
          />
        </div>
      </div>
    </form>
  </div>
);

// Billing Settings Component
const BillingSettings: React.FC = () => (
  <div className="space-y-6">
    <div>
      <h2 className="text-2xl font-bold text-deep-charcoal mb-2">Billing & Subscription</h2>
      <p className="text-gray-600">Manage your subscription and payment methods</p>
    </div>

    {/* Current Plan */}
    <div className="glass-card bg-gradient-to-br from-sage-green to-soft-blue rounded-2xl p-8 text-white">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-2xl font-bold mb-2">Free Plan</h3>
          <p className="text-white/90">Currently on the free forever plan</p>
        </div>
        <CreditCard className="h-8 w-8" />
      </div>
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div>
          <div className="text-3xl font-bold">100</div>
          <div className="text-sm text-white/80">Posts per month</div>
        </div>
        <div>
          <div className="text-3xl font-bold">45</div>
          <div className="text-sm text-white/80">Posts used</div>
        </div>
        <div>
          <div className="text-3xl font-bold">55</div>
          <div className="text-sm text-white/80">Posts remaining</div>
        </div>
      </div>
      <button className="bg-white text-sage-green px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-all">
        Upgrade to Pro
      </button>
    </div>

    {/* Usage Statistics */}
    <div>
      <h3 className="text-lg font-semibold text-deep-charcoal mb-4">Usage This Month</h3>
      <div className="grid md:grid-cols-3 gap-4">
        <UsageCard label="Posts Generated" value="45" max="100" />
        <UsageCard label="Trend Analyses" value="12" max="50" />
        <UsageCard label="Media Created" value="8" max="25" />
      </div>
    </div>

    {/* Payment Method */}
    <div>
      <h3 className="text-lg font-semibold text-deep-charcoal mb-4">Payment Method</h3>
      <div className="glass-card bg-warm-gray rounded-xl p-6">
        <p className="text-gray-600 mb-4">No payment method on file</p>
        <button className="btn-secondary px-6 py-2 rounded-lg">
          Add Payment Method
        </button>
      </div>
    </div>
  </div>
);

// Danger Zone Component
const DangerZone: React.FC = () => (
  <div className="space-y-6">
    <div>
      <h2 className="text-2xl font-bold text-deep-charcoal mb-2">Danger Zone</h2>
      <p className="text-gray-600">Irreversible actions that affect your account</p>
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
            <p className="text-sm text-gray-600 mb-4">
              Download all your content, drafts, and analytics in a portable format
            </p>
            <button className="btn-secondary px-6 py-2 rounded-lg">
              Request Data Export
            </button>
          </div>
        </div>
      </div>

      {/* Delete Account */}
      <div className="border-2 border-red-200 bg-red-50 rounded-xl p-6">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold text-red-700 mb-2 flex items-center">
              <Trash2 className="h-5 w-5 mr-2" />
              Delete Account
            </h3>
            <p className="text-sm text-red-600 mb-4">
              Permanently delete your account and all associated data. This action cannot be undone.
            </p>
            <button className="bg-red-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-red-700 transition-all">
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
      <div className="text-sm text-gray-600">{description}</div>
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
      <div className="text-sm text-gray-600">{location} • {lastActive}</div>
    </div>
    {!current && (
      <button className="text-sm text-red-600 hover:text-red-700 font-medium">
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
      <div className="text-sm text-gray-600 mb-2">{label}</div>
      <div className="text-2xl font-bold text-deep-charcoal mb-2">
        {value} <span className="text-sm font-normal text-gray-500">/ {max}</span>
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
