const express = require('express');
const router = express.Router();
const { getLinkedInData } = require('../services/linkedin');
const { getInstagramData } = require('../services/instagram');
const { getTikTokData } = require('../services/tiktok');
const { getAllSocialTokens } = require('../services/socialAuthService'); 

router.get('/', async (req, res) => {
    const userId = req.user.id;

    try {
        // Fetch connected accounts from database
        const connectedAccounts = await getAllSocialTokens(userId);

        // Convert to tokens object for easy access
        const tokens = connectedAccounts.reduce((acc, account) => {
            acc[account.platform] = account.access_token;
            return acc;
        }, {});

        // Fetch data from all connected platforms concurrently
        const [linkedInData, instagramData, tikTokData] = await Promise.all([
            tokens.linkedin ? getLinkedInData(tokens.linkedin) : Promise.resolve({ engagement: 0 }),
            tokens.instagram ? getInstagramData(tokens.instagram) : Promise.resolve({ engagement: 0 }),
            tokens.tiktok ? getTikTokData(tokens.tiktok) : Promise.resolve({ engagement: 0 }),
        ]);

        // Aggregate data for the frontend. This is simplified.
        // A real implementation would fetch time-series data for the line chart.
        const aggregatedData = {
            engagementData: [
                { name: 'Mon', Engagement: 820, Reach: 2200, Clicks: 120 },
                { name: 'Tue', Engagement: 932, Reach: 3100, Clicks: 180 },
                { name: 'Wed', Engagement: 901, Reach: 2800, Clicks: 160 },
                { name: 'Thu', Engagement: 934, Reach: 3200, Clicks: 190 },
                { name: 'Fri', Engagement: 1290, Reach: 4100, Clicks: 240 },
                { name: 'Sat', Engagement: 1330, Reach: 4500, Clicks: 280 },
                { name: 'Sun', Engagement: 1320, Reach: 4300, Clicks: 260 },
            ],
            platformData: [
                { name: 'LinkedIn', Engagement: linkedInData.engagement },
                { name: 'Instagram', Engagement: instagramData.engagement },
                { name: 'TikTok', Engagement: tikTokData.engagement },
                // Twitter data would be added here if connected
                { name: 'Twitter', Engagement: 4000 }, // Mock data for now
            ],
            demographicsData: [
                 // This data would also come from platform APIs if available
                { name: '18-24', value: 400 },
                { name: '25-34', value: 300 },
                { name: '35-44', value: 300 },
                { name: '45+', value: 200 },
            ],
        };

        res.json(aggregatedData);

    } catch (error) {
        console.error("Error fetching analytics:", error);
        res.status(500).json({ message: "Failed to fetch analytics data." });
    }
});

module.exports = router;
