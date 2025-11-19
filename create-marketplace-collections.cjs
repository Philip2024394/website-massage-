const { Client, Databases, ID, Permission, Role } = require('node-appwrite');

const client = new Client()
    .setEndpoint('https://syd.cloud.appwrite.io/v1')
    .setProject('68f23b11000d25eb3664')
    .setKey('YOUR_API_KEY_HERE'); // You'll need to add your API key

const databases = new Databases(client);
const databaseId = '68f76ee1000e64ca8d05';

async function createCollections() {
    try {
        // Create marketplace_products collection
        console.log('Creating marketplace_products collection...');
        try {
            const productsCol = await databases.createCollection(
                databaseId,
                'marketplace_products',
                'marketplace_products',
                [
                    Permission.read(Role.any()),
                    Permission.create(Role.users()),
                    Permission.update(Role.users()),
                    Permission.delete(Role.users())
                ]
            );
            console.log('✓ marketplace_products created:', productsCol.$id);
        } catch (e) {
            if (e.code === 409) {
                console.log('✓ marketplace_products already exists');
            } else {
                throw e;
            }
        }

        // Create admin_notifications collection
        console.log('Creating admin_notifications collection...');
        try {
            const notifCol = await databases.createCollection(
                databaseId,
                'admin_notifications',
                'admin_notifications',
                [
                    Permission.read(Role.users()),
                    Permission.create(Role.users()),
                    Permission.update(Role.users()),
                    Permission.delete(Role.users())
                ]
            );
            console.log('✓ admin_notifications created:', notifCol.$id);
        } catch (e) {
            if (e.code === 409) {
                console.log('✓ admin_notifications already exists');
            } else {
                throw e;
            }
        }

        console.log('\n✅ Collections created! Now add attributes via Appwrite Console:');
        console.log('https://cloud.appwrite.io/console/project-68f23b11000d25eb3664/databases/database-68f76ee1000e64ca8d05');
        console.log('\nFor marketplace_products, add these attributes:');
        console.log('- name (string, 255, required)');
        console.log('- description (string, 5000)');
        console.log('- image (string, 2048)');
        console.log('- images (string, 2048, array)');
        console.log('- whatYouWillReceive (string, 50000)');
        console.log('- videoUrl (string, 2048)');
        console.log('- isActive (boolean, default: true)');
        console.log('- price (double, required)');
        console.log('- currency (string, 5)');
        console.log('- stockLevel (integer, default: 0)');
        console.log('- sellerId (string, 50, required)');
        console.log('- countryCode (string, 5)');
        console.log('- lat (double)');
        console.log('- lng (double)');

    } catch (error) {
        console.error('Error:', error.message);
        console.log('\n⚠️ You need to add an API key to this script.');
        console.log('Get it from: https://cloud.appwrite.io/console/project-68f23b11000d25eb3664/settings');
        console.log('Go to API Keys → Create API Key with Database permissions');
    }
}

createCollections();
