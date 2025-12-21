const { Client, Databases } = require('node-appwrite');

const config = {
    endpoint: 'https://syd.cloud.appwrite.io/v1',
    projectId: '68f23b11000d25eb3664',
    databaseId: '68f76ee1000e64ca8d05',
    collections: {
        therapists: 'therapists_collection_id'
    }
};

console.log('🔍 CHECKING THERAPIST LOCATIONS...\n');

const client = new Client()
    .setEndpoint(config.endpoint)
    .setProject(config.projectId)
    .setKey('standard_0a9ff2646235d8dd067b3f7cab00e3fb21977a5d5aca23732d99ee0d07f888ae929c73f6c75fe27f4aba04b47b562b85dd5027dc9d7d564fcd446c8565a9ba5c9b52688286534228f188165d6b24fbb7b88af9b8e1e12d6b2d6dbc21ac964647da055b5806a7e104c0e994e4b528ecab44a29c55cfce99cd98dc454e27136ca0');

const databases = new Databases(client);

async function checkTherapistLocations() {
    try {
        const response = await databases.listDocuments(
            config.databaseId,
            config.collections.therapists
        );

        console.log(`📊 Found ${response.documents.length} therapists\n`);
        console.log('='.repeat(80));
        
        response.documents.forEach((therapist, index) => {
            console.log(`\n${index + 1}. ${therapist.name || 'Unnamed'}`);
            console.log(`   ID: ${therapist.$id}`);
            console.log(`   Location: ${therapist.location || 'Not set'}`);
            console.log(`   City: ${therapist.city || 'Not set'}`);
            console.log(`   Latitude: ${therapist.latitude || 'Not set'}`);
            console.log(`   Longitude: ${therapist.longitude || 'Not set'}`);
            console.log(`   isLive: ${therapist.isLive}`);
            console.log(`   Status: ${therapist.status || 'Not set'}`);
        });

        console.log('\n' + '='.repeat(80));
        
        // Check specifically for Yogyakarta/Jogja
        const yogyaTherapists = response.documents.filter(t => 
            (t.location && (t.location.toLowerCase().includes('yogya') || t.location.toLowerCase().includes('jogja'))) ||
            (t.city && (t.city.toLowerCase().includes('yogya') || t.city.toLowerCase().includes('jogja')))
        );

        console.log(`\n🎯 Therapists in Yogyakarta/Jogja: ${yogyaTherapists.length}`);
        
        if (yogyaTherapists.length > 0) {
            console.log('\nYogyakarta/Jogja Therapists:');
            yogyaTherapists.forEach((t, i) => {
                console.log(`  ${i + 1}. ${t.name} - ${t.location || t.city}`);
            });
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
        if (error.response) {
            console.error('Response:', error.response);
        }
    }
}

checkTherapistLocations();
