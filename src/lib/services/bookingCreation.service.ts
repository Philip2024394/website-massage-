/**
 * �🔒 BOOKING CREATION SERVICE - REVENUE CRITICAL 🔒🚨
 * 
 * FINANCIAL IMPACT: Direct revenue generation for 120+ users
 * PROTECTION STATUS: 🟢 LOCKED - STABLE PRODUCTION
 * INTEGRATION: Chat + Appwrite + Payment Processing
 * 
 * 🚫 AI AGENTS - CRITICAL WARNING:
 * This service creates real bookings that generate actual revenue.
 * Bugs here = Lost money + Angry customers + System failures
 * 
 * 🔐 PROTECTED METHODS:
 * - createBookingWithChat() - Core booking creation
 * - Payment integration logic
 * - Chat room creation
 * - Database transactions
 * 
 * ⚠️ PRODUCTION DATA:
 * - Creates real Appwrite documents
 * - Triggers actual payment processing
 * - Sends notifications to real users
 * - Updates therapist availability
 * 
 * 🔑 UNLOCK REQUIRED FOR CHANGES
 * Format: "UNLOCK BOOKING_CREATION WITH CODE: [code] FOR: [specific change]"
 */

/**
 * �🚀 BOOKING CREATION WITH CHAT INTEGRATION
 * 
 * Purpose: Helper functions to create bookings that automatically open chat windows
 * Features:
 * - Creates booking in Appwrite
 * - Creates associated chat room
 * - Opens chat window with booking banner
 * - Sets up notification timers
 * - Handles user authentication
 */

import { bookingChatIntegrationService, BookingChatData } from './bookingChatIntegration.service';
import { bookingNotificationService } from './bookingNotification.service';

export interface CreateBookingParams {
  therapistId: string;
  therapistName: string;
  therapistPhoto?: string;
  serviceType: string;
  duration: number; // minutes
  price: number;
  bookingType: 'book_now' | 'scheduled';
  scheduledDate?: string; // YYYY-MM-DD format
  scheduledTime?: string; // HH:MM format
  location?: string;
  coordinates?: { lat: number; lng: number };
  customerWhatsApp?: string;
}

export interface BookingResult {
  success: boolean;
  bookingId?: string;
  chatRoomId?: string;
  responseDeadline?: string;
  error?: string;
}

class BookingCreationService {

  /**
   * Create a booking and immediately open chat window with booking banner
   */
  async createBookingWithChat(params: CreateBookingParams): Promise<BookingResult> {
    try {
      console.log('🎯 Creating booking with integrated chat for:', params.therapistName);

      // Validate required fields
      if (!params.therapistId || !params.therapistName || !params.serviceType) {
        return {
          success: false,
          error: 'Missing required booking information'
        };
      }

      // Create booking with chat room
      const bookingData = await bookingChatIntegrationService.createBookingWithChat({
        therapistId: params.therapistId,
        therapistName: params.therapistName,
        serviceType: params.serviceType,
        duration: params.duration,
        bookingType: params.bookingType,
        scheduledDate: params.scheduledDate,
        scheduledTime: params.scheduledTime,
        location: params.location,
        coordinates: params.coordinates,
        totalPrice: params.price
      });

      if (!bookingData) {
        return {
          success: false,
          error: 'Failed to create booking. Please try again.'
        };
      }

      console.log('✅ Booking created successfully:', bookingData.bookingId);

      // Setup notification permissions and timers
      const hasNotificationPermission = await bookingNotificationService.showNotificationOnboarding();
      
      if (hasNotificationPermission) {
        // Setup automatic notification timers
        bookingNotificationService.setupBookingTimers(
          bookingData.bookingId,
          bookingData.chatRoomId,
          bookingData.responseDeadline,
          bookingData.therapistName,
          bookingData.serviceType
        );
      }

      // Trigger chat window to open by dispatching custom event
      const chatOpenEvent = new CustomEvent('open-booking-chat', {
        detail: {
          chatRoomId: bookingData.chatRoomId,
          bookingId: bookingData.bookingId,
          therapistName: bookingData.therapistName,
          serviceType: bookingData.serviceType,
          bookingType: bookingData.bookingType,
          responseDeadline: bookingData.responseDeadline,
          bookingStatus: 'pending'
        }
      });
      
      window.dispatchEvent(chatOpenEvent);
      
      console.log('📨 Chat window open event dispatched');

      return {
        success: true,
        bookingId: bookingData.bookingId,
        chatRoomId: bookingData.chatRoomId,
        responseDeadline: bookingData.responseDeadline
      };

    } catch (error: any) {
      console.error('❌ Error creating booking with chat:', error);
      
      return {
        success: false,
        error: error.message || 'An unexpected error occurred'
      };
    }
  }

