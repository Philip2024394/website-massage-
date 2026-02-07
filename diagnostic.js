/**
 * Run this script in the browser console on either:
 * - http://localhost:3003 (therapist dashboard)
 * - http://localhost:3000 (main app)
 * 
 * This will help diagnose the publish button issue
 */

console.log('🔍 Starting Therapist Flow Diagnostic...\n');

// Step 1: Check Appwrite Configuration
console.log('📋 Step 1: Checking Appwrite Configuration');
console.log('=========================================');

async function checkConfig() {
    try {
        // Get config from the loaded app
        const { APPWRITE_CONFIG } = await import('./lib/appwrite.config.ts');
        
        console.log('✅ Configuration loaded:');
        console.log('  - Endpoint:', APPWRITE_CONFIG.endpoint);
        console.log('  - Project ID:', APPWRITE_CONFIG.projectId);
        console.log('  - Database ID:', APPWRITE_CONFIG.databaseId);
        console.log('  - Therapist Collection ID:', APPWRITE_CONFIG.collections.therapists);
        
        if (APPWRITE_CONFIG.collections.therapists === 'therapists_collection_id') {
            console.error('❌ PROBLEM FOUND: Therapist collection ID is still a placeholder!');
            console.log('💡 You need to update this to your actual Appwrite collection ID\n');
        }
        
        return APPWRITE_CONFIG;
    } catch (error) {
        console.error('❌ Failed to load config:', error);
        return null;
    }
}

// Step 2: Test Appwrite Connection
console.log('\n📋 Step 2: Testing Appwrite Connection');
console.log('=========================================');

async function testConnection() {
    try {
        const { databases } = await import('./lib/appwrite/client.ts');
        const config = await checkConfig();
        
        if (!config) {
            console.error('❌ Cannot test connection without config');
            return false;
        }
        
        // Try to list documents
        const response = await databases.listDocuments(
            config.databaseId,
            config.collections.therapists,
            []
        );
        
        console.log('✅ Connection successful!');
        console.log('  - Total therapists:', response.total);
        console.log('  - Live therapists:', response.documents.filter(d => d.isLive).length);
        
        return true;
    } catch (error) {
        console.error('❌ Connection failed:', error.message);
        
        if (error.message.includes('Collection with the requested ID could not be found')) {
            console.error('\n💡 FIX REQUIRED:');
            console.error('1. Go to: https://syd.cloud.appwrite.io/console');
            console.error('2. Navigate to Databases → Your Database');
            console.error('3. Find your therapists collection');
            console.error('4. Copy the collection ID (NOT the name)');
            console.error('5. Update lib/appwrite.config.ts line 15');
            console.error('   Replace: therapists: "therapists_collection_id"');
            console.error('   With:    therapists: "YOUR_ACTUAL_COLLECTION_ID"');
        }
        
        return false;
    }
}

// Step 3: Check Current User
console.log('\n📋 Step 3: Checking Authentication');
console.log('=========================================');

async function checkAuth() {
    try {
        const { appwriteAccount } = await import('./lib/appwrite/client.ts');
        const user = await appwriteAccount.get();
        
        console.log('✅ Logged in as:', user.email);
        return user;
    } catch (error) {
        console.error('❌ Not authenticated:', error.message);
        console.log('💡 Please log in at http://localhost:3003');
        return null;
    }
}

// Step 4: Find Therapist Profile
console.log('\n📋 Step 4: Finding Your Therapist Profile');
console.log('=========================================');

async function findTherapist(email) {
    try {
        const { databases } = await import('./lib/appwrite/client.ts');
        const config = await checkConfig();
        
        const response = await databases.listDocuments(
            config.databaseId,
            config.collections.therapists,
            [Query.equal('email', email)]
        );
        
        if (response.total === 0) {
            console.error('❌ No therapist profile found for:', email);
            return null;
        }
        
        const therapist = response.documents[0];
        console.log('✅ Found your profile:');
        console.log('  - Name:', therapist.name);
        console.log('  - ID:', therapist.$id);
        console.log('  - isLive:', therapist.isLive);
        console.log('  - City:', therapist.city);
        console.log('  - WhatsApp:', therapist.whatsappNumber);
        console.log('  - Last updated:', new Date(therapist.$updatedAt).toLocaleString());
        
        return therapist;
    } catch (error) {
        console.error('❌ Failed to find therapist:', error.message);
        return null;
    }
}

// Step 5: Test Update Function
console.log('\n📋 Step 5: Testing Update Function');
console.log('=========================================');

