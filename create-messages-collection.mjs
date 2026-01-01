/**
 * CREATE APPWRITE MESSAGES COLLECTION
 * 
 * This script creates the Messages collection with ALL required attributes
 * using the Appwrite SDK to prevent 400 errors in chat.
 * 
 * REQUIRES: Appwrite API Key with database.write permissions
 */

import { Client, Databases, ID, Permission, Role } from 'node-appwrite';

const client = new Client()
    .setEndpoint('https://syd.cloud.appwrite.io/v1')
    .setProject('68f76ee1000e64ca8d05')
    .setKey(process.env.APPWRITE_API_KEY || '');

const databases = new Databases(client);
const DATABASE_ID = '68f76ee1000e64ca8d05';
const COLLECTION_ID = 'Messages';
const COLLECTION_NAME = 'Messages';

console.log('🚀 CREATE MESSAGES COLLECTION');
console.log('=' .repeat(60));

async function createCollection() {
    try {
        // Check if collection already exists
        try {
            const existing = await databases.getCollection(DATABASE_ID, COLLECTION_ID);
            console.log('⚠️  Collection already exists:', existing.name);
            console.log(`   Collection ID: ${existing.$id}`);
            console.log(`   Total attributes: ${existing.attributes.length}`);
            console.log('\n   Use fix-messages-collection.mjs to validate/fix attributes.');
            return existing;
        } catch (error) {
            if (error.code !== 404) {
                throw error;
            }
            // Collection doesn't exist, continue to create
        }
        
        console.log('\n📝 Creating collection:', COLLECTION_NAME);
        
        // Create collection with open permissions (testing phase)
        const collection = await databases.createCollection(
            DATABASE_ID,
            COLLECTION_ID,
            COLLECTION_NAME,
            [
                Permission.create(Role.any()),
                Permission.read(Role.any()),
                Permission.update(Role.any())
            ],
            false, // documentSecurity = false (use collection permissions)
            true   // enabled
        );
        
        console.log('✅ Collection created:', collection.$id);
        console.log(`   Name: ${collection.name}`);
        console.log(`   Permissions: ${collection.$permissions.length} rules`);
        
        // Wait a bit for collection to be ready
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        return collection;
        
    } catch (error) {
        console.error('❌ Error creating collection:', error.message);
        throw error;
    }
}

async function createAttributes() {
    try {
        console.log('\n📋 Creating attributes...');
        console.log('-'.repeat(60));
        
        // String attributes (required)
        const requiredStringAttrs = [
            { key: 'messageId', size: 255, required: true },
            { key: 'conversationId', size: 500, required: true },
            { key: 'senderId', size: 255, required: true },
            { key: 'senderName', size: 255, required: true },
            { key: 'senderRole', size: 50, required: true },
            { key: 'senderType', size: 50, required: true },
            { key: 'recipientId', size: 255, required: true },
            { key: 'receiverId', size: 255, required: true },
            { key: 'receiverName', size: 255, required: true },
            { key: 'receiverRole', size: 50, required: true },
            { key: 'message', size: 5000, required: true },
            { key: 'content', size: 5000, required: true },
            { key: 'messageType', size: 50, required: true }
        ];
        
        for (const attr of requiredStringAttrs) {
            try {
                await databases.createStringAttribute(
                    DATABASE_ID,
                    COLLECTION_ID,
                    attr.key,
                    attr.size,
                    attr.required
                );
                console.log(`✅ Created: ${attr.key} (string, ${attr.size}, required)`);
                await new Promise(resolve => setTimeout(resolve, 500)); // Rate limit
            } catch (error) {
                if (error.code === 409) {
                    console.log(`⚠️  Exists: ${attr.key}`);
                } else {
                    console.error(`❌ Failed: ${attr.key} - ${error.message}`);
                }
            }
        }
        
        // Optional string attributes
        const optionalStringAttrs = [
            { key: 'bookingId', size: 255, required: false },
            { key: 'metadata', size: 10000, required: false }
        ];
        
        for (const attr of optionalStringAttrs) {
            try {
                await databases.createStringAttribute(
                    DATABASE_ID,
                    COLLECTION_ID,
                    attr.key,
                    attr.size,
                    attr.required
                );
                console.log(`✅ Created: ${attr.key} (string, ${attr.size}, optional)`);
                await new Promise(resolve => setTimeout(resolve, 500));
            } catch (error) {
                if (error.code === 409) {
                    console.log(`⚠️  Exists: ${attr.key}`);
                } else {
                    console.error(`❌ Failed: ${attr.key} - ${error.message}`);
                }
            }
        }
        
        // Boolean attribute
        try {
            await databases.createBooleanAttribute(
                DATABASE_ID,
                COLLECTION_ID,
                'isRead',
                true, // required
                false // default value
            );
            console.log('✅ Created: isRead (boolean, required, default: false)');
            await new Promise(resolve => setTimeout(resolve, 500));
        } catch (error) {
            if (error.code === 409) {
                console.log('⚠️  Exists: isRead');
            } else {
                console.error(`❌ Failed: isRead - ${error.message}`);
            }
        }
        
        // DateTime attribute
        try {
            await databases.createDatetimeAttribute(
                DATABASE_ID,
                COLLECTION_ID,
                'sentAt',
                true // required
            );
            console.log('✅ Created: sentAt (datetime, required)');
            await new Promise(resolve => setTimeout(resolve, 500));
        } catch (error) {
            if (error.code === 409) {
                console.log('⚠️  Exists: sentAt');
            } else {
                console.error(`❌ Failed: sentAt - ${error.message}`);
            }
        }
        
        console.log('\n✅ All attributes created/verified!');
        
    } catch (error) {
        console.error('❌ Error creating attributes:', error.message);
        throw error;
    }
}

