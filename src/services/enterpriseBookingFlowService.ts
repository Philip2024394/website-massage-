import { logger } from './enterpriseLogger';
/**
 * 🏢 ENTERPRISE BOOKING FLOW SERVICE
 * 
 * Complete booking flow management for therapists, places, and users
 * - Real-time booking coordination
 * - 5-minute countdown timer system
 * - Automatic therapist fallback
 * - Audio notifications
 * - Enterprise-grade reliability
 * - WhatsApp-free communication
 */

import { bookingService } from '../lib/bookingService';
// import { enterpriseMonitoringService } from './enterpriseMonitoringService'; // Commented out to avoid import errors
// Note: bookingSoundService removed - using browser Audio API instead

export interface BookingRequest {
  id: string;
  userId: string;
  userDetails: {
    name: string;
    phone: string;
    location: string;
  };
  serviceType: 'book-now' | 'scheduled';
  scheduledTime?: Date;
  services: Array<{
    id: string;
    name: string;
    duration: number;
    price: number;
  }>;
  totalPrice: number;
  duration: number;
  location: {
    address: string;
    coordinates: { lat: number; lng: number };
  };
  preferredTherapists?: string[];
  urgency: 'low' | 'normal' | 'high' | 'emergency';
  createdAt: Date;
  expiresAt: Date;
  status: 'pending' | 'assigned' | 'accepted' | 'rejected' | 'expired' | 'completed';
  assignedTherapist?: string;
  chatRoomId?: string;
}

export interface TherapistResponse {
  therapistId: string;
  bookingId: string;
  response: 'accept' | 'reject';
  responseTime: number;
  reason?: string;
}

export interface BookingFlowMetrics {
  totalRequests: number;
  acceptanceRate: number;
  averageResponseTime: number;
  timeoutRate: number;
  activeTherapists: number;
}

/**
 * Enterprise-grade booking flow coordinator
 */
class EnterpriseBookingFlowService {
  private activeBookings = new Map<string, BookingRequest>();
  private therapistTimers = new Map<string, NodeJS.Timeout>();
  private fallbackQueues = new Map<string, string[]>();
  private metrics: BookingFlowMetrics = {
    totalRequests: 0,
    acceptanceRate: 0,
    averageResponseTime: 0,
    timeoutRate: 0,
    activeTherapists: 0
  };

  /**
   * Initialize booking flow with real-time listeners
   */
  async initialize(): Promise<void> {
    try {
      logger.info('🚀 Initializing Enterprise Booking Flow Service...');
      
      // Set up real-time booking listeners
      await this.setupRealtimeListeners();
      
      // Audio notification system ready (using browser Audio API)
      logger.info('🔊 Audio notification system ready');
      
      // Start monitoring active therapists
      this.startTherapistMonitoring();
      
      logger.info('✅ Enterprise Booking Flow Service initialized');
      
    } catch (error) {
      logger.error('❌ Failed to initialize booking flow:', error);
      throw error;
    }
  }

