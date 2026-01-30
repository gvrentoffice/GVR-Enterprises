import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    GoogleAuthProvider,
    signInWithPopup,
    User as FirebaseUser,
} from 'firebase/auth';
import { auth } from './config';

export const googleProvider = new GoogleAuthProvider();

/**
 * Register a new user
 */
export async function registerUser(
    email: string,
    password: string
): Promise<FirebaseUser> {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        return userCredential.user;
    } catch (error) {
        console.error('Registration error:', error);
        throw error;
    }
}

/**
 * Login existing user
 */
export async function loginUser(
    email: string,
    password: string
): Promise<FirebaseUser> {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        return userCredential.user;
    } catch (error) {
        console.error('Login error:', error);
        throw error;
    }
}

/**
 * Logout current user
 */
export async function logoutUser(): Promise<void> {
    try {
        await signOut(auth);
    } catch (error) {
        console.error('Logout error:', error);
        throw error;
    }
}

/**
 * Subscribe to auth state changes
 */
export function onAuthStateChange(
    callback: (user: FirebaseUser | null) => void
) {
    return onAuthStateChanged(auth, callback);
}

/**
 * Get current auth instance
 */
export function getAuth() {
    return auth;
}

/**
 * Login with Google
 */
export async function loginWithGoogle(): Promise<FirebaseUser> {
    try {
        const userCredential = await signInWithPopup(auth, googleProvider);
        return userCredential.user;
    } catch (error) {
        console.error('Google Login error:', error);
        throw error;
    }
}
