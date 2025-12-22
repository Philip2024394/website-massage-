/**
 * APPWRITE COLLECTION SETUP SCRIPT
 * Run this script to automatically create the flagged_messages collection
 * 
 * Usage:
 * 1. Update APPWRITE_API_KEY with your API key
 * 2. Run: node scripts/create-flagged-messages-collection.cjs
 */

const sdk = require('node-appwrite');

// Configuration
const APPWRITE_ENDPOINT = 'https://syd.cloud.appwrite.io/v1';
const APPWRITE_PROJECT_ID = '68f23b11000d25eb3664';
const APPWRITE_API_KEY = 'YOUR_API_KEY_HERE'; // Replace with your API key
const DATABASE_ID = '68f76ee1000e64ca8d05';
const COLLECTION_ID = '68f76ee1000e64ca8d06'; // Flagged messages collection

async function createFlaggedMessagesCollection() {
    const client = new sdk.Client();
    const databases = new sdk.Databases(client);

    client
        .setEndpoint(APPWRITE_ENDPOINT)
        .setProject(APPWRITE_PROJECT_ID)
        .setKey(APPWRITE_API_KEY);

    try {
        console.log('Creating flagged_messages collection...');

        // Create collection
        await databases.createCollection(
            DATABASE_ID,
            COLLECTION_ID,
            'flagged_messages',
            [
                sdk.Permission.read(sdk.Role.any()),
                sdk.Permission.create(sdk.Role.any()),
                sdk.Permission.update(sdk.Role.any()),
                sdk.Permission.delete(sdk.Role.any())
            ]
        );

        console.log('✅ Collection created successfully');

        // Create attributes
        console.log('Creating attributes...');

        await databases.createStringAttribute(DATABASE_ID, COLLECTION_ID, 'messageId', 255, true);
        await databases.createStringAttribute(DATABASE_ID, COLLECTION_ID, 'originalContent', 5000, true);
        await databases.createStringAttribute(DATABASE_ID, COLLECTION_ID, 'sanitizedContent', 5000, false);
        await databases.createStringAttribute(DATABASE_ID, COLLECTION_ID, 'senderId', 255, true);
        await databases.createStringAttribute(DATABASE_ID, COLLECTION_ID, 'receiverId', 255, true);
        await databases.createStringAttribute(DATABASE_ID, COLLECTION_ID, 'flaggedBy', 255, true);
        await databases.createStringAttribute(DATABASE_ID, COLLECTION_ID, 'flaggedAt', 255, true);
        await databases.createStringAttribute(DATABASE_ID, COLLECTION_ID, 'flagReason', 1000, true);
        await databases.createIntegerAttribute(DATABASE_ID, COLLECTION_ID, 'moderationScore', true, 0, 100, 0);
        await databases.createStringAttribute(DATABASE_ID, COLLECTION_ID, 'violations', 1000, false);
        await databases.createStringAttribute(DATABASE_ID, COLLECTION_ID, 'riskLevel', 50, true, 'low');
        await databases.createStringAttribute(DATABASE_ID, COLLECTION_ID, 'status', 50, true, 'pending');
        await databases.createStringAttribute(DATABASE_ID, COLLECTION_ID, 'reviewedBy', 255, false);
        await databases.createStringAttribute(DATABASE_ID, COLLECTION_ID, 'reviewedAt', 255, false);
        await databases.createStringAttribute(DATABASE_ID, COLLECTION_ID, 'reviewNotes', 2000, false);

        console.log('✅ Attributes created successfully');

        // Wait for attributes to be available (Appwrite processes them asynchronously)
        console.log('Waiting for attributes to be ready...');
        await new Promise(resolve => setTimeout(resolve, 5000));

        // Create indexes
        console.log('Creating indexes...');

        await databases.createIndex(
            DATABASE_ID,
            COLLECTION_ID,
            'status_idx',
            'key',
            ['status'],
            ['ASC']
        );

        await databases.createIndex(
            DATABASE_ID,
            COLLECTION_ID,
            'flaggedAt_idx',
            'key',
            ['flaggedAt'],
            ['DESC']
        );

        await databases.createIndex(
            DATABASE_ID,
            COLLECTION_ID,
            'senderId_idx',
            'key',
            ['senderId'],
            ['ASC']
        );

        await databases.createIndex(
            DATABASE_ID,
            COLLECTION_ID,
            'riskLevel_idx',
            'key',
            ['riskLevel'],
            ['ASC']
        );

        console.log('✅ Indexes created successfully');
        console.log('\n✅ Setup complete! Collection ready to use.');
        console.log(`Collection ID: ${COLLECTION_ID}`);

    } catch (error) {
        if (error.code === 409) {
            console.log('⚠️ Collection already exists');
        } else {
            console.error('❌ Error:', error.message);
        }
    }
}

// Run the script
createFlaggedMessagesCollection();
