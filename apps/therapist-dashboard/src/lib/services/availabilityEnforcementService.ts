/**
 * Local re-export for therapist dashboard
 * Eliminates deep relative imports that break Netlify builds
 */

export * from '../../../../../src/lib/services/availabilityEnforcementService';
export { availabilityEnforcementService } from '../../../../../src/lib/services/availabilityEnforcementService';