/**
 * 🔴 ADMIN REVENUE TRACKER SERVICE
 * Real-time tracking of ACCEPTED bookings with commission countdown
 * 
 * Features:
 * - Real-time Appwrite subscription for booking updates
 * - Commission countdown timers (+2h, +2h30m, +3h, +3h30m)
 * - Only tracks ACCEPTED, CONFIRMED, COMPLETED bookings for revenue
 * - Excludes DECLINED and EXPIRED from revenue stats
 * - Account status tracking (AVAILABLE, BUSY, RESTRICTED)
 */

import { client, databases, Query } from '../appwrite';
import { APPWRITE_CONFIG } from '../appwrite.config';
import { BookingLifecycleStatus } from './bookingLifecycleService';
import { CommissionStatus, ADMIN_REACTIVATION_FEE } from './adminCommissionService';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface AdminBookingEntry {
  // Booking identification
  bookingId: string;
  bookingDocId: string;
  
  // Provider info
  therapistId?: string;
  therapistName?: string;
  businessId?: string;
  businessName?: string;
  providerType: 'therapist' | 'business';
  
  // Service details
  serviceType: string;
  serviceName: string;
  duration: number; // minutes
  
  // Financial
  totalValue: number;
  adminCommission: number;
  providerPayout: number;
  commissionRate: number; // 0.30
  
  // Status tracking
  bookingStatus: BookingLifecycleStatus;
  commissionStatus: CommissionStatus;
  accountStatus: 'AVAILABLE' | 'BUSY' | 'CLOSED' | 'RESTRICTED';
  
  // Countdown timers (in milliseconds remaining)
  reminderCountdown?: number;      // +2h reminder
  urgentCountdown?: number;        // +2h30m urgent
  finalWarningCountdown?: number;  // +3h final
  restrictionCountdown?: number;   // +3h30m restriction
  
  // Timestamps
  createdAt: string;
  acceptedAt?: string;
  completedAt?: string;
  paymentDeadline?: string;
  
  // Reactivation fee (if overdue)
  reactivationFeeRequired: boolean;
  reactivationFeeAmount: number;
  totalAmountDue: number;
}

export interface AdminRevenueStats {
  // Revenue totals (only ACCEPTED/CONFIRMED/COMPLETED)
  totalRevenue: number;
  totalCommission: number;
  totalProviderPayout: number;
  
  // Booking counts by status
  pendingCount: number;
  acceptedCount: number;
  confirmedCount: number;
  completedCount: number;
  
  // Commission status counts
  commissionPending: number;
  commissionPaid: number;
  commissionOverdue: number;
  
  // Excluded from revenue (for reference only)
  declinedCount: number;
  expiredCount: number;
  
  // Provider status
  restrictedProviders: number;
  
  // Time-based
  lastUpdated: string;
}

export type RevenueUpdateCallback = (stats: AdminRevenueStats, bookings: AdminBookingEntry[]) => void;

// ============================================================================
// TIME CONSTANTS (matching adminCommissionService)
// ============================================================================

const REMINDER_TIME_MS = 2 * 60 * 60 * 1000;         // 2 hours
const URGENT_WARNING_TIME_MS = 2.5 * 60 * 60 * 1000; // 2 hours 30 min
const FINAL_WARNING_TIME_MS = 3 * 60 * 60 * 1000;    // 3 hours
const RESTRICTION_TIME_MS = 3.5 * 60 * 60 * 1000;    // 3 hours 30 min
const COMMISSION_RATE = 0.30;

// ============================================================================
// REVENUE STATUSES (included in revenue calculation)
// ============================================================================

const REVENUE_STATUSES: BookingLifecycleStatus[] = [
  BookingLifecycleStatus.ACCEPTED,
  BookingLifecycleStatus.CONFIRMED,
  BookingLifecycleStatus.COMPLETED,
];

// Excluded from revenue
const EXCLUDED_STATUSES: BookingLifecycleStatus[] = [
  BookingLifecycleStatus.DECLINED,
  BookingLifecycleStatus.EXPIRED,
];

// ============================================================================
// ADMIN REVENUE TRACKER SERVICE
// ============================================================================

class AdminRevenueTrackerService {
  private subscriptions: (() => void)[] = [];
  private callbacks: RevenueUpdateCallback[] = [];
  private cachedBookings: AdminBookingEntry[] = [];
  private cachedStats: AdminRevenueStats | null = null;
  private countdownInterval: NodeJS.Timeout | null = null;

