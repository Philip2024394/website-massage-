/**
 * 📅 BOOKING CALENDAR SERVICE
 * Automatic calendar integration for CONFIRMED bookings
 * 
 * Features:
 * - Auto-add to therapist calendar when booking becomes CONFIRMED
 * - Reminder notifications timeline:
 *   - 6 hours before booking
 *   - Every hour thereafter until booking time
 * 
 * Notifications delivered via:
 * - Chat window (in-app)
 * - Dashboard alerts
 */

import { databases, ID, Query, client } from '../appwrite';
import { APPWRITE_CONFIG } from '../appwrite.config';
import { BookingLifecycleStatus, BookingType } from './bookingLifecycleService';

// ============================================================================
// CALENDAR EVENT TYPES
// ============================================================================

export interface CalendarEvent {
  $id?: string;
  eventId: string;
  
  // Booking reference
  bookingId: string;
  bookingDocId: string;
  
  // Provider info
  therapistId: string;
  therapistName: string;
  
  // Customer info
  customerId: string;
  customerName: string;
  customerPhone: string;
  
  // Event details
  serviceType: string;
  serviceName: string;
  duration: number; // minutes
  
  // Scheduling
  scheduledDate: string;       // ISO date (YYYY-MM-DD)
  scheduledTime: string;       // Time (HH:MM)
  scheduledDateTime: string;   // Full ISO datetime
  endDateTime: string;         // Calculated end time
  
  // Location
  location: string;
  locationCoordinates?: {
    lat: number;
    lng: number;
  };
  
  // Status
  eventStatus: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  
  // Reminder tracking
  remindersSent: string[];     // Array of reminder IDs sent
  nextReminderAt?: string;     // Next scheduled reminder
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
}

export interface BookingReminder {
  $id?: string;
  reminderId: string;
  
  // References
  bookingId: string;
  eventId: string;
  therapistId: string;
  customerId: string;
  
  // Reminder details
  reminderType: ReminderType;
  scheduledFor: string;        // When to send
  sentAt?: string;             // When actually sent
  
  // Notification channels
  sentToChat: boolean;
  sentToDashboard: boolean;
  
  // Status
  status: 'PENDING' | 'SENT' | 'FAILED' | 'SKIPPED';
  
  // Message
  title: string;
  message: string;
  
  createdAt: string;
}

export enum ReminderType {
  HOURS_6 = 'HOURS_6',         // 6 hours before
  HOURS_5 = 'HOURS_5',         // 5 hours before
  HOURS_4 = 'HOURS_4',         // 4 hours before
  HOURS_3 = 'HOURS_3',         // 3 hours before
  HOURS_2 = 'HOURS_2',         // 2 hours before
  HOURS_1 = 'HOURS_1',         // 1 hour before
  MINUTES_30 = 'MINUTES_30',   // 30 minutes before
  MINUTES_15 = 'MINUTES_15',   // 15 minutes before
  NOW = 'NOW',                 // Booking time
}

// ============================================================================
// REMINDER TIMELINE CONFIGURATION
// ============================================================================

const REMINDER_TIMELINE_MS: Record<ReminderType, number> = {
  [ReminderType.HOURS_6]: 6 * 60 * 60 * 1000,    // 6 hours
  [ReminderType.HOURS_5]: 5 * 60 * 60 * 1000,    // 5 hours
  [ReminderType.HOURS_4]: 4 * 60 * 60 * 1000,    // 4 hours
  [ReminderType.HOURS_3]: 3 * 60 * 60 * 1000,    // 3 hours
  [ReminderType.HOURS_2]: 2 * 60 * 60 * 1000,    // 2 hours
  [ReminderType.HOURS_1]: 1 * 60 * 60 * 1000,    // 1 hour
  [ReminderType.MINUTES_30]: 30 * 60 * 1000,     // 30 minutes
  [ReminderType.MINUTES_15]: 15 * 60 * 1000,     // 15 minutes
  [ReminderType.NOW]: 0,                          // Now
};

// Reminders to send (6 hours before, then hourly)
const ACTIVE_REMINDERS: ReminderType[] = [
  ReminderType.HOURS_6,
  ReminderType.HOURS_5,
  ReminderType.HOURS_4,
  ReminderType.HOURS_3,
  ReminderType.HOURS_2,
  ReminderType.HOURS_1,
];

// ============================================================================
// REMINDER TEMPLATES
// ============================================================================

