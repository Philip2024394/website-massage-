// Check for duplicate therapist records for indastreet22 user
import { Client, Databases, Query } from 'appwrite';

const client = new Client()
    .setEndpoint('https://syd.cloud.appwrite.io/v1')
    .setProject('68f23b11000d25eb3664');

const databases = new Databases(client);

async function checkDuplicateTherapists() {
    try {
        console.log('🔍 Searching for indastreet22 therapist records...\n');
        
        // Get all therapists
        const response = await databases.listDocuments(
            '68f76ee1000e64ca8d05', // database ID
            'therapists', // collection name - let's try this first
            [Query.limit(100)]
        );
        
        console.log(`📊 Found ${response.documents.length} total therapists`);
        
        // Filter for indastreet22 or similar
        const indastreetTherapists = response.documents.filter(doc => 
            doc.name?.toLowerCase().includes('indastreet') ||
            doc.email?.toLowerCase().includes('indastreet') ||
            doc.name?.toLowerCase().includes('inda')
        );
        
        console.log(`🎯 Found ${indastreetTherapists.length} potential matches for indastreet22:\n`);
        
        indastreetTherapists.forEach((therapist, index) => {
            console.log(`${index + 1}. ${therapist.name || 'NO NAME'}`);
            console.log(`   ID: ${therapist.$id}`);
            console.log(`   Email: ${therapist.email || 'NOT SET'}`);
            console.log(`   isLive: ${therapist.isLive}`);
            console.log(`   Status: ${therapist.status || 'NOT SET'}`);
            console.log(`   City: ${therapist.city || 'NOT SET'}`);
            console.log(`   WhatsApp: ${therapist.whatsappNumber || 'NOT SET'}`);
            console.log(`   Profile Picture: ${therapist.profilePicture ? 'SET' : 'NOT SET'}`);
            console.log(`   Main Image: ${therapist.mainImage ? 'SET' : 'NOT SET'}`);
            console.log(`   Created: ${therapist.$createdAt}`);
            console.log(`   Updated: ${therapist.$updatedAt}`);
            console.log('   ---');
        });
        
        // Show the specific IDs from the console logs
        const dashboardId = '694ed78f9574395fd7b9';
        const homepageId = '694ed78e002b0c06171e';
        
        console.log('\n=== CHECKING SPECIFIC IDS FROM LOGS ===');
        
        for (const id of [dashboardId, homepageId]) {
            try {
                const doc = await databases.getDocument(
                    '68f76ee1000e64ca8d05',
                    'therapists',
                    id
                );
                console.log(`\n✅ Found record ${id}:`);
                console.log(`   Name: ${doc.name}`);
                console.log(`   Email: ${doc.email}`);
                console.log(`   isLive: ${doc.isLive}`);
                console.log(`   Status: ${doc.status}`);
                console.log(`   Profile Picture: ${doc.profilePicture ? 'SET' : 'NOT SET'}`);
                console.log(`   Main Image: ${doc.mainImage ? 'SET' : 'NOT SET'}`);
                console.log(`   Created: ${doc.$createdAt}`);
                console.log(`   Updated: ${doc.$updatedAt}`);
            } catch (error) {
                console.log(`❌ Record ${id} not found or error: ${error.message}`);
            }
        }
        
    } catch (error) {
        console.error('❌ Error checking therapists:', error);
        
        // Try with different collection ID if needed
        if (error.message.includes('Collection')) {
            console.log('\n🔄 Trying with different collection ID...');
            try {
                const response = await databases.listDocuments(
                    '68f76ee1000e64ca8d05',
                    '676703b40009b9dd33de', // from config
                    [Query.limit(100)]
                );
                console.log('✅ Using collection ID: 676703b40009b9dd33de');
                console.log(`📊 Found ${response.documents.length} therapists`);
            } catch (err) {
                console.log('❌ Collection ID 676703b40009b9dd33de also failed:', err.message);
            }
        }
    }
}

checkDuplicateTherapists();