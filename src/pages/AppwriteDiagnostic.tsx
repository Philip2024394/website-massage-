// 🎯 AUTO-FIXED: Mobile scroll architecture violations (2 fixes)
/**
 * Appwrite Diagnostic Tool
 * Tests what's blocking message sending, booking creation, and therapist live display
 */

import React, { useState } from 'react';

export const AppwriteDiagnostic: React.FC = () => {
  const [results, setResults] = useState<string[]>([]);

  const addResult = (message: string) => {
    setResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  /** Audit why Appwrite therapists are not displaying live on the app */
  const runTherapistLiveAudit = async () => {
    setResults([]);
    addResult('🔍 THERAPIST LIVE DISPLAY AUDIT');
    addResult('────────────────────────────────────');

    try {
      // Use same config as therapist.service (lib/appwrite/config.ts)
      const { APPWRITE_CONFIG } = await import('../lib/appwrite/config');
      const { Query } = await import('appwrite');
      const { databases } = await import('../lib/appwrite/config');

      const dbId = APPWRITE_CONFIG.databaseId;
      const collId = APPWRITE_CONFIG.collections?.therapists;

      addResult(`📋 Database ID: ${dbId || 'MISSING'}`);
      addResult(`📋 Therapists collection ID: ${collId || 'MISSING'}`);

      const envDb = typeof import.meta !== 'undefined' && (import.meta.env?.VITE_APPWRITE_DATABASE_ID);
      const envColl = typeof import.meta !== 'undefined' && (import.meta.env?.VITE_THERAPISTS_COLLECTION_ID);
      addResult(`🔑 VITE_THERAPISTS_COLLECTION_ID set: ${envColl ? 'YES' : 'NO (using fallback)'}`);
      if (!envColl) {
        addResult('⚠️ If fallback is "therapists_collection_id", that is a PLACEHOLDER. Set .env VITE_THERAPISTS_COLLECTION_ID to your real Appwrite collection ID.');
      }

      const filterStep = typeof import.meta !== 'undefined' && (import.meta.env?.VITE_THERAPIST_FILTER_STEP ?? '0');
      addResult(`🔑 VITE_THERAPIST_FILTER_STEP: ${filterStep}`);
      if (filterStep === '1') addResult('   → Filter: approved=true only');
      if (filterStep === '2') addResult('   → Filter: approved=true, status=online');
      if (filterStep === '3') addResult('   → Filter: approved=true, status=online, availability=available');
      if (filterStep === '0') addResult('   → No status filters (limit 200 only). If list is still empty, check collection ID and permissions.');

      if (!dbId || !collId) {
        addResult('❌ CRITICAL: Database or therapists collection ID missing. Check lib/appwrite/config.ts and .env');
        addResult('🔍 Audit complete.');
        return;
      }

      addResult('────────────────────────────────────');
      addResult('📡 Listing therapists (limit 5)...');

      const queries = [Query.limit(5)];
      const response = await databases.listDocuments(dbId, collId, queries);
      const total = (response as any).total ?? (response as any).documents?.length ?? 0;
      const docs = (response as any).documents ?? [];

      addResult(`✅ Therapists collection reachable. Total (this query): ${total}, documents returned: ${docs.length}`);
      if (docs.length === 0) {
        addResult('⚠️ Zero documents. Possible causes:');
        addResult('   1. Collection ID is wrong (e.g. still "therapists_collection_id")');
        addResult('   2. Read permission: collection must allow "Any" or "Users" read');
        addResult('   3. No therapist documents in this collection yet');
        addResult('   → Open Appwrite Console → Database → your DB → copy exact Collection ID for therapists.');
      } else {
        const first = docs[0] as any;
        addResult(`   First doc: $id=${first?.$id}, name=${first?.name ?? 'n/a'}`);
      }

      addResult('────────────────────────────────────');
      addResult('🔍 Therapist live audit complete.');
    } catch (err: any) {
      addResult(`❌ Error: ${err?.message || String(err)}`);
      if (err?.message?.includes('Collection with the requested ID could not be found')) {
        addResult('💡 Fix: Set VITE_THERAPISTS_COLLECTION_ID in .env to the real collection ID from Appwrite Console.');
      }
      if (err?.message?.includes('not authorized') || err?.message?.includes('401')) {
        addResult('💡 Fix: In Appwrite Console, set collection permissions to allow "Any" read.');
      }
    }
  };

  const testAppwriteConnection = async () => {
    setResults([]);
    addResult('🔍 Starting Appwrite diagnostic...');

    // Test 1: Basic Appwrite connection
    try {
      const { client } = await import('../lib/appwrite');
      addResult('✅ Appwrite client imported successfully');
      
      // Test account endpoint (basic connectivity)
      const account = await client.account?.get();
      if (account) {
        addResult(`✅ Appwrite connected - User: ${account.name || 'Anonymous'}`);
      } else {
        addResult('⚠️ Appwrite connected but no user session');
      }
    } catch (error: any) {
      addResult(`❌ Appwrite connection failed: ${error.message}`);
    }

    // Test 2: Database access
    try {
      const { databases } = await import('../lib/appwrite');
      const { APPWRITE_CONFIG } = await import('../lib/appwrite.config');
      
      addResult(`🔍 Testing database: ${APPWRITE_CONFIG.databaseId}`);
      
      // Try to list documents from messages collection
      try {
        const messagesCollection = APPWRITE_CONFIG.collections.messages;
        addResult(`🔍 Messages collection ID: ${messagesCollection}`);
        
        if (!messagesCollection) {
          addResult('❌ CRITICAL: Messages collection is NULL or undefined!');
        } else {
          const response = await databases.listDocuments(
            APPWRITE_CONFIG.databaseId,
            messagesCollection,
            []
          );
          addResult(`✅ Messages collection accessible - Found ${response.documents.length} messages`);
        }
      } catch (dbError: any) {
        addResult(`❌ Messages collection error: ${dbError.message}`);
        addResult(`   Error code: ${dbError.code || 'No code'}`);
        addResult(`   Error type: ${dbError.type || 'No type'}`);
      }

      // Test bookings collection
      try {
        const bookingsCollection = APPWRITE_CONFIG.collections.bookings;
        addResult(`🔍 Bookings collection ID: ${bookingsCollection}`);
        
        if (!bookingsCollection) {
          addResult('❌ CRITICAL: Bookings collection is NULL or undefined!');
        } else {
          const response = await databases.listDocuments(
            APPWRITE_CONFIG.databaseId,
            bookingsCollection,
            []
          );
          addResult(`✅ Bookings collection accessible - Found ${response.documents.length} bookings`);
        }
      } catch (dbError: any) {
        addResult(`❌ Bookings collection error: ${dbError.message}`);
        addResult(`   Error code: ${dbError.code || 'No code'}`);
        addResult(`   Error type: ${dbError.type || 'No type'}`);
      }

    } catch (error: any) {
      addResult(`❌ Database import failed: ${error.message}`);
    }

    // Test 3: Try to create a test message
    try {
      addResult('🔍 Testing message creation...');
      const { chatService } = await import('../lib/services/reliableChatService');
      
      const testResult = await chatService.sendMessage({
        conversationId: 'diagnostic_test',
        senderId: 'diagnostic_user',
        senderName: 'Diagnostic Test',
        senderRole: 'customer',
        receiverId: 'test_therapist',
        receiverName: 'Test Therapist',
        receiverRole: 'therapist',
        message: 'Diagnostic test message',
        messageType: 'text'
      });

      if (testResult.success) {
        addResult(`✅ Test message created successfully: ${testResult.messageId}`);
      } else {
        addResult(`❌ Test message failed: ${testResult.error}`);
      }
    } catch (error: any) {
      addResult(`❌ Message service error: ${error.message}`);
    }

    // Test 4: Try to create a test booking
    try {
      addResult('🔍 Testing booking creation...');
      const { chatService } = await import('../lib/services/reliableChatService');
      
      const bookingResult = await chatService.createBooking({
        bookingId: 'diagnostic_booking_test',
        customerName: 'Diagnostic User',
        therapistName: 'Test Therapist',
        therapistId: 'test_therapist',
        duration: 60,
        price: 100,
        date: new Date().toISOString().split('T')[0],
        time: '14:00',
        location: 'Test Location'
      });

      if (bookingResult.success) {
        addResult(`✅ Test booking created successfully: ${bookingResult.bookingId}`);
      } else {
        addResult(`❌ Test booking failed: ${bookingResult.error}`);
      }
    } catch (error: any) {
      addResult(`❌ Booking service error: ${error.message}`);
    }

    addResult('🔍 Diagnostic complete!');
  };

  return (
    <div className="min-h-[calc(100vh-env(safe-area-inset-top)-env(safe-area-inset-bottom))] bg-gray-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            🔧 Appwrite Diagnostic Tool
          </h1>
          
          <p className="text-gray-600 mb-6">
            This tool will test your Appwrite setup to identify what's blocking messages and bookings.
          </p>

          <button
            onClick={testAppwriteConnection}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg mb-4 mr-2"
          >
            🔍 Run Diagnostic
          </button>
          <button
            onClick={runTherapistLiveAudit}
            className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-2 rounded-lg mb-4"
          >
            👤 Audit Therapist Live Display
          </button>

          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-3">Diagnostic Results:</h3>
            <div className="space-y-2 max-h-96 ">
              {results.length === 0 ? (
                <p className="text-gray-500 italic">Click "Run Diagnostic" to start testing...</p>
              ) : (
                results.map((result, index) => (
                  <div key={index} className="text-sm font-mono">
                    {result}
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h4 className="font-semibold text-yellow-800">Common Issues to Check:</h4>
            <ul className="list-disc list-inside text-sm text-yellow-700 mt-2 space-y-1">
              <li><strong>Collection IDs:</strong> Make sure 'messages', 'bookings', and <strong>'therapists'</strong> collections exist in Appwrite Console</li>
              <li><strong>Therapists not showing:</strong> Run &quot;Audit Therapist Live Display&quot; above. Set <code>VITE_THERAPISTS_COLLECTION_ID</code> in .env to the <strong>exact</strong> collection ID from Appwrite (not the placeholder <code>therapists_collection_id</code>)</li>
              <li><strong>Permissions:</strong> Collections need 'Any' role with 'Create' and 'Read' permissions</li>
              <li><strong>Database ID:</strong> Check if the database ID in config matches your Appwrite project</li>
              <li><strong>Project ID:</strong> Verify the Appwrite project ID is correct</li>
              <li><strong>Network:</strong> Ensure you can reach cloud.appwrite.io</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};