  /**
   * Create new booking request with enterprise flow
   */
  async createBookingRequest(request: Omit<BookingRequest, 'id' | 'createdAt' | 'expiresAt' | 'status'>): Promise<string> {
    const bookingId = `booking_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date();
    const expiresAt = new Date(now.getTime() + (5 * 60 * 1000)); // 5 minutes

    const bookingRequest: BookingRequest = {
      ...request,
      id: bookingId,
      createdAt: now,
      expiresAt,
      status: 'pending'
    };

    this.activeBookings.set(bookingId, bookingRequest);
    this.metrics.totalRequests++;

    logger.info(`📋 Created booking request: ${bookingId} (${request.serviceType})`);

    // Start booking flow
    await this.initiateBookingFlow(bookingRequest);

    return bookingId;
  }

  /**
   * Initiate enterprise booking flow
   */
  private async initiateBookingFlow(request: BookingRequest): Promise<void> {
    try {
      // Get available therapists based on location and preferences
      const availableTherapists = await this.getAvailableTherapists(request);
      
      if (availableTherapists.length === 0) {
        await this.handleNoTherapistsAvailable(request);
        return;
      }

      // Create chat room for communication
      const chatRoomId = await this.createChatRoom(request);
      request.chatRoomId = chatRoomId;

      // Start with first therapist (priority-based)
      await this.assignToTherapist(request, availableTherapists[0], availableTherapists.slice(1));

    } catch (error) {
      logger.error('❌ Booking flow initiation failed:', error);
      await this.handleBookingError(request, error as Error);
    }
  }

  /**
   * Assign booking to specific therapist with countdown
   */
  private async assignToTherapist(
    request: BookingRequest, 
    therapistId: string, 
    fallbackTherapists: string[]
  ): Promise<void> {
    request.assignedTherapist = therapistId;
    request.status = 'assigned';
    
    this.fallbackQueues.set(request.id, fallbackTherapists);

    logger.info(`👨‍⚕️ Assigned booking ${request.id} to therapist ${therapistId}`);

    // Notify therapist with audio alert
    await this.notifyTherapist(therapistId, request);

    // Start 5-minute countdown timer
    this.startCountdownTimer(request, therapistId, fallbackTherapists);

    // Update booking in database
    await this.updateBookingStatus(request);
  }

  /**
   * Notify therapist with enterprise-grade alerts
   */
  private async notifyTherapist(therapistId: string, request: BookingRequest): Promise<void> {
    try {
      // Play audio notification using browser Audio API
      try {
        const audio = new Audio(request.urgency === 'emergency' ? '/sounds/emergency-booking.mp3' : '/sounds/new-booking.mp3');
        audio.volume = 0.8;
        audio.play().catch(err => logger.warn('Audio play failed:', err));
      } catch (err) {
        logger.warn('⚠️ [NOTIFY] Audio notification failed:', err);
      }

      // Send real-time notification
      await this.sendRealtimeNotification(therapistId, {
        type: 'booking-request',
        bookingId: request.id,
        userDetails: request.userDetails,
        services: request.services,
        totalPrice: request.totalPrice,
        urgency: request.urgency,
        location: request.location,
        expiresAt: request.expiresAt,
        chatRoomId: request.chatRoomId
      });

      // Auto-open chat window on therapist device
      await this.autoOpenTherapistChat(therapistId, request.chatRoomId!);

      logger.info(`🔔 Notified therapist ${therapistId} with audio + real-time alert`);

    } catch (error) {
      logger.error('❌ Therapist notification failed:', error);
    }
  }

  /**
   * Start countdown timer for therapist response
   */
  private startCountdownTimer(
    request: BookingRequest, 
    therapistId: string, 
    fallbackTherapists: string[]
  ): void {
    const timer = setTimeout(async () => {
      logger.info(`⏰ Timeout for therapist ${therapistId} on booking ${request.id}`);
      
      await this.handleTherapistTimeout(request, fallbackTherapists);
      
    }, 5 * 60 * 1000); // 5 minutes

    this.therapistTimers.set(`${request.id}_${therapistId}`, timer);
  }

  /**
   * Handle therapist response (accept/reject)
   */
  async handleTherapistResponse(response: TherapistResponse): Promise<void> {
    const request = this.activeBookings.get(response.bookingId);
    if (!request || request.assignedTherapist !== response.therapistId) {
      logger.warn('⚠️ Invalid therapist response:', response);
      return;
    }

    // Clear timeout timer
    const timerId = `${response.bookingId}_${response.therapistId}`;
    const timer = this.therapistTimers.get(timerId);
    if (timer) {
      clearTimeout(timer);
      this.therapistTimers.delete(timerId);
    }

    if (response.response === 'accept') {
      await this.handleBookingAcceptance(request, response);
    } else {
      await this.handleBookingRejection(request, response);
    }

    // Update metrics
    this.updateMetrics(response);
  }

  /**
   * Handle booking acceptance
   */
  private async handleBookingAcceptance(request: BookingRequest, response: TherapistResponse): Promise<void> {
    request.status = 'accepted';
    
    logger.info(`✅ Booking ${request.id} accepted by therapist ${response.therapistId}`);

    // Notify user of acceptance
    await this.notifyUserBookingAccepted(request, response.therapistId);

    // Play success sound for user using browser Audio API
    try {
      const audio = new Audio('/sounds/booking-success.mp3');
      audio.volume = 0.7;
      audio.play().catch(err => logger.warn('Audio play failed:', err));
    } catch (err) {
      logger.warn('⚠️ [ACCEPT] Audio notification failed:', err);
    }

    // Start chat session between user and therapist
    await this.initiateUserTherapistChat(request, response.therapistId);

    // Remove from active bookings queue
    this.activeBookings.delete(request.id);
    this.fallbackQueues.delete(request.id);
  }

  /**
   * Handle booking rejection
   */
  private async handleBookingRejection(request: BookingRequest, response: TherapistResponse): Promise<void> {
    logger.error(`❌ Booking ${request.id} rejected by therapist ${response.therapistId}: ${response.reason}`);

    const fallbackTherapists = this.fallbackQueues.get(request.id) || [];
    
    if (fallbackTherapists.length > 0) {
      // Try next therapist
      const nextTherapist = fallbackTherapists[0];
      const remainingTherapists = fallbackTherapists.slice(1);
      
      await this.assignToTherapist(request, nextTherapist, remainingTherapists);
    } else {
      // No more therapists available
      await this.handleNoMoreTherapists(request);
    }
  }

  /**
   * Handle therapist timeout (no response within 5 minutes)
   */
  private async handleTherapistTimeout(request: BookingRequest, fallbackTherapists: string[]): Promise<void> {
    logger.warn(`⏰ Therapist timeout for booking ${request.id}`);
    
    this.metrics.timeoutRate++;

    if (fallbackTherapists.length > 0) {
      // Try next therapist
      const nextTherapist = fallbackTherapists[0];
      const remainingTherapists = fallbackTherapists.slice(1);
      
      await this.assignToTherapist(request, nextTherapist, remainingTherapists);
    } else {
      // Broadcast to all available therapists
      await this.broadcastToAllTherapists(request);
    }
  }

  /**
   * Broadcast booking to all available therapists
   */
  private async broadcastToAllTherapists(request: BookingRequest): Promise<void> {
    logger.info(`📢 Broadcasting booking ${request.id} to all available therapists`);
    
    const allAvailableTherapists = await this.getAvailableTherapists(request);
    
    if (allAvailableTherapists.length === 0) {
      await this.handleNoTherapistsAvailable(request);
      return;
    }

    // Notify all therapists simultaneously
    const notifications = allAvailableTherapists.map(therapistId => 
      this.notifyTherapist(therapistId, request)
    );

    await Promise.allSettled(notifications);

    // Start new timer for broadcast response
    this.startBroadcastTimer(request);
  }

  /**
   * Start broadcast timer (shorter timeout for emergency)
   */
  private startBroadcastTimer(request: BookingRequest): void {
    const timer = setTimeout(async () => {
      logger.warn(`⏰ Broadcast timeout for booking ${request.id}`);
      await this.handleNoTherapistsAvailable(request);
    }, 2 * 60 * 1000); // 2 minutes for broadcast

    this.therapistTimers.set(`broadcast_${request.id}`, timer);
  }

  /**
   * Create chat room for booking communication
   */
  private async createChatRoom(request: BookingRequest): Promise<string> {
    const chatRoomId = `chat_booking_${request.id}`;
    
    // Initialize chat room with booking context
    await this.initializeChatRoom(chatRoomId, {
      bookingId: request.id,
      userId: request.userId,
      userDetails: request.userDetails,
      services: request.services,
      location: request.location,
      type: 'booking-chat'
    });

    logger.info(`💬 Created chat room: ${chatRoomId} for booking ${request.id}`);
    
    return chatRoomId;
  }

  /**
   * Auto-open chat window on therapist device
   */
  private async autoOpenTherapistChat(therapistId: string, chatRoomId: string): Promise<void> {
    try {
      await this.sendRealtimeNotification(therapistId, {
        type: 'auto-open-chat',
        chatRoomId,
        action: 'open-chat-window',
        priority: 'high'
      });
    } catch (error) {
      logger.error('❌ Failed to auto-open therapist chat:', error);
    }
  }

  /**
   * Get available therapists based on location and preferences
   * Note: This is a placeholder - actual implementation requires therapist service integration
   */
  private async getAvailableTherapists(request: BookingRequest): Promise<string[]> {
    try {
      // TODO: Integrate with actual therapist availability service
      // For now, return empty array to allow compilation
      // This should be replaced with actual therapist matching logic
      
      logger.warn('⚠️ getAvailableTherapists: Using placeholder implementation');
      
      // When integrated, this should:
      // 1. Query therapists near the location
      // 2. Filter by service types
      // 3. Check online/availability status
      // 4. Prioritize preferred therapists
      // 5. Sort by rating, distance, response time
      
      return [];

    } catch (error) {
      logger.error('❌ Failed to get available therapists:', error);
      return [];
    }
  }

  /**
   * Sort therapists by priority (rating, distance, response time)
   */
  private sortTherapistsByPriority(therapistIds: string[], request: BookingRequest): string[] {
    // Implementation would sort by rating, distance, previous response times
    // For now, return as-is (can be enhanced with actual therapist data)
    return therapistIds;
  }

  /**
   * Handle no therapists available scenario
   */
  private async handleNoTherapistsAvailable(request: BookingRequest): Promise<void> {
    logger.warn(`⚠️ No therapists available for booking ${request.id}`);
    
    request.status = 'expired';
    
    // Notify user
    await this.notifyUserNoTherapists(request);
    
    // Play alert sound using browser Audio API
    try {
      const audio = new Audio('/sounds/no-therapists-alert.mp3');
      audio.volume = 0.7;
      audio.play().catch(err => logger.warn('Audio play failed:', err));
    } catch (err) {
      logger.warn('⚠️ [NO_THERAPISTS] Audio notification failed:', err);
    }
    
    // Clean up
    this.activeBookings.delete(request.id);
    this.fallbackQueues.delete(request.id);
  }

  /**
   * Handle no more therapists in queue
   */
  private async handleNoMoreTherapists(request: BookingRequest): Promise<void> {
    logger.warn(`⚠️ No more therapists for booking ${request.id}`);
    
    // Try broadcasting one more time
    await this.broadcastToAllTherapists(request);
  }

  /**
   * Real-time notification system
   */
  private async sendRealtimeNotification(userId: string, notification: any): Promise<void> {
    try {
      // Implementation would use WebSocket/Socket.IO or Appwrite Realtime
      logger.info(`📡 Sending real-time notification to ${userId}:`, notification);
      
      // Simulate real-time notification
      if (typeof window !== 'undefined' && (window as any).realtimeService) {
        (window as any).realtimeService.send(userId, notification);
      }
      
    } catch (error) {
      logger.error('❌ Real-time notification failed:', error);
    }
  }

  /**
   * Initialize chat room with booking context
   */
  private async initializeChatRoom(chatRoomId: string, context: any): Promise<void> {
    try {
      // Implementation would create chat room in database
      logger.info(`💬 Initializing chat room ${chatRoomId} with context:`, context);
      
    } catch (error) {
      logger.error('❌ Chat room initialization failed:', error);
    }
  }

  /**
   * Notify user of booking acceptance
   */
  private async notifyUserBookingAccepted(request: BookingRequest, therapistId: string): Promise<void> {
    await this.sendRealtimeNotification(request.userId, {
      type: 'booking-accepted',
      bookingId: request.id,
      therapistId,
      chatRoomId: request.chatRoomId,
      message: 'Your booking has been accepted! You can now chat with your therapist.'
    });
  }

  /**
   * Notify user when no therapists available
   */
  private async notifyUserNoTherapists(request: BookingRequest): Promise<void> {
    await this.sendRealtimeNotification(request.userId, {
      type: 'booking-failed',
      bookingId: request.id,
      reason: 'no-therapists-available',
      message: 'Sorry, no therapists are currently available. Please try again later.'
    });
  }

  /**
   * Start chat session between user and therapist
   */
  private async initiateUserTherapistChat(request: BookingRequest, therapistId: string): Promise<void> {
    try {
      // Send initial chat messages
      const welcomeMessage = {
        chatRoomId: request.chatRoomId!,
        senderId: 'system',
        message: `Chat started for booking #${request.id.substr(-8)}. Your therapist will arrive at ${request.location.address}.`,
        type: 'system'
      };

