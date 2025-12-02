/**
 * Service Layer - Central Export
 * 
 * This barrel file provides organized access to all services.
 * Future: Split appwriteService.ts into individual service files here.
 */

// Re-export all services from the main appwriteService
// TODO: Refactor appwriteService.ts into individual files under this directory
export {
  // Core
  appwriteClient,
  appwriteDatabases,
  appwriteAccount,
  
  // Image & Media
  imageUploadService,
  getRandomLiveMenuImage,
  
  // Business Logic Services
  therapistService,
  placeService,
  userService,
  authService,
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
  recruitLookupService,
  
  // Hotel/Villa
  hotelVillaBookingService,
  
  // Shop & Coins (deprecated but kept for compatibility)
  shopItemService,
  coinService,
  shopOrderService,
  
  // Utilities
  customLinksService,
} from '../appwriteService';
