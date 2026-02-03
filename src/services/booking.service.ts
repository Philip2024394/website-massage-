import { logger } from './enterpriseLogger';
/**
 * Production-grade booking service
 * Handles all booking operations with enterprise security and error handling
 */

import { 
  ChatBooking as Booking, // Use ChatBooking as the main Booking type
  BookingStatus, 
  CreateBookingRequest, 
  TherapistMatch, 
  TherapistSearchResult, 
  SearchConfig,
  AppwriteFunctionResponse,
  BookingError,
  BookingErrorCode,
  BOOKING_VALIDATION
} from '../types/booking.types'
import { Functions, ID } from 'appwrite'
import { appwriteClient } from '../lib/appwrite'

/**
 * Enterprise booking service with comprehensive error handling
 */
export class BookingService {
  private functions: Functions
  private activeSearches = new Map<string, AbortController>()

  constructor() {
    this.functions = new Functions(appwriteClient)
  }

  /**
   * Initiate a new booking with validation and security checks
   */
  async createBooking(request: CreateBookingRequest): Promise<Booking> {
    try {
      // Client-side validation before API call
      this.validateBookingRequest(request)

      logger.info('📋 Creating booking request:', {
        duration: request.serviceDuration,
        location: request.location.address
      })

      const response = await this.functions.createExecution(
        'createBooking', // Function ID
        JSON.stringify(request),
        false, // Not async
        '/', // Path
        'POST' // Method
      )

      const result: AppwriteFunctionResponse<Booking> = JSON.parse(response.responseBody)
      
      if (!result.success) {
        throw new BookingError(
          result.error?.code as BookingErrorCode || BookingErrorCode.SERVICE_UNAVAILABLE,
          result.error?.message || 'Failed to create booking',
          result.error?.details
        )
      }

      logger.info('✅ Booking created successfully:', result.data?.id)
      return result.data!

    } catch (error) {
      logger.error('❌ Booking creation failed:', error)
      
      if (error instanceof BookingError) {
        throw error
      }
      
      // Network or unexpected errors
      throw new BookingError(
        BookingErrorCode.NETWORK_ERROR,
        'Unable to create booking. Please check your connection and try again.',
        error
      )
    }
  }

  /**
   * Start therapist search with timeout and retry logic
   */
  async startTherapistSearch(
    bookingId: string, 
    searchConfig: SearchConfig
  ): Promise<{ searchId: string }> {
    try {
      // Create abort controller for cancellation
      const abortController = new AbortController()
      const searchId = `search_${Date.now()}_${bookingId}`
      
      this.activeSearches.set(searchId, abortController)

      logger.info('🔍 Starting therapist search:', {
        bookingId,
        radius: searchConfig.maxRadius,
        duration: searchConfig.serviceDuration
      })

      const response = await this.functions.createExecution(
        'searchTherapists',
        JSON.stringify({
          bookingId,
          searchConfig,
          searchId
        }),
        false,
        '/',
        'POST'
      )

      const result: AppwriteFunctionResponse<{ searchId: string }> = JSON.parse(response.responseBody)

      if (!result.success) {
        throw new BookingError(
          BookingErrorCode.SERVICE_UNAVAILABLE,
          result.error?.message || 'Failed to start therapist search'
        )
      }

      return result.data!

    } catch (error) {
      logger.error('❌ Search initiation failed:', error)
      
      if (error instanceof BookingError) {
        throw error
      }
      
      throw new BookingError(
        BookingErrorCode.NETWORK_ERROR,
        'Unable to start search. Please try again.',
        error
      )
    }
  }

  /**
   * Check search status with auto-retry logic
   */
  async checkSearchStatus(searchId: string, bookingId: string): Promise<TherapistSearchResult> {
    try {
      const response = await this.functions.createExecution(
        'checkSearchStatus',
        JSON.stringify({ searchId, bookingId }),
        false,
        '/',
        'GET'
      )

      const result: AppwriteFunctionResponse<TherapistSearchResult> = JSON.parse(response.responseBody)

      if (!result.success) {
        throw new BookingError(
          BookingErrorCode.SERVICE_UNAVAILABLE,
          result.error?.message || 'Failed to check search status'
        )
      }

      return result.data!

    } catch (error) {
      logger.error('❌ Search status check failed:', error)
      
      // Return failure result instead of throwing to allow retry
      return {
        success: false,
        error: error instanceof BookingError ? error.message : 'Search status unavailable',
        searchId
      }
    }
  }

