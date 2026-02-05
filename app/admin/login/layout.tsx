'use client';

import { ManifestLink } from '@/components/ManifestLink';

export default function AdminLoginLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // Simple layout without sidebar for login page
    return (
        <>
            <ManifestLink />
            {children}
        </>
    );
}
