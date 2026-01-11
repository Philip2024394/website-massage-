/**
 * Manual Verification Setup Instructions
 * Since we can't programmatically add attributes, here are the manual steps
 */

console.log('📋 [MANUAL SETUP] ================================');
console.log('📋 Manual Appwrite Collection Setup Required');
console.log('📋 [MANUAL SETUP] ================================');

console.log('');
console.log('🔧 STEPS TO ADD VERIFICATION ATTRIBUTES:');
console.log('');
console.log('1. 🌐 Open Appwrite Console:');
console.log('   https://cloud.appwrite.io/console');
console.log('');
console.log('2. 📂 Navigate to Database:');
console.log('   → Databases → Select your database');
console.log('   → Collections → therapists_collection_id');
console.log('');
console.log('3. ➕ Add Attributes (Attributes tab):');
console.log('');
console.log('   Attribute 1:');
console.log('   - Type: Boolean');
console.log('   - Key: isVerified');
console.log('   - Required: No (unchecked)');
console.log('   - Default: false');
console.log('   - Array: No (unchecked)');
console.log('');
console.log('   Attribute 2:');
console.log('   - Type: String');
console.log('   - Key: verifiedAt');
console.log('   - Size: 255');
console.log('   - Required: No (unchecked)');
console.log('   - Default: (leave empty)');
console.log('   - Array: No (unchecked)');
console.log('');
console.log('4. ✅ Save and Wait:');
console.log('   - Click "Create" for each attribute');
console.log('   - Wait for Appwrite to process (10-30 seconds)');
console.log('');
console.log('5. 🧪 Test the system:');
console.log('   - Run: node test-verification-system.cjs');
console.log('   - Open Admin Dashboard: http://localhost:3004');
console.log('   - Go to Therapists section and test verification');
console.log('');
console.log('📋 [MANUAL SETUP] ================================');

// Test if the attributes already exist
const { Client, Databases, Query } = require('appwrite');

const client = new Client()
    .setEndpoint('https://syd.cloud.appwrite.io/v1')
    .setProject('68f23b11000d25eb3664');

const databases = new Databases(client);

async function checkAttributes() {
    try {
        console.log('');
        console.log('🔍 [CHECKING] Testing if attributes already exist...');
        
        const response = await databases.listDocuments(
            '68f76ee1000e64ca8d05',
            'therapists_collection_id',
            [Query.limit(1)]
        );
        
        if (response.documents.length > 0) {
            const doc = response.documents[0];
            console.log('');
            console.log('📊 Current document structure includes:');
            
            if ('isVerified' in doc) {
                console.log('   ✅ isVerified attribute exists');
            } else {
                console.log('   ❌ isVerified attribute missing - ADD IT MANUALLY');
            }
            
            if ('verifiedAt' in doc) {
                console.log('   ✅ verifiedAt attribute exists');
            } else {
                console.log('   ❌ verifiedAt attribute missing - ADD IT MANUALLY');
            }
            
            console.log('');
            console.log('🔑 Available attributes:', Object.keys(doc).join(', '));
        }
        
    } catch (error) {
        console.error('❌ Error checking attributes:', error.message);
    }
}

checkAttributes();