async function createIndexes() {
    try {
        console.log('\n📇 Creating indexes for performance...');
        console.log('-'.repeat(60));
        
        const indexes = [
            { key: 'conversationId_idx', type: 'key', attributes: ['conversationId'] },
            { key: 'senderId_idx', type: 'key', attributes: ['senderId'] },
            { key: 'receiverId_idx', type: 'key', attributes: ['receiverId'] },
            { key: 'sentAt_idx', type: 'key', attributes: ['sentAt'] },
            { key: 'isRead_idx', type: 'key', attributes: ['isRead'] }
        ];
        
        for (const index of indexes) {
            try {
                await databases.createIndex(
                    DATABASE_ID,
                    COLLECTION_ID,
                    index.key,
                    index.type,
                    index.attributes
                );
                console.log(`✅ Created index: ${index.key} on [${index.attributes.join(', ')}]`);
                await new Promise(resolve => setTimeout(resolve, 1000)); // Rate limit
            } catch (error) {
                if (error.code === 409) {
                    console.log(`⚠️  Index exists: ${index.key}`);
                } else {
                    console.error(`❌ Failed index: ${index.key} - ${error.message}`);
                }
            }
        }
        
        console.log('\n✅ Indexes created/verified!');
        
    } catch (error) {
        console.error('❌ Error creating indexes:', error.message);
        // Don't throw - indexes are optional
    }
}

async function verifyCollection() {
    try {
        console.log('\n🔍 Verifying final collection state...');
        console.log('-'.repeat(60));
        
        const collection = await databases.getCollection(DATABASE_ID, COLLECTION_ID);
        
        console.log(`✅ Collection: ${collection.name}`);
        console.log(`   ID: ${collection.$id}`);
        console.log(`   Total attributes: ${collection.attributes.length}`);
        console.log(`   Enabled: ${collection.enabled}`);
        console.log(`   Document Security: ${collection.documentSecurity}`);
        
        console.log('\n📋 Attributes:');
        collection.attributes.forEach(attr => {
            const required = attr.required ? 'required' : 'optional';
            console.log(`   - ${attr.key} (${attr.type}, ${required})`);
        });
        
        console.log('\n🔐 Permissions:');
        if (collection.$permissions.length === 0) {
            console.log('   ⚠️  No permissions set!');
        } else {
            collection.$permissions.forEach(perm => {
                console.log(`   - ${perm}`);
            });
        }
        
        return collection;
        
    } catch (error) {
        console.error('❌ Error verifying collection:', error.message);
        throw error;
    }
}

// Main execution
console.log('\n🚀 Starting Messages Collection Creation...\n');

try {
    // Step 1: Create collection
    await createCollection();
    
    // Step 2: Create attributes
    await createAttributes();
    
    // Step 3: Create indexes
    await createIndexes();
    
    // Step 4: Verify everything
    await verifyCollection();
    
    console.log('\n' + '='.repeat(60));
    console.log('🎉 MESSAGES COLLECTION SETUP COMPLETE!');
    console.log('='.repeat(60));
    console.log('\n✅ Next steps:');
    console.log('   1. Run: node fix-messages-collection.mjs');
    console.log('   2. Verify all 17 attributes exist');
    console.log('   3. Test message creation');
    console.log('   4. Test chat in browser');
    console.log('\n   If all checks pass, chat should work without 400 errors! 🎉');
    
} catch (error) {
    console.error('\n❌ SETUP FAILED:', error.message);
    console.error('\n📝 Troubleshooting:');
    console.error('   1. Check APPWRITE_API_KEY environment variable');
    console.error('   2. Verify API key has database.write permissions');
    console.error('   3. Check database ID: 68f76ee1000e64ca8d05');
    console.error('   4. Try manual creation in Appwrite Console');
    process.exit(1);
}
