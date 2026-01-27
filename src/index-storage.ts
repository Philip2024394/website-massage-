/**
 * Elite Chat & Booking Storage - Main Entry Point
 * 
 * Exports all modules for easy importing
 * 
 * @module chatBookingStorage
 */

// Utils
export * as storage from './utils/storageHelper';
export * as versioning from './utils/versioning';

// Chat modules
export * as chatStorage from './chat/chatStorage';
export * as chatWindow from './chat/chatWindow';
export { chatAutosaveService } from './chat/chatAutosave';

// Booking modules
export * as bookingDraft from './booking/bookingDraft';
export * as bookingSync from './booking/bookingSync';
export * as bookingValidator from './booking/bookingValidator';

// Re-export hook
export { useChatBookingStorage, useStorageHealth, useAutosaveIndicator } from './hooks/useChatBookingStorage';
