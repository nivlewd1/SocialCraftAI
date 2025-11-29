const express = require('express');
const nodemailer = require('nodemailer');
const router = express.Router();

// Check if SMTP is configured
const isEmailConfigured = () => {
    return !!(process.env.SMTP_USER && process.env.SMTP_PASSWORD);
};

// Email transporter configuration
// In production, use environment variables for credentials
const createTransporter = () => {
    if (!isEmailConfigured()) {
        console.warn('⚠️  SMTP not configured. Email notifications are disabled.');
        console.warn('   Set SMTP_USER and SMTP_PASSWORD environment variables to enable emails.');
        return null;
    }

    return nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: false, // true for 465, false for other ports
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASSWORD,
        },
    });
};

/**
 * Check if email notifications are available
 */
router.get('/status', (req, res) => {
    res.json({
        enabled: isEmailConfigured(),
        message: isEmailConfigured()
            ? 'Email notifications are enabled'
            : 'SMTP not configured. Email notifications are disabled.'
    });
});

/**
 * Send email notification for failed post
 */
router.post('/failed-post', async (req, res) => {
    const { postId, platform, content, scheduledAt, errorMessage, userEmail } = req.body;

    if (!userEmail) {
        return res.status(400).json({ error: 'User email is required' });
    }

    // Check if SMTP is configured
    if (!isEmailConfigured()) {
        console.log(`📧 Email notification skipped (SMTP not configured) for ${userEmail}`);
        return res.json({
            success: false,
            message: 'Email notifications are disabled. Configure SMTP to enable.'
        });
    }

    try {
        const transporter = createTransporter();

        if (!transporter) {
            return res.json({
                success: false,
                message: 'Email transporter not available'
            });
        }

        const mailOptions = {
            from: `"SocialCraft AI" <${process.env.SMTP_USER}>`,
            to: userEmail,
            subject: `❌ Post Failed to Publish - ${platform}`,
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
                        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
                        .error-box { background: #fee2e2; border-left: 4px solid #ef4444; padding: 15px; margin: 20px 0; border-radius: 4px; }
                        .post-content { background: white; padding: 15px; border-radius: 8px; margin: 20px 0; border: 1px solid #e5e7eb; }
                        .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
                        .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 30px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>⚠️ Post Failed to Publish</h1>
                        </div>
                        <div class="content">
                            <p>Hi there,</p>
                            <p>We attempted to publish your scheduled post to <strong>${platform}</strong>, but it failed with the following error:</p>

                            <div class="error-box">
                                <strong>Error:</strong> ${errorMessage}
                            </div>

                            <div class="post-content">
                                <strong>Post Content:</strong>
                                <p>${content.substring(0, 200)}${content.length > 200 ? '...' : ''}</p>
                                <small><strong>Scheduled for:</strong> ${new Date(scheduledAt).toLocaleString()}</small>
                            </div>

                            <p><strong>Common Solutions:</strong></p>
                            <ul>
                                <li>If the error mentions "token expired", reconnect your ${platform} account in Settings</li>
                                <li>Check your ${platform} account permissions</li>
                                <li>Ensure your content meets ${platform}'s posting guidelines</li>
                                <li>Try rescheduling the post for a later time</li>
                            </ul>

                            <center>
                                <a href="${process.env.APP_URL || 'https://app.socialcraftai.com'}/schedule" class="button">
                                    View Schedule & Retry
                                </a>
                            </center>

                            <p>If you continue experiencing issues, please contact our support team.</p>

                            <p>Best regards,<br><strong>SocialCraft AI Team</strong></p>
                        </div>
                        <div class="footer">
                            <p>You received this email because you have email notifications enabled for failed posts.</p>
                            <p><a href="${process.env.APP_URL || 'https://app.socialcraftai.com'}/settings">Manage notification preferences</a></p>
                        </div>
                    </div>
                </body>
                </html>
            `,
        };

        await transporter.sendMail(mailOptions);

        res.json({ success: true, message: 'Email notification sent' });
    } catch (error) {
        console.error('Error sending failed post email:', error);
        res.status(500).json({
            error: 'Failed to send email notification',
            details: error.message
        });
    }
});

/**
 * Send email notification for token expiration
 */
router.post('/token-expiration', async (req, res) => {
    const { userId, platform, userEmail } = req.body;

    if (!userEmail) {
        return res.status(400).json({ error: 'User email is required' });
    }

    // Check if SMTP is configured
    if (!isEmailConfigured()) {
        console.log(`📧 Token expiration email skipped (SMTP not configured) for ${userEmail}`);
        return res.json({
            success: false,
            message: 'Email notifications are disabled. Configure SMTP to enable.'
        });
    }

    try {
        const transporter = createTransporter();

        if (!transporter) {
            return res.json({
                success: false,
                message: 'Email transporter not available'
            });
        }

        const mailOptions = {
            from: `"SocialCraft AI" <${process.env.SMTP_USER}>`,
            to: userEmail,
            subject: `🔑 Reconnect Your ${platform} Account`,
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
                        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
                        .warning-box { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px; }
                        .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
                        .steps { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
                        .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 30px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>🔑 Action Required</h1>
                        </div>
                        <div class="content">
                            <p>Hi there,</p>

                            <div class="warning-box">
                                <strong>Your ${platform} account needs to be reconnected.</strong>
                                <p>Your access token has expired, and we can no longer post on your behalf.</p>
                            </div>

                            <p>To continue scheduling and publishing posts to ${platform}, please reconnect your account:</p>

                            <div class="steps">
                                <h3>Quick Steps:</h3>
                                <ol>
                                    <li>Click the button below to go to Settings</li>
                                    <li>Find <strong>${platform}</strong> in Connected Accounts</li>
                                    <li>Click <strong>Disconnect</strong>, then <strong>Connect</strong></li>
                                    <li>Authorize SocialCraft AI</li>
                                    <li>Retry any failed posts from your Schedule</li>
                                </ol>
                            </div>

                            <center>
                                <a href="${process.env.APP_URL || 'https://app.socialcraftai.com'}/settings" class="button">
                                    Go to Settings
                                </a>
                            </center>

                            <p><strong>Note:</strong> Scheduled posts will fail to publish until you reconnect your ${platform} account.</p>

                            <p>Best regards,<br><strong>SocialCraft AI Team</strong></p>
                        </div>
                        <div class="footer">
                            <p>You received this email because your ${platform} access token has expired.</p>
                            <p><a href="${process.env.APP_URL || 'https://app.socialcraftai.com'}/settings">Manage connected accounts</a></p>
                        </div>
                    </div>
                </body>
                </html>
            `,
        };

        await transporter.sendMail(mailOptions);

        res.json({ success: true, message: 'Email notification sent' });
    } catch (error) {
        console.error('Error sending token expiration email:', error);
        res.status(500).json({
            error: 'Failed to send email notification',
            details: error.message
        });
    }
});

module.exports = router;
