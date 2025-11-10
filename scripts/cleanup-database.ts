/**
 * Database Cleanup Script - Delete all therapists except phil4@gmail.com
 * This will permanently remove therapist records from Appwrite database
 * WARNING: This action cannot be undone!
 */

import { appwriteDatabases as databases } from '../lib/appwriteService';
import { Query } from 'appwrite';
import { APPWRITE_CONFIG } from '../lib/appwrite.config';

const KEEP_EMAIL = 'phil4@gmail.com';

async function deleteAllTherapistsExcept() {
    try {
        console.log('🔍 Starting database cleanup...');
        console.log(`📧 Keeping therapist with email: ${KEEP_EMAIL}`);
        
        // Check if therapist collection exists
        if (!APPWRITE_CONFIG.collections.therapists) {
            console.error('❌ Therapist collection not configured');
            return;
        }

        // Get all therapists
        console.log('📋 Fetching all therapists from database...');
        const allTherapists = await databases.listDocuments(
            APPWRITE_CONFIG.databaseId,
            APPWRITE_CONFIG.collections.therapists
        );

        console.log(`📊 Found ${allTherapists.documents.length} total therapists`);

        // Filter therapists to delete (all except phil4@gmail.com)
        const therapistsToDelete = allTherapists.documents.filter(
            (therapist: any) => therapist.email !== KEEP_EMAIL
        );

        console.log(`🗑️ Therapists to delete: ${therapistsToDelete.length}`);
        console.log(`✅ Therapists to keep: ${allTherapists.documents.length - therapistsToDelete.length}`);

        if (therapistsToDelete.length === 0) {
            console.log('✨ No therapists to delete. Database is already clean!');
            return;
        }

        // Show what will be deleted
        console.log('\n📝 Therapists that will be PERMANENTLY DELETED:');
        therapistsToDelete.forEach((therapist: any, index: number) => {
            console.log(`   ${index + 1}. ${therapist.name} (${therapist.email}) - ID: ${therapist.$id}`);
        });

        console.log(`\n⚠️  WARNING: About to delete ${therapistsToDelete.length} therapist records!`);
        console.log('⚠️  This action CANNOT be undone!');
        console.log(`✅ Keeping: ${KEEP_EMAIL}`);

        // Delete each therapist
        let deletedCount = 0;
        let errorCount = 0;

        for (const therapist of therapistsToDelete) {
            try {
                await databases.deleteDocument(
                    APPWRITE_CONFIG.databaseId,
                    APPWRITE_CONFIG.collections.therapists,
                    therapist.$id
                );
                
                deletedCount++;
                console.log(`✅ Deleted: ${therapist.name} (${therapist.email})`);
                
                // Small delay to prevent rate limiting
                await new Promise(resolve => setTimeout(resolve, 100));
                
            } catch (error) {
                errorCount++;
                console.error(`❌ Failed to delete ${therapist.name} (${therapist.email}):`, error);
            }
        }

        // Final summary
        console.log('\n🎉 CLEANUP COMPLETE!');
        console.log(`✅ Successfully deleted: ${deletedCount} therapists`);
        console.log(`❌ Failed to delete: ${errorCount} therapists`);
        console.log(`📧 Kept account: ${KEEP_EMAIL}`);
        
        // Verify final state
        const remainingTherapists = await databases.listDocuments(
            APPWRITE_CONFIG.databaseId,
            APPWRITE_CONFIG.collections.therapists
        );
        
        console.log(`\n📊 Final database state: ${remainingTherapists.documents.length} therapist(s) remaining`);
        remainingTherapists.documents.forEach((therapist: any) => {
            console.log(`   ✅ ${therapist.name} (${therapist.email})`);
        });

    } catch (error) {
        console.error('💥 Fatal error during cleanup:', error);
    }
}

// Export for manual execution
export { deleteAllTherapistsExcept };

// Auto-run if called directly (uncomment the line below to run automatically)
// deleteAllTherapistsExcept();