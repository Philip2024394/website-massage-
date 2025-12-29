/**
 * Comprehensive diagnostic for why Aditia isn't showing in Bandung
 */

import { Client, Databases, Query } from 'node-appwrite';

const client = new Client()
    .setEndpoint('https://syd.cloud.appwrite.io/v1')
    .setProject('68f23b11000d25eb3664');

const databases = new Databases(client);

async function comprehensiveDiagnostic() {
    try {
        console.log('🔍 COMPREHENSIVE DIAGNOSTIC FOR ADITIA\n');
        console.log('=====================================\n');
        
        // 1. Get Aditia's data
        const aditiaResult = await databases.listDocuments(
            '68f76ee1000e64ca8d05',
            'therapists_collection_id',
            [Query.equal('email', 'indastreet29@gmail.com')]
        );
        
        if (aditiaResult.documents.length === 0) {
            console.log('❌ Aditia not found!');
            return;
        }
        
        const aditia = aditiaResult.documents[0];
        
        console.log('1️⃣  ADITIA\'S DATA');
        console.log('   Name:', aditia.name);
        console.log('   Email:', aditia.email);
        console.log('   Status:', aditia.status);
        console.log('   Location field:', aditia.location || 'NOT SET');
        console.log('   City field:', aditia.city || 'NOT SET');
        console.log('   isLive:', aditia.isLive);
        console.log('');
        
        // 2. Test live status logic
        console.log('2️⃣  LIVE STATUS CHECK');
        const status = (aditia.status || '').toString().trim().toLowerCase();
        const statusImpliesLive = status === 'available' || status === 'busy' || status === 'online';
        console.log('   Status:', status);
        console.log('   Status implies live:', statusImpliesLive ? '✅ YES' : '❌ NO');
        console.log('');
        
        // 3. Test location matching
        console.log('3️⃣  LOCATION MATCHING');
        const selectedCity = 'Bandung';
        const locationMatch = aditia.location && aditia.location.toLowerCase().includes(selectedCity.toLowerCase());
        console.log('   Aditia location:', aditia.location || 'NOT SET');
        console.log('   Filter city:', selectedCity);
        console.log('   Location matches:', locationMatch ? '✅ YES' : '❌ NO');
        console.log('');
        
        // 4. Get all Bandung therapists
        console.log('4️⃣  ALL BANDUNG THERAPISTS');
        const allTherapists = await databases.listDocuments(
            '68f76ee1000e64ca8d05',
            'therapists_collection_id',
            [Query.limit(500)]
        );
        
        const bandungTherapists = allTherapists.documents.filter((t) => {
            if (!t.location && !t.city) return false;
            const location = (t.location || '').toLowerCase();
            const city = (t.city || '').toLowerCase();
            return location.includes('bandung') || city.includes('bandung');
        });
        
        console.log(`   Total therapists in database: ${allTherapists.documents.length}`);
        console.log(`   Bandung therapists found: ${bandungTherapists.length}`);
        console.log('');
        console.log('   Bandung therapists list:');
        bandungTherapists.forEach((t, i) => {
            console.log(`   ${i + 1}. ${t.name}`);
            console.log(`      Status: ${t.status}`);
            console.log(`      Location: ${t.location || 'NOT SET'}`);
            console.log(`      City: ${t.city || 'NOT SET'}`);
            console.log(`      Email: ${t.email || 'NOT SET'}`);
        });
        
        // 5. Check if Aditia is in the list
        console.log('');
        console.log('5️⃣  IS ADITIA IN BANDUNG LIST?');
        const aditiaInList = bandungTherapists.some(t => t.$id === aditia.$id);
        console.log('   ', aditiaInList ? '✅ YES - Should appear on website' : '❌ NO - Won\'t appear');
        
        // 6. Final recommendation
        console.log('');
        console.log('6️⃣  RECOMMENDATION');
        if (!aditiaInList) {
            console.log('   ❌ Aditia is NOT in Bandung therapist list');
            if (!aditia.location && !aditia.city) {
                console.log('   📝 FIX: Aditia needs to set location in dashboard');
            } else {
                console.log('   ⚠️  Location is set but doesn\'t match "Bandung"');
                console.log(`   📝 FIX: Update location from "${aditia.location}" to "Bandung"`);
            }
        } else if (!statusImpliesLive) {
            console.log('   ⚠️  Status is not "available" or "busy"');
            console.log('   📝 FIX: Aditia needs to set status to "available" or "busy"');
        } else {
            console.log('   ✅ Everything looks correct!');
            console.log('   🔄 Try refreshing the website - Aditia should appear in Bandung');
            console.log('   📱 Check that city dropdown is set to "Bandung" on homepage');
        }
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

comprehensiveDiagnostic();
