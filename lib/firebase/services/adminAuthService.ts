// Admin authentication service with environment-based credentials

/**
 * Admin credentials - Loaded from environment variables for security
 * IMPORTANT: Change these in production!
 */
const ADMIN_CREDENTIALS = {
    username: process.env.ADMIN_USERNAME || 'admin',
    password: process.env.ADMIN_PASSWORD || '',
    phoneNumber: process.env.ADMIN_PHONE || '',
    adminId: process.env.ADMIN_ID || 'admin-001'
};

// Validate environment variables at startup
if (!process.env.ADMIN_PASSWORD || process.env.ADMIN_PASSWORD.length < 8) {
    console.error('CRITICAL: ADMIN_PASSWORD not set or too weak in environment variables!');
}
if (!process.env.ADMIN_PHONE) {
    console.error('CRITICAL: ADMIN_PHONE not set in environment variables!');
}

/**
 * Verify admin login credentials
 * Uses generic error messages to prevent user enumeration
 */
export async function verifyAdminCredentials(
    username: string,
    password: string,
    phoneNumber?: string
): Promise<{ success: boolean; adminId?: string; error?: string }> {
    try {
        // Validate all credentials together to prevent timing attacks
        let isValid = true;

        // Check username
        if (username !== ADMIN_CREDENTIALS.username) {
            isValid = false;
        }

        // Check password
        if (password !== ADMIN_CREDENTIALS.password) {
            isValid = false;
        }

        // Optional: Check phone number if provided
        if (phoneNumber) {
            const cleanPhone = phoneNumber.replace(/\D/g, '');
            const adminCleanPhone = ADMIN_CREDENTIALS.phoneNumber.replace(/\D/g, '');

            if (cleanPhone !== adminCleanPhone) {
                isValid = false;
            }
        }

        // Return generic error message to prevent user enumeration
        if (!isValid) {
            return { success: false, error: 'Invalid credentials' };
        }

        return {
            success: true,
            adminId: ADMIN_CREDENTIALS.adminId
        };
    } catch (error) {
        console.error('Admin verification error:', error);
        return { success: false, error: 'Authentication failed' };
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
