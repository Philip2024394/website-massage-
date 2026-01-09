/**
 * ============================================================================
 * 🚩 CHAT FLAGS COLLECTION SETUP SCRIPT
 * ============================================================================
 * 
 * Run this script to create the chat_flags collection in Appwrite.
 * This only needs to be run once during setup.
 * 
 * Usage:
 * node setup-chat-flags-collection.mjs
 */

import { Client, Databases, Permission, Role, ID } from 'appwrite';

// ============================================================================
// CONFIGURATION
// ============================================================================

const APPWRITE_ENDPOINT = 'https://syd.cloud.appwrite.io/v1';
const APPWRITE_PROJECT_ID = '68f23b11000d25eb3664';
const APPWRITE_DATABASE_ID = '68f76ee1000e64ca8d05';
const APPWRITE_API_KEY = 'your-admin-api-key-here'; // Replace with your admin API key

const COLLECTION_ID = 'chat_flags';
const COLLECTION_NAME = 'Chat Flags';

// ============================================================================
// SETUP FUNCTION
// ============================================================================

async function setupChatFlagsCollection() {
  console.log('🚩 Setting up Chat Flags collection...');
  
  try {
    // Initialize Appwrite client with admin API key
    const client = new Client()
      .setEndpoint(APPWRITE_ENDPOINT)
      .setProject(APPWRITE_PROJECT_ID)
      .setKey(APPWRITE_API_KEY);
    
    const databases = new Databases(client);
    
    // Create the collection with permissions
    const collection = await databases.createCollection(
      APPWRITE_DATABASE_ID,
      COLLECTION_ID,
      COLLECTION_NAME,
      [
        Permission.read(Role.team('admin')),        // Only admins can read
        Permission.create(Role.users()),            // Any authenticated user can create
        Permission.update(Role.team('admin')),      // Only admins can update
        Permission.delete(Role.team('admin'))       // Only admins can delete
      ],
      true // Enable document security
    );

    console.log('✅ Collection created:', collection.name);
    
    // Create attributes
    console.log('📝 Creating attributes...');
    
    // chatRoomId (string, required)
    await databases.createStringAttribute(
      APPWRITE_DATABASE_ID,
      COLLECTION_ID,
      'chatRoomId',
      255,
      true // required
    );
    
    // reporterId (string, required)
    await databases.createStringAttribute(
      APPWRITE_DATABASE_ID,
      COLLECTION_ID,
      'reporterId',
      255,
      true // required
    );
    
    // reporterRole (enum, required)
    await databases.createEnumAttribute(
      APPWRITE_DATABASE_ID,
      COLLECTION_ID,
      'reporterRole',
      ['user', 'therapist'],
      true, // required
      'user' // default
    );
    
    // reportedUserId (string, required)
    await databases.createStringAttribute(
      APPWRITE_DATABASE_ID,
      COLLECTION_ID,
      'reportedUserId',
      255,
      true // required
    );
    
    // reason (enum, required)
    await databases.createEnumAttribute(
      APPWRITE_DATABASE_ID,
      COLLECTION_ID,
      'reason',
      [
        'inappropriate_behavior',
        'harassment_abuse',
        'payment_issue',
        'scam_fraud',
        'therapist_no_show',
        'other'
      ],
      true // required
    );
    
    // message (string, optional)
    await databases.createStringAttribute(
      APPWRITE_DATABASE_ID,
      COLLECTION_ID,
      'message',
      500,
      false // not required
    );
    
    // status (enum, required)
    await databases.createEnumAttribute(
      APPWRITE_DATABASE_ID,
      COLLECTION_ID,
      'status',
      ['open', 'reviewed', 'resolved'],
      true, // required
      'open' // default
    );
    
    // ipHash (string, optional)
    await databases.createStringAttribute(
      APPWRITE_DATABASE_ID,
      COLLECTION_ID,
      'ipHash',
      64,
      false // not required
    );
    
    // adminNotes (string, optional)
    await databases.createStringAttribute(
      APPWRITE_DATABASE_ID,
      COLLECTION_ID,
      'adminNotes',
      1000,
      false // not required
    );
    
    console.log('✅ All attributes created');
    
    // Wait a bit for attributes to be ready
    console.log('⏳ Waiting for attributes to be available...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Create indexes
    console.log('📊 Creating indexes...');
    
    // Unique index: chatRoomId + reporterId (prevent duplicate reports)
    await databases.createIndex(
      APPWRITE_DATABASE_ID,
      COLLECTION_ID,
      'chatRoomId_reporterId_unique',
      'unique',
      ['chatRoomId', 'reporterId']
    );
    
    // Index: status + createdAt (for admin filtering)
    await databases.createIndex(
      APPWRITE_DATABASE_ID,
      COLLECTION_ID,
      'status_createdAt',
      'key',
      ['status', '$createdAt'],
      ['ASC', 'DESC']
    );
    
    // Index: reporterId + createdAt (for rate limiting)
    await databases.createIndex(
      APPWRITE_DATABASE_ID,
      COLLECTION_ID,
      'reporterId_createdAt',
      'key',
      ['reporterId', '$createdAt'],
      ['ASC', 'DESC']
    );
    
    console.log('✅ All indexes created');
    console.log('🎉 Chat Flags collection setup complete!');
    
  } catch (error) {
    console.error('❌ Setup failed:', error);
    
    // More specific error handling
    if (error.code === 409) {
      console.log('💡 Collection may already exist. This is normal if running setup again.');
    }
  }
}

// ============================================================================
// RUN SETUP
// ============================================================================

if (import.meta.url === `file://${process.argv[1]}`) {
  setupChatFlagsCollection();
}