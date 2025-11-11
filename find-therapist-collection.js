// Quick test to find the correct therapist collection ID
// Run this in browser console on your app page to test different collection IDs

const APPWRITE_CONFIG = {
    endpoint: 'https://syd.cloud.appwrite.io/v1',
    projectId: '68f23b11000d25eb3664',
    databaseId: '68f76ee1000e64ca8d05'
};

// Initialize Appwrite
const client = new Appwrite.Client()
    .setEndpoint(APPWRITE_CONFIG.endpoint)
    .setProject(APPWRITE_CONFIG.projectId);

const databases = new Appwrite.Databases(client);

// Known therapist document IDs (from your debug files)
const KNOWN_THERAPIST_IDS = [
    '690a0a0f002949071cb4', // phil4
    '6909ea3d000968f94102', // ph3
    '6909bc5400289a16c995', // philip1
    '6909ad5e00341154e55d'  // teamhammerex
];

// Possible collection ID variations to test
const POSSIBLE_COLLECTION_IDS = [
    'therapists',
    'therapists_collection_id',
    'Therapists',
    'therapist',
    'therapist_collection_id',
    'users',
    'providers',
    'massage_therapists'
];

async function findTherapistCollectionId() {
    console.log('🔍 Searching for correct therapist collection ID...');
    
    for (const collectionId of POSSIBLE_COLLECTION_IDS) {
        try {
            console.log(`🧪 Testing collection ID: "${collectionId}"`);
            
            const response = await databases.listDocuments(
                APPWRITE_CONFIG.databaseId,
                collectionId,
                [Appwrite.Query.limit(1)]
            );
            
            if (response.documents.length > 0) {
                const doc = response.documents[0];
                console.log(`✅ SUCCESS! Found working collection: "${collectionId}"`);
                console.log(`📄 Sample document:`, {
                    id: doc.$id,
                    name: doc.name || 'No name field',
                    email: doc.email || 'No email field',
                    keys: Object.keys(doc).slice(0, 10) // Show first 10 fields
                });
                
                // Check if this looks like a therapist document
                if (doc.name || doc.email || doc.bio || doc.specialties) {
                    console.log(`🎯 This looks like a therapist collection!`);
                    return collectionId;
                } else {
                    console.log(`⚠️ This collection exists but may not be therapists`);
                }
            } else {
                console.log(`📭 Collection "${collectionId}" exists but is empty`);
            }
            
        } catch (error) {
            console.log(`❌ Collection "${collectionId}" not found: ${error.message}`);
        }
    }
    
    console.log('❌ No working therapist collection found with standard names');
    return null;
}

// Also try to find any collection that contains our known therapist IDs
async function findCollectionWithKnownTherapists() {
    console.log('🔍 Searching for collections containing known therapist IDs...');
    
    // Get all collections first
    try {
        const collections = await databases.listCollections(APPWRITE_CONFIG.databaseId);
        console.log(`📁 Found ${collections.collections.length} total collections`);
        
        for (const collection of collections.collections) {
            try {
                console.log(`🧪 Testing collection: "${collection.name}" (ID: ${collection.$id})`);
                
                // Try to find one of our known therapist IDs in this collection
                for (const therapistId of KNOWN_THERAPIST_IDS) {
                    try {
                        const doc = await databases.getDocument(
                            APPWRITE_CONFIG.databaseId,
                            collection.$id,
                            therapistId
                        );
                        
                        console.log(`🎯 FOUND! Therapist "${therapistId}" exists in collection "${collection.name}" (ID: ${collection.$id})`);
                        console.log(`📄 Therapist data:`, {
                            name: doc.name || 'No name',
                            email: doc.email || 'No email',
                            status: doc.status || 'No status',
                            keys: Object.keys(doc).slice(0, 10)
                        });
                        
                        return collection.$id;
                        
                    } catch (e) {
                        // Document not in this collection, continue
                    }
                }
                
            } catch (collectionError) {
                console.log(`❌ Cannot access collection "${collection.name}": ${collectionError.message}`);
            }
        }
        
    } catch (error) {
        console.error('❌ Cannot list collections:', error.message);
    }
    
    return null;
}

// Run both methods
async function runDiagnostic() {
    console.log('🚀 Starting therapist collection diagnostic...\n');
    
    const result1 = await findTherapistCollectionId();
    const result2 = await findCollectionWithKnownTherapists();
    
    if (result1 || result2) {
        const collectionId = result1 || result2;
        console.log(`\n🎉 SUCCESS! Your therapist collection ID is: "${collectionId}"`);
        console.log(`\n📝 Update your lib/appwrite.config.ts file:`);
        console.log(`therapists: '${collectionId}', // ✅ Real collection ID found!`);
    } else {
        console.log('\n❌ Could not find therapist collection. Please check your Appwrite console manually.');
    }
}

// Export for use
window.runTherapistDiagnostic = runDiagnostic;

console.log('🔧 Therapist Collection Finder loaded!');
console.log('📋 Run: runTherapistDiagnostic() to find your collection ID');