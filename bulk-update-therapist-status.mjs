/**
 * Bulk Update Therapist Status Script
 * Updates all therapists (or specific ones) to a desired status
 */

import { Client, Databases, Query } from 'node-appwrite';

// Appwrite configuration
const APPWRITE_ENDPOINT = 'https://syd.cloud.appwrite.io/v1';
const APPWRITE_PROJECT_ID = '68f23b11000d25eb3664';
const APPWRITE_DATABASE_ID = '68f76ee1000e64ca8d05';
const APPWRITE_THERAPISTS_COLLECTION = 'therapists_collection_id';

// Initialize Appwrite
const client = new Client()
    .setEndpoint(APPWRITE_ENDPOINT)
    .setProject(APPWRITE_PROJECT_ID);

const databases = new Databases(client);

/**
 * Update therapist status
 */
async function updateTherapistStatus(therapistId, status, therapistName) {
    try {
        await databases.updateDocument(
            APPWRITE_DATABASE_ID,
            APPWRITE_THERAPISTS_COLLECTION,
            therapistId,
            { status: status.toLowerCase() }
        );
        console.log(`✅ Updated ${therapistName} (${therapistId}) to ${status}`);
        return { success: true, therapistId, therapistName };
    } catch (error) {
        console.error(`❌ Failed to update ${therapistName} (${therapistId}):`, error.message);
        return { success: false, therapistId, therapistName, error: error.message };
    }
}

/**
 * Bulk update all therapists or specific ones
 */
async function bulkUpdateStatus(targetStatus = 'busy', specificIds = null) {
    console.log(`\n🚀 Starting bulk status update to: ${targetStatus}\n`);
    
    try {
        // Fetch all therapists or filter by IDs
        const queries = specificIds ? [Query.equal('$id', specificIds)] : [Query.limit(100)];
        
        const response = await databases.listDocuments(
            APPWRITE_DATABASE_ID,
            APPWRITE_THERAPISTS_COLLECTION,
            queries
        );

        const therapists = response.documents;
        console.log(`📋 Found ${therapists.length} therapists to update\n`);

        const results = {
            total: therapists.length,
            successful: 0,
            failed: 0,
            details: []
        };

        // Update each therapist
        for (const therapist of therapists) {
            const result = await updateTherapistStatus(
                therapist.$id,
                targetStatus,
                therapist.name || 'Unknown'
            );
            
            if (result.success) {
                results.successful++;
            } else {
                results.failed++;
            }
            results.details.push(result);
            
            // Small delay to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 200));
        }

        // Summary
        console.log('\n' + '='.repeat(50));
        console.log('📊 BULK UPDATE SUMMARY');
        console.log('='.repeat(50));
        console.log(`Total therapists: ${results.total}`);
        console.log(`✅ Successful: ${results.successful}`);
        console.log(`❌ Failed: ${results.failed}`);
        console.log('='.repeat(50) + '\n');

        return results;

    } catch (error) {
        console.error('❌ Error during bulk update:', error);
        throw error;
    }
}

// Command line arguments
const args = process.argv.slice(2);
const targetStatus = args[0] || 'busy'; // Default to 'busy'
const specificIds = args[1] ? args[1].split(',') : null; // Optional: comma-separated IDs

console.log('🎯 Bulk Therapist Status Updater');
console.log('='.repeat(50));
console.log(`Target Status: ${targetStatus}`);
console.log(`Specific IDs: ${specificIds ? specificIds.join(', ') : 'All therapists'}`);
console.log('='.repeat(50));

// Run the update
bulkUpdateStatus(targetStatus, specificIds)
    .then(() => {
        console.log('✅ Bulk update completed successfully!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('❌ Bulk update failed:', error);
        process.exit(1);
    });
