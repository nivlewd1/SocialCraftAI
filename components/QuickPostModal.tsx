import React, { useState } from 'react';
import { X, Calendar, Image, Hash, Smile } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { scheduleService } from '../services/scheduleService';
import Spinner from './Spinner';
import { Platform } from '../types';

interface QuickPostModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    initialDate?: Date;
}

const QuickPostModal: React.FC<QuickPostModalProps> = ({ isOpen, onClose, onSuccess, initialDate }) => {
    const { user } = useAuth();
    const [content, setContent] = useState('');
    const [platform, setPlatform] = useState<Platform>(Platform.Twitter);
    const [date, setDate] = useState(initialDate ? initialDate.toISOString().split('T')[0] : '');
    const [time, setTime] = useState('12:00');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        setIsSubmitting(true);
        setError(null);

        try {
            const scheduledAt = new Date(`${date}T${time}:00`).toISOString();

            await scheduleService.createQuickPost(user.id, {
                platform,
                content,
                scheduledAt,
                source: 'quick_post'
            });

            onSuccess();
            setContent('');
            onClose();
        } catch (err) {
            console.error('Error creating quick post:', err);
            setError('Failed to schedule post. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full shadow-xl animate-fade-in">
                <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-bold text-surface-900">Quick Schedule</h3>
                        <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full">
                            <X className="w-5 h-5 text-gray-500" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Platform</label>
                            <div className="flex gap-2">
                                {Object.values(Platform).map((p) => (
                                    <button
                                        key={p}
                                        type="button"
                                        onClick={() => setPlatform(p)}
                                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${platform === p
                                                ? 'bg-brand-primary text-white'
                                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                            }`}
                                    >
                                        {p}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                            <div className="relative">
                                <textarea
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    placeholder="What do you want to post?"
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-primary focus:border-transparent min-h-[120px] resize-none"
                                    required
                                />
                                <div className="absolute bottom-3 right-3 flex gap-2 text-gray-400">
                                    <button type="button" className="hover:text-brand-primary"><Image className="w-4 h-4" /></button>
                                    <button type="button" className="hover:text-brand-primary"><Hash className="w-4 h-4" /></button>
                                    <button type="button" className="hover:text-brand-primary"><Smile className="w-4 h-4" /></button>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                                <input
                                    type="date"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                                <input
                                    type="time"
                                    value={time}
                                    onChange={(e) => setTime(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                                    required
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg">
                                {error}
                            </div>
                        )}

                        <div className="flex justify-end pt-2">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg mr-2"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting || !content.trim()}
                                className="px-6 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-primary/90 disabled:opacity-50 flex items-center gap-2"
                            >
                                {isSubmitting ? <Spinner size="sm" /> : <Calendar className="w-4 h-4" />}
                                Schedule Post
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default QuickPostModal;
