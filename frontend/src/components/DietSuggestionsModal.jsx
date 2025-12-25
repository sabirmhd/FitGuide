import React, { useEffect, useState } from 'react';
import { getDietSuggestions } from '../api';
import { X, ChefHat, Sparkles } from 'lucide-react';

const DietSuggestionsModal = ({ isOpen, onClose }) => {
    const [suggestions, setSuggestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (isOpen) {
            setLoading(true);
            setError(null);
            fetchSuggestions();
        }
    }, [isOpen]);

    const fetchSuggestions = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await getDietSuggestions();
            setSuggestions(res.data);
        } catch (err) {
            setError("Failed to generate suggestions. Please try again.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-lg shadow-2xl relative max-h-[90vh] overflow-y-auto transition-colors duration-300">
                <button
                    onClick={onClose}
                    className="absolute right-4 top-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition"
                >
                    <X size={20} />
                </button>

                <div className="p-8">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="bg-purple-100 dark:bg-purple-900/40 p-3 rounded-full text-purple-600 dark:text-purple-400">
                            <Sparkles size={24} />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">AI Diet Suggestions</h2>
                    </div>

                    <p className="text-slate-500 dark:text-slate-400 mb-6">
                        Based on your remaining calories and macro targets, here are some smart food choices for you.
                    </p>

                    {loading ? (
                        <div className="py-12 text-center">
                            <div className="w-12 h-12 border-4 border-purple-200 dark:border-purple-900 border-t-purple-600 dark:border-t-purple-400 rounded-full animate-spin mx-auto mb-4"></div>
                            <p className="text-slate-500 dark:text-slate-400 animate-pulse">Consulting the AI Nutritionist...</p>
                        </div>
                    ) : error ? (
                        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-xl text-center">
                            {error}
                            <button
                                onClick={fetchSuggestions}
                                className="block mx-auto mt-2 text-sm font-bold underline"
                            >
                                Try Again
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {suggestions.map((item, index) => (
                                <div key={index} className="border border-slate-100 dark:border-slate-700 rounded-xl p-4 hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:border-purple-200 dark:hover:border-purple-800 transition group">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="font-bold text-slate-800 dark:text-slate-100 text-lg">{item.food_name}</h3>
                                        <span className="bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-1 rounded text-xs font-bold">
                                            {item.calories} cal
                                        </span>
                                    </div>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">{item.reason}</p>
                                    <div className="flex gap-3 text-xs font-mono text-slate-400 dark:text-slate-500">
                                        <span className="group-hover:text-purple-600 dark:group-hover:text-purple-400">P: {item.protein}g</span>
                                        <span className="group-hover:text-purple-600 dark:group-hover:text-purple-400">C: {item.carbs}g</span>
                                        <span className="group-hover:text-purple-600 dark:group-hover:text-purple-400">F: {item.fats}g</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DietSuggestionsModal;
