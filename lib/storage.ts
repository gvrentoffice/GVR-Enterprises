import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from './firebase/config';
import { validateFile, sanitizeString } from './validation';

/**
 * Upload an image to Firebase Storage with validation
 * @param file - The file to upload
 * @param path - The storage path (e.g., 'leads/shop-images')
 * @param options - Optional validation parameters
 * @returns The download URL of the uploaded file
 */
export async function uploadImage(
    file: File,
    path: string,
    options?: {
        maxSizeMB?: number;
        allowedTypes?: string[];
    }
): Promise<string> {
    try {
        // Default validation options
        const maxSizeMB = options?.maxSizeMB || 5;
        const allowedTypes = options?.allowedTypes || ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

        // Validate file before upload
        const validation = validateFile(file, { maxSizeMB, allowedTypes });
        if (!validation.valid) {
            throw new Error(`File validation failed: ${validation.errors.join(', ')}`);
        }

        // Sanitize filename to prevent path traversal
        const safeName = sanitizeString(file.name.replace(/[^a-zA-Z0-9.-]/g, '_'), 100);
        const timestamp = Date.now();
        const filename = `${timestamp}-${safeName}`;

        // Validate path to prevent directory traversal
        const safePath = path.replace(/\.\./g, '').replace(/\/\//g, '/');
        const storageRef = ref(storage, `${safePath}/${filename}`);

        // Upload the file
        const snapshot = await uploadBytes(storageRef, file);

        // Get and return the download URL
        const downloadURL = await getDownloadURL(snapshot.ref);
        return downloadURL;
    } catch (error) {
        console.error('Error uploading image:', error);
        if (error instanceof Error) {
            throw error;
        }
        throw new Error('Failed to upload image');
    }
}

/**
 * Upload multiple images to Firebase Storage with validation
 * @param files - Array of files to upload
 * @param path - The storage path
 * @param options - Optional validation parameters
 * @returns Array of download URLs
 */
export async function uploadMultipleImages(
    files: File[],
    path: string,
    options?: {
        maxSizeMB?: number;
        allowedTypes?: string[];
    }
): Promise<string[]> {
    try {
        if (files.length > 10) {
            throw new Error('Maximum 10 files allowed per upload');
        }

        const uploadPromises = files.map((file) => uploadImage(file, path, options));
        return await Promise.all(uploadPromises);
    } catch (error) {
        console.error('Error uploading multiple images:', error);
        if (error instanceof Error) {
            throw error;
        }
        throw new Error('Failed to upload images');
    }
}

/**
 * Upload a document (PDF or image) to Firebase Storage with validation
 * @param file - The file to upload
 * @param path - The storage path
 * @returns The download URL of the uploaded file
 */
export async function uploadDocument(file: File, path: string): Promise<string> {
    return uploadImage(file, path, {
        maxSizeMB: 10,
        allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf']
    });
}
