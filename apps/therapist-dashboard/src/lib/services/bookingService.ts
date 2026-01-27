/**
 * Local re-export for therapist dashboard
 * Eliminates deep relative imports that break Netlify builds
 */

export * from '../../../../../src/lib/bookingService';
export { bookingService } from '../../../../../src/lib/bookingService';