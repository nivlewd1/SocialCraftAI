import React from 'react';
import { Platform, PlatformSelections, PlatformFormat } from '../types';
// FIX: Replaced Pinterest with Pin as it is not an exported member of lucide-react.
import { Twitter, Linkedin, Instagram, Music, Pin } from 'lucide-react';

interface AdvancedPlatformSelectorProps {
    selections: PlatformSelections;
    onSelectionChange: (selections: PlatformSelections) => void;
}

const platformOptions = [
    { id: Platform.Twitter, icon: <Twitter size={20} />, name: 'Twitter/X', formats: [] },
    { id: Platform.LinkedIn, icon: <Linkedin size={20} />, name: 'LinkedIn', formats: ['Auto', 'Text', 'Carousel', 'Poll'] as PlatformFormat[] },
    { id: Platform.Instagram, icon: <Instagram size={20} />, name: 'Instagram', formats: ['Auto', 'Text', 'Carousel', 'Reel'] as PlatformFormat[] },
    { id: Platform.TikTok, icon: <Music size={20} />, name: 'TikTok', formats: [] },
    // FIX: Replaced Pinterest with Pin.
    { id: Platform.Pinterest, icon: <Pin size={20} />, name: 'Pinterest', formats: ['Auto', 'Standard Pin', 'Video Pin', 'Idea Pin'] as PlatformFormat[] },
];

const AdvancedPlatformSelector: React.FC<AdvancedPlatformSelectorProps> = ({ selections, onSelectionChange }) => {
    
    const handlePlatformToggle = (platform: Platform) => {
        const newSelections = { ...selections };
        if (newSelections[platform]) {
            delete newSelections[platform];
        } else {
            newSelections[platform] = { format: 'Auto' };
        }
        onSelectionChange(newSelections);
    };
    
    const handleFormatChange = (platform: Platform, format: PlatformFormat) => {
        onSelectionChange({
            ...selections,
            [platform]: { format }
        });
    };

    return (
        <div className="grid grid-cols-1 gap-3 max-h-64 overflow-y-auto pr-1">
            {platformOptions.map((option) => {
                const isSelected = !!selections[option.id];
                const selectedFormat = selections[option.id]?.format || 'Auto';

                return (
                    <div key={option.id} className={`p-4 border rounded-lg transition-all duration-300 ${isSelected ? 'bg-white shadow-md border-brand-primary' : 'bg-surface-100/30 border-surface-100'}`}>
                        <button
                            type="button"
                            onClick={() => handlePlatformToggle(option.id)}
                            className="w-full flex items-center justify-between"
                        >
                            <div className="flex items-center space-x-3">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${isSelected ? 'bg-brand-primary text-white' : 'bg-surface-100 text-surface-900'}`}>
                                    {option.icon}
                                </div>
                                <span className={`font-semibold transition-colors ${isSelected ? 'text-brand-primary' : 'text-surface-900'}`}>{option.name}</span>
                            </div>
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${isSelected ? 'border-brand-primary bg-brand-primary' : 'border-surface-100'}`}>
                               {isSelected && <div className="w-2 h-2 rounded-full bg-white"></div>}
                            </div>
                        </button>

                        <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isSelected && option.formats.length > 0 ? 'max-h-24 opacity-100' : 'max-h-0 opacity-0'}`}>
                            <div className="mt-4 pt-3 border-t border-surface-100">
                                <p className="text-xs font-medium text-surface-900 mb-2">Content Format</p>
                                <div className="flex flex-wrap gap-2">
                                    {option.formats.map(format => (
                                        <button
                                            key={format}
                                            onClick={() => handleFormatChange(option.id, format)}
                                            className={`px-2.5 py-1 text-xs font-medium rounded-full transition-colors ${selectedFormat === format ? 'bg-brand-glow text-white' : 'bg-surface-100 hover:bg-surface-100/80 text-surface-900'}`}
                                        >
                                            {format}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default AdvancedPlatformSelector;