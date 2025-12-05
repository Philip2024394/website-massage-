/**
 * Audit current coordinate data to see what needs updating
 */

const { Client, Databases } = require('node-appwrite');

const config = {
    endpoint: 'https://syd.cloud.appwrite.io/v1',
    projectId: '68f23b11000d25eb3664',
    databaseId: '68f76ee1000e64ca8d05',
    collections: {
        therapists: 'therapists_collection_id',
        places: 'places_collection_id'
    }
};

const YOGYAKARTA_COORDS = { lat: -7.7956, lng: 110.3695 };

console.log('🔍 AUDITING CURRENT COORDINATE DATA...\n');

const client = new Client()
    .setEndpoint(config.endpoint)
    .setProject(config.projectId);

const databases = new Databases(client);

function analyzeCoordinates(coordinates) {
    if (!coordinates) return { status: 'MISSING', parsed: null };
    
    try {
        const parsed = typeof coordinates === 'string' ? JSON.parse(coordinates) : coordinates;
        
        if (parsed.lat && parsed.lng) {
            // Check if it's Yogyakarta coordinates (within 25km)
            const distance = calculateDistance(parsed.lat, parsed.lng, YOGYAKARTA_COORDS.lat, YOGYAKARTA_COORDS.lng);
            if (distance <= 25) {
                return { status: 'YOGYAKARTA_OK', parsed, distance: distance.toFixed(2) };
            } else {
                return { status: 'DIFFERENT_CITY', parsed, distance: distance.toFixed(2) };
            }
        } else if (parsed.lon && parsed.lng) {
            return { status: 'LEGACY_FORMAT', parsed };
        } else {
            return { status: 'INVALID_FORMAT', parsed };
        }
    } catch (error) {
        return { status: 'PARSE_ERROR', error: error.message };
    }
}

function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
}

async function auditCoordinates() {
    try {
        // Audit Therapists
        console.log('👨‍⚕️ THERAPIST COORDINATES AUDIT:');
        console.log('='.repeat(60));
        
        const therapistsResponse = await databases.listDocuments(
            config.databaseId,
            config.collections.therapists
        );

        const therapistStats = {
            total: therapistsResponse.documents.length,
            missing: 0,
            yogyakartaOk: 0,
            differentCity: 0,
            legacyFormat: 0,
            invalid: 0
        };

        therapistsResponse.documents.forEach((therapist, index) => {
            const analysis = analyzeCoordinates(therapist.coordinates);
            
            console.log(`\n${index + 1}. ${therapist.name || 'Unnamed'}`);
            console.log(`   Location: ${therapist.location || 'Not set'}`);
            console.log(`   Status: ${analysis.status}`);
            
            if (analysis.parsed) {
                console.log(`   Coordinates: ${JSON.stringify(analysis.parsed)}`);
            }
            if (analysis.distance) {
                console.log(`   Distance from Yogyakarta: ${analysis.distance}km`);
            }
            
            // Update stats
            switch (analysis.status) {
                case 'MISSING': therapistStats.missing++; break;
                case 'YOGYAKARTA_OK': therapistStats.yogyakartaOk++; break;
                case 'DIFFERENT_CITY': therapistStats.differentCity++; break;
                case 'LEGACY_FORMAT': therapistStats.legacyFormat++; break;
                default: therapistStats.invalid++; break;
            }
        });

        // Audit Places
        console.log('\n\n🏢 PLACE COORDINATES AUDIT:');
        console.log('='.repeat(60));
        
        const placesResponse = await databases.listDocuments(
            config.databaseId,
            config.collections.places
        );

        const placeStats = {
            total: placesResponse.documents.length,
            missing: 0,
            yogyakartaOk: 0,
            differentCity: 0,
            legacyFormat: 0,
            invalid: 0
        };

        placesResponse.documents.forEach((place, index) => {
            const analysis = analyzeCoordinates(place.coordinates);
            
            console.log(`\n${index + 1}. ${place.name || 'Unnamed'}`);
            console.log(`   Location: ${place.location || 'Not set'}`);
            console.log(`   Status: ${analysis.status}`);
            
            if (analysis.parsed) {
                console.log(`   Coordinates: ${JSON.stringify(analysis.parsed)}`);
            }
            if (analysis.distance) {
                console.log(`   Distance from Yogyakarta: ${analysis.distance}km`);
            }
            
            // Update stats
            switch (analysis.status) {
                case 'MISSING': placeStats.missing++; break;
                case 'YOGYAKARTA_OK': placeStats.yogyakartaOk++; break;
                case 'DIFFERENT_CITY': placeStats.differentCity++; break;
                case 'LEGACY_FORMAT': placeStats.legacyFormat++; break;
                default: placeStats.invalid++; break;
            }
        });

        // Summary
        console.log('\n\n📊 COORDINATE AUDIT SUMMARY:');
        console.log('='.repeat(60));
        
        console.log('\n👨‍⚕️ THERAPISTS:');
        console.log(`   Total: ${therapistStats.total}`);
        console.log(`   ✅ Yogyakarta Ready: ${therapistStats.yogyakartaOk}`);
        console.log(`   ❌ Missing Coordinates: ${therapistStats.missing}`);
        console.log(`   🌍 Different City: ${therapistStats.differentCity}`);
        console.log(`   🔧 Legacy Format: ${therapistStats.legacyFormat}`);
        console.log(`   ⚠️  Invalid Format: ${therapistStats.invalid}`);
        
        console.log('\n🏢 PLACES:');
        console.log(`   Total: ${placeStats.total}`);
        console.log(`   ✅ Yogyakarta Ready: ${placeStats.yogyakartaOk}`);
        console.log(`   ❌ Missing Coordinates: ${placeStats.missing}`);
        console.log(`   🌍 Different City: ${placeStats.differentCity}`);
        console.log(`   🔧 Legacy Format: ${placeStats.legacyFormat}`);
        console.log(`   ⚠️  Invalid Format: ${placeStats.invalid}`);

        const totalNeedUpdate = (therapistStats.missing + therapistStats.differentCity + therapistStats.legacyFormat + therapistStats.invalid) +
                               (placeStats.missing + placeStats.differentCity + placeStats.legacyFormat + placeStats.invalid);

        console.log(`\n🎯 RECOMMENDATION:`);
        if (totalNeedUpdate === 0) {
            console.log('   🎉 All coordinates are properly set for Yogyakarta!');
            console.log('   Your city location filtering should work perfectly.');
        } else {
            console.log(`   📝 ${totalNeedUpdate} records need coordinate updates`);
            console.log('   Run: node scripts/updateCoordinatesToYogyakarta.cjs');
        }
        
    } catch (error) {
        console.error('❌ Error auditing coordinates:', error.message);
        console.log('\n🔧 POSSIBLE ISSUES:');
        console.log('   1. Check collection IDs in lib/appwrite.config.ts');
        console.log('   2. Verify API key has read permissions');
        console.log('   3. Ensure Appwrite project is accessible');
    }
}

auditCoordinates();