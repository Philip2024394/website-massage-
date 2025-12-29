import { Client, Databases, ID } from 'node-appwrite';

const client = new Client()
    .setEndpoint('https://syd.cloud.appwrite.io/v1')
    .setProject('68f23b11000d25eb3664')
    .setKey('standard_655afe2b29f012a4dc55fbf4e3f54ec4e9c5a77c19b1beee3dba75fb5207e9ace0c1e4e1d8ecc92b1c6a86ce17d6a21b3bf6bbe6dce50dbbdf899bd7d50b36dafee57f99ac29d4b6e39e86a59e7f2b1c8a34c33e1cf8ce5e5da0829a42ee3e68e09c4ac8891f3d1a5bc0b2d19d6ba0c8b1c6e10d9fcdfb19cebb74e4df5c94');

const databases = new Databases(client);
const databaseId = '68f76ee1000e64ca8d05';

console.log('🏗️  Creating Bulletproof Location Collections...\n');

async function createCollections() {
    try {
        // Create cities collection
        console.log('Step 1: Creating cities collection...');
        const citiesCollection = await databases.createCollection(
            databaseId,
            ID.unique(),
            'cities'
        );
        const citiesId = citiesCollection.$id;
        console.log(`✅ Created cities collection: ${citiesId}\n`);

        // Wait for collection to be ready
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Create attributes for cities
        console.log('Step 2: Adding attributes to cities...');
        
        await databases.createStringAttribute(databaseId, citiesId, 'name', 100, true);
        console.log('  ✅ name (STRING, required)');
        await new Promise(resolve => setTimeout(resolve, 1000));

        await databases.createStringAttribute(databaseId, citiesId, 'slug', 100, true);
        console.log('  ✅ slug (STRING, required)');
        await new Promise(resolve => setTimeout(resolve, 1000));

        await databases.createStringAttribute(databaseId, citiesId, 'aliases', 1000, false, null, true);
        console.log('  ✅ aliases (STRING[], optional)');
        await new Promise(resolve => setTimeout(resolve, 1000));

        await databases.createFloatAttribute(databaseId, citiesId, 'latitude', true);
        console.log('  ✅ latitude (FLOAT, required)');
        await new Promise(resolve => setTimeout(resolve, 1000));

        await databases.createFloatAttribute(databaseId, citiesId, 'longitude', true);
        console.log('  ✅ longitude (FLOAT, required)');
        await new Promise(resolve => setTimeout(resolve, 1000));

        await databases.createStringAttribute(databaseId, citiesId, 'country', 100, false, 'Indonesia');
        console.log('  ✅ country (STRING, default: Indonesia)');
        await new Promise(resolve => setTimeout(resolve, 1000));

        await databases.createStringAttribute(databaseId, citiesId, 'province', 200, false);
        console.log('  ✅ province (STRING, optional)');
        await new Promise(resolve => setTimeout(resolve, 1000));

        await databases.createBooleanAttribute(databaseId, citiesId, 'isActive', false, true);
        console.log('  ✅ isActive (BOOLEAN, default: true)');
        await new Promise(resolve => setTimeout(resolve, 1000));

        await databases.createIntegerAttribute(databaseId, citiesId, 'displayOrder', false, 0);
        console.log('  ✅ displayOrder (INTEGER, default: 0)');
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Create indexes
        console.log('\nStep 3: Creating indexes for cities...');
        await databases.createIndex(databaseId, citiesId, 'slug_index', 'key', ['slug'], ['ASC']);
        console.log('  ✅ slug_index');
        await new Promise(resolve => setTimeout(resolve, 1000));

        await databases.createIndex(databaseId, citiesId, 'order_index', 'key', ['displayOrder', 'name'], ['ASC', 'ASC']);
        console.log('  ✅ order_index');
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Create therapist_locations collection
        console.log('\nStep 4: Creating therapist_locations collection...');
        const therapistLocationsCollection = await databases.createCollection(
            databaseId,
            ID.unique(),
            'therapist_locations'
        );
        const therapistLocationsId = therapistLocationsCollection.$id;
        console.log(`✅ Created therapist_locations collection: ${therapistLocationsId}\n`);

        await new Promise(resolve => setTimeout(resolve, 2000));

        // Create attributes for therapist_locations
        console.log('Step 5: Adding attributes to therapist_locations...');
        
        await databases.createStringAttribute(databaseId, therapistLocationsId, 'therapistId', 100, true);
        console.log('  ✅ therapistId (STRING, required)');
        await new Promise(resolve => setTimeout(resolve, 1000));

        await databases.createStringAttribute(databaseId, therapistLocationsId, 'cityId', 100, true);
        console.log('  ✅ cityId (STRING, required)');
        await new Promise(resolve => setTimeout(resolve, 1000));

        await databases.createStringAttribute(databaseId, therapistLocationsId, 'address', 500, false);
        console.log('  ✅ address (STRING, optional)');
        await new Promise(resolve => setTimeout(resolve, 1000));

        await databases.createStringAttribute(databaseId, therapistLocationsId, 'coordinates', 200, false);
        console.log('  ✅ coordinates (STRING, optional)');
        await new Promise(resolve => setTimeout(resolve, 1000));

        await databases.createBooleanAttribute(databaseId, therapistLocationsId, 'isPrimary', false, true);
        console.log('  ✅ isPrimary (BOOLEAN, default: true)');
        await new Promise(resolve => setTimeout(resolve, 1000));

        await databases.createBooleanAttribute(databaseId, therapistLocationsId, 'isActive', false, true);
        console.log('  ✅ isActive (BOOLEAN, default: true)');
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Create indexes
        console.log('\nStep 6: Creating indexes for therapist_locations...');
        await databases.createIndex(databaseId, therapistLocationsId, 'therapist_index', 'key', ['therapistId'], ['ASC']);
        console.log('  ✅ therapist_index');
        await new Promise(resolve => setTimeout(resolve, 1000));

        await databases.createIndex(databaseId, therapistLocationsId, 'city_index', 'key', ['cityId'], ['ASC']);
        console.log('  ✅ city_index');
        await new Promise(resolve => setTimeout(resolve, 1000));

        await databases.createIndex(databaseId, therapistLocationsId, 'active_index', 'key', ['isActive'], ['DESC']);
        console.log('  ✅ active_index');

        console.log('\n🎉 ALL COLLECTIONS CREATED SUCCESSFULLY!\n');
        console.log('Collection IDs:');
        console.log(`  cities: ${citiesId}`);
        console.log(`  therapist_locations: ${therapistLocationsId}`);
        console.log('\nNext steps:');
        console.log('  1. Run: node seed-cities.mjs');
        console.log('  2. Run: node migrate-therapist-locations.mjs');

        return { citiesId, therapistLocationsId };

    } catch (error) {
        console.error('❌ Error:', error.message);
        if (error.response) {
            console.error('Response:', error.response);
        }
        process.exit(1);
    }
}

createCollections();
