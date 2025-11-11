import React from 'react';
import { SearchIntent } from '../types';
import { HelpCircle, Info, DollarSign, ShoppingCart } from 'lucide-react';

interface SearchIntentSelectorProps {
    selectedIntent: SearchIntent;
    onIntentChange: (intent: SearchIntent) => void;
}

const intentOptions: { id: SearchIntent; label: string; description: string; icon: React.ReactNode }[] = [
    { id: 'Auto', label: 'Auto-Detect', description: 'Let the AI determine the best intent from your content.', icon: <HelpCircle size={16} /> },
    { id: 'Informational', label: 'Informational', description: 'Explain a topic or answer a question.', icon: <Info size={16} /> },
    { id: 'Commercial', label: 'Commercial', description: 'Compare products, services, or options.', icon: <DollarSign size={16} /> },
    { id: 'Transactional', label: 'Transactional', description: 'Drive a specific action like a purchase or sign-up.', icon: <ShoppingCart size={16} /> },
];

const SearchIntentSelector: React.FC<SearchIntentSelectorProps> = ({ selectedIntent, onIntentChange }) => {
    return (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {intentOptions.map(option => (
                <button
                    key={option.id}
                    type="button"
                    onClick={() => onIntentChange(option.id)}
                    className={`group relative text-left p-3 border rounded-lg transition-all duration-200 flex flex-col justify-between h-full ${
                        selectedIntent === option.id
                            ? 'border-[#8B9A8B] bg-[#8B9A8B]/10 text-[#8B9A8B] font-semibold'
                            : 'bg-warm-gray/30 border-gray-300 text-deep-charcoal hover:border-[#8B9A8B]'
                    }`}
                    title={option.description}
                >
                    <div className="flex items-center space-x-2">
                        {option.icon}
                        <span className="font-medium text-sm">{option.label}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{option.description}</p>
                </button>
            ))}
        </div>
    );
};

export default SearchIntentSelector;
