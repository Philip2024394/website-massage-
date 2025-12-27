/**
 * Migration Script: Add Security Fields to Existing Profiles
 * 
 * This script safely adds the required security fields to existing therapist profiles
 * without overwriting any existing data.
 * 
 * Fields added:
 * - isActive: boolean (default true)
 * - createdAt: string (use existing $createdAt or current time)
 * - updatedAt: string (use existing $updatedAt or current time)
 * - version: number (start at 1)
 * 
 * Usage:
 * node migrate-secure-storage.mjs
 */

import { Client, Databases, Query } from 'node-appwrite';

const client = new Client()
    .setEndpoint('https://cloud.appwrite.io/v1')
    .setProject('678efbc300103c1c7e25') // Your project ID
    .setKey('YOUR_API_KEY_HERE'); // Replace with your API key

const databases = new Databases(client);

const databaseId = '678efc3e001e0ad07207';
const therapistsCollectionId = '678efc570016c6d0ae88';

async function migrateTherapistProfiles() {
    console.log('🚀 Starting migration...\n');
    
    let offset = 0;
    const limit = 50;
    let hasMore = true;
    let totalProcessed = 0;
    let totalUpdated = 0;
    let totalSkipped = 0;
    let totalErrors = 0;
    
    while (hasMore) {
        try {
            const response = await databases.listDocuments(
                databaseId,
                therapistsCollectionId,
                [
                    Query.limit(limit),
                    Query.offset(offset)
                ]
            );
            
            console.log(`📦 Processing batch: ${offset + 1} to ${offset + response.documents.length}`);
            
            for (const profile of response.documents) {
                totalProcessed++;
                
                try {
                    // Check if profile already has security fields
                    const needsUpdate = 
                        profile.isActive === undefined ||
                        !profile.createdAt ||
                        !profile.updatedAt ||
                        profile.version === undefined;
                    
                    if (!needsUpdate) {
                        console.log(`  ⏭️  ${profile.name || profile.$id}: Already migrated, skipping`);
                        totalSkipped++;
                        continue;
                    }
                    
                    const now = new Date().toISOString();
                    
                    // Prepare update data (only add missing fields)
                    const updateData = {};
                    
                    if (profile.isActive === undefined) {
                        updateData.isActive = true;
                    }
                    
                    if (!profile.createdAt) {
                        updateData.createdAt = profile.$createdAt || now;
                    }
                    
                    if (!profile.updatedAt) {
                        updateData.updatedAt = profile.$updatedAt || now;
                    }
                    
                    if (profile.version === undefined) {
                        updateData.version = 1;
                    }
                    
                    // Update profile with only missing fields
                    await databases.updateDocument(
                        databaseId,
                        therapistsCollectionId,
                        profile.$id,
                        updateData
                    );
                    
                    console.log(`  ✅ ${profile.name || profile.$id}: Added ${Object.keys(updateData).join(', ')}`);
                    totalUpdated++;
                    
                } catch (error) {
                    console.error(`  ❌ ${profile.name || profile.$id}: ${error.message}`);
                    totalErrors++;
                }
            }
            
            offset += limit;
            hasMore = response.documents.length === limit;
            
            // Add a small delay to avoid rate limiting
            if (hasMore) {
                await new Promise(resolve => setTimeout(resolve, 500));
            }
            
        } catch (error) {
            console.error(`\n❌ Batch fetch failed:`, error.message);
            break;
        }
    }
    
    console.log('\n' + '='.repeat(50));
    console.log('📊 Migration Summary:');
    console.log('='.repeat(50));
    console.log(`Total Processed: ${totalProcessed}`);
    console.log(`✅ Updated: ${totalUpdated}`);
    console.log(`⏭️  Skipped: ${totalSkipped}`);
    console.log(`❌ Errors: ${totalErrors}`);
    console.log('='.repeat(50));
    
    if (totalErrors === 0) {
        console.log('\n🎉 Migration completed successfully!');
    } else {
        console.log('\n⚠️  Migration completed with errors. Please review the logs above.');
    }
}

// Run migration
migrateTherapistProfiles().catch(error => {
    console.error('\n💥 Migration failed:', error);
    process.exit(1);
});
