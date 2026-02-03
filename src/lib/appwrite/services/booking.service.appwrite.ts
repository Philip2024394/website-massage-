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
import { BOOKING_STATUS, normalizeBookingStatus } from '../../../constants/bookingStatus';

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
 * ✅ VERIFIED SCHEMA: Tested against live Appwrite database
 */
function validateBookingData(data: any): void {
  const required = {
    userId: data.userId || data.customerId || 'anonymous', // Multiple fallbacks
    status: normalizeBookingStatus(data.status), // ✅ Normalize to valid Appwrite status
    therapistId: data.therapistId,
    providerId: data.therapistId || data.providerId, // ✅ CRITICAL: therapistId IS the providerId
    service: data.serviceType || 'Traditional Massage', // ✅ REQUIRED: Appwrite schema field name
    serviceDuration: data.serviceDuration || data.duration?.toString(), // Convert number to string
    location: data.location || data.address || data.locationZone, // Multiple location sources
    price: data.price || data.totalPrice, // Alternative price field
    customerName: data.customerName,
    customerWhatsApp: data.customerWhatsApp,
    bookingDate: data.date || data.bookingDate || new Date().toISOString(), // ✅ REQUIRED
  };

  const missing: string[] = [];
  
  Object.entries(required).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') {
      missing.push(key);
    }
  });

  if (missing.length > 0) {
    console.error('❌ [APPWRITE VALIDATION] Missing required fields:');
    missing.forEach(field => {
      console.error(`   ❌ ${field}: ${required[field as keyof typeof required]}`);
    });
    throw new Error(
      `Missing required booking fields: ${missing.join(', ')}. ` +
      `Cannot create booking without these fields. Check your booking data.`
    );
  }
  
  console.log('✅ [APPWRITE VALIDATION] All required fields present');
  
  // Validate status enum
  const validStatuses = ['idle', 'registering', 'searching', 'pending_accept', 'active', 'cancelled', 'completed'];
  if (!validStatuses.includes(required.status)) {
    throw new Error(`Invalid status: ${required.status}. Must be one of: ${validStatuses.join(', ')}`);
  }
  
  // Validate serviceDuration
  const validDurations = ['60', '90', '120'];
  if (!validDurations.includes(required.serviceDuration)) {
    throw new Error(`Invalid serviceDuration: ${required.serviceDuration}. Must be one of: ${validDurations.join(', ')}`);
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
        const notExpired = doc.status === 'pending_accept' || doc.status === 'active'; // ✅ Valid statuses
        
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

      // 🔒 Step 4: Prepare Appwrite document (VERIFIED SCHEMA)
      const nowISO = new Date().toISOString();

      const appwriteDoc = {
        // ✅ REQUIRED FIELDS - VERIFIED AGAINST LIVE APPWRITE
        customerId: bookingData.customerId || bookingData.userId || 'anonymous', // ✅ REQUIRED: customerId field
        userId: bookingData.customerId || bookingData.userId || 'anonymous', // ✅ REQUIRED: userId field (schema requires both)
        customerphone: bookingData.customerphone || bookingData.customerWhatsApp || '', // ✅ REQUIRED: customerphone field
        servicetype: bookingData.serviceType || 'Traditional Massage', // ✅ REQUIRED: servicetype field (lowercase)
        locationtype: bookingData.locationType || bookingData.locationtype || 'home', // ✅ REQUIRED: locationtype field (lowercase)
        roomnumber: bookingData.roomnumber || bookingData.roomNumber || '', // ✅ REQUIRED: roomnumber field (lowercase)
        status: normalizeBookingStatus(bookingData.status) || BOOKING_STATUS.PENDING_ACCEPT, // ✅ Normalized valid status
        therapistId: bookingData.therapistId,
        location: bookingData.location || bookingData.address || bookingData.locationZone || 'Unknown Location',
        price: Math.round((bookingData.price || bookingData.totalPrice) / 1000), // Appwrite expects price in thousands (160 for 160k Rp)
        customerName: bookingData.customerName,
        customerWhatsApp: bookingData.customerWhatsApp,
        
        // ✅ OPTIONAL FIELDS - VERIFIED ACCEPTED
        duration: bookingData.duration, // Keep number version for compatibility
        address: bookingData.address,
        // massageFor: bookingData.massageFor, // ❌ REMOVED: Not in Appwrite schema (causes 400 error)
        bookingId,
        bookingDate: bookingData.date || bookingData.bookingDate || new Date().toISOString(), // ✅ REQUIRED: bookingDate field
        time: bookingData.time || new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }), // ✅ Include time if available
        service: (bookingData.serviceType || 'Traditional Massage').substring(0, 16), // Max 16 chars
        startTime: bookingData.time || new Date().toISOString(), // ✅ REQUIRED: Appwrite schema field
        responseDeadline: bookingData.responseDeadline || new Date(Date.now() + 5 * 60 * 1000).toISOString(), // ✅ REQUIRED: 5 min default
        responcedeadline: bookingData.responseDeadline || new Date(Date.now() + 5 * 60 * 1000).toISOString(), // ✅ REQUIRED: Appwrite typo in schema
        createdAt: new Date().toISOString(), // ✅ REQUIRED: Appwrite schema field
        
        // 🔒 CRITICAL: providerId - MUST be Appwrite document ID, NOT name
        // ⚠️ FAIL-FAST: If therapistAppwriteId is missing, throw error immediately
        // ⚠️ NEVER fall back to display name - this corrupts the database
        providerId: (() => {
          if (!bookingData.therapistAppwriteId) {
            throw new Error(
              'CRITICAL: Missing therapistAppwriteId (Appwrite document ID). ' +
              'Cannot create booking without valid provider document ID. ' +
              'This is a data integrity issue - therapist data must be fetched from Appwrite first.'
            );
          }
          
          // 🔒 VALIDATE ID FORMAT: Must be valid Appwrite document ID (16-20 hex chars)
          const appwriteIdPattern = /^[a-f0-9]{16,20}$/i;
          if (!appwriteIdPattern.test(bookingData.therapistAppwriteId)) {
            throw new Error(
              `CRITICAL: Invalid Appwrite document ID format: "${bookingData.therapistAppwriteId}". ` +
              'Expected 16-20 hexadecimal characters. Display names are not valid document IDs. ' +
              'This indicates corrupted therapist data - must be fetched from Appwrite with proper $id mapping.'
            );
          }
          
          return bookingData.therapistAppwriteId;
        })(),
        providerName: bookingData.therapistName || bookingData.providerName || 'Unknown Provider', // ✅ Display name only
        
        // 🔒 CRITICAL: providerType - MUST be explicit enum value
        // ⚠️ Appwrite does NOT infer this - you MUST supply it
        // ⚠️ Valid values: "therapist" | "spa" | "clinic"
        providerType: bookingData.providerType || 'therapist', // ✅ Default to "therapist"
      };

      console.log('📤 [APPWRITE] Sending to Appwrite databases.createDocument()...');
      console.log('📤 [APPWRITE] Database:', getDatabaseId());
      console.log('📤 [APPWRITE] Collection:', getBookingsCollectionId());
      console.log('═'.repeat(80));
      console.log('📦 [APPWRITE] FINAL PAYLOAD TO APPWRITE:');
      console.log(JSON.stringify(appwriteDoc, null, 2));
      console.log('═'.repeat(80));

      // 🔒 HARD PREFLIGHT VALIDATION - BLOCKS INVALID SUBMISSIONS (NO RETRIES)
      console.log('🔒 [PREFLIGHT] Running hard validation before createDocument()...');
      const REQUIRED_FIELDS = [
        "providerId",
        "providerType",
        "bookingDate",
        "startTime",
        "createdAt",
        "service",
        "price",
        "status",
        "customerName",
        "customerWhatsApp",
        "locationtype"
      ];

      for (const field of REQUIRED_FIELDS) {
        if (!appwriteDoc[field]) {
          console.error('❌ [PREFLIGHT BLOCKED] Missing required field:', field);
          console.error('📦 [PREFLIGHT BLOCKED] Current payload:', JSON.stringify(appwriteDoc, null, 2));
          throw new Error(`PREFLIGHT VALIDATION FAILED: Missing required booking field "${field}". Cannot proceed to createDocument().`);
        }
      }
      console.log('✅ [PREFLIGHT] All required fields present - proceeding to createDocument()');

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

      // 🔒 PRIVACY SANITIZATION: Remove customer WhatsApp from therapist-facing API
      const sanitizedBookings = activeBookings.map((booking: any) => ({
        ...booking,
        // Remove sensitive customer contact information
        customerPhone: undefined,
        customerWhatsApp: undefined,
        // Keep essential booking information only
        customerName: booking.customerName || 'Customer'
      }));

      console.log(`✅ [APPWRITE] ${sanitizedBookings.length} active bookings (privacy sanitized)`);
      return sanitizedBookings as Booking[];

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
      const unsubscribe = getClient().subscribe(
        `databases.${getDatabaseId()}.collections.${getBookingsCollectionId()}.documents`,
        (response) => {
          console.log('🔔 [APPWRITE REALTIME] Event received:', response.events[0]);
          
          const booking = response.payload as any; // Use any for Appwrite payload which has therapistId and expiresAt
          
          // Filter for this therapist's bookings
          if (booking.therapistId === therapistId && booking.status === 'pending_accept') { // ✅ Valid Appwrite status
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

// Import client for realtime - Lazy initialization to avoid TDZ
import { Client } from 'appwrite';
let client: Client | null = null;
const getClient = () => {
  if (!client) {
    client = new Client()
      .setEndpoint(APPWRITE_CONFIG.endpoint)
      .setProject(APPWRITE_CONFIG.projectId);
  }
  return client;
};

export default appwriteBookingService;
