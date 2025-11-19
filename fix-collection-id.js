/**
 * Simple browser console script to find collection IDs
 * Copy and paste this into your browser console while on localhost:3006
 */

// Try common collection ID patterns
const commonPatterns = [
    '68f76ee10000000000001', // pattern based on database ID
    '68f76ee10000000000002',
    'therapists',
    'therapist',
    'providers',
    'provider'
];

async function testCollectionId(testId) {
    try {
        console.log(`Testing collection ID: ${testId}`);
        
        // This would be the fetch call to test
        const response = await fetch('https://syd.cloud.appwrite.io/v1/databases/68f76ee1000e64ca8d05/collections/' + testId + '/documents', {
            headers: {
                'X-Appwrite-Project': '68f23b11000d25eb3664'
            }
        });
        
        if (response.ok || response.status === 401) { // 401 means collection exists but we need auth
            console.log(`✅ Found working collection ID: ${testId}`);
            return testId;
        }
    } catch (error) {
        console.log(`❌ ${testId} failed:`, error.message);
    }
    return null;
}

// Run the test
async function findCollectionId() {
    console.log('🔍 Searching for valid collection IDs...');
    
    for (const pattern of commonPatterns) {
        const result = await testCollectionId(pattern);
        if (result) {
            console.log(`\n🎉 Use this collection ID in appwrite.config.ts:`);
            console.log(`therapists: '${result}',`);
            console.log(`places: '${result}',`);
            break;
        }
    }
}

findCollectionId();