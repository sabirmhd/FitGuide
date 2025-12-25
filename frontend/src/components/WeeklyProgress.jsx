import React, { useEffect, useState } from 'react';
import { getWeeklyStats } from '../api';
import { Flame } from 'lucide-react';

const WeeklyProgress = ({ targetCalories = 2000 }) => {
    const [stats, setStats] = useState([]);
    const [streak, setStreak] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await getWeeklyStats();
                setStats(res.data.daily_stats);
                setStreak(res.data.streak);
            } catch (error) {
                console.error("Failed to load weekly stats", error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (loading) return (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm animate-pulse h-48 transition-colors duration-300">
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/3 mb-4"></div>
            <div className="flex gap-2 items-end h-32">
                {[...Array(7)].map((_, i) => (
                    <div key={i} className="bg-slate-200 dark:bg-slate-700 flex-1 rounded-lg" style={{ height: `${Math.random() * 50 + 20}%` }}></div>
                ))}
            </div>
        </div>
    );

    return (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm transition-colors duration-300">
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 transition-colors duration-300">Weekly Progress</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 transition-colors duration-300">Last 7 Days</p>
                </div>
                <div className="flex items-center gap-2 bg-orange-50 dark:bg-orange-900/40 text-orange-600 dark:text-orange-400 px-3 py-1.5 rounded-full font-bold shadow-sm transition-colors duration-300">
                    <Flame size={18} className="fill-orange-600 dark:fill-orange-400" />
                    <span>{streak} Day Streak</span>
                </div>
            </div>

            <div className="flex items-stretch gap-2 h-40">
                {stats.map((day, index) => {
                    const percentage = Math.min(100, (day.calories / targetCalories) * 100);
                    const isToday = index === 6; // Last item is today

                    // Color Logic
                    // Green: Within 10% of target (or similar logic)
                    // Yellow: Under
                    // Red: Way over (e.g. > 110%)

                    let barColor = 'bg-slate-200 dark:bg-slate-700';
                    const lowerBound = targetCalories * 0.85;
                    const upperBound = targetCalories * 1.15;

                    if (day.calories === 0) {
                        barColor = 'bg-slate-100 dark:bg-slate-700/50';
                    } else if (day.calories >= lowerBound && day.calories <= upperBound) {
                        barColor = isToday ? 'bg-green-600' : 'bg-green-500';
                    } else if (day.calories < lowerBound) {
                        barColor = isToday ? 'bg-yellow-500' : 'bg-yellow-400';
                    } else {
                        barColor = isToday ? 'bg-red-500' : 'bg-red-400';
                    }

                    // Highlight today
                    if (isToday && day.calories > 0) {
                        barColor += ' ring-2 ring-offset-2 ring-slate-200 dark:ring-slate-700 dark:ring-offset-slate-800';
                    }

                    return (
                        <div key={day.date} className="flex-1 flex flex-col items-center justify-end gap-2 group relative h-full">
                            {/* Tooltip */}
                            <div className="absolute bottom-full mb-2 opacity-0 group-hover:opacity-100 transition pointer-events-none bg-slate-800 text-white text-xs px-2 py-1 rounded shadow-lg whitespace-nowrap z-10">
                                {day.calories} cal
                                <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800"></div>
                            </div>

                            {/* Bar */}
                            <div
                                className={`w-full rounded-t-lg transition-all duration-500 ease-out ${barColor}`}
                                style={{ height: `${percentage === 0 ? 5 : percentage}%` }}
                            ></div>

                            {/* Label */}
                            <span className={`text-xs font-semibold ${isToday ? 'text-slate-800 dark:text-slate-100' : 'text-slate-400 dark:text-slate-500'} transition-colors duration-300`}>
                                {day.day_name}
                            </span>
                        </div>
                    );
                })}
            </div>

            {/* Legend - Optional */}
            <div className="mt-4 flex justify-between text-xs text-slate-400 dark:text-slate-500 px-2 transition-colors duration-300">
                <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-green-500"></div>Target Met</div>
                <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-yellow-400"></div>Under</div>
                <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-red-400"></div>Over</div>
            </div>
        </div>
    );
};

export default WeeklyProgress;
