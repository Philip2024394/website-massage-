/**
 * Local re-export for therapist dashboard
 * Eliminates deep relative imports that break Netlify builds
 */

export * from '../../../../src/lib/appwrite';
export { databases, Query, ID } from '../../../../src/lib/appwrite';