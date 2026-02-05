'use client';

import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { Home, Map, ShoppingCart, Users, BarChart3, User, LogOut } from 'lucide-react';
import { useAuthContext } from '@/app/AuthContext';
import { OfflineIndicator } from '@/components/OfflineIndicator';
import { deleteSession } from '@/app/actions/auth';
import { ManifestLink } from '@/components/ManifestLink';

export default function AgentLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user } = useAuthContext();
    const pathname = usePathname();
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Check if we're on the login page
    const isLoginPage = pathname === '/agent/login';

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsProfileOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <>
            <ManifestLink />
            <div className={`min-h-screen bg-gradient-to-br from-zinc-50 via-amber-50/30 to-orange-50/20 font-inter ${!isLoginPage ? 'pb-20' : ''}`}>
                <main className="container mx-auto px-4 py-8">
                {children}
            </main>

            <OfflineIndicator />

            {/* Bottom Navigation Bar - Hidden on login page */}
            {!isLoginPage && (
                <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
                    <div className="flex justify-around items-center h-20 px-1 max-w-2xl mx-auto">
                        <Link href="/agent" className="flex flex-col items-center justify-center w-full py-2 text-gray-400 hover:text-amber-600 transition-colors">
                            <Home className="w-5 h-5 mb-1" />
                            <span className="text-[9px] font-bold uppercase tracking-tighter">Home</span>
                        </Link>

                        <Link href="/agent/routes" className="flex flex-col items-center justify-center w-full py-2 text-gray-400 hover:text-amber-600 transition-colors">
                            <Map className="w-5 h-5 mb-1" />
                            <span className="text-[9px] font-bold uppercase tracking-tighter">Routes</span>
                        </Link>

                        <Link href="/agent/orders/create" className="relative flex flex-col items-center justify-center w-full">
                            <div className="absolute -top-8 bg-gradient-to-br from-amber-500 to-amber-600 p-3.5 rounded-2xl shadow-lg shadow-amber-500/40 border-4 border-white transition-transform active:scale-90">
                                <ShoppingCart className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-[9px] font-black uppercase tracking-tighter mt-9 text-amber-600">New Order</span>
                        </Link>

                        <Link href="/agent/customers" className="flex flex-col items-center justify-center w-full py-2 text-gray-400 hover:text-amber-600 transition-colors">
                            <Users className="w-5 h-5 mb-1" />
                            <span className="text-[9px] font-bold uppercase tracking-tighter">Customers</span>
                        </Link>

                        {/* Profile & Dropdown */}
                        <div className="relative flex flex-col items-center justify-center w-full py-2" ref={dropdownRef}>
                            <button
                                onClick={() => setIsProfileOpen(!isProfileOpen)}
                                className={`flex flex-col items-center justify-center w-full transition-colors ${isProfileOpen ? 'text-amber-600' : 'text-gray-400 hover:text-amber-600'}`}
                            >
                                <div className={`w-5 h-5 rounded-full flex items-center justify-center overflow-hidden mb-1 ${isProfileOpen ? 'ring-2 ring-amber-500 ring-offset-2' : ''}`}>
                                    <User className="w-5 h-5" />
                                </div>
                                <span className="text-[9px] font-bold uppercase tracking-tighter">Profile</span>
                            </button>

                            <AnimatePresence>
                                {isProfileOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: -20, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                        className="absolute bottom-full right-0 mb-2 w-56 bg-white rounded-2xl shadow-2xl border border-gray-100 py-2 z-[60] overflow-hidden"
                                    >
                                        <div className="px-4 py-3 border-b border-gray-50 bg-gray-50/50">
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Agent Panel</p>
                                            <p className="font-bold text-gray-900 truncate text-sm">{user?.displayName || 'Sales Agent'}</p>
                                        </div>
                                        <div className="p-1">
                                            <Link href="/agent/profile" onClick={() => setIsProfileOpen(false)}>
                                                <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-700 hover:bg-amber-50 hover:text-amber-700 transition-colors font-bold text-sm cursor-pointer">
                                                    <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                                                        <User className="w-4 h-4" />
                                                    </div>
                                                    Agent Profile
                                                </div>
                                            </Link>

                                            <Link href="/agent/orders" onClick={() => setIsProfileOpen(false)}>
                                                <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-700 hover:bg-amber-50 hover:text-amber-700 transition-colors font-bold text-sm cursor-pointer">
                                                    <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                                                        <BarChart3 className="w-4 h-4" />
                                                    </div>
                                                    Order History
                                                </div>
                                            </Link>

                                            <div
                                                onClick={async () => {
                                                    await deleteSession('agent');
                                                    localStorage.removeItem('agent_whatsapp_session');
                                                    window.location.href = '/agent/login';
                                                }}
                                                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-600 hover:bg-red-50 transition-colors font-bold text-sm cursor-pointer"
                                            >
                                                <div className="w-8 h-8 rounded-lg bg-red-100/50 flex items-center justify-center">
                                                    <LogOut className="w-4 h-4" />
                                                </div>
                                                Logout
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </nav>
            )}
            </div>
        </>
    );
}
