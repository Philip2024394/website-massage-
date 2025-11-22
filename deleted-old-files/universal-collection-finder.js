// Universal Collection Finder
// Paste this in browser console to find ALL existing collections

console.log('🔍 Universal Appwrite Collection Finder');

const config = {
    endpoint: 'https://syd.cloud.appwrite.io/v1',
    projectId: '68f23b11000d25eb3664',
    databaseId: '68f76ee1000e64ca8d05'
};

// Try to list all collections directly
async function findAllCollections() {
    console.log('📋 Attempting to list all collections...');
    
    try {
        // Try the direct collections endpoint
        const collectionsUrl = `${config.endpoint}/databases/${config.databaseId}/collections`;
        
        const response = await fetch(collectionsUrl, {
            method: 'GET',
            headers: {
                'X-Appwrite-Project': config.projectId
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            console.log('✅ SUCCESS! Found collections:', data);
            
            if (data.collections && data.collections.length > 0) {
                console.log('\n🎯 AVAILABLE COLLECTIONS:');
                console.log('=' .repeat(50));
                
                data.collections.forEach(collection => {
                    console.log(`📂 Name: "${collection.name}"`);
                    console.log(`   ID: "${collection.$id}"`);
                    console.log(`   Attributes: ${collection.attributes ? collection.attributes.length : 0}`);
                    console.log('');
                });
                
                // Find the best match for therapists
                const therapistCollection = data.collections.find(c => 
                    c.name.toLowerCase().includes('therapist') || 
                    c.name.toLowerCase().includes('provider') ||
                    c.$id.toLowerCase().includes('therapist')
                );
                
                if (therapistCollection) {
                    console.log('🎉 RECOMMENDED COLLECTION FOR THERAPISTS/PLACES:');
                    console.log(`   Collection ID: "${therapistCollection.$id}"`);
                    console.log('\n📝 UPDATE YOUR appwrite.config.ts:');
                    console.log(`   therapists: '${therapistCollection.$id}',`);
                    console.log(`   places: '${therapistCollection.$id}',`);
                } else {
                    console.log('⚠️ No obvious therapist collection found. Use the first available collection:');
                    const first = data.collections[0];
                    console.log(`   Collection ID: "${first.$id}"`);
                    console.log('\n📝 UPDATE YOUR appwrite.config.ts:');
                    console.log(`   therapists: '${first.$id}',`);
                    console.log(`   places: '${first.$id}',`);
                }
                
            } else {
                console.log('❌ No collections found in this database');
                console.log('💡 You need to create collections in your Appwrite console first');
            }
            
        } else {
            console.log(`❌ Failed to list collections: ${response.status} ${response.statusText}`);
            throw new Error(`HTTP ${response.status}`);
        }
        
    } catch (error) {
        console.log('❌ Direct collection listing failed:', error.message);
        console.log('\n🔄 Trying alternative approach...');
        
        // Try common collection ID patterns
        await tryCommonPatterns();
    }
}

async function tryCommonPatterns() {
    console.log('\n🧪 Testing common collection ID patterns...');
    
    const patterns = [
        '68f76ee1001758526d84', // Pattern from file IDs we found
        '68f76ee10021eaa2f758', // Previous attempt
        '68f76ee1000e64ca8d06', // Database ID + 1
        '68f76ee1000e64ca8d04', // Database ID - 1
        'therapists',
        'providers',
        'users',
        'documents'
    ];
    
    for (const pattern of patterns) {
        await testCollection(pattern);
    }
}

async function testCollection(id) {
    try {
        const testUrl = `${config.endpoint}/databases/${config.databaseId}/collections/${id}/documents?queries[0]={"method":"limit","values":[1]}`;
        
        const response = await fetch(testUrl, {
            headers: {
                'X-Appwrite-Project': config.projectId
            }
        });
        
        if (response.status === 200) {
            console.log(`✅ WORKING COLLECTION FOUND: "${id}"`);
            const data = await response.json();
            console.log(`   Documents: ${data.documents.length}`);
            if (data.documents.length > 0) {
                const doc = data.documents[0];
                console.log(`   Sample fields: ${Object.keys(doc).slice(0, 5).join(', ')}`);
            }
            return id;
        } else if (response.status === 401) {
            console.log(`🔐 Collection "${id}" exists but needs authentication`);
            return id;
        } else {
            console.log(`❌ "${id}" - Not found (${response.status})`);
        }
    } catch (error) {
        console.log(`❌ "${id}" - Error: ${error.message}`);
    }
    return null;
}

// Start the search
findAllCollections();