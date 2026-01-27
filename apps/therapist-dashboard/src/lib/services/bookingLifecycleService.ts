/**
 * Local re-export for therapist dashboard
 * Eliminates deep relative imports that break Netlify builds
 */

export * from '../../../../../src/lib/services/bookingLifecycleService';
export { bookingLifecycleService } from '../../../../../src/lib/services/bookingLifecycleService';