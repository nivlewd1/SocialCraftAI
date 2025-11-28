import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    ChevronLeft, ChevronRight, Calendar, Image, FileText, 
    Twitter, Linkedin, Instagram, Music, Pin
} from 'lucide-react';
import { CampaignPost } from '../services/campaignService';

interface CampaignCalendarProps {
    posts: CampaignPost[];
    startDate: string;
    endDate: string;
    onPostClick: (post: CampaignPost) => void;
    onDateClick?: (date: Date) => void;
}

// Platform colors for visual distinction
const platformColors: Record<string, string> = {
    Twitter: 'bg-sky-500',
    LinkedIn: 'bg-blue-700',
    Instagram: 'bg-gradient-to-br from-purple-500 to-pink-500',
    TikTok: 'bg-black',
    Pinterest: 'bg-rose-600',
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

const CampaignCalendar: React.FC<CampaignCalendarProps> = ({
    posts,
    startDate,
    endDate,
    onPostClick,
    onDateClick,
}) => {
    const campaignStart = new Date(startDate);
    const campaignEnd = new Date(endDate);
    
    // Default to campaign start month
    const [currentMonth, setCurrentMonth] = useState(campaignStart.getMonth());
    const [currentYear, setCurrentYear] = useState(campaignStart.getFullYear());

    // Group posts by date
    const postsByDate = useMemo(() => {
        const grouped = new Map<string, CampaignPost[]>();
        
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
        const today = new Date();
        setCurrentMonth(today.getMonth());
        setCurrentYear(today.getFullYear());
    };

    // Check if date is within campaign range
    const isInCampaignRange = (date: Date): boolean => {
        const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        const startOnly = new Date(campaignStart.getFullYear(), campaignStart.getMonth(), campaignStart.getDate());
        const endOnly = new Date(campaignEnd.getFullYear(), campaignEnd.getMonth(), campaignEnd.getDate());
        return dateOnly >= startOnly && dateOnly <= endOnly;
    };

    // Check if date is today
    const isToday = (date: Date): boolean => {
        const today = new Date();
        return date.getDate() === today.getDate() &&
               date.getMonth() === today.getMonth() &&
               date.getFullYear() === today.getFullYear();
    };

    // Render a single day cell
    const renderDayCell = (date: Date | null, index: number) => {
        if (!date) {
            return <div key={`empty-${index}`} className="h-24 bg-gray-50/50" />;
        }

        const dateKey = date.toISOString().split('T')[0];
        const dayPosts = postsByDate.get(dateKey) || [];
        const inRange = isInCampaignRange(date);
        const today = isToday(date);

        return (
            <motion.div
                key={dateKey}
                className={`h-24 border-b border-r border-gray-100 p-1 transition-colors ${
                    inRange ? 'bg-white hover:bg-gray-50' : 'bg-gray-50/50'
                } ${today ? 'ring-2 ring-brand-primary ring-inset' : ''}`}
                onClick={() => onDateClick?.(date)}
            >
                {/* Date number */}
                <div className={`text-xs font-medium mb-1 ${
                    today ? 'text-brand-primary' : 
                    inRange ? 'text-gray-900' : 'text-gray-400'
                }`}>
                    {date.getDate()}
                </div>

                {/* Posts for this day */}
                <div className="space-y-0.5 overflow-hidden max-h-16">
                    {dayPosts.slice(0, 3).map(post => (
                        <motion.button
                            key={post.id}
                            onClick={(e) => {
                                e.stopPropagation();
                                onPostClick(post);
                            }}
                            className={`w-full flex items-center gap-1 px-1.5 py-0.5 rounded text-white text-xs truncate ${platformColors[post.platform] || 'bg-gray-500'}`}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            {platformIcons[post.platform]}
                            <span className="truncate flex-1 text-left">
                                {post.textContent?.primaryContent?.substring(0, 20) || post.platform}
                            </span>
                            {post.hasMedia && <Image className="w-3 h-3 flex-shrink-0" />}
                        </motion.button>
                    ))}
                    {dayPosts.length > 3 && (
                        <div className="text-xs text-gray-500 px-1">
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
                        className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded hover:bg-gray-200"
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
                <div className="flex items-center gap-4 text-xs">
                    <span className="text-gray-500">Platforms:</span>
                    {Object.entries(platformColors).map(([platform, color]) => (
                        <div key={platform} className="flex items-center gap-1">
                            <div className={`w-3 h-3 rounded ${color}`} />
                            <span className="text-gray-600">{platform}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default CampaignCalendar;
