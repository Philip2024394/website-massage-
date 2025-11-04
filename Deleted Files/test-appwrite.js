// Quick test to check Appwrite connection and list collections
import { Client, Databases } from 'appwrite';

const client = new Client()
    .setEndpoint('https://syd.cloud.appwrite.io/v1')
    .setProject('68f23b11000d25eb3664');

const databases = new Databases(client);

async function testConnection() {
    try {
        console.log('🔗 Testing Appwrite connection...');
        console.log('📊 Database ID:', '68f76ee1000e64ca8d05');
        
        // Use Web API to fetch collections directly
        const response = await fetch('https://syd.cloud.appwrite.io/v1/databases/68f76ee1000e64ca8d05/collections', {
            method: 'GET',
            headers: {
                'X-Appwrite-Project': '68f23b11000d25eb3664',
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP ${response.status}: ${errorText}`);
        }
        
        const data = await response.json();
        
        console.log('✅ Successfully connected to Appwrite!');
        console.log('📋 Collections found:', data.total || data.collections?.length || 0);
        
        const collections = data.collections || [];
        collections.forEach((collection, index) => {
            console.log(`${index + 1}. Collection Name: "${collection.name}"`);
            console.log(`   Collection ID: "${collection.$id}"`);
            console.log(`   Enabled: ${collection.enabled}`);
            console.log('   ---');
        });
        
        // Generate the config object
        console.log('\n🔧 COPY THIS TO YOUR appwrite.config.ts:');
        console.log('collections: {');
        collections.forEach(collection => {
            // Create appropriate key names based on collection names
            const name = collection.name.toLowerCase();
            let key = name;
            
            // Map common naming patterns
            if (name.includes('therapist')) key = 'therapists';
            else if (name.includes('place')) key = 'places';
            else if (name.includes('user')) key = 'users';
            else if (name.includes('booking')) key = 'bookings';
            else if (name.includes('chat')) key = 'chats';
            else if (name.includes('message')) key = 'messages';
            else if (name.includes('coin') && name.includes('shop')) key = 'coinShop';
            else if (name.includes('coin')) key = 'coins';
            else if (name.includes('discount')) key = 'discounts';
            else if (name.includes('notification')) key = 'notifications';
            else if (name.includes('review')) key = 'reviews';
            else if (name.includes('payment')) key = 'payments';
            
            console.log(`    ${key}: '${collection.$id}',`);
        });
        console.log('}');
        
    } catch (error) {
        console.error('❌ Error connecting to Appwrite:', error.message);
        if (error.message.includes('404')) {
            console.log('💡 This might mean:');
            console.log('   - Database ID is incorrect');
            console.log('   - Database does not exist');
            console.log('   - Project ID is incorrect');
        } else if (error.message.includes('401')) {
            console.log('💡 This might mean:');
            console.log('   - API key/authentication issue');
            console.log('   - Project ID is incorrect');
        }
    }
}

testConnection();