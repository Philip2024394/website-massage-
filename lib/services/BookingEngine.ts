/**
 * 🚨 CRITICAL: SINGLE SOURCE OF TRUTH FOR ALL BOOKING OPERATIONS
 * 
 * BookingEngine - The ONLY authority for booking state and operations
 * 
 * RULES:
 * - All booking creation/updates MUST go through this engine
 * - UI components are VIEW ONLY - they display state and trigger actions
 * - Chat is completely separate - booking exists BEFORE chat opens
 * - Every operation is logged for production debugging
 * - No silent failures allowed
 */

import { databases, ID } from '../appwrite';
import { APPWRITE_CONFIG } from '../appwrite.config';
// Import existing production services for coordination
import { bookingLifecycleService, BookingType } from './bookingLifecycleService';
import { bookingLocationService } from './BookingLocationService';
import { resolveBookingIdentity, validateBookingIdentity } from '../utils/bookingIdentityResolver';

// ============================================================================
// BOOKING STATE MACHINE - EXPLICIT STATES ONLY
// ============================================================================

export enum BookingState {
  IDLE = 'IDLE',
  INITIATED = 'INITIATED',           // User started booking process
  CREATED = 'CREATED',               // Booking record created in database
  PENDING_THERAPIST = 'PENDING_THERAPIST',  // Waiting for therapist response
  ACCEPTED = 'ACCEPTED',             // Therapist accepted
  CONFIRMED = 'CONFIRMED',           // Both parties confirmed
  COMPLETED = 'COMPLETED',           // Service completed
  CANCELLED = 'CANCELLED',           // Cancelled by either party
  EXPIRED = 'EXPIRED',               // 5-minute timer expired
  FAILED = 'FAILED'                  // Creation or processing failed
}

export interface BookingEngineData {
  id: string;
  bookingId: string;
  documentId?: string;
  state: BookingState;
  customerId: string;
  customerName: string;
  customerPhone: string;
  therapistId: string;
  therapistName: string;
  serviceType: string;
  duration: number;
  totalPrice: number;
  locationZone: string;
  coordinates?: { lat: number; lng: number };
  responseDeadline: string;
  createdAt: string;
  updatedAt: string;
  adminCommission: number;
  providerPayout: number;
  // State transition log
  stateHistory: BookingStateTransition[];
  // Error tracking
  lastError?: string;
  errorCount: number;
}

export interface BookingStateTransition {
  fromState: BookingState;
  toState: BookingState;
  timestamp: string;
  reason: string;
  triggeredBy: 'customer' | 'therapist' | 'system' | 'admin';
}

export interface CreateBookingParams {
  customerId: string;
  customerName: string;
  customerPhone: string;
  therapistId: string;
  therapistName: string;
  serviceType: string;
  duration: number;
  totalPrice: number;
  locationZone?: string; // Optional - will be auto-detected if not provided
  coordinates?: { lat: number; lng: number };
  discountCode?: string;
  discountPercentage?: number;
  originalPrice?: number;
}

export interface BookingEngineResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  bookingId?: string;
  state?: BookingState;
}

// ============================================================================
// BOOKING ENGINE - SINGLE SOURCE OF TRUTH
// ============================================================================

class BookingEngineClass {
  private activeBookings: Map<string, BookingEngineData> = new Map();

