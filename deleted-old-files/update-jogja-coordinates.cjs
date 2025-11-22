/**
 * Bulk Update Script: Set Jogja Coordinates for Therapists
 * 
 * This script updates all therapists without valid coordinates
 * to use Jogja city center coordinates.
 * 
 * SETUP:
 * 1. Go to Appwrite Console → https://cloud.appwrite.io/console
 * 2. Select your project → Settings → API Keys
 * 3. Create new API key with scopes: databases.read, databases.write
 * 4. Copy the key and add to .env file:
 *    APPWRITE_API_KEY=your_api_key_here
 * 
 * USAGE: 
 * node update-jogja-coordinates.cjs
 */

const sdk = require('node-appwrite');
require('dotenv').config();

// Appwrite configuration from .env
const APPWRITE_ENDPOINT = process.env.APPWRITE_ENDPOINT || process.env.VITE_APPWRITE_ENDPOINT || 'https://syd.cloud.appwrite.io/v1';
const APPWRITE_PROJECT_ID = process.env.APPWRITE_PROJECT_ID || process.env.VITE_APPWRITE_PROJECT_ID;
const APPWRITE_API_KEY = process.env.APPWRITE_API_KEY;
const DATABASE_ID = process.env.COIN_SHOP_DATABASE_ID || process.env.VITE_APPWRITE_DATABASE_ID;

console.log('📋 Configuration loaded:');
console.log(`   Endpoint: ${APPWRITE_ENDPOINT}`);
console.log(`   Project ID: ${APPWRITE_PROJECT_ID}`);
console.log(`   Database ID: ${DATABASE_ID}`);
console.log(`   API Key: ${APPWRITE_API_KEY ? '✅ Set' : '❌ Missing'}`);
console.log('');

if (!APPWRITE_API_KEY) {
    console.error('❌ APPWRITE_API_KEY not found in .env file!');
    console.error('');
    console.error('To fix:');
    console.error('1. Go to Appwrite Console → Project Settings → API Keys');
    console.error('2. Create an API key with permissions: databases.read, databases.write');
    console.error('3. Add to .env file: APPWRITE_API_KEY=your_key_here');
    process.exit(1);
}

// Jogja coordinates (city center)
const JOGJA_COORDS = { lat: -7.7956, lng: 110.3695 };

// Initialize Appwrite
const client = new sdk.Client();
client
    .setEndpoint(APPWRITE_ENDPOINT)
    .setProject(APPWRITE_PROJECT_ID)
    .setKey(APPWRITE_API_KEY);

const databases = new sdk.Databases(client);

async function updateTherapistCoordinates() {
    try {
        console.log('🔍 Finding therapists collection...\n');
        
        // First, list all collections to find the therapists collection
        const collections = await databases.listCollections(DATABASE_ID);
        
        console.log('📚 Available collections:');
        collections.collections.forEach((col, index) => {
            console.log(`   ${index + 1}. ${col.name} (ID: ${col.$id})`);
        });
        console.log('');
        
        // Find therapists collection
        const therapistsCollection = collections.collections.find(c => 
            c.name.toLowerCase().includes('therapist') || 
            c.$id.toLowerCase().includes('therapist')
        );
        
        if (!therapistsCollection) {
            console.error('❌ Could not find therapists collection!');
            console.error('   Please manually specify the collection ID in the script.');
            return;
        }
        
        const THERAPISTS_COLLECTION_ID = therapistsCollection.$id;
        console.log(`✅ Found therapists collection: "${therapistsCollection.name}" (${THERAPISTS_COLLECTION_ID})\n`);
        
        console.log('🔍 Fetching all therapists...\n');
        
        const response = await databases.listDocuments(
            DATABASE_ID,
            THERAPISTS_COLLECTION_ID,
            [sdk.Query.limit(100)]
        );
        
        const therapists = response.documents;
        console.log(`📊 Found ${therapists.length} total therapists\n`);
        
        let updatedCount = 0;
        let skippedCount = 0;
        let errorCount = 0;
        
        for (const therapist of therapists) {
            const name = therapist.name || 'Unknown';
            const id = therapist.$id;
            const coordinatesStr = therapist.coordinates || '';
            
            // Parse existing coordinates
            let hasValidCoords = false;
            try {
                if (coordinatesStr) {
                    const coords = JSON.parse(coordinatesStr);
                    if (coords.lat && coords.lng && coords.lat !== 0 && coords.lng !== 0) {
                        hasValidCoords = true;
                    }
                }
            } catch (e) {
                // Invalid JSON, needs update
            }
            
            if (hasValidCoords) {
                console.log(`⏭️  Skipping "${name}" - already has valid coordinates`);
                skippedCount++;
                continue;
            }
            
            // Update with Jogja coordinates
            try {
                console.log(`🔄 Updating "${name}"...`);
                
                const newCoordinates = JSON.stringify(JOGJA_COORDS);
                const newLocation = therapist.location || 'Yogyakarta, Indonesia';
                
                await databases.updateDocument(
                    DATABASE_ID,
                    THERAPISTS_COLLECTION_ID,
                    id,
                    {
                        coordinates: newCoordinates,
                        location: newLocation,
                        countryCode: 'ID'
                    }
                );
                
                console.log(`   ✅ Updated: coordinates set to ${newCoordinates}`);
                updatedCount++;
            } catch (error) {
                console.error(`   ❌ Error updating "${name}":`, error.message);
                errorCount++;
            }
            
            // Small delay to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 200));
        }
        
        console.log('\n' + '='.repeat(60));
        console.log('📊 BULK UPDATE SUMMARY:');
        console.log('='.repeat(60));
        console.log(`   ✅ Updated: ${updatedCount} therapists`);
        console.log(`   ⏭️  Skipped: ${skippedCount} therapists (already had valid coordinates)`);
        console.log(`   ❌ Errors: ${errorCount} therapists`);
        console.log(`   📍 Coordinates set: Yogyakarta center (${JOGJA_COORDS.lat}, ${JOGJA_COORDS.lng})`);
        console.log('='.repeat(60));
        
        if (updatedCount > 0) {
            console.log('\n✅ Done! Therapists should now appear in Jogja location searches.');
            console.log('💡 Tip: Therapists can update to their exact location using "Use My Current Location" in their dashboard.');
        }
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error('\nPossible issues:');
        console.error('  - Check API key permissions');
        console.error('  - Verify database and collection IDs');
        console.error('  - Ensure network connection');
    }
}

// Run the update
console.log('🚀 Starting bulk coordinate update for Jogja therapists...\n');
updateTherapistCoordinates();
