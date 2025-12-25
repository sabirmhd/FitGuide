import React, { useState, useEffect } from 'react';
import { getWaterIntake, logWater, deleteWaterLog } from '../api';
import { Plus, Droplets, History, TrendingUp, Trash2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

const WaterTracker = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [adding, setAdding] = useState(false);

    const fetchWaterData = async () => {
        try {
            const res = await getWaterIntake();
            setData({
                ...res.data,
                chartData: res.data.weekly_chart_data || []
            });
        } catch (error) {
            console.error("Failed to load water data", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWaterData();
    }, []);

    const handleAddWater = async (amount) => {
        setAdding(true);
        try {
            await logWater(amount);
            await fetchWaterData();
        } catch (error) {
            console.error("Failed to log water", error);
        } finally {
            setAdding(false);
        }
    };

    if (loading) return <div className="text-center py-20 text-teal-600 dark:text-teal-400">Loading water tracker...</div>;
    if (!data) return <div className="text-center py-20 text-red-500 dark:text-red-400">Failed to load data.</div>;

    const percentage = Math.min(100, Math.round((data.consumed_ml / data.goal_ml) * 100));

    return (
        <div className="max-w-4xl mx-auto">
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                    <Droplets className="text-blue-500" /> Water Tracker
                </h2>
                <p className="text-slate-500 dark:text-slate-400">Stay hydrated to reach your fitness goals.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                {/* Progress Card */}
                <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-sm flex flex-col items-center justify-center relative overflow-hidden transition-colors">
                    <div className="relative w-64 h-64 flex items-center justify-center">
                        <svg className="w-full h-full" viewBox="0 0 100 100">
                            <circle cx="50" cy="50" r="45" fill="none" stroke="#eff6ff" className="dark:stroke-slate-700" strokeWidth="8" />
                            <circle
                                cx="50" cy="50" r="45"
                                fill="none" stroke="#3b82f6" strokeWidth="8"
                                strokeDasharray="283"
                                strokeDashoffset={283 - (283 * percentage) / 100}
                                transform="rotate(-90 50 50)"
                                strokeLinecap="round"
                                className="transition-all duration-1000 ease-out"
                            />
                        </svg>
                        <div className="absolute text-center">
                            <span className="block text-5xl font-bold text-slate-800 dark:text-white">{data.consumed_ml}<span className="text-lg text-slate-400 font-normal">ml</span></span>
                            <span className="text-sm text-slate-500 dark:text-slate-400 font-medium">Goal: {data.goal_ml}ml</span>
                        </div>
                    </div>
                </div>

                {/* Actions Card */}
                <div className="flex flex-col gap-4">
                    <div className="bg-blue-500 dark:bg-blue-600 text-white p-6 rounded-3xl shadow-lg flex-1 flex flex-col justify-center items-center text-center">
                        <h3 className="text-xl font-bold mb-2">Quick Add</h3>
                        <p className="text-blue-100 mb-6">Record your intake instantly.</p>

                        <div className="grid grid-cols-2 gap-4 w-full">
                            <button
                                onClick={() => handleAddWater(250)}
                                disabled={adding}
                                className="bg-white/20 hover:bg-white/30 backdrop-blur-sm p-4 rounded-xl flex flex-col items-center transition disabled:opacity-50"
                            >
                                <div className="text-2xl mb-1">🥛</div>
                                <span className="font-bold">Glass</span>
                                <span className="text-xs opacity-80">250ml</span>
                            </button>
                            <button
                                onClick={() => handleAddWater(500)}
                                disabled={adding}
                                className="bg-white/20 hover:bg-white/30 backdrop-blur-sm p-4 rounded-xl flex flex-col items-center transition disabled:opacity-50"
                            >
                                <div className="text-2xl mb-1">🍶</div>
                                <span className="font-bold">Bottle</span>
                                <span className="text-xs opacity-80">500ml</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Weekly Graph */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm p-6 mb-8 border border-slate-100 dark:border-slate-700">
                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                    <TrendingUp size={20} className="text-blue-500" /> Last 7 Days Intake
                </h3>
                <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
                            <ReferenceLine y={data.goal_ml} stroke="#3B82F6" strokeDasharray="3 3" label={{ value: 'Goal', position: 'insideTopRight', fill: '#3B82F6', fontSize: 12 }} />
                            <Bar
                                dataKey="amount_ml"
                                name="Volume (ml)"
                                fill="#3B82F6"
                                radius={[6, 6, 0, 0]}
                                barSize={40}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Recent Logs */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm p-6">
                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                    <History size={20} className="text-slate-400" /> Today's History
                </h3>

                {data.logs.length === 0 ? (
                    <div className="text-center py-8 text-slate-400 dark:text-slate-500">
                        No water logged today. Drink up!
                    </div>
                ) : (
                    <div className="space-y-3">
                        {data.logs.map((log) => (
                            <div key={log.id} className="flex justify-between items-center p-3 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg transition border-b border-slate-100 dark:border-slate-700 last:border-0">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                                        <Droplets size={18} />
                                    </div>
                                    <span className="font-medium text-slate-700 dark:text-slate-200">Water</span>
                                </div>
                                <div className="text-right">
                                    <span className="block font-bold text-slate-800 dark:text-white">+{log.amount_ml}ml</span>
                                    <span className="text-xs text-slate-400 block">{log.date_eaten}</span>
                                    <button
                                        onClick={async () => {
                                            if (confirm('Remove this water log?')) {
                                                try {
                                                    await deleteWaterLog(log.id);
                                                    fetchWaterData();
                                                } catch (e) {
                                                    console.error("Failed to delete", e);
                                                }
                                            }
                                        }}
                                        className="mt-1 text-slate-400 hover:text-red-500 transition-colors flex justify-end w-full"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default WaterTracker;
