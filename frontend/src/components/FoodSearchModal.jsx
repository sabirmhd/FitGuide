import React, { useState } from 'react';
import { Search, Plus, X, Loader2, Flame, Utensils } from 'lucide-react';
import { searchFood, logFood } from '../api';

const FoodSearchModal = ({ isOpen, onClose, onFoodLogged }) => {
    const [query, setQuery] = useState('');
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [logging, setLogging] = useState(false);
    const [mealType, setMealType] = useState('Snack');

    if (!isOpen) return null;

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!query.trim()) return;

        setLoading(true);
        setResult(null);
        try {
            const res = await searchFood(query);
            setResult(res.data);
        } catch (error) {
            console.error("Search failed", error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogFood = async () => {
        if (!result) return;
        setLogging(true);
        try {
            await logFood({
                food_name: result.food_name,
                calories: result.estimated_calories,
                protein: result.protein_g,
                carbs: result.carbs_g,
                fats: result.fats_g,
                meal_type: mealType
            });
            onFoodLogged();
            onClose();
            // Reset state
            setQuery('');
            setResult(null);
        } catch (error) {
            console.error("Logging failed", error);
        } finally {
            setLogging(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden transition-colors duration-300">
                {/* Header */}
                <div className="p-4 border-b dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-800">
                    <h3 className="font-bold text-lg text-slate-700 dark:text-slate-200">Add Food</h3>
                    <button onClick={onClose} className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full">
                        <X size={20} className="text-slate-500 dark:text-slate-400" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6">
                    <form onSubmit={handleSearch} className="mb-6">
                        <div className="relative">
                            <input
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="e.g. 2 slices of pepperoni pizza"
                                className="w-full pl-10 pr-4 py-3 border dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none bg-white dark:bg-slate-700 dark:text-white placeholder-slate-400"
                                autoFocus
                            />
                            <Search className="absolute left-3 top-3.5 text-slate-400" size={20} />
                        </div>
                        <button
                            type="submit"
                            disabled={loading || !query}
                            className="mt-3 w-full bg-teal-600 dark:bg-teal-700 text-white py-2 rounded-lg font-medium hover:bg-teal-700 dark:hover:bg-teal-600 transition disabled:opacity-50"
                        >
                            {loading ? <Loader2 className="animate-spin mx-auto" /> : 'Analyze with AI'}
                        </button>
                    </form>

                    {result && (
                        <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-5 border border-slate-100 dark:border-slate-700">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h4 className="font-bold text-xl text-slate-800 dark:text-slate-100 capitalize">{result.food_name}</h4>
                                    <p className="text-slate-500 dark:text-slate-400 text-sm">AI Estimate</p>
                                </div>
                                <div className="bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-400 px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1">
                                    <Flame size={14} /> {result.estimated_calories} cal
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-2 mb-6">
                                <MacroItem label="Protein" value={result.protein_g} color="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400" />
                                <MacroItem label="Carbs" value={result.carbs_g} color="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400" />
                                <MacroItem label="Fats" value={result.fats_g} color="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400" />
                            </div>

                            <div className="mb-4">
                                <label className="block text-xs font-semibold uppercase text-slate-500 dark:text-slate-400 mb-2">Meal Type</label>
                                <div className="flex gap-2">
                                    {['Breakfast', 'Lunch', 'Dinner', 'Snack'].map(type => (
                                        <button
                                            key={type}
                                            onClick={() => setMealType(type)}
                                            className={`px-3 py-1 rounded-full text-sm border ${mealType === type ? 'bg-teal-600 text-white border-teal-600 dark:border-teal-600' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
                                        >
                                            {type}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <button
                                onClick={handleLogFood}
                                disabled={logging}
                                className="w-full bg-slate-900 dark:bg-slate-950 text-white py-3 rounded-xl font-bold hover:bg-slate-800 dark:hover:bg-black transition flex items-center justify-center gap-2"
                            >
                                {logging ? <Loader2 className="animate-spin" /> : <><Plus size={18} /> Add to Diary</>}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const MacroItem = ({ label, value, color }) => (
    <div className={`p-2 rounded-lg text-center ${color}`}>
        <span className="block text-lg font-bold">{value}g</span>
        <span className="text-xs uppercase opacity-75">{label}</span>
    </div>
);

export default FoodSearchModal;