const REMINDER_TEMPLATES: Record<ReminderType, { title: string; getMessage: (booking: any) => string }> = {
  [ReminderType.HOURS_6]: {
    title: '📅 Booking Reminder - 6 Hours',
    getMessage: (b) => `Reminder: You have a booking in 6 hours!\n\n` +
      `📍 Customer: ${b.customerName}\n` +
      `💆 Service: ${b.serviceName}\n` +
      `⏰ Time: ${b.scheduledTime}\n` +
      `📍 Location: ${b.location}`,
  },
  [ReminderType.HOURS_5]: {
    title: '📅 Booking Reminder - 5 Hours',
    getMessage: (b) => `Reminder: Booking in 5 hours with ${b.customerName}.\n` +
      `Service: ${b.serviceName} at ${b.scheduledTime}`,
  },
  [ReminderType.HOURS_4]: {
    title: '📅 Booking Reminder - 4 Hours',
    getMessage: (b) => `Reminder: Booking in 4 hours with ${b.customerName}.\n` +
      `Service: ${b.serviceName} at ${b.scheduledTime}`,
  },
  [ReminderType.HOURS_3]: {
    title: '📅 Booking Reminder - 3 Hours',
    getMessage: (b) => `⏰ Booking in 3 hours!\n\n` +
      `Customer: ${b.customerName}\n` +
      `Service: ${b.serviceName}\n` +
      `Time: ${b.scheduledTime}`,
  },
  [ReminderType.HOURS_2]: {
    title: '📅 Booking Reminder - 2 Hours',
    getMessage: (b) => `⏰ Booking in 2 hours!\n\n` +
      `Customer: ${b.customerName}\n` +
      `Service: ${b.serviceName}\n` +
      `Time: ${b.scheduledTime}`,
  },
  [ReminderType.HOURS_1]: {
    title: '⚠️ Booking Soon - 1 Hour',
    getMessage: (b) => `🚨 Your booking starts in 1 HOUR!\n\n` +
      `👤 Customer: ${b.customerName}\n` +
      `📱 Phone: ${b.customerPhone}\n` +
      `💆 Service: ${b.serviceName}\n` +
      `⏰ Time: ${b.scheduledTime}\n` +
      `📍 Location: ${b.location}\n\n` +
      `Please ensure you're ready!`,
  },
  [ReminderType.MINUTES_30]: {
    title: '🚨 Booking in 30 Minutes',
    getMessage: (b) => `🚨 URGENT: Booking starts in 30 minutes!\n` +
      `Customer: ${b.customerName} - ${b.customerPhone}`,
  },
  [ReminderType.MINUTES_15]: {
    title: '🔴 Booking in 15 Minutes',
    getMessage: (b) => `🔴 STARTING SOON: Booking in 15 minutes!\n` +
      `Customer: ${b.customerName}`,
  },
  [ReminderType.NOW]: {
    title: '🎯 Booking Starting Now',
    getMessage: (b) => `🎯 Your booking is starting NOW!\n` +
      `Customer: ${b.customerName} - ${b.serviceName}`,
  },
};

// ============================================================================
// BOOKING CALENDAR SERVICE
// ============================================================================

class BookingCalendarService {
  private reminderTimers: Map<string, NodeJS.Timeout[]> = new Map();

