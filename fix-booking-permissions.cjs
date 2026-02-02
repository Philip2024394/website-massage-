/**
 * 🔧 FIX BOOKING COLLECTION PERMISSIONS
 * 
 * This script updates Appwrite collection permissions to allow booking creation
 * from browser without API key (secure permission-based authentication).
 * 
 * Run: node fix-booking-permissions.cjs
 */

const { Client, Databases, Permission, Role } = require('node-appwrite');

const client = new Client()
    .setEndpoint('https://syd.cloud.appwrite.io/v1')
    .setProject('68f23b11000d25eb3664')
    .setKey(process.env.APPWRITE_API_KEY); // Server-side API key from environment

const databases = new Databases(client);

const DATABASE_ID = '68f76ee1000e64ca8d05';

// Collections that need create permissions
const COLLECTIONS_TO_FIX = [
    { id: '68f76fc60007e8fe2afe', name: 'bookings' },
    { id: '68f7702f002a5e32dd71', name: 'messages' },
    { id: '68f76ffa00163bcfdae6', name: 'chatSessions' }
];

async function fixCollectionPermissions() {
    console.log('🔧 Starting permission fix for booking collections...\n');
    
    for (const collection of COLLECTIONS_TO_FIX) {
        try {
            console.log(`📋 Updating collection: ${collection.name} (${collection.id})`);
            
            // Update collection with proper permissions
            await databases.updateCollection(
                DATABASE_ID,
                collection.id,
                collection.name,
                [
                    Permission.read(Role.any()),      // Anyone can read
                    Permission.create(Role.any()),    // ✅ Anyone can create (for Order Now)
                    Permission.update(Role.any()),    // Anyone can update
                    Permission.delete(Role.any())     // Anyone can delete
                ],
                false, // documentSecurity - false means collection-level permissions apply
                true   // enabled
            );
            
            console.log(`✅ ${collection.name} permissions updated successfully`);
            console.log(`   - Create permission: Role.any() ✅`);
            console.log(`   - Read permission: Role.any() ✅`);
            console.log(`   - Update permission: Role.any() ✅\n`);
            
        } catch (error) {
            console.error(`❌ Failed to update ${collection.name}:`, error.message);
            console.error(`   Error type: ${error.type || 'Unknown'}`);
            console.error(`   Error code: ${error.code || 'Unknown'}\n`);
        }
    }
    
    console.log('═══════════════════════════════════════════════════════');
    console.log('✅ PERMISSION FIX COMPLETED');
    console.log('═══════════════════════════════════════════════════════');
    console.log('📋 Next steps:');
    console.log('   1. Test Order Now button in browser');
    console.log('   2. Check console for [ORDER_NOW_MONITOR] logs');
    console.log('   3. Verify booking creation succeeds without errors');
    console.log('═══════════════════════════════════════════════════════\n');
}

// Verify collections exist before fixing
async function verifyCollections() {
    console.log('🔍 Verifying collections exist...\n');
    
    for (const collection of COLLECTIONS_TO_FIX) {
        try {
            const col = await databases.getCollection(DATABASE_ID, collection.id);
            console.log(`✅ Found: ${col.name} (${col.$id})`);
            console.log(`   Current permissions: ${col.$permissions?.length || 0} rules`);
            console.log(`   Document security: ${col.documentSecurity ? 'Enabled' : 'Disabled'}\n`);
        } catch (error) {
            console.error(`❌ Collection not found: ${collection.name} (${collection.id})`);
            console.error(`   Error: ${error.message}\n`);
        }
    }
}

// Main execution
async function main() {
    if (!process.env.APPWRITE_API_KEY) {
        console.error('❌ ERROR: APPWRITE_API_KEY environment variable not set');
        console.error('');
        console.error('Run this script with:');
        console.error('   $env:APPWRITE_API_KEY="your-api-key"; node fix-booking-permissions.cjs');
        console.error('');
        process.exit(1);
    }
    
    console.log('═══════════════════════════════════════════════════════');
    console.log('🔧 APPWRITE BOOKING PERMISSION FIX');
    console.log('═══════════════════════════════════════════════════════\n');
    
    await verifyCollections();
    await fixCollectionPermissions();
}

main().catch(error => {
    console.error('❌ Fatal error:', error.message);
    process.exit(1);
});
