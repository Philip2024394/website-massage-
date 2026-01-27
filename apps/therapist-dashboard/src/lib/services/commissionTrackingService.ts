/**
 * Local re-export for therapist dashboard
 * Eliminates deep relative imports that break Netlify builds
 */

export * from '../../../../../src/lib/services/commissionTrackingService';
export { commissionTrackingService } from '../../../../../src/lib/services/commissionTrackingService';