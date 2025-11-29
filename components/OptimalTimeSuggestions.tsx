import React, { useEffect, useState } from 'react';
import { schedulerService, OptimalTime } from '../services/schedulerService';
import { Clock, TrendingUp } from 'lucide-react';

interface OptimalTimeSuggestionsProps {
    platform: string;
    onSelectTime: (time: OptimalTime) => void;
}

const OptimalTimeSuggestions: React.FC<OptimalTimeSuggestionsProps> = ({ platform, onSelectTime }) => {
    const [suggestions, setSuggestions] = useState<OptimalTime[]>([]);

    useEffect(() => {
        const times = schedulerService.getOptimalPostingTimes(platform);
        setSuggestions(times);
    }, [platform]);

    if (suggestions.length === 0) return null;

    return (
        <div className="bg-surface-50 p-4 rounded-xl border border-surface-200">
            <div className="flex items-center space-x-2 mb-3">
                <TrendingUp className="w-4 h-4 text-brand-primary" />
                <h3 className="text-sm font-semibold text-surface-900">Best Times to Post</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {suggestions.map((suggestion, index) => (
                    <button
                        key={index}
                        onClick={() => onSelectTime(suggestion)}
                        className="flex items-center justify-between p-2 bg-white rounded-lg border border-surface-200 hover:border-brand-primary hover:shadow-sm transition-all text-left group"
                    >
                        <div>
                            <div className="text-xs font-medium text-surface-500">{suggestion.day}</div>
                            <div className="text-sm font-bold text-surface-900">{suggestion.time}</div>
                        </div>
                        <div className="flex items-center space-x-1">
                            <div className="text-xs font-bold text-brand-primary">{suggestion.score}</div>
                            <Clock className="w-3 h-3 text-surface-400 group-hover:text-brand-primary" />
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default OptimalTimeSuggestions;
