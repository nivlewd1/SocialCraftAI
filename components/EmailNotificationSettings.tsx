import React, { useState, useEffect } from 'react';
import { Mail, Check, AlertCircle, Loader } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { emailNotificationService, EmailNotificationSettings } from '../services/emailNotificationService';

const EmailNotificationSettingsComponent: React.FC = () => {
    const { user } = useAuth();
    const [settings, setSettings] = useState<EmailNotificationSettings | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadSettings();
    }, [user]);

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

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-8">
                <Loader className="w-6 h-6 animate-spin text-brand-primary" />
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