  /**
   * Initialize real-time tracking
   * Subscribes to bookings and commission_records collections
   */
  async initialize(): Promise<void> {
    console.log('🔴 [AdminRevenueTracker] Initializing real-time tracking...');
    
    // Initial data fetch
    await this.fetchAllBookings();
    
    // Subscribe to bookings collection
    const bookingsChannel = `databases.${APPWRITE_CONFIG.databaseId}.collections.${APPWRITE_CONFIG.collections.bookings}.documents`;
    const bookingsSub = client.subscribe(bookingsChannel, (response) => {
      console.log('📥 [AdminRevenueTracker] Booking update received:', response.events);
      this.handleBookingUpdate(response);
    });
    this.subscriptions.push(bookingsSub);
    
    // Subscribe to commission_records collection
    if (APPWRITE_CONFIG.collections.commissionRecords) {
      const commissionChannel = `databases.${APPWRITE_CONFIG.databaseId}.collections.${APPWRITE_CONFIG.collections.commissionRecords}.documents`;
      const commissionSub = client.subscribe(commissionChannel, (response) => {
        console.log('📥 [AdminRevenueTracker] Commission update received:', response.events);
        this.handleCommissionUpdate(response);
      });
      this.subscriptions.push(commissionSub);
    }

    // Start countdown timer updates (every second)
    this.startCountdownUpdates();
    
    console.log('✅ [AdminRevenueTracker] Real-time tracking initialized');
  }

  /**
   * Subscribe to revenue updates
   */
  subscribe(callback: RevenueUpdateCallback): () => void {
    this.callbacks.push(callback);
    
    // Immediately send current data
    if (this.cachedStats) {
      callback(this.cachedStats, this.cachedBookings);
    }
    
    // Return unsubscribe function
    return () => {
      const index = this.callbacks.indexOf(callback);
      if (index > -1) {
        this.callbacks.splice(index, 1);
      }
    };
  }

  /**
   * Cleanup subscriptions
   */
  cleanup(): void {
    this.subscriptions.forEach(unsub => unsub());
    this.subscriptions = [];
    this.callbacks = [];
    
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
      this.countdownInterval = null;
    }
    
