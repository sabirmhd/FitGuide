import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { login } from '../api';
import { Lock, User, ArrowRight, Utensils } from 'lucide-react';

const Login = () => {
    const [formData, setFormData] = useState({ username: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await login(formData);
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('username', res.data.username);

            // Check if user has theme preference saved, usually handled in Layout or LandingPage
            // We can check if previous pages set it or default to system/light
            // ensuring consistency
            const storedTheme = localStorage.getItem('theme');
            if (storedTheme === 'dark') {
                document.documentElement.classList.add('dark');
            }

            window.location.href = '/dashboard'; // Hard reload/redirect
        } catch (err) {
            setError(err.response?.data?.non_field_errors?.[0] || 'Login failed. Please check credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-6 transition-colors duration-300 relative overflow-hidden">

            {/* Background Decorations */}
            <div className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-teal-200/20 dark:bg-teal-900/10 rounded-full blur-3xl opacity-50 pointer-events-none" />
            <div className="absolute bottom-0 right-0 translate-x-1/2 translate-y-1/2 w-96 h-96 bg-emerald-200/20 dark:bg-emerald-900/10 rounded-full blur-3xl opacity-50 pointer-events-none" />

            <div className="bg-white dark:bg-slate-800 p-8 md:p-10 rounded-3xl shadow-2xl w-full max-w-md relative z-10 border border-slate-100 dark:border-slate-700 transition-colors duration-300">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-tr from-teal-500 to-emerald-500 mb-4 shadow-lg shadow-teal-500/30">
                        <Utensils className="w-6 h-6 text-white" />
                    </div>
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Welcome Back</h2>
                    <p className="text-slate-500 dark:text-slate-400">Sign in to continue your healthy journey</p>
                </div>

                {error && (
                    <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-xl mb-6 text-sm flex items-center justify-center border border-red-100 dark:border-red-900/30">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Username</label>
                        <div className="relative group">
                            <input
                                type="text"
                                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all text-slate-900 dark:text-white placeholder:text-slate-400"
                                placeholder="Enter your username"
                                value={formData.username}
                                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                required
                            />
                            <User className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-teal-500 transition-colors" size={20} />
                        </div>
                    </div>

                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Password</label>
                            <Link to="/forgot-password" className="text-xs font-medium text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 transition-colors">Forgot password?</Link>
                        </div>
                        <div className="relative group">
                            <input
                                type="password"
                                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all text-slate-900 dark:text-white placeholder:text-slate-400"
                                placeholder="Enter your password"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                required
                            />
                            <Lock className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-teal-500 transition-colors" size={20} />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full group bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white py-3.5 rounded-xl font-bold shadow-lg shadow-teal-500/20 hover:shadow-teal-500/30 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {loading ? 'Logging in...' : (
                            <>
                                Sign In <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </>
                        )}
                    </button>
                </form>

                <p className="mt-8 text-center text-slate-600 dark:text-slate-400 text-sm">
                    Don't have an account? <Link to="/register" className="text-teal-600 dark:text-teal-400 font-bold hover:underline hover:text-teal-700 dark:hover:text-teal-300 transition-colors">Create an account</Link>
                </p>
            </div>

            {/* Simple footer for auth pages */}
            <div className="absolute bottom-6 text-slate-400 dark:text-slate-600 text-xs text-center w-full pointer-events-none">
                © {new Date().getFullYear()} Fit Guide AI. Secure Login.
            </div>
        </div>
    );
};

export default Login;
