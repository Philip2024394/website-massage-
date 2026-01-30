/**
 * 🔍 BOOKING SCHEMA VERIFICATION SCRIPT
 * 
 * Tests actual Appwrite database to determine:
 * 1. Correct collection ID for bookings
 * 2. Actual required attributes/fields
 * 3. Schema validation failures
 * 
 * Run this to verify booking system before implementing isolation.
 */

import { Client, Databases, ID, Query } from 'appwrite';

const client = new Client()
  .setEndpoint('https://syd.cloud.appwrite.io/v1')
  .setProject('68f23b11000d25eb3664');

const databases = new Databases(client);
const DATABASE_ID = '68f76ee1000e64ca8d05';

// Test collection IDs to verify which one exists
const COLLECTION_IDS_TO_TEST = [
  'bookings',
  'bookings_collection_id', 
  '68f76ee1000e64ca8d06',
  'Bookings'
];

/**
 * 1. Test which collection ID actually exists
 */
async function findWorkingCollectionId() {
  console.log('🔍 Testing collection IDs...\n');
  
  for (const collectionId of COLLECTION_IDS_TO_TEST) {
    try {
      const response = await databases.listDocuments(DATABASE_ID, collectionId, [Query.limit(1)]);
      console.log(`✅ WORKING: "${collectionId}" - Found ${response.total} documents`);
      return collectionId;
    } catch (error) {
      console.log(`❌ FAILED: "${collectionId}" - ${error.message}`);
    }
  }
  
  console.log('🚨 No working collection ID found!');
  return null;
}

/**
 * 2. Test booking creation with minimal data to identify required fields
 */
async function testBookingCreation(collectionId) {
  console.log('\n🧪 Testing booking creation...\n');
  
  // Test data with progressively more fields
  const testCases = [
    {
      name: 'Minimal Test',
      data: {
        userId: 'test-user-id',
        status: 'pending'
      }
    },
    {
      name: 'Basic Booking Test',
      data: {
        userId: 'test-user-id',
        status: 'pending_accept',  // ✅ VALID STATUS
        therapistId: 'test-therapist',
        serviceDuration: '60',  // ✅ REQUIRED FIELD
        location: 'Test Location',  // ✅ REQUIRED FIELD
        price: 100000,
        customerName: 'Test Customer',
        customerWhatsApp: '+6281234567890'
      }
    },
    {
      name: 'Complete Booking Test',
      data: {
        userId: 'test-user-id',
        status: 'pending_accept',  // ✅ VALID STATUS
        therapistId: 'test-therapist',
        serviceDuration: '60',  // ✅ REQUIRED FIELD (as string, not number)
        location: 'Test Location',  // ✅ REQUIRED FIELD
        duration: 60,  // Keep both for compatibility
        price: 100000,
        customerName: 'Test Customer',
        customerWhatsApp: '+6281234567890',
        locationType: 'hotel',
        address: 'Test Hotel',
        massageFor: 'myself',
        bookingId: `TEST-${Date.now()}`,
        serviceType: 'Traditional Massage'
        // ❌ Removed therapistName - not accepted
      }
    }
  ];

  for (const testCase of testCases) {
    try {
      console.log(`📝 Testing: ${testCase.name}`);
      
      const document = await databases.createDocument(
        DATABASE_ID,
        collectionId,
        ID.unique(),
        testCase.data
      );
      
      console.log(`✅ SUCCESS: Created document ${document.$id}`);
      console.log(`   Fields accepted:`, Object.keys(testCase.data).join(', '));
      
      // Clean up test document
      await databases.deleteDocument(DATABASE_ID, collectionId, document.$id);
      console.log(`🗑️  Cleaned up test document\n`);
      
      return { success: true, requiredFields: Object.keys(testCase.data) };
      
    } catch (error) {
      console.log(`❌ FAILED: ${error.message}`);
      if (error.message.includes('Missing required attribute')) {
        const missingField = error.message.match(/'([^']+)'/)?.[1];
        if (missingField) {
          console.log(`   Missing required field: ${missingField}`);
        }
      }
      console.log('');
    }
  }
  
  return { success: false };
}

/**
 * 3. Analyze existing bookings to understand schema
 */
async function analyzeExistingBookings(collectionId) {
  console.log('\n📊 Analyzing existing bookings...\n');
  
  try {
    const response = await databases.listDocuments(DATABASE_ID, collectionId, [
      Query.orderDesc('$createdAt'),
      Query.limit(5)
    ]);
    
    if (response.documents.length === 0) {
      console.log('ℹ️  No existing bookings found');
      return;
    }
    
    console.log(`Found ${response.total} total bookings, analyzing latest 5:`);
    
    // Collect all unique fields across bookings
    const allFields = new Set();
    response.documents.forEach(doc => {
      Object.keys(doc).forEach(key => allFields.add(key));
    });
    
    console.log('\n🔍 All fields found in existing bookings:');
    Array.from(allFields).sort().forEach(field => {
      console.log(`   - ${field}`);
    });
    
    // Show sample booking structure
    console.log('\n📋 Sample booking structure:');
    const sample = response.documents[0];
    Object.entries(sample).forEach(([key, value]) => {
      const type = typeof value;
      const preview = type === 'string' && value.length > 50 ? `${value.substring(0, 50)}...` : value;
      console.log(`   ${key}: ${type} = ${JSON.stringify(preview)}`);
    });
    
    return Array.from(allFields);
    
  } catch (error) {
    console.error(`❌ Failed to analyze bookings: ${error.message}`);
  }
}

/**
 * Main verification function
 */
async function verifyBookingSchema() {
  console.log('🚀 APPWRITE BOOKING SCHEMA VERIFICATION\n');
  console.log('Database:', DATABASE_ID);
  console.log('Endpoint:', 'https://syd.cloud.appwrite.io/v1');
  console.log('Project:', '68f23b11000d25eb3664');
  console.log('═══════════════════════════════════════════════\n');
  
  // Step 1: Find working collection ID
  const workingCollectionId = await findWorkingCollectionId();
  
  if (!workingCollectionId) {
    console.log('\n🚨 CRITICAL: No working booking collection found!');
    console.log('   Action needed: Create booking collection in Appwrite Console');
    return;
  }
  
  // Step 2: Analyze existing bookings
  const existingFields = await analyzeExistingBookings(workingCollectionId);
  
  // Step 3: Test booking creation
  const creationResult = await testBookingCreation(workingCollectionId);
  
  // Summary
  console.log('\n🎯 VERIFICATION SUMMARY');
  console.log('═══════════════════════════════════════════════');
  console.log(`✅ Working Collection ID: "${workingCollectionId}"`);
  
  if (creationResult.success) {
    console.log(`✅ Booking Creation: SUCCESS`);
    console.log(`   Required Fields: ${creationResult.requiredFields?.join(', ')}`);
  } else {
    console.log(`❌ Booking Creation: FAILED - Check required fields above`);
  }
  
  if (existingFields) {
    console.log(`✅ Existing Schema: ${existingFields.length} fields found`);
  }
  
  console.log('\n🔒 RECOMMENDATIONS:');
  console.log(`1. Use collection ID: "${workingCollectionId}"`);
  console.log(`2. Update APPWRITE_CONFIG.collections.bookings to: "${workingCollectionId}"`);
  
  if (creationResult.success) {
    console.log('3. ✅ Booking creation works - proceed with isolation implementation');
  } else {
    console.log('3. ❌ Fix required fields before implementing booking isolation');
  }
}

// Run verification
verifyBookingSchema().catch(console.error);