async function testUpdate(therapistId) {
    try {
        const { databases } = await import('./lib/appwrite/client.ts');
        const config = await checkConfig();
        
        console.log('🔄 Attempting to update therapist:', therapistId);
        
        const updated = await databases.updateDocument(
            config.databaseId,
            config.collections.therapists,
            therapistId,
            {
                isLive: true,
                $updatedAt: new Date().toISOString()
            }
        );
        
        console.log('✅ Update successful!');
        console.log('  - isLive:', updated.isLive);
        console.log('  - Updated at:', new Date(updated.$updatedAt).toLocaleString());
        
        return true;
    } catch (error) {
        console.error('❌ Update failed:', error.message);
        return false;
    }
}

// Main Diagnostic Function
async function runFullDiagnostic() {
    console.log('\n🚀 Running Full Diagnostic\n');
    console.log('='.repeat(50));
    
    // Check config
    const config = await checkConfig();
    if (!config) {
        console.log('\n❌ CRITICAL: Cannot proceed without valid config');
        return;
    }
    
    // Test connection
    console.log('\n');
    const connected = await testConnection();
    if (!connected) {
        console.log('\n❌ CRITICAL: Cannot connect to Appwrite');
        console.log('Fix the collection ID issue and try again');
        return;
    }
    
    // Check auth
    console.log('\n');
    const user = await checkAuth();
    if (!user) {
        console.log('\n⚠️ Not logged in - cannot test profile update');
        console.log('Run this after logging in to test the full flow');
        return;
    }
    
    // Find therapist
    console.log('\n');
    const therapist = await findTherapist(user.email);
    if (!therapist) {
        console.log('\n❌ Cannot find your therapist profile');
        return;
    }
    
    // Test update
    console.log('\n');
    const updated = await testUpdate(therapist.$id);
    
    // Summary
    console.log('\n');
    console.log('='.repeat(50));
    console.log('📊 DIAGNOSTIC SUMMARY');
    console.log('='.repeat(50));
    console.log('✅ Config loaded:', !!config);
    console.log('✅ Appwrite connection:', connected);
    console.log('✅ User authenticated:', !!user);
    console.log('✅ Therapist found:', !!therapist);
    console.log('✅ Update test:', updated);
    
    if (updated) {
        console.log('\n✅ ALL SYSTEMS WORKING!');
        console.log('Your publish button should work correctly.');
        console.log('\nNext steps:');
        console.log('1. Go to therapist dashboard: http://localhost:3003');
        console.log('2. Click "Publish Profile & Go Live"');
        console.log('3. Check main site: http://localhost:3000');
    } else {
        console.log('\n❌ ISSUES DETECTED');
        console.log('Please fix the errors above before using the publish button');
    }
}

// Quick Commands
console.log('\n💡 QUICK COMMANDS');
console.log('='.repeat(50));
console.log('Run in console:');
console.log('');
console.log('// Full diagnostic');
console.log('runFullDiagnostic()');
console.log('');
console.log('// Quick checks');
console.log('checkConfig()');
console.log('testConnection()');
console.log('checkAuth()');
console.log('');
console.log('// List all therapists');
console.log('listAllTherapists()');
console.log('');
console.log('// List only live therapists');
console.log('listLiveTherapists()');

// Helper: List all therapists
window.listAllTherapists = async function() {
    const { databases } = await import('./lib/appwrite/client.ts');
    const config = await checkConfig();
    const response = await databases.listDocuments(
        config.databaseId,
        config.collections.therapists
    );
    console.table(response.documents.map(d => ({
        Name: d.name,
        isLive: d.isLive,
        City: d.city,
        Updated: new Date(d.$updatedAt).toLocaleString()
    })));
};

// Helper: List live therapists
window.listLiveTherapists = async function() {
    const { databases, Query } = await import('./lib/appwrite/client.ts');
    const config = await checkConfig();
    const response = await databases.listDocuments(
        config.databaseId,
        config.collections.therapists,
        [Query.equal('isLive', true)]
    );
    console.log(`Found ${response.total} live therapists:`);
    console.table(response.documents.map(d => ({
        Name: d.name,
        City: d.city,
        WhatsApp: d.whatsappNumber,
        Updated: new Date(d.$updatedAt).toLocaleString()
    })));
};

// Make functions global
window.runFullDiagnostic = runFullDiagnostic;
window.checkConfig = checkConfig;
window.testConnection = testConnection;
window.checkAuth = checkAuth;

// Auto-run
console.log('\n🔄 Auto-running diagnostic...\n');
runFullDiagnostic();
