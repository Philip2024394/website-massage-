/**
 * Image Upload Service
 * Handles file uploads to Appwrite Storage
 */
import { Storage, ID } from 'appwrite';
import { appwriteClient } from './appwrite.base';

const storage = new Storage(appwriteClient);

// TODO: Update with real bucket configuration
const STORAGE_CONFIG = {
  bucketId: 'your_bucket_id_here',
  endpoint: 'https://syd.cloud.appwrite.io/v1',
  projectId: '68f23b11000d25eb3664'
};

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
      console.log('Bucket ID:', STORAGE_CONFIG.bucketId);
      
      // Upload to Appwrite Storage
      const response = await storage.createFile(
        STORAGE_CONFIG.bucketId,
        ID.unique(),
        file
      );
      
      console.log('✅ File uploaded successfully! File ID:', response.$id);
      
      // Return the file view URL
      const fileUrl = `${STORAGE_CONFIG.endpoint}/storage/buckets/${STORAGE_CONFIG.bucketId}/files/${response.$id}/view?project=${STORAGE_CONFIG.projectId}`;
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
      console.log('Bucket ID:', STORAGE_CONFIG.bucketId);
      
      // Upload to Appwrite Storage
      const response = await storage.createFile(
        STORAGE_CONFIG.bucketId,
        ID.unique(),
        file
      );
      
      console.log('✅ File uploaded successfully! File ID:', response.$id);
      
      // Return the file view URL
      const fileUrl = `${STORAGE_CONFIG.endpoint}/storage/buckets/${STORAGE_CONFIG.bucketId}/files/${response.$id}/view?project=${STORAGE_CONFIG.projectId}`;
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
  }
};