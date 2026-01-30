'use client';

import { createContext, useContext, ReactNode } from 'react';
import { useAuth, type AuthUser } from '@/hooks/useAuth';

interface AuthContextType {
    user: AuthUser | null;
    loading: boolean;
    error: string | null;
    register: (email: string, password: string, displayName?: string) => Promise<any>;
    login: (email: string, password: string) => Promise<any>;
    logout: () => Promise<void>;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const auth = useAuth();

    return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuthContext must be used within AuthProvider');
    }
    return context;
}
