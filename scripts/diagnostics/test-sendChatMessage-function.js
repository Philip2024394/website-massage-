/**
 * Test sendChatMessage Function Directly
 * This will help diagnose why the function returns 404
 */

const { Client, Functions } = require('node-appwrite');

const client = new Client();
client
    .setEndpoint('https://syd.cloud.appwrite.io/v1')
    .setProject('68f23b11000d25eb3664');

const functions = new Functions(client);

async function testFunction() {
    console.log('\n🔍 Testing sendChatMessage function...\n');
    
    try {
        // Test 1: Check if function exists
        console.log('Test 1: Checking if function exists...');
        const execution = await functions.createExecution(
            'sendChatMessage', // Function ID
            JSON.stringify({
                chatroomId: 'test-chatroom',
                message: 'Test message',
                senderId: 'test-user'
            }),
            false, // Not async
            '/', // Path
            'POST' // Method
        );
        
        console.log('✅ Function exists and executed!');
        console.log('Response:', execution);
        console.log('Status:', execution.status);
        console.log('Response Body:', execution.responseBody);
        
        if (execution.status === 'failed') {
            console.log('\n❌ Function executed but FAILED:');
            console.log('Error:', execution.stderr);
        }
        
    } catch (error) {
        console.log('\n❌ Function test FAILED:');
        console.log('Error code:', error.code);
        console.log('Error message:', error.message);
        console.log('Error type:', error.type);
        
        if (error.code === 404) {
            console.log('\n🔴 DIAGNOSIS: Function "sendChatMessage" does NOT exist in Appwrite');
            console.log('\nPossible causes:');
            console.log('1. Function ID mismatch - check exact name in Appwrite Console');
            console.log('2. Function exists but with different ID (case sensitive)');
            console.log('3. Function was deleted or not deployed');
            console.log('\n📋 Functions you listed as having in Appwrite:');
            console.log('   - Commission Deadline Enforcement');
            console.log('   - sendPushNotifications');
            console.log('   - acceptTherapist');
            console.log('   - cancelBooking');
            console.log('   - searchTherapists');
            console.log('   - createBooking');
            console.log('\n⚠️  Note: sendChatMessage is NOT in your list!');
        }
    }
}

// Test alternative function IDs
async function testAlternativeIds() {
    console.log('\n\n🔍 Testing alternative function IDs...\n');
    
    const alternatives = [
        'sendChatMessage',
        'SendChatMessage',
        'send-chat-message',
        'send_chat_message',
        'chatMessage',
        'sendMessage'
    ];
    
    for (const id of alternatives) {
        try {
            console.log(`Testing: "${id}"...`);
            const execution = await functions.createExecution(
                id,
                '{}',
                false
            );
            console.log(`✅ FOUND! Function ID is: "${id}"`);
            break;
        } catch (error) {
            if (error.code === 404) {
                console.log(`   ❌ "${id}" not found`);
            } else {
                console.log(`   ⚠️  "${id}" exists but execution failed:`, error.message);
            }
        }
    }
}

async function listAllFunctions() {
    console.log('\n\n📋 Attempting to list all functions in your project...\n');
    
    try {
        // Note: This requires API key with proper permissions
        console.log('⚠️  Cannot list functions without API key');
        console.log('Please check Appwrite Console manually:');
        console.log('https://cloud.appwrite.io/console/project-68f23b11000d25eb3664/functions');
    } catch (error) {
        console.log('Error listing functions:', error.message);
    }
}

async function runAllTests() {
    await testFunction();
    await testAlternativeIds();
    await listAllFunctions();
    
    console.log('\n\n' + '='.repeat(70));
    console.log('SUMMARY');
    console.log('='.repeat(70));
    console.log('\n📊 Next Steps:');
    console.log('1. Go to Appwrite Console Functions page');
    console.log('2. Copy the EXACT Function ID for the chat message function');
    console.log('3. Compare it with "sendChatMessage" in the code');
    console.log('4. If different, update lib/services/serverEnforcedChatService.ts');
    console.log('5. If function doesn\'t exist, deploy it using the deployment guide');
    console.log('\n🔗 Appwrite Console:');
    console.log('https://cloud.appwrite.io/console/project-68f23b11000d25eb3664/functions\n');
}

runAllTests();
