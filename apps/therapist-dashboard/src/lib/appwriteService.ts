/**
 * Local re-export for therapist dashboard
 * Eliminates deep relative imports that break Netlify builds
 */

export * from '../../../../src/lib/appwriteService';
export {
  authService,
  therapistService,
  bookingService,
  messagingService,
  imageUploadService,
  paymentConfirmationService,
  premiumPaymentsService,
  therapistMenusService,
  notificationService,
  paymentService,
  APPWRITE_CONFIG
} from '../../../../src/lib/appwriteService';

// Get databases, Query, ID from the services/_shared module
export {
  databases,
  Query,
  ID
} from '../../../../src/lib/services/_shared';