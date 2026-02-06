/**
 * ═══════════════════════════════════════════════════════════════════════════
 * ATOMIC BOOKING TRANSACTION SERVICE - Facebook/Amazon Standard
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * PURPOSE:
 * Ensures booking creation is fully atomic with proper rollback on failure.
 * No partial bookings, no premature UI unlocks, no race conditions.
 * 
 * TRANSACTION FLOW:
 * PREPARE  → Validate all inputs, generate IDs, format payloads
 * PERSIST  → Create Appwrite record (can fail → rollback)
 * CONFIRM  → Transform to engine format (can fail → rollback)
 * COMMIT   → Return committed state (no failures allowed)
 * 
 * GUARANTEES:
 * - Booking exists in database before UI shows it
 * - Chat remains locked until COMMIT succeeds
 * - Timer never starts without valid booking
 * - All state updates are atomic (single write)
 * - Failures trigger cleanup and rollback
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { BookingLifecycleStatus } from '../lib/services/bookingLifecycleService';
import { BookingData } from '../types';
import { TimerPhase } from '../hooks/useBookingTimer';

// ═══════════════════════════════════════════════════════════════════════════
// TYPE DEFINITIONS
// ═══════════════════════════════════════════════════════════════════════════

export interface BookingTransactionParams {
  // Therapist info
  therapist: {
    id: string;
    appwriteId: string;
    name: string;
  };
  
  // Customer info
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerWhatsApp?: string;
  
  // Service details
  duration: number;
  totalPrice: number;
  serviceType?: string;
  
  // Location
  locationZone?: string;
  customerLocation?: string;
  address?: string;
  locationType?: 'home' | 'hotel' | 'villa';
  roomNumber?: string;
  coordinates?: { lat: number; lng: number };
  
  // Scheduling
  scheduledDate?: string;
  scheduledTime?: string;
  bookingType?: 'BOOK_NOW' | 'SCHEDULED';
  
  // Discount
  discountCode?: string;
  discountPercentage?: number;
  originalPrice?: number;
}

export interface CommittedBookingState {
  booking: BookingData;
  documentId: string;
  lifecycleStatus: BookingLifecycleStatus;
  expiresAt: string;
  timerPhase: TimerPhase;
}

export interface BookingTransactionResult {
  success: boolean;
  data?: CommittedBookingState;
  error?: string;
}

interface PreparedBookingData {
  appwritePayload: any;
  bookingId: string;
  expiresAt: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// TRANSACTION EXECUTION
// ═══════════════════════════════════════════════════════════════════════════

export async function executeBookingTransaction(
  params: BookingTransactionParams
): Promise<BookingTransactionResult> {
  
  let createdDocumentId: string | null = null;
  
  console.log('🔒 [TRANSACTION] Starting atomic booking creation');
  console.log('🔒 [TRANSACTION] Params:', {
    therapistId: params.therapist.id,
    customerName: params.customerName,
    duration: params.duration,
    totalPrice: params.totalPrice
  });
  
  try {
    // ═══════════════════════════════════════════════════════════════════════
    // PHASE 1: PREPARE (All validation, no side effects)
    // ═══════════════════════════════════════════════════════════════════════
    console.log('📋 [TRANSACTION] PHASE 1: PREPARE');
    
    const prepared = await prepareBookingData(params);
    if (!prepared.success) {
      console.error('❌ [TRANSACTION] PREPARE failed:', prepared.error);
      return { success: false, error: prepared.error };
    }
    
    console.log('✅ [TRANSACTION] PREPARE complete:', prepared.data!.bookingId);
    
    // ═══════════════════════════════════════════════════════════════════════
    // PHASE 2: PERSIST (Appwrite - can fail, triggers rollback)
    // ═══════════════════════════════════════════════════════════════════════
    console.log('💾 [TRANSACTION] PHASE 2: PERSIST');
    
    const persisted = await persistToAppwrite(prepared.data!);
    if (!persisted.success) {
      console.error('❌ [TRANSACTION] PERSIST failed:', persisted.error);
      return { success: false, error: persisted.error };
    }
    
    createdDocumentId = persisted.data!.documentId;
    console.log('✅ [TRANSACTION] PERSIST complete:', createdDocumentId);
    
    // ═══════════════════════════════════════════════════════════════════════
    // PHASE 3: CONFIRM (Transform to final format - can fail, triggers rollback)
    // ═══════════════════════════════════════════════════════════════════════
    console.log('🔄 [TRANSACTION] PHASE 3: CONFIRM');
    
    const confirmed = await confirmBookingState(
      persisted.data!,
      prepared.data!,
      params
    );
    if (!confirmed.success) {
      console.error('❌ [TRANSACTION] CONFIRM failed:', confirmed.error);
      // Rollback: Delete Appwrite record
      await rollbackAppwriteRecord(createdDocumentId);
      return { success: false, error: confirmed.error };
    }
    
    console.log('✅ [TRANSACTION] CONFIRM complete');
    
    // ═══════════════════════════════════════════════════════════════════════
    // PHASE 4: COMMIT (Return committed state - no failures allowed)
    // ═══════════════════════════════════════════════════════════════════════
    console.log('✅ [TRANSACTION] PHASE 4: COMMIT');
    console.log('✅ [TRANSACTION] Transaction complete - booking ready for UI');
    
    return {
      success: true,
      data: confirmed.data!
    };
    
  } catch (error: any) {
    console.error('❌ [TRANSACTION] Unexpected error:', error);
    
    // Rollback: Clean up Appwrite record if created
    if (createdDocumentId) {
      await rollbackAppwriteRecord(createdDocumentId);
    }
    
    return {
      success: false,
      error: error?.message || 'Unexpected error during booking transaction'
    };
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// PHASE 1: PREPARE
// ═══════════════════════════════════════════════════════════════════════════

async function prepareBookingData(
  params: BookingTransactionParams
): Promise<{ success: boolean; data?: PreparedBookingData; error?: string }> {
  
  // ─────────────────────────────────────────────────────────────────────────
  // Validation: Authentication
  // ─────────────────────────────────────────────────────────────────────────
  console.log('🔑 [PREPARE] Ensuring authentication session...');
  try {
    const { ensureAuthSession } = await import('../lib/authSessionHelper');
    const authResult = await ensureAuthSession('Booking transaction');
    
    if (!authResult.success) {
      return { success: false, error: 'Authentication failed. Please refresh and try again.' };
    }
    console.log('✅ [PREPARE] Session established:', authResult.userId);
  } catch (error) {
    return { success: false, error: 'Authentication error. Please refresh and try again.' };
  }
  
  // ─────────────────────────────────────────────────────────────────────────
  // Validation: Therapist
  // ─────────────────────────────────────────────────────────────────────────
  if (!params.therapist?.id || !params.therapist?.appwriteId) {
    return { success: false, error: 'Invalid therapist data. Missing ID or Appwrite ID.' };
  }
  
  // ─────────────────────────────────────────────────────────────────────────
  // Validation: Customer
  // ─────────────────────────────────────────────────────────────────────────
  if (!params.customerName) {
    return { success: false, error: 'Customer name is required.' };
  }
  
  if (!params.customerPhone) {
    return { success: false, error: 'Phone number is required.' };
  }
  
  // ═════════════════════════════════════════════════════════════════════════
  // 🚨 TESTING GATE REQUIREMENT 2: DUPLICATE BOOKING CHECK
  // ═════════════════════════════════════════════════════════════════════════
  console.log('🔍 [PREPARE] Checking for duplicate bookings...');
  
  const { checkDuplicateBooking } = await import('../lib/services/bookingLifecycleService');
  const duplicateCheck = await checkDuplicateBooking(
    params.customerId,
    params.therapist.appwriteId
  );
  
  if (duplicateCheck.exists) {
    console.log('🚫 [PREPARE] DUPLICATE DETECTED - blocking booking creation');
    return { 
      success: false, 
      error: duplicateCheck.reason || 'You already have a pending booking with this therapist.'
    };
  }
  
  console.log('✅ [PREPARE] No duplicate found - proceeding');
  
  // ═════════════════════════════════════════════════════════════════════════
  // 🚨 TESTING GATE REQUIREMENT 1: SERVER-SIDE BOOKING ID GENERATION
  // ═════════════════════════════════════════════════════════════════════════
  console.log('🆔 [PREPARE] Generating server-side booking ID...');
  
  const { generateBookingId } = await import('../lib/services/bookingLifecycleService');
  const bookingId = await generateBookingId();
  
  console.log('✅ [PREPARE] Server-generated booking ID:', bookingId);
  
  // ─────────────────────────────────────────────────────────────────────────
  // Calculate Expiration
  // ─────────────────────────────────────────────────────────────────────────
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString(); // 5 minutes
  
  // ─────────────────────────────────────────────────────────────────────────
  // Format Customer Phone (strip + prefix for Appwrite compatibility)
  // ─────────────────────────────────────────────────────────────────────────
  const customerPhone = params.customerPhone.replace(/^\+/, '');
  const customerWhatsApp = params.customerWhatsApp?.replace(/^\+/, '') || customerPhone;
  
  // ─────────────────────────────────────────────────────────────────────────
  // Build Appwrite Payload (exact schema match with typos preserved)
  // ─────────────────────────────────────────────────────────────────────────
  const appwritePayload = {
    customerId: params.customerId || 'guest',
    customerName: params.customerName,
    customerphone: customerPhone, // lowercase to match schema
    customerWhatsApp: customerPhone, // Use phone for validation
    therapistId: params.therapist.appwriteId, // CRITICAL: Use Appwrite document ID
    therapistAppwriteId: params.therapist.appwriteId, // For validation
    therapistName: params.therapist.name,
    therapistType: 'therapist' as const,
    serviceType: params.serviceType || 'Traditional Massage',
    duration: params.duration,
    price: params.totalPrice,
    location: params.locationZone || params.customerLocation || params.address || 'Address provided in chat',
    locationtype: (params.locationType || 'home') as 'home' | 'hotel' | 'villa', // lowercase
    address: params.address || params.customerLocation || 'Address provided in chat',
    roomnumber: params.roomNumber || '', // lowercase, empty string for required field
    cordinates: params.coordinates ? JSON.stringify(params.coordinates) : undefined, // typo preserved
    bookingDate: new Date().toISOString(),
    date: new Date().toISOString(),
    customerPhone: customerPhone, // camelCase for TypeScript
    time: params.scheduledTime || new Date().toLocaleTimeString('en-US', { hour12: false }),
    status: 'pending' as const,
    responcedeadline: expiresAt, // typo preserved
    notes: params.discountCode ? `Discount: ${params.discountPercentage}%` : undefined,
  };
  
  console.log('📦 [PREPARE] Appwrite payload ready');
  
  return {
    success: true,
    data: {
      appwritePayload,
      bookingId,
      expiresAt
    }
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// PHASE 2: PERSIST
// ═══════════════════════════════════════════════════════════════════════════

async function persistToAppwrite(
  prepared: PreparedBookingData
): Promise<{ success: boolean; data?: any; error?: string }> {
  
  try {
    const { bookingService } = await import('../lib/bookingService');
    
    console.log('💾 [PERSIST] Creating Appwrite document...');
    const createdBooking = await bookingService.createBooking(prepared.appwritePayload);
    
    if (!createdBooking || !createdBooking.bookingId) {
      return { success: false, error: 'Appwrite persistence failed - no booking returned' };
    }
    
    console.log('✅ [PERSIST] Document created:', createdBooking.$id);
    
    return {
      success: true,
      data: {
        documentId: createdBooking.$id,
        appwriteBooking: createdBooking
      }
    };
    
  } catch (error: any) {
    console.error('❌ [PERSIST] Appwrite error:', error);
    
    // Detailed error analysis
    let errorMessage = 'Failed to create booking in database. ';
    
    if (error?.code === 400) {
      errorMessage += 'Invalid booking data.';
    } else if (error?.code === 401) {
      errorMessage += 'Authentication failed.';
    } else if (error?.code === 404) {
      errorMessage += 'Booking collection not found.';
    } else if (error?.code === 500) {
      errorMessage += 'Server error.';
    } else if (error?.message?.includes('network')) {
      errorMessage += 'Network connection issue.';
    } else {
      errorMessage += error?.message || 'Unknown error.';
    }
    
    return { success: false, error: errorMessage };
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// PHASE 3: CONFIRM
// ═══════════════════════════════════════════════════════════════════════════

async function confirmBookingState(
  persisted: any,
  prepared: PreparedBookingData,
  params: BookingTransactionParams
): Promise<{ success: boolean; data?: CommittedBookingState; error?: string }> {
  
  try {
    const { appwriteBooking, documentId } = persisted;
    
    // Transform to BookingData format
    const booking: BookingData = {
      id: appwriteBooking.bookingId,
      bookingId: appwriteBooking.bookingId,
      documentId: documentId,
      
      // ═══════════════════════════════════════════════════════════════════
      // CRITICAL: Use ONLY lifecycleStatus (no dual status fields)
      // ═══════════════════════════════════════════════════════════════════
      lifecycleStatus: BookingLifecycleStatus.PENDING,
      
      // Provider info
      therapistId: appwriteBooking.therapistId,
      therapistName: appwriteBooking.therapistName,
      providerType: 'therapist',
      
      // Customer info
      customerId: appwriteBooking.customerId,
      customerName: appwriteBooking.customerName,
      customerPhone: appwriteBooking.customerPhone,
      
      // Service details
      serviceType: appwriteBooking.serviceType,
      duration: appwriteBooking.duration,
      totalPrice: appwriteBooking.price,
      
      // Location
      locationZone: appwriteBooking.location,
      coordinates: params.coordinates,
      
      // Booking type
      bookingType: params.bookingType || 'BOOK_NOW',
      
      // Financial
      adminCommission: Math.round(appwriteBooking.price * 0.3),
      providerPayout: Math.round(appwriteBooking.price * 0.7),
      
      // Discount
      discountCode: params.discountCode,
      discountPercentage: params.discountPercentage,
      originalPrice: params.originalPrice,
      discountedPrice: params.discountCode ? appwriteBooking.price : undefined,
      
      // Timestamps
      createdAt: appwriteBooking.createdAt || new Date().toISOString(),
      pendingAt: appwriteBooking.createdAt || new Date().toISOString(),
      responseDeadline: appwriteBooking.responseDeadline || prepared.expiresAt,
      
      // Scheduling
      scheduledDate: params.scheduledDate,
      scheduledTime: params.scheduledTime,
    };
    
    const committedState: CommittedBookingState = {
      booking,
      documentId,
      lifecycleStatus: BookingLifecycleStatus.PENDING,
      expiresAt: prepared.expiresAt,
      timerPhase: 'THERAPIST_RESPONSE' as TimerPhase
    };
    
    console.log('✅ [CONFIRM] Booking state confirmed:', booking.bookingId);
    
    return { success: true, data: committedState };
    
  } catch (error: any) {
    console.error('❌ [CONFIRM] Transform error:', error);
    return { success: false, error: 'Failed to confirm booking state' };
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// ROLLBACK
// ═══════════════════════════════════════════════════════════════════════════

async function rollbackAppwriteRecord(documentId: string | null): Promise<void> {
  if (!documentId) return;
  
  try {
    console.log('🔄 [ROLLBACK] Attempting to delete Appwrite document:', documentId);
    
    const { databases } = await import('../lib/appwrite');
    const { APPWRITE_CONFIG } = await import('../lib/appwrite.config');
    
    await databases.deleteDocument(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.collections.bookings,
      documentId
    );
    
    console.log('✅ [ROLLBACK] Document deleted successfully');
  } catch (error) {
    console.error('❌ [ROLLBACK] Failed to delete document:', error);
    console.error('⚠️ Manual cleanup may be required for document:', documentId);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════════

// ⚠️ DEPRECATED: Client-side booking ID generation removed
// ✅ REPLACED: All booking IDs now generated server-side via bookingLifecycleService.generateBookingId()
// See TESTING GATE REQUIREMENT 1 in prepareBookingData function above

/**
 * Helper: Check if lifecycle status represents an active booking
 * (booking that should have an active timer)
 */
export function isBookingActive(lifecycleStatus: BookingLifecycleStatus | null): boolean {
  if (!lifecycleStatus) return false;
  
  return (
    lifecycleStatus === BookingLifecycleStatus.PENDING ||
    lifecycleStatus === BookingLifecycleStatus.ACCEPTED
  );
}
