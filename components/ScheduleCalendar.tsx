import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
    ChevronLeft, ChevronRight, Calendar, Image, 
    Twitter, Linkedin, Instagram, Music, Pin, Briefcase
} from 'lucide-react';
import { Platform } from '../types';
import { UnifiedScheduledPost } from '../services/scheduleService';

interface ScheduleCalendarProps {
    posts: UnifiedScheduledPost[];
    onPostClick: (post: UnifiedScheduledPost) => void;
    onDateClick?: (date: Date) => void;
    selectedDate?: Date | null;
}

// Platform colors for visual distinction
const platformColors: Record<string, string> = {
    Twitter: 'bg-sky-500',
    LinkedIn: 'bg-blue-700',
    Instagram: 'bg-gradient-to-br from-purple-500 to-pink-500',
    TikTok: 'bg-black',
    Pinterest: 'bg-red-600',
};

const platformIcons: Record<string, React.ReactNode> = {
    Twitter: <Twitter className="w-3 h-3" />,
    LinkedIn: <Linkedin className="w-3 h-3" />,
    Instagram: <Instagram className="w-3 h-3" />,
    TikTok: <Music className="w-3 h-3" />,
    Pinterest: <Pin className="w-3 h-3" />,
};

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 
                'July', 'August', 'September', 'October', 'November', 'December'];

