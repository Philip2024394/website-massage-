// New modular structure - individual service exports
export { appwriteClient, appwriteDatabases, appwriteAccount, appwriteStorage } from './client';
export { authService } from './auth.service';
export { imagePoolService, getNonRepeatingMainImage, getRandomLiveMenuImage } from './image.service';

// Domain services (extracted from monolith)
export { imageUploadService } from './services/image.service';
export { notificationService } from './services/notification.service';
export { therapistService } from './services/therapist.service';
export { placesService } from './services/places.service';
export { bookingService } from './services/booking.service';
export { membershipService } from './services/membership.service';
export { reviewService } from './services/review.service';
export { userService } from './services/user.service';
export { paymentService } from './services/payment.service';
export { hotelService } from './services/hotel.service';
export { facialPlaceService } from './services/facial.service';
export { customLinksService } from './services/customLinks.service';
export { translationsService } from './services/translation.service';
export { directoryMassageTypesService } from './services/directoryMassageTypes.service';
export { messagingService } from './services/messaging.service';
export { pricingService } from './services/pricing.service';
export { verificationService } from './services/verification.service';
export { adminMessageService } from './services/admin-message.service';
export { agentService } from './services/agent.service';
export {
    agentShareAnalyticsService,
    recruitLookupService,
    adminAgentOverviewService,
    agentVisitService,
    monthlyAgentMetricsService
} from './services/agent-analytics.service';

// Re-export remaining services from legacy monolith (TODO: Extract these)
export {
    hotelVillaBookingService,
    memberStatsService,
    subscriptionService,
    leadGenerationService,
    membershipPackageService,
    leadBillingService,
    paymentConfirmationService,
    premiumPaymentsService,
    therapistMenusService,
} from '../appwriteService';

// Backward compatibility aliases
export { placesService as placeService } from './services/places.service';
