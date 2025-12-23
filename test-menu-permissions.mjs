/**
 * Test therapist_menus collection permissions
 * This simulates what happens on the live site
 */

import { Client, Databases, Query } from 'node-appwrite';

// Use same config as live site (NO API key = public access)
const client = new Client()
    .setEndpoint('https://syd.cloud.appwrite.io/v1')
    .setProject('68f23b11000d25eb3664');
    // NO .setKey() = simulates public browser access

const databases = new Databases(client);

async function testMenuPermissions() {
    console.log('🔍 Testing therapist_menus collection from browser perspective...\n');
    
    try {
        console.log('🧪 Test: List documents (what TherapistCard.tsx does)...');
        
        const response = await databases.listDocuments(
            '68f76ee1000e64ca8d05',  // databaseId
            'therapist_menus',        // collection ID
            [
                Query.equal('therapistId', 'test'),  // Try to query by therapist ID
                Query.limit(1)
            ]
        );
        
        console.log(`✅ SUCCESS! Collection is accessible`);
        console.log(`📊 Found ${response.documents.length} documents`);
        console.log('🎉 This means menu loading should work on live site!');
        
        if (response.documents.length > 0) {
            const sample = response.documents[0];
            console.log('\n📄 Sample document:');
            console.log(`   - ID: ${sample.$id}`);
            console.log(`   - Therapist ID: ${sample.therapistId}`);
            console.log(`   - Has menuData: ${!!sample.menuData}`);
        }
        
    } catch (error) {
        console.log(`❌ FAILED: ${error.message}`);
        console.log(`   Error code: ${error.code}`);
        
        if (error.code === 401) {
            console.log('\n🚨 ISSUE FOUND: Collection permissions problem!');
            console.log('\n📝 SOLUTION:');
            console.log('   1. Open Appwrite Console: https://cloud.appwrite.io/console');
            console.log('   2. Go to your project → Database → therapist_menus collection');
            console.log('   3. Click "Settings" → "Permissions"');
            console.log('   4. Add role "Any" with "Read" permission');
            console.log('   5. Save changes');
            console.log('\n💡 This will allow public read access (like on your live site)');
            
        } else if (error.code === 404) {
            console.log('\n🚨 ISSUE FOUND: Collection does not exist!');
            console.log('   The collection "therapist_menus" was not found');
            
        } else {
            console.log(`\n🚨 UNEXPECTED ERROR: ${JSON.stringify(error, null, 2)}`);
        }
    }
}

testMenuPermissions();