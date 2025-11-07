// Debug script to find collection IDs in Appwrite database
import { appwriteDatabases } from '../lib/appwriteService';
import { APPWRITE_CONFIG } from '../lib/appwrite.config';

export async function debugCollections() {
    try {
        console.log('🔍 Debugging Appwrite collections...');
        console.log('Database ID:', APPWRITE_CONFIG.databaseId);
        console.log('Current therapists collection ID:', APPWRITE_CONFIG.collections.therapists);
        
        // Note: databases.get() doesn't exist in Appwrite SDK - skipping database info
        console.log('🔍 Testing database connection with collection queries...');
        
        // Since we can't list collections via API, let's try to access the therapists collection directly
        console.log('🔍 Testing current therapists collection ID...');
        
        try {
            // Try to list documents in the current collection ID
            const documents = await appwriteDatabases.listDocuments(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.therapists,
                []
            );
            console.log('✅ Therapists collection exists and has', documents.total, 'documents');
            return { success: true, documentsCount: documents.total };
        } catch (collectionError) {
            console.error('❌ Current therapists collection ID is invalid:', collectionError);
            return { success: false, error: collectionError };
        }
        
    } catch (error) {
        console.error('❌ Error accessing database:', error);
        throw error;
    }
}

// Test connection to database
export async function testDatabaseConnection() {
    try {
        console.log('🔌 Testing database connection...');
        // Note: databases.get() doesn't exist - testing with a collection query instead
        await appwriteDatabases.listDocuments(APPWRITE_CONFIG.databaseId, APPWRITE_CONFIG.collections.therapists, []);
        console.log('✅ Database connection successful');
        return true;
    } catch (error) {
        console.error('❌ Database connection failed:', error);
        return false;
    }
}