  /**
   * Add booking to therapist calendar when CONFIRMED
   * This is called automatically when booking status changes to CONFIRMED
   */
  async addToCalendar(booking: any): Promise<CalendarEvent> {
    const now = new Date();
    const eventId = `CAL_${now.getTime()}_${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
    
    // Parse scheduled datetime
    const scheduledDateTime = booking.scheduledDateTime || 
      `${booking.scheduledDate}T${booking.scheduledTime}:00`;
    const startTime = new Date(scheduledDateTime);
    const endTime = new Date(startTime.getTime() + (booking.duration || 60) * 60 * 1000);

    const event: Omit<CalendarEvent, '$id'> = {
      eventId,
      bookingId: booking.bookingId || booking.$id,
      bookingDocId: booking.$id,
      
      therapistId: booking.therapistId || booking.providerId,
      therapistName: booking.therapistName || booking.providerName,
      
      customerId: booking.customerId || booking.userId,
      customerName: booking.customerName || booking.userName,
      customerPhone: booking.customerPhone || booking.userPhone || '',
      
      serviceType: booking.serviceType || 'Massage',
      serviceName: booking.serviceName || booking.service || `${booking.duration || 60} min massage`,
      duration: booking.duration || 60,
      
      scheduledDate: startTime.toISOString().split('T')[0],
      scheduledTime: startTime.toTimeString().substring(0, 5),
      scheduledDateTime: startTime.toISOString(),
      endDateTime: endTime.toISOString(),
      
      location: booking.location || booking.locationZone || 'Customer location',
      locationCoordinates: booking.locationCoordinates,
      
      eventStatus: 'SCHEDULED',
      remindersSent: [],
      
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };

    try {
      // Save to calendar_events collection (or use notifications)
      const result = await databases.createDocument(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.notifications || 'notifications',
        ID.unique(),
        {
          type: 'calendar_event',
          recipientId: event.therapistId,
          recipientType: 'therapist',
          title: `📅 New Booking: ${event.customerName}`,
          message: `Booking confirmed for ${event.scheduledDate} at ${event.scheduledTime}. ` +
                   `Service: ${event.serviceName} (${event.duration} min)`,
          bookingId: event.bookingId,
          eventId: event.eventId,
          scheduledDateTime: event.scheduledDateTime,
          urgent: false,
          read: false,
          createdAt: event.createdAt,
          // Store full event data
          eventData: JSON.stringify(event),
        }
      );

      console.log(`📅 [BookingCalendar] Added to calendar: ${eventId}`);
      console.log(`   Therapist: ${event.therapistName}`);
      console.log(`   Customer: ${event.customerName}`);
      console.log(`   DateTime: ${event.scheduledDateTime}`);

      // Schedule all reminders
      await this.scheduleReminders(event);

      return { ...event, $id: result.$id };
    } catch (error) {
      console.error('❌ [BookingCalendar] Failed to add to calendar:', error);
      throw error;
    }
  }

  /**
   * Schedule all reminders for a booking
   * - 6 hours before
   * - Every hour thereafter until booking time
   */
  async scheduleReminders(event: CalendarEvent): Promise<void> {
    const bookingTime = new Date(event.scheduledDateTime).getTime();
    const now = Date.now();
    const timers: NodeJS.Timeout[] = [];

    console.log(`📅 [BookingCalendar] Scheduling reminders for ${event.eventId}`);
    console.log(`   Booking time: ${new Date(bookingTime).toISOString()}`);

    for (const reminderType of ACTIVE_REMINDERS) {
      const reminderOffset = REMINDER_TIMELINE_MS[reminderType];
      const reminderTime = bookingTime - reminderOffset;
      const delay = reminderTime - now;

      // Only schedule if reminder time is in the future
      if (delay > 0) {
        const timer = setTimeout(async () => {
          await this.sendReminder(event, reminderType);
        }, delay);
        
        timers.push(timer);
        
        const hoursLabel = reminderOffset / (60 * 60 * 1000);
        console.log(`   ⏰ ${hoursLabel}h reminder scheduled in ${Math.round(delay / 60000)} minutes`);
      } else {
        console.log(`   ⏭️ Skipping ${reminderType} - time already passed`);
      }
    }

    // Store timers for cleanup
    this.reminderTimers.set(event.eventId, timers);
  }

  /**
   * Send a reminder notification
   * Delivers to both Chat window and Dashboard
   */
  async sendReminder(event: CalendarEvent, reminderType: ReminderType): Promise<void> {
    const template = REMINDER_TEMPLATES[reminderType];
    const reminderId = `REM_${Date.now()}_${reminderType}`;
    const now = new Date().toISOString();

    const bookingData = {
      customerName: event.customerName,
      customerPhone: event.customerPhone,
      serviceName: event.serviceName,
      scheduledTime: event.scheduledTime,
      location: event.location,
    };

    const message = template.getMessage(bookingData);

    console.log(`📬 [BookingCalendar] Sending ${reminderType} reminder for ${event.eventId}`);

    try {
      // 1. Send to Dashboard (notifications collection)
      await this.sendDashboardNotification(event, template.title, message, reminderType);

      // 2. Send to Chat window (chat_messages collection)
      await this.sendChatNotification(event, template.title, message, reminderType);

      console.log(`✅ [BookingCalendar] Reminder sent: ${reminderType}`);
      console.log(`   Dashboard: ✓`);
      console.log(`   Chat: ✓`);
    } catch (error) {
      console.error(`❌ [BookingCalendar] Failed to send reminder:`, error);
    }
  }

  /**
   * Send notification to Dashboard alerts
   */
  private async sendDashboardNotification(
    event: CalendarEvent,
    title: string,
    message: string,
    reminderType: ReminderType
  ): Promise<void> {
    try {
      // Notification for therapist
      await databases.createDocument(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.notifications || 'notifications',
        ID.unique(),
        {
          recipientId: event.therapistId,
          recipientType: 'therapist',
          type: 'booking_reminder',
          reminderType,
          title,
          message,
          bookingId: event.bookingId,
          eventId: event.eventId,
          urgent: reminderType === ReminderType.HOURS_1 || 
                  reminderType === ReminderType.MINUTES_30,
          read: false,
          createdAt: new Date().toISOString(),
        }
      );

      console.log(`   📊 Dashboard notification sent to therapist ${event.therapistId}`);
    } catch (error) {
      console.error('   ❌ Failed to send dashboard notification:', error);
    }
  }

  /**
   * Send notification to Chat window
   */
  private async sendChatNotification(
    event: CalendarEvent,
    title: string,
    message: string,
    reminderType: ReminderType
  ): Promise<void> {
    try {
      // Find the chat room for this booking
      let chatRoomId = await this.findChatRoomForBooking(event.bookingId, event.therapistId);
      
      if (!chatRoomId) {
        console.log(`   ⚠️ No chat room found for booking ${event.bookingId}`);
        return;
      }

      // Create chat message
      await databases.createDocument(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.chatMessages || 'chat_messages',
        ID.unique(),
        {
          roomId: chatRoomId,
          senderId: 'system',
          senderType: 'system',
          messageType: 'booking_reminder',
          reminderType,
          content: `${title}\n\n${message}`,
          timestamp: new Date().toISOString(),
          read: false,
          metadata: JSON.stringify({
            bookingId: event.bookingId,
            eventId: event.eventId,
            reminderType,
          }),
        }
      );

      console.log(`   💬 Chat notification sent to room ${chatRoomId}`);
    } catch (error) {
      console.error('   ❌ Failed to send chat notification:', error);
    }
  }

  /**
   * Find chat room for a booking
   */
  private async findChatRoomForBooking(bookingId: string, therapistId: string): Promise<string | null> {
    try {
      // Try to find by booking ID
      const result = await databases.listDocuments(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.chatRooms || 'chat_rooms',
        [
          Query.equal('bookingId', bookingId),
          Query.limit(1),
        ]
      );

      if (result.documents.length > 0) {
        return result.documents[0].$id;
      }

      // Try to find by therapist ID
      const therapistRooms = await databases.listDocuments(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.chatRooms || 'chat_rooms',
        [
          Query.equal('therapistId', therapistId),
          Query.orderDesc('$createdAt'),
          Query.limit(1),
        ]
      );

      if (therapistRooms.documents.length > 0) {
        return therapistRooms.documents[0].$id;
      }

      return null;
    } catch (error) {
      console.error('Error finding chat room:', error);
      return null;
    }
  }

  /**
   * Cancel all reminders for a booking (e.g., if booking is cancelled)
   */
  cancelReminders(eventId: string): void {
    const timers = this.reminderTimers.get(eventId);
    if (timers) {
      timers.forEach(timer => clearTimeout(timer));
      this.reminderTimers.delete(eventId);
      console.log(`🗑️ [BookingCalendar] Cancelled reminders for ${eventId}`);
    }
  }

  /**
   * Get upcoming bookings for a therapist
   */
  async getUpcomingBookings(therapistId: string): Promise<CalendarEvent[]> {
    try {
      const now = new Date().toISOString();
      
      const result = await databases.listDocuments(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.notifications || 'notifications',
        [
          Query.equal('recipientId', therapistId),
          Query.equal('type', 'calendar_event'),
          Query.orderAsc('scheduledDateTime'),
          Query.limit(50),
        ]
      );

      return result.documents.map((doc: any) => {
        try {
          return JSON.parse(doc.eventData);
        } catch {
          return doc;
        }
      });
    } catch (error) {
      console.error('Error fetching upcoming bookings:', error);
      return [];
    }
  }

  /**
   * Get today's bookings for a therapist
   */
  async getTodaysBookings(therapistId: string): Promise<CalendarEvent[]> {
    const today = new Date().toISOString().split('T')[0];
    const upcoming = await this.getUpcomingBookings(therapistId);
    
    return upcoming.filter(event => event.scheduledDate === today);
  }

  /**
   * Process all pending reminders (called on app initialization)
   */
  async processPendingReminders(): Promise<void> {
    try {
      console.log('📅 [BookingCalendar] Processing pending reminders...');
      
      const now = new Date();
      const sixHoursFromNow = new Date(now.getTime() + 6 * 60 * 60 * 1000);
      
      // Find all upcoming calendar events within the next 6 hours
      const result = await databases.listDocuments(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.notifications || 'notifications',
        [
          Query.equal('type', 'calendar_event'),
          Query.limit(100),
        ]
      );

      let scheduledCount = 0;
      
      for (const doc of result.documents) {
        try {
          const event = JSON.parse(doc.eventData) as CalendarEvent;
          const eventTime = new Date(event.scheduledDateTime).getTime();
          
          // Only process events that are in the future
          if (eventTime > now.getTime()) {
            await this.scheduleReminders(event);
            scheduledCount++;
          }
        } catch (e) {
          // Skip invalid events
        }
      }

      console.log(`✅ [BookingCalendar] Scheduled reminders for ${scheduledCount} upcoming bookings`);
    } catch (error) {
      console.error('❌ [BookingCalendar] Error processing pending reminders:', error);
    }
  }
}

// Export singleton instance
export const bookingCalendarService = new BookingCalendarService();
export default bookingCalendarService;
