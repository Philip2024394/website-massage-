import { Query } from 'appwrite';
import { APPWRITE_CONFIG } from '../config';
import { appwriteDatabases as databases } from '../client';

export const hotelService = {
    async getHotels(): Promise<any[]> {
        try {
            console.log('🏨 Fetching hotels from collection:', APPWRITE_CONFIG.collections.hotels);
            const response = await databases.listDocuments(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.hotels,
                [Query.limit(100)] // Get up to 100 hotels
            );
            console.log('✅ Hotels fetched successfully:', response.documents.length);
            return response.documents;
        } catch (error) {
            console.error('❌ Error fetching hotels:', error);
            // Log specific error details to help with debugging
            if (error instanceof Error) {
                console.error('Hotel fetch error details:', {
                    message: error.message,
                    name: error.name
                });
                
                if (error.message.includes('Collection with the requested ID could not be found')) {
                    console.error('💡 Hotels collection not found. Check collection ID in appwrite.config.ts');
                }
            }
            return [];
        }
    },
    
    async getHotelById(id: string): Promise<any> {
        try {
            const response = await databases.getDocument(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.hotels,
                id
            );
            return response;
        } catch (error) {
            console.error('Error fetching hotel by ID:', error);
            throw error;
        }
    }
};
