import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { register } from '../api';
import { Lock, User, CheckCircle, Mail, ArrowRight, Utensils } from 'lucide-react';

const Register = () => {
    const [formData, setFormData] = useState({ username: '', email: '', password: '', confirm_password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirm_password) {
            setError("Passwords don't match");
            return;
        }

        setLoading(true);

        try {
            const res = await register(formData);
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('username', res.data.username);

            // Default to dark mode or system preference if we want, 
            // but let's respect what Login does (or doesn't do).
            // Since this is a new user, maybe defaults are fine.

            window.location.href = '/dashboard';
        } catch (err) {
            setError(err.response?.data?.error || 'Registration failed.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-6 transition-colors duration-300 relative overflow-hidden">

            {/* Background Decorations */}
            <div className="absolute top-0 right-0 translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-200/20 dark:bg-emerald-900/10 rounded-full blur-3xl opacity-50 pointer-events-none" />
            <div className="absolute bottom-0 left-0 -translate-x-1/2 translate-y-1/2 w-96 h-96 bg-teal-200/20 dark:bg-teal-900/10 rounded-full blur-3xl opacity-50 pointer-events-none" />

            <div className="bg-white dark:bg-slate-800 p-8 md:p-10 rounded-3xl shadow-2xl w-full max-w-md relative z-10 border border-slate-100 dark:border-slate-700 transition-colors duration-300">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-tr from-teal-500 to-emerald-500 mb-4 shadow-lg shadow-teal-500/30">
                        <Utensils className="w-6 h-6 text-white" />
                    </div>
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Create Account</h2>
                    <p className="text-slate-500 dark:text-slate-400">Join us to start your transformation</p>
                </div>

                {error && (
                    <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-xl mb-6 text-sm flex items-center justify-center border border-red-100 dark:border-red-900/30">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Username</label>
                        <div className="relative group">
                            <input
                                type="text"
                                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all text-slate-900 dark:text-white placeholder:text-slate-400"
                                placeholder="Choose a username"
                                value={formData.username}
                                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                required
                            />
                            <User className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-teal-500 transition-colors" size={20} />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Email</label>
                        <div className="relative group">
                            <input
                                type="email"
                                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all text-slate-900 dark:text-white placeholder:text-slate-400"
                                placeholder="Enter your email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                required
                            />
                            <Mail className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-teal-500 transition-colors" size={20} />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Password</label>
                        <div className="relative group">
                            <input
                                type="password"
                                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all text-slate-900 dark:text-white placeholder:text-slate-400"
                                placeholder="Create a password"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                required
                            />
                            <Lock className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-teal-500 transition-colors" size={20} />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Confirm Password</label>
                        <div className="relative group">
                            <input
                                type="password"
                                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all text-slate-900 dark:text-white placeholder:text-slate-400"
                                placeholder="Confirm your password"
                                value={formData.confirm_password}
                                onChange={(e) => setFormData({ ...formData, confirm_password: e.target.value })}
                                required
                            />
                            <CheckCircle className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-teal-500 transition-colors" size={20} />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full group bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white py-3.5 rounded-xl font-bold shadow-lg shadow-teal-500/20 hover:shadow-teal-500/30 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-6"
                    >
                        {loading ? 'Creating Account...' : (
                            <>
                                Sign Up <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </>
                        )}
                    </button>
                </form>

                <p className="mt-8 text-center text-slate-600 dark:text-slate-400 text-sm">
                    Already have an account? <Link to="/login" className="text-teal-600 dark:text-teal-400 font-bold hover:underline hover:text-teal-700 dark:hover:text-teal-300 transition-colors">Login</Link>
                </p>
            </div>

            {/* Simple footer for auth pages */}
            <div className="absolute bottom-6 text-slate-400 dark:text-slate-600 text-xs text-center w-full pointer-events-none">
                © {new Date().getFullYear()} Fit Guide AI. Join Us.
            </div>
        </div>
    );
};

export default Register;
