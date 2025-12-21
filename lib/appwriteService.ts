/**
 * =================================================================
 * APPWRITE SERVICE - BACKWARDS COMPATIBILITY LAYER
 * =================================================================
 * 
 * This file maintains backwards compatibility while we migrate to modular services.
 * All imports from './lib/appwriteService' will continue to work unchanged.
 * 
 * MIGRATION STATUS: Services are being moved from LEGACY to individual modules
 * - ✅ imageUploadService: Migrated to services/image.service.ts
 * - 🔄 Other services: Still in appwriteService.LEGACY.ts
 * 
 * NO UI CHANGES NEEDED - All existing imports continue to work
 */

// Re-export everything from the new modular services
// This ensures 100% backwards compatibility
export * from './services';

export {
    // Core clients
    appwriteClient,
    appwriteDatabases,
    appwriteAccount,
    appwriteStorage,
    
    // Auth & Image
    authService,
    imagePoolService,
    getNonRepeatingMainImage,
    getRandomLiveMenuImage,
    
    // Primary services
    imageUploadService,
    therapistService,
    placesService,
    facialPlaceService,
    hotelService,
    userService,
    bookingService,
    reviewService,
    notificationService,
    messagingService,
    paymentService,
    membershipService,
    
    // Admin & Management
    customLinksService,
    translationsService,
    pricingService,
    verificationService,
    adminMessageService,
    
    // Agent & Analytics
    agentService,
    agentShareAnalyticsService,
    recruitLookupService,
    adminAgentOverviewService,
    agentVisitService,
    monthlyAgentMetricsService,
} from './appwrite/index';

// ============= LEGACY SERVICES (Still in this file) =============
// These services are pending migration to modular structure
// TODO: Extract these to separate service files

import { databases, storage, APPWRITE_CONFIG, functions } from './appwrite/config';
import { ID, Query } from 'appwrite';

// Hotel/Villa Booking Service - Extract to services/hotel-booking.service.ts
export { hotelVillaBookingService } from './appwriteService.LEGACY';

// Member Stats Service - Extract to services/member-stats.service.ts  
export { memberStatsService } from './appwriteService.LEGACY';

// Subscription Service - Extract to services/subscription.service.ts
export { subscriptionService } from './appwriteService.LEGACY';

// Lead Generation Service - Extract to services/lead-generation.service.ts
export { leadGenerationService } from './appwriteService.LEGACY';

// Membership Package Service - Extract to services/membership-package.service.ts
export { membershipPackageService } from './appwriteService.LEGACY';
export type { MembershipPackage } from './appwriteService.LEGACY';

// Lead Billing Service - Extract to services/lead-billing.service.ts
export { leadBillingService } from './appwriteService.LEGACY';

// Payment Confirmation Service - Extract to services/payment-confirmation.service.ts
export { paymentConfirmationService } from './appwriteService.LEGACY';

// Premium Payments Service - Extract to services/premium-payments.service.ts
export { premiumPaymentsService } from './appwriteService.LEGACY';

// Therapist Menus Service - Extract to services/therapist-menus.service.ts
export { therapistMenusService } from './appwriteService.LEGACY';

// Simple Chat Service - Lightweight chat implementation
export { default as simpleChatService } from './simpleChatService';

// Simple Booking Service - Re-export if exists, otherwise create stub
export const simpleBookingService = {
    createBooking: async (bookingData: any) => {
        console.log('Simple booking service placeholder', bookingData);
        return null;
    }
};

// ============= MIGRATION NOTES =============
/*
 * BEFORE: 6,463 lines (causes VS Code crash)
 * CURRENT: ~120 lines (just re-exports + legacy services)
 * TARGET: 0 lines (delete this file when all services migrated)
 *
 * Services migrated so far:
 * ✅ therapistService
 * ✅ placesService  
 * ✅ facialPlaceService
 * ✅ hotelService
 * ✅ userService
 * ✅ bookingService
 * ✅ reviewService
 * ✅ notificationService
 * ✅ messagingService
 * ✅ paymentService
 * ✅ membershipService
 * ✅ imageUploadService
 * ✅ customLinksService
 * ✅ translationsService
 * ✅ pricingService
 * ✅ verificationService
 * ✅ adminMessageService
 * ✅ agentService
 * ✅ agentShareAnalyticsService
 * ✅ recruitLookupService
 * ✅ adminAgentOverviewService
 * ✅ agentVisitService
 * ✅ monthlyAgentMetricsService
 *
 * Still in LEGACY file (to be migrated):
 * ⏳ hotelVillaBookingService
 * ⏳ memberStatsService
 * ⏳ subscriptionService
 * ⏳ leadGenerationService
 * ⏳ membershipPackageService
 * ⏳ leadBillingService
 * ⏳ paymentConfirmationService
 * ⏳ premiumPaymentsService
 * ⏳ therapistMenusService
 */









