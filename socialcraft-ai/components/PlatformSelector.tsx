// This file is DEPRECATED and is replaced by AdvancedPlatformSelector.tsx
// It is kept here for historical reference but is no longer used in the application.

import React from 'react';
import { Platform } from '../types';
import { Twitter, Linkedin, Instagram, Music } from 'lucide-react';

interface PlatformSelectorProps {
    selectedPlatforms: Platform[];
    onSelectionChange: (platforms: Platform[]) => void;
}

const platformOptions = [
    { id: Platform.Twitter, icon: <Twitter size={20} />, name: 'Twitter/X' },
    { id: Platform.LinkedIn, icon: <Linkedin size={20} />, name: 'LinkedIn' },
    { id: Platform.Instagram, icon: <Instagram size={20} />, name: 'Instagram' },
    { id: Platform.TikTok, icon: <Music size={20} />, name: 'TikTok' },
];

const PlatformSelector: React.FC<PlatformSelectorProps> = ({ selectedPlatforms, onSelectionChange }) => {
    const togglePlatform = (platform: Platform) => {
        const newSelection = selectedPlatforms.includes(platform)
            ? selectedPlatforms.filter((p) => p !== platform)
            : [...selectedPlatforms, platform];
        onSelectionChange(newSelection);
    };

    return (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {platformOptions.map((option) => {
                const isSelected = selectedPlatforms.includes(option.id);
                return (
                    <button
                        key={option.id}
                        type="button"
                        onClick={() => togglePlatform(option.id)}
                        className={`flex items-center justify-center space-x-2 p-3 border rounded-lg transition-all duration-200 ${
                            isSelected
                                ? 'border-[#8B9A8B] bg-[#8B9A8B]/10 text-[#8B9A8B] font-semibold'
                                : 'bg-warm-gray/30 border-gray-300 text-deep-charcoal hover:border-[#8B9A8B]'
                        }`}
                    >
                        {option.icon}
                        <span className="font-medium text-sm">{option.name}</span>
                    </button>
                );
            })}
        </div>
    );
};

export default PlatformSelector;