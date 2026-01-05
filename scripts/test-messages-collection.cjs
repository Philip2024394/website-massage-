const { Client, Databases, Query } = require('node-appwrite');

const client = new Client()
    .setEndpoint('https://syd.cloud.appwrite.io/v1')
    .setProject('68f23b11000d25eb3664')
    .setKey(process.env.APPWRITE_API_KEY || ''); // Need API key for server-side

const databases = new Databases(client);

async function testMessagesCollection() {
    console.log('🔍 Testing Messages collection connection...\n');
    
    const databaseId = '68f76ee1000e64ca8d05';
    const collectionId = 'Messages'; // As defined in config
    
    console.log('Database ID:', databaseId);
    console.log('Collection ID:', collectionId);
    console.log('');
    
    try {
        // Try to list documents from Messages collection
        console.log('Attempting to fetch messages...');
        const response = await databases.listDocuments(
            databaseId,
            collectionId,
            [Query.limit(1)]
        );
        
        console.log('✅ SUCCESS! Messages collection exists and is accessible');
        console.log('Documents count:', response.total);
        console.log('');
        
        if (response.documents.length > 0) {
            console.log('Sample message structure:');
            console.log(JSON.stringify(response.documents[0], null, 2));
        }
        
    } catch (error) {
        console.error('❌ ERROR accessing Messages collection:');
        console.error('Error code:', error.code);
        console.error('Error message:', error.message);
        console.error('Error type:', error.type);
        console.error('');
        
        if (error.code === 404) {
            console.log('💡 The Messages collection does not exist or has a different ID');
            console.log('   Please check Appwrite Console for the correct collection ID');
        } else if (error.code === 401) {
            console.log('💡 Permission denied - check collection permissions');
            console.log('   Or set APPWRITE_API_KEY environment variable for testing');
        }
    }
}

testMessagesCollection();
