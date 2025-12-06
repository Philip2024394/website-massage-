// QUICK FIX: Run this in browser console to activate all therapists
// Go to http://localhost:3000, open developer tools (F12), paste this in Console tab

console.log('🚀 QUICK THERAPIST ACTIVATION - Starting...');

async function quickActivateAll() {
    try {
        // Initialize Appwrite
        const { Client, Databases } = Appwrite;
        const client = new Client()
            .setEndpoint('https://appwrite.indostreet.com/v1')
            .setProject('68f23b11000d25eb3664');

        const databases = new Databases(client);

        console.log('🔍 Fetching all therapists...');
        const response = await databases.listDocuments(
            '68f76ee1000e64ca8d05',
            'therapists_collection_id'
        );

        const therapists = response.documents;
        console.log(`📊 Found ${therapists.length} therapists`);
        
        let updated = 0;
        let errors = 0;

        for (const therapist of therapists) {
            try {
                console.log(`🔄 Activating: ${therapist.name || 'Unnamed'}`);
                
                await databases.updateDocument(
                    '68f76ee1000e64ca8d05',
                    'therapists_collection_id',
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
                
            } catch (error) {
                console.error(`❌ Failed: ${therapist.name}:`, error.message);
                errors++;
            }
        }

        console.log('🎉 ACTIVATION COMPLETE!');
        console.log(`✅ Activated: ${updated} therapists`);
        console.log(`❌ Errors: ${errors}`);
        
        alert(`✅ Activation Complete!\n\nActivated: ${updated} therapists\nErrors: ${errors}\n\nStatus buttons should now work!`);

    } catch (error) {
        console.error('❌ ACTIVATION FAILED:', error);
        alert('❌ Activation failed: ' + error.message);
    }
}

// Run the activation
quickActivateAll();