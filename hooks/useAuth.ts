'use client';

import { useEffect, useState, useCallback } from 'react';

import {
    registerUser,
    loginUser,
    logoutUser,
    onAuthStateChange,
} from '@/lib/firebase/auth';

export interface AuthUser {
    uid: string;
    email: string;
    displayName?: string;
    photoURL?: string;
    phoneNumber?: string;
}

export function useAuth() {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Listen for auth state changes on mount
    useEffect(() => {
        const unsubscribe = onAuthStateChange((firebaseUser) => {
            if (firebaseUser) {
                setUser({
                    uid: firebaseUser.uid,
                    email: firebaseUser.email || '',
                    displayName: firebaseUser.displayName || undefined,
                    photoURL: firebaseUser.photoURL || undefined,
                    phoneNumber: firebaseUser.phoneNumber || undefined,
                });
            } else {
                setUser(null);
            }
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    const register = useCallback(
        async (email: string, password: string) => {
            try {
                setError(null);
                setLoading(true);
                const firebaseUser = await registerUser(email, password);

                // Note: You can update profile here if needed
                // await updateProfile(firebaseUser, { displayName });

                return firebaseUser;
            } catch (err) {
                const message = err instanceof Error ? err.message : 'Registration failed';
                setError(message);
                throw err;
            } finally {
                setLoading(false);
            }
        },
        []
    );

    const login = useCallback(
        async (email: string, password: string) => {
            try {
                setError(null);
                setLoading(true);
                const firebaseUser = await loginUser(email, password);
                return firebaseUser;
            } catch (err) {
                const message = err instanceof Error ? err.message : 'Login failed';
                setError(message);
                throw err;
            } finally {
                setLoading(false);
            }
        },
        []
    );

    const logout = useCallback(async () => {
        try {
            setError(null);
            await logoutUser();
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Logout failed';
            setError(message);
            throw err;
        }
    }, []);

    const isAuthenticated = !!user;

    return {
        user,
        loading,
        error,
        register,
        login,
        logout,
        isAuthenticated,
    };
}
