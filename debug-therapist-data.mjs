import { Client, Databases, Query } from 'node-appwrite';

const client = new Client()
    .setEndpoint('https://syd.cloud.appwrite.io/v1')
    .setProject('68f23b11000d25eb3664')
    .setKey('standard_119fa2568669a282b6165b25f53fb8b18991ba76d2e13efa3af9e73d9db214f592521f7f9800264f04e28daec46d21ee23c93ad8e7166002253ee3dd014e835b875db7ba47ab451fd1c7bff78f9f053c3cf6056a107fe51f6df5c479b2f100f56aaf90d6506ee31e5b68f9d1afcd0fe54abf30d8be6a799194487e15c38f9212');

const databases = new Databases(client);
const databaseId = '68f76ee1000e64ca8d05';
const therapistsCollectionId = 'therapists_collection_id';

console.log('='.repeat(80));
console.log('🔍 DIRECT APPWRITE THERAPIST DATA QUERY');
console.log('='.repeat(80));
console.log('');
console.log('Configuration:');
console.log('  Database ID:', databaseId);
console.log('  Collection ID:', therapistsCollectionId);
console.log('');

try {
    // Query therapists
    const response = await databases.listDocuments(
        databaseId,
        therapistsCollectionId,
        [Query.limit(500)]
    );
    
    console.log('✅ QUERY SUCCESSFUL');
    console.log('');
    console.log('📊 TOTAL COUNT:', response.total);
    console.log('📦 DOCUMENTS FETCHED:', response.documents.length);
    console.log('');
    
    if (response.documents.length === 0) {
        console.log('❌ NO THERAPISTS FOUND IN COLLECTION!');
        console.log('   This is the root cause - collection is empty.');
        process.exit(1);
    }
    
    // Analyze first document structure
    const firstDoc = response.documents[0];
    console.log('📄 SAMPLE DOCUMENT (First Therapist):');
    console.log('-'.repeat(80));
    console.log('ID:', firstDoc.$id);
    console.log('Name:', firstDoc.name);
    console.log('');
    
    // Check critical filter fields
    console.log('🔍 CRITICAL FILTER FIELDS:');
    console.log('-'.repeat(80));
    console.log('isLive:', firstDoc.isLive, `(type: ${typeof firstDoc.isLive})`);
    console.log('status:', firstDoc.status);
    console.log('availability:', firstDoc.availability);
    console.log('coordinates:', firstDoc.coordinates);
    console.log('location:', firstDoc.location);
    console.log('city:', firstDoc.city);
    console.log('');
    
    // Check all therapists' isLive status
    const liveCount = response.documents.filter(t => t.isLive === true).length;
    const notLiveCount = response.documents.filter(t => t.isLive === false).length;
    const nullLiveCount = response.documents.filter(t => t.isLive === null || t.isLive === undefined).length;
    
    console.log('📈 isLive DISTRIBUTION:');
    console.log('-'.repeat(80));
    console.log('  isLive = true:', liveCount);
    console.log('  isLive = false:', notLiveCount);
    console.log('  isLive = null/undefined:', nullLiveCount);
    console.log('');
    
    // Check status distribution
    const statuses = {};
    response.documents.forEach(t => {
        const status = t.status || 'null';
        statuses[status] = (statuses[status] || 0) + 1;
    });
    
    console.log('📈 STATUS DISTRIBUTION:');
    console.log('-'.repeat(80));
    Object.entries(statuses).forEach(([status, count]) => {
        console.log(`  "${status}": ${count}`);
    });
    console.log('');
    
    // Check coordinates
    const withCoords = response.documents.filter(t => t.coordinates).length;
    const withoutCoords = response.documents.filter(t => !t.coordinates).length;
    
    console.log('📈 COORDINATES:');
    console.log('-'.repeat(80));
    console.log('  With coordinates:', withCoords);
    console.log('  Without coordinates:', withoutCoords);
    console.log('');
    
    // Show first 10 therapist names and their filter-relevant fields
    console.log('👥 FIRST 10 THERAPISTS:');
    console.log('-'.repeat(80));
    response.documents.slice(0, 10).forEach((t, i) => {
        console.log(`${i + 1}. ${t.name || 'NO NAME'}`);
        console.log(`   isLive: ${t.isLive} | status: ${t.status} | location: ${t.location || 'none'}`);
    });
    console.log('');
    
    // FILTER ANALYSIS
    console.log('🚨 FILTER ANALYSIS:');
    console.log('='.repeat(80));
    
    // HomePage filters therapists by:
    // 1. isLive or shouldTreatTherapistAsLive (checks isLive, status)
    // 2. Location/city matching
    
    const passLiveFilter = response.documents.filter(t => {
        // Mimic shouldTreatTherapistAsLive logic
        const isLive = t.isLive;
        const status = (t.status || t.availability || '').toString().trim().toLowerCase();
        const statusImpliesLive = status === 'available' || status === 'busy' || status === 'offline' || status === 'online';
        
        if (isLive === false) return false;
        if (isLive === true) return true;
        if (statusImpliesLive) return true;
        return status.length === 0; // Default to visible
    });
    
    console.log('');
    console.log('FILTER 1 - shouldTreatTherapistAsLive():');
    console.log(`  ✅ Pass: ${passLiveFilter.length} / ${response.documents.length}`);
    console.log(`  ❌ Fail: ${response.documents.length - passLiveFilter.length}`);
    
    if (passLiveFilter.length === 0) {
        console.log('');
        console.log('❌ ROOT CAUSE: ALL THERAPISTS FILTERED BY isLive CHECK!');
        console.log('   None pass shouldTreatTherapistAsLive() function.');
        console.log('');
        console.log('   Fix: Update therapist documents in Appwrite:');
        console.log('   - Set isLive = true, OR');
        console.log('   - Set status = "available" or "busy" or "offline"');
    }
    
    const passLocationFilter = passLiveFilter.filter(t => {
        // Check if has coordinates or location string
        return t.coordinates || t.location || t.city;
    });
    
    console.log('');
    console.log('FILTER 2 - Has location data (coordinates/location/city):');
    console.log(`  ✅ Pass: ${passLocationFilter.length} / ${passLiveFilter.length}`);
    console.log(`  ❌ Fail: ${passLiveFilter.length - passLocationFilter.length}`);
    
    if (passLocationFilter.length === 0 && passLiveFilter.length > 0) {
        console.log('');
        console.log('❌ ROOT CAUSE: THERAPISTS PASS isLive BUT HAVE NO LOCATION DATA!');
        console.log('   Fix: Add coordinates or location field to therapist documents.');
    }
    
    console.log('');
    console.log('='.repeat(80));
    console.log('✅ DIAGNOSIS COMPLETE');
    console.log('='.repeat(80));
    
    if (passLocationFilter.length > 0) {
        console.log('');
        console.log('✅ GOOD NEWS: ', passLocationFilter.length, 'therapists should be visible!');
        console.log('');
        console.log('Next steps:');
        console.log('1. Check browser console for [STAGE 1] through [STAGE 6] logs');
        console.log('2. Verify activeTab is set to "home"');
        console.log('3. Check if selectedCity filter is too restrictive');
    }
    
} catch (error) {
    console.error('');
    console.error('❌ QUERY FAILED:', error.message);
    console.error('');
    console.error('Possible causes:');
    console.error('1. Wrong collection ID');
    console.error('2. Network/permissions issue');
    console.error('3. API key invalid');
    console.error('');
    console.error('Full error:', error);
}
