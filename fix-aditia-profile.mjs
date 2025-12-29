/**
 * Fix Aditia's profile - set city field to match location
 */

import { Client, Databases } from 'node-appwrite';

const client = new Client()
    .setEndpoint('https://syd.cloud.appwrite.io/v1')
    .setProject('68f23b11000d25eb3664')
    .setKey('standard_a5f2f5d71e12db8e84e5fd3bba65e24f7b5f96cdfacd52b833e71f1f7cf6f9fc3fc8df7e0dd3d4c2b6cc73eada23f2e76df4d7c5c72ef6ebfaba79faa10c24aa0d0a51c3d69f2a491ca6a3c5c5ea0c0c1f0dc1a5d83ab5e7e96e6fc09b73c5f4');

const databases = new Databases(client);

async function fixAditiaProfile() {
    try {
        console.log('🔧 Fixing Aditia\'s profile...\n');
        
        // Get Aditia
        const result = await databases.listDocuments(
            '68f76ee1000e64ca8d05',
            'therapists_collection_id',
            [{ method: 'equal', attribute: 'email', values: ['indastreet29@gmail.com'] }]
        );
        
        if (result.documents.length === 0) {
            console.log('❌ Aditia not found!');
            return;
        }
        
        const aditia = result.documents[0];
        
        console.log('Current data:');
        console.log(`  Location: ${aditia.location || 'NOT SET'}`);
        console.log(`  City: ${aditia.city || 'NOT SET'}`);
        console.log('');
        
        if (aditia.city && aditia.city === aditia.location) {
            console.log('✅ City field already matches location - no fix needed!');
            return;
        }
        
        // Update city field to match location
        const updated = await databases.updateDocument(
            '68f76ee1000e64ca8d05',
            'therapists_collection_id',
            aditia.$id,
            {
                city: aditia.location || 'Bandung'
            }
        );
        
        console.log('✅ FIXED! Updated Aditia\'s profile:');
        console.log(`  Location: ${updated.location}`);
        console.log(`  City: ${updated.city}`);
        console.log('');
        console.log('🎉 Aditia will now appear in Bandung dropdown!');
        console.log('   (Allow 2-3 minutes for site to refresh)');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        if (error.message.includes('key')) {
            console.log('\n⚠️  API key issue - cannot update directly');
            console.log('   ➡️  Aditia needs to log into dashboard and re-save profile');
            console.log('   ➡️  Or manually update in Appwrite console');
        }
    }
}

fixAditiaProfile();