    console.log('🧹 [AdminRevenueTracker] Cleaned up');
  }

  /**
   * Fetch all bookings from Appwrite
   */
  private async fetchAllBookings(): Promise<void> {
    try {
      // Fetch bookings
      const bookingsResult = await databases.listDocuments(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.bookings,
        [Query.orderDesc('$createdAt'), Query.limit(200)]
      );

      // Fetch commission records
      let commissionRecords: any[] = [];
      if (APPWRITE_CONFIG.collections.commissionRecords) {
        try {
          const commissionsResult = await databases.listDocuments(
            APPWRITE_CONFIG.databaseId,
            APPWRITE_CONFIG.collections.commissionRecords,
            [Query.limit(200)]
          );
          commissionRecords = commissionsResult.documents;
        } catch (e) {
          console.warn('⚠️ Could not fetch commission records');
        }
      }

      // Map bookings to AdminBookingEntry
      this.cachedBookings = bookingsResult.documents.map((doc: any) => 
        this.mapToAdminEntry(doc, commissionRecords)
      );

      // Calculate stats
      this.cachedStats = this.calculateStats(this.cachedBookings);
      
      // Notify subscribers
      this.notifySubscribers();
      
      console.log(`📊 [AdminRevenueTracker] Loaded ${this.cachedBookings.length} bookings`);
    } catch (error) {
      console.error('❌ [AdminRevenueTracker] Failed to fetch bookings:', error);
    }
  }

  /**
   * Map Appwrite document to AdminBookingEntry
   */
  private mapToAdminEntry(doc: any, commissionRecords: any[]): AdminBookingEntry {
    const status = (doc.status || doc.bookingStatus || 'PENDING').toUpperCase() as BookingLifecycleStatus;
    const totalValue = doc.totalCost || doc.totalPrice || doc.price || 0;
    const commission = Math.round(totalValue * COMMISSION_RATE);
    const payout = totalValue - commission;
    
    // Find matching commission record
    const commissionRecord = commissionRecords.find(c => 
      c.bookingId === doc.$id || c.bookingId === doc.bookingId
    );
    
    const commissionStatus = commissionRecord?.status || 
      (status === BookingLifecycleStatus.COMPLETED ? CommissionStatus.PENDING : 'N/A');
    
    // Calculate countdowns for completed bookings with pending commission
    const countdowns = this.calculateCountdowns(doc, commissionRecord);
    
    return {
      bookingId: doc.bookingId || `BK_${doc.$id.substring(0, 8)}`,
      bookingDocId: doc.$id,
      
      therapistId: doc.providerType === 'therapist' ? doc.providerId : undefined,
      therapistName: doc.providerType === 'therapist' ? doc.providerName : undefined,
      businessId: doc.providerType === 'business' || doc.providerType === 'place' ? doc.providerId : undefined,
      businessName: doc.providerType === 'business' || doc.providerType === 'place' ? doc.providerName : undefined,
      providerType: doc.providerType === 'place' ? 'business' : (doc.providerType || 'therapist'),
      
      serviceType: doc.serviceType || 'Massage',
      serviceName: doc.serviceName || doc.service || `${doc.duration || 60} min massage`,
      duration: doc.duration || parseInt(doc.service) || 60,
      
      totalValue,
      adminCommission: commission,
      providerPayout: payout,
      commissionRate: COMMISSION_RATE,
      
      bookingStatus: status,
      commissionStatus: commissionStatus as CommissionStatus,
      accountStatus: doc.providerStatus || 'AVAILABLE',
      
      ...countdowns,
      
      createdAt: doc.$createdAt || doc.createdAt,
      acceptedAt: doc.acceptedAt,
      completedAt: doc.completedAt,
      paymentDeadline: commissionRecord?.paymentDeadline,
      
      reactivationFeeRequired: commissionRecord?.reactivationFeeRequired || false,
      reactivationFeeAmount: commissionRecord?.reactivationFeeAmount || 0,
      totalAmountDue: commissionRecord?.totalAmountDue || commission,
    };
  }

  /**
   * Calculate countdown timers for commission
   */
  private calculateCountdowns(doc: any, commissionRecord: any): Partial<AdminBookingEntry> {
    if (!doc.completedAt || commissionRecord?.status === CommissionStatus.PAID) {
      return {};
    }

    const completedAt = new Date(doc.completedAt).getTime();
    const now = Date.now();
    
    return {
      reminderCountdown: Math.max(0, (completedAt + REMINDER_TIME_MS) - now),
      urgentCountdown: Math.max(0, (completedAt + URGENT_WARNING_TIME_MS) - now),
      finalWarningCountdown: Math.max(0, (completedAt + FINAL_WARNING_TIME_MS) - now),
      restrictionCountdown: Math.max(0, (completedAt + RESTRICTION_TIME_MS) - now),
    };
  }

  /**
   * Calculate revenue stats from bookings
   * EXCLUDES declined and expired from revenue totals
   */
  private calculateStats(bookings: AdminBookingEntry[]): AdminRevenueStats {
    // Filter for revenue-generating bookings only
    const revenueBookings = bookings.filter(b => 
      REVENUE_STATUSES.includes(b.bookingStatus)
    );
    
    // Calculate totals from revenue bookings only
    const totalRevenue = revenueBookings.reduce((sum, b) => sum + b.totalValue, 0);
    const totalCommission = revenueBookings.reduce((sum, b) => sum + b.adminCommission, 0);
    const totalProviderPayout = revenueBookings.reduce((sum, b) => sum + b.providerPayout, 0);
    
    return {
      totalRevenue,
      totalCommission,
      totalProviderPayout,
      
      // Booking counts
      pendingCount: bookings.filter(b => b.bookingStatus === BookingLifecycleStatus.PENDING).length,
      acceptedCount: bookings.filter(b => b.bookingStatus === BookingLifecycleStatus.ACCEPTED).length,
      confirmedCount: bookings.filter(b => b.bookingStatus === BookingLifecycleStatus.CONFIRMED).length,
      completedCount: bookings.filter(b => b.bookingStatus === BookingLifecycleStatus.COMPLETED).length,
      
      // Commission status
      commissionPending: bookings.filter(b => b.commissionStatus === CommissionStatus.PENDING).length,
      commissionPaid: bookings.filter(b => b.commissionStatus === CommissionStatus.PAID).length,
      commissionOverdue: bookings.filter(b => b.commissionStatus === CommissionStatus.OVERDUE).length,
      
      // Excluded counts (for reference only - NOT in revenue)
      declinedCount: bookings.filter(b => b.bookingStatus === BookingLifecycleStatus.DECLINED).length,
      expiredCount: bookings.filter(b => b.bookingStatus === BookingLifecycleStatus.EXPIRED).length,
      
      // Restricted providers
      restrictedProviders: bookings.filter(b => b.accountStatus === 'RESTRICTED').length,
      
      lastUpdated: new Date().toISOString(),
    };
  }

  /**
   * Handle real-time booking update
   */
  private async handleBookingUpdate(response: any): Promise<void> {
    const payload = response.payload;
    const events = response.events || [];
    
    // Check if this is a relevant status (ACCEPTED, etc.)
    const status = payload?.status?.toUpperCase();
    
    if (events.some((e: string) => e.includes('.create'))) {
      console.log(`📗 [AdminRevenueTracker] New booking: ${payload.$id} - ${status}`);
    } else if (events.some((e: string) => e.includes('.update'))) {
      console.log(`📘 [AdminRevenueTracker] Booking updated: ${payload.$id} - ${status}`);
    }
    
    // Refresh all data to ensure consistency
    await this.fetchAllBookings();
  }

  /**
   * Handle real-time commission update
   */
  private async handleCommissionUpdate(response: any): Promise<void> {
    const payload = response.payload;
    console.log(`💰 [AdminRevenueTracker] Commission updated: ${payload?.commissionId} - ${payload?.status}`);
    
    // Refresh all data
    await this.fetchAllBookings();
  }

  /**
   * Start countdown timer updates
   */
  private startCountdownUpdates(): void {
    // Update every second for accurate countdown display
    this.countdownInterval = setInterval(() => {
      const now = Date.now();
      let hasChanges = false;
      
      this.cachedBookings = this.cachedBookings.map(booking => {
        if (!booking.completedAt || booking.commissionStatus === CommissionStatus.PAID) {
          return booking;
        }
        
        const completedAt = new Date(booking.completedAt).getTime();
        const newCountdowns = {
          reminderCountdown: Math.max(0, (completedAt + REMINDER_TIME_MS) - now),
          urgentCountdown: Math.max(0, (completedAt + URGENT_WARNING_TIME_MS) - now),
          finalWarningCountdown: Math.max(0, (completedAt + FINAL_WARNING_TIME_MS) - now),
          restrictionCountdown: Math.max(0, (completedAt + RESTRICTION_TIME_MS) - now),
        };
        
        // Check if any countdown changed significantly (every 1 second)
        if (booking.restrictionCountdown !== newCountdowns.restrictionCountdown) {
          hasChanges = true;
        }
        
        return { ...booking, ...newCountdowns };
      });
      
      // Only notify if there are active countdowns
      if (hasChanges && this.callbacks.length > 0) {
        this.cachedStats = this.calculateStats(this.cachedBookings);
        this.notifySubscribers();
      }
    }, 1000);
  }

  /**
   * Notify all subscribers of updates
   */
  private notifySubscribers(): void {
    if (!this.cachedStats) return;
    
    this.callbacks.forEach(callback => {
      callback(this.cachedStats!, this.cachedBookings);
    });
  }

  /**
   * Get current stats (for initial load)
   */
  getStats(): AdminRevenueStats | null {
    return this.cachedStats;
  }

  /**
   * Get current bookings (for initial load)
   */
  getBookings(): AdminBookingEntry[] {
    return this.cachedBookings;
  }

  /**
   * Get only revenue-generating bookings
   */
  getRevenueBookings(): AdminBookingEntry[] {
    return this.cachedBookings.filter(b => REVENUE_STATUSES.includes(b.bookingStatus));
  }

  /**
   * Get bookings with pending commission (need attention)
   */
  getPendingCommissionBookings(): AdminBookingEntry[] {
    return this.cachedBookings.filter(b => 
      b.commissionStatus === CommissionStatus.PENDING &&
      b.bookingStatus === BookingLifecycleStatus.COMPLETED
    );
  }

  /**
   * Get overdue commission bookings (critical)
   */
  getOverdueCommissionBookings(): AdminBookingEntry[] {
    return this.cachedBookings.filter(b => b.commissionStatus === CommissionStatus.OVERDUE);
  }

  /**
   * Force refresh data
   */
  async refresh(): Promise<void> {
    console.log('🔄 [AdminRevenueTracker] Manual refresh...');
    await this.fetchAllBookings();
  }
}

// Export singleton instance
export const adminRevenueTrackerService = new AdminRevenueTrackerService();
export default adminRevenueTrackerService;
