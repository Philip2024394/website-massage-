// Collection ID Finder for Massage Place Dashboard
// Paste this into your browser console at localhost:3006

console.log('🔍 Finding correct Appwrite collection IDs...');

// Common collection names to test
const collectionNames = [
    'therapists',
    'Therapists', 
    'massage_therapists',
    'providers',
    'users',
    'therapist',
    'therapy_providers'
];

async function testCollectionName(name) {
    const testUrl = `https://syd.cloud.appwrite.io/v1/databases/68f76ee1000e64ca8d05/collections/${name}/documents?queries[0]={"method":"limit","values":[1]}`;
    
    try {
        const response = await fetch(testUrl, {
            headers: {
                'X-Appwrite-Project': '68f23b11000d25eb3664'
            }
        });
        
        if (response.status === 200) {
            console.log(`✅ FOUND WORKING COLLECTION: "${name}"`);
            console.log(`Update appwrite.config.ts with:`);
            console.log(`therapists: '${name}',`);
            console.log(`places: '${name}',`);
            return name;
        } else if (response.status === 401) {
            console.log(`🔐 Collection "${name}" exists but needs authentication`);
            return name;
        } else {
            console.log(`❌ Collection "${name}" not found (${response.status})`);
        }
    } catch (error) {
        console.log(`❌ Error testing "${name}":`, error.message);
    }
    return null;
}

async function findCollections() {
    console.log('Testing common collection names...\n');
    
    for (const name of collectionNames) {
        const result = await testCollectionName(name);
        if (result) {
            console.log(`\n🎉 USE THIS COLLECTION NAME: ${result}\n`);
            break;
        }
    }
    
    console.log('\n💡 If none work, go to your Appwrite console:');
    console.log('https://cloud.appwrite.io/console/project-68f23b11000d25eb3664/databases/database-68f76ee1000e64ca8d05');
    console.log('And check the actual collection names/IDs');
}

findCollections();