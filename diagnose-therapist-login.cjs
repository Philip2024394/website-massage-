const { Client, Databases, Account } = require('node-appwrite');

const client = new Client();
client
    .setEndpoint('https://syd.cloud.appwrite.io/v1')
    .setProject('68f23b11000d25eb3664')
    .setKey('YOUR_API_KEY_HERE'); // You need to add your API key

const databases = new Databases(client);

async function diagnoseTherapistLogin() {
    console.log('🔍 Diagnosing Therapist Login System...\n');
    
    try {
        // List all therapists
        const therapists = await databases.listDocuments(
            '68f76ee1000e64ca8d05', // database ID
            'therapists_collection_id' // collection ID
        );
        
        console.log(`✅ Found ${therapists.total} therapists in database\n`);
        
        // Show first 5 therapists
        therapists.documents.slice(0, 5).forEach((t, index) => {
            console.log(`Therapist ${index + 1}:`);
            console.log(`  - ID: ${t.$id}`);
            console.log(`  - Name: ${t.name}`);
            console.log(`  - Email: ${t.email}`);
            console.log(`  - Status: ${t.status}`);
            console.log(`  - Therapist ID: ${t.therapistId}`);
            console.log('');
        });
        
        // Check for common test accounts
        const testEmails = [
            'phil4@therapist.local',
            'test@therapist.local',
            'demo@therapist.local'
        ];
        
        console.log('🔍 Checking for test accounts...');
        testEmails.forEach(email => {
            const found = therapists.documents.find(t => t.email === email);
            if (found) {
                console.log(`  ✅ Found: ${email} (ID: ${found.$id})`);
            } else {
                console.log(`  ❌ Not found: ${email}`);
            }
        });
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error('\nTroubleshooting:');
        console.error('1. Make sure you have an API key with proper permissions');
        console.error('2. Check if database/collection IDs are correct');
        console.error('3. Verify network connection to Appwrite');
    }
}

diagnoseTherapistLogin();
