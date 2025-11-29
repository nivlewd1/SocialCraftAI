const express = require('express');
const axios = require('axios');
const router = express.Router();

router.post('/', async (req, res) => {
    const { url } = req.body;

    if (!url) {
        return res.status(400).json({ error: 'URL is required' });
    }

    try {
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'SocialCraftAI/1.0 (compatible; bot)'
            },
            timeout: 5000 // 5 second timeout
        });

        const html = response.data;

        // Simple Regex extraction for OG tags
        const getMetaTag = (property) => {
            const regex = new RegExp(`<meta[^>]+property=["']${property}["'][^>]+content=["']([^"']+)["']`, 'i');
            const match = html.match(regex);
            return match ? match[1] : null;
        };

        // Fallback for title/description if OG tags are missing
        const getTitle = () => {
            const ogTitle = getMetaTag('og:title');
            if (ogTitle) return ogTitle;
            const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
            return titleMatch ? titleMatch[1] : null;
        };

        const getDescription = () => {
            const ogDesc = getMetaTag('og:description');
            if (ogDesc) return ogDesc;
            const descMatch = html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i);
            return descMatch ? descMatch[1] : null;
        };

        const data = {
            url,
            title: getTitle() || url,
            description: getDescription() || '',
            image: getMetaTag('og:image') || null,
            domain: new URL(url).hostname
        };

        res.json(data);

    } catch (error) {
        console.error('Link preview error:', error.message);
        // Return a partial response even on error so the UI can show something
        res.json({
            url,
            title: url,
            description: 'Could not fetch preview.',
            image: null,
            domain: new URL(url).hostname,
            error: true
        });
    }
});

module.exports = router;
