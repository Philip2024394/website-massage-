/**
 * Local re-export for therapist dashboard
 * Eliminates deep relative imports that break Netlify builds
 */

export * from '../../../../../src/lib/services/serverEnforcedChatService';
export { serverEnforcedChatService } from '../../../../../src/lib/services/serverEnforcedChatService';