
import { Platform } from '../types';

// Based on general industry research for EST/EDT.
const BEST_POSTING_TIMES: Record<Platform, { day: 'Weekday' | 'Weekend' | 'Any', time: string, hours: [number, number] }[]> = {
  [Platform.Twitter]: [
    { day: 'Weekday', time: 'Morning (8-11 AM)', hours: [8, 11] },
    { day: 'Weekday', time: 'Lunch (12-2 PM)', hours: [12, 14] },
  ],
  [Platform.LinkedIn]: [
    { day: 'Weekday', time: 'Morning (9-11 AM)', hours: [9, 11] },
    { day: 'Weekday', time: 'Afternoon (3-5 PM)', hours: [15, 17] },
  ],
  [Platform.Instagram]: [
    { day: 'Weekday', time: 'Lunch (11 AM-1 PM)', hours: [11, 13] },
    { day: 'Any', time: 'Evening (7-9 PM)', hours: [19, 21] },
  ],
  [Platform.TikTok]: [
    { day: 'Any', time: 'Afternoon (2-5 PM)', hours: [14, 17] },
    { day: 'Any', time: 'Evening (6-9 PM)', hours: [18, 21] },
  ],
  [Platform.Pinterest]: [
    { day: 'Any', time: 'Evening (8-11 PM)', hours: [20, 23] },
    { day: 'Weekend', time: 'Afternoon (2-4 PM)', hours: [14, 16] },
  ],
};

// Function to get upcoming optimal time slots
export const getOptimalTimeSlots = (platform: Platform): { date: Date; label: string }[] => {
  const platformTimes = BEST_POSTING_TIMES[platform] || BEST_POSTING_TIMES[Platform.Instagram]; // Fallback
  const slots: { date: Date; label: string }[] = [];
  const now = new Date();

  for (let i = 0; i < 3; i++) { // Check for today and next 2 days
    const targetDate = new Date();
    targetDate.setDate(now.getDate() + i);
    const dayOfWeek = targetDate.getDay(); // 0 = Sunday, 6 = Saturday

    for (const timeSlot of platformTimes) {
      const isWeekday = dayOfWeek > 0 && dayOfWeek < 6;
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

      if (
        timeSlot.day === 'Any' ||
        (timeSlot.day === 'Weekday' && isWeekday) ||
        (timeSlot.day === 'Weekend' && isWeekend)
      ) {
        const slotDate = new Date(targetDate);
        slotDate.setHours(timeSlot.hours[0], 0, 0, 0); // Use the start of the hour range

        // Only suggest future slots
        if (slotDate > now) {
          const dayLabel = i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : slotDate.toLocaleDateString(undefined, { weekday: 'long' });
          slots.push({
            date: slotDate,
            label: `${dayLabel}, ${timeSlot.time}`,
          });
        }
      }
    }
  }

  // Return up to 3 unique, sorted slots
  return Array.from(new Map(slots.map(item => [item.label, item])).values())
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .slice(0, 3);
};
