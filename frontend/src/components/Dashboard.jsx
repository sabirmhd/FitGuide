import React, { useEffect, useState } from 'react';
import { getDashboardSummary, deleteFoodLog } from '../api';
import { Plus, Trash2, Home, UtensilsCrossed, Sparkles } from 'lucide-react';
import FoodSearchModal from './FoodSearchModal';
import WeeklyProgress from './WeeklyProgress';
import DietSuggestionsModal from './DietSuggestionsModal';

const Dashboard = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDietModalOpen, setIsDietModalOpen] = useState(false);

    const fetchData = async () => {
        try {
            const res = await getDashboardSummary();
            setData(res.data);
        } catch (error) {
            console.error("Failed to load dashboard", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    if (loading) return <div className="text-center py-20">Loading...</div>;

    const percentage = Math.min(100, Math.round((data.consumed_calories / data.target_calories) * 100));

    // Dynamic Macro Targets (Example split: 30% Protein, 40% Carbs, 30% Fats)
    const targetProtein = Math.round((data.target_calories * 0.30) / 4);
    const targetCarbs = Math.round((data.target_calories * 0.40) / 4);
    const targetFats = Math.round((data.target_calories * 0.30) / 9);

    return (
        <div>
            {/* Hero Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* Calorie Ring */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm col-span-1 md:col-span-1 flex flex-col items-center justify-center relative overflow-hidden transition-colors duration-300">
                    <div className="relative w-48 h-48 flex items-center justify-center">
                        <svg className="w-full h-full" viewBox="0 0 100 100">
                            <circle cx="50" cy="50" r="45" fill="none" stroke="#e2e8f0" strokeWidth="10" className="dark:stroke-slate-700 transition-colors duration-300" />
                            <circle
                                cx="50" cy="50" r="45"
                                fill="none" stroke="#0d9488" strokeWidth="10"
                                strokeDasharray="283"
                                strokeDashoffset={283 - (283 * percentage) / 100}
                                transform="rotate(-90 50 50)"
                                className="transition-all duration-1000 ease-out"
                            />
                        </svg>
                        <div className="absolute text-center">
                            <span className="block text-4xl font-bold text-slate-800 dark:text-slate-100 transition-colors duration-300">{data.remaining_calories > 0 ? Math.round(data.remaining_calories) : 0}</span>
                            <span className="text-xs text-slate-500 dark:text-slate-400 uppercase font-semibold transition-colors duration-300">Remaining</span>
                        </div>
                    </div>
                    <div className="mt-4 text-center">
                        <p className="text-slate-500 dark:text-slate-400 transition-colors duration-300">Target: {Math.round(data.target_calories)} • Eaten: {data.consumed_calories}</p>
                    </div>
                </div>

                {/* Macros & Actions */}
                <div className="col-span-1 md:col-span-2 flex flex-col gap-6">
                    <div className="bg-teal-900 dark:bg-teal-950 text-white p-8 rounded-2xl shadow-lg relative overflow-hidden transition-colors duration-300">
                        <div className="absolute right-0 top-0 opacity-10 transform translate-x-10 -translate-y-10">
                            <UtensilsCrossed size={200} />
                        </div>
                        <h2 className="text-2xl font-bold mb-2">Track your meals</h2>
                        <p className="opacity-80 mb-6 max-w-md">Use our AI-powered search to instantly analyze food and log it to your daily diary.</p>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="bg-white text-teal-900 dark:bg-slate-100 px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-teal-50 transition shadow-lg"
                            >
                                <Plus size={20} /> Log Food
                            </button>
                            <button
                                onClick={() => setIsDietModalOpen(true)}
                                className="bg-teal-800 dark:bg-teal-900 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-teal-700 transition shadow-lg border border-teal-700 dark:border-teal-800"
                            >
                                <Sparkles size={20} /> AI Suggestions
                            </button>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 transition-colors duration-300">
                        <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-4 transition-colors duration-300">Daily Macros</h3>
                        <div className="space-y-4">
                            <MacroProgressBar
                                label="Protein"
                                current={data.macros.protein}
                                target={targetProtein}
                                color="bg-blue-500"
                                bg="bg-blue-100 dark:bg-blue-900/30"
                            />
                            <MacroProgressBar
                                label="Carbs"
                                current={data.macros.carbs}
                                target={targetCarbs}
                                color="bg-green-500"
                                bg="bg-green-100 dark:bg-green-900/30"
                            />
                            <MacroProgressBar
                                label="Fats"
                                current={data.macros.fats}
                                target={targetFats}
                                color="bg-yellow-500"
                                bg="bg-yellow-100 dark:bg-yellow-900/30"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Weekly Progress */}
            <div className="mb-8">
                <WeeklyProgress targetCalories={data.target_calories} />
            </div>

            {/* Food Log */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm p-6 transition-colors duration-300">
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4 transition-colors duration-300">Today's Meals</h3>

                {data.recent_logs.length === 0 ? (
                    <div className="text-center py-10 text-slate-400">
                        <p>No meals logged yet today.</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {data.recent_logs.map((log) => (
                            <div key={log.id} className="flex justify-between items-center p-4 border dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/50 transition bg-transparent">
                                <div className="flex items-center gap-4">
                                    <div className={`p-3 rounded-full ${log.meal_type === 'Breakfast' ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400' :
                                        log.meal_type === 'Lunch' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' :
                                            log.meal_type === 'Dinner' ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400' :
                                                'bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400'
                                        }`}>
                                        {log.meal_type[0]}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-800 dark:text-slate-100 transition-colors duration-300">{log.food_name}</h4>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 transition-colors duration-300">{log.meal_type} • {log.calories} cal</p>
                                    </div>
                                </div>
                                <div className="text-right text-sm text-slate-500 dark:text-slate-400 font-mono transition-colors duration-300">
                                    P: {log.protein}g | C: {log.carbs}g | F: {log.fats}g
                                    <button
                                        onClick={async () => {
                                            if (confirm('Are you sure you want to delete this log?')) {
                                                try {
                                                    await deleteFoodLog(log.id);
                                                    fetchData();
                                                } catch (e) {
                                                    console.error("Failed to delete log", e);
                                                }
                                            }
                                        }}
                                        className="ml-4 p-2 text-slate-400 hover:text-red-500 transition-colors"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <FoodSearchModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onFoodLogged={fetchData}
            />

            <DietSuggestionsModal
                isOpen={isDietModalOpen}
                onClose={() => setIsDietModalOpen(false)}
            />
        </div>
    );
};

const MacroProgressBar = ({ label, current, target, color, bg }) => {
    const percentage = Math.min(100, (current / target) * 100);

    return (
        <div>
            <div className="flex justify-between text-sm mb-1">
                <span className="font-medium text-slate-700 dark:text-slate-300 transition-colors duration-300">{label}</span>
                <span className="text-slate-500 dark:text-slate-400 transition-colors duration-300">{Math.round(current)} / {target}g</span>
            </div>
            <div className={`w-full h-3 ${bg} rounded-full overflow-hidden`}>
                <div
                    className={`h-full ${color} transition-all duration-500 ease-out`}
                    style={{ width: `${percentage}%` }}
                />
            </div>
        </div>
    );
};

export default Dashboard;
