'use server';

import { verifyAdminCredentials } from '@/lib/firebase/services/adminAuthService';

export async function verifyAdminAction(
    username: string,
    password: string,
    phoneNumber?: string
): Promise<{ success: boolean; adminId?: string; error?: string }> {
    try {
        const result = await verifyAdminCredentials(username, password, phoneNumber);
        return result;
    } catch (error) {
        console.error('Admin verification action error:', error);
        return { success: false, error: 'Verification failed' };
    }
}
