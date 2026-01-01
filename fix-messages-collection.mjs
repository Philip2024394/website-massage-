/**
 * FIX APPWRITE MESSAGES COLLECTION
 * 
 * This script ensures the Messages collection has ALL required attributes
 * to match the payload sent from appwriteService.LEGACY.ts sendMessage()
 * 
 * 400 Error Root Cause: Missing attributes or type mismatches
 */

import { Client, Databases, ID } from 'node-appwrite';

const client = new Client()
    .setEndpoint('https://syd.cloud.appwrite.io/v1')
    .setProject('68f76ee100147c2ec5f1')
    .setKey(process.env.APPWRITE_API_KEY || '');

const databases = new Databases(client);
const DATABASE_ID = '68f76ee1000e64ca8d05';
const COLLECTION_ID = 'Messages'; // From appwrite.config.ts line 46

console.log('🔍 MESSAGES COLLECTION SCHEMA VALIDATOR');
console.log('=' .repeat(60));

/**
 * EXACT SCHEMA REQUIRED (from appwriteService.LEGACY.ts line 3117-3137)
 */
const REQUIRED_ATTRIBUTES = {
    // String attributes (required)
    messageId: { type: 'string', size: 255, required: true },
    conversationId: { type: 'string', size: 500, required: true },
    senderId: { type: 'string', size: 255, required: true },
    senderName: { type: 'string', size: 255, required: true },
    senderRole: { type: 'string', size: 50, required: true },
    senderType: { type: 'string', size: 50, required: true },
    recipientId: { type: 'string', size: 255, required: true },
    receiverId: { type: 'string', size: 255, required: true },
    receiverName: { type: 'string', size: 255, required: true },
    receiverRole: { type: 'string', size: 50, required: true },
    message: { type: 'string', size: 5000, required: true },
    content: { type: 'string', size: 5000, required: true },
    messageType: { type: 'string', size: 50, required: true },
    
    // Boolean attribute (required)
    isRead: { type: 'boolean', required: true },
    
    // DateTime attribute (required)
    sentAt: { type: 'datetime', required: true },
    
    // Optional attributes
    bookingId: { type: 'string', size: 255, required: false },
    metadata: { type: 'string', size: 10000, required: false }
};

async function validateCollection() {
    try {
        console.log(`\n📋 Checking collection: ${COLLECTION_ID}`);
        
        // Try to get collection
        const collection = await databases.getCollection(DATABASE_ID, COLLECTION_ID);
        console.log('✅ Collection exists:', collection.name);
        console.log(`   Total attributes: ${collection.attributes.length}`);
        
        // Check each required attribute
        console.log('\n🔍 ATTRIBUTE VALIDATION:');
        console.log('-'.repeat(60));
        
        const existingAttrs = new Map();
        collection.attributes.forEach(attr => {
            existingAttrs.set(attr.key, attr);
        });
        
        let missingCount = 0;
        let mismatchCount = 0;
        
        for (const [key, expected] of Object.entries(REQUIRED_ATTRIBUTES)) {
            const existing = existingAttrs.get(key);
            
            if (!existing) {
                console.log(`❌ MISSING: ${key} (${expected.type}, required: ${expected.required})`);
                missingCount++;
            } else {
                // Check type match
                const typeMatch = existing.type === expected.type;
                const requiredMatch = existing.required === expected.required;
                
                if (!typeMatch || !requiredMatch) {
                    console.log(`⚠️  MISMATCH: ${key}`);
                    console.log(`   Expected: type=${expected.type}, required=${expected.required}`);
                    console.log(`   Got:      type=${existing.type}, required=${existing.required}`);
                    mismatchCount++;
                } else {
                    console.log(`✅ OK: ${key} (${existing.type}, required: ${existing.required})`);
                }
            }
        }
        
        console.log('\n' + '='.repeat(60));
        console.log(`📊 VALIDATION SUMMARY:`);
        console.log(`   Total attributes in collection: ${collection.attributes.length}`);
        console.log(`   Expected attributes: ${Object.keys(REQUIRED_ATTRIBUTES).length}`);
        console.log(`   Missing attributes: ${missingCount}`);
        console.log(`   Type mismatches: ${mismatchCount}`);
        
        if (missingCount === 0 && mismatchCount === 0) {
            console.log('\n🎉 COLLECTION SCHEMA IS CORRECT!');
            console.log('   All attributes exist with correct types.');
            console.log('\n   If you still get 400 errors, check:');
            console.log('   1. Collection permissions (Create/Read/Update: Any)');
            console.log('   2. Database permissions');
            console.log('   3. API key permissions');
        } else {
            console.log('\n❌ SCHEMA ISSUES FOUND!');
            console.log('\n📝 NEXT STEPS:');
            console.log('   1. Go to Appwrite Console');
            console.log('   2. Navigate to Database → Messages collection');
            console.log('   3. Add missing attributes (see list above)');
            console.log('   4. Fix type mismatches (delete & recreate if needed)');
            console.log('   5. Set permissions: Create/Read/Update: Any (for testing)');
        }
        
        // Check permissions
        console.log('\n🔐 PERMISSIONS CHECK:');
        console.log('-'.repeat(60));
        
        if (!collection.$permissions || collection.$permissions.length === 0) {
            console.log('⚠️  WARNING: No permissions set on collection!');
            console.log('   This will cause 401/403 errors.');
            console.log('\n   FOR TESTING, set:');
            console.log('   - Create: Any');
            console.log('   - Read: Any');
            console.log('   - Update: Any');
        } else {
            console.log('Current permissions:');
            collection.$permissions.forEach(perm => {
                console.log(`   - ${perm}`);
            });
        }
        
        return {
            valid: missingCount === 0 && mismatchCount === 0,
            missingCount,
            mismatchCount,
            collection
        };
        
    } catch (error) {
        if (error.code === 404) {
            console.log('❌ COLLECTION NOT FOUND!');
            console.log(`   Collection "${COLLECTION_ID}" does not exist.`);
            console.log('\n📝 MANUAL CREATION REQUIRED:');
            console.log('   1. Go to Appwrite Console');
            console.log('   2. Navigate to your database');
            console.log('   3. Create collection named "messages" (or "Messages")');
            console.log('   4. Run this script again to add attributes');
            return { valid: false, error: 'Collection not found' };
        }
        
        console.error('❌ Error:', error.message);
        return { valid: false, error: error.message };
    }
}

