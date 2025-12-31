import { Client, Databases } from 'node-appwrite';

const client = new Client()
    .setEndpoint('https://cloud.appwrite.io/v1')
    .setProject('68f23b11000d25eb3664')
    .setKey(process.env.APPWRITE_API_KEY || '');

const databases = new Databases(client);
const DATABASE_ID = '68f76ee1000e64ca8d05';
const THERAPISTS_COLLECTION = 'therapists_collection_id';

async function checkTherapistById() {
    try {
        const therapistId = '6953c4437cc8a16c9b88';
        console.log(`🔍 Fetching therapist with ID: ${therapistId}\n`);
        
        const therapist = await databases.getDocument(
            DATABASE_ID,
            THERAPISTS_COLLECTION,
            therapistId
        );
        
        console.log('✅ Therapist Profile Found:');
        console.log('━'.repeat(80));
        console.log(`ID: ${therapist.$id}`);
        console.log(`Email: ${therapist.email}`);
        console.log(`Name: ${therapist.name}`);
        console.log(`WhatsApp: ${therapist.whatsappNumber || '(not set)'}`);
        console.log(`Location: ${therapist.location || '(not set)'}`);
        console.log(`City/LocationId: ${therapist.locationId || therapist.city || '(not set)'}`);
        console.log(`Description: ${therapist.description ? therapist.description.substring(0, 100) + '...' : '(empty)'}`);
        console.log(`Profile Picture: ${therapist.profilePicture || '(empty)'}`);
        console.log(`Main Image: ${therapist.mainImage || '(empty)'}`);
        console.log(`Years of Experience: ${therapist.yearsOfExperience}`);
        console.log(`Specialization: ${therapist.specialization || '(not set)'}`);
        console.log(`Is Live: ${therapist.isLive}`);
        console.log(`Status: ${therapist.status}`);
        console.log(`Coordinates: ${therapist.coordinates || therapist.geopoint || '(not set)'}`);
        console.log(`Pricing 60min: ${therapist.price60 || therapist.pricing?.['60'] || '(not set)'}`);
        console.log(`Pricing 90min: ${therapist.price90 || therapist.pricing?.['90'] || '(not set)'}`);
        console.log(`Pricing 120min: ${therapist.price120 || therapist.pricing?.['120'] || '(not set)'}`);
        console.log(`Massage Types: ${therapist.massageTypes || '(empty)'}`);
        console.log(`Languages: ${therapist.languages || '(empty)'}`);
        console.log(`Created: ${therapist.$createdAt}`);
        console.log(`Updated: ${therapist.$updatedAt}`);
        console.log('━'.repeat(80));
        console.log('\n📋 All Available Fields:');
        console.log(Object.keys(therapist).sort().join(', '));
        
        console.log('\n🔍 Full Data Object:');
        console.log(JSON.stringify(therapist, null, 2));
    } catch (error) {
        console.error('❌ Error:', error.message);
        if (error.type) console.error('Error Type:', error.type);
        if (error.code) console.error('Error Code:', error.code);
    }
}

checkTherapistById();
