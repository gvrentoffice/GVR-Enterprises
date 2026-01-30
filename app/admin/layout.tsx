'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, TrendingUp, Users, ShoppingBag, User, LogOut, Package, ClipboardList, Map } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
    { label: 'Dash', icon: LayoutDashboard, href: '/admin' },
    { label: 'Products', icon: Package, href: '/admin/products' },
    { label: 'Inventory', icon: ClipboardList, href: '/admin/inventory' },
    { label: 'Orders', icon: ShoppingBag, href: '/admin/orders' },
    { label: 'Sales', icon: TrendingUp, href: '/admin/sales' },
    { label: 'Agents', icon: Users, href: '/admin/agents' },
    { label: 'Customers', icon: User, href: '/admin/customers' },
    { label: 'Routes', icon: Map, href: '/admin/routes' },
];

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setShowProfileMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row font-sans">
            {/* Desktop Sidebar */}
            <aside className="w-68 bg-white border-r border-zinc-100 hidden md:flex flex-col fixed inset-y-0 z-50">
                <div className="h-20 flex items-center px-8 border-b border-zinc-50">
                    <div className="flex flex-col">
                        <span className="text-xl font-black text-amber-600 tracking-tighter leading-none">RYTH BAZAR</span>
                        <span className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] mt-1.5 ml-0.5">Admin Panel</span>
                    </div>
                </div>

                <nav className="flex-1 p-6 space-y-2">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-3 px-4 py-3.5 text-sm font-bold rounded-2xl transition-all duration-300 group",
                                    isActive
                                        ? "bg-amber-600 text-white shadow-xl shadow-amber-200/50"
                                        : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900"
                                )}
                            >
                                <item.icon className={cn("w-5 h-5 transition-transform duration-300 group-hover:scale-110", isActive ? "text-white" : "text-zinc-400")} />
                                {item.label === 'Dash' ? 'Dashboard' : item.label}
                                {isActive && <div className="ml-auto w-1.5 h-1.5 bg-white rounded-full" />}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-6 border-t border-zinc-50">
                    <div className="bg-zinc-50/50 rounded-2xl p-4 border border-zinc-100/50">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-xs font-black text-amber-600 border border-zinc-100">
                                AD
                            </div>
                            <div className="flex flex-col flex-1">
                                <p className="text-xs font-black text-zinc-900 leading-tight">Master Admin</p>
                                <p className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest mt-1">Full Access</p>
                            </div>
                        </div>
                        <button
                            onClick={() => {
                                localStorage.removeItem('admin_session');
                                window.location.href = '/login?role=admin';
                            }}
                            className="mt-3 w-full flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold text-red-600 hover:bg-red-50 rounded-xl transition-colors border border-red-100"
                        >
                            <LogOut className="w-4 h-4" />
                            Logout
                        </button>
                    </div>
                </div>
            </aside>

            {/* Mobile Header - NOT FIXED */}
            <header className="md:hidden w-full bg-white border-b border-zinc-100 h-16 flex items-center px-6 justify-between">
                <div className="flex flex-col">
                    <span className="font-black text-amber-600 tracking-tighter text-lg leading-none">RYTH BAZAR</span>
                    <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mt-1">Admin</span>
                </div>
                <div className="w-9 h-9 rounded-2xl bg-zinc-900 flex items-center justify-center text-[10px] font-black text-white shadow-lg shadow-zinc-200 border border-white/10">
                    AD
                </div>
            </header>

            {/* Bottom Navigation (Mobile) */}
            <div className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 w-[92%] max-w-sm z-[60]" ref={menuRef}>
                {/* Profile Dropdown Menu */}
                {showProfileMenu && (
                    <div className="absolute bottom-20 right-0 w-48 bg-zinc-900/95 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl p-2 mb-2 animate-in fade-in slide-in-from-bottom-4 duration-300 ring-1 ring-black/20">
                        <Link
                            href="/admin/profile"
                            className="flex items-center gap-3 px-4 py-3 text-xs font-bold text-white hover:bg-white/10 rounded-2xl transition-colors"
                            onClick={() => setShowProfileMenu(false)}
                        >
                            <User className="w-4 h-4 text-amber-500" />
                            Admin Profile
                        </Link>
                        <button
                            className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold text-red-400 hover:bg-red-400/10 rounded-2xl transition-colors"
                            onClick={() => {
                                localStorage.removeItem('admin_session');
                                window.location.href = '/login?role=admin';
                            }}
                        >
                            <LogOut className="w-4 h-4" />
                            Logout
                        </button>
                    </div>
                )}

                <nav className="bg-zinc-900/95 backdrop-blur-2xl border border-white/10 h-18 rounded-[2.5rem] flex items-center px-4 shadow-2xl ring-1 ring-black/20 overflow-x-auto scrollbar-hide">
                    <div className="flex items-center justify-around min-w-max gap-1">
                        {navItems.map((item) => {
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={cn(
                                        "flex flex-col items-center justify-center relative w-12 h-12 transition-all duration-500",
                                        isActive ? "opacity-100" : "opacity-40"
                                    )}
                                >
                                    <div className={cn(
                                        "p-2.5 rounded-2xl transition-all duration-500",
                                        isActive ? "bg-amber-500 text-white shadow-lg shadow-amber-500/20 scale-110" : "text-white"
                                    )}>
                                        <item.icon className="w-5 h-5" />
                                    </div>
                                </Link>
                            )
                        })}

                        {/* Profile Button */}
                        <button
                            onClick={() => setShowProfileMenu(!showProfileMenu)}
                            className={cn(
                                "flex flex-col items-center justify-center relative w-12 h-12 transition-all duration-500",
                                showProfileMenu ? "opacity-100" : "opacity-40"
                            )}
                        >
                            <div className={cn(
                                "p-2.5 rounded-2xl transition-all duration-500",
                                showProfileMenu ? "bg-zinc-700 text-white scale-110" : "text-white"
                            )}>
                                <User className="w-5 h-5" />
                            </div>
                        </button>
                    </div>
                </nav>
            </div>

            {/* Main Content Area */}
            <main className={cn(
                "flex-1 md:ml-68 min-h-screen",
                "pb-32 md:pb-0" // Extra padding for the floating bottom nav
            )}>
                <div className="p-0">
                    {children}
                </div>
            </main>
        </div>
    );
}
