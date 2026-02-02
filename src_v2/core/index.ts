/**
 * ============================================================================
 * 🏗️ CORE LAYER - SINGLE SOURCE OF TRUTH
 * ============================================================================
 * 
 * PURPOSE:
 * This is the ONLY place where business logic and data access happens.
 * Features NEVER talk to APIs directly — they ONLY call core functions.
 * 
 * ARCHITECTURE RULES:
 * - ONE Appwrite client (no duplicates)
 * - ONE booking function (no scattered logic)
 * - ONE place for all data operations
 * - Features call core, core calls APIs
 * 
 * THE FIX:
 * This eliminates "Both message sending and booking creation failed" by:
 * - Preventing Appwrite client conflicts
 * - Centralizing all booking logic
 * - Ensuring consistent data operations
 * - Single transaction handling
 * 
 * BOUNDARY PROTECTION:
 * - Core can import utilities only
 * - Features can import from core
 * - Core NEVER imports from features or shell
 * - Shell NEVER imports from core directly
 * 
 * ============================================================================
 */

// Single Appwrite client (THE FIX for duplicate client issues)
export { appwriteClient, databases, account, storage } from './clients/appwrite';

// Core services (THE FIX for scattered business logic)
export { BookingService } from './services/BookingService';
export { ChatService } from './services/ChatService';
export { TherapistService } from './services/TherapistService';
export { PaymentService } from './services/PaymentService';
export { NotificationService } from './services/NotificationService';

// Core types (shared across all features)
export type {
  // Booking types
  Booking,
  BookingRequest,
  BookingStatus,
  BookingResponse,
  
  // User types  
  User,
  Therapist,
  Client,
  UserProfile,
  
  // Service types
  Service,
  ServiceCategory,
  ServiceRequest,
  
  // System types
  ApiResponse,
  PaginatedResponse,
  ErrorResponse
} from './types';

// Core utilities
export { 
  formatCurrency,
  formatDate,
  validateEmail,
  validatePhone,
  generateId,
  sanitizeInput,
  handleError,
  createApiResponse
} from './utils';

// Core constants
export { 
  API_ENDPOINTS,
  DATABASE_IDS,
  COLLECTION_IDS,
  STORAGE_BUCKETS,
  ERROR_CODES,
  BOOKING_STATUSES
} from './constants';

// Feature metadata for dependency tracking
export const CORE_METADATA = {
  name: 'core-layer',
  version: '1.0.0',
  description: 'Centralized business logic and data access layer',
  dependencies: [],
  exports: [
    'appwriteClient',
    'BookingService',
    'ChatService', 
    'TherapistService',
    'PaymentService',
    'NotificationService'
  ],
  isolation: {
    canImport: ['utilities', 'constants'],
    cannotImport: ['features', 'shell', 'external-apis'],
    exportedTo: ['features']
  }
} as const;

export default {
  CORE_METADATA,
  version: '1.0.0',
  initialized: true
};