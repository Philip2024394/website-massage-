/**
 * Service Layer - Central Export
 * 
 * Modular service architecture with backwards compatibility.
 * Services are being migrated from LEGACY file to individual modules.
 */

// Core Appwrite Configuration
export { appwriteClient, appwriteDatabases, appwriteAccount, APPWRITE_CONFIG } from './appwrite.base';

// Migrated Services (from individual files)
export { imageUploadService } from './image.service';

// Membership Services (modular structure)
export * from './membership/plans.config';
export * from './membership/types';

// Legacy Services (still from LEGACY file - will be migrated)
export {
  getRandomLiveMenuImage,
  getNonRepeatingMainImage,
  
  // Business Logic Services
  therapistService,
  placesService as placeService,
  facialPlaceService,
  hotelService,
  userService,
  bookingService,
  notificationService,
  reviewService,
  messagingService,
  pricingService,
  verificationService,
  translationsService,
  
  // Admin & Analytics
  adminMessageService,
  adminAgentOverviewService,
  agentService,
  agentShareAnalyticsService,
  agentVisitService,
  monthlyAgentMetricsService,
  memberStatsService,
  recruitLookupService,
  
  // Hotel/Villa
  hotelVillaBookingService,
  
  // Membership & Payments (being migrated)
  membershipService,
  subscriptionService,
  paymentService,
  leadGenerationService,
  
  // Utilities
  customLinksService,
} from '../appwriteService.LEGACY';
// Booking System Services
export { bookingLifecycleService, BookingLifecycleStatus, BookingType } from './bookingLifecycleService';
export { bookingCalendarService, ReminderType } from './bookingCalendarService';
export { adminCommissionService, CommissionStatus, ADMIN_REACTIVATION_FEE } from './adminCommissionService';
export { adminRevenueTrackerService } from './adminRevenueTrackerService';
export { availabilityEnforcementService, TherapistAvailabilityStatus } from './availabilityEnforcementService';
export { secureBankCardService } from './secureBankCardService';
export { antiContactEnforcementService, ViolationType, UserRole } from './antiContactEnforcementService';