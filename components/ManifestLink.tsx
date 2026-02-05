'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

/**
 * Dynamically loads the correct PWA manifest based on the current route
 * - /admin/** → manifest-admin.json
 * - /agent/** → manifest-agent.json
 * - /shop/** or / → manifest-customer.json
 */
export function ManifestLink() {
    const pathname = usePathname();

    useEffect(() => {
        // Determine which manifest to use based on the route
        let manifestPath = '/manifest-customer.json'; // default

        if (pathname?.startsWith('/admin')) {
            manifestPath = '/manifest-admin.json';
        } else if (pathname?.startsWith('/agent')) {
            manifestPath = '/manifest-agent.json';
        } else if (pathname?.startsWith('/shop') || pathname === '/login' || pathname === '/register' || pathname === '/') {
            manifestPath = '/manifest-customer.json';
        }

        // Remove any existing manifest links
        const existingLinks = document.querySelectorAll('link[rel="manifest"]');
        existingLinks.forEach(link => link.remove());

        // Add the new manifest link
        const link = document.createElement('link');
        link.rel = 'manifest';
        link.href = manifestPath;
        document.head.appendChild(link);

        // Update theme color based on portal
        const themeColorMeta = document.querySelector('meta[name="theme-color"]');
        if (themeColorMeta) {
            themeColorMeta.setAttribute('content', '#D97706'); // Amber for all portals
        }

        return () => {
            // Cleanup on unmount
            link.remove();
        };
    }, [pathname]);

    return null; // This component doesn't render anything
}
