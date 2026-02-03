import {
    doc,
    updateDoc,
    getDoc,
    Timestamp
} from 'firebase/firestore';
import { db } from '../config';
import { Agent, Lead } from '../schema';
// @ts-ignore
import bcrypt from 'bcryptjs';

/**
 * Set User MPIN (4-6 digit PIN)
 */
export async function setUserMpin(
    userId: string,
    collectionName: 'agents' | 'leads',
    plainTextMpin: string
): Promise<{ success: boolean; error?: string }> {
    try {
        // Validate MPIN format (4-6 digits)
        if (!/^\d{4,6}$/.test(plainTextMpin)) {
            return { success: false, error: 'MPIN must be 4-6 digits' };
        }

        // Hash MPIN using bcrypt
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(plainTextMpin, salt);

        // Update user document
        await updateDoc(doc(db, collectionName, userId), {
            mpin: hash,
            updatedAt: Timestamp.now(),
            authPreferences: {
                enableMpinLogin: true,
                enableBiometricLogin: true // Keep biometric enabled
            }
        });

        return { success: true };
    } catch (error) {
        console.error('Error setting MPIN:', error);
        return { success: false, error: 'Failed to set MPIN' };
    }
}

/**
 * Verify User MPIN
 */
export async function verifyUserMpin(
    userId: string,
    collectionName: 'agents' | 'leads',
    plainTextMpin: string
): Promise<boolean> {
    try {
        const userDoc = await getDoc(doc(db, collectionName, userId));
        if (!userDoc.exists()) return false;

        const userData = userDoc.data() as Agent | Lead;
        if (!userData.mpin) return false;

        return await bcrypt.compare(plainTextMpin, userData.mpin);
    } catch (error) {
        console.error('Error verifying MPIN:', error);
        return false;
    }
}

/**
 * Check if user has MPIN set up
 */
export async function checkUserHasMpin(
    userId: string,
    collectionName: 'agents' | 'leads'
): Promise<boolean> {
    try {
        const userDoc = await getDoc(doc(db, collectionName, userId));
        if (!userDoc.exists()) return false;

        const userData = userDoc.data() as Agent | Lead;
        return !!userData.mpin;
    } catch (error) {
        console.error('Error checking MPIN:', error);
        return false;
    }
}
