/**
 * Get ACTUAL Collection IDs (not names)
 * This will show the real collection $id values that should be used in .env
 */

require('dotenv').config();

const { Client, Databases } = require('node-appwrite');

const client = new Client()
    .setEndpoint(process.env.VITE_APPWRITE_ENDPOINT)
    .setProject(process.env.VITE_APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);

async function getActualCollectionIds() {
    try {
        console.log('🔍 Getting ACTUAL Collection IDs (not names)...\n');
        
        // Get all collections
        const response = await databases.listCollections(process.env.VITE_APPWRITE_DATABASE_ID);
        
        console.log(`Found ${response.collections.length} collections:\n`);
        
        const targetCollections = ['therapist', 'place', 'facial', 'user', 'booking', 'message', 'chat', 'hotel'];
        
        console.log('🎯 COLLECTIONS BY CATEGORY:\n');
        
        targetCollections.forEach(target => {
            console.log(`📋 ${target.toUpperCase()}-RELATED COLLECTIONS:`);
            
            const matches = response.collections.filter(col => 
                col.name.toLowerCase().includes(target) || 
                col.$id.toLowerCase().includes(target)
            );
            
            if (matches.length > 0) {
                matches.forEach(col => {
                    console.log(`   ✅ ${col.name}`);
                    console.log(`      ID: ${col.$id} ← USE THIS IN .ENV`);
                    console.log(`      Documents: ${col.documentsCount || 'Unknown'}`);
                });
            } else {
                console.log(`   ❌ No ${target} collections found`);
            }
            console.log('');
        });
        
        console.log('🔧 RECOMMENDED .ENV UPDATES:\n');
        
        // Find the most likely matches
        const therapistCol = response.collections.find(c => 
            c.name.toLowerCase().includes('therapist') || c.$id.toLowerCase().includes('therapist')
        );
        const placeCol = response.collections.find(c => 
            c.name.toLowerCase().includes('place') || c.$id.toLowerCase().includes('place')
        );
        const facialCol = response.collections.find(c => 
            c.name.toLowerCase().includes('facial') || c.$id.toLowerCase().includes('facial')
        );
        const userCol = response.collections.find(c => 
            c.name.toLowerCase().includes('user') || c.$id.toLowerCase().includes('user')
        );
        const bookingCol = response.collections.find(c => 
            c.name.toLowerCase().includes('booking') || c.$id.toLowerCase().includes('booking')
        );
        const messageCol = response.collections.find(c => 
            c.name.toLowerCase() === 'messages' || c.$id.toLowerCase() === 'messages'
        );
        const chatCol = response.collections.find(c => 
            c.name.toLowerCase().includes('chat_messages') || c.$id.toLowerCase().includes('chat_messages')
        );
        
        if (therapistCol) {
            console.log(`VITE_THERAPISTS_COLLECTION_ID=${therapistCol.$id}`);
        }
        if (placeCol) {
            console.log(`VITE_PLACES_COLLECTION_ID=${placeCol.$id}`);
        }
        if (facialCol) {
            console.log(`VITE_FACIAL_PLACES_COLLECTION_ID=${facialCol.$id}`);
        }
        if (userCol) {
            console.log(`VITE_USERS_COLLECTION_ID=${userCol.$id}`);
        }
        if (bookingCol) {
            console.log(`VITE_BOOKINGS_COLLECTION_ID=${bookingCol.$id}`);
        }
        if (messageCol) {
            console.log(`VITE_MESSAGES_COLLECTION_ID=${messageCol.$id}`);
        }
        if (chatCol) {
            console.log(`VITE_CHAT_MESSAGES_COLLECTION_ID=${chatCol.$id}`);
        }
        
        console.log('\n🔒 SAFETY NOTE:');
        console.log('These are the ACTUAL collection IDs that contain your data.');
        console.log('Update your .env file with these exact values to restore connectivity.');
        
    } catch (error) {
        console.error('❌ Error getting collections:', error);
    }
}

getActualCollectionIds();