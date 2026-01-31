'use server';

import { cookies } from 'next/headers';

export async function createSession(uid: string, role: string) {
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    const cookieStore = await cookies();

    // Use role-specific cookie names to prevent conflicts between different user types
    const sessionCookieName = `session_${role}`;
    const roleCookieName = `role_${role}`;

    cookieStore.set(sessionCookieName, uid, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        expires: expiresAt,
        sameSite: 'lax',
        path: '/',
    });

    cookieStore.set(roleCookieName, role, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        expires: expiresAt,
        sameSite: 'lax',
        path: '/',
    });
}

export async function deleteSession(role?: string) {
    const cookieStore = await cookies();

    if (role) {
        // Delete specific role session
        cookieStore.delete(`session_${role}`);
        cookieStore.delete(`role_${role}`);
    } else {
        // Delete all sessions (fallback for backward compatibility)
        cookieStore.delete('session');
        cookieStore.delete('role');
        cookieStore.delete('session_admin');
        cookieStore.delete('role_admin');
        cookieStore.delete('session_agent');
        cookieStore.delete('role_agent');
        cookieStore.delete('session_customer');
        cookieStore.delete('role_customer');
    }
}
