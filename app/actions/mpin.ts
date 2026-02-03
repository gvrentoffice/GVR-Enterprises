'use server';

import { setUserMpin, verifyUserMpin, checkUserHasMpin } from '@/lib/firebase/services/mpinService';

export async function setMpinAction(
    userId: string,
    userType: 'agent' | 'customer',
    mpin: string
): Promise<{ success: boolean; error?: string }> {
    try {
        const collectionName = userType === 'agent' ? 'agents' : 'leads';
        const result = await setUserMpin(userId, collectionName, mpin);
        return result;
    } catch (error) {
        console.error('Set MPIN action error:', error);
        return { success: false, error: 'Failed to set MPIN' };
    }
}

export async function verifyMpinAction(
    userId: string,
    userType: 'agent' | 'customer',
    mpin: string
): Promise<boolean> {
    try {
        const collectionName = userType === 'agent' ? 'agents' : 'leads';
        return await verifyUserMpin(userId, collectionName, mpin);
    } catch (error) {
        console.error('Verify MPIN action error:', error);
        return false;
    }
}

export async function checkMpinStatusAction(
    userId: string,
    userType: 'agent' | 'customer'
): Promise<boolean> {
    try {
        const collectionName = userType === 'agent' ? 'agents' : 'leads';
        return await checkUserHasMpin(userId, collectionName);
    } catch (error) {
        console.error('Check MPIN status action error:', error);
        return false;
    }
}
