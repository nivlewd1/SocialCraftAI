import React, { useState } from 'react';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { X, GripVertical, Plus, Trash2, Check } from 'lucide-react';
import { motion } from 'framer-motion';

interface ThreadTweet {
    id: string;
    content: string;
    order: number;
}

interface ThreadEditorModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialThreadContent?: string[];
    onSave: (tweets: string[]) => void;
    characterLimit?: number;
}

const SortableTweetItem: React.FC<{
    tweet: ThreadTweet;
    index: number;
    onEdit: (id: string, content: string) => void;
    onDelete: (id: string) => void;
    characterLimit: number;
}> = ({ tweet, index, onEdit, onDelete, characterLimit }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: tweet.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    const remaining = characterLimit - tweet.content.length;
    const isOverLimit = remaining < 0;

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`bg-white border rounded-xl p-4 ${
                isDragging ? 'shadow-lg ring-2 ring-brand-primary' : 'border-gray-200'
            }`}
        >
            <div className="flex items-start gap-3">
                {/* Drag Handle */}
                <button
                    {...attributes}
                    {...listeners}
                    className="mt-1 p-1 hover:bg-gray-100 rounded cursor-grab active:cursor-grabbing"
                >
                    <GripVertical className="w-5 h-5 text-gray-400" />
                </button>

                {/* Tweet Content */}
                <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-gray-500">
                            Tweet {index + 1}
                        </span>
                        <button
                            onClick={() => onDelete(tweet.id)}
                            className="p-1 text-red-500 hover:bg-red-50 rounded"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                    <textarea
                        value={tweet.content}
                        onChange={(e) => onEdit(tweet.id, e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent resize-none"
                        rows={3}
                        placeholder="Write your tweet..."
                    />
                    <div className="flex items-center justify-between mt-2">
                        <div className="text-xs text-gray-500">
                            {tweet.content.length} / {characterLimit}
                        </div>
                        {isOverLimit && (
                            <span className="text-xs text-red-600 font-medium">
                                {Math.abs(remaining)} over limit
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const ThreadEditorModal: React.FC<ThreadEditorModalProps> = ({
    isOpen,
    onClose,
    initialThreadContent = [],
    onSave,
    characterLimit = 280,
}) => {
    const [tweets, setTweets] = useState<ThreadTweet[]>(() =>
        initialThreadContent.length > 0
            ? initialThreadContent.map((content, index) => ({
                  id: `tweet-${Date.now()}-${index}`,
                  content,
                  order: index,
              }))
            : [
                  {
                      id: `tweet-${Date.now()}-0`,
                      content: '',
                      order: 0,
                  },
              ]
    );

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            setTweets((items) => {
                const oldIndex = items.findIndex((i) => i.id === active.id);
                const newIndex = items.findIndex((i) => i.id === over.id);
                return arrayMove(items, oldIndex, newIndex).map((item, idx) => ({
                    ...item,
                    order: idx,
                }));
            });
        }
    };

    const handleAddTweet = () => {
        const newTweet: ThreadTweet = {
            id: `tweet-${Date.now()}`,
            content: '',
            order: tweets.length,
        };
        setTweets([...tweets, newTweet]);
    };

    const handleEditTweet = (id: string, content: string) => {
        setTweets((prev) =>
            prev.map((tweet) =>
                tweet.id === id ? { ...tweet, content } : tweet
            )
        );
    };

    const handleDeleteTweet = (id: string) => {
        if (tweets.length <= 1) return; // Keep at least one tweet
        setTweets((prev) =>
            prev.filter((tweet) => tweet.id !== id).map((tweet, idx) => ({
                ...tweet,
                order: idx,
            }))
        );
    };

    const handleSave = () => {
        const tweetContents = tweets
            .sort((a, b) => a.order - b.order)
            .map((t) => t.content)
            .filter((c) => c.trim().length > 0);

        if (tweetContents.length === 0) {
            alert('Please add at least one tweet with content');
            return;
        }

        const hasOverLimit = tweets.some((t) => t.content.length > characterLimit);
        if (hasOverLimit) {
            alert('Some tweets exceed the character limit. Please edit them before saving.');
            return;
        }

        onSave(tweetContents);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-2xl max-w-3xl w-full shadow-xl my-8"
            >
                {/* Header */}
                <div className="p-6 border-b border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-2xl font-bold text-surface-900">
                                Thread Editor
                            </h3>
                            <p className="text-sm text-gray-500 mt-1">
                                Drag and drop to reorder tweets in your thread
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 rounded-full"
                        >
                            <X className="w-5 h-5 text-gray-500" />
                        </button>
                    </div>
                </div>

                {/* Thread List */}
                <div className="p-6 max-h-[60vh] overflow-y-auto">
                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                    >
                        <SortableContext
                            items={tweets.map((t) => t.id)}
                            strategy={verticalListSortingStrategy}
                        >
                            <div className="space-y-4">
                                {tweets.map((tweet, index) => (
                                    <SortableTweetItem
                                        key={tweet.id}
                                        tweet={tweet}
                                        index={index}
                                        onEdit={handleEditTweet}
                                        onDelete={handleDeleteTweet}
                                        characterLimit={characterLimit}
                                    />
                                ))}
                            </div>
                        </SortableContext>
                    </DndContext>

                    {/* Add Tweet Button */}
                    <button
                        onClick={handleAddTweet}
                        className="w-full mt-4 p-4 border-2 border-dashed border-gray-300 rounded-xl hover:border-brand-primary hover:bg-brand-primary/5 transition-colors flex items-center justify-center gap-2 text-gray-600 hover:text-brand-primary"
                    >
                        <Plus className="w-5 h-5" />
                        Add Tweet to Thread
                    </button>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
                    <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-600">
                            <span className="font-medium">{tweets.length}</span> tweet
                            {tweets.length !== 1 ? 's' : ''} in thread
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={onClose}
                                className="px-4 py-2 text-gray-600 hover:bg-white rounded-lg border border-gray-200"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                className="px-6 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-primary/90 flex items-center gap-2"
                            >
                                <Check className="w-4 h-4" />
                                Save Thread
                            </button>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default ThreadEditorModal;
