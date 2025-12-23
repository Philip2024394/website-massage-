/**
 * Check Surtiningsih's Menu Data in Appwrite
 * This script verifies if menu data exists for Surtiningsih
 */

import { Client, Databases, Query } from 'node-appwrite';

const client = new Client()
    .setEndpoint('https://syd.cloud.appwrite.io/v1')
    .setProject('68f23b11000d25eb3664')
    .setKey('standard_209934f0a8cdc066be8f255c45da04b93b5c7cafd9673fbbf7e529f160dd73e390975ccc0ec58b4ac788c83b2c67a0c08ec19e08069c025ceb4e748b542f35f113d93866c7b2e3295e7c0e9e91a159495caa316685003f979096c432b7bc047e63fd182503bb9f2e8a9de5172a798c72256ad2cc677c726f8846b762683a7e5b');

const databases = new Databases(client);
const databaseId = '68f76ee1000e64ca8d05';
const therapistsCollectionId = 'therapists_collection_id';
const menusCollectionId = 'therapist_menus';

async function checkSurtiningsihMenu() {
    console.log('🔍 Checking Surtiningsih menu data in Appwrite...\n');
    
    try {
        // Step 1: Find Surtiningsih's therapist document
        console.log('1️⃣  Finding Surtiningsih in therapists collection...');
        const therapistResponse = await databases.listDocuments(
            databaseId,
            therapistsCollectionId,
            [
                Query.equal('name', 'Surtiningsih'),
                Query.limit(1)
            ]
        );
        
        if (therapistResponse.documents.length === 0) {
            console.error('❌ Surtiningsih not found in therapists collection!');
            return;
        }
        
        const therapist = therapistResponse.documents[0];
        console.log('✅ Found Surtiningsih:');
        console.log('   ID:', therapist.$id);
        console.log('   Name:', therapist.name);
        console.log('   City:', therapist.city);
        console.log('   Is Live:', therapist.isLive);
        console.log('   Is Verified:', therapist.isVerified);
        console.log('');
        
        // Step 2: Check if menu document exists
        console.log('2️⃣  Checking for menu data...');
        const menuResponse = await databases.listDocuments(
            databaseId,
            menusCollectionId,
            [
                Query.equal('therapistId', therapist.$id),
                Query.orderDesc('$updatedAt'),
                Query.limit(1)
            ]
        );
        
        if (menuResponse.documents.length === 0) {
            console.log('❌ NO MENU DOCUMENT FOUND for Surtiningsih!');
            console.log('   This is why the menu slider is not displaying.');
            console.log('');
            console.log('💡 Solution:');
            console.log('   1. Therapist needs to log into therapist dashboard');
            console.log('   2. Go to "Menu Prices" section');
            console.log('   3. Add services with prices for 60/90/120 minute durations');
            console.log('   4. Click "Save Menu" button');
            return;
        }
        
        const menu = menuResponse.documents[0];
        console.log('✅ Menu document found:');
        console.log('   Document ID:', menu.$id);
        console.log('   Menu ID:', menu.menuId);
        console.log('   Therapist ID:', menu.therapistId);
        console.log('   Is Active:', menu.isActive);
        console.log('   Created Date:', menu.createdDate);
        console.log('   Updated Date:', menu.updatedDate);
        console.log('');
        
        // Step 3: Parse and display menu data
        console.log('3️⃣  Menu Services:');
        if (menu.menuData) {
            try {
                const services = JSON.parse(menu.menuData);
                if (Array.isArray(services) && services.length > 0) {
                    console.log(`✅ ${services.length} services found:\n`);
                    services.forEach((service, index) => {
                        console.log(`   Service ${index + 1}: ${service.serviceName || service.name || 'Unnamed'}`);
                        console.log(`      - 60 min: ${service.price60 ? 'Rp ' + (Number(service.price60) * 1000).toLocaleString('id-ID') : 'N/A'}`);
                        console.log(`      - 90 min: ${service.price90 ? 'Rp ' + (Number(service.price90) * 1000).toLocaleString('id-ID') : 'N/A'}`);
                        console.log(`      - 120 min: ${service.price120 ? 'Rp ' + (Number(service.price120) * 1000).toLocaleString('id-ID') : 'N/A'}`);
                        console.log('');
                    });
                } else {
                    console.log('⚠️  Menu data is empty or not an array');
                    console.log('   Raw data:', menu.menuData);
                }
            } catch (parseError) {
                console.error('❌ Failed to parse menu data:', parseError.message);
                console.log('   Raw menuData:', menu.menuData.substring(0, 200) + '...');
            }
        } else {
            console.log('❌ menuData field is empty!');
        }
        
        console.log('\n✅ Diagnostic complete!');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        if (error.code) {
            console.error('   Error code:', error.code);
        }
        if (error.response) {
            console.error('   Response:', error.response);
        }
    }
}

checkSurtiningsihMenu();
