/**
 * 🔍 DISCOVER ACTUAL APPWRITE COLLECTIONS
 * 
 * Lists all collections in the database with their real IDs
 */

const { Client, Databases } = require('node-appwrite');

// Browser-style client (NO API KEY - uses collection permissions)
const client = new Client()
    .setEndpoint('https://syd.cloud.appwrite.io/v1')
    .setProject('68f23b11000d25eb3664');

const databases = new Databases(client);
const DATABASE_ID = '68f76ee1000e64ca8d05';

async function discoverCollections() {
    console.log('🔍 Discovering all collections in database...\n');
    
    try {
        const collections = await databases.listCollections(DATABASE_ID);
        
        console.log(`Found ${collections.total} collections:\n`);
        
        for (const collection of collections.collections) {
            console.log(`📋 ${collection.name}`);
            console.log(`   ID: ${collection.$id}`);
            console.log(`   Enabled: ${collection.enabled}`);
            console.log(`   Document Security: ${collection.documentSecurity}`);
            console.log(`   Permissions: ${collection.$permissions?.length || 0} rules`);
            
            if (collection.$permissions && collection.$permissions.length > 0) {
                console.log(`   Permission details:`);
                collection.$permissions.forEach(perm => {
                    console.log(`      - ${perm}`);
                });
            } else {
                console.log(`   ⚠️  No permissions set!`);
            }
            console.log('');
        }
        
        return collections.collections;
        
    } catch (error) {
        console.error('❌ Failed to list collections:', error.message);
        console.error('   Type:', error.type);
        console.error('   Code:', error.code);
        console.error('');
        console.error('This might mean:');
        console.error('   1. Database ID is incorrect');
        console.error('   2. Database permissions don\'t allow listing');
        console.error('   3. Project ID is incorrect\n');
        return [];
    }
}

async function checkBookingCollections(collections) {
    console.log('═══════════════════════════════════════════════════════');
    console.log('🔍 CHECKING BOOKING-RELATED COLLECTIONS');
    console.log('═══════════════════════════════════════════════════════\n');
    
    const bookingRelated = collections.filter(c => 
        c.name.toLowerCase().includes('booking') ||
        c.name.toLowerCase().includes('message') ||
        c.name.toLowerCase().includes('chat') ||
        c.name.toLowerCase().includes('session')
    );
    
    if (bookingRelated.length === 0) {
        console.log('❌ No booking-related collections found!\n');
        console.log('You need to create these collections:');
        console.log('   - bookings');
        console.log('   - messages');
        console.log('   - chat_sessions\n');
        return;
    }
    
    console.log(`Found ${bookingRelated.length} booking-related collections:\n`);
    
    for (const collection of bookingRelated) {
        console.log(`📋 ${collection.name} (${collection.$id})`);
        
        const hasCreatePermission = collection.$permissions?.some(p => 
            p.includes('create') && p.includes('any')
        );
        
        if (hasCreatePermission) {
            console.log(`   ✅ HAS create("any()") permission`);
        } else {
            console.log(`   ❌ MISSING create("any()") permission`);
            console.log(`   Current permissions: ${collection.$permissions?.join(', ') || 'none'}`);
        }
        console.log('');
    }
}

async function main() {
    console.log('═══════════════════════════════════════════════════════');
    console.log('🔐 APPWRITE COLLECTION DISCOVERY');
    console.log('═══════════════════════════════════════════════════════\n');
    console.log(`Endpoint: https://syd.cloud.appwrite.io/v1`);
    console.log(`Project: 68f23b11000d25eb3664`);
    console.log(`Database: 68f76ee1000e64ca8d05\n`);
    
    const collections = await discoverCollections();
    
    if (collections.length > 0) {
        await checkBookingCollections(collections);
        
        console.log('═══════════════════════════════════════════════════════');
        console.log('💡 NEXT STEPS');
        console.log('═══════════════════════════════════════════════════════\n');
        console.log('For each booking collection that needs permissions:');
        console.log('   1. Go to Appwrite Console');
        console.log('   2. Navigate to Database → Collection');
        console.log('   3. Settings → Permissions');
        console.log('   4. Add: create("any()")');
        console.log('   5. Add: read("any()")');
        console.log('   6. Add: update("any()")');
        console.log('   7. Save changes\n');
    }
}

main().catch(error => {
    console.error('❌ Fatal error:', error.message);
    process.exit(1);
});
