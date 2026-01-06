import { Client, Databases, ID } from 'node-appwrite';

const client = new Client()
    .setEndpoint('https://syd.cloud.appwrite.io/v1')
    .setProject('68f23b11000d25eb3664')
    .setKey(process.env.APPWRITE_API_KEY || 'standard_dde647bada5035422e4fd036fd27a48a225ba3537b391c7441da7d60d953cdbb23ec75c675b2ec21071e79d10914bdda301109e3ac28743a88ee372d9f3e2e3531ab22f76d45a3061e74d75d8ffa8d46488f51a07949a8cf0180df90e2cc753c72a8e5a56e48b3b40950d90149bb048f661642ca1c7088723e8752fec377e00d');

const databases = new Databases(client);

async function createTherapistMatchesCollection() {
    const DATABASE_ID = '68f76ee1000e64ca8d05';
    const COLLECTION_ID = 'therapist_matches';
    
    try {
        console.log('📋 Creating therapist_matches collection...');
        
        const collection = await databases.createCollection(
            DATABASE_ID,
            COLLECTION_ID,
            'Therapist Matches'
        );
        
        // Add attributes
        await databases.createStringAttribute(DATABASE_ID, COLLECTION_ID, 'bookingId', 50, true);
        await databases.createStringAttribute(DATABASE_ID, COLLECTION_ID, 'therapistId', 50, true);
        await databases.createStringAttribute(DATABASE_ID, COLLECTION_ID, 'status', 20, true);
        await databases.createDatetimeAttribute(DATABASE_ID, COLLECTION_ID, 'matchedAt', true);
        await databases.createDatetimeAttribute(DATABASE_ID, COLLECTION_ID, 'respondedAt', false);
        
        console.log('✅ therapist_matches collection created successfully');
        
    } catch (error) {
        if (error.code === 409) {
            console.log('ℹ️  therapist_matches collection already exists');
        } else {
            console.error('❌ Error creating therapist_matches collection:', error.message);
        }
    }
}

createTherapistMatchesCollection();