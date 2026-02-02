/**
 * 🔒 BOOKING SYSTEM ISOLATION - TIER-1 PRODUCTION IMPLEMENTATION
 * 
 * ⚠️ DEPRECATED - STEP 20 LEGACY CLEANUP
 * 
 * This file is superseded by the V2 core architecture:
 * - New Authority: `/src_v2/core/booking/createBooking.ts`
 * - With Step 19 observability logging
 * - Protected by Step 18 architecture lockdown
 * 
 * STATUS: Preserved as emergency fallback only
 * DO NOT USE for new development - use V2 core instead
 * 
 * MIGRATION PATH:
 * ```typescript
 * // OLD (deprecated)
 * import { BookingIsolation } from '../booking/BookingIsolation';
 * 
 * // NEW (use this)
 * import { createBooking } from '../src_v2/core/booking';
 * ```
 * 
 * FINAL ARCHITECTURE: Complete defensive isolation of booking flow and chat system.
 * Based on verified Appwrite schema and production requirements.
 * 
 * ISOLATION PRINCIPLES:
 * ✅ Defensive boundaries at all integration points
 * ✅ Schema validation before any Appwrite calls
 * ✅ Navigation protection during booking process
 * ✅ Error isolation and recovery mechanisms
 * ✅ Single source of truth for booking contracts
 */

import { bookingGuard } from './BookingSystemGuard';
import { DEFAULT_BOOKING_STATUS } from '../constants/bookingStatus';
import { APPWRITE_CONFIG } from '../lib/appwrite/config';

// ===== ISOLATION LAYER 1: SCHEMA VALIDATION =====
export class BookingSchemaIsolation {
  /**
   * Validates and transforms any booking data to verified Appwrite schema
   * This is the ONLY function that should prepare data for Appwrite
   */
  static validateAndTransform(data: any): {
    valid: boolean;
    appwriteDoc?: any;
    errors?: string[];
  } {
    const errors: string[] = [];
    
    // Required field validation with multiple fallback sources
    const requiredMappings = {
      userId: data.userId || data.customerId || 'anonymous',
      status: data.status || DEFAULT_BOOKING_STATUS,
      therapistId: data.therapistId,
      serviceDuration: (data.serviceDuration || data.duration?.toString() || '60'),
      location: data.location || data.address || data.locationZone || data.hotelVillaName,
      price: data.price || data.totalPrice,
      customerName: data.customerName,
      customerWhatsApp: data.customerWhatsApp || data.customerPhone
    };
    
    // Check for missing required fields
    Object.entries(requiredMappings).forEach(([key, value]) => {
      if (!value || value === '' || value === null || value === undefined) {
        errors.push(`Missing required field: ${key}`);
      }
    });
    
    if (errors.length > 0) {
      return { valid: false, errors };
    }
    
    // Validate enum constraints
    const validStatuses = ['idle', 'registering', 'searching', 'pending_accept', 'active', 'cancelled', 'completed'];
    if (!validStatuses.includes(requiredMappings.status)) {
      errors.push(`Invalid status: ${requiredMappings.status}. Must be one of: ${validStatuses.join(', ')}`);
    }
    
    const validDurations = ['60', '90', '120'];
    if (!validDurations.includes(requiredMappings.serviceDuration)) {
      errors.push(`Invalid serviceDuration: ${requiredMappings.serviceDuration}. Must be one of: ${validDurations.join(', ')}`);
    }
    
    if (errors.length > 0) {
      return { valid: false, errors };
    }
    
    // Create validated Appwrite document
    const appwriteDoc = {
      // REQUIRED FIELDS (verified schema)
      ...requiredMappings,
      
      // OPTIONAL FIELDS (verified accepted)
      duration: data.duration, // Keep number version for compatibility
      locationType: data.locationType,
      address: data.address,
      massageFor: data.massageFor,
      bookingId: data.bookingId || `BK${Date.now()}`,
      serviceType: data.serviceType || 'Traditional Massage'
    };
    
    return { valid: true, appwriteDoc };
  }
}

// ===== ISOLATION LAYER 2: APPWRITE CLIENT WRAPPER =====
export class IsolatedAppwriteClient {
  private static async getValidatedConfig() {
    // Verify configuration exists
    if (!APPWRITE_CONFIG.collections.bookings) {
      throw new Error('ISOLATION FAILURE: Booking collection not configured');
    }
    
    if (APPWRITE_CONFIG.collections.bookings !== 'bookings') {
      console.warn('⚠️ ISOLATION WARNING: Collection ID mismatch. Expected "bookings", got:', APPWRITE_CONFIG.collections.bookings);
    }
    
    return APPWRITE_CONFIG;
  }
  
