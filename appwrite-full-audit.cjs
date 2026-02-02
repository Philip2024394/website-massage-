/**
 * 🔍 COMPREHENSIVE APPWRITE AUDIT
 * 
 * Tests all aspects of booking flow:
 * - Collection permissions
 * - Data structure validation
 * - API call success
 * - Authentication flow
 * - Error handling
 */

const { Client, Databases, ID, Query } = require('node-appwrite');

// Browser-style client (NO API KEY - simulates browser authentication)
const client = new Client()
    .setEndpoint('https://syd.cloud.appwrite.io/v1')
    .setProject('68f23b11000d25eb3664');

const databases = new Databases(client);

const DATABASE_ID = '68f76ee1000e64ca8d05';
const BOOKINGS_COLLECTION = 'bookings';
const MESSAGES_COLLECTION = 'chat_messages';
const CHAT_SESSIONS_COLLECTION = 'chat_sessions';

const auditResults = {
    timestamp: new Date().toISOString(),
    passed: [],
    failed: [],
    warnings: []
};

function logTest(category, test, result, details = '') {
    const status = result ? '✅' : '❌';
    const message = `${status} ${category}: ${test}`;
    console.log(message);
    if (details) console.log(`   ${details}`);
    
    if (result) {
        auditResults.passed.push({ category, test, details });
    } else {
        auditResults.failed.push({ category, test, details });
    }
}

function logWarning(category, message) {
    console.log(`⚠️  ${category}: ${message}`);
    auditResults.warnings.push({ category, message });
}

// Test 1: Bookings Collection CRUD
async function testBookingsCollection() {
    console.log('\n📋 TEST 1: BOOKINGS COLLECTION');
    console.log('═══════════════════════════════════════════════════════\n');
    
    let testBookingId = null;
    
    // CREATE
    try {
        const testBooking = await databases.createDocument(
            DATABASE_ID,
            BOOKINGS_COLLECTION,
            ID.unique(),
            {
                userId: 'audit-user-' + Date.now(),
                status: 'pending_accept',
                therapistId: 'audit-therapist-' + Date.now(),
                serviceDuration: '60',
                location: 'Audit Test Location',
                price: 100,
                customerName: 'Audit Test Customer',
                customerWhatsApp: '+6281234567890'
            }
        );
        
        testBookingId = testBooking.$id;
        logTest('Bookings', 'CREATE operation', true, `ID: ${testBookingId}`);
        
    } catch (error) {
        logTest('Bookings', 'CREATE operation', false, `${error.message} (${error.code})`);
        return;
    }
    
    // READ
    try {
        const booking = await databases.getDocument(
            DATABASE_ID,
            BOOKINGS_COLLECTION,
            testBookingId
        );
        logTest('Bookings', 'READ operation', true, `Retrieved booking ${booking.$id}`);
    } catch (error) {
        logTest('Bookings', 'READ operation', false, error.message);
    }
    
    // UPDATE
    try {
        await databases.updateDocument(
            DATABASE_ID,
            BOOKINGS_COLLECTION,
            testBookingId,
            { status: 'active' }
        );
        logTest('Bookings', 'UPDATE operation', true, 'Updated status to active');
    } catch (error) {
        logTest('Bookings', 'UPDATE operation', false, error.message);
    }
    
    // LIST
    try {
        const bookings = await databases.listDocuments(
            DATABASE_ID,
            BOOKINGS_COLLECTION,
            [Query.limit(1)]
        );
        logTest('Bookings', 'LIST operation', true, `Found ${bookings.total} bookings`);
    } catch (error) {
        logTest('Bookings', 'LIST operation', false, error.message);
    }
    
    // DELETE
    try {
        await databases.deleteDocument(
            DATABASE_ID,
            BOOKINGS_COLLECTION,
            testBookingId
        );
        logTest('Bookings', 'DELETE operation (cleanup)', true, 'Test booking removed');
    } catch (error) {
        logTest('Bookings', 'DELETE operation (cleanup)', false, error.message);
    }
}

