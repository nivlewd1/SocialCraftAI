import { supabase } from '../config/supabase';

export interface EmailNotificationSettings {
    userId: string;
    failedPostsEnabled: boolean;
    tokenExpirationEnabled: boolean;
    weeklyReportEnabled: boolean;
    email?: string;
}

export interface FailedPostEmailData {
    postId: string;
    platform: string;
    content: string;
    scheduledAt: string;
    errorMessage: string;
    userEmail: string;
}

class EmailNotificationService {
    private static instance: EmailNotificationService;

    private constructor() {}

    public static getInstance(): EmailNotificationService {
        if (!EmailNotificationService.instance) {
            EmailNotificationService.instance = new EmailNotificationService();
        }
        return EmailNotificationService.instance;
    }

    /**
     * Get notification settings for a user
     */
    async getSettings(userId: string): Promise<EmailNotificationSettings | null> {
        const { data, error } = await supabase
            .from('email_notification_settings')
            .select('*')
            .eq('user_id', userId)
            .single();

        if (error) {
            console.error('Error fetching notification settings:', error);
            return null;
        }

        return {
            userId: data.user_id,
            failedPostsEnabled: data.failed_posts_enabled,
            tokenExpirationEnabled: data.token_expiration_enabled,
            weeklyReportEnabled: data.weekly_report_enabled,
            email: data.email,
        };
    }

    /**
     * Update notification settings
     */
    async updateSettings(
        userId: string,
        settings: Partial<Omit<EmailNotificationSettings, 'userId'>>
    ): Promise<boolean> {
        const { error } = await supabase
            .from('email_notification_settings')
            .upsert(
                {
                    user_id: userId,
                    failed_posts_enabled: settings.failedPostsEnabled,
                    token_expiration_enabled: settings.tokenExpirationEnabled,
                    weekly_report_enabled: settings.weeklyReportEnabled,
                    email: settings.email,
                    updated_at: new Date().toISOString(),
                },
                { onConflict: 'user_id' }
            );

        if (error) {
            console.error('Error updating notification settings:', error);
            return false;
        }

        return true;
    }

    /**
     * Send email notification for failed post
     */
    async notifyFailedPost(data: FailedPostEmailData): Promise<boolean> {
        try {
            const response = await fetch('/api/notifications/failed-post', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                throw new Error('Failed to send email notification');
            }

            return true;
        } catch (error) {
            console.error('Error sending failed post notification:', error);
            return false;
        }
    }

    /**
     * Check if user has notifications enabled for failed posts
     */
    async shouldNotifyFailedPost(userId: string): Promise<boolean> {
        const settings = await this.getSettings(userId);
        return settings?.failedPostsEnabled ?? false;
    }

    /**
     * Send notification for token expiration
     */
    async notifyTokenExpiration(
        userId: string,
        platform: string,
        userEmail: string
    ): Promise<boolean> {
        try {
            const response = await fetch('/api/notifications/token-expiration', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId,
                    platform,
                    userEmail,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to send token expiration notification');
            }

            return true;
        } catch (error) {
            console.error('Error sending token expiration notification:', error);
            return false;
        }
    }
}

export const emailNotificationService = EmailNotificationService.getInstance();
