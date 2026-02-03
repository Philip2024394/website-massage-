/**
 * Therapist "On the Way" Service
 * Handles therapist status updates and customer notifications when therapist is traveling to location
 */

import { mp3NotificationService } from './mp3NotificationService';

export interface TherapistLocation {
  latitude: number;
  longitude: number;
  address: string;
  timestamp: Date;
}

export interface OnTheWayStatus {
  bookingId: string;
  therapistId: string;
  therapistName: string;
  customerName: string;
  customerPhone: string;
  departureTime: Date;
  estimatedArrival: Date;
  currentLocation?: TherapistLocation;
  status: 'departed' | 'en_route' | 'nearby' | 'arrived';
  notifications: {
    customerNotified: boolean;
    nearbyAlertSent: boolean;
    arrivalConfirmed: boolean;
  };
}

class TherapistOnTheWayService {
  private activeJourneys = new Map<string, OnTheWayStatus>();
  private locationTracking = new Map<string, NodeJS.Timeout>();

  /**
   * Therapist clicks "On the Way" button after accepting booking
   */
  async setOnTheWay(
    bookingId: string,
    therapistId: string,
    therapistName: string,
    customerName: string,
    customerPhone: string,
    estimatedTravelMinutes: number = 30
  ): Promise<OnTheWayStatus> {
    const departureTime = new Date();
    const estimatedArrival = new Date(departureTime.getTime() + estimatedTravelMinutes * 60000);

    const journeyStatus: OnTheWayStatus = {
      bookingId,
      therapistId,
      therapistName,
      customerName,
      customerPhone,
      departureTime,
      estimatedArrival,
      status: 'departed',
      notifications: {
        customerNotified: false,
        nearbyAlertSent: false,
        arrivalConfirmed: false
      }
    };

    this.activeJourneys.set(bookingId, journeyStatus);

    // Immediately notify customer
    await this.notifyCustomerTherapistDeparted(journeyStatus);

    // Start location tracking (optional)
    this.startLocationTracking(bookingId);

    // Schedule arrival reminder
    this.scheduleArrivalReminder(journeyStatus);

    console.log(`✅ Therapist ${therapistName} is on the way to booking ${bookingId}`);
    return journeyStatus;
  }

  /**
   * Notify customer that therapist is on the way
   */
  private async notifyCustomerTherapistDeparted(journey: OnTheWayStatus): Promise<void> {
    const message = `🚗 **${journey.therapistName} is on the way!**

Hi ${journey.customerName}! 

Your therapist is now heading to your location and will be with you soon.

⏰ **Estimated arrival:** ${journey.estimatedArrival.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    })}

🏠 **Please prepare:**
• Clear and comfortable massage area
• Have towels ready
• Ensure easy access to your location
• Keep your phone nearby for updates

Thank you for choosing IndasTreet Massage! 🙏

---
*Your therapist will update you when they're nearby*`;

    // Send to customer chat
    await this.sendToCustomerChat(journey.bookingId, journey.customerPhone, message);

    // Play notification sound for customer
    await mp3NotificationService.playNotification('gentle_chime');

    // Update notification status
    journey.notifications.customerNotified = true;
    this.activeJourneys.set(journey.bookingId, journey);

    console.log(`📱 Customer ${journey.customerName} notified - therapist is on the way`);
  }