const ScheduleCalendar: React.FC<ScheduleCalendarProps> = ({
    posts,
    onPostClick,
    onDateClick,
    selectedDate,
}) => {
    const today = new Date();
    const [currentMonth, setCurrentMonth] = useState(today.getMonth());
    const [currentYear, setCurrentYear] = useState(today.getFullYear());

    // Group posts by date
    const postsByDate = useMemo(() => {
        const grouped = new Map<string, UnifiedScheduledPost[]>();
        
        posts.forEach(post => {
            if (post.scheduledAt) {
                const dateKey = new Date(post.scheduledAt).toISOString().split('T')[0];
                if (!grouped.has(dateKey)) {
                    grouped.set(dateKey, []);
                }
                grouped.get(dateKey)!.push(post);
            }
        });
        
        return grouped;
    }, [posts]);

    // Get calendar grid data
    const calendarDays = useMemo(() => {
        const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
        const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
        const startingDay = firstDayOfMonth.getDay();
        const daysInMonth = lastDayOfMonth.getDate();

        const days: (Date | null)[] = [];

        // Add empty slots for days before the first of the month
        for (let i = 0; i < startingDay; i++) {
            days.push(null);
        }

        // Add days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            days.push(new Date(currentYear, currentMonth, day));
        }

        // Fill remaining slots to complete the grid
        const remaining = 7 - (days.length % 7);
        if (remaining < 7) {
            for (let i = 0; i < remaining; i++) {
                days.push(null);
            }
        }

        return days;
    }, [currentMonth, currentYear]);

    // Navigation
    const goToPreviousMonth = () => {
        if (currentMonth === 0) {
            setCurrentMonth(11);
            setCurrentYear(currentYear - 1);
        } else {
            setCurrentMonth(currentMonth - 1);
        }
    };

    const goToNextMonth = () => {
        if (currentMonth === 11) {
            setCurrentMonth(0);
            setCurrentYear(currentYear + 1);
        } else {
            setCurrentMonth(currentMonth + 1);
        }
    };

    const goToToday = () => {
        setCurrentMonth(today.getMonth());
        setCurrentYear(today.getFullYear());
    };

    // Check if date is today
    const isToday = (date: Date): boolean => {
        return date.getDate() === today.getDate() &&
               date.getMonth() === today.getMonth() &&
               date.getFullYear() === today.getFullYear();
    };

    // Check if date is selected
    const isSelected = (date: Date): boolean => {
        if (!selectedDate) return false;
        return date.getDate() === selectedDate.getDate() &&
               date.getMonth() === selectedDate.getMonth() &&
               date.getFullYear() === selectedDate.getFullYear();
    };

    // Check if date is in the past
    const isPast = (date: Date): boolean => {
        const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        return dateOnly < todayOnly;
    };

    // Render a single day cell
    const renderDayCell = (date: Date | null, index: number) => {
        if (!date) {
            return <div key={`empty-${index}`} className="h-28 bg-gray-50/50" />;
        }

        const dateKey = date.toISOString().split('T')[0];
        const dayPosts = postsByDate.get(dateKey) || [];
        const todayCell = isToday(date);
        const selectedCell = isSelected(date);
        const pastCell = isPast(date);

        return (
            <motion.div
                key={dateKey}
                className={`h-28 border-b border-r border-gray-100 p-1 transition-colors cursor-pointer ${
                    selectedCell ? 'bg-brand-primary/10 ring-2 ring-brand-primary ring-inset' :
                    todayCell ? 'bg-blue-50 ring-2 ring-blue-400 ring-inset' : 
                    pastCell ? 'bg-gray-50/80' : 'bg-white hover:bg-gray-50'
                }`}
                onClick={() => onDateClick?.(date)}
                whileHover={{ scale: 1.01 }}
            >
                {/* Date number */}
                <div className={`text-xs font-medium mb-1 flex items-center justify-between ${
                    todayCell ? 'text-blue-600' : 
                    pastCell ? 'text-gray-400' : 'text-gray-900'
                }`}>
                    <span>{date.getDate()}</span>
                    {dayPosts.length > 0 && (
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                            todayCell ? 'bg-blue-200 text-blue-800' : 'bg-gray-200 text-gray-600'
                        }`}>
                            {dayPosts.length}
                        </span>
                    )}
                </div>

                {/* Posts for this day */}
                <div className="space-y-0.5 overflow-hidden max-h-20">
                    {dayPosts.slice(0, 3).map(post => (
                        <motion.button
                            key={post.id}
                            onClick={(e) => {
                                e.stopPropagation();
                                onPostClick(post);
                            }}
                            className={`w-full flex items-center gap-1 px-1.5 py-0.5 rounded text-white text-xs truncate ${
                                post.status === 'posted' ? 'opacity-60' :
                                post.status === 'failed' ? 'bg-red-500' :
                                platformColors[post.platform] || 'bg-gray-500'
                            }`}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            {platformIcons[post.platform]}
                            <span className="truncate flex-1 text-left">
                                {post.content?.primaryContent?.substring(0, 15) || post.platform}
                            </span>
                            {post.source === 'campaign' && (
                                <Briefcase className="w-2.5 h-2.5 flex-shrink-0 opacity-70" />
                            )}
                            {post.hasMedia && <Image className="w-2.5 h-2.5 flex-shrink-0" />}
                        </motion.button>
                    ))}
                    {dayPosts.length > 3 && (
                        <div className="text-[10px] text-gray-500 px-1">
                            +{dayPosts.length - 3} more
                        </div>
                    )}
                </div>
            </motion.div>
        );
    };

    return (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
                <div className="flex items-center gap-4">
                    <h3 className="text-lg font-bold text-surface-900">
                        {MONTHS[currentMonth]} {currentYear}
                    </h3>
                    <button
                        onClick={goToToday}
                        className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 font-medium"
                    >
                        Today
                    </button>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={goToPreviousMonth}
                        className="p-2 hover:bg-gray-100 rounded-lg"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                        onClick={goToNextMonth}
                        className="p-2 hover:bg-gray-100 rounded-lg"
                    >
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Day headers */}
            <div className="grid grid-cols-7 border-b border-gray-100">
                {DAYS.map(day => (
                    <div key={day} className="py-2 text-center text-xs font-medium text-gray-500 border-r border-gray-100 last:border-r-0">
                        {day}
                    </div>
                ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7">
                {calendarDays.map((date, index) => renderDayCell(date, index))}
            </div>

            {/* Legend */}
            <div className="p-3 border-t border-gray-100 bg-gray-50">
                <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-3 text-xs">
                        <span className="text-gray-500">Platforms:</span>
                        {Object.entries(platformColors).map(([platform, color]) => (
                            <div key={platform} className="flex items-center gap-1">
                                <div className={`w-3 h-3 rounded ${color}`} />
                                <span className="text-gray-600">{platform}</span>
                            </div>
                        ))}
                    </div>
                    <div className="flex items-center gap-3 text-xs">
                        <div className="flex items-center gap-1">
                            <Briefcase className="w-3 h-3 text-gray-500" />
                            <span className="text-gray-600">Campaign</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <div className="w-3 h-3 rounded bg-gray-400 opacity-60" />
                            <span className="text-gray-600">Posted</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ScheduleCalendar;
