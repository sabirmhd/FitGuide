import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Activity, Utensils, Brain, Zap, ChevronRight, CheckCircle2, Sun, Moon } from 'lucide-react';

const LandingPage = () => {
    const navigate = useNavigate();
    const [isDarkMode, setIsDarkMode] = useState(() => {
        if (localStorage.getItem('theme') === 'dark') {
            return true;
        }
        return false;
    });

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
             navigate('/dashboard');
        }
    }, [navigate]);

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

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-900 dark:text-slate-50 font-sans selection:bg-teal-100 selection:text-teal-900 overflow-x-hidden transition-colors duration-300">
      {/* Navigation */}
      <nav className="fixed w-full z-50 bg-slate-50/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/50 dark:border-slate-800/50 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="bg-gradient-to-tr from-teal-500 to-emerald-500 p-2 rounded-lg">
                <Utensils className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-teal-600 to-emerald-600">
                Fit Guide
              </span>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={toggleTheme}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-600 dark:text-slate-400"
                title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
              >
                {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              <Link to="/login" className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-medium transition-colors">
                Log in
              </Link>
              <Link
                to="/register"
                className="bg-slate-900 dark:bg-teal-600 text-white px-5 py-2 rounded-full font-medium hover:bg-slate-800 dark:hover:bg-teal-700 transition-all hover:shadow-lg active:scale-95"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        {/* Background Blobs */}
        <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 w-96 h-96 bg-teal-200/30 dark:bg-teal-900/20 rounded-full blur-3xl opacity-50" />
        <div className="absolute bottom-0 left-0 translate-y-12 -translate-x-12 w-96 h-96 bg-emerald-200/30 dark:bg-emerald-900/20 rounded-full blur-3xl opacity-50" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 dark:bg-teal-900/30 border border-teal-100 dark:border-teal-800 text-teal-700 dark:text-teal-400 text-sm font-medium mb-6 animate-fade-in-up">
              <Zap className="w-4 h-4" />
              <span>AI-Powered Nutrition Tracking</span>
            </div>
            <h1 className="text-5xl lg:text-7xl font-bold tracking-tight mb-8 text-slate-900 dark:text-white">
              Eat smarter, <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-teal-500 via-emerald-500 to-teal-500 animate-gradient-x">
                live better.
              </span>
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-400 mb-10 leading-relaxed max-w-2xl mx-auto">
              Transform your health with personalized diet plans, AI-driven insights, and effortless tracking. 
              The all-in-one platform for your nutritional journey.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/register"
                className="group w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 text-base font-bold text-white bg-gradient-to-r from-teal-600 to-emerald-600 rounded-full hover:shadow-xl hover:shadow-teal-500/20 transition-all active:scale-95"
              >
                Start Your Journey
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link 
                to="/login"
                className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 text-base font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full hover:bg-slate-50 dark:hover:bg-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-all"
              >
                Log in
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 bg-white dark:bg-slate-900/50 relative transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Everything you need to succeed</h2>
            <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              We've packed DietPlanner with powerful tools to help you reach your goals faster and easier than ever before.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Brain className="w-8 h-8 text-indigo-500" />,
                title: "AI Analysis",
                desc: "Get intelligent food suggestions and nutritional breakdowns powered by advanced AI.",
                color: "bg-indigo-50 border-indigo-100 dark:bg-indigo-900/20 dark:border-indigo-900/50"
              },
              {
                icon: <Activity className="w-8 h-8 text-rose-500" />,
                title: "Progress Tracking",
                desc: "Visualize your weight, water intake, and calorie trends with beautiful interactive charts.",
                color: "bg-rose-50 border-rose-100 dark:bg-rose-900/20 dark:border-rose-900/50"
              },
              {
                icon: <CheckCircle2 className="w-8 h-8 text-teal-500" />,
                title: "Personalized Goals",
                desc: "Set custom targets for calories and macros. We'll help you stay on track every day.",
                color: "bg-teal-50 border-teal-100 dark:bg-teal-900/20 dark:border-teal-900/50"
              }
            ].map((feature, index) => (
              <div key={index} className={`p-8 rounded-2xl border ${feature.color} hover:shadow-lg transition-shadow duration-300`}>
                <div className="mb-6 bg-white dark:bg-slate-800 w-14 h-14 rounded-xl flex items-center justify-center shadow-sm border border-slate-100 dark:border-slate-700">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">{feature.title}</h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats/Preview Section */}
      <section className="py-24 bg-slate-50 dark:bg-slate-900 overflow-hidden transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-16 items-center">
            <div className="mb-12 lg:mb-0">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-6">
                Master your nutrition with <span className="text-teal-600 " dark:text-teal-400>precision</span>
              </h2>
              <ul className="space-y-4">
                {[
                  "Detailed macro-nutrient breakdown",
                  "Daily hydration tracking",
                  "Sleep cycle monitoring",
                  "Weekly and monthly progress reports"
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-teal-100 dark:bg-teal-900/50 flex items-center justify-center">
                      <ChevronRight className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-teal-500 to-emerald-500 rounded-2xl rotate-3 opacity-20 blur-lg"></div>
              <div className="relative bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl p-6 md:p-8">
                 {/* Abstract representation of dashboard/charts */}
                 <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="h-4 w-32 bg-slate-100 dark:bg-slate-700 rounded mb-2"></div>
                            <div className="h-8 w-16 bg-slate-200 dark:bg-slate-600 rounded"></div>
                        </div>
                        <div className="h-12 w-12 bg-teal-50 dark:bg-teal-900/30 rounded-full flex items-center justify-center">
                            <Activity className="w-6 h-6 text-teal-500" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <div className="h-2 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                            <div className="h-full w-3/4 bg-teal-500 rounded-full"></div>
                        </div>
                        <div className="flex justify-between text-xs text-slate-400">
                            <span>0 kcal</span>
                            <span>2,000 kcal</span>
                        </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                        {[1,2,3].map(i => (
                            <div key={i} className="h-24 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-slate-100 dark:border-slate-700"></div>
                        ))}
                    </div>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-12 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
             <div className="bg-slate-100 dark:bg-slate-800 p-1.5 rounded-lg">
                <Utensils className="w-5 h-5 text-slate-600 dark:text-slate-400" />
              </div>
            <span className="font-semibold text-slate-900 dark:text-white">Fit Guide</span>
          </div>
          <div className="text-slate-500 dark:text-slate-400 text-sm">
            © {new Date().getFullYear()} Fit Guide. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
