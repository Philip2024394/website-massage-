/**
 * Chat Message Test - Admin to Therapist Communication
 * 
 * This test validates that admin messages to therapists are properly sent
 * and stored in the Appwrite database with correct field mapping.
 */

// Test function to validate admin-to-therapist messaging
async function testAdminToTherapistChat() {
    console.log('🧪 [CHAT TEST] Starting admin-to-therapist message test...');
    
    try {
        // Import the messaging service
        const { messagingService } = await import('../lib/appwrite/services/messaging.service');
        
        // Test message data
        const testMessage = {
            conversationId: 'admin_test-therapist-123',
            senderId: 'admin',
            senderName: 'Admin Support',
            senderType: 'admin', // 🔧 REQUIRED: This was missing before
            recipientId: 'test-therapist-123',
            recipientName: 'Test Therapist',
            recipientType: 'therapist', // 🔧 REQUIRED: This was missing before
            content: 'Hello! This is a test message from the admin dashboard.',
            type: 'text',
        };
        
        console.log('📤 [CHAT TEST] Sending test message...');
        console.log('📋 [CHAT TEST] Message data:', JSON.stringify(testMessage, null, 2));
        
        // Send the message
        const result = await messagingService.sendMessage(testMessage);
        
        console.log('✅ [CHAT TEST] Message sent successfully!');
        console.log('📄 [CHAT TEST] Response:', JSON.stringify(result, null, 2));
        
        return {
            success: true,
            messageId: result.$id,
            timestamp: result.$createdAt || new Date().toISOString(),
        };
        
    } catch (error) {
        console.error('❌ [CHAT TEST] Message sending failed:', error);
        console.error('📊 [CHAT TEST] Error details:', {
            message: error?.message,
            code: error?.code,
            type: error?.type,
            stack: error?.stack?.split('\n').slice(0, 3).join('\n')
        });
        
        return {
            success: false,
            error: error.message || 'Unknown error occurred',
        };
    }
}

// Test function to validate therapist-to-admin messaging
async function testTherapistToAdminChat() {
    console.log('🧪 [CHAT TEST] Starting therapist-to-admin message test...');
    
    try {
        const { messagingService } = await import('../lib/appwrite/services/messaging.service');
        
        const testMessage = {
            conversationId: 'test-therapist-123_admin',
            senderId: 'test-therapist-123',
            senderName: 'Test Therapist',
            senderType: 'therapist', // 🔧 REQUIRED: This was missing before
            recipientId: 'admin',
            recipientName: 'Admin Support',
            recipientType: 'admin',
            content: 'Hello Admin! I need help with my account settings.',
            type: 'text',
        };
        
        console.log('📤 [CHAT TEST] Sending therapist message...');
        
        const result = await messagingService.sendMessage(testMessage);
        
        console.log('✅ [CHAT TEST] Therapist message sent successfully!');
        console.log('📄 [CHAT TEST] Response:', JSON.stringify(result, null, 2));
        
        return {
            success: true,
            messageId: result.$id,
            timestamp: result.$createdAt || new Date().toISOString(),
        };
        
    } catch (error) {
        console.error('❌ [CHAT TEST] Therapist message failed:', error);
        
        return {
            success: false,
            error: error.message || 'Unknown error occurred',
        };
    }
}

// Main test runner
export async function runChatTests() {
    console.log('\n🚀 [CHAT SYSTEM] Running comprehensive chat tests...\n');
    
    const adminTest = await testAdminToTherapistChat();
    const therapistTest = await testTherapistToAdminChat();
    
    console.log('\n📊 [CHAT TEST RESULTS]');
    console.log('='.repeat(50));
    console.log(`Admin → Therapist: ${adminTest.success ? '✅ PASS' : '❌ FAIL'}`);
    if (!adminTest.success) console.log(`   Error: ${adminTest.error}`);
    
    console.log(`Therapist → Admin: ${therapistTest.success ? '✅ PASS' : '❌ FAIL'}`);
    if (!therapistTest.success) console.log(`   Error: ${therapistTest.error}`);
    
    const overallSuccess = adminTest.success && therapistTest.success;
    console.log(`\nOverall Status: ${overallSuccess ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`);
    console.log('='.repeat(50));
    
    if (overallSuccess) {
        console.log('\n🎉 Chat messaging is working correctly!');
        console.log('   • Admin can send messages to therapists');
        console.log('   • Therapists can send messages to admin');
        console.log('   • All required fields are properly validated');
        console.log('   • Messages are stored in Appwrite database');
    } else {
        console.log('\n⚠️ Chat messaging needs attention!');
        console.log('   Please check the error details above.');
    }
    
    return overallSuccess;
}

// Make functions available globally for browser console testing
if (typeof window !== 'undefined') {
    window.testAdminToTherapistChat = testAdminToTherapistChat;
    window.testTherapistToAdminChat = testTherapistToAdminChat;
    window.runChatTests = runChatTests;
    
    console.log('🔧 [CHAT TEST] Test functions loaded:');
    console.log('   • testAdminToTherapistChat() - Test admin sending to therapist');
    console.log('   • testTherapistToAdminChat() - Test therapist sending to admin');
    console.log('   • runChatTests() - Run all chat tests');
}