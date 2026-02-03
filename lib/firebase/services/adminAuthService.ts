// Admin authentication service with hardcoded credentials

/**
 * Admin credentials - In production, these should be in environment variables
 * For now, hardcoded as per user request
 */
const ADMIN_CREDENTIALS = {
    username: 'Nani',
    password: '9295@Nani#',
    phoneNumber: '8050181994',
    adminId: 'admin-nani-001'
};

/**
 * Verify admin login credentials
 */
export async function verifyAdminCredentials(
    username: string,
    password: string,
    phoneNumber?: string
): Promise<{ success: boolean; adminId?: string; error?: string }> {
    try {
        // Check username
        if (username !== ADMIN_CREDENTIALS.username) {
            return { success: false, error: 'Invalid username' };
        }

        // Check password
        if (password !== ADMIN_CREDENTIALS.password) {
            return { success: false, error: 'Invalid password' };
        }

        // Optional: Check phone number if provided
        if (phoneNumber) {
            const cleanPhone = phoneNumber.replace(/\D/g, '');
            const adminCleanPhone = ADMIN_CREDENTIALS.phoneNumber.replace(/\D/g, '');

            if (cleanPhone !== adminCleanPhone) {
                return { success: false, error: 'Invalid phone number' };
            }
        }

        return {
            success: true,
            adminId: ADMIN_CREDENTIALS.adminId
        };
    } catch (error) {
        console.error('Admin verification error:', error);
        return { success: false, error: 'Verification failed' };
    }
}

/**
 * Get admin details by ID
 */
export async function getAdminById(adminId: string): Promise<{
    id: string;
    username: string;
    phoneNumber: string;
    role: 'admin';
} | null> {
    try {
        if (adminId === ADMIN_CREDENTIALS.adminId) {
            return {
                id: ADMIN_CREDENTIALS.adminId,
                username: ADMIN_CREDENTIALS.username,
                phoneNumber: ADMIN_CREDENTIALS.phoneNumber,
                role: 'admin'
            };
        }
        return null;
    } catch (error) {
        console.error('Get admin error:', error);
        return null;
    }
}
