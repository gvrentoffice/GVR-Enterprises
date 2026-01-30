"use client";

import { ReactNode } from "react";
import { useIsDesktop } from "@/lib/hooks/use-media-query";
import { SidebarLayout } from "./sidebar-layout";
import { StackedLayout } from "./stacked-layout";

interface ResponsiveLayoutProps {
    children: ReactNode;
    sidebar: ReactNode;
    bottomNav: ReactNode;
    /**
     * Force a specific layout regardless of screen size
     * - "auto": Switch based on screen size (default)
     * - "sidebar": Always use sidebar layout
     * - "stacked": Always use stacked layout
     */
    mode?: "auto" | "sidebar" | "stacked";
}

/**
 * ResponsiveLayout - Auto-switching layout wrapper
 * Automatically switches between SidebarLayout and StackedLayout based on screen size
 * 
 * Based on Unified UI Rules (Section 8):
 * - Desktop (>1024px): SidebarLayout
 * - Mobile/Tablet (<1024px): StackedLayout
 * 
 * Usage per app type:
 * - Customer Website: mode="stacked" (always mobile-first)
 * - Sales Agent Portal: mode="auto" (responsive)
 * - Admin Dashboard: mode="sidebar" (always desktop)
 */
export function ResponsiveLayout({
    children,
    sidebar,
    bottomNav,
    mode = "auto",
}: ResponsiveLayoutProps) {
    const isDesktop = useIsDesktop();

    // Determine which layout to use
    const useDesktopLayout =
        mode === "sidebar" ? true : mode === "stacked" ? false : isDesktop;

    // Render appropriate layout
    if (useDesktopLayout) {
        return <SidebarLayout sidebar={sidebar}>{children}</SidebarLayout>;
    }

    return <StackedLayout bottomNav={bottomNav}>{children}</StackedLayout>;
}
