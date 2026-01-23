/**
 * 🔍 ORPHAN DETECTION SERVICE
 * ============================================================================
 * Detects booking/commission integrity violations
 * ============================================================================
 * 
 * VIOLATIONS DETECTED:
 * 1. Accepted bookings WITHOUT commission records (CRITICAL)
 * 2. Commission records WITHOUT bookings (CRITICAL)
 * 3. Reversed commissions (INFO)
 * 
 * USAGE:
 * ```typescript
 * import { orphanDetectionService } from './orphanDetectionService';
 * 
 * // Run detection
 * const report = await orphanDetectionService.detectOrphans();
 * 
 * // Check for violations
 * if (report.criticalViolations > 0) {
 *   alert(`⚠️ ${report.criticalViolations} critical violations found!`);
 * }
 * ```
 */

import { databases, Query } from '../appwrite';
import { APPWRITE_CONFIG } from '../appwrite.config';

export interface OrphanBooking {
  bookingId: string;
  bookingDocId: string;
  therapistId: string;
  therapistName: string;
  bookingAmount: number;
  expectedCommission: number;
  status: string;
  acceptedAt?: string;
  createdAt: string;
}

export interface OrphanCommission {
  commissionId: string;
  commissionDocId: string;
  bookingId: string;
  therapistId: string;
  commissionAmount: number;
  status: string;
  createdAt: string;
}

export interface ReversedCommission {
  commissionId: string;
  commissionDocId: string;
  bookingId: string;
  therapistId: string;
  commissionAmount: number;
  reversalReason: string;
  reversedAt: string;
  reversedBy: string;
}

export interface OrphanDetectionReport {
  // Violations
  orphanBookings: OrphanBooking[];
  orphanCommissions: OrphanCommission[];
  
  // Info
  reversedCommissions: ReversedCommission[];
  
  // Summary
  totalBookingsChecked: number;
  totalCommissionsChecked: number;
  criticalViolations: number;
  warningCount: number;
  
  // Status
  status: 'clean' | 'warnings' | 'critical';
  lastCheck: string;
}

