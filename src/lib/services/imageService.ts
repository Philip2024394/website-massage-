import { storage, ID } from '../appwrite';
import { APPWRITE_CONFIG } from '../appwrite.config';

// Main image URLs for therapist cards on HOME PAGE (stored in Appwrite)
const THERAPIST_MAIN_IMAGES = [
    'https://syd.cloud.appwrite.io/v1/storage/buckets/68f76bdd002387590584/files/68fe4181001758526d84/view?project=68f23b11000d25eb3664',
    'https://syd.cloud.appwrite.io/v1/storage/buckets/68f76bdd002387590584/files/68fe4182001d05a11a19/view?project=68f23b11000d25eb3664',
    'https://syd.cloud.appwrite.io/v1/storage/buckets/68f76bdd002387590584/files/68fe4183001a3a6fd0de/view?project=68f23b11000d25eb3664',
    'https://syd.cloud.appwrite.io/v1/storage/buckets/68f76bdd002387590584/files/68fe4184001bba3a3a9d/view?project=68f23b11000d25eb3664',
    'https://syd.cloud.appwrite.io/v1/storage/buckets/68f76bdd002387590584/files/68fe418500198158d9d3/view?project=68f23b11000d25eb3664',
    'https://syd.cloud.appwrite.io/v1/storage/buckets/68f76bdd002387590584/files/68fe41860014a143394d/view?project=68f23b11000d25eb3664',
    'https://syd.cloud.appwrite.io/v1/storage/buckets/68f76bdd002387590584/files/68fe418700130b19a410/view?project=68f23b11000d25eb3664',
    'https://syd.cloud.appwrite.io/v1/storage/buckets/68f76bdd002387590584/files/68fe4188000e00025cea/view?project=68f23b11000d25eb3664',
    'https://syd.cloud.appwrite.io/v1/storage/buckets/68f76bdd002387590584/files/68fe4189000abe1fd8d6/view?project=68f23b11000d25eb3664',
    'https://syd.cloud.appwrite.io/v1/storage/buckets/68f76bdd002387590584/files/68fe418a0008edd3281a/view?project=68f23b11000d25eb3664',
    'https://syd.cloud.appwrite.io/v1/storage/buckets/68f76bdd002387590584/files/68fe418b0007ac3e55ba/view?project=68f23b11000d25eb3664',
    'https://syd.cloud.appwrite.io/v1/storage/buckets/68f76bdd002387590584/files/68fe418c0001a5b36c2c/view?project=68f23b11000d25eb3664',
    'https://syd.cloud.appwrite.io/v1/storage/buckets/68f76bdd002387590584/files/68fe418c0039995990e9/view?project=68f23b11000d25eb3664',
    'https://syd.cloud.appwrite.io/v1/storage/buckets/68f76bdd002387590584/files/68fe418d00337f9be339/view?project=68f23b11000d25eb3664',
    'https://syd.cloud.appwrite.io/v1/storage/buckets/68f76bdd002387590584/files/68fe418e0034947bfaa6/view?project=68f23b11000d25eb3664',
    'https://syd.cloud.appwrite.io/v1/storage/buckets/68f76bdd002387590584/files/68fe418f0031bcb56ded/view?project=68f23b11000d25eb3664',
    'https://syd.cloud.appwrite.io/v1/storage/buckets/68f76bdd002387590584/files/68fe4190002fc09e44fe/view?project=68f23b11000d25eb3664',
    'https://syd.cloud.appwrite.io/v1/storage/buckets/68f76bdd002387590584/files/68fe4191002e5db0dfef/view?project=68f23b11000d25eb3664',
];

// Live menu image URLs for hotel/villa therapist cards (7 images - stored in Appwrite)
const LIVE_MENU_THERAPIST_IMAGES = [
    'https://syd.cloud.appwrite.io/v1/storage/buckets/68f76bdd002387590584/files/68fe4192003445db55a5/view?project=68f23b11000d25eb3664',
    'https://syd.cloud.appwrite.io/v1/storage/buckets/68f76bdd002387590584/files/68fe4193002fea8ca8b3/view?project=68f23b11000d25eb3664',
    'https://syd.cloud.appwrite.io/v1/storage/buckets/68f76bdd002387590584/files/68fe4194002b1ef92ede/view?project=68f23b11000d25eb3664',
    'https://syd.cloud.appwrite.io/v1/storage/buckets/68f76bdd002387590584/files/68fe419500258663d862/view?project=68f23b11000d25eb3664',
    'https://syd.cloud.appwrite.io/v1/storage/buckets/68f76bdd002387590584/files/68fe4196001f02b409df/view?project=68f23b11000d25eb3664',
    'https://syd.cloud.appwrite.io/v1/storage/buckets/68f76bdd002387590584/files/68fe419700157b08b70c/view?project=68f23b11000d25eb3664',
    'https://syd.cloud.appwrite.io/v1/storage/buckets/68f76bdd002387590584/files/68fe4198000f867f6e47/view?project=68f23b11000d25eb3664',
];

// Helper function to get main image sequentially for home page
const getRandomMainImage = (index: number): string => {
    return THERAPIST_MAIN_IMAGES[index % THERAPIST_MAIN_IMAGES.length];
};

// Helper function to get random live menu image
export const getRandomLiveMenuImage = (): string => {
    return LIVE_MENU_THERAPIST_IMAGES[Math.floor(Math.random() * LIVE_MENU_THERAPIST_IMAGES.length)];
};

// --- Image Upload Service ---
export const imageUploadService = {
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
            console.error('❌ Error uploading profile image:', error);
            if (error instanceof Error) {
                console.error('Error message:', error.message);
                console.error('Error stack:', error.stack);
            }
            throw error;
        }
    },

    async uploadIcon(base64Image: string): Promise<string> {
        try {
            // Convert base64 to blob
            const base64Data = base64Image.split(',')[1];
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
    }
};

export { getRandomMainImage, THERAPIST_MAIN_IMAGES, LIVE_MENU_THERAPIST_IMAGES };