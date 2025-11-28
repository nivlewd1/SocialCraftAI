import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Calendar, Clock, CheckCircle, Trash2, Twitter, Linkedin, Instagram, 
    Music, Pin, Layout, Filter, MoreHorizontal, Info, Grid, List,
    ChevronDown, X, Download, Edit2, AlertCircle, Briefcase, Search,
    CheckSquare, Square, RefreshCw, ExternalLink, Image
} from 'lucide-react';
import { Platform } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { 
    scheduleService, 
    UnifiedScheduledPost, 
    ScheduleFilters,
    ScheduleStats 
} from '../services/scheduleService';
import ScheduleCalendar from '../components/ScheduleCalendar';
import Spinner from '../components/Spinner';

const platformIcons: { [key in Platform]: React.ReactNode } = {
    [Platform.Twitter]: <Twitter size={18} />,
    [Platform.LinkedIn]: <Linkedin size={18} />,
    [Platform.Instagram]: <Instagram size={18} />,
    [Platform.TikTok]: <Music size={18} />,
    [Platform.Pinterest]: <Pin size={18} />,
};

const platformColors: Record<Platform, string> = {
    [Platform.Twitter]: 'text-sky-500 bg-sky-50',
    [Platform.LinkedIn]: 'text-blue-700 bg-blue-50',
    [Platform.Instagram]: 'text-pink-500 bg-pink-50',
    [Platform.TikTok]: 'text-gray-900 bg-gray-100',
    [Platform.Pinterest]: 'text-red-600 bg-red-50',
};

interface ScheduleViewProps {
    onOpenAuth: () => void;
}

