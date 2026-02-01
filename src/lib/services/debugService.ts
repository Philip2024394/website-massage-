/**
 * Simple test service to debug Appwrite connection issues
 */

import { databases, ID, Query } from '../appwrite.ts';
import { APPWRITE_CONFIG } from '../appwrite.config.ts';

export class DebugService {
  
  async testDatabaseConnection(): Promise<{ success: boolean; message: string; details?: any }> {
    try {
      console.log('🔍 Testing Appwrite database connection...');
      console.log('   Database ID:', APPWRITE_CONFIG.databaseId);
      console.log('   Project ID:', APPWRITE_CONFIG.projectId);
      console.log('   Endpoint:', APPWRITE_CONFIG.endpoint);
      
      // Try to list databases first
      const response = await databases.list();
      console.log('✅ Database connection successful');
      console.log('   Available databases:', response.databases.length);
      
      return {
        success: true,
        message: 'Database connection working',
        details: {
          databaseCount: response.databases.length,
          databaseId: APPWRITE_CONFIG.databaseId
        }
      };
      
    } catch (error) {
      console.error('❌ Database connection failed:', error);
      
      return {
        success: false,
        message: `Connection failed: ${(error as Error).message}`,
        details: {
          error: error,
          errorMessage: (error as Error).message,
          errorCode: (error as any).code,
          errorType: (error as any).type
        }
      };
    }
  }
  
  async testMessageCollection(): Promise<{ success: boolean; message: string; details?: any }> {
    try {
      console.log('🔍 Testing messages collection...');
      const messagesCollection = APPWRITE_CONFIG.collections.messages;
      console.log('   Messages collection ID:', messagesCollection);
      
      if (!messagesCollection) {
        return {
          success: false,
          message: 'Messages collection not configured',
          details: { collectionId: messagesCollection }
        };
      }
      
      // Try to create a test document
      const testDocument = await databases.createDocument(
        APPWRITE_CONFIG.databaseId,
        messagesCollection,
        ID.unique(),
        {
          test: true,
          message: 'Connection test',
          createdAt: new Date().toISOString()
        }
      );
      
      console.log('✅ Messages collection test successful');
      console.log('   Created test document:', testDocument.$id);
      
      // Clean up - delete the test document
      await databases.deleteDocument(
        APPWRITE_CONFIG.databaseId,
        messagesCollection,
        testDocument.$id
      );
      
      console.log('🧹 Test document cleaned up');
      
      return {
        success: true,
        message: 'Messages collection working',
        details: {
          collectionId: messagesCollection,
          testDocumentId: testDocument.$id
        }
      };
      
    } catch (error) {
      console.error('❌ Messages collection test failed:', error);
      
      return {
        success: false,
        message: `Messages collection failed: ${(error as Error).message}`,
        details: {
          error: error,
          errorMessage: (error as Error).message,
          errorCode: (error as any).code,
          collectionId: APPWRITE_CONFIG.collections.messages
        }
      };
    }
  }
  
  async testBookingsCollection(): Promise<{ success: boolean; message: string; details?: any }> {
    try {
      console.log('🔍 Testing bookings collection...');
      const bookingsCollection = APPWRITE_CONFIG.collections.bookings;
      console.log('   Bookings collection ID:', bookingsCollection);
      
      if (!bookingsCollection) {
        return {
          success: false,
          message: 'Bookings collection not configured',
          details: { collectionId: bookingsCollection }
        };
      }
      
      // Try to create a test booking document
      const testBooking = await databases.createDocument(
        APPWRITE_CONFIG.databaseId,
        bookingsCollection,
        ID.unique(),
        {
          test: true,
          bookingId: 'TEST_' + Date.now(),
          status: 'pending',
          createdAt: new Date().toISOString()
        }
      );
      
      console.log('✅ Bookings collection test successful');
      console.log('   Created test booking:', testBooking.$id);
      
      // Clean up - delete the test document
      await databases.deleteDocument(
        APPWRITE_CONFIG.databaseId,
        bookingsCollection,
        testBooking.$id
      );
      
      console.log('🧹 Test booking cleaned up');
      
      return {
        success: true,
        message: 'Bookings collection working',
        details: {
          collectionId: bookingsCollection,
          testDocumentId: testBooking.$id
        }
      };
      
    } catch (error) {
      console.error('❌ Bookings collection test failed:', error);
      
      return {
        success: false,
        message: `Bookings collection failed: ${(error as Error).message}`,
        details: {
          error: error,
          errorMessage: (error as Error).message,
          errorCode: (error as any).code,
          collectionId: APPWRITE_CONFIG.collections.bookings
        }
      };
    }
  }
  
  async runFullDiagnostic(): Promise<{ results: any[], summary: string }> {
    console.log('🔬 Running full Appwrite diagnostic...');
    
    const results = [];
    
    // Test 1: Database connection
    const dbTest = await this.testDatabaseConnection();
    results.push({ test: 'Database Connection', ...dbTest });
    
    // Test 2: Messages collection
    const messagesTest = await this.testMessageCollection();
    results.push({ test: 'Messages Collection', ...messagesTest });
    
    // Test 3: Bookings collection
    const bookingsTest = await this.testBookingsCollection();
    results.push({ test: 'Bookings Collection', ...bookingsTest });
    
    // Create summary
    const successfulTests = results.filter(r => r.success).length;
    const totalTests = results.length;
    const summary = `${successfulTests}/${totalTests} tests passed`;
    
    console.log('📊 Diagnostic complete:', summary);
    
    return { results, summary };
  }
}

export const debugService = new DebugService();