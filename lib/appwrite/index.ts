// New modular structure - individual service exports
export { appwriteClient, appwriteDatabases, appwriteAccount, appwriteStorage } from './client';
export { authService } from './auth.service';
export { imagePoolService, getNonRepeatingMainImage, getRandomLiveMenuImage } from './image.service';

// New domain services (extracted from monolith)
export { imageUploadService } from './services/image.service';
export { notificationService } from './services/notification.service';
export { therapistService } from './services/therapist.service';
export { placesService } from './services/places.service';
export { bookingService } from './services/booking.service';
export { membershipService } from './services/membership.service';
export { reviewService } from './services/review.service';
export { userService } from './services/user.service';
export { paymentService } from './services/payment.service';

// Temporary: Re-export everything from the legacy monolith
// TODO: Migrate these services one by one to domain-specific service files
export {
    customLinksService,
    hotelService,
    agentShareAnalyticsService,
    recruitLookupService,
    agentService,
    adminAgentOverviewService,
    translationsService,
    messagingService,
    pricingService,
    verificationService,
    adminMessageService,
    hotelVillaBookingService,
    agentVisitService,
    monthlyAgentMetricsService,
} from '../appwriteService';

// Backward compatibility aliases
export { placesService as placeService } from './services/places.service';
