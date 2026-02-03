'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, TrendingUp, Users, ShoppingBag, User, LogOut, Package, ClipboardList, Map, MoreHorizontal, X, Trash2, Wrench } from 'lucide-react';
import { cn } from '@/lib/utils';
import { deleteSession } from '@/app/actions/auth';

const navItems = [
    { label: 'Dash', icon: LayoutDashboard, href: '/admin' },
    { label: 'Products', icon: Package, href: '/admin/products' },
    { label: 'Inventory', icon: ClipboardList, href: '/admin/inventory' },
    { label: 'Orders', icon: ShoppingBag, href: '/admin/orders' },
    { label: 'Sales', icon: TrendingUp, href: '/admin/sales' },
    { label: 'Agents', icon: Users, href: '/admin/agents' },
    { label: 'Customers', icon: User, href: '/admin/customers' },
    { label: 'Routes', icon: Map, href: '/admin/routes' },
    { label: 'Fix Products', icon: Wrench, href: '/admin/fix-products' },
    { label: 'Cleanup', icon: Trash2, href: '/admin/cleanup' },
];

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const isLoginPage = pathname === '/admin/login';
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [showMoreMenu, setShowMoreMenu] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const moreMenuRef = useRef<HTMLDivElement>(null);

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setShowProfileMenu(false);
            }
            if (moreMenuRef.current && !moreMenuRef.current.contains(event.target as Node)) {
                setShowMoreMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // First 3 items for mobile bottom nav (Profile will be first), rest in "More"
    const mobileNavItems = navItems.slice(0, 3);
    const moreNavItems = navItems.slice(3);

    const handleLogout = async () => {
        await deleteSession('admin');
        localStorage.removeItem('admin_session');
        localStorage.removeItem('isAdminLoggedIn');
        window.location.href = '/admin/login';
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 flex flex-col lg:flex-row font-sans">
            {/* Desktop Sidebar with Glassmorphism (1024px+) */}
            {!isLoginPage && (
                <aside className="w-72 hidden lg:flex flex-col fixed inset-y-0 z-50">
                    {/* Glassmorphism background */}
                    <div className="absolute inset-0 backdrop-blur-2xl bg-white/40 border-r border-white/50 shadow-2xl shadow-amber-500/10"></div>

                    {/* Content */}
                    <div className="relative z-10 flex flex-col h-full">
                        {/* Header */}
                        <div className="h-20 flex items-center px-8 border-b border-white/30">
                            <div className="flex flex-col">
                                <span className="text-xl font-black bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent tracking-tighter leading-none">
                                    RYTH BAZAR
                                </span>
                                <span className="text-[10px] font-black text-amber-600/60 uppercase tracking-[0.2em] mt-1.5 ml-0.5">
                                    Admin Panel
                                </span>
                            </div>
                        </div>

                        {/* Navigation */}
                        <nav className="flex-1 p-6 space-y-2 overflow-y-auto">
                            {navItems.map((item) => {
                                const isActive = pathname === item.href;
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={cn(
                                            "flex items-center gap-3 px-4 py-3.5 text-sm font-bold rounded-2xl transition-all duration-300 group relative overflow-hidden",
                                            isActive
                                                ? "text-white shadow-xl shadow-amber-500/30"
                                                : "text-zinc-600 hover:text-zinc-900"
                                        )}
                                    >
                                        {/* Active background gradient */}
                                        {isActive && (
                                            <div className="absolute inset-0 bg-gradient-to-r from-amber-500 to-orange-600 rounded-2xl"></div>
                                        )}
                                        {/* Hover background */}
                                        {!isActive && (
                                            <div className="absolute inset-0 bg-white/50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                        )}

                                        <item.icon className={cn(
                                            "w-5 h-5 transition-transform duration-300 group-hover:scale-110 relative z-10",
                                            isActive ? "text-white" : "text-amber-600"
                                        )} />
                                        <span className="relative z-10">{item.label === 'Dash' ? 'Dashboard' : item.label}</span>
                                        {isActive && <div className="ml-auto w-1.5 h-1.5 bg-white rounded-full relative z-10" />}
                                    </Link>
                                );
                            })}
                        </nav>

                        {/* Profile Section */}
                        <div className="p-6 border-t border-white/30">
                            <div className="backdrop-blur-xl bg-gradient-to-br from-white/60 to-white/40 rounded-2xl p-4 border border-white/50 shadow-lg">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg flex items-center justify-center text-xs font-black text-white">
                                        AD
                                    </div>
                                    <div className="flex flex-col flex-1">
                                        <p className="text-xs font-black text-zinc-900 leading-tight">Master Admin</p>
                                        <p className="text-[9px] text-amber-600 font-bold uppercase tracking-widest mt-1">Full Access</p>
                                    </div>
                                </div>
                                <button
                                    onClick={async () => {
                                        await deleteSession('admin');
                                        localStorage.removeItem('admin_session');
                                        localStorage.removeItem('isAdminLoggedIn');
                                        window.location.href = '/admin/login';
                                    }}
                                    className="mt-3 w-full flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold text-red-600 hover:bg-red-50 rounded-xl transition-colors border border-red-200 bg-white/50"
                                >
                                    <LogOut className="w-4 h-4" />
                                    Logout
                                </button>
                            </div>
                        </div>
                    </div>
                </aside>
            )}

            {/* Mobile/Tablet Header with Glassmorphism */}
            {!isLoginPage && (
                <header className="lg:hidden w-full backdrop-blur-2xl bg-white/40 border-b border-white/50 h-16 flex items-center px-6 justify-between z-40 shadow-lg">
                    <div className="flex flex-col">
                        <span className="font-black bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent tracking-tighter text-lg leading-none">
                            RYTH BAZAR
                        </span>
                        <span className="text-[9px] font-black text-amber-600/60 uppercase tracking-widest mt-1">Admin</span>
                    </div>
                    <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-[10px] font-black text-white shadow-lg">
                        AD
                    </div>
                </header>
            )}

            {/* Fixed Bottom Navigation (Mobile/Tablet) - Dark Theme */}
            {!isLoginPage && (
                <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-zinc-900 border-t border-zinc-800 shadow-2xl">
                    {/* Profile Menu Dropdown */}
                    {showProfileMenu && (
                        <div
                            ref={menuRef}
                            className="absolute bottom-full left-4 mb-2 w-48 bg-zinc-900/98 backdrop-blur-2xl border border-zinc-800 rounded-2xl shadow-2xl p-3 animate-in fade-in slide-in-from-bottom-4 duration-300"
                        >
                            <div className="flex items-center gap-3 mb-3 pb-3 border-b border-zinc-800">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-xs font-black text-white">
                                    AD
                                </div>
                                <div className="flex flex-col flex-1">
                                    <p className="text-sm font-bold text-white">Admin</p>
                                    <p className="text-[10px] text-zinc-400">Master</p>
                                </div>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center gap-2 px-3 py-2.5 text-sm font-bold text-red-400 hover:bg-red-500/10 rounded-xl transition-colors"
                            >
                                <LogOut className="w-4 h-4" />
                                Logout
                            </button>
                        </div>
                    )}

                    {/* More Menu Dropdown */}
                    {showMoreMenu && (
                        <div
                            ref={moreMenuRef}
                            className="absolute bottom-full left-0 right-0 mb-2 mx-4 bg-zinc-900/98 backdrop-blur-2xl border border-zinc-800 rounded-3xl shadow-2xl p-3 animate-in fade-in slide-in-from-bottom-4 duration-300"
                        >
                            <div className="flex items-center justify-between mb-3 px-3">
                                <h3 className="text-xs font-black text-white uppercase tracking-wider">More Options</h3>
                                <button
                                    onClick={() => setShowMoreMenu(false)}
                                    className="text-zinc-400 hover:text-white transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                {moreNavItems.map((item) => {
                                    const isActive = pathname === item.href;
                                    return (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            onClick={() => setShowMoreMenu(false)}
                                            className={cn(
                                                "flex flex-col items-center gap-2 p-3 rounded-2xl transition-all",
                                                isActive
                                                    ? "bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-lg shadow-amber-500/30"
                                                    : "bg-zinc-800/50 text-zinc-400 hover:bg-zinc-800 hover:text-white"
                                            )}
                                        >
                                            <item.icon className="w-5 h-5" />
                                            <span className="text-[10px] font-bold">{item.label}</span>
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Bottom Nav Items */}
                    <nav className="flex items-center justify-around h-16 px-2">
                        {/* Profile Icon */}
                        <button
                            onClick={() => setShowProfileMenu(!showProfileMenu)}
                            className={cn(
                                "flex flex-col items-center justify-center relative w-full py-2 transition-all duration-300",
                                showProfileMenu ? "opacity-100" : "opacity-60"
                            )}
                        >
                            <div className={cn(
                                "p-2.5 rounded-2xl transition-all duration-300",
                                showProfileMenu
                                    ? "bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-lg shadow-amber-500/30 scale-110"
                                    : "text-zinc-400"
                            )}>
                                <User className="w-5 h-5" />
                            </div>
                            <span className={cn(
                                "text-[9px] font-bold mt-1 uppercase tracking-tighter",
                                showProfileMenu ? "text-amber-500" : "text-zinc-500"
                            )}>
                                Profile
                            </span>
                        </button>
                        {mobileNavItems.map((item) => {
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={cn(
                                        "flex flex-col items-center justify-center relative w-full py-2 transition-all duration-300",
                                        isActive ? "opacity-100" : "opacity-60"
                                    )}
                                >
                                    <div className={cn(
                                        "p-2.5 rounded-2xl transition-all duration-300",
                                        isActive
                                            ? "bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-lg shadow-amber-500/30 scale-110"
                                            : "text-zinc-400"
                                    )}>
                                        <item.icon className="w-5 h-5" />
                                    </div>
                                    <span className={cn(
                                        "text-[9px] font-bold mt-1 uppercase tracking-tighter",
                                        isActive ? "text-amber-500" : "text-zinc-500"
                                    )}>
                                        {item.label}
                                    </span>
                                </Link>
                            );
                        })}

                        {/* More Button */}
                        <button
                            onClick={() => setShowMoreMenu(!showMoreMenu)}
                            className={cn(
                                "flex flex-col items-center justify-center relative w-full py-2 transition-all duration-300",
                                showMoreMenu ? "opacity-100" : "opacity-60"
                            )}
                        >
                            <div className={cn(
                                "p-2.5 rounded-2xl transition-all duration-300",
                                showMoreMenu
                                    ? "bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-lg shadow-amber-500/30 scale-110"
                                    : "text-zinc-400"
                            )}>
                                <MoreHorizontal className="w-5 h-5" />
                            </div>
                            <span className={cn(
                                "text-[9px] font-bold mt-1 uppercase tracking-tighter",
                                showMoreMenu ? "text-amber-500" : "text-zinc-500"
                            )}>
                                More
                            </span>
                        </button>
                    </nav>
                </div>
            )}

            {/* Main Content Area */}

            <main className={cn(
                "flex-1 min-h-screen",
                !isLoginPage && "lg:ml-72",
                !isLoginPage && "pb-20 lg:pb-0" // Only bottom padding for mobile/tablet bottom nav
            )}>
                <div className="p-0">
                    {children}
                </div>
            </main>
        </div >
    );
}
