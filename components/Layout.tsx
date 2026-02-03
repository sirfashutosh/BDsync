import React from 'react';
import { useAuth } from './AuthContext';
import { Briefcase, LogOut, AlertCircle, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './ui/Button';
import { Logo } from './ui/Logo';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user, logout, isDemo } = useAuth();

    return (
        <div className="min-h-screen relative overflow-hidden text-slate-900 font-sans selection:bg-brand-200 selection:text-brand-900">

            {/* Dynamic Animated Background */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-brand-200/40 rounded-full blur-[100px] animate-blob mix-blend-multiply opacity-70"></div>
                <div className="absolute top-[20%] right-[-10%] w-[400px] h-[400px] bg-purple-200/40 rounded-full blur-[100px] animate-blob animation-delay-2000 mix-blend-multiply opacity-70"></div>
                <div className="absolute bottom-[-10%] left-[20%] w-[600px] h-[600px] bg-pink-200/30 rounded-full blur-[100px] animate-blob animation-delay-4000 mix-blend-multiply opacity-70"></div>
            </div>

            <div className="relative z-10 flex flex-col min-h-screen">
                {/* Floating Glass Navbar */}
                {user && (
                    <nav className="sticky top-4 z-50 px-4 md:px-8 max-w-7xl mx-auto w-full">
                        <div className="glass-panel rounded-2xl p-3 flex items-center justify-between shadow-lg shadow-black/5">

                            <div className="flex items-center gap-3 pl-2 flex-shrink-0">
                                <Logo />

                                {isDemo && (
                                    <div className="ml-4 flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full text-amber-700 text-xs font-bold shadow-sm">
                                        <AlertCircle className="w-3 h-3" />
                                        <span>Demo Mode</span>
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center gap-4 pr-2">
                                <div className="text-right hidden sm:block">
                                    <p className="text-sm font-bold text-slate-800">{user?.displayName}</p>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{user?.role}</p>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={logout}
                                    className="rounded-full w-10 h-10 p-0 text-slate-400 hover:text-red-500 hover:bg-red-50"
                                    title="Sign Out"
                                >
                                    <LogOut className="w-5 h-5" />
                                </Button>
                            </div>

                        </div>
                    </nav>
                )}

                {/* Main Content Area */}
                <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full">
                    {children}
                </main>
            </div>
        </div>
    );
};
