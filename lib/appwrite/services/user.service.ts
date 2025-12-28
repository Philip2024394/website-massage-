/**
 * User account management
 * Extracted from monolithic appwriteService.ts for better maintainability
 */

import { databases, storage, APPWRITE_CONFIG } from '../config';
import { ID, Query } from 'appwrite';

export const userService = {
    async create(user: any): Promise<any> {
        // Users are created via authService, this stores additional user profile data
        try {
            const response = await databases.createDocument(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.users,
                'unique()',
                user
            );
            return response;
        } catch (error) {
            console.error('Error creating user profile:', error);
            throw error;
        }
    },
    async getCustomerByEmail(email: string): Promise<any | null> {
        try {
            const response = await databases.listDocuments(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.users,
                [Query.equal('email', email), Query.limit(1)]
            );
            return response.documents.length > 0 ? response.documents[0] : null;
        } catch (error: any) {
            // Gracefully handle missing users collection (404)
            if (error.code === 404 || error.message?.includes('could not be found')) {
                console.warn('⚠️ Users collection not found - skipping customer check');
                return null;
            }
            console.error('Error fetching customer by email:', error);
            throw error;
        }
    },
    async updateCustomerById(docId: string, data: any): Promise<any> {
        try {
            const response = await databases.updateDocument(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.users,
                docId,
                data
            );
            return response;
        } catch (error) {
            console.error('Error updating customer by id:', error);
            throw error;
        }
    },
    async updateCustomerByEmail(email: string, data: any): Promise<any> {
        try {
            const existing = await userService.getCustomerByEmail(email);
            if (existing) {
                return await userService.updateCustomerById(existing.$id, data);
            }
            // If not exists, create minimal doc
            return await userService.create({ email, ...data });
        } catch (error) {
            console.error('Error updating customer by email:', error);
            throw error;
        }
    },
    async getByUserId(userId: string): Promise<any> {
        try {
            const response = await databases.listDocuments(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.users,
                [Query.equal('userId', userId)]
            );
            return response.documents.length > 0 ? response.documents[0] : null;
        } catch (error) {
            console.error('Error fetching user by userId:', error);
            throw error;
        }
    },
    async getByEmail(email: string): Promise<any> {
        try {
            // Search across all user collections
            
            // 1. Check therapists collection
            try {
                const therapistResponse = await databases.listDocuments(
                    APPWRITE_CONFIG.databaseId,
                    APPWRITE_CONFIG.collections.therapists,
                    [Query.equal('email', email)]
                );
                if (therapistResponse.documents.length > 0) {
                    console.log('✅ Found user in therapists collection');
                    return therapistResponse.documents[0];
                }
            } catch (error: any) {
                console.warn('⚠️ Error checking therapists collection:', error.message);
            }
            
            // 2. Check places collection
            try {
                const placeResponse = await databases.listDocuments(
                    APPWRITE_CONFIG.databaseId,
                    APPWRITE_CONFIG.collections.places,
                    [Query.equal('email', email)]
                );
                if (placeResponse.documents.length > 0) {
                    console.log('✅ Found user in places collection');
                    return placeResponse.documents[0];
                }
            } catch (error: any) {
                console.warn('⚠️ Error checking places collection:', error.message);
            }
            
            // 3. Check users/customers collection (optional - may not exist)
            try {
                const customer = await userService.getCustomerByEmail(email);
                if (customer) {
                    console.log('✅ Found user in customers collection');
                    return customer;
                }
            } catch (error: any) {
                // Users collection is optional, don't throw error
                console.warn('⚠️ Users collection not available:', error.message);
            }
            
            console.log('ℹ️ No existing user found with email:', email);
            return null;
        } catch (error) {
            console.error('Error fetching user by email:', error);
            throw error;
        }
    },
    async update(id: string, data: any): Promise<any> {
        // This is generic - should know which collection to update
        // For now, implement as a pass-through
        try {
            const response = await databases.updateDocument(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.therapists, // default to therapists
                id,
                data
            );
            return response;
        } catch (error) {
            console.error('Error updating user:', error);
            throw error;
        }
    }
};
