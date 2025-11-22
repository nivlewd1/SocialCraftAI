import React, { useState, useEffect } from 'react';
import {
  Linkedin,
  Instagram,
  Twitter,
  Pin,
  Link2,
  CheckCircle,
  AlertCircle,
  Loader2,
  ExternalLink,
  Unlink,
  Clock,
  User
} from 'lucide-react';
import { integrationsService, AVAILABLE_PLATFORMS, ConnectedAccount } from '../services/integrationsService';

// TikTok icon component (not in lucide-react)
const TikTokIcon: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
  </svg>
);

// Platform icon mapping
const getPlatformIcon = (platform: string, className: string = '') => {
  switch (platform) {
    case 'linkedin':
      return <Linkedin className={className} />;
    case 'instagram':
      return <Instagram className={className} />;
    case 'tiktok':
      return <TikTokIcon className={className} />;
    case 'twitter':
      return <Twitter className={className} />;
    case 'pinterest':
      return <Pin className={className} />;
    default:
      return <Link2 className={className} />;
  }
};

interface IntegrationsSettingsProps {
  onAccountConnected?: () => void;
  onAccountDisconnected?: () => void;
}

const IntegrationsSettings: React.FC<IntegrationsSettingsProps> = ({
  onAccountConnected,
  onAccountDisconnected,
}) => {
  const [connectedAccounts, setConnectedAccounts] = useState<ConnectedAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [connectingPlatform, setConnectingPlatform] = useState<string | null>(null);
  const [disconnectingPlatform, setDisconnectingPlatform] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Load connected accounts on mount
  useEffect(() => {
    loadConnectedAccounts();
  }, []);

  const loadConnectedAccounts = async () => {
    try {
      setLoading(true);
      const accounts = await integrationsService.getConnectedAccounts();
      setConnectedAccounts(accounts);
    } catch (error) {
      console.error('Error loading connected accounts:', error);
      showMessage('error', 'Failed to load connected accounts');
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const handleConnect = async (platform: 'linkedin' | 'instagram' | 'tiktok' | 'twitter' | 'pinterest') => {
    try {
      setConnectingPlatform(platform);
      await integrationsService.connectPlatform(platform);

      // Reload accounts after successful connection
      await loadConnectedAccounts();

      showMessage('success', `Successfully connected ${AVAILABLE_PLATFORMS.find(p => p.id === platform)?.name}!`);
      onAccountConnected?.();
    } catch (error) {
      console.error(`Error connecting ${platform}:`, error);
      showMessage('error', error instanceof Error ? error.message : `Failed to connect ${platform}`);
    } finally {
      setConnectingPlatform(null);
    }
  };

  const handleDisconnect = async (platform: 'linkedin' | 'instagram' | 'tiktok' | 'twitter' | 'pinterest') => {
    // Confirm before disconnecting
    const platformName = AVAILABLE_PLATFORMS.find(p => p.id === platform)?.name;
    if (!confirm(`Are you sure you want to disconnect ${platformName}? You'll need to reconnect to post to this platform.`)) {
      return;
    }

    try {
      setDisconnectingPlatform(platform);
      await integrationsService.disconnectPlatform(platform);

      // Reload accounts after disconnection
      await loadConnectedAccounts();

      showMessage('success', `Successfully disconnected ${platformName}`);
      onAccountDisconnected?.();
    } catch (error) {
      console.error(`Error disconnecting ${platform}:`, error);
      showMessage('error', `Failed to disconnect ${platform}`);
    } finally {
      setDisconnectingPlatform(null);
    }
  };

  const isConnected = (platform: string) => {
    return connectedAccounts.some(account => account.platform === platform);
  };

  const getAccountInfo = (platform: string) => {
    return connectedAccounts.find(account => account.platform === platform);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-12 w-12 animate-spin text-brand-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold font-display text-surface-900 mb-2">
          Social Media Integrations
        </h2>
        <p className="text-surface-900">
          Connect your social media accounts to publish content directly from SocialCraft AI
        </p>
      </div>

      {/* Getting Started Hint */}
      {connectedAccounts.length === 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <h4 className="font-semibold text-amber-800 mb-2">Get Started with Auto-Publishing</h4>
          <ol className="text-sm text-amber-700 space-y-1.5">
            <li className="flex items-start gap-2">
              <span className="bg-amber-200 text-amber-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold flex-shrink-0">1</span>
              <span>Click "Connect" on any platform below to authorize SocialCraft AI</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="bg-amber-200 text-amber-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold flex-shrink-0">2</span>
              <span>Grant the requested permissions (we only ask for what's needed to post)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="bg-amber-200 text-amber-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold flex-shrink-0">3</span>
              <span>Your scheduled posts will automatically publish at the set times</span>
            </li>
          </ol>
          <p className="text-xs text-amber-600 mt-3">
            <strong>Note:</strong> You can disconnect anytime. We never post without your explicit scheduling.
          </p>
        </div>
      )}

      {/* Message Alert */}
      {message && (
        <div
          className={`glass-card rounded-lg p-4 flex items-center ${
            message.type === 'success'
              ? 'bg-brand-primary/10 border-2 border-brand-primary/20'
              : 'bg-status-error/10 border-2 border-status-error/20'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle className="h-5 w-5 text-brand-primary mr-3" />
          ) : (
            <AlertCircle className="h-5 w-5 text-status-error mr-3" />
          )}
          <span className="text-surface-900">{message.text}</span>
        </div>
      )}

      {/* Connected Accounts Summary */}
      <div className="glass-card rounded-xl p-6 bg-gradient-to-br from-brand-primary/10 to-soft-blue/10 border border-brand-primary/20">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-surface-900 mb-1">Connected Accounts</h3>
            <p className="text-sm text-surface-900">
              {connectedAccounts.length} of {AVAILABLE_PLATFORMS.length} platforms connected
            </p>
          </div>
          <div className="text-4xl font-bold text-brand-primary">
            {connectedAccounts.length}/{AVAILABLE_PLATFORMS.length}
          </div>
        </div>
      </div>

      {/* Platform Cards */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-surface-900">Available Platforms</h3>

        {AVAILABLE_PLATFORMS.map((platform) => {
          const connected = isConnected(platform.id);
          const account = getAccountInfo(platform.id);
          const isConnecting = connectingPlatform === platform.id;
          const isDisconnecting = disconnectingPlatform === platform.id;

          return (
            <div
              key={platform.id}
              className={`glass-card rounded-xl p-6 transition-all ${
                connected
                  ? 'bg-surface-100 border-2 border-brand-primary/30'
                  : platform.available
                  ? 'bg-surface-100 hover:shadow-medium'
                  : 'bg-surface-100 opacity-60'
              }`}
            >
              <div className="flex items-start justify-between">
                {/* Platform Info */}
                <div className="flex items-start space-x-4 flex-grow">
                  {/* Icon */}
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center text-white`}
                    style={{ backgroundColor: platform.color }}
                  >
                    {getPlatformIcon(platform.id, 'h-6 w-6')}
                  </div>

                  {/* Details */}
                  <div className="flex-grow">
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className="text-lg font-semibold text-surface-900">{platform.name}</h4>
                      {connected && (
                        <span className="px-2 py-0.5 bg-brand-primary text-white text-xs rounded-full flex items-center space-x-1">
                          <CheckCircle className="h-3 w-3" />
                          <span>Connected</span>
                        </span>
                      )}
                      {!platform.available && (
                        <span className="px-2 py-0.5 bg-gray-400 text-white text-xs rounded-full">
                          Coming Soon
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-surface-900 mb-3">{platform.description}</p>

                    {/* Account Details (if connected) */}
                    {connected && account && (
                      <div className="flex flex-wrap gap-3 text-xs text-surface-900">
                        {account.platform_username && (
                          <div className="flex items-center space-x-1">
                            <User className="h-3 w-3" />
                            <span>@{account.platform_username}</span>
                          </div>
                        )}
                        <div className="flex items-center space-x-1">
                          <Clock className="h-3 w-3" />
                          <span>Connected {formatDate(account.created_at)}</span>
                        </div>
                        {account.token_expires_at && (
                          <div className="flex items-center space-x-1">
                            <AlertCircle className="h-3 w-3" />
                            <span>Expires {formatDate(account.token_expires_at)}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Button */}
                <div className="ml-4">
                  {platform.available ? (
                    connected ? (
                      <button
                        onClick={() => handleDisconnect(platform.id)}
                        disabled={isDisconnecting}
                        className="btn-secondary px-4 py-2 rounded-lg text-sm flex items-center space-x-2 hover:bg-status-error hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isDisconnecting ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span>Disconnecting...</span>
                          </>
                        ) : (
                          <>
                            <Unlink className="h-4 w-4" />
                            <span>Disconnect</span>
                          </>
                        )}
                      </button>
                    ) : (
                      <button
                        onClick={() => handleConnect(platform.id)}
                        disabled={isConnecting}
                        className="btn-primary px-4 py-2 rounded-lg text-sm flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isConnecting ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span>Connecting...</span>
                          </>
                        ) : (
                          <>
                            <ExternalLink className="h-4 w-4" />
                            <span>Connect</span>
                          </>
                        )}
                      </button>
                    )
                  ) : (
                    <button
                      disabled
                      className="bg-gray-300 text-gray-500 px-4 py-2 rounded-lg text-sm cursor-not-allowed"
                    >
                      Coming Soon
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Help Section */}
      <div className="glass-card rounded-xl p-6 bg-soft-blue/10 border border-soft-blue/20">
        <h3 className="text-lg font-semibold text-surface-900 mb-3 flex items-center">
          <AlertCircle className="h-5 w-5 mr-2 text-soft-blue" />
          About Social Integrations
        </h3>
        <div className="space-y-2 text-sm text-surface-900">
          <p>
            <strong>Secure Authentication:</strong> We use OAuth 2.0 to securely connect your social
            media accounts. Your passwords are never stored.
          </p>
          <p>
            <strong>Token Encryption:</strong> All access tokens are encrypted at rest using AES-256-CBC
            encryption for maximum security.
          </p>
          <p>
            <strong>Publishing Permissions:</strong> We only request permissions needed to publish
            content on your behalf. We never access private messages or personal data.
          </p>
          <p>
            <strong>Revoke Access:</strong> You can disconnect any platform at any time. This will
            immediately revoke our access to publish on that platform.
          </p>
        </div>
      </div>
    </div>
  );
};

export default IntegrationsSettings;
