'use server';

import { cookies } from 'next/headers';

// Session configuration
const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

export async function createSession(uid: string, role: string) {
    const expiresAt = new Date(Date.now() + SESSION_DURATION);
    const cookieStore = await cookies();

    // Use role-specific cookie names to prevent conflicts between different user types
    const sessionCookieName = `session_${role}`;
    const roleCookieName = `role_${role}`;

    // Secure cookie configuration
    const cookieOptions = {
        httpOnly: true,
        secure: true, // Always use secure flag (HTTPS required in production)
        expires: expiresAt,
        sameSite: 'strict' as const, // Strict CSRF protection
        path: '/',
    };

    cookieStore.set(sessionCookieName, uid, cookieOptions);
    cookieStore.set(roleCookieName, role, cookieOptions);
}

export async function getSession(role: string): Promise<{ uid: string; role: string } | null> {
    try {
        const cookieStore = await cookies();
        const sessionCookieName = `session_${role}`;
        const roleCookieName = `role_${role}`;

        const uid = cookieStore.get(sessionCookieName)?.value;
        const userRole = cookieStore.get(roleCookieName)?.value;

        if (!uid || !userRole || userRole !== role) {
            return null;
        }

        return { uid, role: userRole };
    } catch (error) {
        console.error('Error getting session:', error);
        return null;
    }
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

/**
 * Comprehensive logout - clears all sessions and returns client-side cleanup instructions
 */
export async function logout(): Promise<{ success: boolean; clearLocalStorage: string[] }> {
    try {
        // Delete all session cookies
        await deleteSession(); // Clear all role sessions

        // Return list of localStorage keys to clear on client side
        return {
            success: true,
            clearLocalStorage: [
                'isAdminLoggedIn',
                'adminId',
                'agent_whatsapp_session',
                'customer',
                'cart', // Clear cart on logout for security
            ]
        };
    } catch (error) {
        console.error('Error during logout:', error);
        return {
            success: false,
            clearLocalStorage: []
        };
    }
}
