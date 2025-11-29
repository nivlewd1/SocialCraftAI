export interface LinkPreviewData {
    url: string;
    title: string;
    description: string;
    image: string | null;
    domain: string;
    error?: boolean;
}

export const linkPreviewService = {
    async fetchPreview(url: string): Promise<LinkPreviewData> {
        try {
            const response = await fetch('/api/link-preview', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ url }),
            });

            if (!response.ok) {
                throw new Error('Failed to fetch preview');
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching link preview:', error);
            // Return fallback data
            return {
                url,
                title: url,
                description: 'Preview unavailable',
                image: null,
                domain: new URL(url).hostname,
                error: true
            };
        }
    }
};