  static async createBooking(data: any): Promise<any> {
    try {
      // Layer 1: Schema validation
      const validation = BookingSchemaIsolation.validateAndTransform(data);
      
      if (!validation.valid) {
        throw new Error(`Schema validation failed: ${validation.errors?.join(', ')}`);
      }
      
      // Layer 2: Configuration validation
      const config = await this.getValidatedConfig();
      
      // Layer 3: Defensive Appwrite call
      const { databases, ID } = await import('../lib/appwrite');
      
      const document = await databases.createDocument(
        config.databaseId,
        config.collections.bookings,
        ID.unique(),
        validation.appwriteDoc
      );
      
      console.log('✅ ISOLATED BOOKING CREATED:', document.$id);
      return document;
      
    } catch (error) {
      console.error('❌ ISOLATED BOOKING FAILED:', error);
      throw new Error(`Isolated booking creation failed: ${error.message}`);
    }
  }
}

// ===== ISOLATION LAYER 3: NAVIGATION PROTECTION =====
export class NavigationIsolation {
  private static originalNavigationFunctions: any = {};
  private static protectionActive = false;
  
  static protect(): () => void {
    if (this.protectionActive) {
      console.warn('⚠️ Navigation protection already active');
      return () => {}; // Return no-op cleanup
    }
    
    this.protectionActive = true;
    console.log('🔒 [NAVIGATION ISOLATION] Activating protection');
    
    // Store original functions
    this.originalNavigationFunctions = {
      setPage: (window as any).__appSetPage,
      dispatchEvent: window.dispatchEvent.bind(window),
      pushState: window.history.pushState.bind(window.history),
      replaceState: window.history.replaceState.bind(window.history)
    };
    
    // Override navigation functions
    (window as any).__appSetPage = (page: string) => {
      console.log('🚫 [NAVIGATION ISOLATION] Blocked navigation to:', page);
      return false;
    };
    
    window.dispatchEvent = (event: Event) => {
      if (event.type === 'navigateToLanding' || event.type === 'popstate') {
        console.log('🚫 [NAVIGATION ISOLATION] Blocked navigation event:', event.type);
        return true;
      }
      return this.originalNavigationFunctions.dispatchEvent(event);
    };
    
    window.history.pushState = (...args) => {
      console.log('🚫 [NAVIGATION ISOLATION] Blocked history.pushState');
      return;
    };
    
    window.history.replaceState = (...args) => {
      console.log('🚫 [NAVIGATION ISOLATION] Blocked history.replaceState');  
      return;
    };
    
    // Return cleanup function
    return () => {
      console.log('✅ [NAVIGATION ISOLATION] Restoring navigation');
      this.protectionActive = false;
      
      (window as any).__appSetPage = this.originalNavigationFunctions.setPage;
      window.dispatchEvent = this.originalNavigationFunctions.dispatchEvent;
      window.history.pushState = this.originalNavigationFunctions.pushState;
      window.history.replaceState = this.originalNavigationFunctions.replaceState;
    };
  }
}

// ===== ISOLATION LAYER 4: INTEGRATED BOOKING SERVICE =====
export class IsolatedBookingService {
  /**
   * Complete isolated booking creation with all protection layers
   */
  static async createBooking(data: any): Promise<{
    success: boolean;
    document?: any;
    error?: string;
  }> {
    const navigationCleanup = NavigationIsolation.protect();
    
    try {
      // Verify booking guard
      if (!bookingGuard.verifyAppwriteConfig()) {
        throw new Error('Appwrite configuration verification failed');
      }
      
      console.log('🔒 [ISOLATED BOOKING] Starting protected booking creation');
      
      // Create booking through isolation layers
      const document = await IsolatedAppwriteClient.createBooking(data);
      
      console.log('✅ [ISOLATED BOOKING] Success:', document.$id);
      
      return {
        success: true,
        document
      };
      
    } catch (error) {
      console.error('❌ [ISOLATED BOOKING] Failed:', error);
      
      return {
        success: false,
        error: error.message
      };
      
    } finally {
      // Always restore navigation
      navigationCleanup();
    }
  }
}

// ===== MAIN ISOLATION INTERFACE =====
export const BookingIsolation = {
  SchemaValidation: BookingSchemaIsolation,
  AppwriteClient: IsolatedAppwriteClient,
  NavigationProtection: NavigationIsolation,
  BookingService: IsolatedBookingService
};

export default BookingIsolation;