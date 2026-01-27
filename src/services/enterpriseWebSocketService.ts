import { logger } from './enterpriseLogger';
/**
 * 🚀 ENTERPRISE WEBSOCKET SERVICE
 * 
 * Real-time booking updates with enterprise-grade reliability:
 * - Auto-reconnection with exponential backoff
 * - Message queuing during disconnection
 * - Heartbeat monitoring and health checks
 * - Multiple connection failover (WebSocket + SSE + Long Polling)
 * - Integration with booking flow service
 * - MP3 notification triggers
 * 
 * Usage:
 * - Therapist dashboard: Auto-update booking window when new bookings arrive
 * - Customer dashboard: Real-time booking status updates
 * - System-wide: Broadcast urgent notifications
 */

import React from 'react';
// Note: bookingSoundService removed - using browser Audio API instead
// import { enterpriseBookingFlowService } from './enterpriseBookingFlowService'; // Avoid circular imports

export interface WebSocketMessage {
  type: 'NEW_BOOKING' | 'BOOKING_UPDATE' | 'BOOKING_ACCEPTED' | 'BOOKING_CANCELLED' | 
        'THERAPIST_STATUS' | 'SCHEDULED_REMINDER' | 'SYSTEM_ALERT' | 'HEARTBEAT';
  payload: any;
  timestamp: number;
  messageId: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
}

export interface BookingUpdatePayload {
  bookingId: string;
  status: 'pending' | 'accepted' | 'cancelled' | 'completed';
  therapistId?: string;
  customerId?: string;
  estimatedArrival?: string;
  location?: {
    address: string;
    coordinates: { lat: number; lng: number };
  };
  services?: Array<{
    id: string;
    name: string;
    duration: number;
    price: number;
  }>;
  urgency?: 'normal' | 'urgent';
}

export interface ScheduledReminderPayload {
  bookingId: string;
  reminderType: 'therapist_5h' | 'therapist_4h' | 'therapist_3h' | 'therapist_2h' | 'therapist_1h' | 'customer_3h';
  scheduledTime: string;
  bookingDetails: {
    customerName: string;
    location: string;
    services: string[];
    totalPrice: number;
  };
  therapistId?: string;
  customerId?: string;
}

class EnterpriseWebSocketService {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10;
  private baseReconnectDelay = 1000; // 1 second
  private maxReconnectDelay = 30000; // 30 seconds
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private messageQueue: WebSocketMessage[] = [];
  private subscribers = new Map<string, Set<(message: WebSocketMessage) => void>>();
  private connectionState: 'disconnected' | 'connecting' | 'connected' | 'error' = 'disconnected';
  private lastHeartbeat = 0;
  private userId?: string;
  private userType?: 'therapist' | 'customer' | 'admin';

  // Fallback connection methods
  private eventSource: EventSource | null = null;
  private longPollingInterval: NodeJS.Timeout | null = null;

  /**
   * Initialize WebSocket connection for user
   */
  async initialize(userId: string, userType: 'therapist' | 'customer' | 'admin'): Promise<void> {
    logger.info(`🔌 [WEBSOCKET] Initializing connection for ${userType}: ${userId}`);
    
    this.userId = userId;
    this.userType = userType;
    
    // Start with WebSocket, fallback to SSE/Long polling if needed
    await this.connectWebSocket();
  }

