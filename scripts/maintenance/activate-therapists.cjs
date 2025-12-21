const { Client, Databases } = require('node-appwrite');

const config = {
    endpoint: 'https://appwrite.indostreet.com/v1',
    projectId: '68f23b11000d25eb3664',
    databaseId: '68f76ee1000e64ca8d05',
    collections: {
        therapists: 'therapists_collection_id'
    }
};

console.log('🔧 THERAPIST ACTIVATION FIX - Starting...');

const client = new Client()
    .setEndpoint(config.endpoint)
    .setProject(config.projectId)
    .setKey('standard_0a9ff2646235d8dd067b3f7cab00e3fb21977a5d5aca23732d99ee0d07f888ae929c73f6c75fe27f4aba04b47b562b85dd5027dc9d7d564fcd446c8565a9ba5c9b52688286534228f188165d6b24fbb7b88af9b8e1e12d6b2d6dbc21ac964647da055b5806a7e104c0e994e4b528ecab44a29c55cfce99cd98dc454e27136ca0');

const databases = new Databases(client);

async function fixTherapistActivation() {
    try {
        console.log('🔍 Fetching all therapists...');
        const response = await databases.listDocuments(
            config.databaseId,
            config.collections.therapists
        );

        console.log(`📊 Found ${response.documents.length} therapists`);
        
        const therapists = response.documents;
        let updated = 0;
        let errors = 0;

        for (const therapist of therapists) {
            try {
                console.log(`🔄 Activating therapist: ${therapist.name || 'Unnamed'} (${therapist.$id})`);
                
                await databases.updateDocument(
                    config.databaseId,
                    config.collections.therapists,
                    therapist.$id,
                    {
                        isLive: true,
                        status: therapist.status || 'Available',
                        availability: therapist.availability || 'Available',
                        isOnline: true
                    }
                );
                
                console.log(`✅ Activated: ${therapist.name || 'Unnamed'}`);
                updated++;
                
                // Small delay to avoid rate limits
                await new Promise(resolve => setTimeout(resolve, 100));
                
            } catch (error) {
                console.error(`❌ Failed to activate ${therapist.name || 'Unnamed'}:`, error.message);
                errors++;
            }
        }

        console.log('🎉 ACTIVATION COMPLETE!');
        console.log(`✅ Successfully activated: ${updated} therapists`);
        console.log(`❌ Failed activations: ${errors}`);
        
        return {
            success: true,
            total: therapists.length,
            updated,
            errors
        };

    } catch (error) {
        console.error('❌ ACTIVATION FIX FAILED:', error.message);
        return {
            success: false,
            error: error.message
        };
    }
}

fixTherapistActivation().then(result => {
    console.log('🏁 Final result:', JSON.stringify(result, null, 2));
    process.exit(result.success ? 0 : 1);
}).catch(error => {
    console.error('❌ Script failed:', error);
    process.exit(1);
});