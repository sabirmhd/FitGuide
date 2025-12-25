import React, { useState, useEffect } from 'react';
import {
    LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    ComposedChart, Area, PieChart, Pie, Cell
} from 'recharts';
import { Calendar, Target, TrendingUp, Activity, AlertCircle, Download } from 'lucide-react';
import { getMonthlyStats, downloadMonthlyReport } from '../api';



const MonthlyDashboard = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [data, setData] = useState(null);
    const [downloading, setDownloading] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await getMonthlyStats();
                setData(res.data);
            } catch (err) {
                console.error("Failed to fetch monthly stats", err);
                setError("Failed to load monthly report.");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleDownloadPDF = async () => {
        setDownloading(true);
        try {
            const response = await downloadMonthlyReport();

            // Create a Blob from the PDF Stream
            const file = new Blob([response.data], { type: 'application/pdf' });

            // Build a URL from the file
            const fileURL = URL.createObjectURL(file);

            // Create a temp <a> tag to download file
            const link = document.createElement('a');
            link.href = fileURL;
            link.setAttribute('download', `Monthly_Report_${data.month_name}.pdf`);
            document.body.appendChild(link);
            link.click();

            // Clean up
            link.remove();
            URL.revokeObjectURL(fileURL);
        } catch (err) {
            console.error('PDF generation failed', err);
            setError("Failed to download PDF. Please try again.");
        } finally {
            setDownloading(false);
        }
    };


    if (loading) return (
        <div className="flex justify-center items-center h-96">
            <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    if (error) return (
        <div className="text-center py-10 text-red-500 flex flex-col items-center gap-2">
            <AlertCircle />
            <p>{error}</p>
        </div>
    );

    if (!data) return null;

    const { daily_stats, adherence, weight_change, month_name } = data;

    // Data prep
    const calorieData = daily_stats.map(d => ({
        day: d.day,
        calories: d.calories,
        target: d.target,
        date: d.date
    }));

    const macroData = daily_stats.map(d => ({
        day: d.day,
        protein: d.protein,
        carbs: d.carbs,
        fats: d.fats
    }));

    const weightData = daily_stats.filter(d => d.weight !== null).map(d => ({
        day: d.day,
        weight: d.weight
    }));

    const adherenceData = [
        { name: 'Met Target', value: adherence.met_target_days, color: '#10b981' }, // teal-500
        { name: 'Missed', value: adherence.logged_days - adherence.met_target_days, color: '#ef4444' } // red-500
    ];

    return (
        <div className="space-y-6 pb-10" id="monthly-report-content">
            <div className="flex items-center justify-between">
                <h2
                    className="text-2xl font-bold"
                    style={{
                        background: 'linear-gradient(to right, #0d9488, #059669)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                        color: 'transparent'
                    }}
                >
                    Monthly Report - {month_name}
                </h2>

                <div className="flex items-center gap-4">
                    <button
                        onClick={handleDownloadPDF}
                        disabled={downloading}
                        className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                    >
                        {downloading ? (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <Download size={18} />
                        )}
                        {downloading ? 'Generating...' : 'Download PDF'}
                    </button>

                    <div className="bg-white dark:bg-slate-800 p-3 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 flex items-center gap-4">
                        <div className="text-center">
                            <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-semibold">Weight Change</p>
                            <p className={`text-lg font-bold ${weight_change <= 0 ? 'text-green-500' : 'text-amber-500'}`}>
                                {weight_change > 0 ? '+' : ''}{weight_change} kg
                            </p>
                        </div>
                        <div className="w-px h-8 bg-slate-200 dark:bg-slate-700"></div>
                        <div className="text-center">
                            <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-semibold">Adherence</p>
                            <p className="text-lg font-bold text-teal-600 dark:text-teal-400">{adherence.percentage}%</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Calorie Trend */}
                <div className="bg-white dark:bg-slate-800 p-5 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-2 mb-4">
                        <TrendingUp className="text-teal-500" size={20} />
                        <h3 className="font-semibold text-slate-700 dark:text-slate-200">Calorie Trend</h3>
                    </div>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart data={calorieData}>
                                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                                <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                                <YAxis tick={{ fontSize: 12 }} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Legend />
                                <Bar dataKey="calories" fill="#2dd4bf" name="Consumed" radius={[4, 4, 0, 0]} />
                                <Line type="monotone" dataKey="target" stroke="#ef4444" strokeDasharray="5 5" name="Target" dot={false} strokeWidth={2} />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Macromutrient Balance */}
                <div className="bg-white dark:bg-slate-800 p-5 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-2 mb-4">
                        <Activity className="text-indigo-500" size={20} />
                        <h3 className="font-semibold text-slate-700 dark:text-slate-200">Macro Balance</h3>
                    </div>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={macroData} stacked>
                                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                                <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                                <YAxis tick={{ fontSize: 12 }} />
                                <Tooltip
                                    cursor={{ fill: 'transparent' }}
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Legend />
                                <Bar dataKey="protein" stackId="a" fill="#3b82f6" name="Protein (g)" />
                                <Bar dataKey="carbs" stackId="a" fill="#14b8a6" name="Carbs (g)" />
                                <Bar dataKey="fats" stackId="a" fill="#eab308" name="Fats (g)" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Weight Trend */}
                <div className="bg-white dark:bg-slate-800 p-5 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-2 mb-4">
                        <Calendar className="text-pink-500" size={20} />
                        <h3 className="font-semibold text-slate-700 dark:text-slate-200">Weight Trend</h3>
                    </div>
                    <div className="h-64">
                        {weightData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={weightData}>
                                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                                    <XAxis dataKey="day" tick={{ fontSize: 12 }} domain={['dataMin', 'dataMax']} />
                                    <YAxis domain={['auto', 'auto']} tick={{ fontSize: 12 }} />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Line type="monotone" dataKey="weight" stroke="#ec4899" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} name="Weight (kg)" />
                                </LineChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-full text-slate-400">
                                No weight data recorded this month
                            </div>
                        )}
                    </div>
                </div>

                {/* Goal Adherence */}
                <div className="bg-white dark:bg-slate-800 p-5 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-2 mb-4">
                        <Target className="text-emerald-500" size={20} />
                        <h3 className="font-semibold text-slate-700 dark:text-slate-200">Goal Adherence</h3>
                    </div>
                    <div className="h-64 flex items-center justify-center">
                        {adherence.logged_days > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={adherenceData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {adherenceData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend verticalAlign="bottom" height={36} />
                                    <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="fill-slate-700 dark:fill-slate-200 font-bold text-lg">
                                        {adherence.percentage}%
                                    </text>
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="text-slate-400 text-center">
                                <p>No data logged yet</p>
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default MonthlyDashboard;
