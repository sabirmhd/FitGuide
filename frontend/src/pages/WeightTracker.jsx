import React, { useState, useEffect } from 'react';
import { getWeightLogs, logWeight, deleteWeightLog } from '../api';
import { Scale, TrendingUp, TrendingDown, Minus, AlertTriangle, Trash2 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const WeightTracker = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [newWeight, setNewWeight] = useState('');
    const [logging, setLogging] = useState(false);

    const fetchData = async () => {
        try {
            const res = await getWeightLogs();
            setData(res.data);
        } catch (error) {
            console.error("Failed to load weight data", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleLogWeight = async (e) => {
        e.preventDefault();
        if (!newWeight) return;
        setLogging(true);
        try {
            await logWeight(parseFloat(newWeight));
            setNewWeight('');
            await fetchData();
        } catch (error) {
            console.error("Failed to log weight", error);
        } finally {
            setLogging(false);
        }
    };

    if (loading) return <div className="text-center py-20 text-teal-600 dark:text-teal-400">Loading weight data...</div>;
    if (!data) return <div className="text-center py-20 text-red-500 dark:text-red-400">Failed to load data.</div>;

    // Format data for chart
    const chartData = data.logs.map(log => ({
        date: new Date(log.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        weight: log.weight_kg
    }));

    const isGain = data.change > 0;
    const isLoss = data.change < 0;

    return (
        <div className="max-w-4xl mx-auto">
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                    <Scale className="text-indigo-500" /> Weight Tracker
                </h2>
                <p className="text-slate-500 dark:text-slate-400">Monitor your progress over time.</p>
            </div>

            {/* Plateau Alert */}
            {data.plateau && (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700/50 rounded-xl p-4 mb-8 flex items-start gap-3">
                    <AlertTriangle className="text-yellow-600 dark:text-yellow-500 shrink-0 mt-1" />
                    <div>
                        <h4 className="font-bold text-yellow-800 dark:text-yellow-400">Plateau Detected</h4>
                        <p className="text-sm text-yellow-700 dark:text-yellow-300/80 mt-1">
                            Your weight has remained stable for the last few entries. Consider adjusting your calorie target or activity level to break through.
                        </p>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* Current Weight */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
                    <h3 className="text-slate-500 dark:text-slate-400 text-sm font-semibold uppercase tracking-wider mb-2">Current</h3>
                    <div className="text-4xl font-bold text-slate-800 dark:text-white">
                        {data.current_weight} <span className="text-lg font-medium text-slate-400">kg</span>
                    </div>
                </div>

                {/* Change */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
                    <h3 className="text-slate-500 dark:text-slate-400 text-sm font-semibold uppercase tracking-wider mb-2">Change</h3>
                    <div className={`text-4xl font-bold flex items-center gap-2 ${isGain ? 'text-red-500' : isLoss ? 'text-green-500' : 'text-slate-800 dark:text-white'}`}>
                        {data.change > 0 ? '+' : ''}{data.change} <span className="text-lg font-medium text-slate-400">kg</span>
                        {isGain && <TrendingUp size={28} />}
                        {isLoss && <TrendingDown size={28} />}
                        {!isGain && !isLoss && <Minus size={28} />}
                    </div>
                    <p className="text-xs text-slate-400 mt-2">From starting weight ({data.start_weight}kg)</p>
                </div>

                {/* Log Input */}
                <div className="bg-indigo-50 dark:bg-slate-800 p-6 rounded-2xl border border-indigo-100 dark:border-slate-700">
                    <h3 className="text-indigo-900 dark:text-indigo-400 text-sm font-semibold uppercase tracking-wider mb-2">Log Weight</h3>
                    <form onSubmit={handleLogWeight} className="flex gap-2">
                        <input
                            type="number"
                            step="0.1"
                            value={newWeight}
                            onChange={(e) => setNewWeight(e.target.value)}
                            placeholder="0.0"
                            className="w-full px-4 py-2 rounded-lg border border-indigo-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                        <button
                            type="submit"
                            disabled={logging}
                            className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 transition disabled:opacity-50"
                        >
                            Log
                        </button>
                    </form>
                </div>
            </div>

            {/* Graph */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm mb-8 border border-slate-100 dark:border-slate-700">
                <h3 className="font-bold text-slate-800 dark:text-white mb-6">Weight History</h3>
                <div className="h-80 w-full">
                    {chartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#94a3b8" strokeOpacity={0.2} />
                                <XAxis dataKey="date" stroke="#94a3b8" tick={{ fontSize: 12 }} />
                                <YAxis domain={['auto', 'auto']} stroke="#94a3b8" tick={{ fontSize: 12 }} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', color: '#1e293b' }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="weight"
                                    stroke="#6366f1"
                                    strokeWidth={3}
                                    dot={{ fill: '#6366f1', strokeWidth: 2, r: 4, stroke: '#fff' }}
                                    activeDot={{ r: 6 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-full flex items-center justify-center text-slate-400">
                            No weight data available yet.
                        </div>
                    )}
                </div>
            </div>

            {/* Recent Logs List */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm mb-8 border border-slate-100 dark:border-slate-700">
                <h3 className="font-bold text-slate-800 dark:text-white mb-4">Recent Logs</h3>
                {data.logs.length === 0 ? (
                    <div className="text-center text-slate-400">No logs yet.</div>
                ) : (
                    <div className="space-y-2">
                        {[...data.logs].reverse().map((log) => (
                            <div key={log.id} className="flex justify-between items-center p-3 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg transition border-b border-slate-100 dark:border-slate-700 last:border-0 h-10">
                                <span className="text-slate-600 dark:text-slate-300 font-medium">{new Date(log.date).toLocaleDateString()}</span>
                                <div className="flex items-center gap-4">
                                    <span className="font-bold text-slate-800 dark:text-white">{log.weight_kg} kg</span>
                                    <button
                                        onClick={async () => {
                                            if (confirm('Delete this weight entry?')) {
                                                try {
                                                    await deleteWeightLog(log.id);
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
                )}
            </div>
        </div>
    );
};

export default WeightTracker;