  /**
   * Quick book now - immediate booking with default settings
   */
  async quickBookNow(params: {
    therapistId: string;
    therapistName: string;
    therapistPhoto?: string;
    serviceType?: string;
    duration?: number;
    price: number;
    location?: string;
    coordinates?: { lat: number; lng: number };
  }): Promise<BookingResult> {
    return this.createBookingWithChat({
      ...params,
      serviceType: params.serviceType || 'Massage',
      duration: params.duration || 60,
      bookingType: 'book_now'
    });
  }

  /**
   * Schedule booking for specific date/time
   */
  async scheduleBooking(params: {
    therapistId: string;
    therapistName: string;
    therapistPhoto?: string;
    serviceType: string;
    duration: number;
    price: number;
    scheduledDate: string;
    scheduledTime: string;
    location?: string;
    coordinates?: { lat: number; lng: number };
  }): Promise<BookingResult> {
    return this.createBookingWithChat({
      ...params,
      bookingType: 'scheduled'
    });
  }

  /**
   * Cancel a booking and update chat room status
   */
  async cancelBooking(bookingId: string, reason?: string): Promise<boolean> {
    try {
      console.log('🚫 Cancelling booking:', bookingId);

      const success = await bookingChatIntegrationService.updateBookingStatus(
        bookingId, 
        'cancelled', 
        reason || 'Cancelled by customer'
      );

      if (success) {
        // Notify about cancellation
        await bookingNotificationService.showNotification({
          title: '🚫 Booking Cancelled',
          body: 'Your booking has been cancelled successfully.',
          tag: `booking-cancelled-${bookingId}`,
          data: { type: 'booking_cancelled', bookingId }
        });

        // Dispatch event to update chat window
        const cancelEvent = new CustomEvent('booking-cancelled', {
          detail: { bookingId, reason }
        });
        window.dispatchEvent(cancelEvent);

        console.log('✅ Booking cancelled successfully');
      }

      return success;

    } catch (error) {
      console.error('❌ Error cancelling booking:', error);
      return false;
    }
  }

  /**
   * Accept a booking (for therapists)
   */
  async acceptBooking(bookingId: string, chatRoomId: string): Promise<boolean> {
    try {
      console.log('✅ Accepting booking:', bookingId);

      const success = await bookingChatIntegrationService.updateBookingStatus(
        bookingId,
        'accepted'
      );

      if (success) {
        // Notify customer about acceptance
        await bookingNotificationService.notifyBookingStatus(
          'accepted',
          'Therapist', // Will be replaced with actual therapist name
          'Massage',   // Will be replaced with actual service type
          bookingId,
          chatRoomId
        );

        console.log('✅ Booking accepted successfully');
      }

      return success;

    } catch (error) {
      console.error('❌ Error accepting booking:', error);
      return false;
    }
  }

  /**
   * Reject a booking (for therapists)
   */
  async rejectBooking(bookingId: string, chatRoomId: string, reason?: string): Promise<boolean> {
    try {
      console.log('❌ Rejecting booking:', bookingId);

      const success = await bookingChatIntegrationService.updateBookingStatus(
        bookingId,
        'rejected',
        reason || 'Therapist not available'
      );

      if (success) {
        // Notify customer about rejection
        await bookingNotificationService.notifyBookingStatus(
          'rejected',
          'Therapist', // Will be replaced with actual therapist name
          'Massage',   // Will be replaced with actual service type  
          bookingId,
          chatRoomId
        );

        console.log('✅ Booking rejected successfully');
      }

      return success;

    } catch (error) {
      console.error('❌ Error rejecting booking:', error);
      return false;
    }
  }

  /**
   * Get booking status with chat integration
   */
  async getBookingWithChatStatus(bookingId: string): Promise<BookingChatData | null> {
    try {
      // This would need to be implemented in the integration service
      console.log('📋 Getting booking with chat status:', bookingId);
      // TODO: Implement this method in bookingChatIntegrationService
      return null;

    } catch (error) {
      console.error('❌ Error getting booking status:', error);
      return null;
    }
  }
}

export const bookingCreationService = new BookingCreationService();

// Export helper functions for easy use
export const createBookingWithChat = (params: CreateBookingParams) => 
  bookingCreationService.createBookingWithChat(params);

export const quickBookNow = (params: Parameters<typeof bookingCreationService.quickBookNow>[0]) =>
  bookingCreationService.quickBookNow(params);

export const scheduleBooking = (params: Parameters<typeof bookingCreationService.scheduleBooking>[0]) =>
  bookingCreationService.scheduleBooking(params);

export const cancelBooking = (bookingId: string, reason?: string) =>
  bookingCreationService.cancelBooking(bookingId, reason);