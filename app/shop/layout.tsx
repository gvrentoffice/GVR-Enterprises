"use client";

import { useState, useEffect } from "react";
import { ShoppingBag, Search, User, LogOut, Home, ClipboardList, ShoppingCart, UserCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/lib/hooks/useCart";
import { cn } from "@/lib/utils";

export default function CustomerLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { cartSize } = useCart();
    return (
        <div className="min-h-screen bg-transparent flex flex-col"> {/* Background is handled by body in globals.css */}
            {/* Minimal Header with distinct separation */}
            <header className="sticky top-0 z-40 w-full bg-white border-b border-gray-200 shadow-sm">
                <div className="container flex h-16 items-center justify-between px-4">

                    {/* Logo & Mobile Menu */}
                    <div className="flex items-center gap-2">
                        <Link href="/" className="text-xl font-bold tracking-tight text-primary">
                            Ryth Bazar
                        </Link>
                    </div>

                    {/* Search Bar (Desktop) */}
                    <div className="hidden md:flex items-center max-w-sm w-full mx-8">
                        <div className="relative w-full group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-primary transition-colors" />
                            <Input
                                type="search"
                                placeholder="Search products..."
                                className="w-full bg-gray-100/50 rounded-full pl-10 border-transparent focus:bg-white focus:border-primary/20 focus:ring-4 focus:ring-primary/10 transition-all"
                            />
                        </div>
                    </div>

                    {/* Actions */}
                    <DropdownAction cartSize={cartSize} />
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 container px-4 py-8 pb-24 md:pb-8">
                {children}
            </main>

            {/* Bottom Navigation (Mobile Only) */}
            <BottomNavigation cartSize={cartSize} />
        </div>
    );
}

function BottomNavigation({ cartSize }: { cartSize: number }) {
    const pathname = usePathname();

    const navItems = [
        { label: "Shop", href: "/shop", icon: Home },
        { label: "Orders", href: "/shop/orders", icon: ClipboardList },
        { label: "Cart", href: "/shop/cart", icon: ShoppingCart, badge: cartSize },
        { label: "Profile", href: "/shop/profile", icon: UserCircle },
    ];

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white/80 backdrop-blur-xl border-t border-gray-100 px-6 py-3 shadow-[0_-8px_30px_rgb(0,0,0,0.04)]">
            <div className="flex items-center justify-between max-w-md mx-auto">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex flex-col items-center gap-1 transition-all duration-300 relative group",
                                isActive ? "text-amber-600" : "text-gray-400 hover:text-gray-600"
                            )}
                        >
                            <div className={cn(
                                "p-2 rounded-2xl transition-all duration-300",
                                isActive ? "bg-amber-50 scale-110" : "bg-transparent group-active:scale-95"
                            )}>
                                <Icon className={cn("h-5 w-5", isActive ? "stroke-[2.5px]" : "stroke-[2px]")} />

                                {item.badge !== undefined && item.badge > 0 && (
                                    <span className="absolute top-1 right-1 h-4 w-4 rounded-full bg-amber-600 text-white text-[8px] font-black flex items-center justify-center ring-2 ring-white">
                                        {item.badge}
                                    </span>
                                )}
                            </div>
                            <span className={cn(
                                "text-[10px] font-bold tracking-tight transition-opacity duration-300",
                                isActive ? "opacity-100" : "opacity-0"
                            )}>
                                {item.label}
                            </span>

                            {isActive && (
                                <span className="absolute -bottom-1 w-1 h-1 bg-amber-600 rounded-full" />
                            )}
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}

function DropdownAction({ cartSize }: { cartSize: number }) {
    const [isOpen, setIsOpen] = useState(false);
    const [customer, setCustomer] = useState<any>(null);

    useEffect(() => {
        const saved = localStorage.getItem('customer');
        if (saved) setCustomer(JSON.parse(saved));
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('customer');
        window.location.href = '/login';
    };

    return (
        <div className="flex items-center gap-1">
            <nav className="hidden md:flex items-center gap-1 mr-2">
                <Link href="/shop" className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-primary rounded-md transition-colors font-bold">
                    Shop
                </Link>
                <Link href="/shop/orders" className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-primary rounded-md transition-colors font-bold">
                    Orders
                </Link>
            </nav>

            <div className="relative">
                <Button
                    variant="ghost"
                    size="icon"
                    className="text-gray-700 hover:text-primary transition-colors h-10 w-10 rounded-full"
                    onClick={() => setIsOpen(!isOpen)}
                >
                    {customer?.shopImageUrl ? (
                        <img src={customer.shopImageUrl} className="h-8 w-8 rounded-full object-cover border border-gray-100" />
                    ) : (
                        <User className="h-5 w-5" />
                    )}
                </Button>

                {isOpen && (
                    <>
                        <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)}></div>
                        <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-gray-100 py-2 z-20 animate-in fade-in slide-in-from-top-2 duration-200">
                            <div className="px-4 py-3 border-b border-gray-50 flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 font-bold shrink-0">
                                    {customer?.ownerName?.[0] || 'C'}
                                </div>
                                <div className="overflow-hidden">
                                    <p className="text-sm font-bold text-gray-900 truncate">
                                        {customer?.ownerName || 'Customer'}
                                    </p>
                                    <p className="text-[10px] text-gray-500 truncate">
                                        {customer?.shopName || 'Management'}
                                    </p>
                                </div>
                            </div>
                            <div className="py-2">
                                <Link
                                    href="/shop/profile"
                                    className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary transition-colors"
                                    onClick={() => setIsOpen(false)}
                                >
                                    <User className="h-4 w-4" />
                                    <span>My Profile</span>
                                </Link>
                                <Link
                                    href="/shop/orders"
                                    className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary transition-colors"
                                    onClick={() => setIsOpen(false)}
                                >
                                    <ShoppingBag className="h-4 w-4" />
                                    <span>Order History</span>
                                </Link>
                            </div>
                            <div className="border-t border-gray-50 pt-2">
                                <button
                                    onClick={handleLogout}
                                    className="flex w-full items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors font-medium"
                                >
                                    <LogOut className="h-4 w-4" />
                                    <span>Logout</span>
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>

            <Link href="/shop/cart" className="hidden md:block transition-transform active:scale-95">
                <Button variant="ghost" size="icon" className="text-gray-700 hover:text-primary transition-colors relative h-10 w-10 rounded-full">
                    <ShoppingBag className="h-5 w-5" />
                    {cartSize > 0 && (
                        <span className="absolute top-1 right-1 h-5 w-5 rounded-full bg-amber-600 text-white text-[10px] font-black flex items-center justify-center ring-2 ring-white">
                            {cartSize}
                        </span>
                    )}
                </Button>
            </Link>
        </div>
    );
}
