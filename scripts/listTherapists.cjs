/**
 * List all therapists in the database
 */

const { Client, Databases } = require('node-appwrite');

const client = new Client()
    .setEndpoint('https://syd.cloud.appwrite.io/v1')
    .setProject('68f23b11000d25eb3664')
    .setKey('standard_d1c5d94d90b80a5c50e5dc20dc98a6e76f51e40e5d13a6f7c074e84f5a14e1c2cebfe56b2e6ee8ced7ff8d4b1de0c50ce654aa0ba19df4e065c56f72e02fd04e4f7a6ae5c3e8dad07dfd98a3e00dc24e97c39b31f8c32efa30f39e29dc2d2ed22a9b0a0d5c2f3bfe0e9a9c5d5f1f7b5a7e0f4e8d3c6b9f1e5d8a2c7f4b1');

const databases = new Databases(client);
const databaseId = '68f76ee1000e64ca8d05';
const therapistsCollectionId = 'therapists_collection_id'; // Actual collection ID

async function listTherapists() {
    try {
        console.log('🔍 Fetching all therapists from database...\n');
        
        const response = await databases.listDocuments(
            databaseId,
            therapistsCollectionId,
            []
        );
        
        console.log(`Found ${response.documents.length} therapist(s)\n`);
        console.log('='.repeat(80));
        
        if (response.documents.length === 0) {
            console.log('❌ No therapists found in the database!');
            console.log('\n💡 You need to create therapists either by:');
            console.log('   1. Registering via the therapist registration page');
            console.log('   2. Using a script to add therapists');
            console.log('   3. Manually adding them in Appwrite console');
        } else {
            response.documents.forEach((therapist, index) => {
                console.log(`\n${index + 1}. ${therapist.name || 'Unnamed'}`);
                console.log(`   ID: ${therapist.$id}`);
                console.log(`   Email: ${therapist.email || 'N/A'}`);
                console.log(`   WhatsApp: ${therapist.whatsappNumber || 'N/A'}`);
                console.log(`   Location: ${therapist.location || 'N/A'}`);
                console.log(`   Is Live: ${therapist.isLive ? '✅ YES' : '❌ NO'}`);
                console.log(`   Status: ${therapist.status || 'N/A'}`);
                
                if (therapist.pricing) {
                    try {
                        const pricing = typeof therapist.pricing === 'string' 
                            ? JSON.parse(therapist.pricing) 
                            : therapist.pricing;
                        console.log(`   Pricing: 60min=${pricing['60']}k, 90min=${pricing['90']}k, 120min=${pricing['120']}k`);
                    } catch (e) {
                        console.log(`   Pricing: ${therapist.pricing}`);
                    }
                }
                
                console.log('-'.repeat(80));
            });
            
            console.log(`\n📊 Summary:`);
            const liveCount = response.documents.filter(t => t.isLive).length;
            console.log(`   Total: ${response.documents.length}`);
            console.log(`   Live (visible on home page): ${liveCount}`);
            console.log(`   Not Live: ${response.documents.length - liveCount}`);
        }
        
    } catch (error) {
        console.error('❌ Error fetching therapists:', error.message);
    }
}

listTherapists();