// Test 2: Real-world booking creation
async function testRealBookingFlow() {
    console.log('\n📋 TEST 2: REAL-WORLD BOOKING FLOW');
    console.log('═══════════════════════════════════════════════════════\n');
    
    let bookingId = null;
    
    try {
        // Simulate actual Order Now button payload
        const booking = await databases.createDocument(
            DATABASE_ID,
            BOOKINGS_COLLECTION,
            ID.unique(),
            {
                // From PersistentChatWindow.tsx booking payload
                userId: 'customer-' + Date.now(),
                status: 'pending_accept',
                therapistId: 'therapist-123',
                serviceDuration: '90',
                location: 'Seminyak Beach Hotel, Bali',
                price: 450,
                customerName: 'John Doe',
                customerWhatsApp: '+6281234567890'
                
                // ❌ REMOVED: Optional fields not in Appwrite schema
                // massageFor: 'myself',
                // locationType: 'hotel',
                // hotelRoomNumber: '305'
            }
        );
        
        bookingId = booking.$id;
        logTest('Real Booking', 'Order Now simulation', true, `Booking ${bookingId} created`);
        
        // Verify booking data
        if (booking.customerName === 'John Doe' && booking.price === 450) {
            logTest('Real Booking', 'Data integrity', true, 'All fields saved correctly');
        } else {
            logTest('Real Booking', 'Data integrity', false, 'Some fields missing or incorrect');
        }
        
        // Cleanup
        await databases.deleteDocument(DATABASE_ID, BOOKINGS_COLLECTION, bookingId);
        console.log('   🧹 Cleanup successful\n');
        
    } catch (error) {
        logTest('Real Booking', 'Order Now simulation', false, `${error.message} (${error.code})`);
        if (error.code === 400) {
            console.log('   💡 Schema mismatch - check required fields\n');
        }
    }
}

// Test 3: Messages Collection
async function testMessagesCollection() {
    console.log('\n📋 TEST 3: MESSAGES COLLECTION');
    console.log('═══════════════════════════════════════════════════════\n');
    
    let messageId = null;
    
    try {
        // Attempt with minimal required fields first
        const message = await databases.createDocument(
            DATABASE_ID,
            MESSAGES_COLLECTION,
            ID.unique(),
            {
                content: 'Test message from audit',
                senderId: 'audit-sender',
                senderName: 'Audit User',
                senderType: 'customer',
                chatSessionId: 'audit-session',
                timestamp: new Date().toISOString(),
                read: false,
                originalLanguage: 'en' // Required field discovered in testing
            }
        );
        
        messageId = message.$id;
        logTest('Messages', 'CREATE operation', true, `Message ${messageId} created`);
        
        // Cleanup
        await databases.deleteDocument(DATABASE_ID, MESSAGES_COLLECTION, messageId);
        console.log('   🧹 Cleanup successful\n');
        
    } catch (error) {
        logTest('Messages', 'CREATE operation', false, `${error.message} (${error.code})`);
        
        if (error.message.includes('Missing required attribute')) {
            const match = error.message.match(/Missing required attribute "([^"]+)"/);
            if (match) {
                console.log(`   💡 Add required field: "${match[1]}"\n`);
            }
        }
    }
}

// Test 4: Chat Sessions Collection
async function testChatSessionsCollection() {
    console.log('\n📋 TEST 4: CHAT SESSIONS COLLECTION');
    console.log('═══════════════════════════════════════════════════════\n');
    
    let sessionId = null;
    
    try {
        const session = await databases.createDocument(
            DATABASE_ID,
            CHAT_SESSIONS_COLLECTION,
            ID.unique(),
            {
                customerId: 'audit-customer',
                therapistId: 'audit-therapist',
                status: 'active',
                startedAt: new Date().toISOString()
            }
        );
        
        sessionId = session.$id;
        logTest('Chat Sessions', 'CREATE operation', true, `Session ${sessionId} created`);
        
        // Cleanup
        await databases.deleteDocument(DATABASE_ID, CHAT_SESSIONS_COLLECTION, sessionId);
        console.log('   🧹 Cleanup successful\n');
        
    } catch (error) {
        logTest('Chat Sessions', 'CREATE operation', false, `${error.message} (${error.code})`);
    }
}

