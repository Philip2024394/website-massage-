import { Client, Databases, Query } from 'node-appwrite';

const client = new Client()
    .setEndpoint('https://syd.cloud.appwrite.io/v1')
    .setProject('678efbc300103c1c7e25');

const databases = new Databases(client);

async function findWinda() {
    try {
        // Search for Winda
        const results = await databases.listDocuments(
            '678efc3e001e0ad07207',
            '678efc570016c6d0ae88',
            [
                Query.or([
                    Query.contains('name', 'Winda'),
                    Query.contains('name', 'winda')
                ]),
                Query.limit(10)
            ]
        );
        
        console.log('\n🔍 Search Results for "Winda":');
        console.log('='.repeat(50));
        
        if (results.documents.length === 0) {
            console.log('❌ No therapist named Winda found');
            
            // List all Yogyakarta therapists
            console.log('\n📋 All Yogyakarta therapists:');
            const allYogya = await databases.listDocuments(
                '678efc3e001e0ad07207',
                '678efc570016c6d0ae88',
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

findWinda();
