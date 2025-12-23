/**
 * Check for Therapist ID Mismatches
 * This could explain why menu loads in dev but not live
 */

import { Client, Databases, Query } from 'node-appwrite';

// Test with API key to see all therapists
const client = new Client()
    .setEndpoint('https://syd.cloud.appwrite.io/v1')
    .setProject('68f23b11000d25eb3664')
    .setKey('standard_209934f0a8cdc066be8f255c45da04b93b5c7cafd9673fbbf7e529f160dd73e390975ccc0ec58b4ac788c83b2c67a0c08ec19e08069c025ceb4e748b542f35f113d93866c7b2e3295e7c0e9e91a159495caa316685003f979096c432b7bc047e63fd182503bb9f2e8a9de5172a798c72256ad2cc677c726f8846b762683a7e5b');

const databases = new Databases(client);

async function checkTherapistIDMismatches() {
    console.log('🔍 CHECKING FOR THERAPIST ID MISMATCHES');
    console.log('═══════════════════════════════════════════\n');
    
    try {
        // Step 1: Find all Surtiningsih records
        console.log('👥 Step 1: Finding all therapists named "Surtiningsih"...');
        const therapistResponse = await databases.listDocuments(
            '68f76ee1000e64ca8d05',
            'therapists_collection_id',
            [
                Query.equal('name', 'Surtiningsih'),
                Query.limit(10)
            ]
        );
        
        console.log(`📊 Found ${therapistResponse.documents.length} Surtiningsih records\n`);
        
        if (therapistResponse.documents.length === 0) {
            console.log('❌ No Surtiningsih found in database!');
            return;
        }
        
        // Step 2: Check each Surtiningsih for menu data
        for (let i = 0; i < therapistResponse.documents.length; i++) {
            const therapist = therapistResponse.documents[i];
            console.log(`👤 Surtiningsih #${i + 1}:`);
            console.log(`   ID: ${therapist.$id}`);
            console.log(`   Name: ${therapist.name}`);
            console.log(`   Email: ${therapist.email || 'No email'}`);
            console.log(`   Phone: ${therapist.whatsappNumber || therapist.phoneNumber || 'No phone'}`);
            console.log(`   Is Live: ${therapist.isLive}`);
            console.log(`   Status: ${therapist.status || 'No status'}`);
            
            // Check for menu data
            try {
                const menuResponse = await databases.listDocuments(
                    '68f76ee1000e64ca8d05',
                    'therapist_menus',
                    [
                        Query.equal('therapistId', therapist.$id),
                        Query.limit(1)
                    ]
                );
                
                if (menuResponse.documents.length > 0) {
                    const menuDoc = menuResponse.documents[0];
                    const menuData = menuDoc.menuData ? JSON.parse(menuDoc.menuData) : [];
                    console.log(`   ✅ HAS MENU: ${menuData.length} services`);
                    
                    if (menuData.length === 12) {
                        console.log(`   🎯 THIS IS THE ONE WITH 12 SERVICES!`);
                        console.log(`   📄 Menu Document ID: ${menuDoc.$id}`);
                        console.log(`   📅 Last Updated: ${menuDoc.$updatedAt}`);
                    }
                } else {
                    console.log(`   ❌ NO MENU: Would show traditional pricing only`);
                }
                
            } catch (menuError) {
                console.log(`   ❌ MENU ERROR: ${menuError.message}`);
            }
            
            console.log(''); // Empty line
        }
        
        // Step 3: Check if there are multiple therapists that could be confused
        console.log('🔍 Step 3: Checking for potential ID confusion...');
        
        const allTherapistsResponse = await databases.listDocuments(
            '68f76ee1000e64ca8d05',
            'therapists_collection_id',
            [
                Query.limit(100)
            ]
        );
        
        console.log(`📊 Total therapists in database: ${allTherapistsResponse.documents.length}`);
        
        // Look for therapists with similar names or phone numbers
        const similarTherapists = allTherapistsResponse.documents.filter(t => 
            t.name?.toLowerCase().includes('surti') || 
            t.whatsappNumber?.includes('81280568323') ||
            t.phoneNumber?.includes('81280568323')
        );
        
        if (similarTherapists.length > 1) {
            console.log(`\n⚠️ Found ${similarTherapists.length} similar therapists:`);
            similarTherapists.forEach((therapist, index) => {
                console.log(`   ${index + 1}. ${therapist.name} (${therapist.$id})`);
                console.log(`      Phone: ${therapist.whatsappNumber || therapist.phoneNumber || 'None'}`);
            });
        }
        
        console.log('\n💡 POTENTIAL LIVE SITE ISSUES:');
        console.log('   1. Live site might be using different therapist ID');
        console.log('   2. Cached therapist data with old ID');
        console.log('   3. Environment-specific therapist records');
        console.log('   4. Database sync issues between dev and live');
        
    } catch (error) {
        console.log('❌ Error:', error.message);
    }
}

checkTherapistIDMismatches();