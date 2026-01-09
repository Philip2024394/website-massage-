/**
 * 🔒 PRODUCTION-GRADE BOOKING LIFECYCLE SERVICE
 * Server-authoritative booking state management with immutable status transitions
 * 
 * Status Flow:
 * PENDING → ACCEPTED → CONFIRMED → COMPLETED (commission applies)
 * PENDING → DECLINED (no commission)
 * PENDING → EXPIRED (no commission)
 * ACCEPTED → DECLINED (no commission)
 * 
 * Only ACCEPTED → COMPLETED bookings count for admin commission (30%)
 */

import { databases, ID, Query } from '../appwrite';
import { APPWRITE_CONFIG } from '../appwrite.config';

// ============================================================================
// IMMUTABLE BOOKING STATUS ENUM
// ============================================================================

export enum BookingLifecycleStatus {
  PENDING = 'PENDING',       // Initial state - waiting for therapist response
  ACCEPTED = 'ACCEPTED',     // Therapist accepted - waiting for customer confirmation
  CONFIRMED = 'CONFIRMED',   // Customer confirmed - booking active
  COMPLETED = 'COMPLETED',   // Service delivered - eligible for commission
  DECLINED = 'DECLINED',     // Therapist declined - excluded from commission
  EXPIRED = 'EXPIRED',       // Timeout - excluded from commission
}

// ============================================================================
// BOOKING TYPE ENUM
// ============================================================================

export enum BookingType {
  BOOK_NOW = 'BOOK_NOW',     // Immediate booking
  SCHEDULED = 'SCHEDULED',   // Future scheduled booking
}

// ============================================================================
// BOOKING RECORD INTERFACE
// ============================================================================

export interface BookingLifecycleRecord {
  // Core identifiers
  $id?: string;
  bookingId: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  
  // Provider info (therapist or business)
  therapistId?: string;
  therapistName?: string;
  businessId?: string;
  businessName?: string;
  providerType: 'therapist' | 'place' | 'facial';
  
  // Service details
  serviceType: string;
  duration: number; // minutes
  locationZone: string;
  locationCoordinates?: {
    lat: number;
    lng: number;
  };
  
  // Booking type and pricing
  bookingType: BookingType;
  totalPrice: number;
  adminCommission: number; // 30% of totalPrice
  providerPayout: number;  // 70% of totalPrice
  
  // Status and timestamps
  bookingStatus: BookingLifecycleStatus;
  createdAt: string;
  pendingAt: string;
  acceptedAt?: string;
  confirmedAt?: string;
  completedAt?: string;
  declinedAt?: string;
  expiredAt?: string;
  
  // Metadata
  declineReason?: string;
  expirationReason?: string;
  notes?: string;
  
  // Tracking
  responseDeadline: string; // ISO timestamp for therapist to respond
  confirmationDeadline?: string; // ISO timestamp for customer to confirm
}

// ============================================================================
// COMMISSION CALCULATION CONSTANTS
// ============================================================================

const ADMIN_COMMISSION_RATE = 0.30; // 30%
const PROVIDER_PAYOUT_RATE = 0.70;  // 70%
const THERAPIST_RESPONSE_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes
const CUSTOMER_CONFIRMATION_TIMEOUT_MS = 1 * 60 * 1000; // 1 minute

// ============================================================================
// VALID STATUS TRANSITIONS (Immutable State Machine)
// ============================================================================

const VALID_TRANSITIONS: Record<BookingLifecycleStatus, BookingLifecycleStatus[]> = {
  [BookingLifecycleStatus.PENDING]: [
    BookingLifecycleStatus.ACCEPTED,
    BookingLifecycleStatus.DECLINED,
    BookingLifecycleStatus.EXPIRED,
  ],
  [BookingLifecycleStatus.ACCEPTED]: [
    BookingLifecycleStatus.CONFIRMED,
    BookingLifecycleStatus.DECLINED,
    BookingLifecycleStatus.EXPIRED,
  ],
  [BookingLifecycleStatus.CONFIRMED]: [
    BookingLifecycleStatus.COMPLETED,
    BookingLifecycleStatus.DECLINED,
  ],
  [BookingLifecycleStatus.COMPLETED]: [], // Terminal state
  [BookingLifecycleStatus.DECLINED]: [],  // Terminal state
  [BookingLifecycleStatus.EXPIRED]: [],   // Terminal state
};