  /**
   * Send message to customer chat
   */
  private async sendToCustomerChat(bookingId: string, customerPhone: string, message: string): Promise<void> {
    // This would integrate with your chat system
    console.log(`💬 [CHAT] To customer ${customerPhone}:`, message);

    // Trigger browser notification for customer
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Your therapist is on the way! 🚗', {
        body: 'Please prepare your massage area. Arrival time updated.',
        icon: '/icon-192.png',
        tag: `therapist-ontheway-${bookingId}`
      });
    }

    // You would implement actual chat message sending here
    // await chatService.sendMessage(bookingId, message, 'system');
  }

  /**
   * Optional: Start tracking therapist location (requires permission)
   */
  private startLocationTracking(bookingId: string): void {
    if (!navigator.geolocation) {
      console.log('⚠️ Geolocation not supported');
      return;
    }

    const trackingInterval = setInterval(() => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const journey = this.activeJourneys.get(bookingId);
          if (!journey) {
            clearInterval(trackingInterval);
            return;
          }

          journey.currentLocation = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            address: 'Current location',
            timestamp: new Date()
          };

          journey.status = 'en_route';
          this.activeJourneys.set(bookingId, journey);

          // Check if therapist is nearby (within 500 meters)
          this.checkIfNearby(journey);
        },
        (error) => console.log('Location tracking error:', error),
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
      );
    }, 30000); // Track every 30 seconds

    this.locationTracking.set(bookingId, trackingInterval);
  }

  /**
   * Check if therapist is nearby customer location
   */
  private async checkIfNearby(journey: OnTheWayStatus): Promise<void> {
    if (!journey.currentLocation || journey.notifications.nearbyAlertSent) return;

    // This would calculate distance to customer location
    // For now, simulate nearby detection after 80% of estimated time
    const elapsedTime = Date.now() - journey.departureTime.getTime();
    const totalEstimatedTime = journey.estimatedArrival.getTime() - journey.departureTime.getTime();
    
    if (elapsedTime >= totalEstimatedTime * 0.8) {
      await this.notifyCustomerTherapistNearby(journey);
    }
  }

  /**
   * Notify customer when therapist is nearby
   */
  private async notifyCustomerTherapistNearby(journey: OnTheWayStatus): Promise<void> {
    const message = `📍 **${journey.therapistName} is nearby!**

Your therapist is just a few minutes away from your location.

⏰ **Arriving very soon**

🚪 Please be ready to answer the door and guide them to your massage area.

See you shortly! 😊`;

    await this.sendToCustomerChat(journey.bookingId, journey.customerPhone, message);

    // Play more urgent notification sound
    await mp3NotificationService.playNotification('appointment_alert');

    journey.status = 'nearby';
    journey.notifications.nearbyAlertSent = true;
    this.activeJourneys.set(journey.bookingId, journey);

    console.log(`📍 Customer notified - therapist ${journey.therapistName} is nearby`);
  }

  /**
   * Therapist confirms arrival at customer location
   */
  async confirmArrival(bookingId: string): Promise<void> {
    const journey = this.activeJourneys.get(bookingId);
    if (!journey) {
      console.error('Journey not found for booking:', bookingId);
      return;
    }

    journey.status = 'arrived';
    journey.notifications.arrivalConfirmed = true;

    // Stop location tracking
    const trackingInterval = this.locationTracking.get(bookingId);
    if (trackingInterval) {
      clearInterval(trackingInterval);
      this.locationTracking.delete(bookingId);
    }

    // Notify customer of arrival
    const message = `✅ **${journey.therapistName} has arrived!**

Your therapist is now at your location and ready to begin your massage session.

Please let them in and enjoy your relaxing massage! 🧘‍♀️✨`;

    await this.sendToCustomerChat(journey.bookingId, journey.customerPhone, message);
    
    // Play success sound
    await mp3NotificationService.playNotification('booking_confirmed');

    this.activeJourneys.set(bookingId, journey);
    
    console.log(`✅ Therapist ${journey.therapistName} confirmed arrival for booking ${bookingId}`);
  }

  /**
   * Schedule reminder notification when therapist should be arriving
   */
  private scheduleArrivalReminder(journey: OnTheWayStatus): void {
    const reminderTime = new Date(journey.estimatedArrival.getTime() - 5 * 60000); // 5 minutes before
    
    const notification = {
      id: `arrival_reminder_${journey.bookingId}`,
      type: 'booking_reminder' as const,
      scheduledFor: reminderTime,
      soundId: 'spa_bell',
      message: `Therapist arriving in 5 minutes`,
      bookingId: journey.bookingId,
      metadata: {
        customerName: journey.customerName,
        therapistName: journey.therapistName,
        serviceType: 'Massage',
        appointmentTime: journey.estimatedArrival.toLocaleString()
      }
    };

    mp3NotificationService.scheduleNotification(notification);
  }

  /**
   * Get current journey status for a booking
   */
  getJourneyStatus(bookingId: string): OnTheWayStatus | null {
    return this.activeJourneys.get(bookingId) || null;
  }

  /**
   * Get all active journeys
   */
  getActiveJourneys(): OnTheWayStatus[] {
    return Array.from(this.activeJourneys.values());
  }

  /**
   * Cancel journey tracking (if booking is cancelled)
   */
  cancelJourney(bookingId: string): void {
    const trackingInterval = this.locationTracking.get(bookingId);
    if (trackingInterval) {
      clearInterval(trackingInterval);
      this.locationTracking.delete(bookingId);
    }

    this.activeJourneys.delete(bookingId);
    
    // Cancel any scheduled notifications
    mp3NotificationService.cancelNotification(`arrival_reminder_${bookingId}`);

    console.log(`❌ Journey cancelled for booking ${bookingId}`);
  }

  /**
   * Update estimated arrival time
   */
  async updateEstimatedArrival(bookingId: string, newEstimatedMinutes: number): Promise<void> {
    const journey = this.activeJourneys.get(bookingId);
    if (!journey) return;

    const newArrival = new Date(Date.now() + newEstimatedMinutes * 60000);
    journey.estimatedArrival = newArrival;

    // Notify customer of updated time
    const message = `⏰ **Arrival time updated**

${journey.therapistName} will arrive at approximately **${newArrival.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    })}**

Thank you for your patience! 🙏`;

    await this.sendToCustomerChat(journey.bookingId, journey.customerPhone, message);
    
    this.activeJourneys.set(bookingId, journey);
    
    console.log(`⏰ Updated arrival time for booking ${bookingId}: ${newArrival.toLocaleTimeString()}`);
  }
}

// Export singleton instance
export const therapistOnTheWayService = new TherapistOnTheWayService();

export default therapistOnTheWayService;