import React, { useState, useEffect } from 'react';
import { Activity, User, LogOut, Droplets, Info, Scale, Dumbbell, Sun, Moon, FileText, BedDouble } from 'lucide-react';
import { logout } from '../api';
import { Link } from 'react-router-dom';

const Layout = ({ children }) => {
    const username = localStorage.getItem('username') || 'User';
    const [isDarkMode, setIsDarkMode] = useState(() => {
        if (localStorage.getItem('theme') === 'dark') {
            return true;
        }
        return false; // Default to light
    });

    useEffect(() => {
        if (isDarkMode) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }, [isDarkMode]);

    const toggleTheme = () => {
        setIsDarkMode(!isDarkMode);
    };

    const handleLogout = async () => {
        try {
            await logout();
        } catch (e) {
            console.error("Logout error", e);
        } finally {
            localStorage.clear();
            window.location.href = '/login';
        }
    };

    // Notification Logic
    useEffect(() => {
        const checkReminders = async () => {
            // Only run if we have permission
            if (Notification.permission !== 'granted') return;

            const now = new Date();
            const hours = now.getHours();
            const minutes = now.getMinutes();

            // Check at 1 PM (13:00) and 8 PM (20:00)
            if ((hours === 13 || hours === 20) && minutes === 0) {
                // Avoid multiple notifications in the same minute
                const lastNotified = localStorage.getItem('lastMealNotification');
                const todayStr = now.toDateString() + hours; // unique key for hour

                if (lastNotified === todayStr) return;

                try {
                    // Check if user has logged anything
                    const { getDashboardSummary, getProfile } = await import('../api');
                    const profileRes = await getProfile();

                    if (profileRes.data.reminders_enabled) {
                        const summaryRes = await getDashboardSummary();
                        if (summaryRes.data.consumed_calories === 0) {
                            new Notification("Meal Log Reminder", {
                                body: "Log what you’ve eaten today to track your calories and stay on target.",
                                icon: "/icon.png" // Optional
                            });
                            localStorage.setItem('lastMealNotification', todayStr);
                        }
                    }
                } catch (error) {
                    console.error("Error checking meal logs for reminder", error);
                }
            }
        };

        const interval = setInterval(checkReminders, 60000); // Check every minute
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-900 dark:text-slate-50 font-sans transition-colors duration-300">
            <nav className="bg-teal-600 text-white dark:bg-teal-950 shadow-md transition-colors duration-300">
                <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-2 hover:opacity-90 transition">
                        <div className="bg-gradient-to-tr from-teal-500 to-emerald-500 p-2 rounded-lg"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-utensils w-6 h-6 text-white" aria-hidden="true"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"></path><path d="M7 2v20"></path><path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"></path></svg></div>
                        <h1 className="text-xl font-bold tracking-tight">Fit Guide</h1>
                    </Link>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={toggleTheme}
                            className="p-2 hover:bg-teal-700 dark:hover:bg-teal-800 rounded-lg transition text-teal-100 hover:text-white"
                            title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
                        >
                            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                        </button>

                        <div className="h-6 w-px bg-teal-500/50 hidden md:block"></div>

                        <Link to="/activity" className="p-2 hover:bg-teal-700 dark:hover:bg-teal-800 rounded-lg transition text-teal-100 hover:text-white" title="Activity Tracker">
                            <Dumbbell size={20} />
                        </Link>

                        <Link to="/weight" className="p-2 hover:bg-teal-700 dark:hover:bg-teal-800 rounded-lg transition text-teal-100 hover:text-white" title="Weight Tracker">
                            <Scale size={20} />
                        </Link>


                        <Link to="/water" className="p-2 hover:bg-teal-700 dark:hover:bg-teal-800 rounded-lg transition text-teal-100 hover:text-white" title="Water Tracker">
                            <Droplets size={20} />
                        </Link>

                        <Link to="/sleep" className="p-2 hover:bg-teal-700 dark:hover:bg-teal-800 rounded-lg transition text-teal-100 hover:text-white" title="Sleep Tracker">
                            <BedDouble size={20} />
                        </Link>

                        <Link to="/monthly-report" className="p-2 hover:bg-teal-700 dark:hover:bg-teal-800 rounded-lg transition text-teal-100 hover:text-white" title="Monthly Report">
                            <FileText size={20} />
                        </Link>

                        <Link
                            to="/profile"
                            className="flex items-center gap-2 bg-teal-700 dark:bg-teal-900 px-3 py-1.5 rounded-full text-sm font-medium hover:bg-teal-800 transition"
                            title="My Profile"
                        >
                            <User size={16} />
                            <span>{username}</span>
                        </Link>

                        <button
                            onClick={handleLogout}
                            className="p-2 hover:bg-teal-700 dark:hover:bg-teal-800 rounded-lg transition text-teal-100 hover:text-white"
                            title="Logout"
                        >
                            <LogOut size={20} />
                        </button>
                    </div>
                </div>
            </nav>
            <main className="container mx-auto px-4 py-8">
                {children}
            </main>
        </div>
    );
};

export default Layout;