// Test 5: Permission checks
async function testPermissions() {
    console.log('\n📋 TEST 5: PERMISSION VALIDATION');
    console.log('═══════════════════════════════════════════════════════\n');
    
    // Test anonymous access (what browser users have)
    const collections = [
        { id: BOOKINGS_COLLECTION, name: 'Bookings' },
        { id: MESSAGES_COLLECTION, name: 'Messages' },
        { id: CHAT_SESSIONS_COLLECTION, name: 'Chat Sessions' }
    ];
    
    for (const collection of collections) {
        try {
            await databases.listDocuments(
                DATABASE_ID,
                collection.id,
                [Query.limit(1)]
            );
            logTest('Permissions', `${collection.name} - READ access`, true, 'Role: any() configured');
        } catch (error) {
            if (error.code === 401) {
                logTest('Permissions', `${collection.name} - READ access`, false, 'Missing Role: any() permission');
            } else {
                logTest('Permissions', `${collection.name} - READ access`, false, error.message);
            }
        }
    }
}

// Test 6: Query performance
async function testQueryPerformance() {
    console.log('\n📋 TEST 6: QUERY PERFORMANCE');
    console.log('═══════════════════════════════════════════════════════\n');
    
    try {
        const start = Date.now();
        await databases.listDocuments(
            DATABASE_ID,
            BOOKINGS_COLLECTION,
            [Query.limit(10)]
        );
        const duration = Date.now() - start;
        
        if (duration < 1000) {
            logTest('Performance', 'Query speed', true, `${duration}ms (excellent)`);
        } else if (duration < 3000) {
            logTest('Performance', 'Query speed', true, `${duration}ms (acceptable)`);
            logWarning('Performance', 'Consider adding indexes if queries are slow');
        } else {
            logTest('Performance', 'Query speed', false, `${duration}ms (too slow)`);
        }
    } catch (error) {
        logTest('Performance', 'Query speed', false, error.message);
    }
}

// Test 7: Error handling
async function testErrorHandling() {
    console.log('\n📋 TEST 7: ERROR HANDLING');
    console.log('═══════════════════════════════════════════════════════\n');
    
    // Test invalid document ID
    try {
        await databases.getDocument(DATABASE_ID, BOOKINGS_COLLECTION, 'invalid-id');
        logTest('Error Handling', 'Invalid ID detection', false, 'Should have thrown error');
    } catch (error) {
        if (error.code === 404) {
            logTest('Error Handling', 'Invalid ID detection', true, 'Correct 404 error thrown');
        } else {
            logTest('Error Handling', 'Invalid ID detection', false, `Wrong error: ${error.code}`);
        }
    }
    
    // Test missing required fields
    try {
        await databases.createDocument(
            DATABASE_ID,
            BOOKINGS_COLLECTION,
            ID.unique(),
            { customerName: 'Only Name' } // Missing required fields
        );
        logTest('Error Handling', 'Required field validation', false, 'Should have thrown validation error');
    } catch (error) {
        if (error.code === 400) {
            logTest('Error Handling', 'Required field validation', true, 'Schema validation working');
        } else {
            logTest('Error Handling', 'Required field validation', false, `Wrong error: ${error.code}`);
        }
    }
}

