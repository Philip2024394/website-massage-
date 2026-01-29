/**
 * 🔒 APPWRITE BOOKING SERVICE - PRODUCTION GRADE
 * 
 * Single source of truth for all bookings.
 * Replaces localStorage implementation.
 * 
 * ⚠️ DO NOT MODIFY WITHOUT APPROVAL
 * This is core booking infrastructure.
 */

import { databases, APPWRITE_CONFIG } from '../config';
import { ID, Query } from 'appwrite';
import type { Booking, BookingStatus } from '../../../types';

// Lazy getters to avoid TDZ errors during module initialization
const getDatabaseId = () => APPWRITE_CONFIG.databaseId;
const getBookingsCollectionId = () => APPWRITE_CONFIG.collections.bookings;

/**
 * Generate unique booking ID
 */
function generateBookingId(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `BK${timestamp}${random}`.toUpperCase();
}

/**
 * Validate required booking fields before creation
 * 🔒 CRITICAL: Prevents invalid bookings from reaching Appwrite
 */
function validateBookingData(data: any): void {
  const required = {
    therapistId: data.therapistId,
    therapistName: data.therapistName,
    customerName: data.customerName,
    customerWhatsApp: data.customerWhatsApp,
    duration: data.duration,
    price: data.price,
    locationType: data.locationType,
    address: data.address,
    massageFor: data.massageFor,
  };

  const missing: string[] = [];
  
  Object.entries(required).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') {
      missing.push(key);
    }
  });

  // 🔒 Special validation: customerName cannot be 'Guest'
  if (data.customerName === 'Guest') {
    throw new Error('customerName cannot be "Guest". Real name required.');
  }

  if (missing.length > 0) {
    throw new Error(`Missing required fields: ${missing.join(', ')}`);
  }

  // Validate duration
  if (![60, 90, 120].includes(data.duration)) {
    throw new Error(`Invalid duration: ${data.duration}. Must be 60, 90, or 120.`);
  }

  // Validate locationType
  if (!['home', 'hotel', 'villa'].includes(data.locationType)) {
    throw new Error(`Invalid locationType: ${data.locationType}`);
  }

  // Validate massageFor
  if (!['male', 'female', 'children'].includes(data.massageFor)) {
    throw new Error(`Invalid massageFor: ${data.massageFor}`);
  }
}

/**
 * Appwrite Booking Service
 * 🔒 Production-grade implementation
 */
