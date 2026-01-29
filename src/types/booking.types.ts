/**
 * Production-grade TypeScript interfaces for chat-driven booking system
 * Enterprise architecture with strict typing and validation
 */

// Core booking status states with explicit transitions
export type BookingStatus = 
  | 'idle'           // Initial state, no booking active
  | 'searching'      // Actively matching therapists 
  | 'pending_accept' // Therapist found, awaiting user confirmation
  | 'active'         // Booking confirmed, therapist dispatched
  | 'cancelled'      // User cancelled at any stage
  | 'completed'      // Service completed successfully

// Message sender types with clear distinction
export type MessageSenderType = 'system' | 'user' | 'therapist'

// Service duration enum for validation
export type ServiceDuration = '60' | '90' | '120'

// Core booking data model for chat-driven booking flow
export interface ChatBooking {
  readonly id: string
  readonly userId: string
  readonly therapistId?: string // Optional until matched
  readonly status: BookingStatus
  readonly serviceDuration: ServiceDuration
  readonly price: number
  readonly location: {
    address: string
    coordinates: {
      lat: number
      lng: number
    }
  }
  readonly createdAt: string
  readonly updatedAt: string
  readonly metadata?: {
    searchAttempts: number
    lastSearchAt?: string
    cancellationReason?: string
  }
}

// Chat message data model
export interface ChatMessage {
  readonly id: string
  readonly conversationId: string
  readonly senderType: MessageSenderType
  readonly senderId?: string // Optional for system messages
  readonly senderName?: string
  readonly content: string
  readonly timestamp: string
  readonly messageType?: 'text' | 'system_card' | 'therapist_card'
  readonly metadata?: {
    booking?: Partial<ChatBooking>
    therapist?: TherapistMatch
    systemAction?: SystemMessageAction
  }
}

// Therapist matching data model
export interface TherapistMatch {
  readonly id: string
  readonly name: string
  readonly photo: string
  readonly rating: number
  readonly distance: number // kilometers
  readonly eta: number // minutes
  readonly specialties: string[]
  readonly isAvailable: boolean
  readonly location?: {
    lat: number
    lng: number
  }
}

// Search configuration
export interface SearchConfig {
  readonly maxRadius: number // kilometers
  readonly maxSearchTime: number // seconds
  readonly retryAttempts: number
  readonly serviceDuration: ServiceDuration
  readonly userLocation: {
    lat: number
    lng: number
  }
}

// System message actions for type safety
export type SystemMessageAction = 
  | 'booking_initiated'
  | 'searching_therapists'
  | 'therapist_found'
  | 'booking_confirmed'
  | 'booking_cancelled'
  | 'search_timeout'
  | 'error_occurred'

// Service confirmation data
export interface ServiceConfirmation {
  readonly duration: ServiceDuration
  readonly price: number
  readonly location: string
  readonly coordinates: {
    lat: number
    lng: number
  }
}

// Booking creation request
export interface CreateBookingRequest {
  readonly userId: string
  readonly serviceDuration: ServiceDuration
  readonly location: {
    address: string
    coordinates: {
      lat: number
      lng: number
    }
  }
  readonly customerDetails: {
    name: string
    whatsapp: string
  }
}

// Therapist search result
export interface TherapistSearchResult {
  readonly success: boolean
  readonly therapist?: TherapistMatch
  readonly error?: string
  readonly searchId: string
  readonly nextRetryAt?: string
}

// Booking state for UI components
export interface BookingUIState {
  readonly isSearching: boolean
  readonly countdown: number | null
  readonly currentTherapist: TherapistMatch | null
  readonly showConfirmation: boolean
  readonly error: string | null
  readonly canCancel: boolean
}

// Function response types
export interface AppwriteFunctionResponse<T = any> {
  readonly success: boolean
  readonly data?: T
  readonly error?: {
    code: string
    message: string
    details?: any
  }
}

// Validation schemas
export const BOOKING_VALIDATION = {
  SERVICE_DURATIONS: ['60', '90', '120'] as const,
  MIN_PRICE: 100000, // IDR
  MAX_PRICE: 2000000, // IDR
  MAX_SEARCH_RADIUS: 50, // km
  DEFAULT_SEARCH_TIME: 60, // seconds
  MAX_RETRY_ATTEMPTS: 5
} as const

// Error codes for consistent error handling
export enum BookingErrorCode {
  INVALID_INPUT = 'INVALID_INPUT',
  THERAPIST_NOT_FOUND = 'THERAPIST_NOT_FOUND',
  BOOKING_CANCELLED = 'BOOKING_CANCELLED',
  SEARCH_TIMEOUT = 'SEARCH_TIMEOUT',
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
  NETWORK_ERROR = 'NETWORK_ERROR'
}

export class BookingError extends Error {
  constructor(
    public readonly code: BookingErrorCode,
    message: string,
    public readonly details?: any
  ) {
    super(message)
    this.name = 'BookingError'
  }
}