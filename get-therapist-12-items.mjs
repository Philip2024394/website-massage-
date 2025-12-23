/**
 * Get therapist details for the one with 12 menu items
 */

import { Client, Databases, Query } from 'node-appwrite';

const client = new Client()
    .setEndpoint('https://syd.cloud.appwrite.io/v1')
    .setProject('68f23b11000d25eb3664')
    .setKey('standard_1a53a263b15bc4342bd42429292b0099e3dbc8eb26715d1e437140dcc4b0ae21a24ddcf33ff39bb687e4234d019de1ce2b048f8a846adcd599d38574e2abb21241767371769e83eaf445d4e655aa6556112d951bbf48450fb49d85aac932db12980acca0396e8b9c2e74e9e40558bfc63d7bf78c76221b6e561aad38bab1380f');

const databases = new Databases(client);
const databaseId = '68f76ee1000e64ca8d05';

async function getTherapistWith12Items() {
    try {
        const therapistId = '693cfadf003d16b9896a';
        
        console.log('🔍 Getting therapist details for ID:', therapistId);
        console.log('═══════════════════════════════════════════════════════\n');
        
        // Get therapist details
        const therapist = await databases.getDocument(
            databaseId,
            'therapists_collection_id',
            therapistId
        );
        
        console.log('👤 THERAPIST DETAILS:');
        console.log('   Name:', therapist.name || 'No name');
        console.log('   Email:', therapist.email || 'No email');
        console.log('   Phone:', therapist.phoneNumber || therapist.whatsappNumber || 'No phone');
        console.log('   City:', therapist.city || 'No city');
        console.log('   Country:', therapist.country || 'No country');
        console.log('   Status:', therapist.status || therapist.availability || 'No status');
        console.log('   Is Live:', therapist.isLive);
        console.log('   Is Online:', therapist.isOnline);
        console.log('   Profile Picture:', therapist.profilePicture || 'No profile picture');
        
        // Get their menu data
        console.log('\n📋 MENU DATA:');
        const menuResponse = await databases.listDocuments(
            databaseId,
            'therapist_menus',
            [Query.equal('therapistId', therapistId)]
        );
        
        if (menuResponse.documents.length > 0) {
            const menu = menuResponse.documents[0];
            const services = JSON.parse(menu.menuData);
            
            console.log('   Menu Document ID:', menu.$id);
            console.log('   Created At:', menu.$createdAt);
            console.log('   Updated At:', menu.$updatedAt);
            console.log('   Total Services:', services.length);
            console.log('\n   📝 COMPLETE SERVICE LIST:');
            
            services.forEach((service, i) => {
                const num = (i + 1).toString().padStart(2, '0');
                console.log(`      ${num}. ${service.serviceName}`);
                if (service.price60) console.log(`          60min: Rp ${Number(service.price60) * 1000}`);
                if (service.price90) console.log(`          90min: Rp ${Number(service.price90) * 1000}`);
                if (service.price120) console.log(`         120min: Rp ${Number(service.price120) * 1000}`);
            });
        } else {
            console.log('   ❌ No menu found (this should not happen!)');
        }
        
        console.log('\n🎯 This is the therapist whose menu slider shows "12" items!');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

getTherapistWith12Items();