  /**
   * Primary WebSocket connection
   */
  private async connectWebSocket(): Promise<void> {
    if (this.ws?.readyState === WebSocket.OPEN || this.ws?.readyState === WebSocket.CONNECTING) {
      logger.info('🔌 WebSocket already connected or connecting');
      return;
    }

    this.connectionState = 'connecting';
    
    try {
      // Use secure WebSocket in production
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/ws/bookings?userId=${this.userId}&userType=${this.userType}`;
      
      logger.info(`🔌 [WEBSOCKET] Connecting to: ${wsUrl}`);
      
      this.ws = new WebSocket(wsUrl);
      
      this.ws.onopen = () => {
        logger.info('✅ [WEBSOCKET] Connection established');
        this.connectionState = 'connected';
        this.reconnectAttempts = 0;
        this.startHeartbeat();
        this.processMessageQueue();
      };

      this.ws.onmessage = (event) => {
        this.handleMessage(JSON.parse(event.data));
      };

      this.ws.onclose = (event) => {
        logger.warn(`🔌 [WEBSOCKET] Connection closed: ${event.code} - ${event.reason}`);
        this.connectionState = 'disconnected';
        this.stopHeartbeat();
        this.scheduleReconnect();
      };

      this.ws.onerror = (error) => {
        logger.error('❌ [WEBSOCKET] Connection error:', error);
        this.connectionState = 'error';
        this.fallbackToSSE();
      };

    } catch (error) {
      logger.error('❌ [WEBSOCKET] Failed to create connection:', error);
      this.fallbackToSSE();
    }
  }

  /**
   * Fallback to Server-Sent Events
   */
  private fallbackToSSE(): void {
    if (this.eventSource) return;
    
    logger.info('🔄 [FALLBACK] Switching to Server-Sent Events');
    
    const sseUrl = `/api/sse/bookings?userId=${this.userId}&userType=${this.userType}`;
    
    this.eventSource = new EventSource(sseUrl);
    
    this.eventSource.onopen = () => {
      logger.info('✅ [SSE] Connection established');
      this.connectionState = 'connected';
      this.processMessageQueue();
    };
    
    this.eventSource.onmessage = (event) => {
      this.handleMessage(JSON.parse(event.data));
    };
    
    this.eventSource.onerror = () => {
      logger.warn('🔄 [SSE] Connection lost, falling back to long polling');
      this.eventSource?.close();
      this.eventSource = null;
      this.fallbackToLongPolling();
    };
  }

  /**
   * Final fallback to Long Polling
   */
  private fallbackToLongPolling(): void {
    if (this.longPollingInterval) return;
    
    logger.info('🔄 [FALLBACK] Using long polling');
    
    const poll = async () => {
      try {
        const response = await fetch(`/api/poll/bookings?userId=${this.userId}&userType=${this.userType}&lastMessage=${this.lastHeartbeat}`);
        
        if (response.ok) {
          const messages = await response.json();
          messages.forEach((message: WebSocketMessage) => this.handleMessage(message));
          this.connectionState = 'connected';
        }
      } catch (error) {
        logger.warn('⚠️ [LONG_POLL] Poll failed:', error);
        this.connectionState = 'error';
      }
    };
    
    // Poll every 5 seconds
    this.longPollingInterval = setInterval(poll, 5000);
    poll(); // Initial poll
  }

  /**
   * Handle incoming messages
   */
  private handleMessage(message: WebSocketMessage): void {
    logger.info(`📨 [WEBSOCKET] Message received:`, message);
    
    this.lastHeartbeat = Date.now();
    
    // Handle different message types
    switch (message.type) {
      case 'NEW_BOOKING':
        this.handleNewBooking(message.payload as BookingUpdatePayload);
        break;
        
      case 'BOOKING_UPDATE':
        this.handleBookingUpdate(message.payload as BookingUpdatePayload);
        break;
        
      case 'SCHEDULED_REMINDER':
        this.handleScheduledReminder(message.payload as ScheduledReminderPayload);
        break;
        
      case 'SYSTEM_ALERT':
        this.handleSystemAlert(message.payload);
        break;
        
      case 'HEARTBEAT':
        // Heartbeat received, connection is healthy
        break;
        
      default:
        logger.info(`📨 [WEBSOCKET] Unknown message type: ${message.type}`);
    }
    
    // Notify all subscribers
    const typeSubscribers = this.subscribers.get(message.type);
    const allSubscribers = this.subscribers.get('*');
    
    typeSubscribers?.forEach(callback => callback(message));
    allSubscribers?.forEach(callback => callback(message));
  }

  /**
   * Handle new booking notifications
   */
  private async handleNewBooking(payload: BookingUpdatePayload): Promise<void> {
    logger.info('🆕 [NEW_BOOKING] Processing new booking:', payload);
    
    if (this.userType === 'therapist') {
      // Play MP3 notification for therapist using browser Audio API
      try {
        const audio = new Audio(payload.urgency === 'urgent' ? '/sounds/urgent-booking.mp3' : '/sounds/new-booking.mp3');
        audio.volume = 0.8;
        audio.play().catch(err => logger.warn('Audio play failed:', err));
      } catch (err) {
        logger.warn('⚠️ [NEW_BOOKING] Audio notification failed:', err);
      }
      
      // Show system notification if permitted
      if (Notification.permission === 'granted') {
        new Notification('New Booking Request!', {
          body: `New ${payload.urgency === 'urgent' ? 'URGENT ' : ''}booking request received`,
          icon: '/icons/booking-notification.png',
          badge: '/icons/notification-badge.png',
          tag: `booking-${payload.bookingId}`,
          requireInteraction: true
        });
      }
      
      // Trigger booking window auto-update
      window.dispatchEvent(new CustomEvent('booking-window-update', {
        detail: { type: 'new_booking', payload }
      }));
    }
  }

  /**
   * Handle booking status updates
   */
  private async handleBookingUpdate(payload: BookingUpdatePayload): Promise<void> {
    logger.info('🔄 [BOOKING_UPDATE] Processing update:', payload);
    
    // Play appropriate sound based on update type
    try {
      if (payload.status === 'accepted') {
        const audio = new Audio('/sounds/booking-accepted.mp3');
        audio.volume = 0.7;
        audio.play().catch(err => logger.warn('Audio play failed:', err));
      } else if (payload.status === 'cancelled') {
        const audio = new Audio('/sounds/booking-cancelled.mp3');
        audio.volume = 0.7;
        audio.play().catch(err => logger.warn('Audio play failed:', err));
      }
    } catch (err) {
      logger.warn('⚠️ [BOOKING_UPDATE] Audio notification failed:', err);
    }
    
    // Update booking window
    window.dispatchEvent(new CustomEvent('booking-window-update', {
      detail: { type: 'booking_update', payload }
    }));
  }

  /**
   * Handle scheduled reminders (5,4,3,2,1 hours before)
   */
  private async handleScheduledReminder(payload: ScheduledReminderPayload): Promise<void> {
    logger.info('⏰ [REMINDER] Processing scheduled reminder:', payload);
    
    const reminderText = {
      'therapist_5h': '5 hours until your booking',
      'therapist_4h': '4 hours until your booking', 
      'therapist_3h': '3 hours until your booking',
      'therapist_2h': '2 hours until your booking - Please prepare!',
      'therapist_1h': '1 hour until your booking - Get ready!',
      'customer_3h': '3 hours until your massage appointment'
    };
    
    const isUrgent = ['therapist_2h', 'therapist_1h'].includes(payload.reminderType);
    
    // Play MP3 notification using browser Audio API
    try {
      const audio = new Audio(isUrgent ? '/sounds/urgent-reminder.mp3' : '/sounds/reminder.mp3');
      audio.volume = 0.7;
      audio.play().catch(err => logger.warn('Audio play failed:', err));
    } catch (err) {
      logger.warn('⚠️ [REMINDER] Audio notification failed:', err);
    }
    
    // Show system notification
    if (Notification.permission === 'granted') {
      new Notification('Booking Reminder', {
        body: `${reminderText[payload.reminderType]}\n${payload.bookingDetails.customerName} - ${payload.bookingDetails.location}`,
        icon: '/icons/reminder-notification.png',
        badge: '/icons/notification-badge.png',
        tag: `reminder-${payload.bookingId}-${payload.reminderType}`,
        requireInteraction: isUrgent
      });
    }
    
    // For customer reminders, prompt app download
    if (payload.reminderType === 'customer_3h') {
      window.dispatchEvent(new CustomEvent('show-app-download-prompt', {
        detail: { bookingId: payload.bookingId }
      }));
    }
  }

  /**
   * Handle system alerts
   */
  private async handleSystemAlert(payload: any): Promise<void> {
    logger.info('🚨 [SYSTEM_ALERT] Processing alert:', payload);
    
    // Play system alert sound using browser Audio API
    try {
      const audio = new Audio('/sounds/system-alert.mp3');
      audio.volume = 0.8;
      audio.play().catch(err => logger.warn('Audio play failed:', err));
    } catch (err) {
      logger.warn('⚠️ [SYSTEM_ALERT] Audio notification failed:', err);
    }
    
    if (Notification.permission === 'granted') {
      new Notification('System Alert', {
        body: payload.message,
        icon: '/icons/system-alert.png',
        badge: '/icons/notification-badge.png',
        tag: `system-${Date.now()}`,
        requireInteraction: true
      });
    }
  }

  /**
   * Subscribe to message types
   */
  subscribe(messageType: string, callback: (message: WebSocketMessage) => void): () => void {
    if (!this.subscribers.has(messageType)) {
      this.subscribers.set(messageType, new Set());
    }
    
    this.subscribers.get(messageType)!.add(callback);
    
    // Return unsubscribe function
    return () => {
      this.subscribers.get(messageType)?.delete(callback);
    };
  }

  /**
   * Send message via WebSocket
   */
  send(message: Omit<WebSocketMessage, 'timestamp' | 'messageId'>): void {
    const fullMessage: WebSocketMessage = {
      ...message,
      timestamp: Date.now(),
      messageId: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
    
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(fullMessage));
      logger.info('📤 [WEBSOCKET] Message sent:', fullMessage);
    } else {
      // Queue message for later delivery
      this.messageQueue.push(fullMessage);
      logger.info('📤 [WEBSOCKET] Message queued (connection not ready):', fullMessage);
    }
  }

  /**
   * Start heartbeat monitoring
   */
  private startHeartbeat(): void {
    this.stopHeartbeat();
    
    this.heartbeatInterval = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.send({
          type: 'HEARTBEAT',
          payload: { timestamp: Date.now() },
          priority: 'low'
        });
      }
    }, 30000); // Every 30 seconds
  }

  /**
   * Stop heartbeat monitoring
   */
  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  /**
   * Process queued messages
   */
  private processMessageQueue(): void {
    logger.info(`📤 [WEBSOCKET] Processing ${this.messageQueue.length} queued messages`);
    
    while (this.messageQueue.length > 0 && this.ws?.readyState === WebSocket.OPEN) {
      const message = this.messageQueue.shift()!;
      this.ws.send(JSON.stringify(message));
    }
  }

  /**
   * Schedule reconnection with exponential backoff
   */
  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      logger.error('❌ [WEBSOCKET] Max reconnection attempts reached');
      this.fallbackToSSE();
      return;
    }
    
    const delay = Math.min(
      this.baseReconnectDelay * Math.pow(2, this.reconnectAttempts),
      this.maxReconnectDelay
    );
    
    logger.info(`🔄 [WEBSOCKET] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts + 1}/${this.maxReconnectAttempts})`);
    
    setTimeout(() => {
      this.reconnectAttempts++;
      this.connectWebSocket();
    }, delay);
  }

  /**
   * Get connection status
   */
  getConnectionState(): string {
    return this.connectionState;
  }

  /**
   * Disconnect and cleanup
   */
  disconnect(): void {
    logger.info('🔌 [WEBSOCKET] Disconnecting...');
    
    this.connectionState = 'disconnected';
    this.stopHeartbeat();
    
    if (this.ws) {
      this.ws.close(1000, 'Client disconnect');
      this.ws = null;
    }
    
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
    
    if (this.longPollingInterval) {
      clearInterval(this.longPollingInterval);
      this.longPollingInterval = null;
    }
    
    this.subscribers.clear();
    this.messageQueue.length = 0;
  }
}

// Singleton instance
export const enterpriseWebSocketService = new EnterpriseWebSocketService();

// React hook for easy WebSocket integration
export const useWebSocketConnection = (userId: string, userType: 'therapist' | 'customer' | 'admin') => {
  const [connectionState, setConnectionState] = React.useState('disconnected');
  const [lastMessage, setLastMessage] = React.useState<WebSocketMessage | null>(null);
  
  React.useEffect(() => {
    enterpriseWebSocketService.initialize(userId, userType);
    
    // Subscribe to connection state changes
    const stateInterval = setInterval(() => {
      setConnectionState(enterpriseWebSocketService.getConnectionState());
    }, 1000);
    
    // Subscribe to all messages
    const unsubscribe = enterpriseWebSocketService.subscribe('*', (message) => {
      setLastMessage(message);
    });
    
    return () => {
      clearInterval(stateInterval);
      unsubscribe();
      enterpriseWebSocketService.disconnect();
    };
  }, [userId, userType]);
  
  return {
    connectionState,
    lastMessage,
    send: (message: Omit<WebSocketMessage, 'timestamp' | 'messageId'>) => 
      enterpriseWebSocketService.send(message),
    subscribe: (messageType: string, callback: (message: WebSocketMessage) => void) => 
      enterpriseWebSocketService.subscribe(messageType, callback)
  };
};

export default enterpriseWebSocketService;