import React from 'react';
import { X, CheckCircle } from 'lucide-react';

interface OriginalityReviewModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const checklistItems = [
    "Does this post offer a new perspective not found in the source material?",
    "Have I added my own original analysis, insights, or a personal story?",
    "Is this post significantly more than just a summary of the source?",
    "Have I verified the key facts and figures presented in this content?",
    "Does this content provide real value and answer a question for my audience?"
];

const OriginalityReviewModal: React.FC<OriginalityReviewModalProps> = ({ isOpen, onClose }) => {
    if (!isOpen) {
        return null;
    }

    return (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
            <div className="bg-surface-100 rounded-lg p-8 shadow-2xl max-w-lg w-full" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold font-display text-surface-900">Content Originality & Value Review</h3>
                     <button
                        onClick={onClose}
                        className="p-2 rounded-full bg-surface-100 hover:bg-surface-100/80 text-surface-900 transition-colors"
                        aria-label="Close"
                    >
                        <X size={20} />
                    </button>
                </div>
                <p className="text-surface-900 mb-6">
                    Use this checklist to ensure your AI-assisted content is original, helpful, and provides unique value to your audience. This is key to creating "people-first" content.
                </p>

                <ul className="space-y-4">
                    {checklistItems.map((item, index) => (
                        <li key={index} className="flex items-start">
                            <CheckCircle className="h-5 w-5 text-brand-primary mr-3 mt-0.5 flex-shrink-0" />
                            <span className="text-surface-900">{item}</span>
                        </li>
                    ))}
                </ul>
                
                <div className="mt-8 text-center">
                    <button
                        onClick={onClose}
                        className="btn-primary py-2.5 px-6 rounded-lg text-base font-medium"
                    >
                        Got It, Thanks!
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OriginalityReviewModal;
