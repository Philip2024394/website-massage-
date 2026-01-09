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

// 🔗 Share Links & Social Media Services
export { shareLinkService } from './shareLinkService';
export { shareLinksValidationService } from './shareLinksValidationService';
export { shareLinksAutoInitService, ensureEntityShareLink } from './shareLinksAutoInitService';

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

// 🔒 Server-Enforced Contact Validation (Tamper Resistant)
export { serverEnforcedChatService } from './serverEnforcedChatService';
export type { SendMessageRequest, SendMessageResponse, ViolationType } from './serverEnforcedChatService';

// 🔒 Payment Confirmation + Auto Review Request
export { paymentConfirmationService } from './paymentConfirmationService';
export type { ConfirmPaymentRequest, ConfirmPaymentResponse, ProviderType } from './paymentConfirmationService';
export { secureReviewLinkService } from './secureReviewLinkService';

// 🔒 Review Submission (Server-Enforced)
export { reviewSubmissionService } from './reviewSubmissionService';
export type { SubmitReviewRequest, SubmitReviewResponse, TargetType } from './reviewSubmissionService';

// Legacy client-side enforcement (kept for reference, server is primary)
export { antiContactEnforcementService, UserRole } from './antiContactEnforcementService';