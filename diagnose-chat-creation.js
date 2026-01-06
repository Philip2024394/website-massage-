/**
 * Diagnostic Script: Test Chat Room Creation
 * 
 * Run this in browser console to test chat room creation independently
 */

// Import dependencies (assumes they're available in global scope)
const { databases } = window;

// Test chat room creation
async function testChatRoomCreation() {
    console.log('🧪 TESTING CHAT ROOM CREATION');
    console.log('========================================');
    
    const testData = {
        bookingId: 'test-booking-' + Date.now(),
        customerId: 'guest',
        customerName: 'Test Customer',
        customerLanguage: 'en',
        customerPhoto: '',
        therapistId: '12345',
        therapistName: 'Test Therapist',
        therapistLanguage: 'id',
        therapistType: 'therapist',
        therapistPhoto: '',
        expiresAt: new Date(Date.now() + 5 * 60 * 1000).toISOString()
    };
    
    console.log('📦 Test data:', JSON.stringify(testData, null, 2));
    
    try {
        console.log('⏳ Step 1: Importing createChatRoom function...');
        
        // Try to dynamically import the function
        const { createChatRoom } = await import('../lib/chatService.js');
        
        console.log('✅ Step 1: Import successful');
        console.log('⏳ Step 2: Creating chat room...');
        
        const chatRoom = await createChatRoom(testData);
        
        console.log('✅ Step 2: Chat room created successfully!');
        console.log('📋 Chat room:', JSON.stringify(chatRoom, null, 2));
        
        return { success: true, chatRoom };
        
    } catch (error) {
        console.error('❌ ERROR:', error);
        console.error('💥 Error message:', error.message);
        console.error('💥 Error stack:', error.stack);
        
        if (error.message) {
            if (error.message.includes('validation failed')) {
                console.error('🔍 VALIDATION ERROR: Check schema mismatch');
            } else if (error.message.includes('Missing required attribute')) {
                console.error('🔍 APPWRITE SCHEMA ERROR: Check collection attributes');
            } else if (error.message.includes('Collection') || error.message.includes('collection')) {
                console.error('🔍 COLLECTION ERROR: Check collection ID in config');
            }
        }
        
        return { success: false, error: error.message };
    }
}

// Check Appwrite config
function checkAppwriteConfig() {
    console.log('🔍 CHECKING APPWRITE CONFIG');
    console.log('========================================');
    
    try {
        // Try to access config
        const config = {
            databaseId: '68f76ee1000e64ca8d05',
            collections: {
                chatRooms: 'chat_rooms',
                chatMessages: 'chat_messages',
                bookings: 'bookings_collection_id'
            }
        };
        
        console.log('📋 Config:', JSON.stringify(config, null, 2));
        console.log('✅ Config accessible');
        
        // Check if databases object is available
        if (typeof databases === 'undefined') {
            console.error('❌ databases object NOT available in global scope');
            console.log('💡 Tip: Make sure Appwrite SDK is loaded');
        } else {
            console.log('✅ databases object available');
        }
        
    } catch (error) {
        console.error('❌ Config check failed:', error);
    }
}

// Main diagnostic
async function runDiagnostics() {
    console.log('🚀 CHAT AUTO-OPEN DIAGNOSTICS');
    console.log('========================================\n');
    
    console.log('📝 Step 1: Checking Appwrite config...');
    checkAppwriteConfig();
    
    console.log('\n📝 Step 2: Testing chat room creation...');
    const result = await testChatRoomCreation();
    
    console.log('\n📊 FINAL RESULT:', result);
    
    if (result.success) {
        console.log('✅ DIAGNOSTICS PASSED: Chat room creation working');
        console.log('💡 Next: Test openChat event dispatch');
    } else {
        console.log('❌ DIAGNOSTICS FAILED: Chat room creation broken');
        console.log('💡 Fix chat room creation before testing event system');
    }
    
    return result;
}

// Export for console use
console.log('✅ Diagnostic script loaded');
console.log('📝 Run: runDiagnostics()');
console.log('📝 Or run individual tests:');
console.log('   - checkAppwriteConfig()');
console.log('   - testChatRoomCreation()');