      await this.sendChatMessage(welcomeMessage);

      logger.info(`💬 Initiated chat between user ${request.userId} and therapist ${therapistId}`);
      
    } catch (error) {
      logger.error('❌ Failed to initiate chat:', error);
    }
  }

  /**
   * Send chat message
   */
  private async sendChatMessage(message: any): Promise<void> {
    try {
      // Implementation would send message through chat service
      logger.info('💬 Sending chat message:', message);
      
    } catch (error) {
      logger.error('❌ Failed to send chat message:', error);
    }
  }

  /**
   * Map enterprise booking status to database booking status
   */
  private mapBookingStatus(status: BookingRequest['status']): 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'searching' {
    const statusMap: Record<BookingRequest['status'], 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'searching'> = {
      'pending': 'pending',
      'assigned': 'searching',
      'accepted': 'confirmed',
      'rejected': 'cancelled',
      'expired': 'cancelled',
      'completed': 'completed'
    };
    
    return statusMap[status];
  }

  /**
   * Update booking status in database
   */
  private async updateBookingStatus(request: BookingRequest): Promise<void> {
    try {
      const dbStatus = this.mapBookingStatus(request.status);
      await bookingService.updateBookingStatus(request.id, dbStatus, {
        assignedTherapist: request.assignedTherapist,
        chatRoomId: request.chatRoomId
      });
      
    } catch (error) {
      logger.error('❌ Failed to update booking status:', error);
    }
  }

  /**
   * Handle booking error
   */
  private async handleBookingError(request: BookingRequest, error: Error): Promise<void> {
    logger.error(`❌ Booking error for ${request.id}:`, error);
    
    request.status = 'expired';
    
    await this.notifyUserBookingError(request, error);
    
    this.activeBookings.delete(request.id);
    this.fallbackQueues.delete(request.id);
  }

  /**
   * Notify user of booking error
   */
  private async notifyUserBookingError(request: BookingRequest, error: Error): Promise<void> {
    await this.sendRealtimeNotification(request.userId, {
      type: 'booking-error',
      bookingId: request.id,
      error: error.message,
      message: 'An error occurred while processing your booking. Please try again.'
    });
  }

  /**
   * Update service metrics
   */
  private updateMetrics(response: TherapistResponse): void {
    if (response.response === 'accept') {
      this.metrics.acceptanceRate = (this.metrics.acceptanceRate + 1) / this.metrics.totalRequests * 100;
    }
    
    const avgResponseTime = this.metrics.averageResponseTime || 0;
    this.metrics.averageResponseTime = (avgResponseTime + response.responseTime) / 2;
  }

  /**
   * Setup real-time listeners
   */
  private async setupRealtimeListeners(): Promise<void> {
    try {
      // Setup WebSocket/Appwrite Realtime listeners
      logger.info('🔄 Setting up real-time booking listeners...');
      
      // Listen for therapist responses
      // Listen for user cancellations
      // Listen for system events
      
    } catch (error) {
      logger.error('❌ Failed to setup real-time listeners:', error);
    }
  }

  /**
   * Start monitoring active therapists
   */
  private startTherapistMonitoring(): void {
    setInterval(async () => {
      try {
        const activeCount = await this.getActiveTherapistCount();
        this.metrics.activeTherapists = activeCount;
        
      } catch (error) {
        logger.error('❌ Therapist monitoring failed:', error);
      }
    }, 30000); // Check every 30 seconds
  }

  /**
   * Get active therapist count
   */
  private async getActiveTherapistCount(): Promise<number> {
    try {
      // Implementation would query database for online therapists
      return 0; // Placeholder
    } catch (error) {
      return 0;
    }
  }

  /**
   * Get service metrics
   */
  getMetrics(): BookingFlowMetrics {
    return { ...this.metrics };
  }

  /**
   * Get active bookings
   */
  getActiveBookings(): BookingRequest[] {
    return Array.from(this.activeBookings.values());
  }

  /**
   * Clean up expired bookings
   */
  private cleanupExpiredBookings(): void {
    const now = new Date();
    
    for (const [id, booking] of this.activeBookings.entries()) {
      if (booking.expiresAt < now) {
        logger.info(`🧹 Cleaning up expired booking: ${id}`);
        
        this.activeBookings.delete(id);
        this.fallbackQueues.delete(id);
        
        // Clear any timers
        const timer = this.therapistTimers.get(`${id}_${booking.assignedTherapist}`);
        if (timer) {
          clearTimeout(timer);
          this.therapistTimers.delete(`${id}_${booking.assignedTherapist}`);
        }
      }
    }
  }

  /**
   * Start cleanup interval
   */
  private startCleanupInterval(): void {
    setInterval(() => {
      this.cleanupExpiredBookings();
    }, 60000); // Clean up every minute
  }
}

// Singleton instance
export const enterpriseBookingFlowService = new EnterpriseBookingFlowService();

// Auto-initialize
if (typeof window !== 'undefined') {
  enterpriseBookingFlowService.initialize().catch(err => logger.error('Booking flow initialization failed:', { error: err }));
}

export default enterpriseBookingFlowService;