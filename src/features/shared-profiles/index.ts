/**
 * Shared Profiles Feature Index
 * Export all components and utilities
 */

export { SharedTherapistProfile } from './SharedTherapistProfile';
export { SharedPlaceProfile } from './SharedPlaceProfile';
export { SharedFacialProfile } from './SharedFacialProfile';
export { SharedProfileLayout } from './SharedProfileLayout';

export { useSharedProfile } from './hooks/useSharedProfile';

export {
    generateTherapistShareURL,
    generatePlaceShareURL,
    generateFacialShareURL,
    extractProviderIdFromURL,
    generateShareText,
    copyShareURLToClipboard
} from './utils/shareUrlBuilder';
