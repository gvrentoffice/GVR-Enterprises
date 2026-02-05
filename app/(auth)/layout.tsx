'use client';

import { ManifestLink } from '@/components/ManifestLink';

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <>
            <ManifestLink />
            {children}
        </>
    );
}
