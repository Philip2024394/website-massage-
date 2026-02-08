// INFRASTRUCTURE DIAGNOSTIC TEST
// Check Appwrite connection and chat collections

import { Client, Databases } from 'appwrite';

const client = new Client()
    .setEndpoint('https://syd.cloud.appwrite.io/v1')
    .setProject('68f23b11000d25eb3664');

const databases = new Databases(client);
const DATABASE_ID = '68f76ee1000e64ca8d05';

async function runDiagnostics() {
    console.log('🔍 APPWRITE INFRASTRUCTURE DIAGNOSTIC');
    console.log('=====================================');
    
    try {
        // 1. Test basic connection
        console.log('1. Testing basic Appwrite connection...');
        const collections = await databases.listCollections(DATABASE_ID);
        console.log(`✅ Connection OK - Found ${collections.collections.length} collections`);
        
        // 2. Look for chat-related collections
        console.log('\n2. Searching for chat collections...');
        const chatCollections = collections.collections.filter(col => 
            col.$id.includes('chat') || 
            col.$id.includes('message') ||
            col.name.toLowerCase().includes('chat') ||
            col.name.toLowerCase().includes('message')
        );
        
        if (chatCollections.length === 0) {
            console.log('❌ NO CHAT COLLECTIONS FOUND!');
            console.log('This is the ROOT CAUSE - chat_messages collection does not exist');
        } else {
            console.log(`✅ Found ${chatCollections.length} chat collections:`);
            chatCollections.forEach(col => {
                console.log(`   - ID: ${col.$id}, Name: ${col.name}`);
            });
        }
        
        // 3. Test specific collections used in code
        console.log('\n3. Testing specific collections...');
        const testCollections = [
            'chat_sessions',
            'chat_messages', 
            'messages',
            'admin_messages'
        ];
        
        for (const collectionId of testCollections) {
            try {
                const collection = await databases.getCollection(DATABASE_ID, collectionId);
                console.log(`✅ ${collectionId} - EXISTS (${collection.name})`);
            } catch (error: any) {
                if (error.code === 404) {
                    console.log(`❌ ${collectionId} - NOT FOUND (404)`);
                } else {
                    console.log(`❌ ${collectionId} - ERROR: ${error.message}`);
                }
            }
        }
        
        // 4. Test realtime connection
        console.log('\n4. Testing realtime WebSocket connection...');
        let realtimeConnected = false;
        
        const unsubscribe = client.subscribe('account', (response) => {
            console.log('✅ Realtime connection working');
            realtimeConnected = true;
            unsubscribe();
        });
        
        // Wait 3 seconds to test connection
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        if (!realtimeConnected) {
            console.log('❌ Realtime WebSocket connection FAILED');
            console.log('This could be the cause of chat not opening');
        }
        
        unsubscribe();
        
    } catch (error: any) {
        console.error('❌ CRITICAL ERROR:', error.message);
        if (error.code) {
            console.error(`   Error Code: ${error.code}`);
        }
        if (error.response) {
            console.error(`   Response: ${JSON.stringify(error.response, null, 2)}`);
        }
    }
    
    console.log('\n🎯 NEXT STEPS:');
    console.log('1. If chat collections are missing, create them in Appwrite Console');
    console.log('2. If realtime fails, check Appwrite project settings');
    console.log('3. Verify permissions allow "Any" role to read collections');
}

runDiagnostics();