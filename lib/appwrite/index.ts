// New modular structure - individual service exports
export { appwriteClient, appwriteDatabases, appwriteAccount, appwriteStorage } from './client';
export { authService } from './auth.service';
export { imagePoolService, getNonRepeatingMainImage, getRandomLiveMenuImage } from './image.service';

// Temporary: Re-export everything from the legacy monolith
// TODO: Migrate these services one by one
export {
    imageUploadService,
    customLinksService,
    therapistService,
    placesService as placeService,
    hotelService,
    agentShareAnalyticsService,
    recruitLookupService,
    userService,
    agentService,
    adminAgentOverviewService,
    translationsService,
    reviewService,
    bookingService,
    notificationService,
    messagingService,
    pricingService,
    verificationService,
    adminMessageService,
    hotelVillaBookingService,
    agentVisitService,
    monthlyAgentMetricsService,
} from '../appwriteService';
