import { databases } from './appwrite';
import { APPWRITE_CONFIG } from './appwrite.config';

/**
 * Safe database operations that handle missing collections gracefully
 */
export class SafeDatabaseService {
    /**
     * Check if a collection ID is configured and not empty
     */
    private isCollectionConfigured(collectionId: string): boolean {
        return Boolean(collectionId && 
               collectionId.trim() !== '' && 
               !collectionId.includes('_collection_id') && 
               collectionId !== 'admin_messages' &&
               collectionId !== 'villas_collection_id');
    }

    /**
     * Safe document creation with collection validation
     */
    async safeCreateDocument(
        databaseId: string, 
        collectionId: string, 
        documentId: string, 
        data: any, 
        permissions?: string[]
    ): Promise<any> {
        if (!this.isCollectionConfigured(collectionId)) {
            console.warn(`⚠️ Collection "${collectionId}" not configured - skipping create operation`);
            return null;
        }

        try {
            return await databases.createDocument(databaseId, collectionId, documentId, data, permissions);
        } catch (error: any) {
            if (error?.code === 404) {
                console.warn(`⚠️ Collection "${collectionId}" not found - operation skipped`);
                return null;
            }
            throw error;
        }
    }

    /**
     * Safe document listing with collection validation
     */
    async safeListDocuments(
        databaseId: string, 
        collectionId: string, 
        queries?: string[]
    ): Promise<any[]> {
        if (!this.isCollectionConfigured(collectionId)) {
            console.warn(`⚠️ Collection "${collectionId}" not configured - returning empty array`);
            return [];
        }

        try {
            const response = await databases.listDocuments(databaseId, collectionId, queries);
            return response.documents;
        } catch (error: any) {
            if (error?.code === 404 || error?.code === 400) {
                console.warn(`⚠️ Collection "${collectionId}" not found or invalid - returning empty array`);
                return [];
            }
            throw error;
        }
    }

    /**
     * Safe document update with collection validation
     */
    async safeUpdateDocument(
        databaseId: string, 
        collectionId: string, 
        documentId: string, 
        data: any, 
        permissions?: string[]
    ): Promise<any> {
        if (!this.isCollectionConfigured(collectionId)) {
            console.warn(`⚠️ Collection "${collectionId}" not configured - skipping update operation`);
            return null;
        }

        try {
            return await databases.updateDocument(databaseId, collectionId, documentId, data, permissions);
        } catch (error: any) {
            if (error?.code === 404) {
                console.warn(`⚠️ Collection "${collectionId}" not found - operation skipped`);
                return null;
            }
            throw error;
        }
    }

    /**
     * Safe document deletion with collection validation
     */
    async safeDeleteDocument(
        databaseId: string, 
        collectionId: string, 
        documentId: string
    ): Promise<boolean> {
        if (!this.isCollectionConfigured(collectionId)) {
            console.warn(`⚠️ Collection "${collectionId}" not configured - skipping delete operation`);
            return false;
        }

        try {
            await databases.deleteDocument(databaseId, collectionId, documentId);
            return true;
        } catch (error: any) {
            if (error?.code === 404) {
                console.warn(`⚠️ Collection or document not found - delete operation skipped`);
                return false;
            }
            throw error;
        }
    }
}

export const safeDatabaseService = new SafeDatabaseService();