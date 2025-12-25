import React, { useState } from 'react';
import { updateProfile } from '../api';
import { ArrowRight, Check } from 'lucide-react';

const ProfileForm = ({ onProfileUpdated }) => {
    const [formData, setFormData] = useState({
        gender: 'Male',
        age: '',
        height_cm: '',
        weight_kg: '',
        activity_level: '1.2',
        goal: 'Maintain',
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await updateProfile(formData);
            onProfileUpdated();
        } catch (error) {
            console.error("Failed to update profile", error);
            alert("Error saving profile. Please check your inputs.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto bg-white dark:bg-slate-800 rounded-xl shadow-lg p-8 transition-colors duration-300">
            <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-teal-700 dark:text-teal-400">Let's Get Started!</h2>
                <p className="text-slate-500 dark:text-slate-400">Tell us about yourself to calculate your goals.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Gender</label>
                        <select name="gender" value={formData.gender} onChange={handleChange} className="w-full p-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-teal-500 bg-white dark:bg-slate-900 text-slate-900 dark:text-white outline-none">
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Age</label>
                        <input type="number" name="age" value={formData.age} onChange={handleChange} required className="w-full p-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-teal-500 bg-white dark:bg-slate-900 text-slate-900 dark:text-white outline-none placeholder:text-slate-400" placeholder="Years" />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Height (cm)</label>
                        <input type="number" name="height_cm" value={formData.height_cm} onChange={handleChange} required className="w-full p-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-teal-500 bg-white dark:bg-slate-900 text-slate-900 dark:text-white outline-none placeholder:text-slate-400" placeholder="cm" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Weight (kg)</label>
                        <input type="number" name="weight_kg" value={formData.weight_kg} onChange={handleChange} required className="w-full p-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-teal-500 bg-white dark:bg-slate-900 text-slate-900 dark:text-white outline-none placeholder:text-slate-400" placeholder="kg" />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Activity Level</label>
                    <select name="activity_level" value={formData.activity_level} onChange={handleChange} className="w-full p-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-teal-500 bg-white dark:bg-slate-900 text-slate-900 dark:text-white outline-none">
                        <option value="1.2">Sedentary (Office job)</option>
                        <option value="1.375">Light Activity (1-3 days/week)</option>
                        <option value="1.55">Moderate Activity (3-5 days/week)</option>
                        <option value="1.725">Very Active (6-7 days/week)</option>
                        <option value="1.9">Super Active (Physical job)</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Goal</label>
                    <div className="grid grid-cols-3 gap-2">
                        {['Lose', 'Maintain', 'Gain'].map((g) => (
                            <button
                                key={g}
                                type="button"
                                onClick={() => setFormData({ ...formData, goal: g })}
                                className={`py-2 px-1 text-sm rounded-lg border transition-colors ${formData.goal === g
                                    ? 'bg-teal-600 text-white border-teal-600'
                                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                                    }`}
                            >
                                {g}
                            </button>
                        ))}
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-teal-600 text-white py-3 rounded-lg font-semibold hover:bg-teal-700 transition flex items-center justify-center gap-2 mt-6"
                >
                    {loading ? 'Calculating...' : (
                        <>Create My Plan <ArrowRight size={18} /></>
                    )}
                </button>
            </form>
        </div>
    );
};

export default ProfileForm;
