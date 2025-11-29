import React, { useState, useEffect } from 'react';
import { Mail, Check, AlertCircle, Loader, Lock, ExternalLink } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { emailNotificationService, EmailNotificationSettings } from '../services/emailNotificationService';

const EmailNotificationSettingsComponent: React.FC = () => {
    const { user } = useAuth();
    const [settings, setSettings] = useState<EmailNotificationSettings | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [smtpEnabled, setSmtpEnabled] = useState(false);
    const [smtpChecked, setSmtpChecked] = useState(false);

    useEffect(() => {
        checkSmtpStatus();
        if (user) {
            loadSettings();
        }
    }, [user]);

    const checkSmtpStatus = async () => {
        try {
            const response = await fetch('/api/notifications/status');
            const data = await response.json();
            setSmtpEnabled(data.enabled);
            setSmtpChecked(true);
        } catch (err) {
            console.error('Error checking SMTP status:', err);
            setSmtpEnabled(false);
            setSmtpChecked(true);
        }
    };

    const loadSettings = async () => {
        if (!user) return;

        setIsLoading(true);
        setError(null);

        try {
            const userSettings = await emailNotificationService.getSettings(user.id);

            if (userSettings) {
                setSettings(userSettings);
            } else {
                // Default settings
                setSettings({
                    userId: user.id,
                    failedPostsEnabled: true,
                    tokenExpirationEnabled: true,
                    weeklyReportEnabled: false,
                    email: user.email || '',
                });
            }
        } catch (err) {
            console.error('Error loading settings:', err);
            setError('Failed to load notification settings');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        if (!user || !settings) return;

        setIsSaving(true);
        setSaveSuccess(false);
        setError(null);

        try {
            const success = await emailNotificationService.updateSettings(user.id, {
                failedPostsEnabled: settings.failedPostsEnabled,
                tokenExpirationEnabled: settings.tokenExpirationEnabled,
                weeklyReportEnabled: settings.weeklyReportEnabled,
                email: settings.email,
            });

            if (success) {
                setSaveSuccess(true);
                setTimeout(() => setSaveSuccess(false), 3000);
            } else {
                setError('Failed to save settings');
            }
        } catch (err) {
            console.error('Error saving settings:', err);
            setError('Failed to save settings');
        } finally {
            setIsSaving(false);
        }
    };

    const handleToggle = (key: 'failedPostsEnabled' | 'tokenExpirationEnabled' | 'weeklyReportEnabled') => {
        if (!settings) return;
        setSettings({
            ...settings,
            [key]: !settings[key],
        });
    };

    const handleEmailChange = (email: string) => {
        if (!settings) return;
        setSettings({
            ...settings,
            email,
        });
    };

    if (isLoading || !smtpChecked) {
        return (
            <div className="flex items-center justify-center p-8">
                <Loader className="w-6 h-6 animate-spin text-brand-primary" />
            </div>
        );
    }

    // Show disabled state if SMTP is not configured
    if (!smtpEnabled) {
        return (
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-200 rounded-lg">
                        <Mail className="w-5 h-5 text-gray-500" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-surface-900">Email Notifications</h3>
                        <p className="text-sm text-gray-600">
                            Receive email alerts for important events
                        </p>
                    </div>
                </div>

                {/* Disabled Notice */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
                    <div className="flex items-start gap-3">
                        <Lock className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-1" />
                        <div className="flex-1">
                            <h4 className="font-bold text-yellow-900 mb-2">
                                Email Notifications Not Available
                            </h4>
                            <p className="text-sm text-yellow-800 mb-4">
                                Email notifications are currently disabled because an email provider (SMTP) has not been configured on the server.
                            </p>
                            <div className="bg-white rounded-lg p-4 mb-4">
                                <p className="text-sm font-medium text-gray-900 mb-2">
                                    What You Can Still Do:
                                </p>
                                <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
                                    <li>View real-time error notifications in the app</li>
                                    <li>Check failed posts in the Schedule page</li>
                                    <li>Manually retry failed posts</li>
                                    <li>Monitor post status in real-time</li>
                                </ul>
                            </div>
                            <p className="text-xs text-yellow-700">
                                <strong>For Administrators:</strong> To enable email notifications, configure SMTP settings (SMTP_USER, SMTP_PASSWORD) in the server environment variables.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Feature Preview (Disabled State) */}
                <div className="opacity-50 pointer-events-none">
                    <div className="space-y-4">
                        <div className="flex items-start justify-between p-4 bg-gray-100 border border-gray-200 rounded-lg">
                            <div className="flex-1">
                                <h4 className="font-medium text-gray-600">Failed Posts</h4>
                                <p className="text-sm text-gray-500 mt-1">
                                    Get notified when a scheduled post fails to publish
                                </p>
                            </div>
                            <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-300">
                                <span className="inline-block h-4 w-4 transform rounded-full bg-white translate-x-1" />
                            </div>
                        </div>

                        <div className="flex items-start justify-between p-4 bg-gray-100 border border-gray-200 rounded-lg">
                            <div className="flex-1">
                                <h4 className="font-medium text-gray-600">Token Expiration</h4>
                                <p className="text-sm text-gray-500 mt-1">
                                    Receive alerts when social media tokens expire
                                </p>
                            </div>
                            <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-300">
                                <span className="inline-block h-4 w-4 transform rounded-full bg-white translate-x-1" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!settings) {
        return (
            <div className="p-6 bg-red-50 rounded-lg border border-red-200">
                <p className="text-red-800">Failed to load notification settings</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3">
                <div className="p-2 bg-brand-primary/10 rounded-lg">
                    <Mail className="w-5 h-5 text-brand-primary" />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-surface-900">Email Notifications</h3>
                    <p className="text-sm text-gray-600">
                        Receive email alerts for important events
                    </p>
                </div>
            </div>

            {/* Email Address */}
            <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                    Email Address
                </label>
                <input
                    type="email"
                    value={settings.email || ''}
                    onChange={(e) => handleEmailChange(e.target.value)}
                    placeholder="your.email@example.com"
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                />
                <p className="text-xs text-gray-500">
                    Notifications will be sent to this email address
                </p>
            </div>

            {/* Notification Types */}
            <div className="space-y-4">
                {/* Failed Posts */}
                <div className="flex items-start justify-between p-4 bg-white border border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
                    <div className="flex-1">
                        <h4 className="font-medium text-surface-900">Failed Posts</h4>
                        <p className="text-sm text-gray-600 mt-1">
                            Get notified when a scheduled post fails to publish with error details and solutions
                        </p>
                    </div>
                    <button
                        onClick={() => handleToggle('failedPostsEnabled')}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            settings.failedPostsEnabled ? 'bg-brand-primary' : 'bg-gray-200'
                        }`}
                    >
                        <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                settings.failedPostsEnabled ? 'translate-x-6' : 'translate-x-1'
                            }`}
                        />
                    </button>
                </div>

                {/* Token Expiration */}
                <div className="flex items-start justify-between p-4 bg-white border border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
                    <div className="flex-1">
                        <h4 className="font-medium text-surface-900">Token Expiration</h4>
                        <p className="text-sm text-gray-600 mt-1">
                            Receive alerts when social media account tokens expire and need reconnection
                        </p>
                    </div>
                    <button
                        onClick={() => handleToggle('tokenExpirationEnabled')}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            settings.tokenExpirationEnabled ? 'bg-brand-primary' : 'bg-gray-200'
                        }`}
                    >
                        <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                settings.tokenExpirationEnabled ? 'translate-x-6' : 'translate-x-1'
                            }`}
                        />
                    </button>
                </div>

                {/* Weekly Report */}
                <div className="flex items-start justify-between p-4 bg-white border border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
                    <div className="flex-1">
                        <h4 className="font-medium text-surface-900">Weekly Report</h4>
                        <p className="text-sm text-gray-600 mt-1">
                            Get a weekly summary of your posts, engagement metrics, and performance insights
                        </p>
                        <span className="inline-block mt-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                            Coming Soon
                        </span>
                    </div>
                    <button
                        onClick={() => handleToggle('weeklyReportEnabled')}
                        disabled
                        className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 opacity-50 cursor-not-allowed"
                    >
                        <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-1" />
                    </button>
                </div>
            </div>

            {/* Save Button */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div>
                    {saveSuccess && (
                        <div className="flex items-center gap-2 text-green-600">
                            <Check className="w-4 h-4" />
                            <span className="text-sm font-medium">Settings saved</span>
                        </div>
                    )}
                    {error && (
                        <div className="flex items-center gap-2 text-red-600">
                            <AlertCircle className="w-4 h-4" />
                            <span className="text-sm font-medium">{error}</span>
                        </div>
                    )}
                </div>
                <button
                    onClick={handleSave}
                    disabled={isSaving || !settings.email}
                    className="px-6 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                    {isSaving ? (
                        <>
                            <Loader className="w-4 h-4 animate-spin" />
                            Saving...
                        </>
                    ) : (
                        <>
                            <Check className="w-4 h-4" />
                            Save Preferences
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};

export default EmailNotificationSettingsComponent;
