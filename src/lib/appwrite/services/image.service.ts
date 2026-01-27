/**
 * Image Upload Service
 * Handles file uploads, image processing, and storage operations
 */

import { storage, APPWRITE_CONFIG } from '../config';
import { ID } from 'appwrite';

export const imageUploadService = {
    /**
     * Upload a file (payment proof, commission proof, etc.) to Appwrite Storage
     * @param file - The file to upload
     * @param folder - Optional folder name for organization
     * @returns URL of the uploaded file
     */
    async uploadImage(file: File, folder?: string): Promise<string> {
        try {
            console.log('📤 uploadImage started, file:', file.name, 'Size:', file.size, 'Folder:', folder);
            
            // Generate unique filename with optional folder prefix
            const fileName = folder ? `${folder}/${Date.now()}_${file.name}` : `${Date.now()}_${file.name}`;
            
            console.log('📁 Uploading file:', fileName);
            console.log('☁️ Uploading to Appwrite Storage...');
            console.log('Bucket ID:', APPWRITE_CONFIG.bucketId);
            
            // Upload to Appwrite Storage
            const response = await storage.createFile(
                APPWRITE_CONFIG.bucketId,
                ID.unique(),
                file
            );
            
            console.log('✅ File uploaded successfully! File ID:', response.$id);
            
            // Return the file view URL
            const fileUrl = `${APPWRITE_CONFIG.endpoint}/storage/buckets/${APPWRITE_CONFIG.bucketId}/files/${response.$id}/view?project=${APPWRITE_CONFIG.projectId}`;
            console.log('🔗 Generated URL:', fileUrl);
            
            return fileUrl;
        } catch (error) {
            console.error('❌ Error uploading image:', error);
            if (error instanceof Error) {
                console.error('Error message:', error.message);
                console.error('Error stack:', error.stack);
            }
            throw error;
        }
    },

    /**
     * Upload a base64 image as profile picture
     * @param base64Image - Base64 encoded image string
     * @returns URL of the uploaded image
     */
    async uploadProfileImage(base64Image: string): Promise<string> {
        try {
            console.log('📤 uploadProfileImage started, base64 length:', base64Image.length);
            
            // Convert base64 to blob
            const base64Data = base64Image.split(',')[1];
            if (!base64Data) {
                throw new Error('Invalid base64 image format');
            }
            
            console.log('🔄 Converting base64 to blob...');
            const byteCharacters = atob(base64Data);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            const blob = new Blob([byteArray], { type: 'image/jpeg' });
            
            console.log('📦 Blob created, size:', blob.size);
            
            // Create a File object
            const fileName = `profile_${Date.now()}.jpg`;
            const file = new File([blob], fileName, { type: 'image/jpeg' });
            
            console.log('📁 File created:', fileName, 'Size:', file.size);
            console.log('☁️ Uploading to Appwrite Storage...');
            
            // Upload to Appwrite Storage
            const response = await storage.createFile(
                APPWRITE_CONFIG.bucketId,
                ID.unique(),
                file
            );
            
            console.log('✅ File uploaded successfully! File ID:', response.$id);
            
            // Return the file view URL
            const fileUrl = `${APPWRITE_CONFIG.endpoint}/storage/buckets/${APPWRITE_CONFIG.bucketId}/files/${response.$id}/view?project=${APPWRITE_CONFIG.projectId}`;
            console.log('🔗 Generated URL:', fileUrl);
            
            return fileUrl;
        } catch (error) {
            console.error('❌ Error uploading profile image:', error);
            if (error instanceof Error) {
                console.error('Error message:', error.message);
                console.error('Error stack:', error.stack);
            }
            throw error;
        }
    },

    /**
     * Upload an icon image from base64
     * @param base64Image - Base64 encoded image string
     * @returns URL of the uploaded icon
     */
    async uploadIcon(base64Image: string): Promise<string> {
        try {
            // Convert base64 to blob
            const base64Data = base64Image.split(',')[1];
            if (!base64Data) {
                throw new Error('Invalid base64 image format');
            }
            
            const byteCharacters = atob(base64Data);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            const blob = new Blob([byteArray], { type: 'image/png' });
            
            // Create a File object
            const fileName = `icon_${Date.now()}.png`;
            const file = new File([blob], fileName, { type: 'image/png' });
            
            // Upload to Appwrite Storage
            const response = await storage.createFile(
                APPWRITE_CONFIG.bucketId,
                ID.unique(),
                file
            );
            
            // Return the file view URL
            const fileUrl = `${APPWRITE_CONFIG.endpoint}/storage/buckets/${APPWRITE_CONFIG.bucketId}/files/${response.$id}/view?project=${APPWRITE_CONFIG.projectId}`;
            return fileUrl;
        } catch (error) {
            console.error('Error uploading icon:', error);
            throw error;
        }
    },

    /**
     * Delete a file from Appwrite Storage
     * @param fileId - The ID of the file to delete
     */
    async deleteFile(fileId: string): Promise<void> {
        try {
            await storage.deleteFile(APPWRITE_CONFIG.bucketId, fileId);
            console.log('✅ File deleted successfully:', fileId);
        } catch (error) {
            console.error('❌ Error deleting file:', error);
            throw error;
        }
    },

    /**
     * Get file download URL
     * @param fileId - The ID of the file
     * @returns Download URL
     */
    getFileUrl(fileId: string): string {
        return `${APPWRITE_CONFIG.endpoint}/storage/buckets/${APPWRITE_CONFIG.bucketId}/files/${fileId}/view?project=${APPWRITE_CONFIG.projectId}`;
    },

    /**
     * Get file download URL for download
     * @param fileId - The ID of the file
     * @returns Download URL
     */
    getDownloadUrl(fileId: string): string {
        return `${APPWRITE_CONFIG.endpoint}/storage/buckets/${APPWRITE_CONFIG.bucketId}/files/${fileId}/download?project=${APPWRITE_CONFIG.projectId}`;
    }
};