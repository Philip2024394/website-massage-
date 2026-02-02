/**
 * ============================================================================
 * 🔄 BOOKING TYPES - STEP 13 CORE EXTRACTION
 * ============================================================================
 * 
 * PURPOSE: Define exact types for booking operations
 * 
 * RULES:
 * - Clear success vs error states
 * - No ambiguous return types
 * - Deterministic error messages
 * - Testable in isolation
 * 
 * ============================================================================
 */

import { ValidationError } from './booking.contract';

// BOOKING SUCCESS RESPONSE
export interface BookingCreateSuccess {
  success: true;
  bookingId: string;
  message: string;
  timestamp: Date;
  data: {
    customerName: string;
    serviceType: string;
    duration: number;
    location: string;
    status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  };
}

// BOOKING ERROR TYPES
export type BookingErrorType = 
  | 'VALIDATION_FAILED'
  | 'APPWRITE_ERROR' 
  | 'NETWORK_ERROR'
  | 'UNKNOWN_ERROR'
  | 'CONTRACT_VIOLATION';

export interface BookingCreateError {
  success: false;
  errorType: BookingErrorType;
  message: string;
  timestamp: Date;
  details?: {
    validationErrors?: ValidationError[];
    appwriteError?: {
      code: number;
      message: string;
      type: string;
    };
    networkError?: {
      status?: number;
      message: string;
    };
    originalError?: unknown;
  };
}

// UNION TYPE FOR CREATE BOOKING RESULT
export type BookingCreateResult = BookingCreateSuccess | BookingCreateError;

// APPWRITE DOCUMENT INTERFACE (matches Appwrite collection structure)
export interface BookingDocument {
  $id?: string;
  $collectionId?: string;
  $databaseId?: string;
  $createdAt?: string;
  $updatedAt?: string;
  $permissions?: string[];
  
  // Our booking fields
  customerName: string;
  customerPhone: string;
  customerWhatsApp?: string;
  serviceType: 'massage' | 'facial' | 'spa';
  serviceDescription?: string;
  duration: 60 | 90 | 120;
  preferredDateTime?: string; // ISO string for Appwrite
  flexible?: boolean;
  preferredProvider?: {
    id: string;
    type: 'therapist' | 'place';
    name: string;
  };
  location: {
    address: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  specialRequests?: string;
  accessibilityNeeds?: string[];
  source?: 'web' | 'whatsapp' | 'chat' | 'admin';
  chatSessionId?: string;
  affiliateCode?: string;
  budget?: {
    min: number;
    max: number;
    currency: 'IDR' | 'USD';
  };
  
  // System fields
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
}

// TYPE GUARDS
export function isBookingSuccess(result: BookingCreateResult): result is BookingCreateSuccess {
  return result.success === true;
}

export function isBookingError(result: BookingCreateResult): result is BookingCreateError {
  return result.success === false;
}

// ERROR FACTORY FUNCTIONS
export function createValidationError(
  validationErrors: ValidationError[]
): BookingCreateError {
  return {
    success: false,
    errorType: 'VALIDATION_FAILED',
    message: `Validation failed: ${validationErrors.map(e => e.message).join(', ')}`,
    timestamp: new Date(),
    details: {
      validationErrors
    }
  };
}

export function createAppwriteError(
  appwriteError: any
): BookingCreateError {
  return {
    success: false,
    errorType: 'APPWRITE_ERROR',
    message: appwriteError?.message || 'Appwrite operation failed',
    timestamp: new Date(),
    details: {
      appwriteError: {
        code: appwriteError?.code || 0,
        message: appwriteError?.message || 'Unknown Appwrite error',
        type: appwriteError?.type || 'unknown'
      },
      originalError: appwriteError
    }
  };
}

export function createNetworkError(
  error: any,
  status?: number
): BookingCreateError {
  return {
    success: false,
    errorType: 'NETWORK_ERROR',
    message: 'Network request failed',
    timestamp: new Date(),
    details: {
      networkError: {
        status,
        message: error?.message || 'Network request failed'
      },
      originalError: error
    }
  };
}

export function createUnknownError(
  error: any
): BookingCreateError {
  return {
    success: false,
    errorType: 'UNKNOWN_ERROR',
    message: error?.message || 'An unexpected error occurred',
    timestamp: new Date(),
    details: {
      originalError: error
    }
  };
}

export function createContractViolationError(
  message: string
): BookingCreateError {
  return {
    success: false,
    errorType: 'CONTRACT_VIOLATION',
    message: `Contract violation: ${message}`,
    timestamp: new Date()
  };
}

// SUCCESS FACTORY FUNCTION
export function createBookingSuccess(
  bookingId: string,
  bookingData: BookingDocument
): BookingCreateSuccess {
  return {
    success: true,
    bookingId,
    message: 'Booking created successfully',
    timestamp: new Date(),
    data: {
      customerName: bookingData.customerName,
      serviceType: bookingData.serviceType,
      duration: bookingData.duration,
      location: bookingData.location.address,
      status: bookingData.status
    }
  };
}