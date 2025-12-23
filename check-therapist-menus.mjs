/**
 * Check if specific therapist has menu data
 * Replace 'THERAPIST_NAME' with the actual therapist name from your live site
 */

import { Client, Databases, Query } from 'node-appwrite';

const client = new Client()
    .setEndpoint('https://syd.cloud.appwrite.io/v1')
    .setProject('68f23b11000d25eb3664')
    .setKey('standard_209934f0a8cdc066be8f255c45da04b93b5c7cafd9673fbbf7e529f160dd73e390975ccc0ec58b4ac788c83b2c67a0c08ec19e08069c025ceb4e748b542f35f113d93866c7b2e3295e7c0e9e91a159495caa316685003f979096c432b7bc047e63fd182503bb9f2e8a9de5172a798c72256ad2cc677c726f8846b762683a7e5b');

const databases = new Databases(client);
const databaseId = '68f76ee1000e64ca8d05';

async function checkSpecificTherapistMenu() {
    try {
        console.log('🔍 Checking therapist menu status...\n');
        
        // Step 1: List all therapists to see who's available
        console.log('👥 All therapists in database:');
        const therapistResponse = await databases.listDocuments(
            databaseId,
            'therapists_collection_id',
            [Query.limit(10)]
        );
        
        therapistResponse.documents.forEach((therapist, index) => {
            console.log(`${index + 1}. ${therapist.name || 'Unnamed'} (ID: ${therapist.$id})`);
        });
        
        // Step 2: Check menu documents for each therapist
        console.log('\n🍽️ Menu status for each therapist:');
        
        for (const therapist of therapistResponse.documents) {
            try {
                const menuResponse = await databases.listDocuments(
                    databaseId,
                    'therapist_menus',
                    [
                        Query.equal('therapistId', therapist.$id),
                        Query.limit(1)
                    ]
                );
                
                if (menuResponse.documents.length > 0) {
                    const menuDoc = menuResponse.documents[0];
                    const menuData = menuDoc.menuData ? JSON.parse(menuDoc.menuData) : [];
                    console.log(`✅ ${therapist.name}: HAS MENU (${menuData.length} services)`);
                } else {
                    console.log(`❌ ${therapist.name}: NO MENU - Will show traditional pricing only`);
                }
            } catch (error) {
                console.log(`❌ ${therapist.name}: ERROR checking menu - ${error.message}`);
            }
        }
        
        console.log('\n💡 Summary:');
        console.log('   - ✅ = Therapist will show custom menu slider');
        console.log('   - ❌ = Therapist will show only traditional pricing');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

checkSpecificTherapistMenu();