export const orphanDetectionService = {
  /**
   * Run complete orphan detection
   */
  async detectOrphans(): Promise<OrphanDetectionReport> {
    console.log('🔍 [ORPHAN DETECTION] Starting integrity check...');
    
    try {
      // Fetch all accepted/confirmed bookings
      const bookingsResponse = await databases.listDocuments(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.bookings || 'bookings',
        [Query.limit(500)]
      );
      
      const acceptedBookings = bookingsResponse.documents.filter(b => {
        const status = (b.status || '').toLowerCase();
        return ['accepted', 'confirmed', 'completed'].includes(status);
      });
      
      console.log(`📋 [ORPHAN DETECTION] Found ${acceptedBookings.length} accepted bookings`);
      
      // Fetch all commission records
      const commissionsResponse = await databases.listDocuments(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.commissionRecords || 'commission_records',
        [Query.limit(500)]
      );
      
      console.log(`💰 [ORPHAN DETECTION] Found ${commissionsResponse.documents.length} commission records`);
      
      // Build lookup maps
      const commissionsByBookingId = new Map();
      commissionsResponse.documents.forEach(c => {
        commissionsByBookingId.set(c.bookingId, c);
      });
      
      const bookingsByBookingId = new Map();
      acceptedBookings.forEach(b => {
        bookingsByBookingId.set(b.$id, b);
      });
      
      // VIOLATION 1: Bookings without commissions
      const orphanBookings: OrphanBooking[] = [];
      acceptedBookings.forEach(booking => {
        if (!commissionsByBookingId.has(booking.$id)) {
          const bookingAmount = booking.price || booking.totalAmount || 0;
          orphanBookings.push({
            bookingId: booking.$id,
            bookingDocId: booking.$id,
            therapistId: booking.providerId || booking.therapistId || 'unknown',
            therapistName: booking.providerName || booking.therapistName || 'Unknown',
            bookingAmount: bookingAmount,
            expectedCommission: Math.round(bookingAmount * 0.30),
            status: booking.status,
            acceptedAt: booking.acceptedAt,
            createdAt: booking.$createdAt || booking.createdAt
          });
        }
      });
      
      if (orphanBookings.length > 0) {
        console.error(`🚨 [ORPHAN DETECTION] CRITICAL: ${orphanBookings.length} bookings missing commissions!`);
        orphanBookings.forEach(b => {
          console.error(`   - Booking ${b.bookingId}: ${b.therapistName}, ${b.bookingAmount} IDR (missing ${b.expectedCommission} IDR commission)`);
        });
      }
      
      // VIOLATION 2: Commissions without bookings
      const orphanCommissions: OrphanCommission[] = [];
      commissionsResponse.documents.forEach(commission => {
        // Skip reversed commissions (they're expected to have cancelled bookings)
        if (commission.status === 'reversed') return;
        
        if (!bookingsByBookingId.has(commission.bookingId)) {
          orphanCommissions.push({
            commissionId: commission.commissionId || commission.$id,
            commissionDocId: commission.$id,
            bookingId: commission.bookingId,
            therapistId: commission.therapistId,
            commissionAmount: commission.commissionAmount,
            status: commission.status,
            createdAt: commission.$createdAt || commission.createdAt
          });
        }
      });
      
      if (orphanCommissions.length > 0) {
        console.error(`🚨 [ORPHAN DETECTION] CRITICAL: ${orphanCommissions.length} commissions without bookings!`);
        orphanCommissions.forEach(c => {
          console.error(`   - Commission ${c.commissionId}: Booking ${c.bookingId} not found`);
        });
      }
      
      // INFO: Reversed commissions (not a violation)
      const reversedCommissions: ReversedCommission[] = [];
      commissionsResponse.documents.forEach(commission => {
        if (commission.status === 'reversed') {
          reversedCommissions.push({
            commissionId: commission.commissionId || commission.$id,
            commissionDocId: commission.$id,
            bookingId: commission.bookingId,
            therapistId: commission.therapistId,
            commissionAmount: commission.commissionAmount,
            reversalReason: commission.reversalReason || 'No reason provided',
            reversedAt: commission.reversedAt,
            reversedBy: commission.reversedBy || 'unknown'
          });
        }
      });
      
      if (reversedCommissions.length > 0) {
        console.log(`ℹ️  [ORPHAN DETECTION] ${reversedCommissions.length} commissions reversed (expected)`);
      }
      
      // Calculate summary
      const criticalViolations = orphanBookings.length + orphanCommissions.length;
      const status = criticalViolations > 0 ? 'critical' : 
                     reversedCommissions.length > 10 ? 'warnings' : 'clean';
      
      const report: OrphanDetectionReport = {
        orphanBookings,
        orphanCommissions,
        reversedCommissions,
        totalBookingsChecked: acceptedBookings.length,
        totalCommissionsChecked: commissionsResponse.documents.length,
        criticalViolations,
        warningCount: reversedCommissions.length,
        status,
        lastCheck: new Date().toISOString()
      };
      
      console.log('✅ [ORPHAN DETECTION] Integrity check complete');
      console.log(`   Status: ${status.toUpperCase()}`);
      console.log(`   Critical Violations: ${criticalViolations}`);
      console.log(`   Reversed Commissions: ${reversedCommissions.length}`);
      
      return report;
      
    } catch (error) {
      console.error('❌ [ORPHAN DETECTION] Detection failed:', error);
      throw error;
    }
  },
  
  /**
   * Auto-fix orphan bookings by creating missing commissions
   */
  async autoFixOrphanBookings(orphanBookings: OrphanBooking[]): Promise<number> {
    console.log(`🔧 [ORPHAN DETECTION] Auto-fixing ${orphanBookings.length} orphan bookings...`);
    
    let fixed = 0;
    
    for (const booking of orphanBookings) {
      try {
        const now = new Date();
        const paymentDeadline = new Date(now.getTime() + 3 * 60 * 60 * 1000);
        
        await databases.createDocument(
          APPWRITE_CONFIG.databaseId,
          APPWRITE_CONFIG.collections.commissionRecords || 'commission_records',
          `fix_${booking.bookingId}`,
          {
            commissionId: `COM_FIX_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
            bookingId: booking.bookingId,
            therapistId: booking.therapistId,
            therapistName: booking.therapistName,
            bookingAmount: booking.bookingAmount,
            commissionRate: 0.30,
            commissionAmount: booking.expectedCommission,
            status: 'pending',
            reactivationFeeRequired: false,
            reactivationFeeAmount: 0,
            totalAmountDue: booking.expectedCommission,
            completedAt: booking.acceptedAt || now.toISOString(),
            paymentDeadline: paymentDeadline.toISOString(),
            createdAt: now.toISOString(),
            updatedAt: now.toISOString(),
            autoFixed: true,
            autoFixReason: 'Missing commission detected by orphan detection service'
          }
        );
        
        fixed++;
        console.log(`✅ [ORPHAN DETECTION] Fixed booking ${booking.bookingId}`);
      } catch (error) {
        console.error(`❌ [ORPHAN DETECTION] Failed to fix booking ${booking.bookingId}:`, error);
      }
    }
    
    console.log(`✅ [ORPHAN DETECTION] Auto-fix complete: ${fixed}/${orphanBookings.length} fixed`);
    return fixed;
  },
  
  /**
   * Get summary text for display
   */
  getSummaryText(report: OrphanDetectionReport): string {
    if (report.status === 'clean') {
      return `✅ All ${report.totalBookingsChecked} bookings have commission records`;
    }
    
    if (report.status === 'critical') {
      return `🚨 ${report.criticalViolations} CRITICAL violations found!`;
    }
    
    return `⚠️ ${report.warningCount} warnings (${report.reversedCommissions.length} reversed)`;
  }
};
