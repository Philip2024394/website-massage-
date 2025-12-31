import { Client, Databases, Query } from 'node-appwrite';

const client = new Client()
    .setEndpoint('https://syd.cloud.appwrite.io/v1')
    .setProject('68f23b11000d25eb3664')
    .setKey(process.env.APPWRITE_API_KEY || '');

const databases = new Databases(client);
const DATABASE_ID = '68f76ee1000e64ca8d05';
const THERAPISTS_COLLECTION = 'therapists_collection_id';

async function checkTherapistName() {
    try {
        console.log('🔍 Searching for therapist with email: indastreet36@gmail.com\n');
        
        const response = await databases.listDocuments(
            DATABASE_ID,
            THERAPISTS_COLLECTION,
            [Query.equal('email', 'indastreet36@gmail.com')]
        );
        
        console.log(`📊 Found ${response.total} therapist(s)\n`);
        
        if (response.total > 0) {
            const therapist = response.documents[0];
            console.log('✅ Therapist Profile Found:');
            console.log('━'.repeat(80));
            console.log(`ID: ${therapist.$id}`);
            console.log(`Email: ${therapist.email}`);
            console.log(`NAME IN DATABASE: "${therapist.name}"`);
            console.log(`Name length: ${therapist.name?.length} characters`);
            console.log(`Name bytes: ${Buffer.from(therapist.name || '').toString('hex')}`);
            console.log(`WhatsApp: ${therapist.whatsappNumber || '(not set)'}`);
            console.log(`Location: ${therapist.location || '(not set)'}`);
            console.log(`Is Live: ${therapist.isLive}`);
            console.log(`Status: ${therapist.status}`);
            console.log(`Created: ${therapist.$createdAt}`);
            console.log(`Updated: ${therapist.$updatedAt}`);
            console.log('━'.repeat(80));
            
            // Check if name matches expected
            if (therapist.name === 'Lisna') {
                console.log('\n✅ Name in database is CORRECT: "Lisna"');
                console.log('⚠️ Issue is in frontend display logic, not database');
            } else if (therapist.name === 'Lisa') {
                console.log('\n❌ Name in database is WRONG: "Lisa" (should be "Lisna")');
                console.log('💡 Need to update database');
            } else {
                console.log(`\n⚠️ Name in database: "${therapist.name}" (unexpected)`);
            }
        } else {
            console.log('❌ No therapist profile found with that email');
        }
    } catch (error) {
        console.error('❌ Error:', error.message);
        if (error.type) console.error('Error Type:', error.type);
        if (error.code) console.error('Error Code:', error.code);
    }
}

checkTherapistName();