  /**
   * 🔒 CREATE BOOKING - ONLY WAY TO CREATE BOOKINGS
   * 
   * CRITICAL: This is the single entry point for all booking creation
   * UI components must NEVER create bookings directly
   */
  async createBooking(params: CreateBookingParams): Promise<BookingEngineResult<BookingEngineData>> {
    const bookingId = `booking_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // 🚫 DO NOT MODIFY - CANONICAL IDENTITY RESOLUTION
    // Booking identity is resolved exclusively via resolveBookingIdentity().
    // customerName is safety-critical and must never be optional.
    let user: any = null;
    let authUser: any = null;
    try {
      const { account } = await import('../appwrite');
      user = await account.get();
      authUser = user; // Same object in this context
    } catch (authError) {
      // Guest user - will use fallback
    }
    
    // Use canonical identity resolver - FROZEN LOGIC
    const identity = resolveBookingIdentity(user, authUser);
    validateBookingIdentity(identity);

    this.log('CREATE_BOOKING_INITIATED', {
      bookingId,
      therapistId: params.therapistId,
      customerId: params.customerId,
      customerName, // 🔴 REQUIRED — THIS FIXES THE ERROR
      totalPrice: params.totalPrice
    });

    try {
      // STEP 1: Validate inputs
      const validation = this.validateCreateParams(params, identity.customerName);
      if (!validation.success) {
        return this.failWithError(bookingId, 'VALIDATION_FAILED', validation.error!);
      }

      // STEP 2: Auto-detect location zone if not provided
      let finalLocationZone = params.locationZone;
      if (!finalLocationZone || finalLocationZone.trim() === '') {
        console.log('🌍 No location zone provided, auto-detecting...');
        try {
          finalLocationZone = await bookingLocationService.getLocationZoneForBooking();
          console.log('✅ Auto-detected location zone:', finalLocationZone);
        } catch (error) {
          console.warn('⚠️ Location auto-detection failed, using Jakarta as fallback');
          finalLocationZone = 'Jakarta';
        }
      }

      // STEP 3: Calculate commission (30% admin, 70% provider)
      const adminCommission = Math.round(params.totalPrice * 0.3);
      const providerPayout = params.totalPrice - adminCommission;

      // STEP 4: Create booking data structure
      const now = new Date();
      const responseDeadline = new Date(now.getTime() + 5 * 60 * 1000); // 5 minutes

      const bookingData: BookingEngineData = {
        id: bookingId,
        bookingId,
        state: BookingState.INITIATED,
        customerId: params.customerId,
        customerName: identity.customerName, // 🎯 CANONICAL IDENTITY FIELD
        customerPhone: params.customerPhone,
        therapistId: params.therapistId,
        therapistName: params.therapistName,
        serviceType: params.serviceType,
        duration: params.duration,
        totalPrice: params.totalPrice,
        locationZone: finalLocationZone, // Use auto-detected or provided zone
        coordinates: params.coordinates,
        responseDeadline: responseDeadline.toISOString(),
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
        adminCommission,
        providerPayout,
        stateHistory: [],
        errorCount: 0
      };

      // STEP 5: Transition to CREATED state
      this.transitionState(bookingData, BookingState.CREATED, 'Database record creation', 'customer');

      // STEP 6: Store in database using production bookingLifecycleService
      const dbResult = await this.createDatabaseRecordViaLifecycle(bookingData);
      if (!dbResult.success) {
        return this.failWithError(bookingId, 'DATABASE_CREATE_FAILED', dbResult.error!);
      }

      bookingData.documentId = dbResult.data.$id;

      // STEP 7: Transition to PENDING_THERAPIST
      this.transitionState(bookingData, BookingState.PENDING_THERAPIST, 'Waiting for therapist response', 'system');

      // STEP 8: Store in active bookings
      this.activeBookings.set(bookingId, bookingData);

      // STEP 9: Schedule expiration timer
      this.scheduleExpiration(bookingId, responseDeadline);

      this.log('CREATE_BOOKING_SUCCESS', {
        bookingId,
        documentId: bookingData.documentId,
        state: bookingData.state,
        adminCommission,
        providerPayout,
        responseDeadline: responseDeadline.toISOString()
      });

      // 📊 Production observability log
      console.info("BOOKING_CREATED", {
        bookingId,
        customerName: identity.customerName,
        source: "canonical",
      });

      return {
        success: true,
        data: bookingData,
        bookingId,
        state: bookingData.state
      };

    } catch (error: any) {
      return this.failWithError(bookingId, 'UNEXPECTED_ERROR', error.message || 'Unknown error during booking creation');
    }
  }

  /**
   * 🔒 ACCEPT BOOKING - ONLY WAY FOR THERAPISTS TO ACCEPT
   */
  async acceptBooking(bookingId: string, therapistId: string): Promise<BookingEngineResult<BookingEngineData>> {
    this.log('ACCEPT_BOOKING_INITIATED', { bookingId, therapistId });

    try {
      const booking = this.activeBookings.get(bookingId);
      if (!booking) {
        return this.failWithError(bookingId, 'BOOKING_NOT_FOUND', 'Booking not found in active bookings');
      }

      if (booking.therapistId !== therapistId) {
        return this.failWithError(bookingId, 'THERAPIST_MISMATCH', 'Therapist ID does not match booking');
      }

      if (booking.state !== BookingState.PENDING_THERAPIST) {
        return this.failWithError(bookingId, 'INVALID_STATE', `Cannot accept booking in state: ${booking.state}`);
      }

      // Update database record
      const dbResult = await this.updateDatabaseRecord(bookingId, {
        status: 'accepted',
        acceptedAt: new Date().toISOString(),
        therapistAccepted: true
      });

      if (!dbResult.success) {
        return this.failWithError(bookingId, 'DATABASE_UPDATE_FAILED', dbResult.error!);
      }

      // Transition state
      this.transitionState(booking, BookingState.ACCEPTED, 'Therapist accepted booking', 'therapist');
      booking.updatedAt = new Date().toISOString();

      this.log('ACCEPT_BOOKING_SUCCESS', {
        bookingId,
        therapistId,
        state: booking.state,
        acceptedAt: booking.updatedAt
      });

      return {
        success: true,
        data: booking,
        bookingId,
        state: booking.state
      };

    } catch (error: any) {
      return this.failWithError(bookingId, 'ACCEPT_ERROR', error.message || 'Unknown error during booking acceptance');
    }
  }

  /**
   * 🔒 GET BOOKING - ONLY WAY TO RETRIEVE BOOKING DATA
   */
  getBooking(bookingId: string): BookingEngineData | null {
    return this.activeBookings.get(bookingId) || null;
  }

  /**
   * 🔒 GET BOOKING STATE - SAFE STATE ACCESS
   */
  getBookingState(bookingId: string): BookingState | null {
    const booking = this.activeBookings.get(bookingId);
    return booking ? booking.state : null;
  }

  /**
   * 🌍 LOCATION UTILITIES - FOR UI INTEGRATION
   */
  
  /**
   * Get detected location zone for UI display
   */
  async getDetectedLocationZone(): Promise<string> {
    return await bookingLocationService.getLocationZoneForBooking();
  }

  /**
   * Clear location cache (force re-detection)
   */
  clearLocationCache(): void {
    bookingLocationService.clearCache();
  }

  // ============================================================================
  // PRIVATE METHODS - INTERNAL ENGINE LOGIC
  // ============================================================================

  private validateCreateParams(params: CreateBookingParams, derivedCustomerName?: string): BookingEngineResult {
    if (!params.customerId) return { success: false, error: 'Customer ID required' };
    // Skip customerName validation from params since it's derived internally
    // if (!params.customerName) return { success: false, error: 'Customer name required' };
    if (!params.therapistId) return { success: false, error: 'Therapist ID required' };
    if (!params.therapistName) return { success: false, error: 'Therapist name required' };
    if (!params.totalPrice || params.totalPrice <= 0) return { success: false, error: 'Valid price required' };
    if (!params.duration || params.duration <= 0) return { success: false, error: 'Valid duration required' };
    
    // Validate derived customerName instead
    if (!derivedCustomerName || derivedCustomerName.trim() === '') {
      return { success: false, error: 'Unable to determine customer name' };
    }
    
    // Note: locationZone is now auto-detected if not provided, so no validation needed

    return { success: true };
  }

  /**
   * Create booking record using production bookingLifecycleService
   * This ensures compatibility with existing production systems
   */
  private async createDatabaseRecordViaLifecycle(bookingData: BookingEngineData): Promise<BookingEngineResult> {
    try {
      // Map our BookingEngine data to bookingLifecycleService format
      const lifecycleData = {
        userId: bookingData.customerId, // Required by database schema
        customerId: bookingData.customerId,
        customerName: bookingData.customerName,  // ✅ REQUIRED – FIXES ERROR - Pass customerName to nested storage
        customerPhone: bookingData.customerPhone,
        therapistId: bookingData.therapistId,
        therapistName: bookingData.therapistName,  // ✅ REQUIRED – Pass therapistName to nested storage
        businessId: undefined, // Not used in our flow
        businessName: undefined, // Not used in our flow
        providerType: 'therapist' as const,
        serviceType: bookingData.serviceType,
        duration: bookingData.duration,
        locationZone: bookingData.locationZone, // Use the auto-detected or provided zone
        locationCoordinates: bookingData.coordinates,
        bookingType: BookingType.HOME_SERVICE, // Default to home service
        totalPrice: bookingData.totalPrice,
        notes: undefined, // Add if needed later
        therapistStatus: 'available' // Default to available for booking creation
      };

      const result = await bookingLifecycleService.createBooking(lifecycleData);
      return { success: true, data: result };
    } catch (error: any) {
      return { success: false, error: error.message || 'Lifecycle service creation failed' };
    }
  }

  private async createDatabaseRecord(bookingData: BookingEngineData): Promise<BookingEngineResult> {
    try {
      if (!APPWRITE_CONFIG.collections.bookings) {
        throw new Error('Bookings collection not configured');
      }

      // COMPREHENSIVE SCHEMA CLEANUP - Only include accepted database fields
      const record = {
        // Core accepted database schema fields only
        userId: bookingData.customerId,
        status: 'pending',
        serviceDuration: bookingData.duration,
        price: bookingData.totalPrice,
        location: bookingData.locationZone,
        customerName: bookingData.customerName, // 🔴 REQUIRED — THIS FIXES THE ERROR
        userName: bookingData.customerName, // 🔴 FIX: Map customerName to userName for consistency
        customerWhatsApp: bookingData.customerPhone,
        
        // ALL other data moved to nested admin-accessible objects
        customerDetails: JSON.stringify({
          id: bookingData.customerId,
          name: bookingData.customerName,
          phone: bookingData.customerPhone
        }),
        therapistDetails: JSON.stringify({
          id: bookingData.therapistId,
          name: bookingData.therapistName
        }),
        serviceDetails: JSON.stringify({
          type: bookingData.serviceType,
          duration: bookingData.duration,
          locationZone: bookingData.locationZone,
          coordinates: bookingData.coordinates
        }),
        pricing: JSON.stringify({
          total: bookingData.totalPrice,
          commission: bookingData.adminCommission,
          payout: bookingData.providerPayout
        }),
        booking: JSON.stringify({
          id: bookingData.bookingId,
          state: bookingData.state,
          createdAt: bookingData.createdAt,
          updatedAt: bookingData.updatedAt,
          responseDeadline: bookingData.responseDeadline,
          stateHistory: bookingData.stateHistory
        })
      };

      const result = await databases.createDocument(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.bookings,
        ID.unique(),
        record
      );

      return { success: true, data: result };
    } catch (error: any) {
      return { success: false, error: error.message || 'Database creation failed' };
    }
  }

  private async updateDatabaseRecord(bookingId: string, updates: any): Promise<BookingEngineResult> {
    try {
      const booking = this.activeBookings.get(bookingId);
      if (!booking?.documentId) {
        return { success: false, error: 'Booking document ID not found' };
      }

      const result = await databases.updateDocument(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.bookings!,
        booking.documentId,
        {
          ...updates,
          updatedAt: new Date().toISOString(),
          stateHistory: JSON.stringify(booking.stateHistory)
        }
      );

      return { success: true, data: result };
    } catch (error: any) {
      return { success: false, error: error.message || 'Database update failed' };
    }
  }

  private transitionState(
    booking: BookingEngineData, 
    newState: BookingState, 
    reason: string, 
    triggeredBy: 'customer' | 'therapist' | 'system' | 'admin'
  ): void {
    const transition: BookingStateTransition = {
      fromState: booking.state,
      toState: newState,
      timestamp: new Date().toISOString(),
      reason,
      triggeredBy
    };

    booking.stateHistory.push(transition);
    booking.state = newState;
    booking.updatedAt = new Date().toISOString();

    this.log('STATE_TRANSITION', {
      bookingId: booking.bookingId,
      fromState: transition.fromState,
      toState: transition.toState,
      reason,
      triggeredBy
    });
  }

  private scheduleExpiration(bookingId: string, deadline: Date): void {
    const timeToExpire = deadline.getTime() - Date.now();
    
    setTimeout(() => {
      const booking = this.activeBookings.get(bookingId);
      if (booking && booking.state === BookingState.PENDING_THERAPIST) {
        this.transitionState(booking, BookingState.EXPIRED, '5-minute response deadline exceeded', 'system');
        
        this.log('BOOKING_EXPIRED', {
          bookingId,
          expiredAt: new Date().toISOString(),
          originalDeadline: deadline.toISOString()
        });
      }
    }, Math.max(timeToExpire, 0));
  }

  private failWithError(bookingId: string, errorCode: string, errorMessage: string): BookingEngineResult {
    this.log('BOOKING_ENGINE_ERROR', {
      bookingId,
      errorCode,
      errorMessage,
      timestamp: new Date().toISOString()
    });

    const booking = this.activeBookings.get(bookingId);
    if (booking) {
      booking.lastError = `${errorCode}: ${errorMessage}`;
      booking.errorCount += 1;
      this.transitionState(booking, BookingState.FAILED, errorMessage, 'system');
    }

    return {
      success: false,
      error: errorMessage,
      bookingId,
      state: BookingState.FAILED
    };
  }

  private log(action: string, data: any): void {
    const logEntry = {
      timestamp: new Date().toISOString(),
      action,
      data,
      source: 'BookingEngine'
    };

    console.log(`🔒 [BookingEngine] ${action}:`, data);
    
    // TODO: Send to production logging service
    // logService.send(logEntry);
  }
}

// ============================================================================
// SINGLETON EXPORT - SINGLE SOURCE OF TRUTH
// ============================================================================

export const BookingEngine = new BookingEngineClass();

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type { CreateBookingParams, BookingEngineResult, BookingEngineData, BookingStateTransition };