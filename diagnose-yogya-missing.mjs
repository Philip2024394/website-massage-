import { Client, Databases, Query } from 'node-appwrite';

const client = new Client()
    .setEndpoint('https://syd.cloud.appwrite.io/v1')
    .setProject('68f23b11000d25eb3664')
    .setKey(process.env.APPWRITE_API_KEY || '');

const databases = new Databases(client);
const databaseId = '68f76ee1000e64ca8d05';
const therapistCollectionId = 'therapists_collection_id';

async function diagnoseYogyakarta() {
    try {
        console.log('\n🔍 DIAGNOSING YOGYAKARTA THERAPISTS DISAPPEARANCE\n');
        console.log('='.repeat(70));
        
        // Get ALL therapists
        const allTherapists = await databases.listDocuments(
            databaseId,
            therapistCollectionId,
            [Query.limit(500)]
        );
        
        console.log(`\n📊 Total therapists in database: ${allTherapists.documents.length}`);
        
        // Filter Yogyakarta therapists by location field
        const yogyaTherapists = allTherapists.documents.filter(t => {
            if (!t.location) return false;
            const locationLower = t.location.toLowerCase();
            return locationLower.includes('yogya') || locationLower.includes('jogja');
        });
        
        console.log(`\n🏙️ Yogyakarta therapists found: ${yogyaTherapists.length}`);
        console.log('-'.repeat(70));
        
        for (const therapist of yogyaTherapists) {
            console.log(`\n👤 ${therapist.name}`);
            console.log(`   📍 location: "${therapist.location}"`);
            console.log(`   🔴 isLive: ${therapist.isLive}`);
            console.log(`   📊 status: "${therapist.status}"`);
            console.log(`   📌 coordinates: ${therapist.coordinates ? 'set' : 'null'}`);
            
            // Test if filtering would work
            const selectedCity = 'Yogyakarta';
            const wouldMatch = therapist.location && 
                               therapist.location.toLowerCase().includes(selectedCity.toLowerCase());
            
            console.log(`   🧪 Would match "Yogyakarta" filter: ${wouldMatch ? '✅ YES' : '❌ NO'}`);
            
            if (!wouldMatch && therapist.location) {
                console.log(`   ⚠️ MISMATCH: location="${therapist.location}" doesn't include "Yogyakarta"`);
            }
        }
        
        // Check for therapists with null/empty location
        console.log('\n\n🔍 Checking therapists with NULL or empty location:');
        console.log('-'.repeat(70));
        
        const noLocation = allTherapists.documents.filter(t => !t.location || t.location.trim() === '');
        console.log(`\nFound ${noLocation.length} therapists without location:`);
        
        for (const therapist of noLocation.slice(0, 10)) {
            console.log(`\n👤 ${therapist.name}`);
            console.log(`   📍 location: ${therapist.location || 'NULL'}`);
            console.log(`   📌 coordinates: ${therapist.coordinates || 'NULL'}`);
            
            // Try to parse coordinates
            if (therapist.coordinates) {
                try {
                    const coords = JSON.parse(therapist.coordinates);
                    console.log(`   🗺️ Parsed coords: lat=${coords.lat}, lng=${coords.lng}`);
                    
                    // Check if coordinates are in Yogyakarta area
                    // Yogyakarta: approximately lat -7.8, lng 110.4
                    const isYogya = Math.abs(coords.lat - (-7.8)) < 0.2 && 
                                   Math.abs(coords.lng - 110.4) < 0.2;
                    if (isYogya) {
                        console.log(`   ⚠️ LIKELY YOGYAKARTA THERAPIST with no location field!`);
                    }
                } catch (e) {
                    console.log(`   ❌ Failed to parse coordinates`);
                }
            }
        }
        
        // Summary
        console.log('\n\n📊 SUMMARY');
        console.log('='.repeat(70));
        console.log(`Total therapists: ${allTherapists.documents.length}`);
        console.log(`With location field: ${allTherapists.documents.filter(t => t.location).length}`);
        console.log(`Without location field: ${noLocation.length}`);
        console.log(`Yogyakarta (by location text): ${yogyaTherapists.length}`);
        
        console.log('\n🎯 LIKELY ISSUE:');
        if (yogyaTherapists.length === 0) {
            console.log('❌ NO therapists have "Yogyakarta" in their location field!');
            console.log('   Possible causes:');
            console.log('   1. Location field is null/empty for Yogyakarta therapists');
            console.log('   2. Location stored with different spelling');
            console.log('   3. Location field was not properly saved');
        } else if (yogyaTherapists.length < 5) {
            console.log('⚠️ Very few therapists have "Yogyakarta" in location field');
            console.log('   Many Yogyakarta therapists likely missing location data');
        } else {
            console.log('✅ Yogyakarta therapists have location field set');
            console.log('   Issue might be in frontend filtering logic');
        }
        
    } catch (error) {
        console.error('\n❌ Error:', error.message);
    }
}

diagnoseYogyakarta();
