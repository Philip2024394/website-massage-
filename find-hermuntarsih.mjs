import { Client, Databases, Query } from 'node-appwrite';

const client = new Client();
const databases = new Databases(client);

client
    .setEndpoint('https://syd.cloud.appwrite.io/v1')
    .setProject('68f23b11000d25eb3664')
    .setKey('standard_39f2b1fe7bcc0c48e9e2ad6fc1a9c29c84c14bb0ae4dd4ce88a68e12e5c85bf6d4974b86a19ea7c88d1c82856ccae09f96abaaca91b2eb0aa7e5a02d79e2269c2f5c2ef8b18c77feeee4d9b66c6eb07c72e4f0e7fc1e4266062e28a3c9c43b3a79e49ee28e41bca065a35d58f1d5cd0bbacf03f75c4c2da90bd74f9b20154c5a');

const DATABASE_ID = '68f76ee1000e64ca8d05';
const THERAPISTS_COLLECTION_ID = 'therapists_collection_id';

async function findHermuntarsih() {
    try {
        console.log('🔍 Searching for Hermuntarsih...\n');
        
        // Get all therapists
        const response = await databases.listDocuments(
            DATABASE_ID,
            THERAPISTS_COLLECTION_ID,
            [Query.limit(500)]
        );
        
        console.log(`📊 Total therapists in database: ${response.total}`);
        
        // Search for Hermuntarsih
        const hermun = response.documents.filter(t => 
            t.name && t.name.toLowerCase().includes('hermun')
        );
        
        if (hermun.length === 0) {
            console.log('\n❌ Hermuntarsih NOT found in database');
            console.log('\n📋 All therapist names:');
            response.documents.forEach((t, i) => {
                console.log(`${i + 1}. ${t.name || 'No name'}`);
            });
        } else {
            console.log(`\n✅ Found ${hermun.length} therapist(s) matching "hermun":\n`);
            hermun.forEach(t => {
                console.log('--- Therapist Details ---');
                console.log('Name:', t.name);
                console.log('ID:', t.$id);
                console.log('Email:', t.email);
                console.log('Status:', t.status);
                console.log('isLive:', t.isLive);
                console.log('City:', t.city);
                console.log('Location:', t.location);
                console.log('Created:', t.$createdAt);
                console.log('------------------------\n');
            });
        }
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

findHermuntarsih();