// ============================================================================
// BOOKING LIFECYCLE SERVICE
// ============================================================================

export const bookingLifecycleService = {
  /**
   * Calculate commission based on total price
   */
  calculateCommission(totalPrice: number): { adminCommission: number; providerPayout: number } {
    const adminCommission = Math.round(totalPrice * ADMIN_COMMISSION_RATE);
    const providerPayout = totalPrice - adminCommission;
    return { adminCommission, providerPayout };
  },

  /**
   * Validate status transition
   */
  isValidTransition(currentStatus: BookingLifecycleStatus, newStatus: BookingLifecycleStatus): boolean {
    return VALID_TRANSITIONS[currentStatus]?.includes(newStatus) ?? false;
  },

  /**
   * Create a new booking (PENDING state)
   * Enforces availability rules at API level - NO OVERRIDE ALLOWED
   */
  async createBooking(data: {
    customerId: string;
    customerName: string;
    customerPhone: string;
    therapistId?: string;
    therapistName?: string;
    businessId?: string;
    businessName?: string;
    providerType: 'therapist' | 'place' | 'facial';
    serviceType: string;
    duration: number;
    locationZone: string;
    locationCoordinates?: { lat: number; lng: number };
    bookingType: BookingType;
    totalPrice: number;
    notes?: string;
    therapistStatus?: string; // Availability status for enforcement
  }): Promise<BookingLifecycleRecord> {
    // 🔒 STRICT AVAILABILITY ENFORCEMENT - API LEVEL
    // Import dynamically to avoid circular dependencies
    const { availabilityEnforcementService } = await import('./availabilityEnforcementService');
    availabilityEnforcementService.validateBookingRequest(data.therapistStatus, data.bookingType);
    
    const now = new Date();
    const bookingId = `BK${now.getTime()}_${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
    
    // Calculate commission
    const { adminCommission, providerPayout } = this.calculateCommission(data.totalPrice);
    
    // Set response deadline (5 minutes for therapist to respond)
    const responseDeadline = new Date(now.getTime() + THERAPIST_RESPONSE_TIMEOUT_MS).toISOString();
    
    const bookingRecord: Omit<BookingLifecycleRecord, '$id'> = {
      bookingId,
      customerId: data.customerId,
      customerName: data.customerName,
      customerPhone: data.customerPhone,
      therapistId: data.therapistId,
      therapistName: data.therapistName,
      businessId: data.businessId,
      businessName: data.businessName,
      providerType: data.providerType,
      serviceType: data.serviceType,
      duration: data.duration,
      locationZone: data.locationZone,
      locationCoordinates: data.locationCoordinates,
      bookingType: data.bookingType,
      totalPrice: data.totalPrice,
      adminCommission,
      providerPayout,
      bookingStatus: BookingLifecycleStatus.PENDING,
      createdAt: now.toISOString(),
      pendingAt: now.toISOString(),
      responseDeadline,
      notes: data.notes,
    };

    try {
      const result = await databases.createDocument(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.bookings || 'bookings',
        ID.unique(),
        bookingRecord
      );

      console.log(`✅ [BookingLifecycle] Created booking ${bookingId} in PENDING state`);
      console.log(`💰 Commission: ${adminCommission} IDR (30%) | Provider: ${providerPayout} IDR (70%)`);

      return { ...bookingRecord, $id: result.$id };
    } catch (error) {
      console.error('❌ [BookingLifecycle] Failed to create booking:', error);
      throw error;
    }
  },

  /**
   * Transition booking to ACCEPTED state (Therapist accepts)
   */
  async acceptBooking(bookingId: string): Promise<BookingLifecycleRecord> {
    const booking = await this.getBookingById(bookingId);
    
    if (!booking) {
      throw new Error(`Booking ${bookingId} not found`);
    }

    if (!this.isValidTransition(booking.bookingStatus, BookingLifecycleStatus.ACCEPTED)) {
      throw new Error(`Invalid transition from ${booking.bookingStatus} to ACCEPTED`);
    }

    const now = new Date();
    const confirmationDeadline = new Date(now.getTime() + CUSTOMER_CONFIRMATION_TIMEOUT_MS).toISOString();

    const updates = {
      bookingStatus: BookingLifecycleStatus.ACCEPTED,
      acceptedAt: now.toISOString(),
      confirmationDeadline,
    };

    const result = await databases.updateDocument(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.collections.bookings || 'bookings',
      booking.$id!,
      updates
    );

    console.log(`✅ [BookingLifecycle] Booking ${bookingId} ACCEPTED - awaiting customer confirmation`);
    
    // Persist to Admin Dashboard immediately after ACCEPTED
    await this.notifyAdminDashboard(booking.$id!, BookingLifecycleStatus.ACCEPTED);

    return { ...booking, ...updates, $id: result.$id };
  },

  /**
   * Transition booking to CONFIRMED state (Customer confirms)
   */
  async confirmBooking(bookingId: string): Promise<BookingLifecycleRecord> {
    const booking = await this.getBookingById(bookingId);
    
    if (!booking) {
      throw new Error(`Booking ${bookingId} not found`);
    }

    if (!this.isValidTransition(booking.bookingStatus, BookingLifecycleStatus.CONFIRMED)) {
      throw new Error(`Invalid transition from ${booking.bookingStatus} to CONFIRMED`);
    }

    const now = new Date();
    const updates = {
      bookingStatus: BookingLifecycleStatus.CONFIRMED,
      confirmedAt: now.toISOString(),
    };

    const result = await databases.updateDocument(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.collections.bookings || 'bookings',
      booking.$id!,
      updates
    );

    console.log(`✅ [BookingLifecycle] Booking ${bookingId} CONFIRMED - service active`);

    return { ...booking, ...updates, $id: result.$id };
  },

  /**
   * Transition booking to COMPLETED state (Service delivered)
   * Commission is now applicable
   */
  async completeBooking(bookingId: string): Promise<BookingLifecycleRecord> {
    const booking = await this.getBookingById(bookingId);
    
    if (!booking) {
      throw new Error(`Booking ${bookingId} not found`);
    }

    if (!this.isValidTransition(booking.bookingStatus, BookingLifecycleStatus.COMPLETED)) {
      throw new Error(`Invalid transition from ${booking.bookingStatus} to COMPLETED`);
    }

    const now = new Date();
    const updates = {
      bookingStatus: BookingLifecycleStatus.COMPLETED,
      completedAt: now.toISOString(),
    };

    const result = await databases.updateDocument(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.collections.bookings || 'bookings',
      booking.$id!,
      updates
    );

    console.log(`✅ [BookingLifecycle] Booking ${bookingId} COMPLETED`);
    console.log(`💰 Commission eligible: ${booking.adminCommission} IDR for admin`);
    
    // Record commission for completed booking
    await this.recordCompletedCommission(booking);

    return { ...booking, ...updates, $id: result.$id };
  },

  /**
   * Transition booking to DECLINED state
   * Excluded from commission calculations
   */
  async declineBooking(bookingId: string, reason?: string): Promise<BookingLifecycleRecord> {
    const booking = await this.getBookingById(bookingId);
    
    if (!booking) {
      throw new Error(`Booking ${bookingId} not found`);
    }

    if (!this.isValidTransition(booking.bookingStatus, BookingLifecycleStatus.DECLINED)) {
      throw new Error(`Invalid transition from ${booking.bookingStatus} to DECLINED`);
    }

    const now = new Date();
    const updates = {
      bookingStatus: BookingLifecycleStatus.DECLINED,
      declinedAt: now.toISOString(),
      declineReason: reason || 'No reason provided',
    };

    const result = await databases.updateDocument(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.collections.bookings || 'bookings',
      booking.$id!,
      updates
    );

    console.log(`❌ [BookingLifecycle] Booking ${bookingId} DECLINED - excluded from commission`);

    return { ...booking, ...updates, $id: result.$id };
  },

  /**
   * Transition booking to EXPIRED state
   * Excluded from commission calculations
   */
  async expireBooking(bookingId: string, reason?: string): Promise<BookingLifecycleRecord> {
    const booking = await this.getBookingById(bookingId);
    
    if (!booking) {
      throw new Error(`Booking ${bookingId} not found`);
    }

    if (!this.isValidTransition(booking.bookingStatus, BookingLifecycleStatus.EXPIRED)) {
      throw new Error(`Invalid transition from ${booking.bookingStatus} to EXPIRED`);
    }

    const now = new Date();
    const updates = {
      bookingStatus: BookingLifecycleStatus.EXPIRED,
      expiredAt: now.toISOString(),
      expirationReason: reason || 'Response timeout',
    };

    const result = await databases.updateDocument(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.collections.bookings || 'bookings',
      booking.$id!,
      updates
    );

    console.log(`⏰ [BookingLifecycle] Booking ${bookingId} EXPIRED - excluded from commission`);

    return { ...booking, ...updates, $id: result.$id };
  },

  /**
   * Get booking by document ID
   */
  async getBookingById(documentId: string): Promise<BookingLifecycleRecord | null> {
    try {
      const result = await databases.getDocument(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.bookings || 'bookings',
        documentId
      );
      return result as unknown as BookingLifecycleRecord;
    } catch (error) {
      console.error(`❌ [BookingLifecycle] Failed to get booking ${documentId}:`, error);
      return null;
    }
  },

  /**
   * Get booking by bookingId field
   */
  async getBookingByBookingId(bookingId: string): Promise<BookingLifecycleRecord | null> {
    try {
      const result = await databases.listDocuments(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.bookings || 'bookings',
        [Query.equal('bookingId', bookingId), Query.limit(1)]
      );
      return result.documents[0] as unknown as BookingLifecycleRecord || null;
    } catch (error) {
      console.error(`❌ [BookingLifecycle] Failed to get booking by ID ${bookingId}:`, error);
      return null;
    }
  },

  /**
   * Get all bookings for a provider (therapist or business)
   */
  async getProviderBookings(providerId: string, providerType: 'therapist' | 'place' | 'facial'): Promise<BookingLifecycleRecord[]> {
    try {
      const fieldName = providerType === 'therapist' ? 'therapistId' : 'businessId';
      const result = await databases.listDocuments(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.bookings || 'bookings',
        [
          Query.equal(fieldName, providerId),
          Query.orderDesc('createdAt'),
          Query.limit(100)
        ]
      );
      return result.documents as unknown as BookingLifecycleRecord[];
    } catch (error) {
      console.error(`❌ [BookingLifecycle] Failed to get provider bookings:`, error);
      return [];
    }
  },

  /**
   * Get all COMPLETED bookings for commission calculation
   */
  async getCompletedBookingsForCommission(startDate?: string, endDate?: string): Promise<BookingLifecycleRecord[]> {
    try {
      const queries = [
        Query.equal('bookingStatus', BookingLifecycleStatus.COMPLETED),
        Query.orderDesc('completedAt'),
        Query.limit(1000)
      ];

      if (startDate) {
        queries.push(Query.greaterThanEqual('completedAt', startDate));
      }
      if (endDate) {
        queries.push(Query.lessThanEqual('completedAt', endDate));
      }

      const result = await databases.listDocuments(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.bookings || 'bookings',
        queries
      );

      return result.documents as unknown as BookingLifecycleRecord[];
    } catch (error) {
      console.error(`❌ [BookingLifecycle] Failed to get completed bookings:`, error);
      return [];
    }
  },

  /**
   * Calculate total commission for a date range
   */
  async calculateTotalCommission(startDate?: string, endDate?: string): Promise<{
    totalBookings: number;
    totalRevenue: number;
    totalAdminCommission: number;
    totalProviderPayout: number;
  }> {
    const completedBookings = await this.getCompletedBookingsForCommission(startDate, endDate);
    
    const totals = completedBookings.reduce((acc, booking) => ({
      totalBookings: acc.totalBookings + 1,
      totalRevenue: acc.totalRevenue + booking.totalPrice,
      totalAdminCommission: acc.totalAdminCommission + booking.adminCommission,
      totalProviderPayout: acc.totalProviderPayout + booking.providerPayout,
    }), {
      totalBookings: 0,
      totalRevenue: 0,
      totalAdminCommission: 0,
      totalProviderPayout: 0,
    });

    console.log(`📊 [BookingLifecycle] Commission Summary:
      - Total Completed Bookings: ${totals.totalBookings}
      - Total Revenue: ${totals.totalRevenue} IDR
      - Admin Commission (30%): ${totals.totalAdminCommission} IDR
      - Provider Payout (70%): ${totals.totalProviderPayout} IDR
    `);

    return totals;
  },

  /**
   * Notify Admin Dashboard about booking status change
   */
  async notifyAdminDashboard(bookingDocId: string, newStatus: BookingLifecycleStatus): Promise<void> {
    try {
      // Create admin notification record
      if (APPWRITE_CONFIG.collections.notifications) {
        await databases.createDocument(
          APPWRITE_CONFIG.databaseId,
          APPWRITE_CONFIG.collections.notifications,
          ID.unique(),
          {
            type: 'booking_status_change',
            bookingId: bookingDocId,
            newStatus,
            timestamp: new Date().toISOString(),
            read: false,
          }
        );
      }
      console.log(`📢 [BookingLifecycle] Admin notified: Booking ${bookingDocId} → ${newStatus}`);
    } catch (error) {
      console.error(`❌ [BookingLifecycle] Failed to notify admin:`, error);
    }
  },

  /**
   * Record commission for completed booking
   * Uses adminCommissionService for automatic notification timeline
   */
  async recordCompletedCommission(booking: BookingLifecycleRecord): Promise<void> {
    try {
      // Use the new adminCommissionService for full notification timeline
      const { adminCommissionService } = await import('./adminCommissionService');
      
      await adminCommissionService.createCommissionOnCompletion({
        bookingId: booking.bookingId,
        therapistId: booking.therapistId || booking.businessId || '',
        therapistName: booking.therapistName || booking.businessName || '',
        bookingAmount: booking.totalPrice,
        completedAt: booking.completedAt,
      });
      
      console.log(`💰 [BookingLifecycle] Commission created with notification timeline`);
      console.log(`   Amount: Rp ${booking.adminCommission.toLocaleString('id-ID')} (30%)`);
      console.log(`   Timeline: +2h reminder → +2h30m urgent → +3h final → +3h30m restriction`);
      
    } catch (error) {
      console.error(`❌ [BookingLifecycle] Failed to record commission:`, error);
      
      // Fallback to basic commission record if new service fails
      if (APPWRITE_CONFIG.collections.commissionRecords) {
        await databases.createDocument(
          APPWRITE_CONFIG.databaseId,
          APPWRITE_CONFIG.collections.commissionRecords,
          ID.unique(),
          {
            bookingId: booking.bookingId,
            bookingDocId: booking.$id,
            providerId: booking.therapistId || booking.businessId,
            providerName: booking.therapistName || booking.businessName,
            providerType: booking.providerType,
            totalPrice: booking.totalPrice,
            adminCommission: booking.adminCommission,
            providerPayout: booking.providerPayout,
            commissionRate: ADMIN_COMMISSION_RATE,
            status: 'pending_collection',
            createdAt: new Date().toISOString(),
            completedAt: booking.completedAt,
          }
        );
        console.log(`💰 [BookingLifecycle] Fallback commission recorded: ${booking.adminCommission} IDR`);
      }
    }
  },

  /**
   * Check and expire overdue bookings
   */
  async checkAndExpireOverdueBookings(): Promise<number> {
    try {
      const now = new Date().toISOString();
      
      // Find PENDING bookings past response deadline
      const pendingOverdue = await databases.listDocuments(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.bookings || 'bookings',
        [
          Query.equal('bookingStatus', BookingLifecycleStatus.PENDING),
          Query.lessThan('responseDeadline', now),
          Query.limit(100)
        ]
      );

      // Find ACCEPTED bookings past confirmation deadline
      const acceptedOverdue = await databases.listDocuments(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.bookings || 'bookings',
        [
          Query.equal('bookingStatus', BookingLifecycleStatus.ACCEPTED),
          Query.lessThan('confirmationDeadline', now),
          Query.limit(100)
        ]
      );

      let expiredCount = 0;

      // Expire overdue PENDING bookings
      for (const doc of pendingOverdue.documents) {
        await this.expireBooking(doc.$id, 'Therapist response timeout');
        expiredCount++;
      }

      // Expire overdue ACCEPTED bookings
      for (const doc of acceptedOverdue.documents) {
        await this.expireBooking(doc.$id, 'Customer confirmation timeout');
        expiredCount++;
      }

      if (expiredCount > 0) {
        console.log(`⏰ [BookingLifecycle] Expired ${expiredCount} overdue bookings`);
      }

      return expiredCount;
    } catch (error) {
      console.error(`❌ [BookingLifecycle] Failed to check overdue bookings:`, error);
      return 0;
    }
  },
};

// Export types
export type { BookingLifecycleRecord };
