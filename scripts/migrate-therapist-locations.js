/**
 * ONE-TIME MIGRATION: Add locationId and city fields to existing therapists
 * 
 * PROBLEM:
 * - Existing therapists only have `location` field
 * - Filtering uses: t.city || t.locationId || t.location
 * - All therapists showing in Yogyakarta because city/locationId missing
 * 
 * SOLUTION:
 * - Read each therapist's `location` field
 * - Set `locationId` = location.toLowerCase().trim()
 * - Set `city` = location.toLowerCase().trim()
 * - This makes them visible in correct cities immediately
 */

import { Client, Databases, Query } from 'appwrite';

const client = new Client();
const databases = new Databases(client);

// Appwrite configuration (from lib/appwrite.ts)
const PROJECT_ID = '68f23b11000d25eb3664';
const DATABASE_ID = '68f76ee1000e64ca8d05';
const THERAPISTS_COLLECTION_ID = 'therapists_collection_id';
const API_ENDPOINT = 'https://syd.cloud.appwrite.io/v1';

client
    .setEndpoint(API_ENDPOINT)
    .setProject(PROJECT_ID);

async function migrateTherapistLocations() {
    console.log('🚀 Starting therapist location migration...\n');
    
    try {
        // Fetch all therapists
        console.log('📥 Fetching all therapists...');
        const response = await databases.listDocuments(
            DATABASE_ID,
            THERAPISTS_COLLECTION_ID,
            [Query.limit(500)]
        );
        
        const therapists = response.documents;
        console.log(`✅ Found ${therapists.length} therapists\n`);
        
        let updated = 0;
        let skipped = 0;
        let errors = 0;
        
        for (const therapist of therapists) {
            const name = therapist.name || 'Unnamed';
            const id = therapist.$id;
            const location = therapist.location;
            const city = therapist.city;
            const locationId = therapist.locationId;
            const geopoint = therapist.geopoint;
            
            console.log(`\n👤 ${name} (ID: ${id})`);
            console.log(`   Current - location: "${location}", city: "${city}", locationId: "${locationId}"`);
            
            // Skip if therapist already has GPS location (GPS is authoritative)
            if (geopoint && (geopoint.lat || geopoint.lng)) {
                console.log(`   ⏭️  SKIP: Has GPS location (GPS is authoritative)`);
                skipped++;
                continue;
            }
            
            // Skip if already has both city and locationId
            if (city && locationId) {
                console.log(`   ⏭️  SKIP: Already has city and locationId`);
                skipped++;
                continue;
            }
            
            // Skip if no location field
            if (!location) {
                console.log(`   ⚠️  SKIP: No location field set`);
                skipped++;
                continue;
            }
            
            // Derive city and locationId from location field
            const normalizedLocation = location.toLowerCase().trim();
            const updateData = {};
            
            // Only update locationId (city field doesn't exist in database schema)
            if (!locationId || locationId === 'null') {
                updateData.locationId = normalizedLocation;
                console.log(`   📝 Updating: locationId="${normalizedLocation}"`);
            } else {
                console.log(`   ⏭️  SKIP: locationId already set to "${locationId}"`);
                skipped++;
                continue;
            }
            
            try {await databases.updateDocument(
                    DATABASE_ID,
                    THERAPISTS_COLLECTION_ID,
                    id,
                    updateData
                );
                
                console.log(`   ✅ SUCCESS: Updated`);
                updated++;
            } catch (error) {
                console.log(`   ❌ ERROR: ${error.message}`);
                errors++;
            }
        }
        
        console.log('\n' + '='.repeat(60));
        console.log('📊 MIGRATION COMPLETE');
        console.log('='.repeat(60));
        console.log(`✅ Updated:  ${updated} therapists`);
        console.log(`⏭️  Skipped:  ${skipped} therapists`);
        console.log(`❌ Errors:   ${errors} therapists`);
        console.log(`📋 Total:    ${therapists.length} therapists`);
        console.log('='.repeat(60));
        
        if (updated > 0) {
            console.log('\n🎉 Migration successful! Therapists will now appear in correct cities.');
            console.log('💡 Refresh your homepage to see therapists in their correct locations.');
        }
        
    } catch (error) {
        console.error('\n❌ Migration failed:', error.message);
        console.error('Full error:', error);
        process.exit(1);
    }
}

// Run migration
migrateTherapistLocations();
