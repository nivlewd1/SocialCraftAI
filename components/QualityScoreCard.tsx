import React, { useMemo } from 'react';
import { AlertTriangle, CheckCircle, Info, ThumbsUp, ThumbsDown, Minus } from 'lucide-react';
import { qualityService } from '../services/qualityService';
import { complianceService } from '../services/complianceService';
import { Platform } from '../types';

interface QualityScoreCardProps {
    content: string;
    platform: Platform;
}

const QualityScoreCard: React.FC<QualityScoreCardProps> = ({ content, platform }) => {
    const quality = useMemo(() => qualityService.analyzeContent(content), [content]);
    const compliance = useMemo(() => complianceService.validateContent(content, platform), [content, platform]);

    if (!content) return null;

    const getScoreColor = (score: number) => {
        if (score >= 80) return 'text-green-600 bg-green-50 border-green-200';
        if (score >= 60) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
        return 'text-red-600 bg-red-50 border-red-200';
    };

    return (
        <div className="space-y-4">
            {/* Quality Score */}
            <div className={`p-4 rounded-xl border ${getScoreColor(quality.score)}`}>
                <div className="flex items-center justify-between mb-2">
                    <h4 className="font-bold flex items-center gap-2">
                        Quality Score
                        <span className="text-2xl">{quality.score}</span>
                    </h4>
                    <div className="flex items-center gap-2 text-sm font-medium">
                        {quality.sentiment === 'Positive' && <ThumbsUp className="w-4 h-4" />}
                        {quality.sentiment === 'Negative' && <ThumbsDown className="w-4 h-4" />}
                        {quality.sentiment === 'Neutral' && <Minus className="w-4 h-4" />}
                        {quality.sentiment}
                    </div>
                </div>

                <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                    <div
                        className={`h-2 rounded-full transition-all duration-500 ${quality.score >= 80 ? 'bg-green-500' : quality.score >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                        style={{ width: `${quality.score}%` }}
                    />
                </div>

                <div className="flex items-center justify-between text-xs opacity-80">
                    <span>Readability: <strong>{quality.readability}</strong></span>
                </div>
            </div>

            {/* Suggestions & Compliance */}
            <div className="space-y-2">
                {compliance.errors.map((err, i) => (
                    <div key={`err-${i}`} className="flex items-start gap-2 text-sm text-red-600 bg-red-50 p-2 rounded-lg">
                        <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <span>{err}</span>
                    </div>
                ))}

                {compliance.warnings.map((warn, i) => (
                    <div key={`warn-${i}`} className="flex items-start gap-2 text-sm text-yellow-700 bg-yellow-50 p-2 rounded-lg">
                        <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <span>{warn}</span>
                    </div>
                ))}

                {quality.suggestions.map((sugg, i) => (
                    <div key={`sugg-${i}`} className="flex items-start gap-2 text-sm text-blue-700 bg-blue-50 p-2 rounded-lg">
                        <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <span>{sugg}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default QualityScoreCard;
