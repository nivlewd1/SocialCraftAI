import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Draft, SavedMedia } from '../types';
import { Save, Trash2, Clock, Edit, Eye, Image as ImageIcon, Video, AlertTriangle } from 'lucide-react';
import DraftViewerModal from '../components/DraftViewerModal';
import { draftsService } from '../services/draftsService';
import { mediaService } from '../services/mediaService';
import { useAuth } from '../contexts/AuthContext';

const TabButton: React.FC<{ label: string; icon: React.ReactNode; isActive: boolean; onClick: () => void }> = ({ label, icon, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`flex items-center space-x-2 px-4 py-3 font-medium text-sm transition-colors border-b-2 -mb-px ${isActive
            ? 'border-brand-primary text-brand-primary'
            : 'border-transparent text-surface-900 hover:text-brand-primary hover:border-surface-200'
            }`}
    >
        {icon}
        <span>{label}</span>
    </button>
);

interface DraftsViewProps {
    onOpenAuth: () => void;
}

const DraftsView: React.FC<DraftsViewProps> = ({ onOpenAuth }) => {
    const [drafts, setDrafts] = useState<Draft[]>([]);
    const [savedMedia, setSavedMedia] = useState<SavedMedia[]>([]);
    const [viewingDraft, setViewingDraft] = useState<Draft | null>(null);
    const [activeTab, setActiveTab] = useState<'content' | 'media'>('content');
    const [confirmingDelete, setConfirmingDelete] = useState<{ id: string; type: 'content' | 'media' } | null>(null);
    const navigate = useNavigate();
    const { user } = useAuth();

    useEffect(() => {
        if (!user) {
            setDrafts([]);
            setSavedMedia([]);
            return;
        }
        const loadContent = async () => {
            try {
                const [fetchedDrafts, fetchedMedia] = await Promise.all([
                    draftsService.getAllDrafts(),
                    mediaService.getAllMedia()
                ]);
                setDrafts(fetchedDrafts);
                setSavedMedia(fetchedMedia);
            } catch (error) {
                console.error("Failed to load library items:", error);
                setDrafts([]);
                setSavedMedia([]);
            }
        };
        loadContent();
    }, [user]);

    const handleConfirmDelete = async () => {
        if (!confirmingDelete) return;

        try {
            if (confirmingDelete.type === 'content') {
                await draftsService.deleteDraft(confirmingDelete.id);
                setDrafts(drafts.filter(draft => draft.id !== confirmingDelete.id));
            } else if (confirmingDelete.type === 'media') {
                await mediaService.deleteMedia(confirmingDelete.id);
                setSavedMedia(savedMedia.filter(item => item.id !== confirmingDelete.id));
            }
        } catch (error) {
            console.error("Failed to delete item:", error);
        }

        setConfirmingDelete(null);
    };

    const handleLoadDraft = (draft: Draft) => {
        navigate('/generator', { state: { draftToLoad: draft } });
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('en-US', {
            dateStyle: 'medium',
            timeStyle: 'short'
        });
    }

    if (!user) {
        return (
            <div className="space-y-8">
                <div className="text-center">
                    <h1 className="text-4xl md:text-5xl font-extrabold font-display tracking-tight">
                        Content <span className="gradient-text">Library</span>
                    </h1>
                    <p className="mt-4 max-w-2xl mx-auto text-lg text-surface-900">
                        Review, load, or delete your saved content drafts and generated media assets.
                    </p>
                </div>
                <div className="max-w-2xl mx-auto glass-card rounded-lg p-12 text-center">
                    <Save size={48} className="mx-auto text-surface-900 mb-4" />
                    <h2 className="text-2xl font-bold text-surface-900 mb-2">Sign in to view your library</h2>
                    <p className="text-surface-900 mb-6">
                        You need to be signed in to access your saved drafts and media.
                    </p>
                    <button
                        onClick={onOpenAuth}
                        className="px-6 py-3 rounded-lg shadow-sm text-base font-medium btn-primary"
                    >
                        Sign In / Sign Up
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="text-center">
                <h1 className="text-4xl md:text-5xl font-extrabold font-display tracking-tight">
                    Content <span className="gradient-text">Library</span>
                </h1>
                <p className="mt-4 max-w-2xl mx-auto text-lg text-surface-900">
                    Review, load, or delete your saved content drafts and generated media assets.
                </p>
            </div>

            <div className="max-w-4xl mx-auto">
                <div className="flex border-b border-gray-300 mb-6">
                    <TabButton label="Content Drafts" icon={<Save size={16} />} isActive={activeTab === 'content'} onClick={() => setActiveTab('content')} />
                    <TabButton label="Saved Media" icon={<ImageIcon size={16} />} isActive={activeTab === 'media'} onClick={() => setActiveTab('media')} />
                </div>

                {activeTab === 'content' && (
                    <div className="animate-fade-in">
                        {drafts.length > 0 ? (
                            <div className="space-y-4">
                                {drafts.map((draft) => (
                                    <div key={draft.id} className="glass-card rounded-lg p-4 flex items-center justify-between transition-shadow hover:shadow-md">
                                        <div className="flex-grow">
                                            <p className="font-semibold text-surface-900 truncate">{draft.title}</p>
                                            <p className="text-sm text-surface-900 flex items-center">
                                                <Clock size={14} className="mr-1.5" />
                                                Saved on {formatDate(draft.createdAt)}
                                            </p>
                                        </div>
                                        <div className="flex items-center space-x-2 ml-4">
                                            <button
                                                onClick={() => setViewingDraft(draft)}
                                                className="p-2 rounded-md hover:bg-surface-100 text-surface-900 transition-colors"
                                                title="View Draft"
                                            >
                                                <Eye size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleLoadDraft(draft)}
                                                className="p-2 rounded-md hover:bg-surface-100 text-surface-900 transition-colors"
                                                title="Load Draft"
                                            >
                                                <Edit size={18} />
                                            </button>
                                            <button
                                                onClick={() => setConfirmingDelete({ id: draft.id, type: 'content' })}
                                                className="p-2 rounded-md hover:bg-status-error/10 text-status-error transition-colors"
                                                title="Delete Draft"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-16 px-6 glass-card rounded-lg">
                                <Save size={48} className="mx-auto text-surface-900" />
                                <h3 className="mt-4 text-xl font-semibold text-surface-900">No Drafts Saved Yet</h3>
                                <p className="mt-2 text-surface-900">
                                    When you generate content, click the "Save as Draft" button to save it here for later.
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'media' && (
                    <div className="animate-fade-in">
                        {savedMedia.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {savedMedia.map((item) => (
                                    <div key={item.id} className="glass-card rounded-lg overflow-hidden group relative transition-shadow hover:shadow-md">
                                        {item.type === 'image' ? (
                                            <img src={item.url} alt={item.prompt} className="w-full h-48 object-cover" />
                                        ) : (
                                            <div className="relative w-full h-48 bg-black">
                                                <video src={item.url} controls muted className="w-full h-full object-cover" />
                                                <div className="absolute top-2 left-2 bg-black/50 text-white rounded-full p-1">
                                                    <Video size={14} />
                                                </div>
                                            </div>
                                        )}
                                        <div className="p-3">
                                            <p className="text-xs text-surface-900 truncate" title={item.prompt}>{item.prompt}</p>
                                            <p className="text-xs text-surface-900 mt-1">{formatDate(item.createdAt)}</p>
                                        </div>
                                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => setConfirmingDelete({ id: item.id, type: 'media' })}
                                                className="p-2 rounded-full bg-black/50 hover:bg-status-error text-white transition-colors"
                                                title="Delete Media"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-16 px-6 glass-card rounded-lg">
                                <ImageIcon size={48} className="mx-auto text-surface-900" />
                                <h3 className="mt-4 text-xl font-semibold text-surface-900">No Media Saved Yet</h3>
                                <p className="mt-2 text-surface-900">
                                    Go to the Media Studio, generate an image or video, and click "Save to Media" to store it here.
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </div>
            <DraftViewerModal draft={viewingDraft} onClose={() => setViewingDraft(null)} />

            {confirmingDelete && (
                <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4 animate-fade-in" onClick={() => setConfirmingDelete(null)}>
                    <div className="bg-surface-100 rounded-2xl p-8 shadow-2xl max-w-md w-full text-center" onClick={(e) => e.stopPropagation()}>
                        <AlertTriangle className="mx-auto h-12 w-12 text-status-error" />
                        <h3 className="mt-4 text-xl font-bold text-surface-900">Confirm Deletion</h3>
                        <p className="mt-2 text-surface-900">Are you sure you want to delete this item? This action cannot be undone.</p>
                        <div className="mt-6 grid grid-cols-2 gap-4">
                            <button
                                onClick={() => setConfirmingDelete(null)}
                                className="px-4 py-2.5 rounded-lg text-base font-medium bg-gray-200 hover:bg-gray-300 text-surface-900 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirmDelete}
                                className="px-4 py-2.5 rounded-lg text-base font-medium bg-status-error hover:bg-status-error/80 text-white transition-colors"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DraftsView;