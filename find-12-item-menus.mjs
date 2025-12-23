/**
 * Find therapist menus with exactly 12 services
 */

import { Client, Databases, Query } from 'node-appwrite';

const client = new Client()
    .setEndpoint('https://syd.cloud.appwrite.io/v1')
    .setProject('68f23b11000d25eb3664')
    .setKey('standard_1a53a263b15bc4342bd42429292b0099e3dbc8eb26715d1e437140dcc4b0ae21a24ddcf33ff39bb687e4234d019de1ce2b048f8a846adcd599d38574e2abb21241767371769e83eaf445d4e655aa6556112d951bbf48450fb49d85aac932db12980acca0396e8b9c2e74e9e40558bfc63d7bf78c76221b6e561aad38bab1380f');

const databases = new Databases(client);
const databaseId = '68f76ee1000e64ca8d05';

async function findMenusWith12Items() {
    try {
        console.log('🔍 Searching for menu data with exactly 12 services...\n');
        
        // Get all menu documents
        const menuResponse = await databases.listDocuments(
            databaseId,
            'therapist_menus',
            [Query.limit(100)]
        );
        
        console.log('📋 Total menu documents found:', menuResponse.documents.length);
        
        let found12Items = [];
        let allMenuCounts = {};
        
        menuResponse.documents.forEach(menu => {
            if (menu.menuData) {
                try {
                    const services = JSON.parse(menu.menuData);
                    if (Array.isArray(services)) {
                        const count = services.length;
                        allMenuCounts[count] = (allMenuCounts[count] || 0) + 1;
                        
                        console.log(`📄 Therapist ID: ${menu.therapistId} | Services: ${count}`);
                        
                        if (count === 12) {
                            found12Items.push({
                                therapistId: menu.therapistId,
                                services: services,
                                menuDocId: menu.$id
                            });
                        }
                    }
                } catch (e) {
                    console.log('❌ Failed to parse menu for:', menu.therapistId);
                }
            }
        });
        
        console.log('\n📊 Menu service count distribution:');
        Object.entries(allMenuCounts)
            .sort(([a], [b]) => parseInt(a) - parseInt(b))
            .forEach(([count, therapists]) => {
                const marker = count === '12' ? '🎯' : '📋';
                console.log(`${marker} ${count} services: ${therapists} therapist(s)`);
            });
        
        if (found12Items.length > 0) {
            console.log('\n🎯 FOUND', found12Items.length, 'therapist(s) with exactly 12 menu services!');
            console.log('═══════════════════════════════════════════════════════\n');
            
            for (let i = 0; i < found12Items.length; i++) {
                const item = found12Items[i];
                console.log(`📋 ${i + 1}. Therapist ID: ${item.therapistId}`);
                console.log(`   Menu Document ID: ${item.menuDocId}`);
                console.log('   Services (12 items):');
                item.services.forEach((service, j) => {
                    const num = (j + 1).toString().padStart(2, '0');
                    const name = service.serviceName || 'Unnamed Service';
                    console.log(`     ${num}. ${name}`);
                });
                console.log('');
            }
        } else {
            console.log('\n❌ No therapists found with exactly 12 menu services');
        }
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

findMenusWith12Items();