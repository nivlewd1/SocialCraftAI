import React from 'react';
import { Draft } from '../types';
import ResultsDisplay from './ResultsDisplay';
import { X } from 'lucide-react';

interface DraftViewerModalProps {
    draft: Draft | null;
    onClose: () => void;
}

const DraftViewerModal: React.FC<DraftViewerModalProps> = ({ draft, onClose }) => {
    if (!draft) {
        return null;
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('en-US', {
            dateStyle: 'medium',
            timeStyle: 'short'
        });
    }

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
            <div className="bg-warm-gray rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto shadow-2xl relative" onClick={(e) => e.stopPropagation()}>
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 rounded-full bg-gray-200 hover:bg-gray-300 text-gray-700 transition-colors z-10"
                    aria-label="Close"
                >
                    <X size={20} />
                </button>
                <div className="p-8">
                    <div className="mb-6 pb-4 border-b border-gray-300">
                        <h2 className="text-2xl font-bold text-deep-charcoal truncate">{draft.title}</h2>
                        <p className="text-sm text-gray-500">Saved on {formatDate(draft.createdAt)}</p>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <h3 className="text-lg font-semibold text-deep-charcoal mb-2">Original Source Content</h3>
                            <div className="bg-white rounded-lg p-4 border border-gray-200 max-h-40 overflow-y-auto">
                                <p className="text-gray-700 whitespace-pre-wrap font-sans text-base">{draft.sourceContent}</p>
                            </div>
                        </div>
                        
                        {draft.authorsVoice && (
                             <div>
                                <h3 className="text-lg font-semibold text-deep-charcoal mb-2">Author's Voice & Experience</h3>
                                <div className="bg-white rounded-lg p-4 border border-gray-200 max-h-40 overflow-y-auto">
                                    <p className="text-gray-700 whitespace-pre-wrap font-sans text-base">{draft.authorsVoice}</p>
                                </div>
                            </div>
                        )}

                        <div>
                             <h3 className="text-lg font-semibold text-deep-charcoal mb-4">Generated Content</h3>
                             <ResultsDisplay
                                results={draft.results}
                                sourceContent={draft.sourceContent}
                                authorsVoice={draft.authorsVoice}
                                platformSelections={draft.platformSelections}
                                tone={draft.tone}
                                searchIntent={draft.searchIntent || 'Auto'}
                                showSaveButton={false}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DraftViewerModal;