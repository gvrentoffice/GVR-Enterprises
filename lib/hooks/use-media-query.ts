"use client";

import { useEffect, useState } from "react";

/**
 * useMediaQuery Hook
 * Client-side hook to detect screen size and breakpoints
 * SSR-safe with no hydration errors
 * 
 * Based on Unified UI Rules:
 * - Desktop: >1024px (Sidebar Layout)
 * - Mobile/Tablet: <1024px (Stacked Layout)
 */

export function useMediaQuery(query: string): boolean {
    const [matches, setMatches] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const mediaQuery = window.matchMedia(query);
        setMatches(mediaQuery.matches);

        const handler = (event: MediaQueryListEvent) => {
            setMatches(event.matches);
        };

        // Modern browsers
        mediaQuery.addEventListener("change", handler);

        return () => {
            mediaQuery.removeEventListener("change", handler);
        };
    }, [query]);

    // Return false during SSR to prevent hydration mismatch
    if (!mounted) {
        return false;
    }

    return matches;
}

/**
 * Breakpoint detection hooks based on Unified UI Rules
 */

export function useIsDesktop(): boolean {
    return useMediaQuery("(min-width: 1024px)");
}

export function useIsMobile(): boolean {
    return useMediaQuery("(max-width: 1023px)");
}

/**
 * Get current breakpoint name
 */
export function useBreakpoint(): "mobile" | "desktop" {
    const isDesktop = useIsDesktop();
    return isDesktop ? "desktop" : "mobile";
}
