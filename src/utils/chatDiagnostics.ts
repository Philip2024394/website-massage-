/**
 * Chat and Booking System Diagnostics
 * 
 * This file contains diagnostic functions to help identify issues with:
 * - Message sending system
 * - Booking creation system
 * - Appwrite connectivity
 * - Service availability
 */

import { serverEnforcedChatService } from '../lib/services/serverEnforcedChatService';
import { bookingService } from '../lib/bookingService';
import { databases, client, Query } from '../lib/appwrite';
import { APPWRITE_CONFIG } from '../lib/appwrite.config';

export interface DiagnosticResult {
  service: string;
  status: 'OK' | 'WARNING' | 'ERROR';
  message: string;
  details?: any;
}

export interface SystemDiagnostics {
  overall: 'OK' | 'WARNING' | 'ERROR';
  results: DiagnosticResult[];
  timestamp: string;
}

/**
 * Run comprehensive diagnostics on the chat and booking system
 */
export async function runSystemDiagnostics(): Promise<SystemDiagnostics> {
  const results: DiagnosticResult[] = [];
  let overallStatus: 'OK' | 'WARNING' | 'ERROR' = 'OK';

  console.log('🔍 [DIAGNOSTICS] Starting system diagnostics...');

  // 1. Check Appwrite client connection
  try {
    console.log('🔍 [DIAGNOSTICS] Testing Appwrite client...');
    const health = await client.get('/health');
    results.push({
      service: 'Appwrite Client',
      status: 'OK',
      message: 'Client connection established',
      details: { endpoint: APPWRITE_CONFIG.endpoint }
    });
  } catch (error) {
    results.push({
      service: 'Appwrite Client',
      status: 'ERROR',
      message: `Client connection failed: ${(error as Error).message}`,
      details: { error: error }
    });
    overallStatus = 'ERROR';
  }

  // 2. Check database connectivity
  try {
    console.log('🔍 [DIAGNOSTICS] Testing database connectivity...');
    await databases.get(APPWRITE_CONFIG.databaseId);
    results.push({
      service: 'Appwrite Database',
      status: 'OK',
      message: 'Database accessible',
      details: { databaseId: APPWRITE_CONFIG.databaseId }
    });
  } catch (error) {
    results.push({
      service: 'Appwrite Database',
      status: 'ERROR',
      message: `Database access failed: ${(error as Error).message}`,
      details: { error: error }
    });
    overallStatus = 'ERROR';
  }

  // 3. Check booking collection
  try {
    console.log('🔍 [DIAGNOSTICS] Testing booking collection...');
    await databases.listDocuments(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.collections.bookings,
      [Query.limit(1)] // Proper Query syntax for limiting results
    );
    results.push({
      service: 'Booking Collection',
      status: 'OK',
      message: 'Booking collection accessible',
      details: { collectionId: APPWRITE_CONFIG.collections.bookings }
    });
  } catch (error) {
    results.push({
      service: 'Booking Collection',
      status: 'ERROR',
      message: `Booking collection access failed: ${(error as Error).message}`,
      details: { 
        error: error,
        collectionId: APPWRITE_CONFIG.collections.bookings
      }
    });
    overallStatus = 'ERROR';
  }

  // 4. Test server enforced chat service
  try {
    console.log('🔍 [DIAGNOSTICS] Testing chat service initialization...');
    const chatService = serverEnforcedChatService;
    if (!chatService) {
      throw new Error('Chat service not initialized');
    }
    results.push({
      service: 'Chat Service',
      status: 'OK',
      message: 'Chat service initialized successfully',
      details: { available: true }
    });
  } catch (error) {
    results.push({
      service: 'Chat Service',
      status: 'ERROR',
      message: `Chat service initialization failed: ${(error as Error).message}`,
      details: { error: error }
    });
    overallStatus = 'ERROR';
  }

  // 5. Test booking service
  try {
    console.log('🔍 [DIAGNOSTICS] Testing booking service...');
    if (!bookingService || !bookingService.createBooking) {
      throw new Error('Booking service not properly initialized');
    }
    results.push({
      service: 'Booking Service',
      status: 'OK',
      message: 'Booking service available',
      details: { hasCreateBooking: !!bookingService.createBooking }
    });
  } catch (error) {
    results.push({
      service: 'Booking Service',
      status: 'ERROR',
      message: `Booking service test failed: ${(error as Error).message}`,
      details: { error: error }
    });
    overallStatus = 'ERROR';
  }

  console.log('🔍 [DIAGNOSTICS] Diagnostics complete');

  return {
    overall: overallStatus,
    results,
    timestamp: new Date().toISOString()
  };
}

/**
 * Quick diagnostic for just the critical systems
 */
export async function quickDiagnostic(): Promise<DiagnosticResult[]> {
  const results: DiagnosticResult[] = [];

  // Test basic service availability
  results.push({
    service: 'Chat Service',
    status: serverEnforcedChatService ? 'OK' : 'ERROR',
    message: serverEnforcedChatService ? 'Available' : 'Not initialized'
  });

  results.push({
    service: 'Booking Service',
    status: (bookingService && bookingService.createBooking) ? 'OK' : 'ERROR',
    message: (bookingService && bookingService.createBooking) ? 'Available' : 'Not properly initialized'
  });

  results.push({
    service: 'Appwrite Config',
    status: APPWRITE_CONFIG.collections.bookings ? 'OK' : 'ERROR',
    message: APPWRITE_CONFIG.collections.bookings ? 'Booking collection configured' : 'Booking collection not configured'
  });

  return results;
}

/**
 * Display diagnostics in console with nice formatting
 */
export function displayDiagnostics(diagnostics: SystemDiagnostics) {
  console.log('\n' + '='.repeat(60));
  console.log('🔍 SYSTEM DIAGNOSTICS REPORT');
  console.log('='.repeat(60));
  console.log(`Overall Status: ${diagnostics.overall === 'OK' ? '✅' : diagnostics.overall === 'WARNING' ? '⚠️' : '❌'} ${diagnostics.overall}`);
  console.log(`Timestamp: ${diagnostics.timestamp}`);
  console.log('='.repeat(60));

  diagnostics.results.forEach((result, index) => {
    const icon = result.status === 'OK' ? '✅' : result.status === 'WARNING' ? '⚠️' : '❌';
    console.log(`${index + 1}. ${icon} ${result.service}: ${result.message}`);
    if (result.details) {
      console.log(`   Details:`, result.details);
    }
  });

  console.log('='.repeat(60) + '\n');
}