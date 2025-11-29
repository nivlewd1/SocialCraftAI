import React, { useState, useEffect } from 'react';
import { LinkPreviewData, linkPreviewService } from '../services/linkPreviewService';
import { ExternalLink, ImageOff, Loader2 } from 'lucide-react';

interface LinkPreviewCardProps {
    url: string;
}

const LinkPreviewCard: React.FC<LinkPreviewCardProps> = ({ url }) => {
    const [data, setData] = useState<LinkPreviewData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        let mounted = true;

        const fetchPreview = async () => {
            setLoading(true);
            try {
                const previewData = await linkPreviewService.fetchPreview(url);
                if (mounted) {
                    setData(previewData);
                    setError(!!previewData.error);
                }
            } catch (err) {
                if (mounted) setError(true);
            } finally {
                if (mounted) setLoading(false);
            }
        };

        if (url) {
            fetchPreview();
        }

        return () => {
            mounted = false;
        };
    }, [url]);

    if (loading) {
        return (
            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200 text-sm text-gray-500 animate-pulse">
                <Loader2 className="w-4 h-4 animate-spin" />
                Loading preview for {new URL(url).hostname}...
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200 text-sm text-gray-500">
                <ExternalLink className="w-4 h-4" />
                <a href={url} target="_blank" rel="noopener noreferrer" className="hover:underline truncate">
                    {url}
                </a>
            </div>
        );
    }

    return (
        <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="block group bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow max-w-md"
        >
            {data.image ? (
                <div className="h-32 w-full overflow-hidden bg-gray-100 relative">
                    <img
                        src={data.image}
                        alt={data.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => {
                            // Fallback if image fails to load
                            (e.target as HTMLImageElement).style.display = 'none';
                        }}
                    />
                </div>
            ) : (
                <div className="h-24 w-full bg-gray-100 flex items-center justify-center text-gray-400">
                    <ImageOff className="w-8 h-8 opacity-50" />
                </div>
            )}

            <div className="p-3">
                <h4 className="font-bold text-gray-800 text-sm line-clamp-1 mb-1 group-hover:text-blue-600 transition-colors">
                    {data.title}
                </h4>
                <p className="text-xs text-gray-500 line-clamp-2 mb-2">
                    {data.description}
                </p>
                <div className="flex items-center gap-1 text-xs text-gray-400 font-medium uppercase tracking-wider">
                    <ExternalLink className="w-3 h-3" />
                    {data.domain}
                </div>
            </div>
        </a>
    );
};

export default LinkPreviewCard;
