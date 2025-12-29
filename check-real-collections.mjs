import { Client, Databases } from 'node-appwrite';

const client = new Client()
    .setEndpoint('https://syd.cloud.appwrite.io/v1')
    .setProject('68f23b11000d25eb3664')
    .setKey('standard_39f2b1fe7bcc0c48e9e2ad6fc1a9c29c84c14bb0ae4dd4ce88a68e12e5c85bf6d4974b86a19ea7c88d1c82856ccae09f96abaaca91b2eb0aa7e5a02d79e2269c2f5c2ef8b18c77feeee4d9b66c6eb07c72e4f0e7fc1e4266062e28a3c9c43b3a79e49ee28e41bca065a35d58f1d5cd0bbacf03f75c4c2da90bd74f9b20154c5a');

const databases = new Databases(client);

async function checkCollections() {
    try {
        console.log('\n=== ACTUAL APPWRITE COLLECTIONS ===\n');
        const res = await databases.listCollections('68f76ee1000e64ca8d05');
        
        res.collections.forEach((c, i) => {
            console.log(`${i+1}. NAME: "${c.name}"`);
            console.log(`   ID: ${c.$id}`);
            console.log(`   Documents: ${c.documentSecurity ? 'Secured' : 'Public'}`);
            console.log('');
        });
        
        console.log('\n=== COLLECTIONS WE ARE TRYING TO USE ===\n');
        console.log('THERAPISTS: 676703b40009b9dd33de');
        console.log('PLACES: 6767038a003b7bdff200');
        console.log('USERS: 67670355000b2bc99d43');
        console.log('HOTELS: 676701f9001e6dc8b278');
        
    } catch (error) {
        console.error('Error:', error.message);
    }
}

checkCollections();
