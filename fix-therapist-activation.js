console.log('🚀 EMERGENCY FIX - Auto-Activate All Therapists');

// Auto-fix script to activate all therapists
const fixTherapistActivation = async () => {
    console.log('🔧 Starting therapist activation fix...');
    
    try {
        // Import Appwrite
        const { Client, Databases } = Appwrite;
        
        const client = new Client()
            .setEndpoint('https://syd.cloud.appwrite.io/v1')
            .setProject('68f23b11000d25eb3664');

        const databases = new Databases(client);

        // Get all therapists
        console.log('📋 Fetching all therapists...');
        const response = await databases.listDocuments(
            '68f76ee1000e64ca8d05',
            'therapists_collection_id',
            []
        );

        console.log(`✅ Found ${response.documents.length} therapists`);

        // Update each therapist to isLive: true
        let activatedCount = 0;
        for (const therapist of response.documents) {
            const name = therapist.name || therapist.$id;
            
            if (!therapist.isLive) {
                console.log(`🔧 Activating: ${name}`);
                
                await databases.updateDocument(
                    '68f76ee1000e64ca8d05',
                    'therapists_collection_id',
                    therapist.$id,
                    { 
                        isLive: true,
                        status: 'Offline',  // Set default status
                        isOnline: false     // Set default online status
                    }
                );
                
                console.log(`✅ ${name} - ACTIVATED!`);
                activatedCount++;
            } else {
                console.log(`✅ ${name} - Already active`);
            }
        }

        console.log('');
        console.log('🎉 ACTIVATION COMPLETE!');
        console.log(`📊 Activated ${activatedCount} therapists`);
        console.log(`📊 Total active: ${response.documents.length} therapists`);
        console.log('');
        console.log('✅ All therapists can now update their status!');
        console.log('🧪 Test: Go to therapist status page and try changing status');

    } catch (error) {
        console.error('❌ Fix failed:', error.message);
        
        if (error.message.includes('Collection with the requested ID could not be found')) {
            console.log('🚨 Collection ID issue - check if "therapists_collection_id" is correct');
        }
    }
};

// Auto-run the fix
fixTherapistActivation();