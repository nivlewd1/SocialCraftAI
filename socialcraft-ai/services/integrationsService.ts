import { supabase } from '../config/supabase';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

export interface ConnectedAccount {
  id: string;
  user_id: string;
  platform: 'linkedin' | 'instagram' | 'tiktok' | 'twitter' | 'pinterest';
  platform_user_id: string | null;
  platform_username: string | null;
  access_token: string;
  refresh_token: string | null;
  token_expires_at: string | null;
  scopes: string[] | null;
  metadata: Record<string, any> | null;
  created_at: string;
  updated_at: string;
}

export interface PlatformInfo {
  id: 'linkedin' | 'instagram' | 'tiktok' | 'twitter' | 'pinterest';
  name: string;
  description: string;
  icon: string;
  color: string;
  available: boolean;
}

export const AVAILABLE_PLATFORMS: PlatformInfo[] = [
  {
    id: 'linkedin',
    name: 'LinkedIn',
    description: 'Share professional content and network updates',
    icon: 'linkedin',
    color: '#0A66C2',
    available: true,
  },
  {
    id: 'instagram',
    name: 'Instagram',
    description: 'Post photos, videos, and stories to your feed',
    icon: 'instagram',
    color: '#E4405F',
    available: true,
  },
  {
    id: 'tiktok',
    name: 'TikTok',
    description: 'Share short-form videos with your audience',
    icon: 'tiktok',
    color: '#000000',
    available: true,
  },
  {
    id: 'twitter',
    name: 'X (Twitter)',
    description: 'Post updates and engage with followers',
    icon: 'twitter',
    color: '#000000',
    available: true,
  },
  {
    id: 'pinterest',
    name: 'Pinterest',
    description: 'Pin images and ideas to your boards',
    icon: 'pinterest',
    color: '#E60023',
    available: false, // Not yet implemented
  },
];

/**
 * Integrations Service
 * Handles all social media account connection operations via backend OAuth
 */
export const integrationsService = {
  /**
   * Get the current user's session token for API authentication
   */
  async getAuthToken(): Promise<string> {
    const { data: { session }, error } = await supabase.auth.getSession();

    if (error || !session) {
      throw new Error('Not authenticated');
    }

    return session.access_token;
  },

  /**
   * Get all connected social media accounts for the current user
   */
  async getConnectedAccounts(): Promise<ConnectedAccount[]> {
    try {
      const token = await this.getAuthToken();

      const response = await fetch(`${BACKEND_URL}/api/oauth/connected`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch connected accounts: ${response.statusText}`);
      }

      const data = await response.json();
      return data.accounts || [];
    } catch (error) {
      console.error('Error fetching connected accounts:', error);
      throw error;
    }
  },

  /**
   * Initiate OAuth flow to connect a social media platform
   * Opens a popup window for OAuth authorization
   */
  async connectPlatform(platform: 'linkedin' | 'instagram' | 'tiktok' | 'twitter' | 'pinterest'): Promise<void> {
    try {
      const token = await this.getAuthToken();

      // OAuth flow URL with state parameter containing user's JWT
      const oauthUrl = `${BACKEND_URL}/api/oauth/${platform}?state=${encodeURIComponent(token)}`;

      // Open OAuth in popup window
      const width = 600;
      const height = 700;
      const left = window.screen.width / 2 - width / 2;
      const top = window.screen.height / 2 - height / 2;

      const popup = window.open(
        oauthUrl,
        `${platform}_oauth`,
        `width=${width},height=${height},left=${left},top=${top},toolbar=no,location=no,status=no,menubar=no,scrollbars=yes,resizable=yes`
      );

      if (!popup) {
        throw new Error('Popup blocked. Please allow popups for this site.');
      }

      // Listen for OAuth completion message from popup
      return new Promise((resolve, reject) => {
        let completed = false;

        const cleanup = () => {
          completed = true;
          window.removeEventListener('message', messageListener);
          if (popupCheckInterval) {
            clearInterval(popupCheckInterval);
          }
        };

        const messageListener = (event: MessageEvent) => {
          // Verify message origin - must be from backend or current origin
          const backendOrigin = new URL(BACKEND_URL).origin;
          if (event.origin !== window.location.origin && event.origin !== backendOrigin) {
            console.log('Ignoring message from untrusted origin:', event.origin);
            return;
          }

          if (event.data.type === 'oauth_success' && event.data.platform === platform) {
            cleanup();
            popup?.close();
            resolve();
          } else if (event.data.type === 'oauth_error' && event.data.platform === platform) {
            cleanup();
            popup?.close();
            reject(new Error(event.data.error || 'OAuth failed'));
          }
        };

        window.addEventListener('message', messageListener);

        // Check if popup was closed manually every 500ms
        const popupCheckInterval = setInterval(() => {
          if (popup && popup.closed && !completed) {
            cleanup();
            reject(new Error('OAuth cancelled - popup was closed'));
          }
        }, 500);

        // Timeout after 5 minutes
        setTimeout(() => {
          if (!completed) {
            cleanup();
            if (popup && !popup.closed) {
              popup.close();
            }
            reject(new Error('OAuth timeout'));
          }
        }, 5 * 60 * 1000);
      });
    } catch (error) {
      console.error(`Error connecting ${platform}:`, error);
      throw error;
    }
  },

  /**
   * Disconnect a social media platform
   */
  async disconnectPlatform(platform: 'linkedin' | 'instagram' | 'tiktok' | 'twitter' | 'pinterest'): Promise<void> {
    try {
      const token = await this.getAuthToken();

      const response = await fetch(`${BACKEND_URL}/api/oauth/${platform}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to disconnect ${platform}: ${response.statusText}`);
      }
    } catch (error) {
      console.error(`Error disconnecting ${platform}:`, error);
      throw error;
    }
  },

  /**
   * Check if a specific platform is connected
   */
  async isPlatformConnected(platform: string): Promise<boolean> {
    try {
      const accounts = await this.getConnectedAccounts();
      return accounts.some(account => account.platform === platform);
    } catch (error) {
      console.error(`Error checking if ${platform} is connected:`, error);
      return false;
    }
  },

  /**
   * Get connected account details for a specific platform
   */
  async getPlatformAccount(platform: string): Promise<ConnectedAccount | null> {
    try {
      const accounts = await this.getConnectedAccounts();
      return accounts.find(account => account.platform === platform) || null;
    } catch (error) {
      console.error(`Error getting ${platform} account:`, error);
      return null;
    }
  },
};