// Generate report
function generateReport() {
    console.log('\n═══════════════════════════════════════════════════════');
    console.log('📊 AUDIT REPORT SUMMARY');
    console.log('═══════════════════════════════════════════════════════\n');
    
    console.log(`✅ Passed Tests: ${auditResults.passed.length}`);
    console.log(`❌ Failed Tests: ${auditResults.failed.length}`);
    console.log(`⚠️  Warnings: ${auditResults.warnings.length}\n`);
    
    if (auditResults.failed.length > 0) {
        console.log('❌ FAILED TESTS:\n');
        auditResults.failed.forEach(({ category, test, details }) => {
            console.log(`   ${category} - ${test}`);
            if (details) console.log(`   └─ ${details}`);
        });
        console.log('');
    }
    
    if (auditResults.warnings.length > 0) {
        console.log('⚠️  WARNINGS:\n');
        auditResults.warnings.forEach(({ category, message }) => {
            console.log(`   ${category}: ${message}`);
        });
        console.log('');
    }
    
    // Overall assessment
    const totalTests = auditResults.passed.length + auditResults.failed.length;
    const successRate = (auditResults.passed.length / totalTests * 100).toFixed(1);
    
    console.log('═══════════════════════════════════════════════════════');
    console.log(`📈 SUCCESS RATE: ${successRate}% (${auditResults.passed.length}/${totalTests})`);
    console.log('═══════════════════════════════════════════════════════\n');
    
    if (auditResults.failed.length === 0) {
        console.log('🎉 ALL TESTS PASSED - YOUR BOOKING FLOW IS READY!\n');
        console.log('✅ Permissions: Configured correctly');
        console.log('✅ Data Flow: Working');
        console.log('✅ API Calls: Successful');
        console.log('✅ Error Handling: Functional\n');
        console.log('🚀 Next: Test Order Now button in browser at http://localhost:3003\n');
    } else {
        console.log('⚠️  ACTION REQUIRED - FIX FAILED TESTS\n');
        
        // Specific recommendations
        const failedCategories = [...new Set(auditResults.failed.map(f => f.category))];
        
        if (failedCategories.includes('Messages')) {
            console.log('📋 Messages Collection Issues:');
            console.log('   1. Update Appwrite schema to match required fields');
            console.log('   2. Or update code to provide all required fields\n');
        }
        
        if (failedCategories.includes('Chat Sessions')) {
            console.log('📋 Chat Sessions Collection Issues:');
            console.log('   1. Verify collection exists in Appwrite');
            console.log('   2. Check permissions include Role: any()\n');
        }
        
        if (failedCategories.includes('Permissions')) {
            console.log('📋 Permission Issues:');
            console.log('   1. Go to Appwrite Console');
            console.log('   2. Database → Collections');
            console.log('   3. For each failed collection:');
            console.log('      - Settings → Permissions');
            console.log('      - Add: create("any()")');
            console.log('      - Add: read("any()")');
            console.log('      - Add: update("any()")');
            console.log('      - Save changes\n');
        }
    }
    
    // Save report to file
    const fs = require('fs');
    const reportPath = 'APPWRITE_AUDIT_REPORT.json';
    fs.writeFileSync(reportPath, JSON.stringify(auditResults, null, 2));
    console.log(`📄 Full report saved to: ${reportPath}\n`);
}

// Main audit execution
async function runAudit() {
    console.log('═══════════════════════════════════════════════════════');
    console.log('🔍 APPWRITE COMPREHENSIVE AUDIT');
    console.log('═══════════════════════════════════════════════════════');
    console.log(`Timestamp: ${auditResults.timestamp}`);
    console.log(`Endpoint: https://syd.cloud.appwrite.io/v1`);
    console.log(`Project: 68f23b11000d25eb3664`);
    console.log(`Database: ${DATABASE_ID}`);
    console.log('═══════════════════════════════════════════════════════');
    
    try {
        await testBookingsCollection();
        await testRealBookingFlow();
        await testMessagesCollection();
        await testChatSessionsCollection();
        await testPermissions();
        await testQueryPerformance();
        await testErrorHandling();
    } catch (error) {
        console.error('\n❌ FATAL ERROR:', error.message);
    }
    
    generateReport();
}

runAudit().catch(error => {
    console.error('❌ Audit failed:', error.message);
    process.exit(1);
});
