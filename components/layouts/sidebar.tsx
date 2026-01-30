"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { LogOut } from "lucide-react";

interface NavItem {
    label: string;
    href: string;
    icon?: React.ReactNode;
    active?: boolean;
}

interface SidebarProps {
    appName?: string;
    primaryNav: NavItem[];
    secondaryNav?: NavItem[];
    utilityNav?: NavItem[];
}

/**
 * Sidebar Navigation Component
 * Structure: Logo + Primary Menu + Secondary Menu + Utility Section
 * Design: Luxury Zinc (Zinc-900 Background, Amber-500 Accents)
 */
export function Sidebar({
    appName = "Ryth Bazar",
    primaryNav,
    secondaryNav = [],
    utilityNav = [],
}: SidebarProps) {
    return (
        <div className="flex flex-col h-full bg-zinc-900 text-white p-6 rounded-r-3xl shadow-2xl">
            {/* Logo / App Name */}
            <div className="mb-10 flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                    <span className="text-zinc-900 font-bold text-xl">R</span>
                </div>
                <h1 className="text-2xl font-bold tracking-tight">{appName}</h1>
            </div>

            {/* Primary Navigation */}
            <nav className="flex-1 space-y-8 overflow-y-auto pr-2">
                <div className="space-y-2">
                    {primaryNav.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 group font-medium",
                                item.active
                                    ? "bg-amber-500 text-zinc-900 shadow-lg shadow-amber-500/20 translate-x-1"
                                    : "text-zinc-400 hover:text-white hover:bg-zinc-800/50"
                            )}
                        >
                            {item.icon}
                            <span>{item.label}</span>
                        </Link>
                    ))}
                </div>

                {/* Secondary Navigation */}
                {secondaryNav.length > 0 && (
                    <div className="pt-4 border-t border-zinc-800">
                        <p className="px-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">
                            Management
                        </p>
                        <div className="space-y-2">
                            {secondaryNav.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={cn(
                                        "flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 font-medium",
                                        item.active
                                            ? "bg-amber-500 text-zinc-900 shadow-lg"
                                            : "text-zinc-400 hover:text-white hover:bg-zinc-800/50"
                                    )}
                                >
                                    {item.icon}
                                    <span>{item.label}</span>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </nav>

            {/* Utility Section */}
            <div className="pt-6 border-t border-zinc-800 mt-auto">
                {utilityNav.map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                            "flex items-center gap-4 px-4 py-3 rounded-xl transition-colors font-medium",
                            item.active
                                ? "bg-zinc-800 text-white"
                                : "text-zinc-400 hover:text-white hover:bg-zinc-800/50"
                        )}
                    >
                        {item.icon}
                        <span>{item.label}</span>
                    </Link>
                ))}

                <button className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-zinc-400 hover:text-red-400 hover:bg-zinc-800/50 transition-colors font-medium mt-2">
                    <LogOut className="w-5 h-5" />
                    <span>Log Out</span>
                </button>
            </div>
        </div>
    );
}
