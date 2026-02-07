'use server';

import { verifyAdminCredentials } from '@/lib/firebase/services/adminAuthService';

export async function verifyAdminAction(
    username: string,
    password: string,
    phoneNumber?: string
): Promise<{ success: boolean; adminId?: string; error?: string; customToken?: string }> {
    try {
        const result = await verifyAdminCredentials(username, password, phoneNumber);

        if (result.success && result.adminId) {
            // Try to generate custom token for Firebase Auth
            try {
                const token = await generateFirebaseCustomToken(result.adminId);
                if (token) {
                    return { ...result, customToken: token };
                }
            } catch (tokenError) {
                console.warn('Custom token generation unavailable:', tokenError);
                // Continue without token - still works with modified Firestore rules
            }
        }

        return result;
    } catch (error) {
        console.error('Admin verification action error:', error);
        return { success: false, error: 'Verification failed' };
    }
}

/**
 * Generate Firebase custom token for admin
 * Requires Firebase Admin SDK to be installed
 */
async function generateFirebaseCustomToken(adminId: string): Promise<string | null> {
    try {
        // Only attempt if credentials are available
        if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_PRIVATE_KEY) {
            return null;
        }

        // Dynamically import firebase-admin
        const admin = await import('firebase-admin');

        // Initialize if not already done
        if (admin.apps.length === 0) {
            admin.initializeApp({
                credential: admin.credential.cert({
                    projectId: process.env.FIREBASE_PROJECT_ID,
                    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
                }),
            });
        }

        // Create custom token with admin claims
        const customToken = await admin.auth().createCustomToken(adminId, {
            admin: true,
            isAdmin: true,
            role: 'admin',
        });

        return customToken;
    } catch (error) {
        console.warn('Failed to generate custom token (firebase-admin may not be installed):', error);
        return null;
    }
}
