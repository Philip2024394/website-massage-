import { Client, Databases } from 'node-appwrite';

const client = new Client()
    .setEndpoint('https://syd.cloud.appwrite.io/v1')
    .setProject('68f23b11000d25eb3664')
    .setKey('standard_119fa2568669a282b6165b25f53fb8b18991ba76d2e13efa3af9e73d9db214f592521f7f9800264f04e28daec46d21ee23c93ad8e7166002253ee3dd014e835b875db7ba47ab451fd1c7bff78f9f053c3cf6056a107fe51f6df5c479b2f100f56aaf90d6506ee31e5b68f9d1afcd0fe54abf30d8be6a799194487e15c38f9212');

const databases = new Databases(client);
const databaseId = '68f76ee1000e64ca8d05';

// Real collection IDs to test
const collections = {
    therapists: '673d17fb0028fddd90e8',
    places: '673d184c000817b936e2',
    bookings: '675e13fc002aaf0777ce',
    reviews: '6752e724002ee159c0f5',
    chatMessages: '6761241100372a5338d1',
    chatRooms: '6761241900398c596516'
};

async function testCollection(name, collectionId) {
    console.log(`\n🔍 Testing ${name} collection (${collectionId})...`);
    
    try {
        const response = await databases.listDocuments(
            databaseId,
            collectionId,
            []
        );
        
        console.log(`✅ ${name}: ${response.documents.length} documents found`);
        
        if (response.documents.length > 0) {
            const sample = response.documents[0];
            const nameField = sample.name || sample.therapistName || sample.placeName || sample.title || 'No name field';
            console.log(`   📄 Sample: ${nameField}`);
            
            // Show key fields for therapists
            if (name === 'therapists' && sample.coordinate) {
                console.log(`   📍 Location: ${sample.coordinate.lat}, ${sample.coordinate.lng}`);
                console.log(`   🏙️ City: ${sample.city || 'not set'}`);
                console.log(`   ⭐ Status: ${sample.isLive ? 'Live' : 'Offline'}`);
            }
        }
        
        return true;
    } catch (error) {
        console.error(`❌ ${name} failed: ${error.message} (Code: ${error.code})`);
        
        if (error.code === 404) {
            console.error(`   💡 Collection "${collectionId}" not found in database`);
        } else if (error.code === 401) {
            console.error(`   💡 Permission denied - check collection read permissions`);
        }
        
        return false;
    }
}

async function main() {
    console.log('🚀 Testing Real Appwrite Collection IDs');
    console.log('========================================');
    console.log(`📊 Project: 68f23b11000d25eb3664`);
    console.log(`📊 Database: ${databaseId}`);
    
    let successCount = 0;
    let totalCount = 0;
    
    for (const [name, collectionId] of Object.entries(collections)) {
        totalCount++;
        const success = await testCollection(name, collectionId);
        if (success) successCount++;
    }
    
    console.log(`\n📈 SUMMARY: ${successCount}/${totalCount} collections accessible`);
    
    if (successCount === totalCount) {
        console.log('✅ All collections are working! The issue is CORS, not collection IDs.');
        console.log('💡 Fix: Add "http://127.0.0.1:3000" to Appwrite Console > Settings > Platforms');
    } else {
        console.log('⚠️  Some collections are inaccessible. Check Appwrite Console.');
    }
}

main().catch(console.error);