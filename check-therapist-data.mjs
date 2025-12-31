import { Client, Databases, Query } from 'node-appwrite';

const client = new Client()
    .setEndpoint('https://cloud.appwrite.io/v1')
    .setProject('68f23b11000d25eb3664')
    .setKey(process.env.APPWRITE_API_KEY || '');

const databases = new Databases(client);
const DATABASE_ID = '68f76ee1000e64ca8d05';
const THERAPISTS_COLLECTION = 'therapists_collection_id';

async function checkTherapist() {
    try {
        console.log('🔍 Searching for therapist with email: indastreet30@gmail.com\n');
        
        const response = await databases.listDocuments(
            DATABASE_ID,
            THERAPISTS_COLLECTION,
            [Query.equal('email', 'indastreet30@gmail.com')]
        );
        
        console.log(`📊 Found ${response.total} therapist(s)\n`);
        
        if (response.total > 0) {
            const therapist = response.documents[0];
            console.log('✅ Therapist Profile Found:');
            console.log('━'.repeat(60));
            console.log(`ID: ${therapist.$id}`);
            console.log(`Name: ${therapist.name}`);
            console.log(`Email: ${therapist.email}`);
            console.log(`WhatsApp: ${therapist.whatsappNumber}`);
            console.log(`Location: ${therapist.location}`);
            console.log(`Description: ${therapist.description || '(empty)'}`);
            console.log(`Profile Picture: ${therapist.profilePicture || '(empty)'}`);
            console.log(`Years of Experience: ${therapist.yearsOfExperience}`);
            console.log(`Specialization: ${therapist.specialization}`);
            console.log(`Is Live: ${therapist.isLive}`);
            console.log(`Status: ${therapist.status}`);
            console.log(`Created: ${therapist.$createdAt}`);
            console.log(`Updated: ${therapist.$updatedAt}`);
            console.log('━'.repeat(60));
            console.log('\n📋 All Fields:', Object.keys(therapist).join(', '));
        } else {
            console.log('❌ No therapist profile found with that email');
        }
    } catch (error) {
        console.error('❌ Error:', error.message);
        if (error.type) console.error('Error Type:', error.type);
    }
}

checkTherapist();
