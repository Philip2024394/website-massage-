import { Client, Databases, Query } from 'node-appwrite';

const client = new Client()
    .setEndpoint('https://syd.cloud.appwrite.io/v1')
    .setProject('68f23b11000d25eb3664');

const databases = new Databases(client);

async function findEla() {
    try {
        // Search for Ela
        const results = await databases.listDocuments(
            '68f76ee1000e64ca8d05',
            'therapists_collection_id',
            [
                Query.or([
                    Query.contains('name', 'Ela'),
                    Query.contains('name', 'ela')
                ]),
                Query.limit(10)
            ]
        );
        
        console.log('\n🔍 Search Results for "Ela":');
        console.log('='.repeat(50));
        
        if (results.documents.length === 0) {
            console.log('❌ No therapist named Ela found');
            
            // List all Yogyakarta therapists
            console.log('\n📋 All Yogyakarta therapists:');
            const allYogya = await databases.listDocuments(
                '68f76ee1000e64ca8d05',
                'therapists_collection_id',
                [
                    Query.or([
                        Query.contains('location', 'Yogya'),
                        Query.contains('city', 'Yogya')
                    ]),
                    Query.limit(50)
                ]
            );
            
            allYogya.documents.forEach(doc => {
                console.log(`  - ${doc.name} (ID: ${doc.$id})`);
            });
        } else {
            results.documents.forEach(doc => {
                console.log(`✅ Found: ${doc.name}`);
                console.log(`   ID: ${doc.$id}`);
                console.log(`   Location: ${doc.location || doc.city || 'N/A'}`);
                console.log(`   Status: ${doc.status || 'N/A'}`);
                console.log('');
            });
        }
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

findEla();
