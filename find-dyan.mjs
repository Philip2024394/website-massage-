import { Client, Databases, Query } from 'node-appwrite';

const client = new Client()
    .setEndpoint('https://syd.cloud.appwrite.io/v1')
    .setProject('678efbc300103c1c7e25');

const databases = new Databases(client);

async function findDyan() {
    try {
        console.log('\n🔍 Searching for Dyan...\n');
        
        // Search for Dyan (case variations)
        const results = await databases.listDocuments(
            '678efc3e001e0ad07207',
            '678efc570016c6d0ae88',
            [
                Query.limit(100)
            ]
        );
        
        // Filter for Dyan
        const dyanResults = results.documents.filter(doc => 
            doc.name?.toLowerCase().includes('dyan')
        );
        
        if (dyanResults.length === 0) {
            console.log('❌ No therapist named Dyan found');
            console.log('\n📋 All Yogyakarta therapists:');
            
            const yogyaTherapists = results.documents.filter(doc => {
                const location = (doc.location || doc.city || '').toLowerCase();
                return location.includes('yogya') || location.includes('jogja');
            });
            
            yogyaTherapists.forEach(doc => {
                console.log(`  - ${doc.name} (ID: ${doc.$id})`);
            });
        } else {
            dyanResults.forEach(doc => {
                console.log(`✅ Found: ${doc.name}`);
                console.log(`   ID: ${doc.$id}`);
                console.log(`   Location: ${doc.location || doc.city || 'N/A'}`);
                console.log(`   Status: ${doc.status || 'N/A'}`);
                console.log('');
                
                // Generate share URL
                const shareUrl = `https://www.indastreetmassage.com/therapist-profile/${doc.$id}-${doc.name?.toLowerCase().replace(/\s+/g, '-')}`;
                console.log(`🔗 Share URL: ${shareUrl}`);
                console.log('');
            });
        }
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

findDyan();
