-- Email Notification Settings Table
CREATE TABLE IF NOT EXISTS email_notification_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    failed_posts_enabled BOOLEAN DEFAULT true,
    token_expiration_enabled BOOLEAN DEFAULT true,
    weekly_report_enabled BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE email_notification_settings ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own notification settings"
    ON email_notification_settings
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own notification settings"
    ON email_notification_settings
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own notification settings"
    ON email_notification_settings
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notification settings"
    ON email_notification_settings
    FOR DELETE
    USING (auth.uid() = user_id);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_email_notification_settings_user_id
    ON email_notification_settings(user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_email_notification_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER update_email_notification_settings_timestamp
    BEFORE UPDATE ON email_notification_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_email_notification_settings_updated_at();

-- Insert default settings for existing users
INSERT INTO email_notification_settings (user_id, failed_posts_enabled, token_expiration_enabled)
SELECT id, true, true
FROM auth.users
ON CONFLICT (user_id) DO NOTHING;
