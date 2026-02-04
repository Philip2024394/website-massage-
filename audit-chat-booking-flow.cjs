const { Client, Databases, Query } = require('node-appwrite');

const client = new Client()
  .setEndpoint('https://syd.cloud.appwrite.io/v1')
  .setProject('68f23b11000d25eb3664')
  .setKey('standard_9c46e3b29b7f6b4043ff33b98b5e9c0c86f7c73a9b8d0b9e7b9c8d89b4e1d4e0e8c3f4a3d9c5b2f6e8a1c7b9d4e2f5a8b3c6d9e2f4a7b0c5d8e1f3a6b9c2d5e7f0a3b6c9d2e4f7a0b3c5d8e1f4a6b9c2e5f7a0b3d6e9f2a5c7b0d3e6f8a1c4b7d0e3f5a8b1c4d6e9f2a4b7c0d3e5f8a1b4c6d9e2f4a7b0c3d5e8f1a3b6c9d2e4f6a9b2c5d7e0f3a5b8c1d4e6f9a2b4c7d0e2f5a7b0c3d5e8');

const databases = new Databases(client);

async function auditBookingChatWindow() {
  console.log('🔍 BOOKING CHAT WINDOW FLOW AUDIT');
  console.log('=' .repeat(60));
  
  const issues = [];
  const successes = [];
  
  // 1. Check if message collection exists (required for chat)
  console.log('\n1️⃣ CHECKING MESSAGE COLLECTION...');
  try {
    const messageCollection = await databases.getCollection('68f76ee1000e64ca8d05', 'messages');
    console.log('✅ Messages collection exists:', messageCollection.name);
    successes.push('Messages collection accessible');
  } catch (error) {
    if (error.code === 404) {
      console.log('❌ Messages collection NOT FOUND - critical for chat');
      issues.push('CRITICAL: Messages collection missing - chat cannot function');
    } else if (error.code === 401) {
      console.log('🔐 Messages collection exists but requires authentication');
      successes.push('Messages collection exists (auth required)');
    } else {
      console.log('⚠️ Error checking messages collection:', error.message);
      issues.push(`Messages collection check failed: ${error.message}`);
    }
  }
  
  // 2. Check if chat rooms collection exists
  console.log('\n2️⃣ CHECKING CHAT ROOMS COLLECTION...');
  try {
    const chatRoomsCollection = await databases.getCollection('68f76ee1000e64ca8d05', 'chat_rooms');
    console.log('✅ Chat rooms collection exists:', chatRoomsCollection.name);
    successes.push('Chat rooms collection accessible');
  } catch (error) {
    if (error.code === 404) {
      console.log('❌ Chat rooms collection NOT FOUND');
      issues.push('CRITICAL: Chat rooms collection missing');
    } else if (error.code === 401) {
      console.log('🔐 Chat rooms collection exists but requires authentication');
      successes.push('Chat rooms collection exists (auth required)');
    } else {
      console.log('⚠️ Error checking chat rooms collection:', error.message);
      issues.push(`Chat rooms collection check failed: ${error.message}`);
    }
  }
  
  // 3. Check bookings collection (updated collection ID)
  console.log('\n3️⃣ CHECKING BOOKINGS COLLECTION...');
  try {
    const bookingsCollection = await databases.getCollection('68f76ee1000e64ca8d05', 'bookings_collection_id');
    console.log('✅ Bookings collection exists:', bookingsCollection.name);
    successes.push('Bookings collection accessible');
  } catch (error) {
    if (error.code === 404) {
      console.log('❌ Bookings collection NOT FOUND');
      issues.push('CRITICAL: Bookings collection missing');
    } else if (error.code === 401) {
      console.log('🔐 Bookings collection exists but requires authentication');
      successes.push('Bookings collection exists (auth required)');
    } else {
      console.log('⚠️ Error checking bookings collection:', error.message);
      issues.push(`Bookings collection check failed: ${error.message}`);
    }
  }
  
  // 4. Check therapist collection (updated collection ID)
  console.log('\n4️⃣ CHECKING THERAPIST COLLECTION...');
  try {
    const therapistCollection = await databases.getCollection('68f76ee1000e64ca8d05', 'therapists_collection_id');
    console.log('✅ Therapist collection exists:', therapistCollection.name);
    successes.push('Therapist collection accessible');
  } catch (error) {
    if (error.code === 404) {
      console.log('❌ Therapist collection NOT FOUND');
      issues.push('CRITICAL: Therapist collection missing - chat cannot identify therapists');
    } else if (error.code === 401) {
      console.log('🔐 Therapist collection exists but requires authentication');
      successes.push('Therapist collection exists (auth required)');
    } else {
      console.log('⚠️ Error checking therapist collection:', error.message);
      issues.push(`Therapist collection check failed: ${error.message}`);
    }
  }
  
  // 5. List all collections to see what's actually available
  console.log('\n5️⃣ DISCOVERING ALL AVAILABLE COLLECTIONS...');
  try {
    const collections = await databases.listCollections('68f76ee1000e64ca8d05');
    console.log(`📋 Found ${collections.total} collections:`);
    
    const chatRelated = [];
    const bookingRelated = [];
    const messageRelated = [];
    
    collections.collections.forEach(col => {
      console.log(`   • ${col.$id} (${col.name})`);
      
      const id = col.$id.toLowerCase();
      const name = col.name.toLowerCase();
      
      if (id.includes('chat') || name.includes('chat')) {
        chatRelated.push(col);
      }
      if (id.includes('booking') || name.includes('booking')) {
        bookingRelated.push(col);
      }
      if (id.includes('message') || name.includes('message')) {
        messageRelated.push(col);
      }
    });
    
    console.log(`\n🔍 ANALYSIS:`);
    console.log(`   Chat-related collections: ${chatRelated.length}`);
    console.log(`   Booking-related collections: ${bookingRelated.length}`);
    console.log(`   Message-related collections: ${messageRelated.length}`);
    
    if (chatRelated.length === 0) {
      issues.push('No chat-related collections found');
    }
    if (messageRelated.length === 0) {
      issues.push('No message-related collections found');
    }
    
  } catch (error) {
    console.error('❌ Failed to list collections:', error.message);
    issues.push(`Cannot list collections: ${error.message}`);
  }
  
  // SUMMARY
  console.log('\n📋 AUDIT SUMMARY');
  console.log('=' .repeat(40));
  
  console.log(`\n✅ WORKING (${successes.length}):`);
  successes.forEach(success => console.log(`   • ${success}`));
  
  console.log(`\n❌ ISSUES FOUND (${issues.length}):`);
  issues.forEach(issue => console.log(`   • ${issue}`));
  
  if (issues.length === 0) {
    console.log('\n🎉 NO BACKEND ISSUES FOUND - Chat window should work');
    console.log('💡 If chat still fails, the issue is likely in frontend code');
  } else {
    console.log('\n⚠️ BACKEND ISSUES DETECTED - Chat window may fail');
    console.log('🔧 Fix these collection/database issues first');
  }
  
  console.log('\n🔍 NEXT STEPS:');
  console.log('   1. Fix any collection issues above');
  console.log('   2. Check frontend PersistentChatWindow.tsx console logs');
  console.log('   3. Test booking flow with browser dev tools open');
}

auditBookingChatWindow();