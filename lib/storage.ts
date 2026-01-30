import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from './firebase/config';

/**
 * Upload an image to Firebase Storage
 * @param file - The file to upload
 * @param path - The storage path (e.g., 'leads/shop-images')
 * @returns The download URL of the uploaded file
 */
export async function uploadImage(file: File, path: string): Promise<string> {
    try {
        // Create a unique filename with timestamp
        const timestamp = Date.now();
        const filename = `${timestamp}-${file.name}`;
        const storageRef = ref(storage, `${path}/${filename}`);

        // Upload the file
        const snapshot = await uploadBytes(storageRef, file);

        // Get and return the download URL
        const downloadURL = await getDownloadURL(snapshot.ref);
        return downloadURL;
    } catch (error) {
        console.error('Error uploading image:', error);
        throw new Error('Failed to upload image');
    }
}

/**
 * Upload multiple images to Firebase Storage
 * @param files - Array of files to upload
 * @param path - The storage path
 * @returns Array of download URLs
 */
export async function uploadMultipleImages(
    files: File[],
    path: string
): Promise<string[]> {
    try {
        const uploadPromises = files.map((file) => uploadImage(file, path));
        return await Promise.all(uploadPromises);
    } catch (error) {
        console.error('Error uploading multiple images:', error);
        throw new Error('Failed to upload images');
    }
}