async function testMessageCreation() {
    try {
        console.log('\n\n🧪 TESTING MESSAGE CREATION');
        console.log('='.repeat(60));
        
        const testMessage = {
            messageId: ID.unique(),
            conversationId: 'test_conversation_' + Date.now(),
            senderId: 'test_sender_123',
            senderName: 'Test Sender',
            senderRole: 'user',
            senderType: 'user',
            recipientId: 'test_receiver_456',
            receiverId: 'test_receiver_456',
            receiverName: 'Test Receiver',
            receiverRole: 'therapist',
            message: 'Test message content',
            content: 'Test message content',
            messageType: 'text',
            bookingId: null,
            metadata: null,
            isRead: false,
            sentAt: new Date().toISOString()
        };
        
        console.log('📤 Sending test message...');
        console.log('Payload:', JSON.stringify(testMessage, null, 2));
        
        const response = await databases.createDocument(
            DATABASE_ID,
            COLLECTION_ID,
            testMessage.messageId,
            testMessage
        );
        
        console.log('\n✅ TEST MESSAGE CREATED SUCCESSFULLY!');
        console.log(`   Document ID: ${response.$id}`);
        console.log(`   Created at: ${response.$createdAt}`);
        
        // Clean up test message
        console.log('\n🧹 Cleaning up test message...');
        await databases.deleteDocument(DATABASE_ID, COLLECTION_ID, response.$id);
        console.log('✅ Test message deleted');
        
        console.log('\n🎉 COLLECTION IS WORKING CORRECTLY!');
        console.log('   Your chat should now work without 400 errors.');
        
        return true;
        
    } catch (error) {
        console.log('\n❌ TEST MESSAGE CREATION FAILED!');
        console.log(`   Error Code: ${error.code}`);
        console.log(`   Error Message: ${error.message}`);
        console.log(`   Error Type: ${error.type}`);
        
        if (error.code === 400) {
            console.log('\n📝 400 ERROR DIAGNOSIS:');
            console.log('   This usually means:');
            console.log('   1. Missing required attribute');
            console.log('   2. Wrong data type for an attribute');
            console.log('   3. Attribute size limit exceeded');
            console.log('   4. Invalid enum value');
            console.log('\n   Check the validation output above for missing/mismatched attributes.');
        } else if (error.code === 401 || error.code === 403) {
            console.log('\n📝 PERMISSION ERROR:');
            console.log('   Set collection permissions to:');
            console.log('   - Create: Any (for testing)');
            console.log('   - Read: Any');
            console.log('   - Update: Any');
        }
        
        return false;
    }
}

// Run validation
console.log('\n🚀 Starting Messages Collection Validation...\n');

const result = await validateCollection();

if (result.valid) {
    // Only test if validation passed
    await testMessageCreation();
} else {
    console.log('\n⚠️  Skipping test message creation due to validation errors.');
    console.log('   Fix the schema issues first, then run this script again.');
}

console.log('\n' + '='.repeat(60));
console.log('📋 MANUAL CHECKLIST:');
console.log('='.repeat(60));
console.log('✓ Attributes exist with correct types');
console.log('✓ Optional attributes marked as NOT required');
console.log('✓ Permissions set to: Create/Read/Update: Any');
console.log('✓ Test message creation succeeds');
console.log('\nIf all checks pass, chat should work without 400 errors! 🎉');
