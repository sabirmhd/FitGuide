import React, { useState, useEffect, useMemo } from 'react';
import { getProfile, updateProfile } from '../api';
import { Activity, Scale, Zap, User, Edit2, Save, X, Bell } from 'lucide-react';

const ProfilePage = () => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        age: '',
        height_cm: '',
        weight_kg: ''
    });

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const res = await getProfile();
            setProfile(res.data);
            setFormData({
                age: res.data.age,
                height_cm: res.data.height_cm,
                weight_kg: res.data.weight_kg
            });
        } catch (err) {
            console.error(err);
            setError("Failed to load profile.");
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async () => {
        try {
            await updateProfile(formData);
            await fetchProfile();
            setIsEditing(false);
        } catch (err) {
            console.error(err);
            // Handle error UI if needed
        }
    };

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
            tdee: Math.round(profile.tdee || bmr * 1.2)
        };
    }, [profile]);

    if (loading) return <div className="text-center py-20">Loading profile...</div>;
    if (error) return <div className="text-center py-20 text-red-500">{error}</div>;

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="flex items-center gap-3 mb-2">
                <div className="p-3 bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 rounded-xl">
                    <User size={24} />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-white">My Profile</h2>
                    <p className="text-slate-500 dark:text-slate-400">Manage your personal details and view health stats.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Basic Details Card */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-slate-800 dark:text-white">Personal Details</h3>
                        <button
                            onClick={() => setIsEditing(!isEditing)}
                            className="text-teal-600 hover:text-teal-700 dark:text-teal-400 font-medium text-sm flex items-center gap-1"
                        >
                            {isEditing ? <><X size={16} /> Cancel</> : <><Edit2 size={16} /> Edit</>}
                        </button>
                    </div>

                    <div className="space-y-4">
                        <div className="flex justify-between py-2 border-b border-slate-50 dark:border-slate-700">
                            <span className="text-slate-500 dark:text-slate-400">Name</span>
                            <span className="font-medium text-slate-800 dark:text-white">{profile.username}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-slate-50 dark:border-slate-700">
                            <span className="text-slate-500 dark:text-slate-400">Gender</span>
                            <span className="font-medium text-slate-800 dark:text-white">{profile.gender}</span>
                        </div>

                        {isEditing ? (
                            <>
                                <div className="flex justify-between items-center py-2 border-b border-slate-50 dark:border-slate-700">
                                    <label className="text-slate-500 dark:text-slate-400">Age</label>
                                    <input
                                        type="number"
                                        value={formData.age}
                                        onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                                        className="w-24 p-1 text-right rounded border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                                    />
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-slate-50 dark:border-slate-700">
                                    <label className="text-slate-500 dark:text-slate-400">Height (cm)</label>
                                    <input
                                        type="number"
                                        value={formData.height_cm}
                                        onChange={(e) => setFormData({ ...formData, height_cm: e.target.value })}
                                        className="w-24 p-1 text-right rounded border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                                    />
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-slate-50 dark:border-slate-700">
                                    <label className="text-slate-500 dark:text-slate-400">Weight (kg)</label>
                                    <input
                                        type="number"
                                        value={formData.weight_kg}
                                        onChange={(e) => setFormData({ ...formData, weight_kg: e.target.value })}
                                        className="w-24 p-1 text-right rounded border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                                    />
                                </div>
                                <button
                                    onClick={handleUpdate}
                                    className="w-full mt-4 bg-teal-600 text-white py-2 rounded-lg font-medium hover:bg-teal-700 transition flex items-center justify-center gap-2"
                                >
                                    <Save size={16} /> Save Changes
                                </button>
                            </>
                        ) : (
                            <>
                                <div className="flex justify-between py-2 border-b border-slate-50 dark:border-slate-700">
                                    <span className="text-slate-500 dark:text-slate-400">Age</span>
                                    <span className="font-medium text-slate-800 dark:text-white">{profile.age} years</span>
                                </div>
                                <div className="flex justify-between py-2 border-b border-slate-50 dark:border-slate-700">
                                    <span className="text-slate-500 dark:text-slate-400">Height</span>
                                    <span className="font-medium text-slate-800 dark:text-white">{profile.height_cm} cm</span>
                                </div>
                                <div className="flex justify-between py-2 border-b border-slate-50 dark:border-slate-700">
                                    <span className="text-slate-500 dark:text-slate-400">Weight</span>
                                    <span className="font-medium text-slate-800 dark:text-white">{profile.weight_kg} kg</span>
                                </div>
                            </>
                        )}
                        <div className="flex justify-between py-2 border-b border-slate-50 dark:border-slate-700">
                            <span className="text-slate-500 dark:text-slate-400">Activity Level</span>
                            <span className="font-medium text-slate-800 dark:text-white">{profile.activity_level}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-slate-50 dark:border-slate-700">
                            <span className="text-slate-500 dark:text-slate-400">Goal</span>
                            <span className="font-medium text-slate-800 dark:text-white">{profile.goal}</span>
                        </div>
                    </div>
                </div>

                {/* Health Stats Card (from Modal) */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-6">
                    <h3 className="font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                        <Activity className="text-teal-600 dark:text-teal-400" size={20} /> Health Stats
                    </h3>

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
                </div>

                {/* Notifications Setting */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-6 md:col-span-2">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                                <Bell size={20} className="text-teal-600 dark:text-teal-400" /> Meal Reminders
                            </h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                Receive notifications everyday if you haven't logged any meals.
                            </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={profile.reminders_enabled}
                                onChange={async (e) => {
                                    const enabled = e.target.checked;
                                    if (enabled && Notification.permission !== 'granted') {
                                        await Notification.requestPermission();
                                    }
                                    const updated = { ...profile, reminders_enabled: enabled };
                                    setProfile(updated); // Optimistic UI
                                    try {
                                        await updateProfile({ reminders_enabled: enabled });
                                    } catch (err) {
                                        console.error("Failed to update reminder setting");
                                        setProfile(profile); // Revert
                                    }
                                }}
                            />
                            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300 dark:peer-focus:ring-teal-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-teal-600"></div>
                        </label>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
