/**
 * =====================================================================
 * ADMIN MODULE INDEX - Clean Exports
 * =====================================================================
 * 
 * Single entry point for all admin functionality.
 * Import from here for:
 * - Admin services
 * - Admin guards
 * - Admin types
 * 
 * Usage:
 *   import { adminTherapistService, AdminGuard } from '@/lib/admin';
 * 
 * @version 1.0.0
 */

// Re-export all admin services
export {
    adminTherapistService,
    adminPlacesService,
    adminBookingService,
    adminCommissionService,
    adminRevenueService,
    adminChatService,
    adminReviewsService,
    adminAnalyticsService,
    adminShareTrackingService,
    adminAuditService
} from './adminServices';

// Re-export types
export type {
    CommissionStatus,
    BookingLifecycleStatus,
    Achievement,
    TherapistAchievement
} from './adminServices';

export { SAMPLE_ACHIEVEMENTS } from './adminServices';

// Re-export guards
export {
    AdminGuard,
    AdminGuardDev,
    useAdminSession,
    adminLogin,
    adminLogout,
    isCurrentUserAdmin
} from './adminGuard';

// Re-export unified client (for direct access if needed)
export {
    databases,
    storage,
    account,
    client,
    DATABASE_ID,
    COLLECTIONS,
    STORAGE_BUCKETS,
    APPWRITE_CONFIG,
    Query,
    ID
} from './appwriteClient';

// Re-export types from client
export type { UserRole, AppUser, AuditLogEntry } from './appwriteClient';

console.log('✅ [ADMIN MODULE] Exports initialized');
