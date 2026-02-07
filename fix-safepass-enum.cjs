/**
 * Fix SafePass Enum Attribute
 * Deletes and recreates the hotelVillaSafePassStatus enum with correct values
 */

const { Client, Databases } = require('node-appwrite');

const client = new Client()
    .setEndpoint('https://syd.cloud.appwrite.io/v1')
    .setProject('68f23b11000d25eb3664')
    .setKey(process.env.APPWRITE_API_KEY || '');

const databases = new Databases(client);

const DATABASE_ID = '68f76ee1000e64ca8d05';
const SAFEPASS_COLLECTION_ID = 'safepass';

async function fixEnumAttribute() {
    console.log('🔧 Fixing SafePass Enum Attribute...\n');

    try {
        // Step 1: Delete the malformed attribute
        console.log('📋 Step 1: Deleting malformed hotelVillaSafePassStatus attribute...');
        try {
            await databases.deleteAttribute(
                DATABASE_ID,
                SAFEPASS_COLLECTION_ID,
                'hotelVillaSafePassStatus'
            );
            console.log('   ✅ Attribute deleted successfully\n');
        } catch (error) {
            if (error.message.includes('not found')) {
                console.log('   ℹ️  Attribute does not exist (already deleted)\n');
            } else {
                throw error;
            }
        }

        // Wait for deletion to complete
        console.log('⏳ Waiting 5 seconds for deletion to complete...');
        await new Promise(resolve => setTimeout(resolve, 5000));
        console.log('   ✅ Wait complete\n');

        // Step 2: Create the enum attribute correctly
        console.log('📋 Step 2: Creating hotelVillaSafePassStatus enum with correct values...');
        await databases.createEnumAttribute(
            DATABASE_ID,
            SAFEPASS_COLLECTION_ID,
            'hotelVillaSafePassStatus',
            ['pending', 'approved', 'active', 'rejected'],
            true // required
        );
        console.log('   ✅ Enum attribute created successfully\n');

        // Wait for attribute creation to complete
        console.log('⏳ Waiting 10 seconds for attribute creation and indexing...');
        await new Promise(resolve => setTimeout(resolve, 10000));
        console.log('   ✅ Wait complete\n');

        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('✅ SUCCESS!');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('The hotelVillaSafePassStatus enum has been fixed.\n');
        console.log('Next steps:');
        console.log('1. Run: node test-safepass-creation.cjs');
        console.log('2. Run: node activate-safepass.cjs');
        console.log('3. Run: node verify-safepass-setup.cjs\n');

    } catch (error) {
        console.error('❌ Error fixing attribute:', error.message);
        console.error('\nPossible issues:');
        console.error('- API key missing or invalid');
        console.error('- Insufficient permissions');
        console.error('- Collection not found');
        console.error('- Attribute is still in use\n');
        throw error;
    }
}

fixEnumAttribute()
    .then(() => {
        console.log('✨ Fix complete!\n');
        process.exit(0);
    })
    .catch(error => {
        console.error('\n💥 Fix failed:', error.message);
        process.exit(1);
    });
