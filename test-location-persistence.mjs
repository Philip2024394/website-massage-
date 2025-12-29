import { Client, Databases, Query } from 'node-appwrite';

const client = new Client()
    .setEndpoint('https://syd.cloud.appwrite.io/v1')
    .setProject('68f23b11000d25eb3664')
    .setKey(process.env.APPWRITE_API_KEY || ''); // Replace with your API key if needed

const databases = new Databases(client);
const databaseId = '68f76ee1000e64ca8d05';
const therapistCollectionId = 'therapists_collection_id';

async function testLocationPersistence() {
    try {
        console.log('\n🔍 TESTING LOCATION PERSISTENCE\n');
        console.log('=' .repeat(60));
        
        // Test 1: Check all therapists with Bandung location
        console.log('\n📍 Test 1: Therapists with Bandung location');
        console.log('-'.repeat(60));
        
        const bandungTherapists = await databases.listDocuments(
            databaseId,
            therapistCollectionId,
            [
                Query.or([
                    Query.equal('city', 'Bandung'),
                    Query.equal('location', 'Bandung')
                ]),
                Query.limit(50)
            ]
        );
        
        console.log(`\nFound ${bandungTherapists.documents.length} therapists with Bandung:`);
        
        for (const therapist of bandungTherapists.documents) {
            console.log(`\n👤 ${therapist.name}`);
            console.log(`   city field: "${therapist.city || 'null'}"`);
            console.log(`   location field: "${therapist.location || 'null'}"`);
            console.log(`   status: "${therapist.status}"`);
            console.log(`   isLive: ${therapist.isLive}`);
            console.log(`   coordinates: ${therapist.coordinates ? 'set' : 'null'}`);
            
            // Check if fields match
            if (therapist.city !== therapist.location) {
                console.log(`   ⚠️ MISMATCH: city and location fields don't match!`);
            } else {
                console.log(`   ✅ MATCH: city and location fields are consistent`);
            }
        }
        
        // Test 2: Check Aditia specifically
        console.log('\n\n📍 Test 2: Aditia Profile Details');
        console.log('-'.repeat(60));
        
        const aditia = await databases.listDocuments(
            databaseId,
            therapistCollectionId,
            [
                Query.search('name', 'Aditia'),
                Query.limit(5)
            ]
        );
        
        if (aditia.documents.length > 0) {
            const aditiaProfile = aditia.documents[0];
            console.log(`\n✅ Found Aditia: ${aditiaProfile.$id}`);
            console.log(`   city: "${aditiaProfile.city || 'NULL'}"`);
            console.log(`   location: "${aditiaProfile.location || 'NULL'}"`);
            console.log(`   status: "${aditiaProfile.status}"`);
            console.log(`   isLive: ${aditiaProfile.isLive}`);
            console.log(`   coordinates: ${aditiaProfile.coordinates || 'NULL'}`);
            
            // Simulate dashboard load logic
            console.log('\n🔍 Dashboard Load Simulation:');
            let loadedCity = 'all';
            if (aditiaProfile.city) {
                loadedCity = aditiaProfile.city;
                console.log(`   ✅ Would load from city field: "${loadedCity}"`);
            } else if (aditiaProfile.location) {
                loadedCity = aditiaProfile.location;
                console.log(`   ✅ Would load from location field: "${loadedCity}"`);
            } else {
                console.log(`   ❌ No city or location - defaults to "all"`);
            }
            
            // Simulate homepage filtering
            console.log('\n🏠 Homepage Filter Simulation (selectedCity="Bandung"):');
            const selectedCity = 'Bandung';
            let matches = false;
            
            if (aditiaProfile.location && aditiaProfile.location.toLowerCase().includes(selectedCity.toLowerCase())) {
                console.log(`   ✅ Location match: "${aditiaProfile.location}" includes "${selectedCity}"`);
                matches = true;
            } else if (aditiaProfile.city && aditiaProfile.city.toLowerCase().includes(selectedCity.toLowerCase())) {
                console.log(`   ✅ City match: "${aditiaProfile.city}" includes "${selectedCity}"`);
                matches = true;
            } else {
                console.log(`   ❌ No match: location="${aditiaProfile.location}", city="${aditiaProfile.city}"`);
            }
            
            console.log(`\n   Result: ${matches ? '✅ WOULD SHOW on homepage' : '❌ WOULD NOT SHOW on homepage'}`);
        } else {
            console.log('\n❌ Aditia not found');
        }
        
        // Test 3: Check all therapists with location but no city
        console.log('\n\n📍 Test 3: Therapists with location field but NULL city');
        console.log('-'.repeat(60));
        
        const allTherapists = await databases.listDocuments(
            databaseId,
            therapistCollectionId,
            [Query.limit(500)]
        );
        
        const locationNoCityTherapists = allTherapists.documents.filter(t => t.location && !t.city);
        
        console.log(`\nFound ${locationNoCityTherapists.length} therapists with location but no city:`);
        
        for (const therapist of locationNoCityTherapists.slice(0, 10)) {
            console.log(`\n👤 ${therapist.name}`);
            console.log(`   city: NULL`);
            console.log(`   location: "${therapist.location}"`);
            console.log(`   ⚠️ This would cause dashboard to default to "all" on load!`);
        }
        
        // Test 4: Summary statistics
        console.log('\n\n📊 Summary Statistics');
        console.log('='.repeat(60));
        
        const stats = {
            total: allTherapists.documents.length,
            hasBothFields: 0,
            hasOnlyCity: 0,
            hasOnlyLocation: 0,
            hasNeither: 0
        };
        
        for (const therapist of allTherapists.documents) {
            if (therapist.city && therapist.location) {
                stats.hasBothFields++;
            } else if (therapist.city && !therapist.location) {
                stats.hasOnlyCity++;
            } else if (!therapist.city && therapist.location) {
                stats.hasOnlyLocation++;
            } else {
                stats.hasNeither++;
            }
        }
        
        console.log(`\nTotal therapists: ${stats.total}`);
        console.log(`  ✅ Both city AND location: ${stats.hasBothFields} (${Math.round(stats.hasBothFields/stats.total*100)}%)`);
        console.log(`  ⚠️ Only city: ${stats.hasOnlyCity} (${Math.round(stats.hasOnlyCity/stats.total*100)}%)`);
        console.log(`  ⚠️ Only location: ${stats.hasOnlyLocation} (${Math.round(stats.hasOnlyLocation/stats.total*100)}%)`);
        console.log(`  ❌ Neither: ${stats.hasNeither} (${Math.round(stats.hasNeither/stats.total*100)}%)`);
        
        console.log('\n✅ DIAGNOSIS COMPLETE\n');
        
    } catch (error) {
        console.error('\n❌ Error:', error.message);
        console.error('Stack:', error.stack);
    }
}

testLocationPersistence();
