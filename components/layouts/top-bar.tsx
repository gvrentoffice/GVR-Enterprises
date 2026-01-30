"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface TopBarProps {
    title: string;
    description?: string;
    search?: ReactNode;
    profile?: ReactNode;
    className?: string;
}

/**
 * Top Bar Component - Responsive
 * Structure: Page Title + Optional Search + Profile Dropdown
 * Design: Clean, borderless, blends with page background
 */
export function TopBar({ title, description, search, profile, className }: TopBarProps) {
    return (
        <header className={cn("px-4 py-4 md:px-6 md:py-6 lg:px-8", className)}>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                {/* Page Title & Description */}
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-zinc-900 tracking-tight">
                        {title}
                    </h1>
                    {description && (
                        <p className="text-sm text-zinc-500 mt-1">{description}</p>
                    )}
                </div>

                {/* Right Section: Search + Profile */}
                <div className="flex items-center gap-2 md:gap-4 flex-shrink-0 self-end md:self-auto">
                    {/* Hide search on mobile, show on tablet+ */}
                    {search && (
                        <div className="hidden md:block w-64 lg:w-80">
                            {search}
                        </div>
                    )}
                    {profile}
                </div>
            </div>
        </header>
    );
}
