/**
 * Test Appwrite Chat Connection
 * Run this to verify your chat collections are properly set up
 */

import { Client, Databases, ID } from 'appwrite';
import { APPWRITE_CONFIG } from './lib/appwrite.config.js';

const client = new Client()
    .setEndpoint(APPWRITE_CONFIG.endpoint)
    .setProject(APPWRITE_CONFIG.projectId);

const databases = new Databases(client);

async function testChatConnection() {
    console.log('🧪 Testing Appwrite Chat Connection...\n');
    
    console.log('📋 Configuration:');
    console.log(`   Endpoint: ${APPWRITE_CONFIG.endpoint}`);
    console.log(`   Project: ${APPWRITE_CONFIG.projectId}`);
    console.log(`   Database: ${APPWRITE_CONFIG.databaseId}`);
    console.log(`   Chat Rooms Collection: ${APPWRITE_CONFIG.collections.chatRooms}`);
    console.log(`   Chat Messages Collection: ${APPWRITE_CONFIG.collections.chatMessages}\n`);

    try {
        // Test 1: Create a test chat room
        console.log('📝 Test 1: Creating test chat room...');
        const testRoom = await databases.createDocument(
            APPWRITE_CONFIG.databaseId,
            APPWRITE_CONFIG.collections.chatRooms,
            ID.unique(),
            {
                bookingId: 999999,
                customerId: 'test-customer-123',
                customerName: 'Test Customer',
                customerLanguage: 'en',
                customerPhoto: '',
                therapistId: 1,
                therapistName: 'Test Therapist',
                therapistLanguage: 'id',
                therapistType: 'therapist',
                therapistPhoto: '',
                status: 'pending',
                expiresAt: new Date(Date.now() + 25 * 60 * 1000).toISOString(),
                unreadCount: 0,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            }
        );
        console.log(`✅ Chat room created with ID: ${testRoom.$id}\n`);

        // Test 2: Create a test message
        console.log('📝 Test 2: Creating test message...');
        const testMessage = await databases.createDocument(
            APPWRITE_CONFIG.databaseId,
            APPWRITE_CONFIG.collections.chatMessages,
            ID.unique(),
            {
                roomId: testRoom.$id,
                senderId: 'test-customer-123',
                senderType: 'customer',
                senderName: 'Test Customer',
                originalText: 'Hello, this is a test message!',
                originalLanguage: 'en',
                translatedText: 'Halo, ini adalah pesan percobaan!',
                translatedLanguage: 'id',
                isRead: false,
                createdAt: new Date().toISOString()
            }
        );
        console.log(`✅ Message created with ID: ${testMessage.$id}\n`);

        // Test 3: Read the message back
        console.log('📝 Test 3: Reading message back...');
        const readMessage = await databases.getDocument(
            APPWRITE_CONFIG.databaseId,
            APPWRITE_CONFIG.collections.chatMessages,
            testMessage.$id
        );
        console.log(`✅ Message retrieved successfully!`);
        console.log(`   Original: ${(readMessage as any).originalText}`);
        console.log(`   Translated: ${(readMessage as any).translatedText}\n`);

        // Cleanup
        console.log('🧹 Cleaning up test data...');
        await databases.deleteDocument(
            APPWRITE_CONFIG.databaseId,
            APPWRITE_CONFIG.collections.chatMessages,
            testMessage.$id
        );
        await databases.deleteDocument(
            APPWRITE_CONFIG.databaseId,
            APPWRITE_CONFIG.collections.chatRooms,
            testRoom.$id
        );
        console.log('✅ Test data cleaned up\n');

        console.log('🎉 ALL TESTS PASSED!');
        console.log('✅ Your Appwrite chat system is properly configured!');
        console.log('✅ You can now use the chat feature in your app!');

    } catch (error: any) {
        console.error('❌ TEST FAILED:', error.message);
        console.error('\n📋 Error Details:', error);
        
        if (error.code === 404) {
            console.error('\n⚠️  Collection not found! Make sure:');
            console.error('   1. Collection ID matches exactly (case-sensitive)');
            console.error('   2. Collection exists in your Appwrite database');
            console.error('   3. Database ID is correct');
        } else if (error.code === 400) {
            console.error('\n⚠️  Bad request! Check:');
            console.error('   1. All required attributes exist in the collection');
            console.error('   2. Attribute types match (string, integer, datetime, etc.)');
            console.error('   3. Enum values are set correctly');
        }
    }
}

// Run the test
testChatConnection();
