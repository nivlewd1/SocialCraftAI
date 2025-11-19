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
                            ? 'bg-sage-green text-white shadow-sm'
                            : 'bg-white hover:bg-warm-gray text-deep-charcoal border border-warm-gray'
                    }`}
                >
                    {tone}
                </button>
            ))}
        </div>
    );
};

export default ToneSelector;