const ScheduleView: React.FC<ScheduleViewProps> = ({ onOpenAuth }) => {
    const { user } = useAuth();
    const navigate = useNavigate();
    
    // Data state
    const [posts, setPosts] = useState<UnifiedScheduledPost[]>([]);
    const [stats, setStats] = useState<ScheduleStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // UI state
    const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
    const [selectedPosts, setSelectedPosts] = useState<Set<string>>(new Set());
    const [expandedPost, setExpandedPost] = useState<string | null>(null);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);

    // Filter state
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState<ScheduleFilters>({});
    const [filterPlatforms, setFilterPlatforms] = useState<Platform[]>([]);
    const [filterStatus, setFilterStatus] = useState<string[]>([]);
    const [filterSources, setFilterSources] = useState<string[]>([]);

    // Menu state
    const [showActionsMenu, setShowActionsMenu] = useState(false);
    
    // Modal state
    const [showRescheduleModal, setShowRescheduleModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [rescheduleDate, setRescheduleDate] = useState('');
    const [rescheduleTime, setRescheduleTime] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    // Load data
    useEffect(() => {
        if (user) {
            loadSchedule();
        } else {
            setIsLoading(false);
        }
    }, [user]);

    const loadSchedule = async () => {
        if (!user) return;
        
        setIsLoading(true);
        setError(null);

        try {
            const [loadedPosts, loadedStats] = await Promise.all([
                scheduleService.getUnifiedSchedule(user.id, filters),
                scheduleService.getScheduleStats(user.id)
            ]);

            setPosts(loadedPosts);
            setStats(loadedStats);
        } catch (err) {
            console.error('Error loading schedule:', err);
            setError('Failed to load schedule');
        } finally {
            setIsLoading(false);
        }
    };

    // Apply filters
    const applyFilters = () => {
        const newFilters: ScheduleFilters = {};
        
        if (filterPlatforms.length > 0) {
            newFilters.platforms = filterPlatforms;
        }
        if (filterStatus.length > 0) {
            newFilters.status = filterStatus as any;
        }
        if (filterSources.length > 0) {
            newFilters.sources = filterSources as any;
        }

        setFilters(newFilters);
        setShowFilters(false);
    };

    // Clear filters
    const clearFilters = () => {
        setFilterPlatforms([]);
        setFilterStatus([]);
        setFilterSources([]);
        setFilters({});
        setShowFilters(false);
    };

    // Filtered posts
    const filteredPosts = useMemo(() => {
        let result = posts;

        if (filters.platforms && filters.platforms.length > 0) {
            result = result.filter(p => filters.platforms!.includes(p.platform));
        }
        if (filters.status && filters.status.length > 0) {
            result = result.filter(p => filters.status!.includes(p.status));
        }
        if (filters.sources && filters.sources.length > 0) {
            result = result.filter(p => filters.sources!.includes(p.source));
        }
        if (selectedDate) {
            const dateKey = selectedDate.toISOString().split('T')[0];
            result = result.filter(p => p.scheduledAt.split('T')[0] === dateKey);
        }

        return result;
    }, [posts, filters, selectedDate]);

    // Selection handlers
    const togglePostSelection = (postId: string) => {
        setSelectedPosts(prev => {
            const next = new Set(prev);
            if (next.has(postId)) {
                next.delete(postId);
            } else {
                next.add(postId);
            }
            return next;
        });
    };

    const selectAllPosts = () => {
        if (selectedPosts.size === filteredPosts.length) {
            setSelectedPosts(new Set());
        } else {
            setSelectedPosts(new Set(filteredPosts.map(p => p.id)));
        }
    };

    // Bulk actions
    const handleBulkReschedule = async () => {
        if (selectedPosts.size === 0 || !rescheduleDate) return;

        setIsProcessing(true);
        setError(null);

        try {
            const postsToReschedule = filteredPosts
                .filter(p => selectedPosts.has(p.id))
                .map(p => ({
                    id: p.id,
                    source: p.source,
                    currentScheduledAt: p.scheduledAt
                }));

            const newDateTime = rescheduleTime 
                ? `${rescheduleDate}T${rescheduleTime}:00.000Z`
                : `${rescheduleDate}T12:00:00.000Z`;

            const result = await scheduleService.bulkReschedule(postsToReschedule, {
                postIds: postsToReschedule.map(p => p.id),
                newDate: newDateTime,
                preserveTime: !rescheduleTime
            });

            if (result.failed > 0) {
                setError(`Rescheduled ${result.success} posts. ${result.failed} failed.`);
            }

            setSelectedPosts(new Set());
            setShowRescheduleModal(false);
            setRescheduleDate('');
            setRescheduleTime('');
            await loadSchedule();
        } catch (err) {
            console.error('Error rescheduling:', err);
            setError('Failed to reschedule posts');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleBulkDelete = async () => {
        if (selectedPosts.size === 0) return;

        setIsProcessing(true);
        setError(null);

        try {
            const postsToDelete = filteredPosts
                .filter(p => selectedPosts.has(p.id))
                .map(p => ({ id: p.id, source: p.source }));

            const result = await scheduleService.bulkDeletePosts(postsToDelete);

            if (result.failed > 0) {
                setError(`Deleted ${result.success} posts. ${result.failed} failed.`);
            }

            setSelectedPosts(new Set());
            setShowDeleteModal(false);
            await loadSchedule();
        } catch (err) {
            console.error('Error deleting:', err);
            setError('Failed to delete posts');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleExportCSV = () => {
        const postsToExport = selectedPosts.size > 0 
            ? filteredPosts.filter(p => selectedPosts.has(p.id))
            : filteredPosts;
        
        scheduleService.downloadScheduleCSV(postsToExport);
        setShowActionsMenu(false);
    };

    // Single post actions
    const handleDeleteSingle = async (post: UnifiedScheduledPost) => {
        setIsProcessing(true);
        try {
            await scheduleService.deleteScheduledPost(post.id, post.source);
            await loadSchedule();
        } catch (err) {
            setError('Failed to delete post');
        } finally {
            setIsProcessing(false);
        }
    };

    // Calendar handlers
    const handleCalendarPostClick = (post: UnifiedScheduledPost) => {
        setExpandedPost(post.id);
        setViewMode('list');
    };

    const handleDateClick = (date: Date) => {
        if (selectedDate && date.toISOString().split('T')[0] === selectedDate.toISOString().split('T')[0]) {
            setSelectedDate(null);
        } else {
            setSelectedDate(date);
        }
    };

    // Render post card
    const renderPostCard = (post: UnifiedScheduledPost) => {
        const isSelected = selectedPosts.has(post.id);
        const isExpanded = expandedPost === post.id;

        const statusColors: Record<string, string> = {
            scheduled: 'bg-yellow-100 text-yellow-800',
            posted: 'bg-green-100 text-green-800',
            failed: 'bg-red-100 text-red-800',
        };

        return (
            <motion.div
                key={post.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`bg-white rounded-xl border-2 transition-all ${
                    isSelected ? 'border-brand-primary shadow-lg' : 'border-gray-200 hover:border-gray-300'
                }`}
            >
                {/* Media Preview */}
                {post.hasMedia && post.mediaUrl && (
                    <div className="relative h-32 overflow-hidden rounded-t-lg">
                        <img src={post.mediaUrl} alt="Post media" className="w-full h-full object-cover" />
                    </div>
                )}

                <div className="p-4">
                    <div className="flex items-start gap-3">
                        {/* Checkbox */}
                        <button
                            onClick={() => togglePostSelection(post.id)}
                            className="mt-1 flex-shrink-0"
                        >
                            {isSelected ? (
                                <CheckSquare className="w-5 h-5 text-brand-primary" />
                            ) : (
                                <Square className="w-5 h-5 text-gray-400" />
                            )}
                        </button>

                        {/* Platform Icon */}
                        <div className={`p-2.5 rounded-xl ${platformColors[post.platform]}`}>
                            {platformIcons[post.platform]}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                                <div className="flex items-center gap-2">
                                    <span className="font-semibold text-surface-900">{post.platform} Post</span>
                                    {post.source === 'campaign' && (
                                        <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                                            <Briefcase className="w-3 h-3" />
                                            {post.sourceName}
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                    <Clock className="w-4 h-4" />
                                    {new Date(post.scheduledAt).toLocaleString()}
                                </div>
                            </div>

                            <p className={`text-gray-600 ${isExpanded ? '' : 'line-clamp-2'} mb-3`}>
                                {post.content?.primaryContent || 'No content'}
                            </p>

                            <div className="flex items-center gap-3 flex-wrap">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[post.status]}`}>
                                    {post.status === 'posted' ? 'Posted' : post.status === 'failed' ? 'Failed' : 'Scheduled'}
                                </span>

                                {post.hasMedia && (
                                    <span className="text-xs text-gray-500 flex items-center gap-1">
                                        <Image className="w-3 h-3" />
                                        Has media
                                    </span>
                                )}

                                <div className="flex-1" />

                                {/* Actions */}
                                <button
                                    onClick={() => setExpandedPost(isExpanded ? null : post.id)}
                                    className="text-xs text-gray-500 hover:text-gray-700"
                                >
                                    {isExpanded ? 'Show less' : 'Show more'}
                                </button>

                                {post.source === 'campaign' && post.sourceId && (
                                    <button
                                        onClick={() => navigate(`/campaigns/${post.sourceId}`)}
                                        className="text-xs text-brand-primary hover:underline flex items-center gap-1"
                                    >
                                        <ExternalLink className="w-3 h-3" />
                                        View Campaign
                                    </button>
                                )}

                                {post.status === 'scheduled' && (
                                    <button
                                        onClick={() => handleDeleteSingle(post)}
                                        className="p-1.5 rounded-md hover:bg-red-50 text-red-500 transition-colors"
                                        title="Delete"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                )}
                            </div>

                            {/* Expanded Content */}
                            <AnimatePresence>
                                {isExpanded && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="mt-4 pt-4 border-t border-gray-100"
                                    >
                                        {post.content?.hashtags && post.content.hashtags.length > 0 && (
                                            <div className="mb-3">
                                                <label className="text-xs font-medium text-gray-500 uppercase">Hashtags</label>
                                                <div className="flex flex-wrap gap-1 mt-1">
                                                    {post.content.hashtags.map((tag, i) => (
                                                        <span key={i} className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded">
                                                            {tag}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        <div className="text-xs text-gray-500">
                                            <p>Created: {new Date(post.createdAt).toLocaleString()}</p>
                                            {post.updatedAt && <p>Updated: {new Date(post.updatedAt).toLocaleString()}</p>}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </motion.div>
        );
    };

    // Render filters panel
    const renderFiltersPanel = () => (
        <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white rounded-xl border border-gray-200 p-4 mb-4"
        >
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-surface-900">Filters</h3>
                <button onClick={() => setShowFilters(false)} className="p-1 hover:bg-gray-100 rounded">
                    <X className="w-4 h-4" />
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Platform filter */}
                <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Platform</label>
                    <div className="space-y-2">
                        {Object.values(Platform).map(platform => (
                            <label key={platform} className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={filterPlatforms.includes(platform)}
                                    onChange={(e) => {
                                        if (e.target.checked) {
                                            setFilterPlatforms([...filterPlatforms, platform]);
                                        } else {
                                            setFilterPlatforms(filterPlatforms.filter(p => p !== platform));
                                        }
                                    }}
                                    className="rounded text-brand-primary"
                                />
                                <span className="text-sm text-gray-600">{platform}</span>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Status filter */}
                <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Status</label>
                    <div className="space-y-2">
                        {['scheduled', 'posted', 'failed'].map(status => (
                            <label key={status} className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={filterStatus.includes(status)}
                                    onChange={(e) => {
                                        if (e.target.checked) {
                                            setFilterStatus([...filterStatus, status]);
                                        } else {
                                            setFilterStatus(filterStatus.filter(s => s !== status));
                                        }
                                    }}
                                    className="rounded text-brand-primary"
                                />
                                <span className="text-sm text-gray-600 capitalize">{status}</span>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Source filter */}
                <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Source</label>
                    <div className="space-y-2">
                        {[{ value: 'quick_post', label: 'Quick Posts' }, { value: 'campaign', label: 'Campaigns' }].map(source => (
                            <label key={source.value} className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={filterSources.includes(source.value)}
                                    onChange={(e) => {
                                        if (e.target.checked) {
                                            setFilterSources([...filterSources, source.value]);
                                        } else {
                                            setFilterSources(filterSources.filter(s => s !== source.value));
                                        }
                                    }}
                                    className="rounded text-brand-primary"
                                />
                                <span className="text-sm text-gray-600">{source.label}</span>
                            </label>
                        ))}
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-3 mt-4 pt-4 border-t border-gray-100">
                <button
                    onClick={clearFilters}
                    className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
                >
                    Clear All
                </button>
                <button
                    onClick={applyFilters}
                    className="px-4 py-2 text-sm bg-brand-primary text-white rounded-lg hover:bg-brand-primary/90"
                >
                    Apply Filters
                </button>
            </div>
        </motion.div>
    );

    // Render actions menu
    const renderActionsMenu = () => (
        <AnimatePresence>
            {showActionsMenu && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute right-0 top-12 w-48 bg-white rounded-xl border border-gray-200 shadow-lg z-10"
                >
                    <div className="p-2">
                        <button
                            onClick={() => { selectAllPosts(); setShowActionsMenu(false); }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg"
                        >
                            <CheckSquare className="w-4 h-4" />
                            {selectedPosts.size === filteredPosts.length ? 'Deselect All' : 'Select All'}
                        </button>
                        <button
                            onClick={() => { setShowRescheduleModal(true); setShowActionsMenu(false); }}
                            disabled={selectedPosts.size === 0}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Calendar className="w-4 h-4" />
                            Reschedule Selected
                        </button>
                        <button
                            onClick={() => { setShowDeleteModal(true); setShowActionsMenu(false); }}
                            disabled={selectedPosts.size === 0}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Trash2 className="w-4 h-4" />
                            Delete Selected
                        </button>
                        <div className="border-t border-gray-100 my-1" />
                        <button
                            onClick={handleExportCSV}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg"
                        >
                            <Download className="w-4 h-4" />
                            Export to CSV
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );

    // Render reschedule modal
    const renderRescheduleModal = () => (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
            onClick={() => setShowRescheduleModal(false)}
        >
            <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white rounded-2xl max-w-md w-full p-6"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                        <Calendar className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-surface-900">Reschedule Posts</h3>
                        <p className="text-sm text-gray-500">{selectedPosts.size} posts selected</p>
                    </div>
                </div>

                <div className="space-y-4 mb-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">New Date</label>
                        <input
                            type="date"
                            value={rescheduleDate}
                            onChange={(e) => setRescheduleDate(e.target.value)}
                            min={new Date().toISOString().split('T')[0]}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">New Time (optional)</label>
                        <input
                            type="time"
                            value={rescheduleTime}
                            onChange={(e) => setRescheduleTime(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                        />
                        <p className="text-xs text-gray-500 mt-1">Leave empty to keep original times</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setShowRescheduleModal(false)}
                        className="flex-1 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleBulkReschedule}
                        disabled={!rescheduleDate || isProcessing}
                        className="flex-1 px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-primary/90 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {isProcessing ? <Spinner size="sm" /> : <Calendar className="w-4 h-4" />}
                        Reschedule
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );

    // Render delete modal
    const renderDeleteModal = () => (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
            onClick={() => setShowDeleteModal(false)}
        >
            <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white rounded-2xl max-w-md w-full p-6"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                        <Trash2 className="w-6 h-6 text-red-600" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-surface-900">Delete Posts</h3>
                        <p className="text-sm text-gray-500">{selectedPosts.size} posts will be deleted</p>
                    </div>
                </div>

                <p className="text-gray-600 mb-6">
                    Are you sure you want to delete these scheduled posts? This action cannot be undone.
                </p>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setShowDeleteModal(false)}
                        className="flex-1 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleBulkDelete}
                        disabled={isProcessing}
                        className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {isProcessing ? <Spinner size="sm" /> : <Trash2 className="w-4 h-4" />}
                        Delete
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );

    // Auth required state
    if (!user) {
        return (
            <div className="space-y-8 pb-20 animate-fade-in">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-4xl font-bold font-display text-surface-900 mb-2">Content Schedule</h1>
                        <p className="text-xl text-gray-600">Your upcoming posts and timeline.</p>
                    </div>
                </div>

                <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl flex items-start gap-3">
                    <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                        <h4 className="text-sm font-bold text-blue-800">Sign in Required</h4>
                        <p className="text-xs text-blue-600 mt-1">
                            <button onClick={onOpenAuth} className="underline font-semibold hover:text-blue-800">Sign in</button> to view and manage your scheduled posts.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-20 animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-bold font-display text-surface-900 mb-2">Content Schedule</h1>
                    <p className="text-xl text-gray-600">Your upcoming posts and timeline.</p>
                </div>
                <div className="flex items-center gap-3 relative">
                    <button 
                        onClick={() => setShowFilters(!showFilters)}
                        className={`p-2 rounded-lg transition-colors ${showFilters ? 'bg-brand-primary text-white' : 'hover:bg-gray-100 text-gray-600'}`}
                    >
                        <Filter className="w-5 h-5" />
                    </button>
                    <button 
                        onClick={() => setShowActionsMenu(!showActionsMenu)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600"
                    >
                        <MoreHorizontal className="w-5 h-5" />
                    </button>
                    {renderActionsMenu()}
                </div>
            </div>

            {/* Stats */}
            {stats && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white rounded-xl border border-gray-200 p-4">
                        <div className="text-2xl font-bold text-surface-900">{stats.total}</div>
                        <div className="text-sm text-gray-500">Total Scheduled</div>
                    </div>
                    <div className="bg-white rounded-xl border border-gray-200 p-4">
                        <div className="text-2xl font-bold text-yellow-600">{stats.scheduled}</div>
                        <div className="text-sm text-gray-500">Pending</div>
                    </div>
                    <div className="bg-white rounded-xl border border-gray-200 p-4">
                        <div className="text-2xl font-bold text-blue-600">{stats.today}</div>
                        <div className="text-sm text-gray-500">Today</div>
                    </div>
                    <div className="bg-white rounded-xl border border-gray-200 p-4">
                        <div className="text-2xl font-bold text-green-600">{stats.thisWeek}</div>
                        <div className="text-sm text-gray-500">This Week</div>
                    </div>
                </div>
            )}

            {/* Filters Panel */}
            <AnimatePresence>
                {showFilters && renderFiltersPanel()}
            </AnimatePresence>

            {/* Error */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
                    <div className="flex-1">
                        <p className="font-medium text-red-900">{error}</p>
                        <button onClick={() => setError(null)} className="text-sm text-red-700 underline mt-1">Dismiss</button>
                    </div>
                </div>
            )}

            {/* View Toggle & Selection Info */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="flex items-center border border-gray-200 rounded-lg bg-white">
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-2 ${viewMode === 'list' ? 'bg-gray-100' : ''}`}
                        >
                            <List className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setViewMode('calendar')}
                            className={`p-2 ${viewMode === 'calendar' ? 'bg-gray-100' : ''}`}
                        >
                            <Calendar className="w-4 h-4" />
                        </button>
                    </div>

                    {selectedDate && (
                        <div className="flex items-center gap-2 text-sm bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg">
                            <Calendar className="w-4 h-4" />
                            {selectedDate.toLocaleDateString()}
                            <button onClick={() => setSelectedDate(null)} className="ml-1 hover:text-blue-900">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    )}

                    {Object.keys(filters).length > 0 && (
                        <div className="flex items-center gap-2 text-sm bg-purple-50 text-purple-700 px-3 py-1.5 rounded-lg">
                            <Filter className="w-4 h-4" />
                            Filters active
                            <button onClick={clearFilters} className="ml-1 hover:text-purple-900">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-3">
                    {selectedPosts.size > 0 && (
                        <span className="text-sm text-gray-600">{selectedPosts.size} selected</span>
                    )}
                    <button
                        onClick={loadSchedule}
                        disabled={isLoading}
                        className="p-2 hover:bg-gray-100 rounded-lg text-gray-600"
                        title="Refresh"
                    >
                        <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </div>

            {/* Loading */}
            {isLoading && (
                <div className="flex justify-center py-20">
                    <Spinner size="lg" />
                </div>
            )}

            {/* Calendar View */}
            {!isLoading && viewMode === 'calendar' && (
                <ScheduleCalendar
                    posts={posts}
                    onPostClick={handleCalendarPostClick}
                    onDateClick={handleDateClick}
                    selectedDate={selectedDate}
                />
            )}

            {/* List View */}
            {!isLoading && viewMode === 'list' && (
                <>
                    {filteredPosts.length === 0 ? (
                        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Calendar className="w-8 h-8 text-gray-400" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900">No scheduled posts</h3>
                            <p className="text-gray-500 mt-2 max-w-md mx-auto">
                                {Object.keys(filters).length > 0 || selectedDate
                                    ? 'No posts match your current filters.'
                                    : 'Schedule posts from the Generator or create a Campaign to get started.'}
                            </p>
                            <div className="mt-6 flex gap-3 justify-center">
                                <button
                                    onClick={() => navigate('/generator')}
                                    className="px-6 py-2 bg-brand-primary text-white rounded-lg font-medium hover:bg-brand-primary/90"
                                >
                                    Create Content
                                </button>
                                <button
                                    onClick={() => navigate('/campaigns')}
                                    className="px-6 py-2 border border-gray-200 rounded-lg font-medium hover:bg-gray-50"
                                >
                                    View Campaigns
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {filteredPosts.map(renderPostCard)}
                        </div>
                    )}
                </>
            )}

            {/* Modals */}
            <AnimatePresence>
                {showRescheduleModal && renderRescheduleModal()}
                {showDeleteModal && renderDeleteModal()}
            </AnimatePresence>
        </div>
    );
};

export default ScheduleView;
