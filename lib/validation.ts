/**
 * Validation and Sanitization Utilities
 * Provides security-focused validation and sanitization functions
 */

/**
 * Validate Indian phone number (10 digits)
 * Returns normalized 10-digit number or null if invalid
 */
export function validatePhoneNumber(phoneNumber: string): string | null {
    // Remove all non-digit characters
    const cleaned = phoneNumber.replace(/\D/g, '');

    // Handle country code (91)
    let normalized = cleaned;
    if (cleaned.startsWith('91') && cleaned.length > 10) {
        normalized = cleaned.slice(2);
    }

    // Validate: exactly 10 digits, starts with 6-9
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(normalized)) {
        return null;
    }

    return normalized;
}

/**
 * Format phone number for display
 */
export function formatPhoneNumber(phoneNumber: string): string {
    const validated = validatePhoneNumber(phoneNumber);
    if (!validated) return phoneNumber;

    return `+91 ${validated.slice(0, 5)} ${validated.slice(5)}`;
}

/**
 * Validate email address
 */
export function validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
}

/**
 * Sanitize string input - remove HTML tags and trim
 */
export function sanitizeString(input: string, maxLength: number = 500): string {
    return input
        .replace(/<[^>]*>/g, '') // Remove HTML tags
        .replace(/[<>]/g, '') // Remove angle brackets
        .trim()
        .slice(0, maxLength);
}

/**
 * Sanitize text for safe display (prevent XSS)
 */
export function sanitizeTextForDisplay(text: string): string {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;');
}

/**
 * Validate file type for uploads
 */
export function validateFileType(
    file: File,
    allowedTypes: string[]
): { valid: boolean; error?: string } {
    const fileType = file.type;
    const fileExtension = file.name.split('.').pop()?.toLowerCase();

    // Check MIME type
    const mimeTypeValid = allowedTypes.some(type => {
        if (type.endsWith('/*')) {
            return fileType.startsWith(type.replace('/*', ''));
        }
        return fileType === type;
    });

    // Check file extension as backup
    const allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'pdf', 'webp'];
    const extensionValid = fileExtension && allowedExtensions.includes(fileExtension);

    if (!mimeTypeValid && !extensionValid) {
        return {
            valid: false,
            error: `Invalid file type. Allowed types: ${allowedTypes.join(', ')}`
        };
    }

    return { valid: true };
}

/**
 * Validate file size
 */
export function validateFileSize(
    file: File,
    maxSizeMB: number
): { valid: boolean; error?: string } {
    const maxSizeBytes = maxSizeMB * 1024 * 1024;

    if (file.size > maxSizeBytes) {
        return {
            valid: false,
            error: `File size exceeds ${maxSizeMB}MB limit. File size: ${(file.size / 1024 / 1024).toFixed(2)}MB`
        };
    }

    return { valid: true };
}

/**
 * Comprehensive file validation
 */
export function validateFile(
    file: File,
    options: {
        allowedTypes: string[];
        maxSizeMB: number;
    }
): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    const typeCheck = validateFileType(file, options.allowedTypes);
    if (!typeCheck.valid && typeCheck.error) {
        errors.push(typeCheck.error);
    }

    const sizeCheck = validateFileSize(file, options.maxSizeMB);
    if (!sizeCheck.valid && sizeCheck.error) {
        errors.push(sizeCheck.error);
    }

    return {
        valid: errors.length === 0,
        errors
    };
}

/**
 * Validate GST number format (Indian)
 */
export function validateGSTNumber(gst: string): boolean {
    // GST format: 2 digits (state) + 10 chars (PAN) + 1 char (entity) + 1 char (Z) + 1 check digit
    const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    return gstRegex.test(gst.trim().toUpperCase());
}

/**
 * Validate PIN code (Indian 6-digit)
 */
export function validatePinCode(pinCode: string): boolean {
    const pinRegex = /^[1-9][0-9]{5}$/;
    return pinRegex.test(pinCode.trim());
}

/**
 * Validate quantity (positive integer)
 */
export function validateQuantity(quantity: number): { valid: boolean; error?: string } {
    if (!Number.isInteger(quantity)) {
        return { valid: false, error: 'Quantity must be a whole number' };
    }

    if (quantity <= 0) {
        return { valid: false, error: 'Quantity must be greater than 0' };
    }

    if (quantity > 10000) {
        return { valid: false, error: 'Quantity exceeds maximum limit (10,000)' };
    }

    return { valid: true };
}

/**
 * Validate price (positive number)
 */
export function validatePrice(price: number): { valid: boolean; error?: string } {
    if (typeof price !== 'number' || isNaN(price)) {
        return { valid: false, error: 'Price must be a valid number' };
    }

    if (price < 0) {
        return { valid: false, error: 'Price cannot be negative' };
    }

    if (price > 10000000) {
        return { valid: false, error: 'Price exceeds maximum limit' };
    }

    return { valid: true };
}

/**
 * Rate limiting helper - simple in-memory store
 * For production, use Redis or similar distributed cache
 */
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(
    identifier: string,
    maxAttempts: number,
    windowMs: number
): { allowed: boolean; remainingAttempts: number; resetAt: number } {
    const now = Date.now();
    const record = rateLimitStore.get(identifier);

    // Clean up expired entries periodically
    if (Math.random() < 0.01) {
        for (const [key, value] of rateLimitStore.entries()) {
            if (value.resetAt < now) {
                rateLimitStore.delete(key);
            }
        }
    }

    if (!record || record.resetAt < now) {
        // Create new record
        const resetAt = now + windowMs;
        rateLimitStore.set(identifier, { count: 1, resetAt });
        return {
            allowed: true,
            remainingAttempts: maxAttempts - 1,
            resetAt
        };
    }

    if (record.count >= maxAttempts) {
        return {
            allowed: false,
            remainingAttempts: 0,
            resetAt: record.resetAt
        };
    }

    // Increment count
    record.count++;
    rateLimitStore.set(identifier, record);

    return {
        allowed: true,
        remainingAttempts: maxAttempts - record.count,
        resetAt: record.resetAt
    };
}

/**
 * Generate idempotency key for order creation
 */
export function generateIdempotencyKey(userId: string, cartHash: string): string {
    const timestamp = Math.floor(Date.now() / 60000); // 1-minute window
    return `${userId}-${cartHash}-${timestamp}`;
}

/**
 * Validate URL
 */
export function validateURL(url: string): boolean {
    try {
        const parsed = new URL(url);
        return ['http:', 'https:'].includes(parsed.protocol);
    } catch {
        return false;
    }
}
