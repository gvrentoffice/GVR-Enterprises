"use client";

import { ReactNode } from "react";

interface StackedLayoutProps {
    children: ReactNode;
    bottomNav: ReactNode;
}

/**
 * StackedLayout - Mobile/Tablet layout (<1024px)
 * Structure: Stacked content + Bottom Navigation (fixed)
 * Source: docs/notion_sync/unified_ui_rules.md
 * 
 * Responsive Features:
 * - Adaptive bottom padding based on nav height
 * - Safe area support for notched devices
 */
export function StackedLayout({ children, bottomNav }: StackedLayoutProps) {
    return (
        <div className="flex flex-col min-h-screen">
            {/* Main Content - responsive padding to prevent hiding behind bottom nav */}
            <main className="flex-1 pb-16 sm:pb-20 bg-gray-50">
                {children}
            </main>

            {/* Bottom Navigation - Fixed at bottom with safe area */}
            <nav className="fixed bottom-0 left-0 right-0 w-full bg-white border-t border-gray-200 safe-bottom">
                {bottomNav}
            </nav>
        </div>
    );
}