export const appwriteBookingService = {
  /**
   * Create new booking in Appwrite
   * 🔒 CRITICAL: This is the ONLY way to create bookings
   * 
   * @returns Booking document from Appwrite with $id and $createdAt
   */
  async createBooking(bookingData: any): Promise<Booking> {
    console.log('📦 [APPWRITE] Creating booking in Appwrite database...');
    console.log('📦 [APPWRITE] Booking data:', bookingData);

    try {
      // 🔒 Step 1: Validate all required fields
      validateBookingData(bookingData);
      console.log('✅ [APPWRITE] Validation passed');

      // 🔒 RULE #1: IDEMPOTENT BOOKING CREATION
      // Prevent double bookings from clicks, retries, UI bugs
      // Check: Same customer + same time slot + same therapist within 10 minutes
      const now = new Date();
      const lookbackTime = new Date(now.getTime() - 10 * 60 * 1000); // 10 minutes ago

      console.log('🔒 [IDEMPOTENCY CHECK] Searching for duplicates:');
      console.log('   - Customer:', bookingData.customerWhatsApp);
      console.log('   - Therapist:', bookingData.therapistId);
      console.log('   - Time window: Last 10 minutes');

      // Query all recent bookings for this therapist
      const recentBookings = await databases.listDocuments(
        getDatabaseId(),
        getBookingsCollectionId(),
        [
          Query.equal('therapistId', bookingData.therapistId),
          Query.limit(20)
        ]
      );

      // Filter for duplicates: same customer + same time slot
      const duplicates = recentBookings.documents.filter((doc: any) => {
        const docCreatedAt = new Date(doc.$createdAt);
        const isRecent = docCreatedAt > lookbackTime;
        const sameCustomer = doc.customerWhatsApp === bookingData.customerWhatsApp;
        const sameTime = doc.time === bookingData.time && doc.date === bookingData.date;
        const notExpired = doc.status === 'Pending' || doc.status === 'Confirmed';
        
        return isRecent && sameCustomer && sameTime && notExpired;
      });

      if (duplicates.length > 0) {
        console.error('❌ [IDEMPOTENCY VIOLATION] Duplicate booking detected!');
        console.error('   - Existing booking:', duplicates[0].bookingId);
        console.error('   - Created:', new Date(duplicates[0].$createdAt).toISOString());
        console.error('   - Status:', duplicates[0].status);
        throw new Error(
          `Duplicate booking detected. A booking for this customer with the same therapist and time already exists (${duplicates[0].bookingId}). ` +
          `This prevents accidental double bookings from UI bugs or retries.`
        );
      }

      console.log('✅ [IDEMPOTENCY CHECK] No duplicates found - proceeding with creation');

      // 🔒 Step 3: Generate booking ID (only once)
      const bookingId = generateBookingId();
      console.log('✅ [APPWRITE] Generated booking ID:', bookingId);

      // 🔒 Step 4: Prepare Appwrite document
      const nowISO = new Date().toISOString();
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString(); // 5 minutes

      const appwriteDoc = {
        bookingId,
        
        // Therapist info
        therapistId: bookingData.therapistId,
        therapistName: bookingData.therapistName,
        therapistType: 'therapist',
        
        // Customer info (REQUIRED)
        customerId: bookingData.customerId || null,
        customerName: bookingData.customerName, // ✅ VALIDATED: Not empty, not 'Guest'
        
        // 🔒 PRIVACY RULE: Customer WhatsApp/Phone stored in database
        // These fields are ONLY accessible to admin dashboard for support purposes
        // Therapists and places do NOT have access to customer WhatsApp numbers
        // All communication must go through in-app chat system
        customerPhone: bookingData.customerWhatsApp,
        customerWhatsApp: bookingData.customerWhatsApp,
        
        // Service details
        serviceType: bookingData.serviceType || 'Traditional Massage',
        duration: bookingData.duration,
        price: bookingData.price,
        
        // Location details
        locationType: bookingData.locationType,
        location: bookingData.location || bookingData.address || 'Unknown',
        address: bookingData.address || null,
        roomNumber: bookingData.roomNumber || null,
        
        // Booking metadata
        massageFor: bookingData.massageFor,
        date: bookingData.date || nowISO.split('T')[0],
        time: bookingData.time || new Date().toLocaleTimeString('en-US', { hour12: false }),
        
        // Status & Timing
        status: 'Pending',
        expiresAt, // ⏱️ CRITICAL: 5-minute expiration
        createdAt: nowISO,
        updatedAt: nowISO,
        responseDeadline: expiresAt,
        
        // Optional fields
        notes: bookingData.notes || null,
        discountCode: (bookingData as any).discountCode || null,
        discountPercentage: (bookingData as any).discountPercentage || null,
        alternativeSearch: false,
      };

      console.log('📤 [APPWRITE] Sending to Appwrite databases.createDocument()...');
      console.log('📤 [APPWRITE] Database:', getDatabaseId());
      console.log('📤 [APPWRITE] Collection:', getBookingsCollectionId());

      // 🔒 Step 5: Create document in Appwrite (single source of truth)
      const createdDoc = await databases.createDocument(
        getDatabaseId(),
        getBookingsCollectionId(),
        ID.unique(), // Let Appwrite generate document ID
        appwriteDoc
      );

      console.log('✅ [APPWRITE] Booking created successfully!');
      console.log('✅ [APPWRITE] Document ID:', createdDoc.$id);
      console.log('✅ [APPWRITE] Booking ID:', createdDoc.bookingId);
      console.log('✅ [APPWRITE] Status:', createdDoc.status);
      console.log('✅ [APPWRITE] Expires at:', createdDoc.expiresAt);

      // Return with Appwrite metadata
      return {
        ...appwriteDoc,
        $id: createdDoc.$id,
        $createdAt: createdDoc.$createdAt,
      } as unknown as Booking;

    } catch (error: any) {
      console.error('❌ [APPWRITE] Booking creation failed:', error);
      console.error('❌ [APPWRITE] Error message:', error.message);
      console.error('❌ [APPWRITE] Error code:', error.code);
      throw new Error(`Appwrite booking creation failed: ${error.message}`);
    }
  },

  /**
   * Get booking by ID from Appwrite
   */
  async getBookingById(bookingId: string): Promise<Booking | null> {
    try {
      console.log('🔍 [APPWRITE] Fetching booking:', bookingId);
      
      const response = await databases.listDocuments(
        getDatabaseId(),
        getBookingsCollectionId(),
        [
          Query.equal('bookingId', bookingId),
          Query.limit(1)
        ]
      );

      if (response.documents.length === 0) {
        console.log('⚠️ [APPWRITE] Booking not found:', bookingId);
        return null;
      }

      console.log('✅ [APPWRITE] Booking found:', response.documents[0].bookingId);
      return response.documents[0] as Booking;

    } catch (error: any) {
      console.error('❌ [APPWRITE] Failed to fetch booking:', error);
      throw error;
    }
  },

  /**
   * List bookings for therapist from Appwrite
   * 🔒 CRITICAL: Used by therapist dashboard
   */
  async listBookingsForTherapist(therapistId: string): Promise<Booking[]> {
    try {
      console.log('🔍 [APPWRITE] Listing bookings for therapist:', therapistId);
      
      const response = await databases.listDocuments(
        getDatabaseId(),
        getBookingsCollectionId(),
        [
          Query.equal('therapistId', therapistId),
          Query.equal('status', 'Pending'),
          Query.orderDesc('$createdAt'),
          Query.limit(50)
        ]
      );

      console.log(`✅ [APPWRITE] Found ${response.documents.length} pending bookings`);
      
      // Filter out expired bookings on client side
      const now = new Date();
      const activeBookings = response.documents.filter((doc: any) => {
        const expiresAt = new Date(doc.expiresAt);
        return expiresAt > now;
      });

      console.log(`✅ [APPWRITE] ${activeBookings.length} active (non-expired) bookings`);
      return activeBookings as Booking[];

    } catch (error: any) {
      console.error('❌ [APPWRITE] Failed to list bookings:', error);
      throw error;
    }
  },

  /**
   * Accept booking (therapist action)
   * 🔒 CRITICAL: Updates status to 'confirmed'
   */
  async acceptBooking(bookingId: string, therapistId: string, therapistName: string): Promise<Booking> {
    try {
      console.log('✅ [APPWRITE] Accepting booking:', bookingId);
      console.log('✅ [APPWRITE] Therapist:', therapistId, therapistName);

      // 🔒 Step 1: Fetch current booking
      const booking = await this.getBookingById(bookingId);
      
      if (!booking) {
        throw new Error('Booking not found');
      }

      // 🔒 RULE #3: THERAPIST AUTHORIZATION CHECK
      // Verify the therapist making the request matches the booking's assigned therapist
      // This prevents unauthorized therapists from accepting other therapists' bookings
      console.log('🔒 [AUTHORIZATION] Verifying therapist identity:');
      console.log('   - Requesting therapist:', therapistId);
      console.log('   - Booking assigned to:', booking.therapistId);
      
      if (booking.therapistId !== therapistId) {
        console.error('❌ [AUTHORIZATION] Therapist mismatch detected!');
        console.error('   - Requesting therapist:', therapistId, '(' + therapistName + ')');
        console.error('   - Booking assigned to:', booking.therapistId, '(' + booking.therapistName + ')');
        console.error('   - Booking ID:', bookingId);
        throw new Error(
          `Authorization failed: This booking is assigned to therapist '${booking.therapistName}' (${booking.therapistId}). ` +
          `You cannot accept bookings assigned to other therapists.`
        );
      }
      
      console.log('✅ [AUTHORIZATION] Therapist identity verified');

      // 🔒 RULE #2: BOOKING STATE MACHINE VALIDATION
      // Only allow valid state transitions to prevent illegal operations
      // Allowed: PENDING → ACCEPTED, PENDING → REJECTED, PENDING → EXPIRED
      // NOT allowed: ACCEPTED → PENDING, COMPLETED → PENDING, etc.
      
      console.log('🔒 [STATE MACHINE] Current status:', booking.status);
      console.log('🔒 [STATE MACHINE] Requested transition: → Confirmed');
      
      const validTransitionsFromStatus: Record<string, string[]> = {
        'Pending': ['Confirmed', 'Cancelled', 'Expired'],
        'Confirmed': ['Completed', 'Cancelled'],
        'Completed': [], // Terminal state
        'Cancelled': [], // Terminal state
        'Expired': []    // Terminal state
      };

      const allowedNextStates = validTransitionsFromStatus[booking.status] || [];
      
      if (!allowedNextStates.includes('Confirmed')) {
        console.error('❌ [STATE MACHINE] Illegal transition rejected!');
        console.error('   - Current state:', booking.status);
        console.error('   - Attempted transition: → Confirmed');
        console.error('   - Allowed transitions:', allowedNextStates);
        throw new Error(
          `Illegal state transition: Cannot move from '${booking.status}' to 'Confirmed'. ` +
          `Allowed transitions: ${allowedNextStates.join(', ') || 'none (terminal state)'}`
        );
      }

      console.log('✅ [STATE MACHINE] Valid transition confirmed');

      // 🔒 RULE #4: TIME VALIDITY CHECK (with logging)
      // Check if booking has expired (soft enforcement for now)
      const now = new Date();
      const expiresAt = new Date(booking.expiresAt);
      
      if (expiresAt < now) {
        const expiredMinutes = Math.floor((now.getTime() - expiresAt.getTime()) / 60000);
        console.error('❌ [TIME VALIDITY] Booking has expired!');
        console.error('   - Expired at:', expiresAt.toISOString());
        console.error('   - Current time:', now.toISOString());
        console.error('   - Expired by:', expiredMinutes, 'minutes');
        console.error('   - Booking ID:', bookingId);
        
        // Hard enforcement: reject expired bookings
        throw new Error(
          `Cannot accept expired booking. Expired ${expiredMinutes} minutes ago at ${expiresAt.toISOString()}`
        );
      }
      
      const remainingMinutes = Math.floor((expiresAt.getTime() - now.getTime()) / 60000);
      console.log('✅ [TIME VALIDITY] Booking is still valid');
      console.log('   - Time remaining:', remainingMinutes, 'minutes');
      console.log('   - Expires at:', expiresAt.toISOString());

      // 🔒 Step 4: Update booking status in Appwrite
      const updatedDoc = await databases.updateDocument(
        getDatabaseId(),
        getBookingsCollectionId(),
        booking.$id,
        {
          status: 'Confirmed',
          acceptedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
      );

      console.log('✅ [APPWRITE] Booking accepted successfully');
      console.log('✅ [APPWRITE] New status:', updatedDoc.status);

      return updatedDoc as Booking;

    } catch (error: any) {
      console.error('❌ [APPWRITE] Failed to accept booking:', error);
      throw error;
    }
  },

  /**
   * Reject booking (therapist action)
   */
  async rejectBooking(bookingId: string): Promise<Booking> {
    try {
      console.log('❌ [APPWRITE] Rejecting booking:', bookingId);

      const booking = await this.getBookingById(bookingId);
      if (!booking) {
        throw new Error('Booking not found');
      }

      const updatedDoc = await databases.updateDocument(
        getDatabaseId(),
        getBookingsCollectionId(),
        booking.$id,
        {
          status: 'Cancelled',
          rejectedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
      );

      console.log('✅ [APPWRITE] Booking rejected');
      return updatedDoc as Booking;

    } catch (error: any) {
      console.error('❌ [APPWRITE] Failed to reject booking:', error);
      throw error;
    }
  },

  /**
   * Subscribe to bookings for therapist using Appwrite Realtime
   * 🔒 CRITICAL: Real-time notifications for therapist dashboard
   */
  subscribeToTherapistBookings(
    therapistId: string,
    callback: (booking: Booking) => void
  ): () => void {
    try {
      console.log('🔔 [APPWRITE REALTIME] Setting up subscription for therapist:', therapistId);

      // Subscribe to bookings collection with filters
      const unsubscribe = client.subscribe(
        `databases.${getDatabaseId()}.collections.${getBookingsCollectionId()}.documents`,
        (response) => {
          console.log('🔔 [APPWRITE REALTIME] Event received:', response.events[0]);
          
          const booking = response.payload as any; // Use any for Appwrite payload which has therapistId and expiresAt
          
          // Filter for this therapist's bookings
          if (booking.therapistId === therapistId && booking.status === 'Pending') {
            // Check if not expired
            const expiresAt = new Date(booking.expiresAt);
            if (expiresAt > new Date()) {
              console.log('✅ [APPWRITE REALTIME] New booking for this therapist!');
              callback(booking as unknown as Booking);
            }
          }
        }
      );

      console.log('✅ [APPWRITE REALTIME] Subscription active');
      return unsubscribe;

    } catch (error) {
      console.error('❌ [APPWRITE REALTIME] Subscription failed:', error);
      // Return no-op function
      return () => {};
    }
  },
};

// Import client for realtime
import { Client } from 'appwrite';
const client = new Client()
  .setEndpoint(APPWRITE_CONFIG.endpoint)
  .setProject(APPWRITE_CONFIG.projectId);

export default appwriteBookingService;
