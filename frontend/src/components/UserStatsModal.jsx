import React, { useMemo } from 'react';
import { X, Activity, Scale, Zap } from 'lucide-react';

const UserStatsModal = ({ isOpen, onClose, profile }) => {

    const stats = useMemo(() => {
        if (!profile) return { bmi: 0, bmiCategory: '', bmiColor: '', bmr: 0, tdee: 0 };
        const heightM = profile.height_cm / 100;
        const bmiValue = profile.weight_kg / (heightM * heightM);
        const bmi = bmiValue.toFixed(1);

        // BMI Category
        let bmiCategory = '';
        let bmiColor = '';
        if (bmi < 18.5) { bmiCategory = 'Underweight'; bmiColor = 'text-blue-500'; }
        else if (bmi < 24.9) { bmiCategory = 'Normal Weight'; bmiColor = 'text-green-500'; }
        else if (bmi < 29.9) { bmiCategory = 'Overweight'; bmiColor = 'text-orange-500'; }
        else { bmiCategory = 'Obese'; bmiColor = 'text-red-500'; }

        // BMR Calculation (Mifflin-St Jeor)
        let bmr = 0;
        if (profile.gender === 'Male') {
            bmr = (10 * profile.weight_kg) + (6.25 * profile.height_cm) - (5 * profile.age) + 5;
        } else {
            bmr = (10 * profile.weight_kg) + (6.25 * profile.height_cm) - (5 * profile.age) - 161;
        }

        return {
            bmi,
            bmiCategory,
            bmiColor,
            bmr: Math.round(bmr),
            tdee: Math.round(profile.tdee || bmr * 1.2) // Fallback if TDEE missing
        };
    }, [profile]);

    if (!isOpen || !profile) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-md shadow-2xl relative animate-in fade-in zoom-in duration-200">
                <button
                    onClick={onClose}
                    className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition"
                >
                    <X size={20} />
                </button>

                <div className="p-8">
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                        <Activity className="text-teal-600 dark:text-teal-400" /> Your Health Stats
                    </h2>

                    <div className="space-y-6">
                        {/* BMI Section */}
                        <div className="bg-slate-50 dark:bg-slate-700/50 p-5 rounded-xl border border-slate-100 dark:border-slate-700">
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-2">
                                    <Scale size={18} className="text-blue-500" /> BMI
                                </h3>
                                <span className={`font-bold px-3 py-1 rounded-full text-xs bg-white dark:bg-slate-800 border dark:border-slate-600 shadow-sm ${stats.bmiColor}`}>
                                    {stats.bmiCategory}
                                </span>
                            </div>
                            <div className="flex items-end gap-2">
                                <span className="text-3xl font-bold text-slate-800 dark:text-white">{stats.bmi}</span>
                                <span className="text-sm text-slate-500 dark:text-slate-400 mb-1">kg/m²</span>
                            </div>
                            <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">Body Mass Index indicates if you are at a healthy weight.</p>
                        </div>

                        {/* Energy Section */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-slate-50 dark:bg-slate-700/50 p-5 rounded-xl border border-slate-100 dark:border-slate-700">
                                <h3 className="font-semibold text-slate-700 dark:text-slate-200 text-sm mb-1 flex items-center gap-1">
                                    <Zap size={16} className="text-yellow-500" /> BMR
                                </h3>
                                <div className="flex items-end gap-1">
                                    <span className="text-2xl font-bold text-slate-800 dark:text-white">{stats.bmr}</span>
                                    <span className="text-xs text-slate-500 dark:text-slate-400 mb-1">kcal</span>
                                </div>
                                <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">Basal Metabolic Rate</p>
                            </div>

                            <div className="bg-slate-50 dark:bg-slate-700/50 p-5 rounded-xl border border-slate-100 dark:border-slate-700">
                                <h3 className="font-semibold text-slate-700 dark:text-slate-200 text-sm mb-1 flex items-center gap-1">
                                    <Activity size={16} className="text-orange-500" /> TDEE
                                </h3>
                                <div className="flex items-end gap-1">
                                    <span className="text-2xl font-bold text-slate-800 dark:text-white">{stats.tdee}</span>
                                    <span className="text-xs text-slate-500 dark:text-slate-400 mb-1">kcal</span>
                                </div>
                                <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">Total Daily Expenditure</p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 text-center text-xs text-slate-400 dark:text-slate-500">
                        Based on your profile: {profile.age} years, {profile.height_cm}cm, {profile.weight_kg}kg
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserStatsModal;
