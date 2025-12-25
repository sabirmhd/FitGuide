import React, { useState, useEffect, useCallback } from 'react';
import { getExercises, logExercise, getProfile, getWeeklyStats, deleteExerciseLog } from '../api';
import { Dumbbell, Flame, Clock, Activity, Target, Trash2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';

const ActivityTracker = () => {
    const [data, setData] = useState({ logs: [], total_calories: 0 });
    const [weeklyStats, setWeeklyStats] = useState([]);
    const [goal, setGoal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // Form State
    const [exerciseType, setExerciseType] = useState('Cardio');
    const [duration, setDuration] = useState('');
    const [description, setDescription] = useState('');

    const calculateGoal = useCallback((profile) => {
        if (!profile.weight_kg || !profile.height_cm || !profile.age) {
            setGoal(500); // Default fallback
            return;
        }

        // BMR Calculation (Mifflin-St Jeor)
        let bmr = 10 * profile.weight_kg + 6.25 * profile.height_cm - 5 * profile.age;
        if (profile.gender === 'Male') {
            bmr += 5;
        } else {
            bmr -= 161;
        }

        // TDEE
        const tdee = bmr * parseFloat(profile.activity_level);

        // Active Calories Goal (Approximate as TDEE - BMR)
        // This represents the calories burned through activity beyond resting
        const activeGoal = Math.round(tdee - bmr);

        // Ensure a reasonable minimum
        setGoal(Math.max(activeGoal, 200));
    }, []);

    const fetchData = useCallback(async () => {
        try {
            const [activityRes, profileRes, weeklyRes] = await Promise.all([
                getExercises(),
                getProfile(),
                getWeeklyStats()
            ]);

            setData(activityRes.data);
            setWeeklyStats(weeklyRes.data.daily_stats);
            calculateGoal(profileRes.data);

        } catch (error) {
            console.error("Failed to load activity data", error);
        } finally {
            setLoading(false);
        }
    }, [calculateGoal]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    async function handleSubmit(e) {
        e.preventDefault();
        if (!duration) return;

        setSubmitting(true);
        try {
            await logExercise({
                exercise_type: exerciseType,
                duration_minutes: parseInt(duration),
                description: description
            });
            // Reset form
            setDuration('');
            setDescription('');
            setExerciseType('Cardio');
            // Refresh data
            await fetchData();
        } catch (error) {
            console.error("Failed to log exercise", error);
        } finally {
            setSubmitting(false);
        }
    }

    if (loading) return <div className="text-center py-20 text-teal-600 dark:text-teal-400">Loading activity data...</div>;

    return (
        <div className="max-w-6xl mx-auto">
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                    <Dumbbell className="text-orange-500" /> Activity Tracker
                </h2>
                <p className="text-slate-500 dark:text-slate-400">Log your workouts and track calories burned.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mb-8">
                {/* Stats Cards Column */}
                <div className="lg:col-span-1 space-y-6">
                    {/* Today's Burn */}
                    <div className="bg-gradient-to-br from-orange-500 to-red-500 text-white p-6 rounded-2xl shadow-lg flex flex-col justify-between relative overflow-hidden h-48">
                        <div className="absolute top-0 right-0 p-4 opacity-20">
                            <Flame size={100} />
                        </div>
                        <div>
                            <h3 className="text-orange-100 font-medium mb-1">Calories Burned Today</h3>
                            <div className="text-5xl font-bold">{data.total_calories}</div>
                            <div className="text-sm text-orange-100 mt-1">kcal</div>
                        </div>
                        <div className="flex items-center gap-2 text-sm bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                            <Activity size={16} />
                            <span>{data.logs.length} workouts</span>
                        </div>
                    </div>

                    {/* Daily Goal */}
                    <div className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 relative overflow-hidden h-48 flex flex-col justify-between">
                        <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                            <Target size={100} />
                        </div>
                        <div>
                            <h3 className="text-slate-500 dark:text-slate-400 font-medium mb-1">Daily Burn Goal</h3>
                            <div className="text-4xl font-bold text-teal-600 dark:text-teal-400">{goal}</div>
                            <div className="text-sm text-slate-400 mt-1">kcal (Active Energy)</div>
                        </div>

                        <div>
                            <div className="flex justify-between text-xs mb-1 font-medium">
                                <span>Progress</span>
                                <span>{Math.round((data.total_calories / goal) * 100)}%</span>
                            </div>
                            <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-3 overflow-hidden">
                                <div
                                    className="bg-teal-500 h-full rounded-full transition-all duration-1000"
                                    style={{ width: `${Math.min((data.total_calories / goal) * 100, 100)}%` }}
                                ></div>
                            </div>
                        </div>
                    </div>

                    {/* Today's Activity */}
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm p-6 border border-slate-100 dark:border-slate-700">
                        <h3 className="font-bold text-slate-800 dark:text-white mb-4">Today's Activity</h3>
                        {data.logs.length === 0 ? (
                            <div className="text-center py-8 text-slate-400 dark:text-slate-500">
                                No activity logged today. Get moving!
                            </div>
                        ) : (
                            <div className="space-y-3 max-h-60 overflow-y-auto custom-scrollbar pr-2">
                                {data.logs.map((log) => (
                                    <div key={log.id} className="flex justify-between items-center p-4 border dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition group">
                                        <div className="flex items-center gap-4">
                                            <div className={`p-3 rounded-full ${log.exercise_type === 'Cardio' ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' :
                                                log.exercise_type === 'Strength' ? 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300' :
                                                    'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400'
                                                }`}>
                                                <Dumbbell size={20} />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-slate-800 dark:text-white">{log.exercise_type} <span className="font-normal text-slate-500 dark:text-slate-400 text-sm">({log.description})</span></h4>
                                                <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                                                    <Clock size={12} /> {log.duration_minutes} min
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className="block font-bold text-orange-600 dark:text-orange-400">{log.calories_burned} kcal</span>
                                            <button
                                                onClick={async () => {
                                                    if (confirm('Delete this workout?')) {
                                                        try {
                                                            await deleteExerciseLog(log.id);
                                                            fetchData();
                                                        } catch (e) {
                                                            console.error("Failed to delete", e);
                                                        }
                                                    }
                                                }}
                                                className="mt-2 text-slate-400 hover:text-red-500 transition-colors"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Graph & Form Column */}
                <div className="lg:col-span-3 space-y-8">
                    {/* Log Form */}
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
                        <h3 className="font-bold text-slate-800 dark:text-white mb-4">Log New Workout</h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Type</label>
                                    <select
                                        value={exerciseType}
                                        onChange={(e) => setExerciseType(e.target.value)}
                                        className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-orange-500 bg-slate-50 dark:bg-slate-700 dark:text-white"
                                    >
                                        <option value="Cardio">Cardio</option>
                                        <option value="Strength">Strength</option>
                                        <option value="Yoga">Yoga</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Duration (min)</label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={duration}
                                        onChange={(e) => setDuration(e.target.value)}
                                        placeholder="e.g. 30"
                                        className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white dark:bg-slate-700 dark:text-white"
                                        required
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Description (Optional)</label>
                                <input
                                    type="text"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="e.g. Running, HIIT, Leg Day"
                                    className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white dark:bg-slate-700 dark:text-white"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full bg-slate-800 dark:bg-slate-900 text-white py-3 rounded-xl font-bold hover:bg-slate-900 dark:hover:bg-black transition flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {submitting ? 'Calculating...' : (
                                    <>
                                        <Flame size={18} className="text-orange-400" /> Log Workout
                                    </>
                                )}
                            </button>
                            <p className="text-xs text-center text-slate-400 dark:text-slate-500">
                                Calories will be estimated by AI based on your profile if not specified.
                            </p>
                        </form>
                    </div>

                    {/* 7 Day Graph */}
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
                        <h3 className="font-bold text-slate-800 dark:text-white mb-6">Last 7 Days Activity</h3>
                        <div className="h-64 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={weeklyStats} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" opacity={0.5} />
                                    <XAxis
                                        dataKey="day_name"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#94A3B8', fontSize: 12 }}
                                        dy={10}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#94A3B8', fontSize: 12 }}
                                    />
                                    <Tooltip
                                        cursor={{ fill: '#F1F5F9', opacity: 0.4 }}
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <ReferenceLine y={goal} stroke="#F97316" strokeDasharray="3 3" label={{ value: 'Goal', position: 'insideTopRight', fill: '#F97316', fontSize: 12 }} />
                                    <Bar
                                        dataKey="calories"
                                        name="Calories Burned"
                                        fill="#0D9488"
                                        radius={[6, 6, 0, 0]}
                                        barSize={40}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ActivityTracker;
