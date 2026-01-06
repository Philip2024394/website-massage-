import { Client, Databases } from 'node-appwrite';

const client = new Client()
    .setEndpoint('https://syd.cloud.appwrite.io/v1')
    .setProject('68f23b11000d25eb3664')
    .setKey(process.env.APPWRITE_API_KEY || 'standard_a0b1ada5e2175bb324bb4ae9a935c6dcb63e1b90be6a0f6bf5ea01e79b1da53bc64f7c65fcaf7fbe59eeeb71c39e7bb7a2ab4ed8d29cc9dfaa3b67f51fd48e94cf75c8caf6c55f6a2e6b17b11d8ecc5f1ae92f2fca9ba9bd8f3c18bcc16f60c35a54db34c2e8dbb5f9cff831e49f90db2acc88d54b56e6f4a2d0d88be1f0bf3');

const databases = new Databases(client);

async function checkTherapistSchema() {
    console.log('🔍 Checking therapist document schema...\n');
    
    try {
        // Get Budi's document
        const therapist = await databases.getDocument(
            '68f76ee1000e64ca8d05',
            'therapists_collection_id',
            '692467a3001f6f05aaa1'
        );
        
        console.log('📋 Therapist Document Fields:');
        console.log('─'.repeat(80));
        console.log(`$id: ${therapist.$id} (${typeof therapist.$id})`);
        console.log(`id: ${therapist.id} (${typeof therapist.id})`);
        
        // Check for userId field
        if (therapist.userId !== undefined) {
            console.log(`userId: ${therapist.userId} (${typeof therapist.userId})`);
        } else {
            console.log(`userId: NOT FOUND`);
        }
        
        // Check all numeric fields
        console.log('\n📊 Numeric Fields:');
        for (const [key, value] of Object.entries(therapist)) {
            if (typeof value === 'number') {
                console.log(`  ${key}: ${value}`);
            }
        }
        
        console.log('\n');
        console.log('✅ Full document:', JSON.stringify(therapist, null, 2));
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

checkTherapistSchema();
