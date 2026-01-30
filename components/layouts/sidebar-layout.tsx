"use client";

import { ReactNode } from "react";

interface SidebarLayoutProps {
    children: ReactNode;
    sidebar: ReactNode;
}

/**
 * SidebarLayout - Desktop layout (>1024px)
 * Structure: Sidebar (fixed) + Main Content (flex-1)
 * Source: docs/notion_sync/unified_ui_rules.md
 * 
 * Note: This layout should only be used on desktop (>1024px)
 * For responsive switching, use ResponsiveLayout wrapper
 */
export function SidebarLayout({ children, sidebar }: SidebarLayoutProps) {
    return (
        <div className="flex h-screen overflow-hidden">
            {/* Sidebar - Fixed width, scrollable */}
            <aside className="w-64 h-screen flex-shrink-0 border-r border-gray-200 bg-white overflow-y-auto">
                {sidebar}
            </aside>

            {/* Main Content - Scrollable */}
            <main className="flex-1 overflow-y-auto bg-gray-50">
                {children}
            </main>
        </div>
    );
}
