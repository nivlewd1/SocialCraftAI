import React from 'react';
import { Tone } from '../types';

interface ToneSelectorProps {
    selectedTone: Tone;
    onToneChange: (tone: Tone) => void;
}

const toneOptions: Tone[] = [
    'Auto',
    'Professional',
    'Funny',
    'Educational',
    'Inspirational',
    'Conversational',
    'Authoritative',
    'Urgent',
    'Sentimental',
    'Crass',
    'Novel',
];

const ToneSelector: React.FC<ToneSelectorProps> = ({ selectedTone, onToneChange }) => {
    return (
        <div className="flex flex-wrap gap-2">
            {toneOptions.map(tone => (
                <button
                    key={tone}
                    type="button"
                    onClick={() => onToneChange(tone)}
                    className={`px-3 py-1.5 text-sm font-medium rounded-full transition-colors duration-200 ${
                        selectedTone === tone
                            ? 'bg-brand-primary text-white shadow-sm'
                            : 'bg-white hover:bg-surface-100 text-surface-900 border border-surface-100'
                    }`}
                >
                    {tone}
                </button>
            ))}
        </div>
    );
};

export default ToneSelector;
