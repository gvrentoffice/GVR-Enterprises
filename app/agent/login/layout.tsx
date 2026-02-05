'use client';

import { ManifestLink } from '@/components/ManifestLink';

export default function AgentLoginLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // Standalone layout for login page - no sidebar, no navigation
    // This overrides the parent agent layout
    return (
        <>
            <ManifestLink />
            <div className="min-h-screen w-full">
                {children}
            </div>
        </>
    );
}
