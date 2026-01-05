import React, { useState, useEffect } from 'react';
import { Activity, User, LogOut, Droplets, Info, Scale, Dumbbell, FileText, BedDouble, Menu, X } from 'lucide-react';
import { logout } from '../api';
import { Link, useLocation } from 'react-router-dom';

const Layout = ({ children }) => {
    const username = localStorage.getItem('username') || 'User';
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const location = useLocation();

    // Theme logic removed - enforcing dark mode globally


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

    // Close menu when route changes
    useEffect(() => {
        setIsMenuOpen(false);
    }, [location]);

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

    const NavItems = ({ mobile = false }) => (
        <>
            {/* Theme toggle removed */}


            {!mobile && <div className="h-6 w-px bg-teal-500/50 hidden md:block"></div>}

            <Link to="/activity" className={`p-2 hover:bg-teal-700 dark:hover:bg-teal-800 rounded-lg transition text-teal-100 hover:text-white ${mobile ? 'flex items-center gap-3' : ''}`} title="Activity Tracker">
                <Dumbbell size={20} />
                {mobile && <span>Activity Tracker</span>}
            </Link>

            <Link to="/weight" className={`p-2 hover:bg-teal-700 dark:hover:bg-teal-800 rounded-lg transition text-teal-100 hover:text-white ${mobile ? 'flex items-center gap-3' : ''}`} title="Weight Tracker">
                <Scale size={20} />
                {mobile && <span>Weight Tracker</span>}
            </Link>


            <Link to="/water" className={`p-2 hover:bg-teal-700 dark:hover:bg-teal-800 rounded-lg transition text-teal-100 hover:text-white ${mobile ? 'flex items-center gap-3' : ''}`} title="Water Tracker">
                <Droplets size={20} />
                {mobile && <span>Water Tracker</span>}
            </Link>

            <Link to="/sleep" className={`p-2 hover:bg-teal-700 dark:hover:bg-teal-800 rounded-lg transition text-teal-100 hover:text-white ${mobile ? 'flex items-center gap-3' : ''}`} title="Sleep Tracker">
                <BedDouble size={20} />
                {mobile && <span>Sleep Tracker</span>}
            </Link>

            <Link to="/monthly-report" className={`p-2 hover:bg-teal-700 dark:hover:bg-teal-800 rounded-lg transition text-teal-100 hover:text-white ${mobile ? 'flex items-center gap-3' : ''}`} title="Monthly Report">
                <FileText size={20} />
                {mobile && <span>Monthly Report</span>}
            </Link>

            <Link
                to="/profile"
                className={`flex items-center gap-2 bg-teal-700 dark:bg-teal-900 px-3 py-1.5 rounded-full text-sm font-medium hover:bg-teal-800 transition ${mobile ? 'w-full p-2 bg-transparent dark:bg-transparent text-teal-100 hover:text-white hover:bg-teal-700 dark:hover:bg-teal-800 rounded-lg justify-start' : ''}`}
                title="My Profile"
            >
                <User size={16} className={mobile ? 'w-5 h-5' : ''} />
                <span>{username}</span>
            </Link>

            <button
                onClick={handleLogout}
                className={`p-2 hover:bg-teal-700 dark:hover:bg-teal-800 rounded-lg transition text-teal-100 hover:text-white ${mobile ? 'w-full flex items-center gap-3' : ''}`}
                title="Logout"
            >
                <LogOut size={20} />
                {mobile && <span>Logout</span>}
            </button>
        </>
    );

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-900 dark:text-slate-50 font-sans transition-colors duration-300">
            <nav className="bg-teal-600 text-white dark:bg-teal-950 shadow-md transition-colors duration-300 relative z-50">
                <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-2 hover:opacity-90 transition">
                        <div className="bg-gradient-to-tr from-teal-500 to-emerald-500 p-2 rounded-lg"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-utensils w-6 h-6 text-white" aria-hidden="true"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"></path><path d="M7 2v20"></path><path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"></path></svg></div>
                        <h1 className="text-xl font-bold tracking-tight">Fit Guide</h1>
                    </Link>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center gap-4">
                        <NavItems />
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        className="md:hidden p-2 hover:bg-teal-700 dark:hover:bg-teal-800 rounded-lg transition text-teal-100 hover:text-white"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        aria-label="Toggle menu"
                    >
                        {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>

                {/* Mobile Drawer */}
                {isMenuOpen && (
                    <div className="md:hidden absolute top-full left-0 right-0 bg-teal-600 dark:bg-teal-950 shadow-lg border-t border-teal-500/30 p-4 flex flex-col gap-2 animate-in slide-in-from-top-2 duration-200">
                        <NavItems mobile={true} />
                    </div>
                )}
            </nav>
            <main className="container mx-auto px-4 py-8">
                {children}
            </main>

            {/* Overlay to close menu when clicking outside */}
            {isMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden"
                    onClick={() => setIsMenuOpen(false)}
                    style={{ top: '80px' }} // Start below navbar roughly
                />
            )}
        </div>
    );
};

export default Layout;
