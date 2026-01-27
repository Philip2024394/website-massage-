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
import type { Booking } from '../../../types';

const DATABASE_ID = APPWRITE_CONFIG.databaseId;
const BOOKINGS_COLLECTION_ID = APPWRITE_CONFIG.collections.bookings;

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
  async createBooking(bookingData: Omit<Booking, '$id' | '$createdAt' | 'bookingId'>): Promise<Booking> {
    console.log('📦 [APPWRITE] Creating booking in Appwrite database...');
    console.log('📦 [APPWRITE] Booking data:', bookingData);

    try {
      // 🔒 Step 1: Validate all required fields
      validateBookingData(bookingData);
      console.log('✅ [APPWRITE] Validation passed');

      // 🔒 Step 2: Check for existing pending bookings for this therapist (prevent duplicates)
      const existingBookings = await databases.listDocuments(
        DATABASE_ID,
        BOOKINGS_COLLECTION_ID,
        [
          Query.equal('therapistId', bookingData.therapistId),
          Query.equal('status', 'pending'),
          Query.limit(5)
        ]
      );

      // Filter out expired bookings
      const now = new Date();
      const activePendingBookings = existingBookings.documents.filter((doc: any) => {
        const expiresAt = new Date(doc.expiresAt);
        return expiresAt > now;
      });

      if (activePendingBookings.length > 0) {
        console.warn('⚠️ [APPWRITE] Active pending booking exists:', activePendingBookings[0].bookingId);
        console.warn('⚠️ [APPWRITE] Preventing duplicate booking creation');
        throw new Error('A pending booking already exists for this therapist. Please wait for it to expire or be processed.');
      }

      console.log('✅ [APPWRITE] No duplicate bookings found');

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
        status: 'pending',
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
      console.log('📤 [APPWRITE] Database:', DATABASE_ID);
      console.log('📤 [APPWRITE] Collection:', BOOKINGS_COLLECTION_ID);

      // 🔒 Step 5: Create document in Appwrite (single source of truth)
      const createdDoc = await databases.createDocument(
        DATABASE_ID,
        BOOKINGS_COLLECTION_ID,
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
      } as Booking;

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
        DATABASE_ID,
        BOOKINGS_COLLECTION_ID,
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
        DATABASE_ID,
        BOOKINGS_COLLECTION_ID,
        [
          Query.equal('therapistId', therapistId),
          Query.equal('status', 'pending'),
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

      // 🔒 Step 2: Validate booking state
      if (booking.status !== 'pending') {
        console.warn('⚠️ [APPWRITE] Booking already processed:', booking.status);
        return booking;
      }

      // 🔒 Step 3: Check if expired
      const now = new Date();
      const expiresAt = new Date(booking.expiresAt);
      if (expiresAt < now) {
        throw new Error('Cannot accept expired booking');
      }

      // 🔒 Step 4: Update booking status in Appwrite
      const updatedDoc = await databases.updateDocument(
        DATABASE_ID,
        BOOKINGS_COLLECTION_ID,
        booking.$id,
        {
          status: 'confirmed',
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
        DATABASE_ID,
        BOOKINGS_COLLECTION_ID,
        booking.$id,
        {
          status: 'rejected',
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
        `databases.${DATABASE_ID}.collections.${BOOKINGS_COLLECTION_ID}.documents`,
        (response) => {
          console.log('🔔 [APPWRITE REALTIME] Event received:', response.events[0]);
          
          const booking = response.payload as Booking;
          
          // Filter for this therapist's bookings
          if (booking.therapistId === therapistId && booking.status === 'pending') {
            // Check if not expired
            const expiresAt = new Date(booking.expiresAt);
            if (expiresAt > new Date()) {
              console.log('✅ [APPWRITE REALTIME] New booking for this therapist!');
              callback(booking);
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