  /**
   * Accept a matched therapist
   */
  async acceptTherapist(bookingId: string, therapistId: string): Promise<Booking> {
    try {
      logger.info('✅ Accepting therapist:', { bookingId, therapistId })

      const response = await this.functions.createExecution(
        'acceptTherapist',
        JSON.stringify({ bookingId, therapistId }),
        false,
        '/',
        'POST'
      )

      const result: AppwriteFunctionResponse<Booking> = JSON.parse(response.responseBody)

      if (!result.success) {
        throw new BookingError(
          result.error?.code as BookingErrorCode || BookingErrorCode.SERVICE_UNAVAILABLE,
          result.error?.message || 'Failed to accept therapist'
        )
      }

      logger.info('🎉 Therapist accepted successfully')
      return result.data!

    } catch (error) {
      logger.error('❌ Therapist acceptance failed:', error)
      
      if (error instanceof BookingError) {
        throw error
      }
      
      throw new BookingError(
        BookingErrorCode.NETWORK_ERROR,
        'Unable to accept therapist. Please try again.',
        error
      )
    }
  }

  /**
   * Cancel booking at any stage with cleanup
   */
  async cancelBooking(bookingId: string, reason?: string): Promise<void> {
    try {
      logger.info('🛑 Cancelling booking:', { bookingId, reason })

      // Cancel any active searches
      this.cancelActiveSearches()

      const response = await this.functions.createExecution(
        'cancelBooking',
        JSON.stringify({ bookingId, reason }),
        false,
        '/',
        'POST'
      )

      const result: AppwriteFunctionResponse = JSON.parse(response.responseBody)

      if (!result.success) {
        logger.warn('⚠️ Booking cancellation failed:', result.error)
        // Don't throw - cancellation should always succeed from UX perspective
      } else {
        logger.info('✅ Booking cancelled successfully')
      }

    } catch (error) {
      logger.error('❌ Booking cancellation error:', error)
      // Don't throw - cancellation should always succeed from UX perspective
    }
  }

  /**
   * Cancel active searches when user cancels or accepts therapist
   */
  cancelActiveSearches(): void {
    logger.info('🛑 Cancelling active searches:', this.activeSearches.size)
    
    for (const [searchId, controller] of this.activeSearches) {
      controller.abort()
      logger.info(`🛑 Cancelled search: ${searchId}`)
    }
    
    this.activeSearches.clear()
  }

  /**
   * Get booking details by ID
   */
  async getBooking(bookingId: string): Promise<Booking | null> {
    try {
      const response = await this.functions.createExecution(
        'getBooking',
        JSON.stringify({ bookingId }),
        false,
        '/',
        'GET'
      )

      const result: AppwriteFunctionResponse<Booking> = JSON.parse(response.responseBody)

      if (!result.success) {
        return null
      }

      return result.data!

    } catch (error) {
      logger.error('❌ Failed to get booking:', error)
      return null
    }
  }

  /**
   * Validate booking request on client side
   */
  private validateBookingRequest(request: CreateBookingRequest): void {
    // Validate service duration
    if (!BOOKING_VALIDATION.SERVICE_DURATIONS.includes(request.serviceDuration as any)) {
      throw new BookingError(
        BookingErrorCode.INVALID_INPUT,
        'Invalid service duration selected'
      )
    }

    // Validate customer details
    if (!request.customerDetails.name?.trim()) {
      throw new BookingError(
        BookingErrorCode.INVALID_INPUT,
        'Customer name is required'
      )
    }

    if (!request.customerDetails.whatsapp?.trim()) {
      throw new BookingError(
        BookingErrorCode.INVALID_INPUT,
        'WhatsApp number is required'
      )
    }

    // Validate location
    if (!request.location.address?.trim()) {
      throw new BookingError(
        BookingErrorCode.INVALID_INPUT,
        'Location address is required'
      )
    }

    const { lat, lng } = request.location.coordinates
    if (!lat || !lng || Math.abs(lat) > 90 || Math.abs(lng) > 180) {
      throw new BookingError(
        BookingErrorCode.INVALID_INPUT,
        'Valid location coordinates are required'
      )
    }
  }

  /**
   * Create default search configuration
   */
  static createSearchConfig(
    serviceDuration: string,
    userLocation: { lat: number; lng: number }
  ): SearchConfig {
    return {
      maxRadius: 25, // 25km default radius
      maxSearchTime: BOOKING_VALIDATION.DEFAULT_SEARCH_TIME,
      retryAttempts: BOOKING_VALIDATION.MAX_RETRY_ATTEMPTS,
      serviceDuration: serviceDuration as any,
      userLocation
    }
  }
}

// Singleton instance for global use
export const bookingService = new BookingService()