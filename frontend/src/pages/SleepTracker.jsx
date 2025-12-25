import React, { useState, useEffect } from 'react';
import { getSleepLogs, logSleep, deleteSleepLog } from '../api';
import { Moon, Clock, Star, Activity, TrendingUp, BarChart2, Trash2 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const SleepTracker = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // Form State
    const [bedtime, setBedtime] = useState('');
    const [wakeTime, setWakeTime] = useState('');
    const [quality, setQuality] = useState(50);
    // Stages (Optional)
    const [deepSleep, setDeepSleep] = useState('');
    const [lightSleep, setLightSleep] = useState('');
    const [remSleep, setRemSleep] = useState('');
    const [awakeTime, setAwakeTime] = useState('');

    const fetchData = async () => {
        try {
            const res = await getSleepLogs();
            setLogs(res.data);
        } catch (error) {
            console.error("Failed to load sleep logs", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const calculateDuration = (start, end) => {
        if (!start || !end) return 0;
        const startDate = new Date(`2000-01-01T${start}`);
        const endDate = new Date(`2000-01-01T${end}`);

        let diff = (endDate - startDate) / (1000 * 60); // minutes
        if (diff < 0) diff += 24 * 60; // handle overnight
        return diff;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        const duration = calculateDuration(bedtime, wakeTime);

        try {
            await logSleep({
                bedtime,
                wake_time: wakeTime,
                duration_minutes: duration,
                quality_score: quality,
                deep_sleep_minutes: parseInt(deepSleep) || 0,
                light_sleep_minutes: parseInt(lightSleep) || 0,
                rem_sleep_minutes: parseInt(remSleep) || 0,
                awake_minutes: parseInt(awakeTime) || 0
            });

            // Reset form
            setBedtime('');
            setWakeTime('');
            setQuality(50);
            setDeepSleep('');
            setLightSleep('');
            setRemSleep('');
            setAwakeTime('');

            await fetchData();
        } catch (error) {
            console.error("Failed to log sleep", error);
        } finally {
            setSubmitting(false);
        }
    };

    // Prepare Chart Data (Last 7 logs reverse order for timeline)
    const chartData = [...logs].reverse().slice(-7).map(log => ({
        date: new Date(log.date).toLocaleDateString('en-US', { weekday: 'short' }),
        hours: (log.duration_minutes / 60).toFixed(1)
    }));

    // Stats
    const todayLog = logs.length > 0 && logs[0].date === new Date().toISOString().split('T')[0] ? logs[0] : null;
    const avgScore = logs.length > 0 ? Math.round(logs.reduce((acc, log) => acc + log.quality_score, 0) / logs.length) : 0;
    const avgDuration = logs.length > 0 ? Math.round(logs.reduce((acc, log) => acc + log.duration_minutes, 0) / logs.length) : 0;

    if (loading) return <div className="text-center py-20 text-indigo-600 dark:text-indigo-400">Loading sleep data...</div>;

    return (
        <div className="max-w-5xl mx-auto space-y-8">
            <div className="flex items-center gap-3 mb-2">
                <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl">
                    <Moon size={24} />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Sleep Tracker</h2>
                    <p className="text-slate-500 dark:text-slate-400">Monitor your sleep patterns and quality.</p>
                </div>
            </div>

            {/* Top Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white p-6 rounded-2xl shadow-lg relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-20"><Moon size={60} /></div>
                    <p className="text-indigo-100 mb-1">Sleep Duration (Avg)</p>
                    <h3 className="text-3xl font-bold">{Math.floor(avgDuration / 60)}h {avgDuration % 60}m</h3>
                    <p className="text-xs text-indigo-200 mt-2">Goal: 8h 0m</p>
                </div>

                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
                    <div className="flex justify-between items-start mb-2">
                        <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 rounded-lg"><Star size={20} /></div>
                        <span className={`text-xs px-2 py-1 rounded-full ${avgScore >= 80 ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
                            {avgScore >= 80 ? 'Excellent' : avgScore >= 60 ? 'Good' : 'Fair'}
                        </span>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">Sleep Quality</p>
                    <h3 className="text-2xl font-bold text-slate-800 dark:text-white">{avgScore}/100</h3>
                </div>

                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
                    <div className="flex justify-between items-start mb-2">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg"><Clock size={20} /></div>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">Last Bedtime</p>
                    <h3 className="text-2xl font-bold text-slate-800 dark:text-white">{todayLog ? todayLog.bedtime.slice(0, 5) : '--:--'}</h3>
                </div>

                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
                    <div className="flex justify-between items-start mb-2">
                        <div className="p-2 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-lg"><Activity size={20} /></div>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">Last Wake Up</p>
                    <h3 className="text-2xl font-bold text-slate-800 dark:text-white">{todayLog ? todayLog.wake_time.slice(0, 5) : '--:--'}</h3>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Log Form */}
                <div className="lg:col-span-1 bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 h-fit">
                    <h3 className="font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                        <Moon size={18} className="text-indigo-500" /> Log Last Night's Sleep
                    </h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Bedtime</label>
                                <input type="time" required value={bedtime} onChange={(e) => setBedtime(e.target.value)} className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 dark:text-white" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Wake Time</label>
                                <input type="time" required value={wakeTime} onChange={(e) => setWakeTime(e.target.value)} className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 dark:text-white" />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Quality Score (0-100)</label>
                            <div className="flex items-center gap-4">
                                <input type="range" min="0" max="100" value={quality} onChange={(e) => setQuality(parseInt(e.target.value))} className="flex-1" />
                                <span className="font-bold text-slate-800 dark:text-white w-8">{quality}</span>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-slate-100 dark:border-slate-700">
                            <p className="text-xs font-bold text-slate-400 uppercase mb-3">Sleep Stages (Mins) - Optional</p>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs text-slate-500 dark:text-slate-400">Deep</label>
                                    <input type="number" placeholder="min" value={deepSleep} onChange={(e) => setDeepSleep(e.target.value)} className="w-full p-2 text-sm rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 dark:text-white" />
                                </div>
                                <div>
                                    <label className="text-xs text-slate-500 dark:text-slate-400">Light</label>
                                    <input type="number" placeholder="min" value={lightSleep} onChange={(e) => setLightSleep(e.target.value)} className="w-full p-2 text-sm rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 dark:text-white" />
                                </div>
                                <div>
                                    <label className="text-xs text-slate-500 dark:text-slate-400">REM</label>
                                    <input type="number" placeholder="min" value={remSleep} onChange={(e) => setRemSleep(e.target.value)} className="w-full p-2 text-sm rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 dark:text-white" />
                                </div>
                                <div>
                                    <label className="text-xs text-slate-500 dark:text-slate-400">Awake</label>
                                    <input type="number" placeholder="min" value={awakeTime} onChange={(e) => setAwakeTime(e.target.value)} className="w-full p-2 text-sm rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 dark:text-white" />
                                </div>
                            </div>
                        </div>

                        <button disabled={submitting} type="submit" className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition shadow-lg shadow-indigo-200 dark:shadow-none">
                            {submitting ? 'Saving...' : 'Log Sleep'}
                        </button>
                    </form>
                </div>

                {/* Charts Area */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Trend Chart */}
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
                        <h3 className="font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                            <TrendingUp size={18} className="text-indigo-500" /> Sleep Duration Trend (7 Days)
                        </h3>
                        {chartData.length > 0 ? (
                            <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={chartData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.3} />
                                        <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                        <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} unit="h" />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                                            itemStyle={{ color: '#fff' }}
                                        />
                                        <Line type="monotone" dataKey="hours" stroke="#6366f1" strokeWidth={3} dot={{ fill: '#6366f1', strokeWidth: 2 }} activeDot={{ r: 6 }} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        ) : (
                            <div className="h-64 flex items-center justify-center text-slate-400">
                                No sufficient data for chart
                            </div>
                        )}
                    </div>

                    {/* Breakdown of Last Log */}
                    {todayLog && (
                        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
                            <h3 className="font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                                <BarChart2 size={18} className="text-indigo-500" /> Last Night's Stages
                            </h3>
                            <div className="space-y-4">
                                <div>
                                    <div className="flex justify-between text-xs mb-1">
                                        <span className="text-slate-600 dark:text-slate-300">Deep Sleep</span>
                                        <span className="font-bold dark:text-white">{todayLog.deep_sleep_minutes}m</span>
                                    </div>
                                    <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                        <div className="h-full bg-indigo-600" style={{ width: `${(todayLog.deep_sleep_minutes / todayLog.duration_minutes) * 100}%` }}></div>
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between text-xs mb-1">
                                        <span className="text-slate-600 dark:text-slate-300">Light Sleep</span>
                                        <span className="font-bold dark:text-white">{todayLog.light_sleep_minutes}m</span>
                                    </div>
                                    <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                        <div className="h-full bg-purple-400" style={{ width: `${(todayLog.light_sleep_minutes / todayLog.duration_minutes) * 100}%` }}></div>
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between text-xs mb-1">
                                        <span className="text-slate-600 dark:text-slate-300">REM Sleep</span>
                                        <span className="font-bold dark:text-white">{todayLog.rem_sleep_minutes}m</span>
                                    </div>
                                    <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                        <div className="h-full bg-blue-400" style={{ width: `${(todayLog.rem_sleep_minutes / todayLog.duration_minutes) * 100}%` }}></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Sleep History List */}
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
                        <h3 className="font-bold text-slate-800 dark:text-white mb-4">Sleep History</h3>
                        <div className="space-y-3 max-h-60 overflow-y-auto custom-scrollbar pr-2">
                            {logs.map((log) => (
                                <div key={log.id} className="flex justify-between items-center p-3 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg transition border-b border-slate-100 dark:border-slate-700 last:border-0">
                                    <div className="flex flex-col">
                                        <span className="font-bold text-slate-800 dark:text-white">{new Date(log.date).toLocaleDateString()}</span>
                                        <span className="text-xs text-slate-500 dark:text-slate-400">{log.bedtime.slice(0, 5)} - {log.wake_time.slice(0, 5)}</span>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="text-right">
                                            <span className="block font-bold text-indigo-600 dark:text-indigo-400">{Math.floor(log.duration_minutes / 60)}h {log.duration_minutes % 60}m</span>
                                            <span className="text-xs text-slate-400">Score: {log.quality_score}</span>
                                        </div>
                                        <button
                                            onClick={async () => {
                                                if (confirm('Delete this sleep entry?')) {
                                                    try {
                                                        await deleteSleepLog(log.id);
                                                        fetchData();
                                                    } catch (e) {
                                                        console.error("Failed to delete", e);
                                                    }
                                                }
                                            }}
                                            className="text-slate-400 hover:text-red-500 transition-colors"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SleepTracker;
