// Debug script for phil4 profile loading issues
const { Client, Databases, Account, Query } = require('node-appwrite');

const client = new Client();
const databases = new Databases(client);
const account = new Account(client);

// Appwrite configuration - using correct project settings
client
    .setEndpoint('https://syd.cloud.appwrite.io/v1')
    .setProject('68f23b11000d25eb3664');

const DATABASE_ID = '68f76ee1000e64ca8d05';
const THERAPISTS_COLLECTION_ID = 'therapists_collection_id';

async function debugPhil4Profile() {
    console.log('🔍 Starting Phil4 Profile Debug...\n');

    try {
        // Method 1: Search by name "phil4"
        console.log('📋 Method 1: Search by name "phil4"');
        try {
            const nameResults = await databases.listDocuments(
                DATABASE_ID,
                THERAPISTS_COLLECTION_ID,
                [Query.equal('name', 'phil4')]
            );
            console.log('Results by name:', nameResults.documents.length);
            if (nameResults.documents.length > 0) {
                const phil4 = nameResults.documents[0];
                console.log('Found phil4 profile:');
                console.log('- Document ID:', phil4.$id);
                console.log('- Name:', phil4.name);
                console.log('- Email:', phil4.email);
                console.log('- Description:', phil4.description?.substring(0, 100) + '...');
                console.log('- WhatsApp:', phil4.whatsappNumber);
                console.log('- Location:', phil4.location);
                console.log('- Years Experience:', phil4.yearsOfExperience);
                console.log('- Profile Picture:', phil4.profilePicture ? 'Yes' : 'No');
                console.log('- Massage Types:', phil4.massageTypes);
                console.log('- Languages:', phil4.languages);
                console.log('- Pricing:', phil4.pricing);
                console.log('- Status:', phil4.status);
                console.log('- Licensed:', phil4.isLicensed);
                console.log('- License Number:', phil4.licenseNumber);
                console.log('- Coordinates:', phil4.coordinates);
            }
        } catch (nameError) {
            console.log('❌ Name search failed:', nameError.message);
        }

        console.log('\n📋 Method 2: Search by email containing "phil"');
        try {
            const emailResults = await databases.listDocuments(
                DATABASE_ID,
                THERAPISTS_COLLECTION_ID,
                [Query.search('email', 'phil')]
            );
            console.log('Results by email search:', emailResults.documents.length);
            emailResults.documents.forEach((therapist, index) => {
                console.log(`${index + 1}. ${therapist.name} (${therapist.email}) - ID: ${therapist.$id}`);
            });
        } catch (emailError) {
            console.log('❌ Email search failed:', emailError.message);
        }

        console.log('\n📋 Method 3: Get all therapists to find phil4');
        try {
            const allResults = await databases.listDocuments(
                DATABASE_ID,
                THERAPISTS_COLLECTION_ID,
                [Query.limit(100)]
            );
            console.log('Total therapists found:', allResults.documents.length);
            
            const phil4Variants = allResults.documents.filter(therapist => 
                therapist.name?.toLowerCase().includes('phil') || 
                therapist.email?.toLowerCase().includes('phil')
            );
            
            console.log('Phil variants found:', phil4Variants.length);
            phil4Variants.forEach((therapist, index) => {
                console.log(`${index + 1}. Name: "${therapist.name}" | Email: "${therapist.email}" | ID: ${therapist.$id}`);
            });
        } catch (allError) {
            console.log('❌ All therapists search failed:', allError.message);
        }

        console.log('\n📋 Method 4: Try specific document IDs if known');
        // If you know phil4's document ID, you can test it directly
        const knownIds = [
            // Add any known document IDs for phil4 here
            // 'document_id_1',
            // 'document_id_2'
        ];

        for (const docId of knownIds) {
            try {
                const therapist = await databases.getDocument(
                    DATABASE_ID,
                    THERAPISTS_COLLECTION_ID,
                    docId
                );
                console.log(`Found by ID ${docId}:`, therapist.name, therapist.email);
            } catch (idError) {
                console.log(`❌ Document ID ${docId} not found`);
            }
        }

    } catch (error) {
        console.error('❌ Debug failed:', error);
    }
}

// Run the debug
debugPhil4Profile().then(() => {
    console.log('\n✅ Debug complete');
}).catch(console.error);